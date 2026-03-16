import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { supabase } from '../../../services/supabase/client';
import { ADMIN_ROLE, getAuthProfile, mapAuthErrorMessage } from './authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const requestIdRef = useRef(0);

  useEffect(() => {
    let isMounted = true;

    async function resolveSession(nextSession) {
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;

      setIsLoading(true);
      setSession(nextSession);
      setAuthError('');

      if (!nextSession?.user) {
        if (!isMounted || requestIdRef.current !== requestId) {
          return;
        }

        setProfile(null);
        setIsLoading(false);
        return;
      }

      try {
        const nextProfile = await getAuthProfile(nextSession.user);

        if (!isMounted || requestIdRef.current !== requestId) {
          return;
        }

        setProfile(nextProfile);
      } catch (error) {
        if (!isMounted || requestIdRef.current !== requestId) {
          return;
        }

        setProfile(null);
        setAuthError(error.message || mapAuthErrorMessage(error));
      } finally {
        if (isMounted && requestIdRef.current === requestId) {
          setIsLoading(false);
        }
      }
    }

    async function bootstrap() {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (!isMounted) {
          return;
        }

        if (error) {
          setSession(null);
          setProfile(null);
          setAuthError(mapAuthErrorMessage(error));
          setIsLoading(false);
          return;
        }

        await resolveSession(data.session ?? null);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setSession(null);
        setProfile(null);
        setAuthError(mapAuthErrorMessage(error));
        setIsLoading(false);
      }
    }

    bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) {
        return;
      }

      void resolveSession(nextSession ?? null);
    });

    return () => {
      isMounted = false;
      requestIdRef.current += 1;
      subscription.unsubscribe();
    };
  }, []);

  async function signIn(credentials) {
    const { error } = await supabase.auth.signInWithPassword(credentials);

    if (error) {
      throw new Error(mapAuthErrorMessage(error, 'sign-in'));
    }
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(mapAuthErrorMessage(error, 'sign-out'));
    }
  }

  const user = session?.user ?? null;
  const role = profile?.role || null;

  const value = {
    session,
    user,
    profile,
    role,
    authError,
    isLoading,
    isAuthenticated: Boolean(user),
    isAdmin: role === ADMIN_ROLE,
    displayName: profile?.fullName || profile?.email || user?.email || '',
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
