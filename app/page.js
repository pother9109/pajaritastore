import CatalogView from '@/components/catalog-view';
import { getCatalogMeta, getProducts } from '@/lib/products';

const LOGO_URL = 'https://i.postimg.cc/XVRJ4dVn/pajaritastore.png';

export default async function HomePage() {
  const [products, meta] = await Promise.all([getProducts(), getCatalogMeta()]);

  return (
    <main>
      <section className="hero">
        <div className="container">
          <div className="hero-card">
            <div className="brand-header">
              <div className="brand-title-wrap">
                <img
                  src={LOGO_URL}
                  alt="Logo Pajarita Store"
                  width="76"
                  height="76"
                  className="brand-logo"
                />
                <h1 className="brand-title">Pajarita Store</h1>
              </div>

              <div className="brand-description">
                <p>Tu estilo global, ahora más cerca ✨</p>
                <p>
                  Curamos lo mejor de las tendencias internacionales para traer
                  piezas exclusivas que resaltan tu esencia.
                </p>
                <p>📍 Disponible para entregas en Managua</p>
                <p>💎 Moda premium a tu alcance</p>
              </div>
            </div>

            <div className="stats-row">
              <div className="stat-card">
                <div className="stat-label">Productos visibles</div>
                <div className="stat-value">{meta.totalProducts}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Categorías</div>
                <div className="stat-value">{meta.totalCategories}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Experiencia</div>
                <div className="stat-value">Responsive</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="catalog-section">
        <div className="container">
          <CatalogView products={products} categories={meta.categories} />
        </div>
      </section>
    </main>
  );
}
