-- Auth profiles and admin role helpers.
-- Run after the base catalog/orders setup.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'customer',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint profiles_role_check check (role in ('customer', 'admin'))
);

alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists role text default 'customer';
alter table public.profiles add column if not exists created_at timestamptz default timezone('utc', now());
alter table public.profiles add column if not exists updated_at timestamptz default timezone('utc', now());

update public.profiles
set role = 'customer'
where role is null or trim(role) = '';

update public.profiles
set created_at = timezone('utc', now())
where created_at is null;

update public.profiles
set updated_at = timezone('utc', now())
where updated_at is null;

alter table public.profiles
  alter column role set default 'customer',
  alter column role set not null,
  alter column created_at set default timezone('utc', now()),
  alter column created_at set not null,
  alter column updated_at set default timezone('utc', now()),
  alter column updated_at set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_role_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_role_check
      check (role in ('customer', 'admin'));
  end if;
end $$;

insert into public.profiles (id, email, full_name)
select
  user_row.id,
  user_row.email,
  coalesce(user_row.raw_user_meta_data ->> 'full_name', '')
from auth.users as user_row
where not exists (
  select 1
  from public.profiles as profile_row
  where profile_row.id = user_row.id
);

update public.profiles as profile_row
set
  email = user_row.email,
  full_name = case
    when coalesce(profile_row.full_name, '') = ''
      then coalesce(user_row.raw_user_meta_data ->> 'full_name', '')
    else profile_row.full_name
  end,
  updated_at = timezone('utc', now())
from auth.users as user_row
where user_row.id = profile_row.id
  and (
    profile_row.email is distinct from user_row.email
    or (
      coalesce(profile_row.full_name, '') = ''
      and coalesce(user_row.raw_user_meta_data ->> 'full_name', '') <> ''
    )
  );

create or replace function public.set_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.set_profiles_updated_at();

create or replace function public.handle_auth_user_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = case
      when coalesce(public.profiles.full_name, '') = ''
        then excluded.full_name
      else public.profiles.full_name
    end,
    updated_at = timezone('utc', now());

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_auth_user_created();

create or replace function public.is_admin(check_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = coalesce(check_user_id, auth.uid())
      and role = 'admin'
  );
$$;

grant execute on function public.is_admin(uuid) to anon, authenticated;

alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles"
  on public.profiles
  for select
  to authenticated
  using (public.is_admin());
