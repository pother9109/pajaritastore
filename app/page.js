import CatalogView from '@/components/catalog-view';
import { getCatalogMeta, getProducts } from '@/lib/products';

export default async function HomePage() {
  const [products, meta] = await Promise.all([getProducts(), getCatalogMeta()]);

  return (
    <main>
      <section className="hero">
        <div className="container">
          <div className="fashion-banner">
            <div className="fashion-banner-content">
              <p className="fashion-eyebrow">Nuevos</p>
              <h1 className="fashion-title">Looks que te encantarán</h1>
              <p className="fashion-description">
                Tu estilo global, ahora más cerca. Moda premium disponible para entregas en Managua.
              </p>
              <a href="#catalogo" className="fashion-button">
                Ver novedades
              </a>
            </div>

            <div className="fashion-banner-image" aria-hidden="true" />
          </div>

          <p className="catalog-note">
            Catálogo disponible con {meta.totalProducts} productos seleccionados.
          </p>
        </div>
      </section>

      <section id="catalogo" className="catalog-section">
        <div className="container">
          <CatalogView products={products} categories={meta.categories} />
        </div>
      </section>
    </main>
  );
}
