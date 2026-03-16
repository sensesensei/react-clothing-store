import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Button, ErrorState, Loader } from '../../../shared/ui';
import { useAuth } from '../model';
import './ProtectedAdminRoute.css';

function ProtectedAdminRoute({ children }) {
  const location = useLocation();
  const { authError, displayName, isAdmin, isAuthenticated, isLoading, signOut } = useAuth();
  const [signOutError, setSignOutError] = useState('');
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    try {
      setIsSigningOut(true);
      setSignOutError('');
      await signOut();
    } catch (error) {
      setSignOutError(error.message || 'Не удалось выйти из аккаунта.');
    } finally {
      setIsSigningOut(false);
    }
  }

  if (isLoading) {
    return <Loader label="Проверяем доступ к admin-разделу..." />;
  }

  if (authError) {
    return (
      <section className="auth-access-state">
        <ErrorState
          title="Не удалось проверить права доступа"
          message={authError}
        />
        <div className="auth-access-state__actions">
          <Button to="/login" variant="primary" size="md">
            Ко входу
          </Button>
        </div>
      </section>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!isAdmin) {
    const message = displayName
      ? `Аккаунт ${displayName} авторизован, но не имеет роли администратора.`
      : 'Текущий аккаунт авторизован, но не имеет роли администратора.';

    return (
      <section className="auth-access-state">
        <ErrorState
          title="Доступ к админке закрыт"
          message={message}
        />

        {signOutError ? (
          <p className="auth-access-state__error" role="alert">
            {signOutError}
          </p>
        ) : null}

        <div className="auth-access-state__actions">
          <Button to="/" variant="primary" size="md">
            На витрину
          </Button>
          <button
            type="button"
            className="auth-access-state__button"
            onClick={handleSignOut}
            disabled={isSigningOut}
          >
            {isSigningOut ? 'Выходим...' : 'Сменить аккаунт'}
          </button>
        </div>
      </section>
    );
  }

  return children;
}

export default ProtectedAdminRoute;
