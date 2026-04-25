'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';

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

function buildWhatsappLink(product, variant, selectedSize) {
  const sizeLabel = selectedSize || variant?.size || 'Por confirmar';

  const lines = product.isComingSoon
    ? [
        'Hola, me interesa este producto y quisiera saber cuándo estará disponible:',
        '',
        `Producto: ${product.name}`,
        `Color: ${variant?.colorName || 'Por confirmar'}`,
        `Talla: ${sizeLabel}`
      ]
    : [
        'Hola, estoy interesado en este producto:',
        '',
        `Producto: ${product.name}`,
        `Color: ${variant?.colorName || 'Por confirmar'}`,
        `Talla: ${sizeLabel}`,
        `Precio: ${money(variant?.price || product.price)}`
      ];

  return `https://wa.me/50586581794?text=${encodeURIComponent(lines.join('\n'))}`;
}

export default function ProductDetailView({ product }) {
  const initialColorKey = product.colors[0]?.key || product.variants[0]?.colorKey || '';
  const [selectedColor, setSelectedColor] = useState(initialColorKey);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedImage, setSelectedImage] = useState(product.image);

  const colorVariants = useMemo(
    () => product.variants.filter((variant) => variant.colorKey === selectedColor),
    [product.variants, selectedColor]
  );

  useEffect(() => {
    setSelectedSize('');
  }, [selectedColor]);

  const currentVariant =
    colorVariants.find((variant) => variant.size === selectedSize) || colorVariants[0] || product.variants[0];

  const galleryImages = useMemo(() => {
    if (currentVariant?.images?.length) return currentVariant.images;
    if (product.images?.length) return product.images;
    return [product.image];
  }, [currentVariant, product.images, product.image]);

  useEffect(() => {
    setSelectedImage(galleryImages[0] || product.image);
  }, [galleryImages, product.image]);

  const stockMessage = product.isComingSoon
    ? 'Próximamente'
    : !selectedSize
      ? 'Selecciona una talla para confirmar disponibilidad'
      : currentVariant?.inventory < 1
        ? 'Agotado'
        : currentVariant?.inventory < 3
          ? 'Quedan pocas unidades'
          : 'Disponible';

  const stockTone = product.isComingSoon
    ? 'is-coming'
    : !selectedSize
      ? 'is-pending'
      : currentVariant?.inventory < 1
        ? 'is-out'
        : currentVariant?.inventory < 3
          ? 'is-low'
          : 'is-ok';

  return (
    <div className="pdp-grid">
      <section className="pdp-media">
        <div className="pdp-image-frame">
          <Image
            className="product-image"
            src={selectedImage || currentVariant?.image || product.image}
            alt={product.name}
            width={1200}
            height={1200}
            priority
          />
        </div>

        {galleryImages.length > 1 ? (
          <div className="pdp-thumbs">
            {galleryImages.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                className={`thumb-button ${selectedImage === image ? 'is-selected' : ''}`}
                onClick={() => setSelectedImage(image)}
                aria-label={`Ver foto ${index + 1} de ${product.name}`}
              >
                <Image
                  className="thumb-image"
                  src={image}
                  alt={`${product.name} foto ${index + 1}`}
                  width={160}
                  height={160}
                />
              </button>
            ))}
          </div>
        ) : null}
      </section>

      <section className="pdp-info">
        <div className="pdp-header-block">
          <div className="eyebrow pdp-category">{product.category}</div>
          <h1 className="pdp-title">{product.name}</h1>
        </div>

        {product.isComingSoon ? (
          <div className="coming-soon-panel">
            <span className="coming-soon-badge">Próximamente</span>
            <h3>Este producto llegará muy pronto</h3>
            <p>
              Estamos preparando su disponibilidad. Si te interesa, escríbenos por WhatsApp y te avisamos cuando
              llegue.
            </p>
          </div>
        ) : (
          <div className="pdp-price-block">
            <div className="price-line">
              <span className="price pdp-price">{money(currentVariant?.price || product.price)}</span>
              {currentVariant?.compareAtPrice || product.compareAtPrice ? (
                <span className="price-compare">{money(currentVariant?.compareAtPrice || product.compareAtPrice)}</span>
              ) : null}
            </div>
          </div>
        )}

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
            <div className={`selector-value ${selectedSize ? 'is-selected-size' : 'needs-selection'}`}>
              {selectedSize ? `Seleccionada: ${selectedSize}` : 'Selecciona una talla'}
            </div>
          </div>
          <div className="sizes">
            {colorVariants.map((variant) => (
              <button
                key={`${variant.colorKey}-${variant.size}`}
                type="button"
                className={`size-pill ${selectedSize === variant.size ? 'is-selected' : ''}`}
                onClick={() => setSelectedSize(variant.size)}
                disabled={!product.isComingSoon && variant.inventory < 1}
              >
                {variant.size}
              </button>
            ))}
          </div>
        </div>

        <div className="info-card availability-card">
          <div className="eyebrow">Disponibilidad</div>
          <div className={`stock-status ${stockTone}`}>{stockMessage}</div>
          {product.isComingSoon ? (
            <p className="muted">Aún no mostramos precio ni inventario. Escríbenos y te avisamos cuando llegue.</p>
          ) : selectedSize && currentVariant?.inventory > 0 && currentVariant?.inventory < 3 ? (
            <p className="muted">Te recomendamos apartarlo pronto.</p>
          ) : selectedSize && currentVariant?.inventory > 0 ? (
            <p className="muted">Listo para consulta por WhatsApp.</p>
          ) : (
            <p className="muted">Elige una talla para confirmar disponibilidad antes de consultar.</p>
          )}
        </div>

        <a
          href={buildWhatsappLink(product, currentVariant, selectedSize)}
          target="_blank"
          rel="noopener noreferrer"
          className="whatsapp-btn"
        >
          {product.isComingSoon ? 'Avisarme cuando llegue' : 'Consultar por WhatsApp'}
        </a>
      </section>

      <section className="pdp-summary-section">
        <div className="pdp-summary-card">
          <h2 className="pdp-summary-title">Detalles que debes saber</h2>
          <div
            className="product-summary-html"
            dangerouslySetInnerHTML={{ __html: product.summary || product.description }}
          />
        </div>
      </section>
    </div>
  );
}
