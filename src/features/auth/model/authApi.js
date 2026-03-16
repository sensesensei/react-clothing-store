import { supabase } from '../../../services/supabase/client';

export const ADMIN_ROLE = 'admin';
const DEFAULT_ROLE = 'customer';

export function mapAuthErrorMessage(error, action = 'load') {
  const message = String(error?.message || '').trim();
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes('invalid login credentials')) {
    return 'Неверный email или пароль.';
  }

  if (normalizedMessage.includes('email not confirmed')) {
    return 'Подтверди email в письме от Supabase, если подтверждение включено.';
  }

  if (normalizedMessage.includes('signup is disabled')) {
    return 'Самостоятельная регистрация отключена. Доступ выдает администратор.';
  }

  if (normalizedMessage.includes('session')) {
    return 'Не удалось восстановить текущую сессию.';
  }

  if (message) {
    return message;
  }

  switch (action) {
    case 'sign-in':
      return 'Не удалось выполнить вход.';
    case 'sign-out':
      return 'Не удалось выйти из аккаунта.';
    default:
      return 'Не удалось проверить авторизацию.';
  }
}

export function mapProfileErrorMessage(error) {
  const message = String(error?.message || '').trim();
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes('relation "public.profiles" does not exist')) {
    return 'В Supabase не создана таблица profiles. Выполни SQL из файла supabase/setup/05_auth_roles.sql.';
  }

  if (
    normalizedMessage.includes('row-level security')
    || normalizedMessage.includes('permission denied')
  ) {
    return 'Нет доступа к таблице profiles. Проверь SQL из файла supabase/setup/05_auth_roles.sql.';
  }

  if (message) {
    return message;
  }

  return 'Не удалось загрузить профиль доступа.';
}

function normalizeProfile(profile, user) {
  return {
    id: profile?.id || user?.id || '',
    email: String(profile?.email || user?.email || '').trim(),
    fullName: String(
      profile?.full_name || user?.user_metadata?.full_name || '',
    ).trim(),
    role: String(profile?.role || DEFAULT_ROLE).trim().toLowerCase() || DEFAULT_ROLE,
  };
}

export async function getAuthProfile(user) {
  if (!user?.id) {
    return null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    throw new Error(mapProfileErrorMessage(error));
  }

  return normalizeProfile(data, user);
}
