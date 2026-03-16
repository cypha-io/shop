import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export async function GET() {
  let client;

  try {
    client = await pool.connect();

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

    const result = await client.query(
      `
      SELECT id, name, slug, "imageUrl"
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
