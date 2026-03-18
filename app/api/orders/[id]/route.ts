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

type OrderStatusPayload = {
  status?: 'Pending' | 'Delivered' | 'Cancelled';
};

async function requireAdmin(request: Request) {
  const token = parseCookie(request.headers.get('cookie'), 'wf_session');
  if (!token) return null;

  const user = await getUserBySessionToken(token);
  if (!user || user.role !== 'admin') return null;
  return user;
}

export async function PATCH(request: Request, context: RouteContext) {
  let client;

  try {
    const user = await requireAdmin(request);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const orderId = Number(id);
    if (!Number.isInteger(orderId) || orderId <= 0) {
      return Response.json({ error: 'Invalid order id' }, { status: 400 });
    }

    const body = (await request.json()) as OrderStatusPayload;
    if (!body.status || !['Pending', 'Delivered', 'Cancelled'].includes(body.status)) {
      return Response.json({ error: 'Invalid order status' }, { status: 400 });
    }

    client = await pool.connect();
    const result = await client.query(
      `
      UPDATE "Order"
      SET status = $1, "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, "orderNumber", status
      `,
      [body.status, orderId]
    );

    if (result.rows.length === 0) {
      return Response.json({ error: 'Order not found' }, { status: 404 });
    }

    return Response.json(result.rows[0]);
  } catch (error) {
    return Response.json(
      { error: 'Failed to update order', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
}
