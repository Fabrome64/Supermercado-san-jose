import React, { useState } from 'react';
import { X, CheckCircle, Truck, Store } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CheckoutModal({ 
  customer, 
  cartItems, 
  isSocio, 
  onClose, 
  onOrderComplete 
}) {
  const [name, setName] = useState(customer ? customer.name : '');
  const [deliveryType, setDeliveryType] = useState('delivery'); // delivery or pickup
  const [address, setAddress] = useState(customer ? customer.address : '');
  const [phone, setPhone] = useState(customer ? customer.phone : '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Calculate Totals
  const subtotal = cartItems.reduce((sum, item) => {
    const price = isSocio ? item.clubPrice : item.price;
    return sum + (price * item.qty);
  }, 0);

  const pointsEarned = cartItems.reduce((sum, item) => {
    return sum + (item.points * item.qty);
  }, 0);

  const deliveryCost = deliveryType === 'delivery' && subtotal < 15000 ? 800 : 0;
  const total = subtotal + deliveryCost;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || (deliveryType === 'delivery' && !address) || !phone) return;

    setIsSubmitting(true);
    
    const orderData = {
      customerId: customer ? customer.id : null,
      customerName: name,
      items: cartItems.map(item => ({
        productId: item.id,
        name: item.name,
        qty: item.qty,
        price: isSocio ? item.clubPrice : item.price
      })),
      total,
      pointsEarned,
      deliveryType,
      deliveryAddress: deliveryType === 'delivery' ? address : 'Retiro en Sucursal (Av. Presidente Perón 2345)',
      deliveryPhone: phone,
      date: new Date().toISOString()
    };

    try {
      await onOrderComplete(orderData);
      setIsSuccess(true);
      // Explode Confetti!
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="modal-backdrop">
        <div className="modal-content" style={{ textAlign: 'center', padding: '40px 24px' }}>
          <div style={{ color: '#16a34a', marginBottom: '20px' }}>
            <CheckCircle size={64} style={{ margin: '0 auto' }} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>
            ¡Pedido Realizado con Éxito!
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--light-text)', marginBottom: '24px' }}>
            Tu orden ha sido registrada. Podrás seguir el estado del reparto en tiempo real desde tu Portal de Socio.
          </p>
          {pointsEarned > 0 && (
            <div style={{ 
              backgroundColor: 'var(--primary-gold-light)', 
              border: '1px solid var(--primary-gold)', 
              borderRadius: '8px', 
              padding: '12px', 
              fontSize: '13px', 
              fontWeight: '700', 
              color: 'var(--primary-gold-dark)',
              marginBottom: '24px' 
            }}>
              ⭐ ¡Sumaste {pointsEarned} puntos a tu cuenta Club San José!
            </div>
          )}
          <button className="add-to-cart-btn" onClick={onClose}>
            Entendido / Volver a la Tienda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        
        {/* HEADER */}
        <div className="modal-header">
          <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Confirmar tu Compra</h3>
          <button className="cart-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="form-group">
            <label className="form-label">Nombre Completo</label>
            <input 
              type="text" 
              className="form-input" 
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ej: Juan Pérez"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Método de Entrega</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                style={{ 
                  flex: 1, padding: '12px', borderRadius: '8px', 
                  border: `2px solid ${deliveryType === 'delivery' ? 'var(--primary-red)' : 'var(--border-color)'}`,
                  background: deliveryType === 'delivery' ? 'var(--primary-red-light)' : '#fff',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  fontWeight: '700', color: deliveryType === 'delivery' ? 'var(--primary-red)' : 'var(--light-text)'
                }}
                onClick={() => setDeliveryType('delivery')}
              >
                <Truck size={18} /> Envío a Domicilio
              </button>
              
              <button
                type="button"
                style={{ 
                  flex: 1, padding: '12px', borderRadius: '8px', 
                  border: `2px solid ${deliveryType === 'pickup' ? 'var(--primary-red)' : 'var(--border-color)'}`,
                  background: deliveryType === 'pickup' ? 'var(--primary-red-light)' : '#fff',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  fontWeight: '700', color: deliveryType === 'pickup' ? 'var(--primary-red)' : 'var(--light-text)'
                }}
                onClick={() => setDeliveryType('pickup')}
              >
                <Store size={18} /> Retiro en Local
              </button>
            </div>
          </div>

          {deliveryType === 'delivery' && (
            <div className="form-group">
              <label className="form-label">Dirección de Entrega</label>
              <input 
                type="text" 
                className="form-input" 
                required
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Ej: Av. Siempre Viva 742, CABA"
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Teléfono de Contacto</label>
            <input 
              type="text" 
              className="form-input" 
              required
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="Ej: 11 5555-5555"
            />
          </div>

          {/* TOTALS OVERVIEW */}
          <div style={{ 
            backgroundColor: 'var(--bg-light)', 
            padding: '16px', 
            borderRadius: '8px',
            marginTop: '8px',
            fontSize: '13px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span>Subtotal Productos:</span>
              <span style={{ fontWeight: '600' }}>${subtotal.toLocaleString('es-AR')}</span>
            </div>
            {deliveryType === 'delivery' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span>Costo de Envío:</span>
                <span>{deliveryCost === 0 ? '¡GRATIS!' : `$${deliveryCost}`}</span>
              </div>
            )}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              fontWeight: '800', 
              fontSize: '16px', 
              color: 'var(--primary-red)',
              borderTop: '1px solid var(--border-color)',
              paddingTop: '8px',
              marginTop: '8px'
            }}>
              <span>Total a Pagar:</span>
              <span>${total.toLocaleString('es-AR')}</span>
            </div>
          </div>

          <button 
            type="submit" 
            className="checkout-btn" 
            disabled={isSubmitting}
            style={{ width: '100%', marginTop: '8px' }}
          >
            {isSubmitting ? 'Procesando...' : 'Confirmar Compra'}
          </button>

        </form>

      </div>
    </div>
  );
}
