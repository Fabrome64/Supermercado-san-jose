import React, { useState, useEffect } from 'react';
import { Gift, FileText, Compass, Star, Truck, MapPin } from 'lucide-react';
import { db } from '../services/db';
import LoyaltyCatalog from '../components/LoyaltyCatalog';

export default function LoyaltyPortal({ customer, onPointsUpdate }) {
  const [activeTab, setActiveTab] = useState('catalog'); // catalog, orders, history
  const [orders, setOrders] = useState([]);
  const [pointsHistory, setPointsHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (customer) {
      loadCustomerDetails();
    }
  }, [customer, activeTab]);

  const loadCustomerDetails = async () => {
    setLoading(true);
    try {
      const allOrders = await db.getOrders();
      const clientOrders = allOrders.filter(o => o.customerId === customer.id);
      setOrders(clientOrders);

      const history = await db.getPointHistory(customer.id);
      setPointsHistory(history);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemSuccess = (updatedCustomer) => {
    onPointsUpdate(updatedCustomer);
    loadCustomerDetails();
  };

  if (!customer) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '80px 20px' }}>
        <h2>Acceso Restringido</h2>
        <p style={{ margin: '12px 0', color: 'var(--light-text)' }}>
          Por favor, inicia sesión para acceder a tu Portal de Fidelización Club San José.
        </p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '30px 24px 60px' }}>
      
      {/* LOYALTY CARD BANNER */}
      <div className="loyalty-banner">
        <div className="loyalty-info">
          <h2>Hola, {customer.name}!</h2>
          <p style={{ marginTop: '8px', opacity: 0.9 }}>
            ¡Gracias por formar parte de la familia del Supermercado San José!
          </p>
          <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
            <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: '700' }}>
              Socio Activo
            </span>
            <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: '700' }}>
              Envío Preferencial
            </span>
          </div>
        </div>

        {/* VIRTUAL FIDELITY CARD */}
        <div className="loyalty-card-mock">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="loyalty-card-logo">CLUB SAN JOSÉ</span>
            <Star size={24} fill="var(--primary-gold)" color="var(--primary-gold)" />
          </div>
          <div>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', opacity: 0.7, marginBottom: '-2px' }}>Puntos Acumulados</div>
            <div className="loyalty-card-points">{customer.points} <span style={{ fontSize: '14px', fontWeight: '400' }}>pts</span></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div style={{ fontSize: '12px', fontWeight: '600' }}>{customer.name}</div>
            <div className="loyalty-card-number">{customer.cardId}</div>
          </div>
        </div>
      </div>

      {/* PORTAL NAVIGATION TABS */}
      <div style={{ 
        display: 'flex', 
        borderBottom: '1px solid var(--border-color)', 
        marginBottom: '24px',
        overflowX: 'auto' 
      }}>
        <button
          onClick={() => setActiveTab('catalog')}
          style={{
            background: 'none', border: 'none', padding: '12px 20px', fontSize: '14px', fontWeight: '700',
            color: activeTab === 'catalog' ? 'var(--primary-red)' : 'var(--light-text)',
            borderBottom: activeTab === 'catalog' ? '3px solid var(--primary-red)' : '3px solid transparent',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          <Gift size={16} /> Canjear Premios
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          style={{
            background: 'none', border: 'none', padding: '12px 20px', fontSize: '14px', fontWeight: '700',
            color: activeTab === 'orders' ? 'var(--primary-red)' : 'var(--light-text)',
            borderBottom: activeTab === 'orders' ? '3px solid var(--primary-red)' : '3px solid transparent',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          <Truck size={16} /> Mis Pedidos y Entregas
        </button>

        <button
          onClick={() => setActiveTab('history')}
          style={{
            background: 'none', border: 'none', padding: '12px 20px', fontSize: '14px', fontWeight: '700',
            color: activeTab === 'history' ? 'var(--primary-red)' : 'var(--light-text)',
            borderBottom: activeTab === 'history' ? '3px solid var(--primary-red)' : '3px solid transparent',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          <FileText size={16} /> Historial de Puntos
        </button>
      </div>

      {/* TAB CONTENT PANEL */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Cargando portal...</div>
      ) : (
        <div>
          {/* 1. CATALOG TAB */}
          {activeTab === 'catalog' && (
            <LoyaltyCatalog customer={customer} onRedeemSuccess={handleRedeemSuccess} />
          )}

          {/* 2. ORDERS TRACKING TAB */}
          {activeTab === 'orders' && (
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px' }}>Seguimiento de Envíos</h3>
              
              {orders.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {orders.map(order => (
                    <div 
                      key={order.id} 
                      style={{ 
                        backgroundColor: '#fff', border: '1px solid var(--border-color)', 
                        borderRadius: '8px', padding: '20px', boxShadow: 'var(--shadow-sm)' 
                      }}
                    >
                      {/* HEADER */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <strong style={{ fontSize: '14px', color: 'var(--primary-red)' }}>
                            Pedido #{order.id.substring(2, 8).toUpperCase()}
                          </strong>
                          <span style={{ fontSize: '12px', color: 'var(--light-text)', marginLeft: '12px' }}>
                            {new Date(order.date).toLocaleDateString('es-AR')}
                          </span>
                        </div>
                        <span className={`status-badge ${order.status.toLowerCase().replace(' ', '')}`}>
                          {order.status}
                        </span>
                      </div>

                      {/* TRACKING PROGRESS STEPS */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', margin: '24px 0 16px', position: 'relative' }}>
                        {/* Progress line background */}
                        <div style={{ 
                          position: 'absolute', top: '15px', left: '10%', right: '10%', height: '4px', 
                          backgroundColor: '#e2e8f0', zIndex: 1 
                        }} />
                        
                        {/* Progress line active */}
                        <div style={{ 
                          position: 'absolute', top: '15px', left: '10%', 
                          width: order.status === 'Pendiente' ? '0%' : 
                                 order.status === 'En Preparación' ? '40%' : 
                                 order.status === 'En Camino' ? '80%' : '80%', 
                          height: '4px', backgroundColor: 'var(--primary-red)', zIndex: 1 
                        }} />

                        {/* Steps */}
                        {[
                          { label: 'Pendiente', active: true },
                          { label: 'En Preparación', active: ['En Preparación', 'En Camino', 'Entregado'].includes(order.status) },
                          { label: 'En Camino', active: ['En Camino', 'Entregado'].includes(order.status) },
                          { label: 'Entregado', active: order.status === 'Entregado' }
                        ].map((step, idx) => (
                          <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, width: '20%' }}>
                            <div style={{ 
                              width: '32px', height: '32px', borderRadius: '50%', 
                              backgroundColor: step.active ? 'var(--primary-red)' : '#fff',
                              border: `3px solid ${step.active ? 'var(--primary-gold)' : '#cbd5e1'}`,
                              display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center',
                              color: step.active ? '#fff' : '#cbd5e1'
                            }}>
                              {idx + 1}
                            </div>
                            <span style={{ fontSize: '11px', fontWeight: '700', marginTop: '6px', textAlign: 'center', color: step.active ? 'var(--dark-text)' : 'var(--light-text)' }}>
                              {step.label}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* DETAILS */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '13px', borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '12px', color: 'var(--light-text)' }}>
                        <div>
                          <strong>Productos:</strong>
                          <ul style={{ listStyle: 'none', paddingLeft: 0, marginTop: '4px' }}>
                            {order.items.map((item, idx) => (
                              <li key={idx} style={{ color: 'var(--dark-text)' }}>
                                {item.qty}x {item.name} {item.price > 0 && `($${item.price})`}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={14} color="var(--primary-red)" />
                            <strong>Dirección de Entrega:</strong>
                          </div>
                          <p style={{ color: 'var(--dark-text)', marginTop: '4px' }}>{order.deliveryAddress}</p>
                          <p style={{ marginTop: '2px' }}>Tel: {order.deliveryPhone}</p>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '12px' }}>Total Facturado:</div>
                          <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary-red)', marginTop: '2px' }}>
                            ${order.total.toLocaleString('es-AR')}
                          </div>
                          {order.pointsEarned > 0 && (
                            <span style={{ fontSize: '11px', color: 'var(--primary-gold-dark)', fontWeight: '700' }}>
                              Sumaste {order.pointsEarned} pts
                            </span>
                          )}
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <Truck size={40} style={{ color: '#cbd5e1', marginBottom: '8px' }} />
                  <p style={{ color: 'var(--light-text)' }}>Todavía no realizaste ningún pedido.</p>
                </div>
              )}
            </div>
          )}

          {/* 3. POINTS TRANSACTION LOGS TAB */}
          {activeTab === 'history' && (
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px' }}>Historial de Movimientos de Puntos</h3>
              
              {pointsHistory.length > 0 ? (
                <div style={{ backgroundColor: '#fff', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
                  <table className="admin-table" style={{ margin: 0 }}>
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Concepto / Transacción</th>
                        <th style={{ textAlign: 'right' }}>Puntos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pointsHistory.map(log => (
                        <tr key={log.id}>
                          <td>{new Date(log.date).toLocaleDateString('es-AR')} {new Date(log.date).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</td>
                          <td style={{ fontWeight: '600' }}>{log.description}</td>
                          <td style={{ 
                            textAlign: 'right', 
                            fontWeight: '800', 
                            color: log.points > 0 ? '#16a34a' : '#ef4444' 
                          }}>
                            {log.points > 0 ? `+${log.points}` : log.points} pts
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <Star size={40} style={{ color: '#cbd5e1', marginBottom: '8px' }} />
                  <p style={{ color: 'var(--light-text)' }}>No se encontraron registros de puntos.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
