import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Bot, User, ShoppingBag } from 'lucide-react';
import { db } from '../services/db';

export default function ChatBot({ customer }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'm1',
      sender: 'bot',
      text: '¡Hola! Soy SanJo, tu asistente del Supermercado San José. 🦸‍♂️\n¿En qué puedo ayudarte hoy?',
      date: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [products, setProducts] = useState([]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    // Load products list for searching stock
    db.getProducts().then(setProducts).catch(console.error);
  }, [isOpen]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    // Add user message
    const userMsg = {
      id: 'u_' + Date.now(),
      sender: 'user',
      text,
      date: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');

    // Generate bot reply
    setTimeout(() => {
      const reply = generateBotReply(text.toLowerCase());
      setMessages(prev => [...prev, {
        id: 'b_' + Date.now(),
        sender: 'bot',
        text: reply,
        date: new Date()
      }]);
    }, 600000 === 0 ? 0 : 500); // Small realistic delay
  };

  const generateBotReply = (input) => {
    // 1. Check for product query
    const keywords = ['leche', 'coca', 'yerba', 'mate', 'oreo', 'galletita', 'aceite', 'fideo', 'detergente', 'cerveza', 'queso', 'jabon', 'shampoo', 'producto', 'stock', 'precio', 'comida', 'bebida', 'limpieza'];
    
    // Find if user is asking for products in general or a specific one
    const matchedProducts = products.filter(p => 
      input.includes(p.name.toLowerCase()) || 
      input.includes(p.brand.toLowerCase()) || 
      input.includes(p.category.toLowerCase())
    );

    if (matchedProducts.length > 0) {
      let productReply = '¡Claro! Encontré estos productos en nuestro inventario:\n\n';
      matchedProducts.forEach(p => {
        productReply += `🛒 *${p.name}*\n` +
          `• Precio Normal: $${p.price}\n` +
          `• Socio Club San José: $${p.clubPrice} (¡Ahorrás $${p.price - p.clubPrice}!)\n` +
          `• Puntos que otorga: ${p.points} pts\n` +
          `• Stock actual: ${p.stock > 0 ? `${p.stock} unidades` : '🚫 Agotado'}\n\n`;
      });
      productReply += '¿Querés que busquemos algo más?';
      return productReply;
    }

    if (input.includes('buscar') || input.includes('tienen') || input.includes('hay')) {
      // General search query
      const searchTerms = input.replace('buscar', '').replace('tienen', '').replace('hay', '').replace('?', '').trim();
      if (searchTerms.length > 2) {
        const found = products.filter(p => p.name.toLowerCase().includes(searchTerms));
        if (found.length > 0) {
          let r = `Encontré los siguientes resultados para "${searchTerms}":\n\n`;
          found.slice(0, 3).forEach(p => {
            r += `• *${p.name}* (Socio Club: $${p.clubPrice}) - Stock: ${p.stock}\n`;
          });
          return r;
        } else {
          return `Lo siento, no logré encontrar ningún producto que coincida con "${searchTerms}". ¿Querés probar con otra palabra?`;
        }
      }
    }

    // 2. Club San José & Points Queries
    if (input.includes('punto') || input.includes('socio') || input.includes('fidelizacion') || input.includes('club') || input.includes('tarjeta') || input.includes('canje') || input.includes('premio')) {
      let response = '🌟 *Club San José y Fidelización*\n\n' +
        'Al ser socio del Club San José accedés a:\n' +
        '1. Precios exclusivos de oferta en la tienda.\n' +
        '2. Puntos por cada compra (acumulás 1 punto por cada $100 gastados en precio Club).\n' +
        '3. Canje de premios gratis desde tu portal.\n\n';

      if (customer) {
        response += `👤 *Tu Estado Actual:*\n` +
          `• Hola ${customer.name}\n` +
          `• Tarjeta Club N°: ${customer.cardId}\n` +
          `• Puntos Acumulados: ${customer.points} pts\n\n` +
          `¡Podés canjear tus puntos en la sección "Club San José" en la barra de navegación!`;
      } else {
        response += '🔑 *¿Querés ver tus puntos?* Registrate o inicia sesión en la parte superior derecha de la página.';
      }
      return response;
    }

    // 3. Store information (Schedule, delivery, location)
    if (input.includes('horario') || input.includes('abierto') || input.includes('cierra') || input.includes('abre')) {
      return '⏰ *Horarios de Atención:*\n\n' +
        '• Lunes a Sábados: 08:00 a 21:30 hs.\n' +
        '• Domingos y Feriados: 09:00 a 13:00 hs.\n\n' +
        '¡Te esperamos!';
    }

    if (input.includes('direccion') || input.includes('ubicacion') || input.includes('donde') || input.includes('queda') || input.includes('sucursal')) {
      return '📍 *Ubicación del Supermercado:*\n\n' +
        'Nuestra sucursal central se encuentra en:\n' +
        '**Av. Presidente Perón 2345, San José** (Buenos Aires).\n\n' +
        'Realizamos envíos a domicilio a un radio de 5km de la sucursal.';
    }

    if (input.includes('envio') || input.includes('reparto') || input.includes('delivery') || input.includes('pedido') || input.includes('demora')) {
      return '🚚 *Información de Envíos y Delivery:*\n\n' +
        '• El costo de envío general es de $800, y es gratis en compras mayores a $15.000.\n' +
        '• Los repartos se realizan de 09:00 a 20:00 hs.\n' +
        '• Una vez que hacés tu pedido, podés seguir el estado de entrega en tiempo real desde tu "Portal del Cliente".';
    }

    // 4. Default Greeting / Help
    return 'Entiendo. Decime, ¿te gustaría consultar sobre:\n\n' +
      '1. 🛒 *Stock y precio* de algún producto (ej: escribí "yerba")\n' +
      '2. 🌟 Tu saldo de *puntos* y Club San José\n' +
      '3. ⏰ *Horarios* y dirección de la sucursal\n' +
      '4. 🚚 Detalles de *envíos a domicilio*';
  };

  const handleQuickReply = (text) => {
    handleSend(text);
  };

  return (
    <div className="chatbot-container">
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <span className="chat-header-title">
              <Bot size={20} color="var(--primary-gold)" /> Asistente SanJo
            </span>
            <button className="cart-close-btn" onClick={() => setIsOpen(false)}>
              <X size={18} />
            </button>
          </div>
          
          <div className="chat-body">
            {messages.map(msg => (
              <div key={msg.id} className={`chat-msg ${msg.sender}`}>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '2px', fontSize: '10px', opacity: 0.7 }}>
                  {msg.sender === 'bot' ? <Bot size={12} /> : <User size={12} />}
                  <span>{msg.sender === 'bot' ? 'SanJo' : 'Tú'}</span>
                </div>
                <div style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div style={{ 
            display: 'flex', gap: '6px', padding: '8px', 
            backgroundColor: '#f8fafc', borderTop: '1px solid var(--border-color)', 
            flexWrap: 'wrap', justifyContent: 'center' 
          }}>
            <button 
              onClick={() => handleQuickReply('¿Cómo funciona el Club San José?')}
              style={{ fontSize: '10px', padding: '4px 8px', borderRadius: '12px', border: '1px solid var(--primary-red)', cursor: 'pointer', background: '#fff', color: 'var(--primary-red)', fontWeight: '600' }}
            >
              🌟 Club San José
            </button>
            <button 
              onClick={() => handleQuickReply('Buscar Leche')}
              style={{ fontSize: '10px', padding: '4px 8px', borderRadius: '12px', border: '1px solid var(--primary-red)', cursor: 'pointer', background: '#fff', color: 'var(--primary-red)', fontWeight: '600' }}
            >
              🥛 Buscar Leche
            </button>
            <button 
              onClick={() => handleQuickReply('¿Cuáles son los horarios de atención?')}
              style={{ fontSize: '10px', padding: '4px 8px', borderRadius: '12px', border: '1px solid var(--primary-red)', cursor: 'pointer', background: '#fff', color: 'var(--primary-red)', fontWeight: '600' }}
            >
              ⏰ Horarios
            </button>
          </div>

          <div className="chat-footer">
            <input 
              type="text" 
              className="chat-input" 
              placeholder="Pregúntame algo..."
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            <button className="chat-send-btn" onClick={() => handleSend()}>
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
      
      <button className="chatbot-bubble" onClick={() => setIsOpen(!isOpen)}>
        <MessageSquare size={26} />
      </button>
    </div>
  );
}
