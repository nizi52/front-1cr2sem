import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api';
import './AuthPage.css';

export default function LoginPage({ onGoRegister }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Заполните все поля');
      return;
    }

    try {
      setLoading(true);
      const response = await api.login(email.trim().toLowerCase(), password);
      const { accessToken, refreshToken } = response.data;

      // Получаем данные пользователя
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      const meResponse = await api.me();
      login(meResponse.data, accessToken, refreshToken);
    } catch (err) {
      const msg = err.response?.data?.error;
      if (msg === 'User not found') setError('Пользователь не найден');
      else if (msg === 'Invalid password') setError('Неверный пароль');
      else setError('Ошибка входа. Попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="authPage">
      <div className="authCard">
        <div className="authLogo">🛒</div>
        <h1 className="authTitle">Вход в систему</h1>
        <p className="authSubtitle">ElectroShop — управление товарами</p>

        <form className="authForm" onSubmit={handleSubmit}>
          <label className="authLabel">
            Email
            <input
              className="authInput"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ivan@example.com"
              autoFocus
              disabled={loading}
            />
          </label>

          <label className="authLabel">
            Пароль
            <input
              className="authInput"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
            />
          </label>

          {error && <div className="authError">{error}</div>}

          <button className="authBtn" type="submit" disabled={loading}>
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <div className="authSwitch">
          Нет аккаунта?{' '}
          <button className="authLink" onClick={onGoRegister}>
            Зарегистрироваться
          </button>
        </div>
      </div>
    </div>
  );
}