import pg from 'pg';

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
