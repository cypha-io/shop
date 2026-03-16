import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

type CheckoutItemInput = {
  id: number;
  name: string;
  price: string;
  quantity: number;
};

type CheckoutPayload = {
  fullName: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  notes?: string;
  paymentMethod: 'cash' | 'mobile-money' | 'card';
  subtotal: number;
  delivery: number;
  total: number;
  items: CheckoutItemInput[];
};

const isValidPhone = (value: string) => /^0\d{9}$/.test(value);

const parsePrice = (value: string) => {
  const numeric = Number(String(value).replace(/[^0-9.]/g, ''));
  return Number.isFinite(numeric) ? numeric : 0;
};

export async function GET() {
  let client;

  try {
    client = await pool.connect();
    let result;
    try {
      result = await client.query(`
        SELECT
          o.id,
          o."orderNumber",
          o."customerName",
          o.phone,
          o.email,
          o.address,
          o.city,
          o.notes,
          o."paymentMethod",
          COALESCE(o."paymentCompleted", FALSE) AS "paymentCompleted",
          o.status,
          o.subtotal,
          o.delivery,
          o.total,
          o."createdAt",
          COALESCE(
            json_agg(
              json_build_object(
                'id', oi.id,
                'productId', oi."productId",
                'productName', oi."productName",
                'price', oi.price,
                'quantity', oi.quantity,
                'lineTotal', oi."lineTotal"
              )
            ) FILTER (WHERE oi.id IS NOT NULL),
            '[]'::json
          ) AS items
        FROM "Order" o
        LEFT JOIN "OrderItem" oi ON oi."orderId" = o.id
        GROUP BY o.id
        ORDER BY o."createdAt" DESC
      `);
    } catch (error) {
      if ((error as { code?: string }).code !== '42703') {
        throw error;
      }

      result = await client.query(`
        SELECT
          o.id,
          o."orderNumber",
          o."customerName",
          o.phone,
          o.email,
          o.address,
          o.city,
          o.notes,
          o."paymentMethod",
          FALSE AS "paymentCompleted",
          o.status,
          o.subtotal,
          o.delivery,
          o.total,
          o."createdAt",
          COALESCE(
            json_agg(
              json_build_object(
                'id', oi.id,
                'productId', oi."productId",
                'productName', oi."productName",
                'price', oi.price,
                'quantity', oi.quantity,
                'lineTotal', oi."lineTotal"
              )
            ) FILTER (WHERE oi.id IS NOT NULL),
            '[]'::json
          ) AS items
        FROM "Order" o
        LEFT JOIN "OrderItem" oi ON oi."orderId" = o.id
        GROUP BY o.id
        ORDER BY o."createdAt" DESC
      `);
    }

    return Response.json(result.rows, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    return Response.json(
      { error: 'Failed to fetch orders', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
}

export async function POST(request: Request) {
  let client;

  try {
    const body = (await request.json()) as CheckoutPayload;

    if (!body.fullName?.trim() || !body.phone?.trim() || !body.address?.trim() || !body.city?.trim()) {
      return Response.json({ error: 'Missing required customer details' }, { status: 400 });
    }

    if (!isValidPhone(body.phone.trim())) {
      return Response.json({ error: 'Phone must be 10 digits and start with 0' }, { status: 400 });
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return Response.json({ error: 'Cart is empty' }, { status: 400 });
    }

    client = await pool.connect();
    await client.query('BEGIN');

    const paymentCompleted = body.paymentMethod === 'card' || body.paymentMethod === 'mobile-money';

    let orderInsert;
    try {
      orderInsert = await client.query(
        `
        INSERT INTO "Order"
        ("customerName", phone, email, address, city, notes, "paymentMethod", "paymentCompleted", status, subtotal, delivery, total)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Pending', $9, $10, $11)
        RETURNING id
        `,
        [
          body.fullName.trim(),
          body.phone.trim(),
          body.email?.trim() || null,
          body.address.trim(),
          body.city.trim(),
          body.notes?.trim() || null,
          body.paymentMethod,
          paymentCompleted,
          body.subtotal,
          body.delivery,
          body.total,
        ]
      );
    } catch (error) {
      if ((error as { code?: string }).code !== '42703') {
        throw error;
      }

      orderInsert = await client.query(
        `
        INSERT INTO "Order"
        ("customerName", phone, email, address, city, notes, "paymentMethod", status, subtotal, delivery, total)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'Pending', $8, $9, $10)
        RETURNING id
        `,
        [
          body.fullName.trim(),
          body.phone.trim(),
          body.email?.trim() || null,
          body.address.trim(),
          body.city.trim(),
          body.notes?.trim() || null,
          body.paymentMethod,
          body.subtotal,
          body.delivery,
          body.total,
        ]
      );
    }

    const orderId = orderInsert.rows[0].id as number;
    const orderNumber = `WF-${String(orderId).padStart(6, '0')}`;

    await client.query('UPDATE "Order" SET "orderNumber" = $1 WHERE id = $2', [orderNumber, orderId]);

    for (const item of body.items) {
      const unitPrice = parsePrice(item.price);
      const quantity = Math.max(1, Number(item.quantity) || 1);
      const lineTotal = unitPrice * quantity;

      await client.query(
        `
        INSERT INTO "OrderItem"
        ("orderId", "productId", "productName", price, quantity, "lineTotal")
        VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [orderId, Number(item.id) || null, item.name, unitPrice, quantity, lineTotal]
      );
    }

    await client.query('COMMIT');

    return Response.json({ id: orderId, orderNumber, status: 'Pending' }, { status: 201 });
  } catch (error) {
    if (client) await client.query('ROLLBACK');
    return Response.json(
      { error: 'Failed to create order', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
}
