import React, { useState, useEffect } from 'react';
import { Gift, Star, CheckCircle } from 'lucide-react';
import { db } from '../services/db';
import confetti from 'canvas-confetti';

export default function LoyaltyCatalog({ customer, onRedeemSuccess }) {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeemingId, setRedeemingId] = useState(null);

  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
    try {
      const data = await db.getRewards();
      setRewards(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (reward) => {
    if (!customer) return;
    if (customer.points < reward.pointsPrice) return;

    setRedeemingId(reward.id);
    try {
      const result = await db.redeemReward(customer.id, reward);
      if (result.success) {
        // Explode Confetti!
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        
        onRedeemSuccess(result.customer);
        loadRewards(); // Refresh list to update stock
        alert(`¡Felicidades! Canjeaste "${reward.name}" con éxito. Se ha generado una orden de envío gratis a tu domicilio.`);
      } else {
        alert(result.error);
      }
    } catch (e) {
      console.error(e);
      alert('Error al realizar el canje.');
    } finally {
      setRedeemingId(null);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Cargando catálogo de premios...</div>;
  }

  return (
    <div style={{ margin: '30px 0' }}>
      
      {/* SECTION TITLE */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '10px', 
        marginBottom: '20px',
        borderBottom: '2px solid var(--primary-gold)',
        paddingBottom: '8px'
      }}>
        <Gift size={26} color="var(--primary-red)" />
        <h2 style={{ fontSize: '22px', fontWeight: '800' }}>Catálogo de Premios San José</h2>
      </div>

      <p style={{ fontSize: '13px', color: 'var(--light-text)', marginBottom: '24px' }}>
        Canjeá tus puntos acumulados por fabulosos premios. Al canjear, se generará un envío automático sin cargo a tu dirección registrada.
      </p>

      {/* REWARDS GRID */}
      <div className="rewards-grid">
        {rewards.map(reward => {
          const hasPoints = customer && customer.points >= reward.pointsPrice;
          const isOutOfStock = reward.stock <= 0;

          return (
            <div key={reward.id} className="reward-card">
              <div className="reward-img-box">
                <img 
                  src={reward.image || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=300'} 
                  alt={reward.name} 
                  className="reward-img"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=300';
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="reward-points-badge">
                  <Star size={12} fill="currentColor" style={{ display: 'inline-block', marginRight: '4px', verticalAlign: 'text-bottom' }} />
                  {reward.pointsPrice} pts.
                </span>
                <span style={{ fontSize: '11px', fontWeight: '700', color: isOutOfStock ? '#ef4444' : '#10b981' }}>
                  {isOutOfStock ? 'Sin Stock' : `Stock: ${reward.stock}`}
                </span>
              </div>

              <h3 className="reward-name">{reward.name}</h3>
              <p className="reward-desc">{reward.description}</p>

              <button
                className="reward-btn"
                onClick={() => handleRedeem(reward)}
                disabled={!customer || !hasPoints || isOutOfStock || redeemingId !== null}
                style={(!customer || !hasPoints || isOutOfStock) ? { 
                  backgroundColor: '#cbd5e1', 
                  color: '#94a3b8', 
                  cursor: 'not-allowed' 
                } : {}}
              >
                {redeemingId === reward.id ? 'Canjeando...' : (
                  !customer ? 'Iniciar Sesión para Canjear' : (
                    !hasPoints ? 'Puntos Insuficientes' : (
                      isOutOfStock ? 'Agotado' : 'Canjear Premio'
                    )
                  )
                )}
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
}
