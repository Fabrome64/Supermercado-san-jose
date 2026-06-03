import { isFirebaseEnabled, firestore } from './firebase';
import { 
  collection, doc, getDocs, getDoc, setDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy 
} from 'firebase/firestore';

// Initial Mock Seed Data
const DEFAULT_PRODUCTS = [
  { id: 'p1', name: 'Leche Entera La Serenísima 1L', brand: 'La Serenísima', category: 'Frescos', price: 1600, clubPrice: 1290, points: 15, barcode: '7790060023689', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', stock: 120 },
  { id: 'p2', name: 'Yerba Mate Taragüi 1kg', brand: 'Taragüi', category: 'Almacén', price: 3950, clubPrice: 3200, points: 40, barcode: '7790387000300', image: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', stock: 45 },
  { id: 'p3', name: 'Coca-Cola Sabor Original 2.25L', brand: 'Coca-Cola', category: 'Bebidas', price: 2800, clubPrice: 2400, points: 25, barcode: '7790070411124', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', stock: 80 },
  { id: 'p4', name: 'Galletitas Oreo 117g', brand: 'Oreo', category: 'Almacén', price: 1100, clubPrice: 890, points: 10, barcode: '7622300741400', image: 'https://images.unsplash.com/photo-1558961309-dbdf71791f5a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', stock: 200 },
  { id: 'p5', name: 'Aceite de Girasol Natura 1.5L', brand: 'Natura', category: 'Almacén', price: 3100, clubPrice: 2650, points: 30, barcode: '7790238002209', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', stock: 35 },
  { id: 'p6', name: 'Fideos Tallarín Lucchetti 500g', brand: 'Lucchetti', category: 'Almacén', price: 1200, clubPrice: 990, points: 12, barcode: '7790070318645', image: 'https://images.unsplash.com/photo-1612966608967-312ba5987236?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', stock: 150 },
  { id: 'p7', name: 'Detergente Ala Limón 750ml', brand: 'Ala', category: 'Limpieza', price: 1950, clubPrice: 1600, points: 20, barcode: '7790045151529', image: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', stock: 60 },
  { id: 'p8', name: 'Cerveza Patagonia IPA lata 473ml', brand: 'Patagonia', category: 'Bebidas', price: 1800, clubPrice: 1450, points: 18, barcode: '7792798007211', image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', stock: 90 },
  { id: 'p9', name: 'Queso Cremoso La Paulina 1kg', brand: 'La Paulina', category: 'Fiambrería', price: 7500, clubPrice: 6200, points: 75, barcode: '7790080012540', image: 'https://images.unsplash.com/photo-1486887396153-fa416526c13b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', stock: 25 },
  { id: 'p10', name: 'Jabón Líquido Ariel 3L', brand: 'Ariel', category: 'Limpieza', price: 8900, clubPrice: 7400, points: 90, barcode: '7791290790342', image: 'https://images.unsplash.com/photo-1610557892470-76d74cd1220d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', stock: 40 }
];

const DEFAULT_REWARDS = [
  { id: 'r1', name: 'Termo Tipo Stanley Lumilagro', pointsPrice: 4000, description: 'Termo de acero inoxidable de 1 litro de alta retención térmica.', image: 'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', stock: 15 },
  { id: 'r2', name: 'Set de Mate Completo San José', pointsPrice: 2500, description: 'Mate de vidrio templado forrado en cuero, bombilla de alpaca y yerbera.', image: 'https://images.unsplash.com/photo-1598516080345-56f8f5339f76?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', stock: 30 },
  { id: 'r3', name: 'Pava Eléctrica Premium', pointsPrice: 5500, description: 'Pava con regulador de temperatura ideal para mate y corte automático.', image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', stock: 10 },
  { id: 'r4', name: 'Bolsa Ecológica de Compras', pointsPrice: 150, description: 'Bolsa reutilizable reforzada con el logo del Supermercado San José.', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', stock: 500 },
  { id: 'r5', name: 'Voucher de Compra $10.000', pointsPrice: 3000, description: 'Orden de compra válida para cualquier producto de la tienda.', image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', stock: 100 }
];

const DEFAULT_CUSTOMERS = [
  { id: 'c1', email: 'cliente@sanjose.com', name: 'Juan Pérez', phone: '11 5555-5555', address: 'Av. Siempre Viva 742, CABA', cardId: '100204392', points: 1550, pin: '1234' },
  { id: 'c2', email: 'maria.gomez@gmail.com', name: 'María Gómez', phone: '11 6666-8888', address: 'Calle Falsa 123, San José', cardId: '100485920', points: 340, pin: '4321' }
];

const DEFAULT_ORDERS = [
  { id: 'o1', customerId: 'c1', customerName: 'Juan Pérez', items: [
    { productId: 'p1', name: 'Leche Entera La Serenísima 1L', qty: 2, price: 1290 },
    { productId: 'p3', name: 'Coca-Cola Sabor Original 2.25L', qty: 1, price: 2400 }
  ], total: 4980, pointsEarned: 50, date: '2026-06-02T16:30:00.000Z', deliveryAddress: 'Av. Siempre Viva 742, CABA', deliveryPhone: '11 5555-5555', deliveryType: 'delivery', status: 'Entregado' },
  { id: 'o2', customerId: 'c2', customerName: 'María Gómez', items: [
    { productId: 'p2', name: 'Yerba Mate Taragüi 1kg', qty: 1, price: 3200 },
    { productId: 'p5', name: 'Aceite de Girasol Natura 1.5L', qty: 1, price: 2650 }
  ], total: 5850, pointsEarned: 70, date: '2026-06-03T14:15:00.000Z', deliveryAddress: 'Calle Falsa 123, San José', deliveryPhone: '11 6666-8888', deliveryType: 'delivery', status: 'En Camino' }
];

// Helper to initialize local storage data
const initLocalStorage = () => {
  if (!localStorage.getItem('sanjose_products')) {
    localStorage.setItem('sanjose_products', JSON.stringify(DEFAULT_PRODUCTS));
  }
  if (!localStorage.getItem('sanjose_rewards')) {
    localStorage.setItem('sanjose_rewards', JSON.stringify(DEFAULT_REWARDS));
  }
  if (!localStorage.getItem('sanjose_customers')) {
    localStorage.setItem('sanjose_customers', JSON.stringify(DEFAULT_CUSTOMERS));
  }
  if (!localStorage.getItem('sanjose_orders')) {
    localStorage.setItem('sanjose_orders', JSON.stringify(DEFAULT_ORDERS));
  }
  if (!localStorage.getItem('sanjose_point_history')) {
    localStorage.setItem('sanjose_point_history', JSON.stringify([
      { id: 'h1', customerId: 'c1', points: 1550, type: 'compra', description: 'Acumulado por compra', date: '2026-06-02T16:30:00.000Z' },
      { id: 'h2', customerId: 'c2', points: 340, type: 'compra', description: 'Acumulado por compra', date: '2026-06-03T14:15:00.000Z' }
    ]));
  }
};

initLocalStorage();

// Standard interfaces fallback logic
export const db = {
  // PRODUCTS
  getProducts: async () => {
    if (isFirebaseEnabled) {
      try {
        const querySnapshot = await getDocs(collection(firestore, 'products'));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (e) {
        console.error('Firebase error, falling back to LocalStorage', e);
      }
    }
    return JSON.parse(localStorage.getItem('sanjose_products'));
  },

  saveProduct: async (product) => {
    if (isFirebaseEnabled) {
      try {
        const docRef = doc(firestore, 'products', product.id || String(Date.now()));
        const cleanProduct = { ...product };
        delete cleanProduct.id;
        await setDoc(docRef, cleanProduct);
        return { id: docRef.id, ...cleanProduct };
      } catch (e) {
        console.error('Firebase error, falling back to LocalStorage', e);
      }
    }
    const products = JSON.parse(localStorage.getItem('sanjose_products'));
    if (product.id) {
      const idx = products.findIndex(p => p.id === product.id);
      if (idx !== -1) products[idx] = product;
    } else {
      product.id = 'p_' + Date.now();
      products.push(product);
    }
    localStorage.setItem('sanjose_products', JSON.stringify(products));
    return product;
  },

  deleteProduct: async (id) => {
    if (isFirebaseEnabled) {
      try {
        await deleteDoc(doc(firestore, 'products', id));
        return true;
      } catch (e) {
        console.error('Firebase error, falling back to LocalStorage', e);
      }
    }
    let products = JSON.parse(localStorage.getItem('sanjose_products'));
    products = products.filter(p => p.id !== id);
    localStorage.setItem('sanjose_products', JSON.stringify(products));
    return true;
  },

  // CUSTOMERS
  getCustomers: async () => {
    if (isFirebaseEnabled) {
      try {
        const querySnapshot = await getDocs(collection(firestore, 'customers'));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (e) {
        console.error('Firebase error, falling back to LocalStorage', e);
      }
    }
    return JSON.parse(localStorage.getItem('sanjose_customers'));
  },

  saveCustomer: async (customer) => {
    if (isFirebaseEnabled) {
      try {
        const docRef = doc(firestore, 'customers', customer.id || String(Date.now()));
        const cleanCustomer = { ...customer };
        delete cleanCustomer.id;
        await setDoc(docRef, cleanCustomer);
        return { id: docRef.id, ...cleanCustomer };
      } catch (e) {
        console.error('Firebase error, falling back to LocalStorage', e);
      }
    }
    const customers = JSON.parse(localStorage.getItem('sanjose_customers'));
    if (customer.id) {
      const idx = customers.findIndex(c => c.id === customer.id);
      if (idx !== -1) customers[idx] = customer;
    } else {
      customer.id = 'c_' + Date.now();
      customer.cardId = String(Math.floor(100000000 + Math.random() * 900000000));
      customer.points = customer.points || 0;
      customers.push(customer);
    }
    localStorage.setItem('sanjose_customers', JSON.stringify(customers));
    return customer;
  },

  adjustCustomerPoints: async (customerId, pointsDelta, description) => {
    // 1. Update customer profile
    let currentCustomer = null;
    if (isFirebaseEnabled) {
      try {
        const docRef = doc(firestore, 'customers', customerId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const newPoints = (docSnap.data().points || 0) + pointsDelta;
          await updateDoc(docRef, { points: newPoints });
          currentCustomer = { id: customerId, ...docSnap.data(), points: newPoints };
        }
      } catch (e) {
        console.error('Firebase error, falling back to LocalStorage', e);
      }
    }
    
    // Fallback LocalStorage
    if (!currentCustomer) {
      const customers = JSON.parse(localStorage.getItem('sanjose_customers'));
      const idx = customers.findIndex(c => c.id === customerId);
      if (idx !== -1) {
        customers[idx].points = (customers[idx].points || 0) + pointsDelta;
        currentCustomer = customers[idx];
        localStorage.setItem('sanjose_customers', JSON.stringify(customers));
      }
    }

    // 2. Add to history
    if (currentCustomer) {
      const historyLog = {
        id: 'h_' + Date.now(),
        customerId,
        points: pointsDelta,
        type: pointsDelta > 0 ? 'credito' : 'debito',
        description,
        date: new Date().toISOString()
      };
      if (isFirebaseEnabled) {
        try {
          await addDoc(collection(firestore, 'point_history'), historyLog);
        } catch (e) {
          console.error(e);
        }
      }
      const history = JSON.parse(localStorage.getItem('sanjose_point_history')) || [];
      history.push(historyLog);
      localStorage.setItem('sanjose_point_history', JSON.stringify(history));
    }
    
    return currentCustomer;
  },

  getPointHistory: async (customerId) => {
    if (isFirebaseEnabled) {
      try {
        const q = query(collection(firestore, 'point_history'), where('customerId', '==', customerId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (e) {
        console.error('Firebase error, falling back to LocalStorage', e);
      }
    }
    const history = JSON.parse(localStorage.getItem('sanjose_point_history')) || [];
    return history.filter(h => h.customerId === customerId).sort((a,b) => new Date(b.date) - new Date(a.date));
  },

  // ORDERS
  getOrders: async () => {
    if (isFirebaseEnabled) {
      try {
        const querySnapshot = await getDocs(collection(firestore, 'orders'));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (e) {
        console.error('Firebase error, falling back to LocalStorage', e);
      }
    }
    const orders = JSON.parse(localStorage.getItem('sanjose_orders'));
    return orders.sort((a,b) => new Date(b.date) - new Date(a.date));
  },

  createOrder: async (order) => {
    order.id = 'o_' + Date.now();
    order.date = new Date().toISOString();
    order.status = 'Pendiente';

    if (isFirebaseEnabled) {
      try {
        await setDoc(doc(firestore, 'orders', order.id), order);
      } catch (e) {
        console.error('Firebase error, falling back to LocalStorage', e);
      }
    }

    const orders = JSON.parse(localStorage.getItem('sanjose_orders'));
    orders.push(order);
    localStorage.setItem('sanjose_orders', JSON.stringify(orders));

    // Accumulate customer points
    if (order.customerId) {
      await db.adjustCustomerPoints(
        order.customerId, 
        order.pointsEarned, 
        `Compra registrada en pedido #${order.id.substring(2, 8).toUpperCase()}`
      );
    }
    return order;
  },

  updateOrderStatus: async (orderId, status) => {
    let success = false;
    if (isFirebaseEnabled) {
      try {
        await updateDoc(doc(firestore, 'orders', orderId), { status });
        success = true;
      } catch (e) {
        console.error('Firebase error, falling back to LocalStorage', e);
      }
    }
    const orders = JSON.parse(localStorage.getItem('sanjose_orders'));
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx !== -1) {
      orders[idx].status = status;
      localStorage.setItem('sanjose_orders', JSON.stringify(orders));
      success = true;
    }
    return success;
  },

  // REWARDS
  getRewards: async () => {
    if (isFirebaseEnabled) {
      try {
        const querySnapshot = await getDocs(collection(firestore, 'rewards'));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (e) {
        console.error('Firebase error, falling back to LocalStorage', e);
      }
    }
    return JSON.parse(localStorage.getItem('sanjose_rewards'));
  },

  saveReward: async (reward) => {
    if (isFirebaseEnabled) {
      try {
        const docRef = doc(firestore, 'rewards', reward.id || String(Date.now()));
        const cleanReward = { ...reward };
        delete cleanReward.id;
        await setDoc(docRef, cleanReward);
        return { id: docRef.id, ...cleanReward };
      } catch (e) {
        console.error('Firebase error, falling back to LocalStorage', e);
      }
    }
    const rewards = JSON.parse(localStorage.getItem('sanjose_rewards'));
    if (reward.id) {
      const idx = rewards.findIndex(r => r.id === reward.id);
      if (idx !== -1) rewards[idx] = reward;
    } else {
      reward.id = 'r_' + Date.now();
      rewards.push(reward);
    }
    localStorage.setItem('sanjose_rewards', JSON.stringify(rewards));
    return reward;
  },

  deleteReward: async (id) => {
    if (isFirebaseEnabled) {
      try {
        await deleteDoc(doc(firestore, 'rewards', id));
        return true;
      } catch (e) {
        console.error('Firebase error, falling back to LocalStorage', e);
      }
    }
    let rewards = JSON.parse(localStorage.getItem('sanjose_rewards'));
    rewards = rewards.filter(r => r.id !== id);
    localStorage.setItem('sanjose_rewards', JSON.stringify(rewards));
    return true;
  },

  redeemReward: async (customerId, reward) => {
    // Deduct points
    const customer = await db.adjustCustomerPoints(
      customerId, 
      -reward.pointsPrice, 
      `Canje de premio: ${reward.name}`
    );

    if (customer) {
      // Add a simulated delivery order for the reward!
      const rewardOrder = {
        id: 'ro_' + Date.now(),
        customerId,
        customerName: customer.name,
        items: [{ productId: reward.id, name: `[PREMIO] ${reward.name}`, qty: 1, price: 0 }],
        total: 0,
        pointsEarned: 0,
        date: new Date().toISOString(),
        deliveryAddress: customer.address,
        deliveryPhone: customer.phone,
        deliveryType: 'delivery',
        status: 'Pendiente'
      };

      const orders = JSON.parse(localStorage.getItem('sanjose_orders'));
      orders.push(rewardOrder);
      localStorage.setItem('sanjose_orders', JSON.stringify(orders));

      // Subtract stock from reward item
      const rewards = JSON.parse(localStorage.getItem('sanjose_rewards'));
      const idx = rewards.findIndex(r => r.id === reward.id);
      if (idx !== -1 && rewards[idx].stock > 0) {
        rewards[idx].stock -= 1;
        localStorage.setItem('sanjose_rewards', JSON.stringify(rewards));
      }
      return { success: true, customer };
    }
    return { success: false, error: 'No se pudo completar el canje.' };
  }
};
