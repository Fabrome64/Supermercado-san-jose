import React, { useState, useEffect } from 'react';
import { 
  Package, Users, ShoppingBag, Gift, Bell, RefreshCw, Plus, Edit2, Trash2, Camera, Key, Check 
} from 'lucide-react';
import { db } from '../services/db';
import BarcodeScanner from '../components/BarcodeScanner';
import { triggerNotification } from '../components/PushAlerts';

export default function AdminDashboard({ customer, onProductsChange }) {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [rewards, setRewards] = useState([]);
  
  // Products Forms States
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [productForm, setProductForm] = useState({ id: '', name: '', brand: '', category: 'Almacén', price: '', clubPrice: '', points: '', barcode: '', image: '', stock: '' });
  const [showProductScanner, setShowProductScanner] = useState(false);

  // Rewards Forms States
  const [isEditingReward, setIsEditingReward] = useState(false);
  const [rewardForm, setRewardForm] = useState({ id: '', name: '', description: '', pointsPrice: '', stock: '', image: '' });

  // Customer Points Form States
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [pointsAdjustment, setPointsAdjustment] = useState({ customerId: '', customerName: '', delta: '', reason: 'Ajuste administrativo' });

  // Push campaign states
  const [pushCampaign, setPushCampaign] = useState({ title: '🔥 ¡Oferta de Último Momento!', body: 'Galletitas Oreo 117g a solo $890 por tiempo limitado. ¡Aprovechá!' });

  // Firebase Config inputs
  const [firebaseConfig, setFirebaseConfig] = useState({
    apiKey: '', authDomain: '', projectId: '', storageBucket: '', messagingSenderId: '', appId: ''
  });
  const [isConfigSaved, setIsConfigSaved] = useState(false);

  useEffect(() => {
    loadData();
    // Load current firebase settings from localStorage
    const savedConfig = localStorage.getItem('sanjose_firebase_config');
    if (savedConfig) {
      setFirebaseConfig(JSON.parse(savedConfig));
    }
  }, [activeTab]);

  const loadData = async () => {
    try {
      if (activeTab === 'products') {
        const data = await db.getProducts();
        setProducts(data);
      } else if (activeTab === 'customers') {
        const data = await db.getCustomers();
        setCustomers(data);
      } else if (activeTab === 'orders') {
        const data = await db.getOrders();
        setOrders(data);
      } else if (activeTab === 'rewards') {
        const data = await db.getRewards();
        setRewards(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 1. PRODUCTS MANAGEMENT
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const formatted = {
      ...productForm,
      price: Number(productForm.price),
      clubPrice: Number(productForm.clubPrice),
      points: Number(productForm.points) || Math.round(Number(productForm.clubPrice) / 100),
      stock: Number(productForm.stock),
      image: productForm.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300'
    };

    try {
      await db.saveProduct(formatted);
      setIsEditingProduct(false);
      resetProductForm();
      loadData();
      if (onProductsChange) onProductsChange();
      alert('Producto guardado correctamente.');
    } catch (e) {
      console.error(e);
      alert('Error al guardar el producto.');
    }
  };

  const handleEditProductClick = (p) => {
    setProductForm({ ...p });
    setIsEditingProduct(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('¿Seguro que querés eliminar este producto?')) {
      try {
        await db.deleteProduct(id);
        loadData();
        if (onProductsChange) onProductsChange();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const resetProductForm = () => {
    setProductForm({ id: '', name: '', brand: '', category: 'Almacén', price: '', clubPrice: '', points: '', barcode: '', image: '', stock: '' });
    setIsEditingProduct(false);
  };

  // Keyboard barcode listener hook helper in the form
  useEffect(() => {
    if (!isEditingProduct && activeTab !== 'products') return;

    let buffer = '';
    let lastKeyTime = Date.now();

    const handleFormScanner = (e) => {
      // Don't intercept if we aren't focused on the page generally
      const now = Date.now();
      if (now - lastKeyTime > 50) buffer = '';
      lastKeyTime = now;

      if (e.key === 'Enter') {
        if (buffer.length >= 4) {
          setProductForm(prev => ({ ...prev, barcode: buffer }));
          buffer = '';
          e.preventDefault();
          alert('¡Código de barras escaneado correctamente!');
        }
      } else if (e.key.length === 1) {
        buffer += e.key;
      }
    };

    window.addEventListener('keydown', handleFormScanner);
    return () => window.removeEventListener('keydown', handleFormScanner);
  }, [activeTab, isEditingProduct]);

  // 2. REWARDS CATALOG MANAGEMENT
  const handleRewardSubmit = async (e) => {
    e.preventDefault();
    const formatted = {
      ...rewardForm,
      pointsPrice: Number(rewardForm.pointsPrice),
      stock: Number(rewardForm.stock),
      image: rewardForm.image || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=300'
    };

    try {
      await db.saveReward(formatted);
      setIsEditingReward(false);
      resetRewardForm();
      loadData();
      alert('Premio guardado correctamente.');
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditRewardClick = (r) => {
    setRewardForm({ ...r });
    setIsEditingReward(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteReward = async (id) => {
    if (window.confirm('¿Seguro que deseas borrar este premio?')) {
      try {
        await db.deleteReward(id);
        loadData();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const resetRewardForm = () => {
    setRewardForm({ id: '', name: '', description: '', pointsPrice: '', stock: '', image: '' });
    setIsEditingReward(false);
  };

  // 3. DELIVERIES STATUS MANAGEMENT
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const success = await db.updateOrderStatus(orderId, newStatus);
      if (success) {
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 4. CUSTOMER FIDELITY POINTS ADJUSTMENT
  const handleAdjustPointsSubmit = async (e) => {
    e.preventDefault();
    const delta = Number(pointsAdjustment.delta);
    if (isNaN(delta) || delta === 0) return;

    try {
      await db.adjustCustomerPoints(pointsAdjustment.customerId, delta, pointsAdjustment.reason);
      setShowPointsModal(false);
      loadData();
      alert('Puntos ajustados con éxito.');
    } catch (e) {
      console.error(e);
    }
  };

  // 5. CAMPAIGN BROADCAST
  const handleBroadcastPush = (e) => {
    e.preventDefault();
    if (!pushCampaign.title || !pushCampaign.body) return;

    // Send push notification instantly
    triggerNotification(pushCampaign.title, pushCampaign.body);
    alert('Notificación enviada en vivo a los navegadores.');
  };

  // 6. FIREBASE SETTINGS CONFIG
  const handleFirebaseSave = (e) => {
    e.preventDefault();
    localStorage.setItem('sanjose_firebase_config', JSON.stringify(firebaseConfig));
    setIsConfigSaved(true);
    setTimeout(() => setIsConfigSaved(false), 3000);
    alert('Configuración guardada en LocalStorage. Reinicie la página para aplicar los cambios en Firebase.');
  };

  return (
    <div className="admin-layout">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <span className="admin-sidebar-title">Dashboard San José</span>
          <p style={{ fontSize: '11px', color: 'var(--light-text)' }}>Rol: Administrador</p>
        </div>
        
        <button className={`admin-menu-btn ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
          <Package size={16} /> Productos
        </button>
        <button className={`admin-menu-btn ${activeTab === 'customers' ? 'active' : ''}`} onClick={() => setActiveTab('customers')}>
          <Users size={16} /> Clientes & Puntos
        </button>
        <button className={`admin-menu-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
          <ShoppingBag size={16} /> Pedidos & Envíos
        </button>
        <button className={`admin-menu-btn ${activeTab === 'rewards' ? 'active' : ''}`} onClick={() => setActiveTab('rewards')}>
          <Gift size={16} /> Premios Canjeables
        </button>
        <button className={`admin-menu-btn ${activeTab === 'campaigns' ? 'active' : ''}`} onClick={() => setActiveTab('campaigns')}>
          <Bell size={16} /> Campañas Push
        </button>
        <button className={`admin-menu-btn ${activeTab === 'firebase' ? 'active' : ''}`} onClick={() => setActiveTab('firebase')}>
          <Key size={16} /> Config Firebase
        </button>
      </aside>

      {/* MAIN VIEWPORT PANEL */}
      <main className="admin-main">

        {/* 1. PRODUCTS TAB */}
        {activeTab === 'products' && (
          <div>
            {/* ADD/EDIT FORM CARD */}
            <div className="admin-panel-card">
              <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                {isEditingProduct ? 'Editar Producto' : 'Cargar Nuevo Producto'}
              </h3>
              
              <form onSubmit={handleProductSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Nombre del Producto</label>
                    <input type="text" className="form-input" required value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} placeholder="Ej: Leche Entera 1L" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Marca</label>
                    <input type="text" className="form-input" required value={productForm.brand} onChange={e => setProductForm({...productForm, brand: e.target.value})} placeholder="Ej: La Serenísima" />
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Categoría</label>
                    <select className="form-input" value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})}>
                      <option value="Almacén">Almacén</option>
                      <option value="Frescos">Frescos</option>
                      <option value="Bebidas">Bebidas</option>
                      <option value="Limpieza">Limpieza</option>
                      <option value="Fiambrería">Fiambrería</option>
                      <option value="Bazar">Bazar</option>
                      <option value="Mascotas">Mascotas</option>
                      <option value="Vinoteca">Vinoteca</option>
                      <option value="Blanquería">Blanquería</option>
                      <option value="Camping">Camping</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">URL de Imagen</label>
                    <input type="text" className="form-input" value={productForm.image} onChange={e => setProductForm({...productForm, image: e.target.value})} placeholder="https://unsplash..." />
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Precio Regular ($)</label>
                    <input type="number" className="form-input" required value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} placeholder="1500" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Precio Club San José ($)</label>
                    <input type="number" className="form-input" required value={productForm.clubPrice} onChange={e => setProductForm({...productForm, clubPrice: e.target.value})} placeholder="1200" />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }} className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Stock Inicial</label>
                    <input type="number" className="form-input" required value={productForm.stock} onChange={e => setProductForm({...productForm, stock: e.target.value})} placeholder="50" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Puntos que Otorga (Opcional)</label>
                    <input type="number" className="form-input" value={productForm.points} onChange={e => setProductForm({...productForm, points: e.target.value})} placeholder="Ej: 15" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Código de Barras</label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input type="text" className="form-input" value={productForm.barcode} onChange={e => setProductForm({...productForm, barcode: e.target.value})} placeholder="Escanee o escriba" style={{ flex: 1 }} />
                      <button type="button" className="barcode-scan-btn" onClick={() => setShowProductScanner(true)} title="Escanear con Webcam">
                        <Camera size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignSelf: 'flex-end', marginTop: '8px' }}>
                  {isEditingProduct && (
                    <button type="button" className="add-to-cart-btn" onClick={resetProductForm} style={{ backgroundColor: '#94a3b8' }}>
                      Cancelar Edición
                    </button>
                  )}
                  <button type="submit" className="add-to-cart-btn" style={{ width: 'auto', padding: '10px 30px' }}>
                    {isEditingProduct ? 'Actualizar Producto' : 'Guardar Producto'}
                  </button>
                </div>
              </form>
            </div>

            {/* PRODUCTS LIST TABLE */}
            <div className="admin-panel-card" style={{ overflowX: 'auto' }}>
              <div className="admin-panel-title">
                <span>Listado de Productos en Stock</span>
              </div>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Categoría</th>
                    <th>Cód. Barras</th>
                    <th>Precio</th>
                    <th>Precio Club</th>
                    <th>Stock</th>
                    <th>Puntos</th>
                    <th style={{ textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: '600' }}>
                        <div>{p.name}</div>
                        <span style={{ fontSize: '10px', color: 'var(--light-text)' }}>{p.brand}</span>
                      </td>
                      <td>{p.category}</td>
                      <td style={{ fontFamily: 'monospace' }}>{p.barcode || 'N/A'}</td>
                      <td>${p.price}</td>
                      <td style={{ color: 'var(--primary-red)', fontWeight: '700' }}>${p.clubPrice}</td>
                      <td style={{ fontWeight: '700', color: p.stock < 10 ? '#ef4444' : 'inherit' }}>{p.stock}</td>
                      <td>{p.points} pts</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button className="search-icon-btn" onClick={() => handleEditProductClick(p)}>
                            <Edit2 size={14} />
                          </button>
                          <button className="search-icon-btn" onClick={() => handleDeleteProduct(p.id)} style={{ color: '#ef4444' }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {showProductScanner && (
              <BarcodeScanner 
                onScan={(code) => {
                  setProductForm(prev => ({ ...prev, barcode: code }));
                  setShowProductScanner(false);
                }} 
                onClose={() => setShowProductScanner(false)} 
              />
            )}
          </div>
        )}

        {/* 2. CUSTOMERS TAB */}
        {activeTab === 'customers' && (
          <div className="admin-panel-card" style={{ overflowX: 'auto' }}>
            <div className="admin-panel-title">Lista de Clientes Registrados</div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Socio Club ID</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Dirección</th>
                  <th>Puntos Acumulados</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: '700' }}>{c.cardId}</td>
                    <td style={{ fontWeight: '600' }}>{c.name}</td>
                    <td>{c.email}</td>
                    <td>{c.phone || 'N/A'}</td>
                    <td>{c.address || 'N/A'}</td>
                    <td style={{ fontSize: '15px', fontWeight: '800', color: 'var(--primary-gold-dark)' }}>
                      {c.points} pts
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="add-to-cart-btn" 
                        style={{ width: 'auto', padding: '6px 12px', fontSize: '11px', backgroundColor: 'var(--primary-gold)', color: 'var(--dark-text)' }}
                        onClick={() => {
                          setPointsAdjustment({ customerId: c.id, customerName: c.name, delta: '', reason: 'Ajuste administrativo' });
                          setShowPointsModal(true);
                        }}
                      >
                        Ajustar Puntos
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {showPointsModal && (
              <div className="modal-backdrop" style={{ zIndex: 800 }}>
                <div className="modal-content" style={{ maxWidth: '400px' }}>
                  <div className="modal-header">
                    <h3>Ajustar Puntos de Fidelidad</h3>
                    <button className="cart-close-btn" onClick={() => setShowPointsModal(false)}>X</button>
                  </div>
                  <form onSubmit={handleAdjustPointsSubmit} className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <p style={{ fontSize: '13px' }}>
                      Cliente: <strong>{pointsAdjustment.customerName}</strong>
                    </p>
                    <div className="form-group">
                      <label className="form-label">Variación de Puntos (Positivo o Negativo)</label>
                      <input type="number" className="form-input" required placeholder="Ej: 500 o -200" value={pointsAdjustment.delta} onChange={e => setPointsAdjustment({...pointsAdjustment, delta: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Concepto/Motivo</label>
                      <input type="text" className="form-input" required value={pointsAdjustment.reason} onChange={e => setPointsAdjustment({...pointsAdjustment, reason: e.target.value})} />
                    </div>
                    <button type="submit" className="add-to-cart-btn" style={{ marginTop: '8px' }}>
                      Guardar Ajuste
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. DELIVERIES TAB */}
        {activeTab === 'orders' && (
          <div className="admin-panel-card" style={{ overflowX: 'auto' }}>
            <div className="admin-panel-title">Control de Pedidos e Historial de Envíos</div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>N° Pedido</th>
                  <th>Cliente</th>
                  <th>Productos</th>
                  <th>Dirección de Entrega</th>
                  <th>Total Facturado</th>
                  <th>Fecha</th>
                  <th>Estado del Envío</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: '700', color: 'var(--primary-red)' }}>
                      #{o.id.substring(2, 8).toUpperCase()}
                    </td>
                    <td style={{ fontWeight: '600' }}>
                      {o.customerName}
                      <div style={{ fontSize: '10px', color: 'var(--light-text)' }}>Tel: {o.deliveryPhone}</div>
                    </td>
                    <td>
                      <ul style={{ listStyle: 'none', paddingLeft: 0, fontSize: '12px' }}>
                        {o.items.map((it, idx) => (
                          <li key={idx}>• {it.qty}x {it.name}</li>
                        ))}
                      </ul>
                    </td>
                    <td>{o.deliveryAddress}</td>
                    <td style={{ fontWeight: '800' }}>${o.total}</td>
                    <td>{new Date(o.date).toLocaleDateString('es-AR')}</td>
                    <td>
                      <select 
                        value={o.status}
                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                        style={{
                          padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)',
                          fontSize: '12px', fontWeight: '700', outline: 'none'
                        }}
                      >
                        <option value="Pendiente">Pendiente</option>
                        <option value="En Preparación">En Preparación</option>
                        <option value="En Camino">En Camino</option>
                        <option value="Entregado">Entregado</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. REWARDS CRUD TAB */}
        {activeTab === 'rewards' && (
          <div>
            <div className="admin-panel-card">
              <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                {isEditingReward ? 'Editar Premio' : 'Cargar Nuevo Premio en el Catálogo'}
              </h3>
              
              <form onSubmit={handleRewardSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Nombre del Premio</label>
                    <input type="text" className="form-input" required value={rewardForm.name} onChange={e => setRewardForm({...rewardForm, name: e.target.value})} placeholder="Ej: Pava Eléctrica Peabody" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Puntos Requeridos para el Canje</label>
                    <input type="number" className="form-input" required value={rewardForm.pointsPrice} onChange={e => setRewardForm({...rewardForm, pointsPrice: e.target.value})} placeholder="1500" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Descripción del Premio</label>
                  <textarea className="form-input" rows="2" required value={rewardForm.description} onChange={e => setRewardForm({...rewardForm, description: e.target.value})} placeholder="Detalles de la marca, características principales..." style={{ resize: 'none' }}></textarea>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Stock del Premio</label>
                    <input type="number" className="form-input" required value={rewardForm.stock} onChange={e => setRewardForm({...rewardForm, stock: e.target.value})} placeholder="10" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">URL de Imagen del Premio</label>
                    <input type="text" className="form-input" value={rewardForm.image} onChange={e => setRewardForm({...rewardForm, image: e.target.value})} placeholder="https://unsplash..." />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignSelf: 'flex-end', marginTop: '8px' }}>
                  {isEditingReward && (
                    <button type="button" className="add-to-cart-btn" onClick={resetRewardForm} style={{ backgroundColor: '#94a3b8' }}>
                      Cancelar
                    </button>
                  )}
                  <button type="submit" className="add-to-cart-btn" style={{ width: 'auto', padding: '10px 30px' }}>
                    Guardar Premio
                  </button>
                </div>
              </form>
            </div>

            <div className="admin-panel-card" style={{ overflowX: 'auto' }}>
              <div className="admin-panel-title">Listado de Premios Cargados</div>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Premio</th>
                    <th>Puntos de Canje</th>
                    <th>Stock</th>
                    <th style={{ textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {rewards.map(r => (
                    <tr key={r.id}>
                      <td style={{ fontWeight: '600' }}>{r.name}</td>
                      <td style={{ fontWeight: '800', color: 'var(--primary-gold-dark)' }}>{r.pointsPrice} pts</td>
                      <td style={{ fontWeight: '700', color: r.stock < 3 ? '#ef4444' : 'inherit' }}>{r.stock}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button className="search-icon-btn" onClick={() => handleEditRewardClick(r)}>
                            <Edit2 size={14} />
                          </button>
                          <button className="search-icon-btn" onClick={() => handleDeleteReward(r.id)} style={{ color: '#ef4444' }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. CAMPAIGNS TAB */}
        {activeTab === 'campaigns' && (
          <div className="admin-panel-card" style={{ maxWidth: '600px' }}>
            <div className="admin-panel-title">Notificaciones Push de Ofertas en Vivo</div>
            <p style={{ fontSize: '13px', color: 'var(--light-text)', marginBottom: '20px' }}>
              Envía ofertas instantáneas a todos los clientes que estén navegando en el sitio. Esto disparará un aviso de audio y una alerta visual interactiva inmediatamente.
            </p>
            <form onSubmit={handleBroadcastPush} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Título de la Alerta</label>
                <input type="text" className="form-input" required value={pushCampaign.title} onChange={e => setPushCampaign({...pushCampaign, title: e.target.value})} placeholder="Ej: 🔥 Oferta Relámpago" />
              </div>
              <div className="form-group">
                <label className="form-label">Mensaje / Detalle de la Oferta</label>
                <textarea className="form-input" rows="3" required value={pushCampaign.body} onChange={e => setPushCampaign({...pushCampaign, body: e.target.value})} placeholder="Detalles de la oferta..." style={{ resize: 'none' }}></textarea>
              </div>
              <button type="submit" className="add-to-cart-btn" style={{ alignSelf: 'flex-start', width: 'auto', padding: '12px 24px' }}>
                Transmitir Notificación Push
              </button>
            </form>
          </div>
        )}

        {/* 6. FIREBASE SETTINGS CONFIG TAB */}
        {activeTab === 'firebase' && (
          <div className="admin-panel-card" style={{ maxWidth: '600px' }}>
            <div className="admin-panel-title">
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Key size={20} /> Conexión de Base de Datos Firebase</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--light-text)', marginBottom: '20px' }}>
              Por defecto la aplicación funciona en modo **LocalStorage (Fidelity Mock DB)**. Si tenés un proyecto de Firebase creado, ingresá tus claves para sincronizar la base de datos real en la nube.
            </p>
            <form onSubmit={handleFirebaseSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">API Key</label>
                <input type="text" className="form-input" value={firebaseConfig.apiKey} onChange={e => setFirebaseConfig({...firebaseConfig, apiKey: e.target.value})} placeholder="AIzaSy..." />
              </div>
              <div className="form-group">
                <label className="form-label">Auth Domain</label>
                <input type="text" className="form-input" value={firebaseConfig.authDomain} onChange={e => setFirebaseConfig({...firebaseConfig, authDomain: e.target.value})} placeholder="proyecto.firebaseapp.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Project ID</label>
                <input type="text" className="form-input" value={firebaseConfig.projectId} onChange={e => setFirebaseConfig({...firebaseConfig, projectId: e.target.value})} placeholder="proyecto-id" />
              </div>
              <div className="form-group">
                <label className="form-label">App ID</label>
                <input type="text" className="form-input" value={firebaseConfig.appId} onChange={e => setFirebaseConfig({...firebaseConfig, appId: e.target.value})} placeholder="1:123456789:web:abcd1234" />
              </div>
              <button type="submit" className="add-to-cart-btn" style={{ alignSelf: 'flex-start', width: 'auto', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isConfigSaved ? <Check size={16} /> : null}
                {isConfigSaved ? 'Configuración Guardada' : 'Guardar y Vincular Firebase'}
              </button>
            </form>
          </div>
        )}

      </main>
    </div>
  );
}
