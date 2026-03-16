import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

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
