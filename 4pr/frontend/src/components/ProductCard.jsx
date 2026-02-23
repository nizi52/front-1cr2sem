import React from 'react';

export default function ProductCard({ product, onEdit, onDelete }) {
  return (
    <div className="productCard">
      <div className="productImage">
        <img src={product.img} alt={product.name} />
      </div>
      
      <div className="productContent">
        <div className="productCategory">{product.category}</div>
        <h3 className="productName">{product.name}</h3>
        <p className="productDescription">{product.description}</p>
        
        <div className="productInfo">
          <div className="productPrice">{product.price.toLocaleString('ru-RU')} ₽</div>
          <div className="productStock">
            {product.stock > 0 ? (
              <span className="inStock">В наличии: {product.stock} шт.</span>
            ) : (
              <span className="outOfStock">Нет в наличии</span>
            )}
          </div>
          {product.rating > 0 && (
            <div className="productRating">
              ⭐ {product.rating.toFixed(1)}
            </div>
          )}
        </div>
      </div>
      
      <div className="productActions">
        <button className="btn btn--edit" onClick={() => onEdit(product)}>
          Редактировать
        </button>
        <button className="btn btn--danger" onClick={() => onDelete(product.id)}>
          Удалить
        </button>
      </div>
    </div>
  );
}
