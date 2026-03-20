import React, { useEffect, useState } from 'react';
import { api } from '../../api';
import './UsersPage.css';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null); // { id, first_name, last_name, role }
  const [editForm, setEditForm] = useState({ first_name: '', last_name: '', role: 'user' });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await api.getUsers();
      setUsers(response.data);
    } catch (err) {
      console.error(err);
      alert('Ошибка загрузки пользователей');
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setEditForm({ first_name: user.first_name, last_name: user.last_name, role: user.role });
  };

  const closeEdit = () => {
    setEditingUser(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.updateUser(editingUser.id, editForm);
      setUsers(prev => prev.map(u => u.id === editingUser.id ? response.data : u));
      closeEdit();
    } catch (err) {
      console.error(err);
      alert('Ошибка обновления пользователя');
    }
  };

  const handleBlock = async (user) => {
    if (!window.confirm(`Заблокировать пользователя ${user.first_name} ${user.last_name}?`)) return;
    try {
      await api.blockUser(user.id);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isBlocked: true } : u));
    } catch (err) {
      console.error(err);
      alert('Ошибка блокировки пользователя');
    }
  };

  const roleLabel = { admin: '👑 Администратор', seller: '🏪 Продавец', user: '👤 Пользователь' };
  const roleBadgeClass = { admin: 'badge--admin', seller: 'badge--seller', user: 'badge--user' };

  return (
    <main className="main">
      <div className="container">
        <div className="toolbar">
          <h1 className="title">Управление пользователями</h1>
          <span className="productsCount">{users.length} пользователей</span>
        </div>

        {loading ? (
          <div className="empty">⏳ Загрузка пользователей...</div>
        ) : (
          <div className="usersTable">
            <div className="usersTable__head">
              <div>Имя</div>
              <div>Email</div>
              <div>Роль</div>
              <div>Статус</div>
              <div>Действия</div>
            </div>
            {users.map(user => (
              <div key={user.id} className={`usersTable__row ${user.isBlocked ? 'usersTable__row--blocked' : ''}`}>
                <div className="userCell userCell--name">
                  <span>{user.first_name} {user.last_name}</span>
                  <span className="userEmail--mobile">{user.email}</span>
                </div>
                <div className="userCell">{user.email}</div>
                <div className="userCell">
                  <span className={`badge ${roleBadgeClass[user.role] || ''}`}>
                    {roleLabel[user.role] || user.role}
                  </span>
                </div>
                <div className="userCell">
                  {user.isBlocked
                    ? <span className="statusBadge statusBadge--blocked">Заблокирован</span>
                    : <span className="statusBadge statusBadge--active">Активен</span>
                  }
                </div>
                <div className="userCell userCell--actions">
                  <button
                    className="btn btn--edit"
                    onClick={() => openEdit(user)}
                    disabled={user.isBlocked}
                  >
                    Изменить
                  </button>
                  {!user.isBlocked && (
                    <button
                      className="btn btn--danger"
                      onClick={() => handleBlock(user)}
                    >
                      Блок
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Модальное окно редактирования пользователя */}
      {editingUser && (
        <div className="backdrop" onMouseDown={closeEdit}>
          <div className="modal" onMouseDown={e => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="modal__header">
              <div className="modal__title">Редактировать пользователя</div>
              <button className="iconBtn" onClick={closeEdit}>✕</button>
            </div>

            <form className="form" onSubmit={handleEditSubmit}>
              <label className="label">
                Имя
                <input
                  className="input"
                  value={editForm.first_name}
                  onChange={e => setEditForm(f => ({ ...f, first_name: e.target.value }))}
                  autoFocus
                />
              </label>
              <label className="label">
                Фамилия
                <input
                  className="input"
                  value={editForm.last_name}
                  onChange={e => setEditForm(f => ({ ...f, last_name: e.target.value }))}
                />
              </label>
              <label className="label">
                Роль
                <select
                  className="input"
                  value={editForm.role}
                  onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))}
                >
                  <option value="user">👤 Пользователь</option>
                  <option value="seller">🏪 Продавец</option>
                  <option value="admin">👑 Администратор</option>
                </select>
              </label>

              <div className="modal__footer">
                <button type="button" className="btn" onClick={closeEdit}>Отмена</button>
                <button type="submit" className="btn btn--primary">Сохранить</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}