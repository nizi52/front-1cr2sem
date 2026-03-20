import React, { useEffect, useState } from 'react';
import { api } from '../../api';

const styles = `
.usersTable { border-radius: 12px; border: 1px solid rgba(255,255,255,0.10); overflow: hidden; }
.usersTable__head { display: grid; grid-template-columns: 2fr 2.5fr 1.5fr 1.2fr 1.8fr; padding: 12px 16px; background: rgba(255,255,255,0.05); font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; opacity: 0.7; border-bottom: 1px solid rgba(255,255,255,0.08); }
.usersTable__row { display: grid; grid-template-columns: 2fr 2.5fr 1.5fr 1.2fr 1.8fr; padding: 14px 16px; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.06); transition: background 0.15s; }
.usersTable__row:last-child { border-bottom: none; }
.usersTable__row:hover { background: rgba(255,255,255,0.03); }
.usersTable__row--blocked { opacity: 0.5; }
.userCell { font-size: 14px; }
.userCell--name { display: flex; flex-direction: column; gap: 2px; font-weight: 600; }
.userCell--actions { display: flex; gap: 6px; }
.userCell--actions .btn { padding: 6px 12px; font-size: 12px; }
.badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; }
.badge--admin { background: rgba(251,191,36,0.15); color: #fbbf24; border: 1px solid rgba(251,191,36,0.3); }
.badge--seller { background: rgba(99,102,241,0.15); color: #a7a9ff; border: 1px solid rgba(99,102,241,0.3); }
.badge--user { background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.7); border: 1px solid rgba(255,255,255,0.12); }
.statusBadge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; }
.statusBadge--active { background: rgba(34,197,94,0.12); color: #86efac; border: 1px solid rgba(34,197,94,0.3); }
.statusBadge--blocked { background: rgba(239,68,68,0.12); color: #fca5a5; border: 1px solid rgba(239,68,68,0.3); }
@media (max-width: 768px) {
  .usersTable__head { display: none; }
  .usersTable__row { grid-template-columns: 1fr 1fr; gap: 8px; padding: 12px; }
  .usersTable__row > :nth-child(2) { display: none; }
}
`;

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ first_name: '', last_name: '', role: 'user' });

  useEffect(() => {
    // Вставляем стили один раз
    if (!document.getElementById('users-page-styles')) {
      const tag = document.createElement('style');
      tag.id = 'users-page-styles';
      tag.textContent = styles;
      document.head.appendChild(tag);
    }
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

  const closeEdit = () => setEditingUser(null);

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
    if (!window.confirm(`Заблокировать ${user.first_name} ${user.last_name}?`)) return;
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
              <div
                key={user.id}
                className={`usersTable__row ${user.isBlocked ? 'usersTable__row--blocked' : ''}`}
              >
                <div className="userCell userCell--name">
                  <span>{user.first_name} {user.last_name}</span>
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
                    <button className="btn btn--danger" onClick={() => handleBlock(user)}>
                      Блок
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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