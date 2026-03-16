import { useState } from 'react';
import { Link } from 'react-router-dom';
import './LoginPage.css';

const INITIAL_FORM_STATE = Object.freeze({
  email: '',
  password: '',
});

function LoginPage() {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [submitMessage, setSubmitMessage] = useState('');

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitMessage(
      'Авторизация будет подключена после следующего этапа с ролями и защитой admin-раздела.',
    );
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Вход</h1>
        <p className="auth-lead">
          UI для входа уже подготовлен. Подключение к Supabase Auth будет следующим этапом.
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

          {submitMessage ? (
            <p className="form-message is-info">{submitMessage}</p>
          ) : null}

          <button type="submit" className="submit-btn">
            Продолжить
          </button>
        </form>

        <p className="register-link">
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
