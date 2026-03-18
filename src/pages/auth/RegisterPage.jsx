import { Link } from 'react-router-dom';
import { useAuth } from '../../features/auth';
import './RegisterPage.css';

function RegisterPage() {
  const { isAdmin } = useAuth();

  return (
    <div className="register-container">
      <div className="register-box">
        <h1>Доступ к админке</h1>
        <p className="auth-lead">
          Самостоятельная регистрация в проекте закрыта. Аккаунты создаются
          вручную, а доступ в <code>/admin</code> открывается только после
          назначения роли.
        </p>

        {/* <p className="form-message is-info">
          Сначала создай пользователя в Supabase Auth, затем укажи ему
          <code> role = admin </code>
          в таблице <code>profiles</code>. После этого можно входить через обычную
          страницу логина.
        </p> */}

        <div className="register-actions">
          <Link to={isAdmin ? '/admin' : '/login'} className="submit-btn">
            {isAdmin ? 'Перейти в админку' : 'Ко входу'}
          </Link>
          <Link to="/" className="auth-secondary-link">
            На витрину
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
