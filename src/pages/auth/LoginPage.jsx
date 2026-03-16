import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth';
import './LoginPage.css';

const INITIAL_FORM_STATE = Object.freeze({
  email: '',
  password: '',
});

function LoginPage() {
  const { authError, isAdmin, isAuthenticated, isLoading, signIn } = useAuth();
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [submitError, setSubmitError] = useState('');
  const [submitMessage, setSubmitMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const redirectPath = useMemo(() => {
    const from = location.state?.from;

    if (!from?.pathname) {
      return '/admin';
    }

    return `${from.pathname}${from.search || ''}${from.hash || ''}`;
  }, [location.state]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (isAuthenticated && isAdmin) {
      navigate(redirectPath, { replace: true });
      return;
    }

    if (isAuthenticated && !isAdmin) {
      setSubmitError('Этот аккаунт вошел в систему, но роль администратора ему не назначена.');
      setSubmitMessage(
        'Если доступ должен быть открыт, укажи для пользователя role = admin в таблице profiles.',
      );
    }
  }, [isAdmin, isAuthenticated, isLoading, navigate, redirectPath]);

  useEffect(() => {
    if (!authError) {
      return;
    }

    setSubmitError(authError);
    setSubmitMessage('');
  }, [authError]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    if (submitError) {
      setSubmitError('');
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!formData.email.trim() || !formData.password) {
      setSubmitError('Заполни email и пароль администратора.');
      setSubmitMessage('');
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError('');
      setSubmitMessage('Проверяем данные и доступ к admin-разделу...');

      await signIn({
        email: formData.email.trim(),
        password: formData.password,
      });

      setSubmitMessage('Вход выполнен. Проверяем роль администратора...');
    } catch (error) {
      setSubmitError(error.message || 'Не удалось выполнить вход.');
      setSubmitMessage('');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Вход администратора</h1>
        <p className="auth-lead">
          Админка открывается только для аккаунтов с ролью <code>admin</code> в Supabase.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@example.com"
              autoComplete="email"
              disabled={isSubmitting || isLoading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Введите пароль"
              autoComplete="current-password"
              disabled={isSubmitting || isLoading}
              required
            />
          </div>

          {submitError ? (
            <p className="form-message is-error" role="alert">
              {submitError}
            </p>
          ) : null}

          {submitMessage ? (
            <p className="form-message is-info">{submitMessage}</p>
          ) : null}

          <button
            type="submit"
            className="submit-btn"
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting ? 'Входим...' : 'Войти'}
          </button>
        </form>

        <p className="register-link">
          Нет доступа? <Link to="/register">Как получить доступ</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
