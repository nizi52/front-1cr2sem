import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api';
import './AuthPage.css';

export default function RegisterPage({ onGoLogin }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !firstName.trim() || !lastName.trim() || !password.trim()) {
      setError('Заполните все поля');
      return;
    }
    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }

    try {
      setLoading(true);
      await api.register(
        email.trim().toLowerCase(),
        firstName.trim(),
        lastName.trim(),
        password,
        role
      );

      // Автоматически входим после регистрации
      const loginResponse = await api.login(email.trim().toLowerCase(), password);
      const { accessToken, refreshToken } = loginResponse.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      const meResponse = await api.me();
      login(meResponse.data, accessToken, refreshToken);
    } catch (err) {
      const msg = err.response?.data?.error;
      if (msg === 'User with this email already exists') {
        setError('Пользователь с таким email уже существует');
      } else {
        setError('Ошибка регистрации. Попробуйте снова.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="authPage">
      <div className="authCard">
        <div className="authLogo">🛒</div>
        <h1 className="authTitle">Регистрация</h1>
        <p className="authSubtitle">Создайте аккаунт ElectroShop</p>

        <form className="authForm" onSubmit={handleSubmit}>
          <div className="authRow">
            <label className="authLabel">
              Имя
              <input className="authInput" type="text" value={firstName}
                onChange={e => setFirstName(e.target.value)} placeholder="Иван" autoFocus disabled={loading} />
            </label>
            <label className="authLabel">
              Фамилия
              <input className="authInput" type="text" value={lastName}
                onChange={e => setLastName(e.target.value)} placeholder="Иванов" disabled={loading} />
            </label>
          </div>

          <label className="authLabel">
            Email
            <input className="authInput" type="email" value={email}
              onChange={e => setEmail(e.target.value)} placeholder="ivan@example.com" disabled={loading} />
          </label>

          <label className="authLabel">
            Роль
            <select className="authInput" value={role} onChange={e => setRole(e.target.value)} disabled={loading}>
              <option value="user">👤 Пользователь</option>
              <option value="seller">🏪 Продавец</option>
              <option value="admin">👑 Администратор</option>
            </select>
          </label>

          <label className="authLabel">
            Пароль
            <input className="authInput" type="password" value={password}
              onChange={e => setPassword(e.target.value)} placeholder="Минимум 6 символов" disabled={loading} />
          </label>

          <label className="authLabel">
            Подтвердите пароль
            <input className="authInput" type="password" value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)} placeholder="Повторите пароль" disabled={loading} />
          </label>

          {error && <div className="authError">{error}</div>}

          <button className="authBtn" type="submit" disabled={loading}>
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>

        <div className="authSwitch">
          Уже есть аккаунт?{' '}
          <button className="authLink" onClick={onGoLogin}>Войти</button>
        </div>
      </div>
    </div>
  );
}