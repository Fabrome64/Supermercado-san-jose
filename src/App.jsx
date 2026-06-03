import React, { useState, useEffect } from 'react';
import { db } from './services/db';
import Header from './components/Header';
import CartSidebar from './components/CartSidebar';
import CheckoutModal from './components/CheckoutModal';
import PushAlerts from './components/PushAlerts';
import ChatBot from './components/ChatBot';
import Store from './pages/Store';
import LoyaltyPortal from './pages/LoyaltyPortal';
import AdminDashboard from './pages/AdminDashboard';
import { Key, Shield, User, X } from 'lucide-react';
import './App.css';

export default function App() {
  const [currentPage, setCurrentPage] = useState('store'); // store, loyalty, admin
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // Auth State (Juan Pérez loaded as seed by default to make testing fidelity immediate!)
  const [customer, setCustomer] = useState(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerName, setRegisterName] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerAddress, setRegisterAddress] = useState('');

  // Products Database State
  const [products, setProducts] = useState([]);

  useEffect(() => {
    loadProducts();
    // Auto-login Juan Perez for easier first-time evaluation of fidelity system
    db.getCustomers().then(customers => {
      const juan = customers.find(c => c.email === 'cliente@sanjose.com');
      if (juan) setCustomer(juan);
    }).catch(console.error);
  }, []);

  const loadProducts = async () => {
    try {
      const data = await db.getProducts();
      setProducts(data);
    } catch (e) {
      console.error(e);
    }
  };

  // 1. CART INTERACTIONS
  const handleAddToCart = (product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.qty < product.stock) {
          return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
        }
        alert('Llegaste al límite de stock disponible de este producto.');
        return prev;
      }
      return [...prev, { ...product, qty: 1 }];
    });
    // Visual feedback
    setIsCartOpen(true);
  };

  const handleUpdateCartQty = (productId, newQty) => {
    if (newQty <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    const product = products.find(p => p.id === productId);
    if (product && newQty > product.stock) {
      alert('Llegaste al límite de stock de este producto.');
      return;
    }
    setCartItems(prev => prev.map(item => item.id === productId ? { ...item, qty: newQty } : item));
  };

  const handleRemoveCartItem = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  // 2. ORDER SUBMISSION FLOW
  const handleOrderComplete = async (orderData) => {
    try {
      await db.createOrder(orderData);
      
      // Update inventory stock locally
      const updatedProducts = products.map(p => {
        const cartItem = cartItems.find(item => item.id === p.id);
        if (cartItem) {
          return { ...p, stock: p.stock - cartItem.qty };
        }
        return p;
      });

      // Update database products stock
      for (const item of cartItems) {
        const original = products.find(p => p.id === item.id);
        if (original) {
          await db.saveProduct({ ...original, stock: original.stock - item.qty });
        }
      }

      setProducts(updatedProducts);
      setCartItems([]);
      setIsCartOpen(false);

      // Refresh customer points if customer is logged in
      if (customer) {
        const customers = await db.getCustomers();
        const me = customers.find(c => c.id === customer.id);
        if (me) setCustomer(me);
      }
    } catch (e) {
      console.error(e);
      alert('Hubo un error al procesar tu compra.');
    }
  };

  // 3. BARCODE QUICK CART ADDITION
  const handleBarcodeScan = (code) => {
    // Look for product matching barcode
    const matched = products.find(p => p.barcode === code.trim());
    if (matched) {
      handleAddToCart(matched);
      alert(`¡Producto escaneado y agregado al carrito!: ${matched.name}`);
    } else {
      setSearchQuery(code); // Put in search bar if not exact match to let them find it
      setCurrentPage('store');
      alert(`Código escaneado: "${code}". Se ingresó en la barra de búsqueda.`);
    }
  };

  // 4. AUTH / LOGIN HANDLERS
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (loginEmail === 'admin@sanjose.com' && loginPassword === 'admin') {
      // Login as Admin
      const adminUser = { id: 'admin', email: 'admin@sanjose.com', name: 'Administrador San José' };
      setCustomer(adminUser);
      setShowLoginModal(false);
      setCurrentPage('admin');
      resetLoginForm();
      return;
    }

    try {
      const customers = await db.getCustomers();
      const user = customers.find(c => c.email === loginEmail);
      if (user) {
        setCustomer(user);
        setShowLoginModal(false);
        resetLoginForm();
        setCurrentPage('loyalty');
      } else {
        alert('Credenciales incorrectas o cliente no registrado. Podés registrarte al hacer clic en "Hacete Socio".');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!loginEmail || !registerName) return;

    try {
      const newCustomer = {
        email: loginEmail,
        name: registerName,
        phone: registerPhone,
        address: registerAddress,
        points: 200 // Bonus points for registering!
      };

      const saved = await db.saveCustomer(newCustomer);
      setCustomer(saved);
      setShowLoginModal(false);
      resetLoginForm();
      setCurrentPage('loyalty');
      alert('¡Felicitaciones! Te registraste con éxito. Te regalamos 200 puntos de bienvenida 🌟');
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    setCustomer(null);
    setCurrentPage('store');
    setCartItems([]);
  };

  const resetLoginForm = () => {
    setLoginEmail('');
    setLoginPassword('');
    setRegisterName('');
    setRegisterPhone('');
    setRegisterAddress('');
    setIsRegistering(false);
  };

  const handlePointsUpdate = (updatedCustomer) => {
    setCustomer(updatedCustomer);
  };

  const isSocio = customer && customer.email !== 'admin@sanjose.com';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      {/* HEADER */}
      <Header 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        cartCount={cartItems.reduce((acc, item) => acc + item.qty, 0)}
        toggleCart={() => setIsCartOpen(!isCartOpen)}
        customer={customer}
        onLogout={handleLogout}
        onLoginClick={() => setShowLoginModal(true)}
        onBarcodeScan={handleBarcodeScan}
        navigateToPage={setCurrentPage}
        currentPage={currentPage}
      />

      {/* VIEWS ROUTER */}
      <div style={{ flex: 1 }}>
        {currentPage === 'store' && (
          <Store 
            products={products}
            onAddToCart={handleAddToCart}
            isSocio={isSocio}
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            onLoginClick={() => setShowLoginModal(true)}
          />
        )}

        {currentPage === 'loyalty' && (
          <LoyaltyPortal 
            customer={customer}
            onPointsUpdate={handlePointsUpdate}
          />
        )}

        {currentPage === 'admin' && (
          <AdminDashboard 
            customer={customer}
            onProductsChange={loadProducts}
          />
        )}
      </div>

      {/* FOOTER */}
      <footer style={{ 
        backgroundColor: '#1e293b', 
        color: '#94a3b8', 
        padding: '30px 24px', 
        borderTop: '5px solid var(--primary-gold)' 
      }}>
        <div className="container" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/logo-sj.png" alt="Supermercado San José" style={{ height: '40px' }} />
            <div>
              <strong style={{ color: '#fff', fontSize: '15px' }}>Supermercado San José</strong>
              <p style={{ fontSize: '11px' }}>El súper de tu barrio. Siempre con vos.</p>
            </div>
          </div>
          <div style={{ fontSize: '12px' }}>
            &copy; {new Date().getFullYear()} Supermercado San José S.A. Todos los derechos reservados.
          </div>
        </div>
      </footer>

      {/* CHATBOT */}
      <ChatBot customer={customer} />

      {/* PUSH NOTIFICATIONS TOAST LAYOVER */}
      <PushAlerts />

      {/* CART SIDEBAR OVERLAY */}
      <CartSidebar 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        isSocio={isSocio}
        onCheckoutClick={() => {
          setIsCartOpen(false);
          setShowCheckout(true);
        }}
      />

      {/* CHECKOUT FLOW MODAL */}
      {showCheckout && (
        <CheckoutModal 
          customer={customer}
          cartItems={cartItems}
          isSocio={isSocio}
          onClose={() => setShowCheckout(false)}
          onOrderComplete={handleOrderComplete}
        />
      )}

      {/* AUTH/LOGIN DIALOG MODAL */}
      {showLoginModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: '800' }}>
                <User size={18} /> {isRegistering ? 'Hacete Socio Club San José' : 'Ingresá al Club San José'}
              </h3>
              <button className="cart-close-btn" onClick={() => setShowLoginModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={isRegistering ? handleRegisterSubmit : handleLoginSubmit} className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              <div className="form-group">
                <label className="form-label">Correo Electrónico</label>
                <input 
                  type="email" 
                  className="form-input" 
                  required 
                  placeholder="ejemplo@correo.com"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                />
              </div>

              {!isRegistering && (
                <div className="form-group">
                  <label className="form-label">Contraseña</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    required 
                    placeholder="******"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                  />
                </div>
              )}

              {isRegistering && (
                <>
                  <div className="form-group">
                    <label className="form-label">Nombre Completo</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      required 
                      placeholder="Juan Pérez"
                      value={registerName}
                      onChange={e => setRegisterName(e.target.value)}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Teléfono de Contacto</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="11 5555-5555"
                      value={registerPhone}
                      onChange={e => setRegisterPhone(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Dirección (para Envíos)</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Av. Siempre Viva 742, CABA"
                      value={registerAddress}
                      onChange={e => setRegisterAddress(e.target.value)}
                    />
                  </div>
                </>
              )}

              <button type="submit" className="add-to-cart-btn" style={{ marginTop: '10px' }}>
                {isRegistering ? 'Registrarme y Obtener Regalo' : 'Ingresar'}
              </button>

              <div style={{ 
                marginTop: '12px', borderTop: '1px solid var(--border-color)', 
                paddingTop: '12px', textAlign: 'center', fontSize: '12px' 
              }}>
                {isRegistering ? (
                  <p>
                    ¿Ya sos socio?{' '}
                    <button type="button" onClick={() => setIsRegistering(false)} style={{ background: 'none', border: 'none', color: 'var(--primary-red)', fontWeight: '700', cursor: 'pointer' }}>
                      Iniciá Sesión acá
                    </button>
                  </p>
                ) : (
                  <p>
                    ¿No tenés cuenta Club?{' '}
                    <button type="button" onClick={() => setIsRegistering(true)} style={{ background: 'none', border: 'none', color: 'var(--primary-red)', fontWeight: '700', cursor: 'pointer' }}>
                      Registrate gratis acá
                    </button>
                  </p>
                )}
              </div>

              {!isRegistering && (
                <div style={{ 
                  marginTop: '6px', padding: '8px', borderRadius: '6px', 
                  backgroundColor: 'var(--bg-light)', fontSize: '11px', color: 'var(--light-text)' 
                }}>
                  <strong style={{ color: 'var(--dark-text)' }}>Accesos de prueba rápidos:</strong>
                  <ul style={{ paddingLeft: '14px', marginTop: '2px' }}>
                    <li><strong>Cliente:</strong> cliente@sanjose.com / password</li>
                    <li><strong>Admin:</strong> admin@sanjose.com / admin</li>
                  </ul>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
