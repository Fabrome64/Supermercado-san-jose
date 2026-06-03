import React, { useState } from 'react';
import ProductCard from './ProductCard';

export default function ProductGrid({ 
  products, 
  onAddToCart, 
  isSocio, 
  searchQuery, 
  selectedCategory 
}) {
  const [sortBy, setSortBy] = useState('featured'); // featured, price-asc, price-desc, name-asc

  // 1. Filter Products
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.barcode && product.barcode === searchQuery.trim());
      
    const matchesCategory = 
      selectedCategory === 'Todos' || 
      product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // 2. Sort Products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = isSocio ? a.clubPrice : a.price;
    const priceB = isSocio ? b.clubPrice : b.price;

    if (sortBy === 'price-asc') return priceA - priceB;
    if (sortBy === 'price-desc') return priceB - priceA;
    if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
    return 0; // Default featured (original order)
  });

  return (
    <div style={{ margin: '30px 0' }}>
      
      {/* GRID HEADER */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800' }}>
            {selectedCategory === 'Todos' ? 'Nuestros Productos' : selectedCategory}
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--light-text)' }}>
            Mostrando {sortedProducts.length} productos
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--light-text)' }}>
            Ordenar por:
          </label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            style={{ 
              padding: '6px 12px', 
              borderRadius: '6px', 
              border: '1px solid var(--border-color)',
              outline: 'none',
              fontSize: '13px',
              backgroundColor: '#fff'
            }}
          >
            <option value="featured">Destacados</option>
            <option value="price-asc">Menor Precio</option>
            <option value="price-desc">Mayor Precio</option>
            <option value="name-asc">Nombre A-Z</option>
          </select>
        </div>
      </div>

      {/* GRID DISPLAY */}
      {sortedProducts.length > 0 ? (
        <div className="grid-products">
          {sortedProducts.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onAddToCart={onAddToCart} 
              isSocio={isSocio} 
            />
          ))}
        </div>
      ) : (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px', 
          backgroundColor: '#fff', 
          borderRadius: '12px',
          border: '1px solid var(--border-color)'
        }}>
          <p style={{ fontSize: '16px', fontWeight: '600', color: 'var(--light-text)' }}>
            No encontramos productos para tu búsqueda o filtro.
          </p>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
            Probá buscando otra palabra o restableciendo las categorías.
          </p>
        </div>
      )}
    </div>
  );
}
