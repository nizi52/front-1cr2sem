import React from "react";
import ProductCard from "./ProductCard";

export default function ProductsList({products, onEdit, onDelte}) {
    if (!products.length) {
        return <div className="empty">Товар не найден</div>;
    }
    return (
        <div className="productList">
            {products.map((product) => (
                <ProductCard
                key={product.id}
                product={product}
                onEdit={onEdit}
                onDelete={onDelte}
                />
            ))}
        </div>
    );
}