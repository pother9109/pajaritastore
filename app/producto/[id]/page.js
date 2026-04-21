import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getProductBySlug, getProducts } from '@/lib/products';

function money(value) {
  return new Intl.NumberFormat('es-NI', {
    style: 'currency',
    currency: 'USD'
  }).format(value || 0);
}

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ id: product.slug }));
}

export default async function ProductPage({ params }) {
  const product = await getProductBySlug(params.id);

  if (!product) {
    notFound();
  }

  return (
    <main className="pdp-shell">
      <div className="container">
        <Link href="/" className="pdp-back">
          ← Volver al catálogo
        </Link>

        <div className="pdp-grid">
          <section className="pdp-media">
            <div className="pdp-image-frame">
              <Image
                className="product-image"
                src={product.image}
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
                <span className="price">{money(product.price)}</span>
                {product.compareAtPrice ? (
                  <span className="price-compare">{money(product.compareAtPrice)}</span>
                ) : null}
              </div>
              <p className="muted">
                Precio principal: precio de venta.
                {product.compareAtPrice ? ' Precio tachado: precio de lista.' : ''}
              </p>
            </div>

            <div>
              <div className="eyebrow" style={{ marginBottom: 12 }}>Tallas disponibles</div>
              <div className="sizes">
                {product.sizes.map((size) => (
                  <div className="size-pill" key={size}>
                    {size}
                  </div>
                ))}
              </div>
            </div>

            <div className="info-card">
              <div className="eyebrow">Resumen</div>
              <p className="muted">Departamento: {product.department}</p>
              <p className="muted">SKU registrados: {product.skuIds.length}</p>
              <p className="muted">Tipo: {product.type}</p>
            </div>

            <button className="cta cta-primary">Consultar por WhatsApp</button>
          </section>
        </div>
      </div>
    </main>
  );
}
