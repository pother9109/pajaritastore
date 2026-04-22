'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';

function money(value) {
  return new Intl.NumberFormat('es-NI', {
    style: 'currency',
    currency: 'USD'
  }).format(value || 0);
}

function buildWhatsappLink(product, variant) {
  const lines = [
    'Hola, estoy interesado en este producto:',
    '',
    `• Producto: ${product.name}`,
    `• Color: ${variant?.colorName || 'Por confirmar'}`,
    `• Talla: ${variant?.size || 'Por confirmar'}`,
    `• Precio: ${money(variant?.price || product.price)}`
  ];

  return `https://wa.me/50586581794?text=${encodeURIComponent(lines.join('\n'))}`;
}

export default function ProductDetailView({ product }) {
  const initialColorKey = product.colors[0]?.key || product.variants[0]?.colorKey || '';
  const [selectedColor, setSelectedColor] = useState(initialColorKey);
  const [selectedSize, setSelectedSize] = useState('');

  const colorVariants = useMemo(
    () => product.variants.filter((variant) => variant.colorKey === selectedColor),
    [product.variants, selectedColor]
  );

  useEffect(() => {
    const firstAvailable = colorVariants.find((variant) => variant.inventory > 0) || colorVariants[0];
    setSelectedSize(firstAvailable?.size || '');
  }, [colorVariants]);

  const currentVariant =
    colorVariants.find((variant) => variant.size === selectedSize) || colorVariants[0] || product.variants[0];

  const stockMessage =
    currentVariant?.inventory < 1
      ? 'Agotado'
      : currentVariant?.inventory < 3
        ? 'Quedan pocas unidades'
        : `${currentVariant?.inventory || 0} unidades disponibles`;

  const stockTone = currentVariant?.inventory < 1 ? 'is-out' : currentVariant?.inventory < 3 ? 'is-low' : 'is-ok';

  return (
    <div className="pdp-grid">
      <section className="pdp-media">
        <div className="pdp-image-frame">
          <Image
            className="product-image"
            src={currentVariant?.image || product.image}
            alt={product.name}
            width={1200}
            height={1200}
            priority
          />
        </div>
      </section>

      <section className="pdp-info">
        <div>
          <div className="eyebrow">{product.category}</div>
          <h1 className="pdp-title">{product.name}</h1>
          <p className="muted">{product.description}</p>
        </div>

        <div>
          <div className="price-line">
            <span className="price">{money(currentVariant?.price || product.price)}</span>
            {currentVariant?.compareAtPrice || product.compareAtPrice ? (
              <span className="price-compare">{money(currentVariant?.compareAtPrice || product.compareAtPrice)}</span>
            ) : null}
          </div>
          <p className="muted">
            Precio principal: precio de venta.
            {currentVariant?.compareAtPrice || product.compareAtPrice ? ' Precio tachado: precio de lista.' : ''}
          </p>
        </div>

        <div className="selector-block">
          <div className="selector-head">
            <div className="eyebrow">Color</div>
            <div className="selector-value">{currentVariant?.colorName || 'Por confirmar'}</div>
          </div>
          <div className="swatches-grid">
            {product.colors.map((color) => (
              <button
                key={color.key}
                type="button"
                className={`swatch-chip ${selectedColor === color.key ? 'is-selected' : ''}`}
                onClick={() => setSelectedColor(color.key)}
              >
                <span
                  className={`swatch-dot ${!color.hex ? 'is-neutral' : ''}`}
                  style={{ backgroundColor: color.swatchColor }}
                  aria-hidden="true"
                />
                <span>{color.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="selector-block">
          <div className="selector-head">
            <div className="eyebrow">Talla</div>
            <div className="selector-value">{selectedSize || 'Por confirmar'}</div>
          </div>
          <div className="sizes">
            {colorVariants.map((variant) => (
              <button
                key={`${variant.colorKey}-${variant.size}`}
                type="button"
                className={`size-pill ${selectedSize === variant.size ? 'is-selected' : ''}`}
                onClick={() => setSelectedSize(variant.size)}
                disabled={variant.inventory < 1}
              >
                {variant.size}
              </button>
            ))}
          </div>
        </div>

        <div className="info-card">
          <div className="eyebrow">Disponibilidad</div>
          <div className={`stock-status ${stockTone}`}>{stockMessage}</div>
          {currentVariant?.inventory > 0 ? (
            <p className="muted">Unidades disponibles: {currentVariant.inventory}</p>
          ) : (
            <p className="muted">Consulta disponibilidad de reposición por WhatsApp.</p>
          )}
        </div>

        <div className="info-card compact-card">
          <div className="eyebrow">Resumen</div>
          <p className="muted">Departamento: {product.department}</p>
          <p className="muted">SKU registrados: {product.skuIds.length}</p>
          <p className="muted">Tipo: {product.type}</p>
        </div>

        <a
          href={buildWhatsappLink(product, currentVariant)}
          target="_blank"
          rel="noopener noreferrer"
          className="whatsapp-btn"
        >
          Consultar por WhatsApp
        </a>
      </section>
    </div>
  );
}
