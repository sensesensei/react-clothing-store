import { useState } from 'react';
import { Link } from 'react-router-dom';
import './RegisterPage.css';

const INITIAL_FORM_STATE = Object.freeze({
  email: '',
  password: '',
  confirmPassword: '',
  name: '',
});

function RegisterPage() {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [submitError, setSubmitError] = useState('');
  const [submitMessage, setSubmitMessage] = useState('');

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

  function handleSubmit(event) {
    event.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setSubmitError('Пароли не совпадают.');
      setSubmitMessage('');
      return;
    }

    setSubmitError('');
    setSubmitMessage(
      'Регистрация будет подключена после настройки авторизации и ролей в Supabase.',
    );
  }

  return (
    <div className="register-container">
      <div className="register-box">
        <h1>Регистрация</h1>
        <p className="auth-lead">
          Экран уже готов по UI. Серверная регистрация появится после следующего этапа с auth.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="name">Имя</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Введите ваше имя"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Введите ваш email"
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
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Подтвердите пароль</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Подтвердите пароль"
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

          <button type="submit" className="submit-btn">
            Продолжить
          </button>
        </form>

        <p className="login-link">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
