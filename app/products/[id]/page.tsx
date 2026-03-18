import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import pg from 'pg';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductImageGallery from '@/components/ProductImageGallery';
import ProductPageClient from '@/components/ProductPageClient';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

type Product = {
  id: number;
  name: string;
  price: string;
  regularPrice?: string | null;
  salePrice?: string | null;
  image: string;
  imageUrls?: string[] | null;
  category: string;
  description?: string;
  stock?: number | null;
  hasVariations?: boolean;
  variations?: Array<{
    name: string;
    option: string;
    regularPrice?: string | null;
    salePrice?: string | null;
  }> | null;
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (product) return { title: product.name };
  return {};
}

async function getProduct(id: string): Promise<Product | null> {
  let client;
  const numericId = Number(id);

  if (!Number.isInteger(numericId) || numericId <= 0) {
    return null;
  }

  try {
    client = await pool.connect();
    const result = await client.query('SELECT * FROM "Product" WHERE id = $1 LIMIT 1', [numericId]);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0] as Product;
  } finally {
    if (client) {
      client.release();
    }
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  const formatCedi = (value: string) => {
    const normalized = value.trim();
    if (!normalized) return 'GH₵0';
    if (normalized.includes('₵') || normalized.toUpperCase().startsWith('GH')) return normalized;
    return `GH₵${normalized}`;
  };

  const normalizedRegularPrice = product.regularPrice?.trim() || '';
  const normalizedSalePrice = product.salePrice?.trim() || '';
  const galleryImages = Array.isArray(product.imageUrls) && product.imageUrls.length > 0 ? product.imageUrls : [product.image];
  const isSoldOut = product.stock !== undefined && product.stock !== null && product.stock <= 0;

  // Extract min/max prices from variations if they exist
  const getVariationPrices = () => {
    if (!product.hasVariations || !Array.isArray(product.variations) || product.variations.length === 0) {
      return null;
    }
    const prices = product.variations
      .flatMap(v => {
        const sale = v.salePrice?.trim();
        const reg = v.regularPrice?.trim();
        return [sale || reg].filter((p): p is string => Boolean(p));
      })
      .map(p => parseFloat(p.replace(/[^\d.]/g, '')))
      .filter(n => !isNaN(n) && n > 0);

    if (prices.length === 0) return null;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    return minPrice === maxPrice ? null : { min: minPrice, max: maxPrice };
  };

  const variationRange = getVariationPrices();
  const hasSale = variationRange ? false : normalizedSalePrice.length > 0;
  const displayPrice = variationRange
    ? `GH₵${variationRange.min.toFixed(0)} - GH₵${variationRange.max.toFixed(0)}`
    : formatCedi(hasSale ? normalizedSalePrice : normalizedRegularPrice || product.price);
  const regularPriceLabel = formatCedi(normalizedRegularPrice || product.price);
  const showStruckRegular = !variationRange && hasSale && regularPriceLabel !== displayPrice;

  // Group variations by type
  const groupedVariations: Map<string, Array<{ name: string; option: string; regularPrice?: string | null; salePrice?: string | null }>> = (() => {
    if (!Array.isArray(product.variations)) return new Map();
    const grouped = new Map<string, Array<{ name: string; option: string; regularPrice?: string | null; salePrice?: string | null }>>();
    for (const v of product.variations) {
      if (!grouped.has(v.name)) grouped.set(v.name, []);
      grouped.get(v.name)!.push(v);
    }
    return grouped;
  })();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-orange-500 hover:text-orange-600 mb-6"
        >
          <FiArrowLeft />
          Back to products
        </Link>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div>
              <ProductImageGallery images={galleryImages} productName={product.name} />
              <div className="px-6 pb-6 pt-4 md:px-8 md:pb-8">
                <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                  {product.description || 'Premium quality product selected for long wear, natural finish, and comfort.'}
                </p>
              </div>
            </div>

            <ProductPageClient
              product={product}
              displayPrice={displayPrice}
              regularPriceLabel={regularPriceLabel}
              showStruckRegular={showStruckRegular}
              isSoldOut={isSoldOut}
              groupedVariations={groupedVariations}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
