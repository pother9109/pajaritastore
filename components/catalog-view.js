'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMemo, useState } from 'react';

function money(value) {
  return new Intl.NumberFormat('es-NI', {
    style: 'currency',
    currency: 'USD'
  }).format(value || 0);
}

export default function CatalogView({ products, categories }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todas');
  const [sortBy, setSortBy] = useState('featured');

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    let nextProducts = products.filter((product) => {
      const matchesCategory = category === 'Todas' || product.category === category;
      const matchesSearch =
        !term ||
        product.name.toLowerCase().includes(term) ||
        product.department.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term) ||
        product.colors.some((color) => color.name.toLowerCase().includes(term));

      return matchesCategory && matchesSearch;
    });

    switch (sortBy) {
      case 'price-asc':
        nextProducts = [...nextProducts].sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        nextProducts = [...nextProducts].sort((a, b) => b.price - a.price);
        break;
      case 'name':
        nextProducts = [...nextProducts].sort((a, b) => a.name.localeCompare(b.name, 'es'));
        break;
      default:
        nextProducts = [...nextProducts];
        break;
    }

    return nextProducts;
  }, [products, search, category, sortBy]);

  return (
    <>
      <div className="catalog-toolbar">
        <input
          className="input"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por nombre, categoría, color o departamento"
        />

        <select className="select" value={category} onChange={(event) => setCategory(event.target.value)}>
          <option>Todas</option>
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select className="select" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
          <option value="featured">Ordenar: destacados</option>
          <option value="name">Nombre A-Z</option>
          <option value="price-asc">Precio: menor a mayor</option>
          <option value="price-desc">Precio: mayor a menor</option>
        </select>
      </div>

      {filteredProducts.length ? (
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <Link href={`/producto/${product.slug}`} className="product-card" key={product.slug}>
              <div className="product-image-wrap">
                <Image
                  className="product-image"
                  src={product.image}
                  alt={product.name}
                  width={900}
                  height={900}
                  sizes="(max-width: 640px) 100vw, (max-width: 980px) 50vw, 25vw"
                />
              </div>

              <div className="product-content">
                <div className="badges-row">
                  {product.badges.slice(0, 2).map((badge) => (
                    <span className="badge" key={badge}>
                      {badge}
                    </span>
                  ))}
                  {product.hasLowStock ? <span className="badge badge-warning">Pocas unidades</span> : null}
                </div>

                <h3 className="product-title">{product.name}</h3>

                <div className="swatches-inline" aria-label="Colores disponibles">
                  {product.colors.slice(0, 5).map((color) => (
                    <span className="mini-swatch" key={color.key} title={color.name}>
                      <span
                        className={`mini-swatch-dot ${!color.hex ? 'is-neutral' : ''}`}
                        style={{ backgroundColor: color.swatchColor }}
                      />
                    </span>
                  ))}
                  {product.colors.length > 5 ? <span className="more-colors">+{product.colors.length - 5}</span> : null}
                </div>

                <div className="product-meta">
                  <div>
                    <div className="price-line">
                      <span className="price">{money(product.price)}</span>
                      {product.compareAtPrice ? (
                        <span className="price-compare">{money(product.compareAtPrice)}</span>
                      ) : null}
                    </div>
                    <div className="muted">Tallas: {product.sizes.join(', ')}</div>
                  </div>

                  <span className="cta cta-secondary">Ver</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          No encontramos productos con esos filtros. Prueba con otra búsqueda o categoría.
        </div>
      )}
    </>
  );
}
