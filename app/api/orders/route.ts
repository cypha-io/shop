import pg from 'pg';
import { parseCookie, getUserBySessionToken } from '@/lib/serverAuth';
import { evaluatePromotion } from '@/lib/promotions';

const { Pool } = pg;
const SESSION_COOKIE = 'wf_session';

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
  promoCode?: string | null;
  items: CheckoutItemInput[];
};

const isValidPhone = (value: string) => /^0\d{9}$/.test(value);

const parsePrice = (value: string) => {
  const numeric = Number(String(value).replace(/[^0-9.]/g, ''));
  return Number.isFinite(numeric) ? numeric : 0;
};

const roundCurrency = (value: number) => Math.round(Math.max(0, value) * 100) / 100;

export async function GET(request: Request) {
  let client;

  try {
    const { searchParams } = new URL(request.url);
    const requestedPhone = searchParams.get('phone')?.trim() || '';

    // Try to get authenticated user
    const token = parseCookie(request.headers.get('cookie'), SESSION_COOKIE);
    let userId: number | null = null;
    let userRole: string | null = null;

    if (token) {
      const user = await getUserBySessionToken(token);
      if (user) {
        userId = user.id;
        userRole = user.role;
      }
    }

    // Admins can see all orders.
    // Non-admin users are scoped to their own identity and should only see:
    // - Cash orders (created directly as valid orders)
    // - Online orders with confirmed payment
    const whereValues: Array<number | string> = [];
    let baseScopeClause = '';

    if (userRole !== 'admin') {
      if (userId) {
        whereValues.push(userId);
        baseScopeClause = `o."userProfileId" = $${whereValues.length}`;
      } else if (requestedPhone && isValidPhone(requestedPhone)) {
        whereValues.push(requestedPhone);
        baseScopeClause = `o.phone = $${whereValues.length}`;
      } else {
        baseScopeClause = '1=0';
      }
    }

    const whereClause =
      userRole === 'admin'
        ? ''
        : `WHERE ${baseScopeClause} AND (o."paymentMethod" = 'cash' OR COALESCE(o."paymentCompleted", FALSE) = TRUE)`;

    const fallbackWhereClause =
      userRole === 'admin'
        ? ''
        : `WHERE ${baseScopeClause} AND (o."paymentMethod" = 'cash' OR o.status IN ('Paid', 'Delivered', 'Cancelled'))`;

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
        ${whereClause}
        GROUP BY o.id
        ORDER BY o."createdAt" DESC
      `, whereValues);
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
        ${fallbackWhereClause}
        GROUP BY o.id
        ORDER BY o."createdAt" DESC
      `, whereValues);
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
  let transactionStarted = false;

  try {
    // Try to get authenticated user
    const token = parseCookie(request.headers.get('cookie'), SESSION_COOKIE);
    let userId: number | null = null;

    if (token) {
      const user = await getUserBySessionToken(token);
      if (user) {
        userId = user.id;
      }
    }

    const body = (await request.json()) as CheckoutPayload;
    const provisionalOrderNumber = `TMP-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;

    if (!body.fullName?.trim() || !body.phone?.trim() || !body.address?.trim() || !body.city?.trim()) {
      return Response.json({ error: 'Missing required customer details' }, { status: 400 });
    }

    if (!isValidPhone(body.phone.trim())) {
      return Response.json({ error: 'Phone must be 10 digits and start with 0' }, { status: 400 });
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return Response.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const computedSubtotal = roundCurrency(
      body.items.reduce((sum, item) => {
        const unitPrice = parsePrice(item.price);
        const quantity = Math.max(1, Number(item.quantity) || 1);
        return sum + unitPrice * quantity;
      }, 0)
    );
    const computedDelivery = computedSubtotal > 0 ? 10 : 0;
    const totalBeforeDiscount = roundCurrency(computedSubtotal + computedDelivery);

    const promoCode = String(body.promoCode || '').trim().toUpperCase();
    const promoEvaluation = promoCode ? await evaluatePromotion(promoCode, totalBeforeDiscount) : null;
    if (promoCode && !promoEvaluation) {
      return Response.json({ error: 'Invalid or ineligible promo code' }, { status: 400 });
    }

    const discountAmount = promoEvaluation?.discountAmount || 0;
    const computedTotal = roundCurrency(totalBeforeDiscount - discountAmount);
    const baseNotes = body.notes?.trim() || '';
    const resolvedNotes = promoEvaluation
      ? `${baseNotes}${baseNotes ? ' | ' : ''}Promo ${promoEvaluation.code}: -GH₵${promoEvaluation.discountAmount.toFixed(2)}`
      : baseNotes || null;

    if (computedTotal <= 0) {
      return Response.json({ error: 'Order total must be greater than zero' }, { status: 400 });
    }

    client = await pool.connect();

    const paymentCompletedColumnResult = await client.query(
      `
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'Order'
          AND column_name = 'paymentCompleted'
      ) AS "hasPaymentCompleted"
      `
    );
    const hasPaymentCompleted = Boolean(paymentCompletedColumnResult.rows[0]?.hasPaymentCompleted);

    await client.query('BEGIN');
    transactionStarted = true;

    const paymentCompleted = false;
    const submittedProductIds = Array.from(
      new Set(
        body.items
          .map(item => Number(item.id))
          .filter(id => Number.isInteger(id) && id > 0)
      )
    );

    const validProductIds = new Set<number>();
    if (submittedProductIds.length > 0) {
      const productIdResult = await client.query(
        'SELECT id FROM "Product" WHERE id = ANY($1::int[])',
        [submittedProductIds]
      );

      for (const row of productIdResult.rows as Array<{ id: number }>) {
        validProductIds.add(row.id);
      }
    }

    let orderInsert;
    if (hasPaymentCompleted) {
      orderInsert = await client.query(
        `
        INSERT INTO "Order"
        ("orderNumber", "customerName", phone, email, address, city, notes, "paymentMethod", "paymentCompleted", status, subtotal, delivery, total, "userProfileId")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Pending', $10, $11, $12, $13)
        RETURNING id
        `,
        [
          provisionalOrderNumber,
          body.fullName.trim(),
          body.phone.trim(),
          body.email?.trim() || null,
          body.address.trim(),
          body.city.trim(),
          resolvedNotes,
          body.paymentMethod,
          paymentCompleted,
          computedSubtotal,
          computedDelivery,
          computedTotal,
          userId,
        ]
      );
    } else {
      orderInsert = await client.query(
        `
        INSERT INTO "Order"
        ("orderNumber", "customerName", phone, email, address, city, notes, "paymentMethod", status, subtotal, delivery, total, "userProfileId")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Pending', $9, $10, $11, $12)
        RETURNING id
        `,
        [
          provisionalOrderNumber,
          body.fullName.trim(),
          body.phone.trim(),
          body.email?.trim() || null,
          body.address.trim(),
          body.city.trim(),
          resolvedNotes,
          body.paymentMethod,
          computedSubtotal,
          computedDelivery,
          computedTotal,
          userId,
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
      const submittedProductId = Number(item.id);
      const productId = validProductIds.has(submittedProductId) ? submittedProductId : null;

      await client.query(
        `
        INSERT INTO "OrderItem"
        ("orderId", "productId", "productName", price, quantity, "lineTotal")
        VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [orderId, productId, item.name, unitPrice, quantity, lineTotal]
      );
    }

    await client.query('COMMIT');
    transactionStarted = false;

    return Response.json({ id: orderId, orderNumber, status: 'Pending' }, { status: 201 });
  } catch (error) {
    if (client && transactionStarted) {
      try {
        await client.query('ROLLBACK');
      } catch {
        // Preserve the original failure response if rollback itself cannot run.
      }
    }
    return Response.json(
      { error: 'Failed to create order', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
}
