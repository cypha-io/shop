import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FiArrowLeft, FiShoppingCart } from 'react-icons/fi';
import pg from 'pg';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

type MenuProduct = {
  id: number;
  name: string;
  price: string;
  image: string;
  category: string;
  description?: string;
};

type PageProps = {
  params: Promise<{ category: string; id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category, id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) return {};
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(
      'SELECT name FROM "Product" WHERE id = $1 AND LOWER(category) = LOWER($2) LIMIT 1',
      [numericId, category]
    );
    const name = result.rows[0]?.name as string | undefined;
    if (name) return { title: name };
  } finally {
    if (client) client.release();
  }
  return {};
}

export default async function MenuProductPage({ params }: PageProps) {
  let client;
  let product: MenuProduct | null = null;
  const { category, id } = await params;
  const numericId = Number(id);

  if (!Number.isInteger(numericId) || numericId <= 0) {
    notFound();
  }

  try {
    client = await pool.connect();
    const result = await client.query(
      'SELECT * FROM "Product" WHERE id = $1 AND LOWER(category) = LOWER($2) LIMIT 1',
      [numericId, category]
    );
    product = (result.rows[0] as MenuProduct | undefined) || null;
  } finally {
    if (client) {
      client.release();
    }
  }

  if (!product) {
    notFound();
  }

  const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <Link
          href={`/menu/${category}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-pink-600 hover:text-pink-700 mb-6"
        >
          <FiArrowLeft />
          Back to {categoryLabel}
        </Link>

        <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="relative h-80 md:h-[520px] bg-gray-100">
              <Image src={product.image} alt={product.name} fill className="object-cover" priority />
            </div>

            <div className="p-6 md:p-10 flex flex-col">
              <div className="mb-4 inline-flex items-center gap-2 self-start rounded-full bg-pink-100 px-4 py-2 text-sm font-bold text-pink-700">
                {product.category}
              </div>

              <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight mb-4">{product.name}</h1>

              <p className="text-gray-600 text-base md:text-lg mb-8">
                {product.description || 'Freshly prepared and made with quality ingredients for bold flavor and great value.'}
              </p>

              <div className="mt-auto">
                <p className="text-sm font-semibold text-gray-500 mb-2">Price</p>
                <p className="text-3xl md:text-4xl font-black text-pink-600 mb-6">{product.price}</p>

                <button className="w-full md:w-auto inline-flex items-center justify-center gap-3 rounded-xl bg-pink-600 px-6 py-4 text-white font-bold hover:bg-pink-700 transition-colors">
                  <FiShoppingCart className="text-lg" />
                  Add to cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
