import Link from 'next/link';
import { notFound } from 'next/navigation';
import ProductDetailView from '@/components/product-detail-view';
import { getProductBySlug, getProducts } from '@/lib/products';

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

        <ProductDetailView product={product} />
      </div>
    </main>
  );
}
