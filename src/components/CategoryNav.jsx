import React from 'react';

const CATEGORIES = [
  'Todos',
  'Almacén',
  'Frescos',
  'Bebidas',
  'Limpieza',
  'Fiambrería',
  'Bazar',
  'Mascotas',
  'Vinoteca',
  'Blanquería',
  'Camping'
];


export default function CategoryNav({ selectedCategory, setSelectedCategory }) {
  return (
    <div className="category-nav">
      <div className="container">
        <ul className="category-nav-list">
          {CATEGORIES.map(category => (
            <li key={category}>
              <button 
                className={`category-nav-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
