import pg from 'pg';
import { getUserBySessionToken, parseCookie } from '@/lib/serverAuth';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

type ProductUpdateInput = {
  name?: string;
  price?: string;
  image?: string;
  imageUrls?: string[];
  category?: string;
  description?: string;
  isFeatured?: boolean;
  regularPrice?: string;
  salePrice?: string;
  hasVariations?: boolean;
  variations?: Array<{ name: string; option: string; additionalPrice?: string }>;
};

async function requireAdmin(request: Request) {
  const token = parseCookie(request.headers.get('cookie'), 'wf_session');
  if (!token) return null;

  const user = await getUserBySessionToken(token);
  if (!user || user.role !== 'admin') return null;
  return user;
}

async function ensureProductSchema(client: pg.PoolClient) {
  await client.query('ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "regularPrice" VARCHAR(50)');
  await client.query('ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "salePrice" VARCHAR(50)');
  await client.query('ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "hasVariations" BOOLEAN NOT NULL DEFAULT FALSE');
  await client.query(`ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS variations JSONB NOT NULL DEFAULT '[]'::jsonb`);
  await client.query(`ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "imageUrls" JSONB NOT NULL DEFAULT '[]'::jsonb`);
}

export async function GET(_request: Request, context: RouteContext) {
  let client;

  try {
    const { id } = await context.params;
    const numericId = Number(id);

    if (!Number.isInteger(numericId) || numericId <= 0) {
      return Response.json({ error: 'Invalid product id' }, { status: 400 });
    }

    client = await pool.connect();
    const result = await client.query('SELECT * FROM "Product" WHERE id = $1 LIMIT 1', [numericId]);

    if (result.rows.length === 0) {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }

    return Response.json(result.rows[0], {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    return Response.json(
      {
        error: 'Failed to fetch product',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}

export async function PUT(request: Request, context: RouteContext) {
  let client;

  try {
    const user = await requireAdmin(request);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const numericId = Number(id);

    if (!Number.isInteger(numericId) || numericId <= 0) {
      return Response.json({ error: 'Invalid product id' }, { status: 400 });
    }

    const body = (await request.json()) as ProductUpdateInput;

    if (!body.name?.trim() || !body.image?.trim() || !body.category?.trim() || !body.regularPrice?.trim()) {
      return Response.json({ error: 'Missing required product fields' }, { status: 400 });
    }

    client = await pool.connect();
    await ensureProductSchema(client);
    const regularPrice = body.regularPrice.trim();
    const salePrice = body.salePrice?.trim() || null;
    const normalizedImageUrls = Array.isArray(body.imageUrls)
      ? body.imageUrls.map(url => url?.trim()).filter((url): url is string => Boolean(url)).slice(0, 3)
      : [];
    const productImage = normalizedImageUrls[0] || body.image.trim();
    const finalPrice = regularPrice;

    if (!finalPrice) {
      return Response.json({ error: 'A price value is required' }, { status: 400 });
    }

    let result;
    const normalizedVariations = Array.isArray(body.variations)
      ? body.variations
          .filter(variation => variation?.name?.trim() && variation?.option?.trim())
          .map(variation => ({
            name: variation.name.trim(),
            option: variation.option.trim(),
            additionalPrice: variation.additionalPrice?.trim() || '0',
          }))
      : [];

    try {
      result = await client.query(
        `
        UPDATE "Product"
        SET
          name = $1,
          price = $2,
          image = $3,
          "imageUrls" = $4::jsonb,
          category = $5,
          description = $6,
          "isFeatured" = $7,
          "regularPrice" = $8,
          "salePrice" = $9,
          "hasVariations" = $10,
          variations = $11::jsonb,
          "updatedAt" = CURRENT_TIMESTAMP
        WHERE id = $12
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
          numericId,
        ]
      );
    } catch (error) {
      if ((error as { code?: string }).code !== '42703') {
        throw error;
      }

      result = await client.query(
        `
        UPDATE "Product"
        SET
          name = $1,
          price = $2,
          image = $3,
          category = $4,
          description = $5,
          "isFeatured" = $6,
          "updatedAt" = CURRENT_TIMESTAMP
        WHERE id = $7
        RETURNING *
        `,
        [
          body.name.trim(),
          finalPrice,
          productImage,
          body.category.trim(),
          body.description?.trim() || null,
          Boolean(body.isFeatured),
          numericId,
        ]
      );
    }

    if (result.rows.length === 0) {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }

    return Response.json(result.rows[0]);
  } catch (error) {
    const dbError = error as { code?: string };

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
      { error: 'Failed to update product', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  let client;

  try {
    const user = await requireAdmin(request);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const numericId = Number(id);

    if (!Number.isInteger(numericId) || numericId <= 0) {
      return Response.json({ error: 'Invalid product id' }, { status: 400 });
    }

    client = await pool.connect();
    const result = await client.query('DELETE FROM "Product" WHERE id = $1 RETURNING id', [numericId]);

    if (result.rows.length === 0) {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json(
      { error: 'Failed to delete product', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
}
