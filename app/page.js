import CatalogView from '@/components/catalog-view';
import { getCatalogMeta, getProducts } from '@/lib/products';

const LOGO_URL = 'https://i.postimg.cc/XVRJ4dVn/pajaritastore.png';

export default async function HomePage() {
  const [products, meta] = await Promise.all([getProducts(), getCatalogMeta()]);

  return (
    <main>
		<div className="hero-card hero-card-with-bg">
		  <div className="hero-bg-image" />
		  <div className="hero-bg-fade" />

		  <div className="brand-header hero-content">
			<div className="brand-title-wrap">
			  <img
				src="/logo.png"
				alt="Logo Pajarita Store"
				className="brand-logo"
			  />
			  <h1 className="brand-title">Pajarita Store</h1>
			</div>

			<div className="brand-description">
			  <p>Tu estilo global, ahora más cerca ✨</p>
			  <p>
				Curamos lo mejor de las tendencias internacionales para traer piezas
				exclusivas que resaltan tu esencia.
			  </p>
			  <p>📍 Disponible para entregas en Managua</p>
			  <p>💎 Moda premium a tu alcance</p>
			</div>

			<p className="catalog-note">
			  Catálogo disponible con {meta.totalProducts} productos seleccionados.
			</p>
		  </div>
		</div>
	  
	  <section className="catalog-section">
        <div className="container">
          <CatalogView products={products} categories={meta.categories} />
        </div>
      </section>
    </main>
  );
}
