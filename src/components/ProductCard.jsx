import React from 'react';
import { ShoppingCart, Star } from 'lucide-react';

export default function ProductCard({ product, onAddToCart, isSocio }) {
  const { name, brand, price, clubPrice, points, image, stock } = product;

  // Calculate discount percentage
  const discountPct = Math.round(((price - clubPrice) / price) * 100);
  const savings = price - clubPrice;

  return (
    <div className="product-card">
      {savings > 0 && (
        <span className="product-badge-discount">
          Club -{discountPct}%
        </span>
      )}
      
      <div className="product-card-img-container">
        <img 
          src={image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300'} 
          alt={name} 
          className="product-card-img" 
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300';
          }}
        />
      </div>

      <span className="product-brand">{brand}</span>
      <h3 className="product-name" title={name}>{name}</h3>

      <div className="product-price-section">
        {savings > 0 ? (
          <>
            <div className="regular-price">Reg. ${price.toLocaleString('es-AR')}</div>
            <div className="current-price">
              ${(isSocio ? clubPrice : price).toLocaleString('es-AR')}
            </div>
            <div className="club-price-box">
              <span className="club-price-label">Club San José</span>
              <span className="club-price-val">${clubPrice.toLocaleString('es-AR')}</span>
            </div>
          </>
        ) : (
          <div className="current-price">${price.toLocaleString('es-AR')}</div>
        )}

        <div className="product-points">
          <Star size={12} fill="currentColor" />
          <span>Sumás {points} pts.</span>
        </div>
      </div>

      <button 
        className="add-to-cart-btn"
        onClick={() => onAddToCart(product)}
        disabled={stock <= 0}
        style={stock <= 0 ? { backgroundColor: '#cbd5e1', cursor: 'not-allowed' } : {}}
      >
        <ShoppingCart size={16} />
        {stock > 0 ? 'Agregar al Carrito' : 'Sin Stock'}
      </button>
    </div>
  );
}
