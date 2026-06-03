import React from 'react';
import SliderBanner from '../components/SliderBanner';
import CategoryNav from '../components/CategoryNav';
import ProductGrid from '../components/ProductGrid';

export default function Store({ 
  products, 
  onAddToCart, 
  isSocio, 
  searchQuery, 
  selectedCategory, 
  setSelectedCategory,
  onLoginClick
}) {
  const handleBannerAction = (bannerId) => {
    if (bannerId === 1) {
      // Socios banner
      onLoginClick();
    } else if (bannerId === 2) {
      // Yerba mate banner, search for yerba
      window.scrollTo({ top: 500, behavior: 'smooth' });
    } else {
      // Envios banner
      alert('Hacemos repartos de Lunes a Sábados de 09:00 a 20:00. ¡El envío es gratis para compras mayores a $15.000!');
    }
  };

  return (
    <main className="container" style={{ paddingBottom: '60px' }}>
      {/* Slider Banner */}
      <SliderBanner onActionClick={handleBannerAction} />

      {/* Category Nav Filter */}
      <CategoryNav 
        selectedCategory={selectedCategory} 
        setSelectedCategory={setSelectedCategory} 
      />

      {/* Product Grid */}
      <ProductGrid 
        products={products} 
        onAddToCart={onAddToCart} 
        isSocio={isSocio} 
        searchQuery={searchQuery} 
        selectedCategory={selectedCategory} 
      />
    </main>
  );
}
