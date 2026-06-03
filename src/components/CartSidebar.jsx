import React from 'react';
import { X, Trash2, ShoppingCart, Star } from 'lucide-react';

export default function CartSidebar({ 
  isOpen, 
  onClose, 
  cartItems, 
  onUpdateQty, 
  onRemoveItem, 
  isSocio, 
  onCheckoutClick 
}) {
  
  // Calculate Totals
  const subtotal = cartItems.reduce((sum, item) => {
    const price = isSocio ? item.clubPrice : item.price;
    return sum + (price * item.qty);
  }, 0);

  const pointsEarned = cartItems.reduce((sum, item) => {
    return sum + (item.points * item.qty);
  }, 0);

  return (
    <>
      {/* Backdrop */}
      <div className={`cart-backdrop ${isOpen ? 'open' : ''}`} onClick={onClose} />

      {/* Sidebar Panel */}
      <div className={`cart-sidebar ${isOpen ? 'open' : ''}`}>
        
        {/* HEADER */}
        <div className="cart-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: '800' }}>
            <ShoppingCart size={20} /> Mi Carrito
          </h3>
          <button className="cart-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* ITEMS LIST */}
        <div className="cart-body">
          {cartItems.length > 0 ? (
            cartItems.map(item => {
              const activePrice = isSocio ? item.clubPrice : item.price;
              return (
                <div key={item.id} className="cart-item">
                  <img src={item.image} alt={item.name} className="cart-item-img" />
                  
                  <div className="cart-item-info">
                    <h4 className="cart-item-name">{item.name}</h4>
                    <div className="cart-item-price">
                      ${activePrice.toLocaleString('es-AR')} x {item.qty}
                    </div>
                    
                    <div className="cart-item-qty-control">
                      <button className="qty-btn" onClick={() => onUpdateQty(item.id, item.qty - 1)}>-</button>
                      <span className="qty-val">{item.qty}</span>
                      <button className="qty-btn" onClick={() => onUpdateQty(item.id, item.qty + 1)}>+</button>
                    </div>
                  </div>

                  <button className="cart-item-delete" onClick={() => onRemoveItem(item.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              gap: '12px',
              color: 'var(--light-text)' 
            }}>
              <ShoppingCart size={48} strokeWidth={1.5} style={{ opacity: 0.3 }} />
              <p style={{ fontWeight: '600' }}>Tu carrito está vacío</p>
              <p style={{ fontSize: '12px' }}>Agrega productos de la tienda para comenzar tu compra.</p>
            </div>
          )}
        </div>

        {/* FOOTER */}
        {cartItems.length > 0 && (
          <div className="cart-footer">
            <div className="cart-summary-row">
              <span>Productos ({cartItems.reduce((acc, item) => acc + item.qty, 0)})</span>
              <span>${subtotal.toLocaleString('es-AR')}</span>
            </div>
            
            {pointsEarned > 0 && (
              <div className="points-earned-box">
                <Star size={16} fill="currentColor" />
                <span>¡Con esta compra sumás *{pointsEarned} puntos* Club!</span>
              </div>
            )}

            <div className="cart-summary-row cart-summary-total">
              <span>Total Estimado</span>
              <span>${subtotal.toLocaleString('es-AR')}</span>
            </div>

            <button 
              className="checkout-btn"
              onClick={onCheckoutClick}
              style={{ marginTop: '16px' }}
            >
              Iniciar Compra
            </button>
          </div>
        )}

      </div>
    </>
  );
}
