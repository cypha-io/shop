import pg from 'pg';
import { getUserBySessionToken, parseCookie } from '@/lib/serverAuth';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

type ProductInput = {
  name: string;
  price?: string;
  image: string;
  imageUrls?: string[];
  category: string;
  description?: string;
  isFeatured?: boolean;
  regularPrice?: string;
  salePrice?: string;
  hasVariations?: boolean;
  variations?: Array<{
    name: string;
    option?: string;
    options?: string[];
    regularPrice?: string;
    salePrice?: string;
    additionalPrice?: string;
  }>;
};

async function requireAdmin(request: Request) {
  const token = parseCookie(request.headers.get('cookie'), 'wf_session');
  if (!token) {
    return null;
  }

  const user = await getUserBySessionToken(token);
  if (!user || user.role !== 'admin') {
    return null;
  }

  return user;
}

async function ensureProductSchema(client: pg.PoolClient) {
  await client.query('ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "regularPrice" VARCHAR(50)');
  await client.query('ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "salePrice" VARCHAR(50)');
  await client.query('ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "hasVariations" BOOLEAN NOT NULL DEFAULT FALSE');
  await client.query(`ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS variations JSONB NOT NULL DEFAULT '[]'::jsonb`);
  await client.query(`ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "imageUrls" JSONB NOT NULL DEFAULT '[]'::jsonb`);
}

export async function GET(request: Request) {
  console.log('[API] GET /api/products called');
  let client;
  
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const featured = url.searchParams.get('featured');
    const limitParam = url.searchParams.get('limit');

    const where: string[] = [];
    const values: Array<string | boolean | number> = [];

    if (category) {
      values.push(category);
      where.push(`LOWER(category) = LOWER($${values.length})`);
    }

    if (featured !== null) {
      values.push(featured === 'true');
      where.push(`"isFeatured" = $${values.length}`);
    }

    let query = 'SELECT * FROM "Product"';

    if (where.length > 0) {
      query += ` WHERE ${where.join(' AND ')}`;
    }

    query += ' ORDER BY id';

    if (limitParam) {
      const numericLimit = Number(limitParam);
      if (Number.isInteger(numericLimit) && numericLimit > 0) {
        values.push(numericLimit);
        query += ` LIMIT $${values.length}`;
      }
    }

    client = await pool.connect();
    console.log('[API] Connected to database');
    
    const result = await client.query(query, values);
    const products = result.rows;
    
    console.log('[API] Retrieved', products.length, 'products');
    
    return Response.json(products, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  } catch (error) {
    console.error('[API] Error:', error);
    return Response.json(
      { error: 'Failed to fetch products', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
      console.log('[API] Client released');
    }
  }
}

export async function POST(request: Request) {
  let client;

  try {
    const user = await requireAdmin(request);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as ProductInput;

    const variationHasPrice =
      Boolean(body.hasVariations) &&
      Array.isArray(body.variations) &&
      body.variations.some(variation => Boolean(variation?.regularPrice?.trim()));

    if (!body.name?.trim() || !body.image?.trim() || !body.category?.trim() || (!body.regularPrice?.trim() && !variationHasPrice)) {
      return Response.json({ error: 'Missing required product fields' }, { status: 400 });
    }

    client = await pool.connect();
    await ensureProductSchema(client);
    const regularPrice = body.regularPrice?.trim() || '';
    const salePrice = body.salePrice?.trim() || null;
    const normalizedImageUrls = Array.isArray(body.imageUrls)
      ? body.imageUrls.map(url => url?.trim()).filter((url): url is string => Boolean(url)).slice(0, 3)
      : [];
    const productImage = normalizedImageUrls[0] || body.image.trim();

    let result;
    const normalizedVariations = Array.isArray(body.variations)
      ? body.variations.flatMap(variation => {
          const variationName = variation?.name?.trim();
          const options = Array.isArray(variation?.options)
            ? variation.options.map(option => option?.trim()).filter((option): option is string => Boolean(option))
            : variation?.option?.trim()
            ? [variation.option.trim()]
            : [];

          if (!variationName || options.length === 0) {
            return [];
          }

          return options.map(option => ({
            name: variationName,
            option,
            regularPrice: variation.regularPrice?.trim() || null,
            salePrice: variation.salePrice?.trim() || null,
            additionalPrice: variation.additionalPrice?.trim() || '0',
          }));
        })
      : [];

    const firstVariationPrice = normalizedVariations.find(variation => variation.regularPrice)?.regularPrice || '';
    const finalPrice = regularPrice || firstVariationPrice;

    if (!finalPrice) {
      return Response.json({ error: 'A price value is required' }, { status: 400 });
    }

    try {
      result = await client.query(
        `
        INSERT INTO "Product" (name, price, image, "imageUrls", category, description, "isFeatured", "regularPrice", "salePrice", "hasVariations", variations)
        VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7, $8, $9, $10, $11::jsonb)
        RETURNING *
        `,
        [
          body.name.trim(),
          finalPrice,
          productImage,
          JSON.stringify(normalizedImageUrls.length > 0 ? normalizedImageUrls : [productImage]),
          body.category.trim(),
          body.description?.trim() || null,
          Boolean(body.isFeatured),
          regularPrice,
          salePrice,
          Boolean(body.hasVariations),
          JSON.stringify(normalizedVariations),
        ]
      );
    } catch (error) {
      if ((error as { code?: string }).code !== '42703') {
        throw error;
      }

      result = await client.query(
        `
        INSERT INTO "Product" (name, price, image, category, description, "isFeatured")
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
        `,
        [
          body.name.trim(),
          finalPrice,
          productImage,
          body.category.trim(),
          body.description?.trim() || null,
          Boolean(body.isFeatured),
        ]
      );
    }

    return Response.json(result.rows[0], { status: 201 });
  } catch (error) {
    const dbError = error as { code?: string; detail?: string; constraint?: string };

    if (dbError.code === '23505') {
      return Response.json(
        { error: 'A product with this name already exists in this category.' },
        { status: 409 }
      );
    }

    if (dbError.code === '22P02') {
      return Response.json(
        { error: 'Invalid product data format.' },
        { status: 400 }
      );
    }

    return Response.json(
      { error: 'Failed to create product', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}
