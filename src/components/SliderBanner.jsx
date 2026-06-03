import React, { useState, useEffect } from 'react';

const SLIDES = [
  {
    id: 1,
    tag: 'Club San José',
    title: '¡Ahorrá en Grande Todos los Días!',
    desc: 'Registrate hoy, accedé a precios de oferta exclusivos y sumá puntos con cada compra para canjearlos por premios espectaculares.',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&auto=format&fit=crop&q=80',
    buttonText: 'Hacete Socio Gratis'
  },
  {
    id: 2,
    tag: 'Súper Oferta',
    title: 'Yerba Mate Taragüi 1kg',
    desc: 'Precio regular: $3.950. Socios Club San José: ¡Llevátela por solo $3.200 y acumulá 40 puntos!',
    image: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=1200&auto=format&fit=crop&q=80',
    buttonText: 'Comprar Oferta'
  },
  {
    id: 3,
    tag: 'Envíos Gratis',
    title: 'Recibí tu Pedido sin Costo',
    desc: 'Hacé tu pedido de supermercado desde la comodidad de tu casa y te lo enviamos gratis por compras mayores a $15.000.',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&auto=format&fit=crop&q=80',
    buttonText: 'Ver Cobertura'
  }
];

export default function SliderBanner({ onActionClick }) {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIdx(prev => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="slider-container">
      <div 
        className="slide"
        style={{ backgroundImage: `url(${SLIDES[activeIdx].image})` }}
      >
        <div className="slide-content">
          <span className="slide-tag">{SLIDES[activeIdx].tag}</span>
          <h2 className="slide-title">{SLIDES[activeIdx].title}</h2>
          <p className="slide-desc">{SLIDES[activeIdx].desc}</p>
          <button 
            className="slide-btn"
            onClick={() => onActionClick(SLIDES[activeIdx].id)}
          >
            {SLIDES[activeIdx].buttonText}
          </button>
        </div>
      </div>

      <div className="slider-controls">
        {SLIDES.map((_, idx) => (
          <button 
            key={idx}
            className={`slider-dot ${activeIdx === idx ? 'active' : ''}`}
            onClick={() => setActiveIdx(idx)}
          />
        ))}
      </div>
    </div>
  );
}
