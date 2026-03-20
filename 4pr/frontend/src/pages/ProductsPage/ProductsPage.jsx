import React, { useEffect, useState } from 'react';
import './ProductsPage.css';
import ProductsList from '../../components/ProductsList';
import ProductModal from '../../components/ProductModal';
import UsersPage from '../UsersPage/UsersPage';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function ProductsPage() {
  const { user, logout, isAdmin, isSeller } = useAuth();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'users'

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(p => p.category === selectedCategory));
    }
  }, [selectedCategory, products]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await api.getProducts();
      setProducts(response.data);
      setFilteredProducts(response.data);
    } catch (err) {
      console.error(err);
      alert('Ошибка загрузки товаров');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setModalMode('create');
    setEditingProduct(null);
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setModalMode('edit');
    setEditingProduct(product);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить товар из магазина?')) return;
    try {
      await api.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
      alert('Ошибка удаления товара');
    }
  };

  const handleSubmitModal = async (payload) => {
    try {
      if (modalMode === 'create') {
        const response = await api.createProduct(payload);
        setProducts(prev => [...prev, response.data]);
      } else {
        const response = await api.updateProduct(payload.id, payload);
        setProducts(prev => prev.map(p => p.id === payload.id ? response.data : p));
      }
      closeModal();
    } catch (err) {
      console.error(err);
      alert('Ошибка сохранения товара');
    }
  };

  const categories = ['all', ...new Set(products.map(p => p.category))];

  const roleLabel = { admin: '👑 Администратор', seller: '🏪 Продавец', user: '👤 Пользователь' };

  return (
    <div className="page">
      <header className="header">
        <div className="header__inner">
          <div className="brand">🛒 ElectroShop</div>
          <div className="header__right">
            {user && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                  <span>{user.first_name} {user.last_name}</span>
                  <span style={{ fontSize: 11, opacity: 0.6 }}>{roleLabel[user.role] || user.role}</span>
                </span>
                <button
                  className="btn btn--danger"
                  style={{ padding: '6px 14px', fontSize: 13 }}
                  onClick={logout}
                >
                  Выйти
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Табы навигации — только для администратора */}
        {isAdmin && (
          <div className="header__tabs">
            <button
              className={`tab ${activeTab === 'products' ? 'tab--active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              📦 Товары
            </button>
            <button
              className={`tab ${activeTab === 'users' ? 'tab--active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              👥 Пользователи
            </button>
          </div>
        )}
      </header>

      {/* Страница пользователей (только admin) */}
      {isAdmin && activeTab === 'users' ? (
        <UsersPage />
      ) : (
        <main className="main">
          <div className="container">
            <div className="toolbar">
              <h1 className="title">Каталог товаров</h1>
              {/* Кнопка создания — только seller и admin */}
              {isSeller && (
                <button className="btn btn--primary" onClick={openCreate}>
                  + Добавить товар
                </button>
              )}
            </div>

            <div className="filters">
              <label className="filterLabel">Категория:</label>
              <select
                className="filterSelect"
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
              >
                <option value="all">Все категории</option>
                {categories.filter(c => c !== 'all').map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <span className="productsCount">Найдено: {filteredProducts.length} товар(ов)</span>
            </div>

            {loading ? (
              <div className="empty">⏳ Загрузка товаров...</div>
            ) : (
              <ProductsList
                products={filteredProducts}
                onEdit={openEdit}
                onDelete={handleDelete}
                canEdit={isSeller}
                canDelete={isAdmin}
              />
            )}
          </div>
        </main>
      )}

      <footer className="footer">
        <div className="footer__inner">
          © {new Date().getFullYear()} Все права защищены.
        </div>
      </footer>

      {isSeller && (
        <ProductModal
          open={modalOpen}
          mode={modalMode}
          initialProduct={editingProduct}
          onClose={closeModal}
          onSubmit={handleSubmitModal}
        />
      )}
    </div>
  );
}