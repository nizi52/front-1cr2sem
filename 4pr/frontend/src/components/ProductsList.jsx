import React from "react";
import ProductCard from "./ProductCard";

export default function ProductsList({ products, onEdit, onDelete, canEdit, canDelete }) {
    if (!products.length) {
        return <div className="empty">Товары не найдены</div>;
    }
    return (
        <div className="productList">
            {products.map(product => (
                <ProductCard
                    key={product.id}
                    product={product}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    canEdit={canEdit}
                    canDelete={canDelete}
                />
            ))}
        </div>
    );
}