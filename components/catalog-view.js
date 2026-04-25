'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMemo, useState } from 'react';

function money(value) {
  return new Intl.NumberFormat('es-NI', {
    style: 'currency',
    currency: 'NIO',
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
    .format(value || 0)
    .replace('NIO', 'C$');
}

const CATEGORY_COLORS = [
  'linear-gradient(135deg, #111111 0%, #3d3d3d 100%)',
  'linear-gradient(135deg, #f3c623 0%, #f8de72 100%)',
  'linear-gradient(135deg, #f4eee5 0%, #e0c8a8 100%)',
  'linear-gradient(135deg, #9f7aea 0%, #f0abfc 100%)',
  'linear-gradient(135deg, #38bdf8 0%, #0f766e 100%)',
  'linear-gradient(135deg, #fb7185 0%, #f97316 100%)'
];

function getCategoryStyle(category, index, isActive) {
  if (category === 'Todas') {
    return {
      background: isActive
        ? 'linear-gradient(135deg, #111111 0%, #3d3d3d 100%)'
        : 'linear-gradient(135deg, #fffdf8 0%, #f4eee5 100%)'
    };
  }

  return {
    background: CATEGORY_COLORS[index % CATEGORY_COLORS.length]
  };
}

export default function CatalogView({ products, categories }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todas');
  const [sortBy, setSortBy] = useState('featured');

  const categoryOptions = useMemo(() => ['Todas', ...categories], [categories]);

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
        nextProducts = [...nextProducts].sort((a, b) => (a.price || Number.MAX_SAFE_INTEGER) - (b.price || Number.MAX_SAFE_INTEGER));
        break;
      case 'price-desc':
        nextProducts = [...nextProducts].sort((a, b) => (b.price || 0) - (a.price || 0));
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
      <div className="category-spheres" aria-label="Categorías del catálogo">
        {categoryOptions.map((item, index) => {
          const isActive = category === item;

          return (
            <button
              type="button"
              className={`category-sphere ${isActive ? 'is-active' : ''}`}
              key={item}
              onClick={() => setCategory(item)}
              aria-pressed={isActive}
            >
              <span
                className="category-sphere-dot"
                style={getCategoryStyle(item, index, isActive)}
                aria-hidden="true"
              />
              <span className="category-sphere-label">{item}</span>
            </button>
          );
        })}
      </div>

      <div className="catalog-toolbar">
        <input
          className="input"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por nombre, color o departamento"
        />

        <select className="select" value={category} onChange={(event) => setCategory(event.target.value)}>
          {categoryOptions.map((item) => (
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
          {filteredProducts.map((product) => {
            const isAvailable = !product.isComingSoon && product.totalInventory >= 3;
            const isLowStock = !product.isComingSoon && product.totalInventory > 0 && product.totalInventory < 3;

            return (
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
                  {product.isComingSoon ? (
                    <div className="badges-row">
                      <span className="badge badge-coming-soon">Próximamente</span>
                    </div>
                  ) : null}

                  <h3 className="product-title">{product.name}</h3>

                  {product.colors?.length ? (
                    <div className="swatches-inline" aria-label={`Colores disponibles para ${product.name}`}>
                      {product.colors.slice(0, 5).map((color) => (
                        <span className="mini-swatch" key={color.key} title={color.name}>
                          <span
                            className={`mini-swatch-dot ${!color.hex ? 'is-neutral' : ''}`}
                            style={{ backgroundColor: color.swatchColor }}
                            aria-hidden="true"
                          />
                        </span>
                      ))}
                      {product.colors.length > 5 ? <span className="more-colors">+{product.colors.length - 5}</span> : null}
                    </div>
                  ) : null}

                  {!product.isComingSoon ? (
                    <div className="price-line">
                      <span className="price">{money(product.price)}</span>
                      {product.compareAtPrice ? (
                        <span className="price-compare">{money(product.compareAtPrice)}</span>
                      ) : null}
                    </div>
                  ) : (
                    <p className="coming-soon-text">Muy pronto disponible.</p>
                  )}

                  {!product.isComingSoon ? <div className="muted">Tallas: {product.sizes.join(', ')}</div> : null}

                  <div className="product-card-footer">
                    <span className="cta cta-secondary">Ver</span>

                    {isAvailable ? (
                      <span className="stock-state stock-state-ok">Disponible</span>
                    ) : null}

                    {isLowStock ? (
                      <span className="stock-state stock-state-low">Quedan pocas unidades</span>
                    ) : null}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          No encontramos productos con esos filtros. Prueba con otra búsqueda o categoría.
        </div>
      )}
    </>
  );
}
