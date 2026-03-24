import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

type InitializePayload = {
  orderId: number;
  orderNumber: string;
  total: number;
  email?: string;
  fullName?: string;
  phone?: string;
  paymentMethod: 'card' | 'mobile-money';
};

type PaystackInitResponse = {
  status?: boolean;
  message?: string;
  data?: { authorization_url?: string; reference?: string; access_code?: string };
};

function toKobo(amount: number): number {
  return Math.round(Math.max(0, amount) * 100);
}

function isInactiveMerchantMessage(message: string | undefined): boolean {
  if (!message) return false;
  const normalized = message.toLowerCase();
  return normalized.includes('merchant may be inactive') || normalized.includes('merchant is inactive');
}

function normalizeEmail(email: string | undefined, phone: string | undefined): string {
  const trimmed = String(email || '').trim();
  if (trimmed.includes('@')) return trimmed;

  const cleanPhone = String(phone || '').replace(/\D/g, '');
  if (cleanPhone.length >= 7) {
    return `customer-${cleanPhone}@example.com`;
  }

  return `customer-${Date.now()}@example.com`;
}

async function orderExists(orderId: number): Promise<boolean> {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query('SELECT id FROM "Order" WHERE id = $1 LIMIT 1', [orderId]);
    return result.rows.length > 0;
  } finally {
    if (client) client.release();
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as InitializePayload;

    if (!Number.isInteger(body.orderId) || body.orderId <= 0) {
      return Response.json({ error: 'Invalid order id' }, { status: 400 });
    }

    if (!body.orderNumber?.trim()) {
      return Response.json({ error: 'Missing order number' }, { status: 400 });
    }

    if (!(body.paymentMethod === 'card' || body.paymentMethod === 'mobile-money')) {
      return Response.json({ error: 'Unsupported payment method for Paystack' }, { status: 400 });
    }

    if (!(await orderExists(body.orderId))) {
      return Response.json({ error: 'Order not found' }, { status: 404 });
    }

    const key = process.env.PAYSTACK_SECRET_KEY;
    if (!key) {
      return Response.json({ error: 'PAYSTACK_SECRET_KEY is not configured' }, { status: 500 });
    }

    if (!key.startsWith('sk_test_')) {
      return Response.json({ error: 'Paystack is restricted to test mode. Use an sk_test key.' }, { status: 500 });
    }

    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || process.env.PAYSTACK_PUBLIC_KEY || '';
    if (!publicKey.startsWith('pk_test_')) {
      return Response.json(
        { error: 'NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY (or PAYSTACK_PUBLIC_KEY) must be configured with a pk_test key.' },
        { status: 500 }
      );
    }

    const amount = toKobo(Number(body.total) || 0);
    if (amount <= 0) {
      return Response.json({ error: 'Order total must be greater than zero' }, { status: 400 });
    }

    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const callbackUrl = `${origin.replace(/\/$/, '')}/api/payments/paystack/verify?orderId=${encodeURIComponent(String(body.orderId))}&popup=1`;

    const reference = `wf_${body.orderId}_${Date.now()}`;
    const channels = body.paymentMethod === 'card' ? ['card'] : ['mobile_money'];

    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: normalizeEmail(body.email, body.phone),
        amount,
        currency: 'GHS',
        reference,
        callback_url: callbackUrl,
        channels,
        metadata: {
          orderId: body.orderId,
          orderNumber: body.orderNumber,
          customerName: body.fullName || null,
          phone: body.phone || null,
          paymentMethod: body.paymentMethod,
        },
      }),
    });

    const payload = (await paystackResponse.json().catch(() => ({}))) as PaystackInitResponse;

    if (!paystackResponse.ok || !payload.status || !payload.data?.authorization_url) {
      // Some test accounts are not fully activated and cannot initialize real transactions.
      // Allow local/dev checkout testing by simulating the provider callback path.
      if (key.startsWith('sk_test_') && isInactiveMerchantMessage(payload.message)) {
        const mockReference = `mock_${reference}`;
        const mockVerifyUrl = `${origin.replace(/\/$/, '')}/api/payments/paystack/verify?orderId=${encodeURIComponent(String(body.orderId))}&reference=${encodeURIComponent(mockReference)}&mock=1&api=1&orderNumber=${encodeURIComponent(body.orderNumber)}`;
        return Response.json(
          {
            authorizationUrl: '',
            accessCode: '',
            publicKey,
            reference: mockReference,
            testMode: true,
            mock: true,
            mockVerifyUrl,
            message: 'Paystack merchant is inactive in test mode; using local mock payment completion.',
          },
          { status: 200 }
        );
      }

      return Response.json(
        { error: payload.message || 'Failed to initialize Paystack transaction' },
        { status: 502 }
      );
    }

    return Response.json(
      {
        authorizationUrl: payload.data.authorization_url,
        accessCode: payload.data.access_code || '',
        publicKey,
        reference: payload.data.reference || reference,
        amount,
        email: normalizeEmail(body.email, body.phone),
        orderId: body.orderId,
        orderNumber: body.orderNumber,
        channels,
        testMode: true,
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      { error: 'Failed to initialize payment', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
