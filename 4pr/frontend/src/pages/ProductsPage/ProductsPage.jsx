import React, { useEffect, useState } from 'react';
import './ProductsPage.css';
import ProductsList from '../../components/ProductsList';
import ProductModal from '../../components/ProductModal';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function ProductsPage() {
  const { user, logout } = useAuth();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

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
      const data = await api.getProducts();
      setProducts(data);
      setFilteredProducts(data);
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
    const ok = window.confirm('Удалить товар из магазина?');
    if (!ok) return;

    try {
      await api.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
      alert('Ошибка удаления товара');
    }
  };

  const handleSubmitModal = async (payload) => {
    try {
      if (modalMode === 'create') {
        const newProduct = await api.createProduct(payload);
        setProducts((prev) => [...prev, newProduct]);
      } else {
        const updatedProduct = await api.updateProduct(payload.id, payload);
        setProducts((prev) =>
          prev.map((p) => (p.id === payload.id ? updatedProduct : p))
        );
      }
      closeModal();
    } catch (err) {
      console.error(err);
      alert('Ошибка сохранения товара');
    }
  };

  const categories = ['all', ...new Set(products.map(p => p.category))];

  return (
    <div className="page">
      <header className="header">
        <div className="header__inner">
          <div className="brand">🛒 ElectroShop</div>
          <div className="header__right">
            {user && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span>{user.first_name} {user.last_name}</span>
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
      </header>

      <main className="main">
        <div className="container">
          <div className="toolbar">
            <h1 className="title">Каталог товаров</h1>
            <button className="btn btn--primary" onClick={openCreate}>
              + Добавить товар
            </button>
          </div>

          <div className="filters">
            <label className="filterLabel">Категория:</label>
            <select
              className="filterSelect"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">Все категории</option>
              {categories.filter(c => c !== 'all').map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <span className="productsCount">
              Найдено: {filteredProducts.length} товар(ов)
            </span>
          </div>

          {loading ? (
            <div className="empty">⏳ Загрузка товаров...</div>
          ) : (
            <ProductsList
              products={filteredProducts}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          )}
        </div>
      </main>

      <footer className="footer">
        <div className="footer__inner">
          © {new Date().getFullYear()} Все права защищены.
        </div>
      </footer>

      <ProductModal
        open={modalOpen}
        mode={modalMode}
        initialProduct={editingProduct}
        onClose={closeModal}
        onSubmit={handleSubmitModal}
      />
    </div>
  );
}