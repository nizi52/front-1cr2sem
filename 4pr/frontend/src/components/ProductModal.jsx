import React, { useEffect, useState } from 'react';

export default function ProductModal({ open, mode, initialProduct, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [rating, setRating] = useState('');
  const [image, setImage] = useState('');

  const categories = [
    'Смартфоны',
    'Ноутбуки',
    'Планшеты',
    'Наушники',
    'Умные часы',
    'Фотокамеры',
    'Игровые консоли',
    'Телевизоры',
    'Другое'
  ];

  useEffect(() => {
    if (!open) return;
    
    setName(initialProduct?.name ?? '');
    setCategory(initialProduct?.category ?? '');
    setDescription(initialProduct?.description ?? '');
    setPrice(initialProduct?.price != null ? String(initialProduct.price) : '');
    setStock(initialProduct?.stock != null ? String(initialProduct.stock) : '');
    setRating(initialProduct?.rating != null ? String(initialProduct.rating) : '');
    setImage(initialProduct?.image ?? '');
  }, [open, initialProduct]);

  if (!open) return null;

  const title = mode === 'edit' ? 'Редактирование товара' : 'Создание товара';

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedCategory = category.trim();
    const trimmedDescription = description.trim();
    const parsedPrice = Number(price);
    const parsedStock = Number(stock);
    const parsedRating = rating ? Number(rating) : 0;

    if (!trimmedName) {
      alert('Введите название товара');
      return;
    }
    if (!trimmedCategory) {
      alert('Выберите категорию');
      return;
    }
    if (!trimmedDescription) {
      alert('Введите описание товара');
      return;
    }
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      alert('Введите корректную цену');
      return;
    }
    if (!Number.isInteger(parsedStock) || parsedStock < 0) {
      alert('Введите корректное количество на складе');
      return;
    }
    if (rating && (!Number.isFinite(parsedRating) || parsedRating < 0 || parsedRating > 5)) {
      alert('Рейтинг должен быть от 0 до 5');
      return;
    }

    onSubmit({
      id: initialProduct?.id,
      name: trimmedName,
      category: trimmedCategory,
      description: trimmedDescription,
      price: parsedPrice,
      stock: parsedStock,
      rating: parsedRating,
      image: image.trim() || '/4pr/image/add.png'
    });
  };

  return (
    <div className="backdrop" onMouseDown={onClose}>
      <div 
        className="modal" 
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal__header">
          <div className="modal__title">{title}</div>
          <button className="iconBtn" onClick={onClose} aria-label="Закрыть">
            ✕
          </button>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <label className="label">
            Название товара
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например, iPhone 15 Pro"
              autoFocus
            />
          </label>

          <label className="label">
            Категория
            <select
              className="input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Выберите категорию</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </label>

          <label className="label">
            Описание
            <textarea
              className="input textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Краткое описание товара"
              rows="3"
            />
          </label>

          <div className="formRow">
            <label className="label">
              Цена (₽)
              <input
                className="input"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                min="0"
              />
            </label>

            <label className="label">
              Количество на складе
              <input
                className="input"
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="0"
                min="0"
              />
            </label>
          </div>

          <label className="label">
            Рейтинг (опционально, 0-5)
            <input
              className="input"
              type="number"
              step="0.1"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              placeholder="4.5"
              min="0"
              max="5"
            />
          </label>

          <label className="label">
            URL изображения (опционально)
            <input
              className="input"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </label>

          <div className="modal__footer">
            <button type="button" className="btn" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className="btn btn--primary">
              {mode === 'edit' ? 'Сохранить' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
