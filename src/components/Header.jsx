import React, { useState } from 'react';
import { Search, ShoppingCart, User, LogOut, Barcode, Shield } from 'lucide-react';
import BarcodeScanner from './BarcodeScanner';

export default function Header({ 
  searchQuery, 
  setSearchQuery, 
  cartCount, 
  toggleCart, 
  customer, 
  onLogout, 
  onLoginClick,
  onBarcodeScan,
  navigateToPage,
  currentPage
}) {
  const [showScanner, setShowScanner] = useState(false);

  const handleBarcodeDetect = (code) => {
    onBarcodeScan(code);
    setShowScanner(false);
  };

  return (
    <header className="header">
      <div className="container header-top">
        
        {/* LOGO */}
        <div 
          className="logo-container" 
          onClick={() => navigateToPage('store')}
          style={{ cursor: 'pointer' }}
        >
          <img src="/logo-sj.png" alt="Supermercado San José Mascot" className="logo-img" />
          <div>
            <h1 className="logo-text">
              SAN JOSÉ
              <span className="logo-subtitle">SUPERMERCADO</span>
            </h1>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="search-bar-container">
          <input 
            type="text" 
            className="search-input" 
            placeholder="Buscar marcas, productos o escanear código..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="search-btn-group">
            <button 
              className="barcode-scan-btn" 
              title="Escanear con Cámara/Lector" 
              onClick={() => setShowScanner(true)}
            >
              <Barcode size={20} />
            </button>
            <button className="search-icon-btn">
              <Search size={18} />
            </button>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="header-actions">
          {/* CLUB SAN JOSE / POINTS CARD */}
          {customer ? (
            <button 
              className="club-badge-btn" 
              onClick={() => navigateToPage('loyalty')}
            >
              🌟 Club San José: {customer.points} pts
            </button>
          ) : (
            <button 
              className="club-badge-btn" 
              onClick={onLoginClick}
            >
              🌟 Club San José (Ingresar)
            </button>
          )}

          {/* USER SECTIONS & LOGOUT */}
          {customer ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button 
                className="user-nav-btn"
                onClick={() => navigateToPage(customer.email === 'admin@sanjose.com' ? 'admin' : 'loyalty')}
              >
                {customer.email === 'admin@sanjose.com' ? (
                  <>
                    <Shield size={20} />
                    <span>Admin</span>
                  </>
                ) : (
                  <>
                    <User size={20} />
                    <span>Mi Portal</span>
                  </>
                )}
              </button>
              
              <button className="user-nav-btn" onClick={onLogout} title="Cerrar Sesión">
                <LogOut size={20} />
                <span>Salir</span>
              </button>
            </div>
          ) : (
            <button className="user-nav-btn" onClick={onLoginClick}>
              <User size={20} />
              <span>Ingresar</span>
            </button>
          )}

          {/* CART TOGGLE */}
          <button className="cart-nav-btn" onClick={toggleCart}>
            <ShoppingCart size={22} />
            {cartCount > 0 && <div className="cart-count">{cartCount}</div>}
            <span>Mi Carrito</span>
          </button>
        </div>
      </div>

      {showScanner && (
        <BarcodeScanner 
          onScan={handleBarcodeDetect} 
          onClose={() => setShowScanner(false)} 
        />
      )}
    </header>
  );
}
