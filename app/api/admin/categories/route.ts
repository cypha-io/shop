import pg from 'pg';
import { getUserBySessionToken, parseCookie } from '@/lib/serverAuth';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

type CategoryPayload = {
  name?: string;
  imageUrl?: string;
};

async function requireAdmin(request: Request) {
  const token = parseCookie(request.headers.get('cookie'), 'wf_session');
  if (!token) return null;

  const user = await getUserBySessionToken(token);
  if (!user || user.role !== 'admin') return null;

  return user;
}

async function ensureCategoryTable(client: pg.PoolClient) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS "Category" (
      id SERIAL PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      slug VARCHAR(140) NOT NULL UNIQUE,
      "imageUrl" TEXT,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await client.query('ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT');
}

function makeSlug(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export async function GET(request: Request) {
  let client;

  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    client = await pool.connect();
    await ensureCategoryTable(client);

    const result = await client.query(
      `
      SELECT id, name, slug, "imageUrl", "createdAt"
      FROM "Category"
      ORDER BY name ASC
      `
    );

    return Response.json(result.rows, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    return Response.json(
      { error: 'Failed to fetch categories', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
}

export async function POST(request: Request) {
  let client;

  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as CategoryPayload;
    const name = body.name?.trim() || '';
    const imageUrl = body.imageUrl?.trim() || null;

    if (!name) {
      return Response.json({ error: 'Category name is required' }, { status: 400 });
    }

    const slug = makeSlug(name);
    if (!slug) {
      return Response.json({ error: 'Invalid category name' }, { status: 400 });
    }

    client = await pool.connect();
    await ensureCategoryTable(client);

    const result = await client.query(
      `
      INSERT INTO "Category" (name, slug, "imageUrl")
      VALUES ($1, $2, $3)
      ON CONFLICT (slug)
      DO UPDATE SET name = EXCLUDED.name, "imageUrl" = EXCLUDED."imageUrl", "updatedAt" = CURRENT_TIMESTAMP
      RETURNING id, name, slug, "imageUrl", "createdAt"
      `,
      [name, slug, imageUrl]
    );

    return Response.json(result.rows[0], { status: 201 });
  } catch (error) {
    return Response.json(
      { error: 'Failed to save category', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
}

export async function DELETE(request: Request) {
  let client;

  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const id = Number(url.searchParams.get('id'));

    if (!Number.isInteger(id) || id <= 0) {
      return Response.json({ error: 'Invalid category id' }, { status: 400 });
    }

    client = await pool.connect();
    await ensureCategoryTable(client);

    const result = await client.query('DELETE FROM "Category" WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return Response.json({ error: 'Category not found' }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json(
      { error: 'Failed to delete category', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
}
