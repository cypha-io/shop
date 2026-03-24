import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

function redirectTo(request: Request, pathname: string, params: Record<string, string>) {
  const url = new URL(pathname, request.url);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return Response.redirect(url, 302);
}

function popupResult(request: Request, payload: { status: 'success' | 'failed'; orderNumber?: string; reason?: string; mode?: string }) {
  const origin = new URL(request.url).origin;
  const body = `<!doctype html>
<html>
  <head><meta charset="utf-8" /><title>Payment Status</title></head>
  <body>
    <script>
      (function () {
        var message = ${JSON.stringify({ type: 'wf-paystack-result', ...payload })};
        try {
          if (window.opener && !window.opener.closed) {
            window.opener.postMessage(message, ${JSON.stringify(origin)});
          }
        } catch (_) {}

        try { window.close(); } catch (_) {}

        setTimeout(function () {
          window.location.replace('/checkout?payment=' + encodeURIComponent(message.status));
        }, 400);
      })();
    </script>
  </body>
</html>`;

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

async function markOrderPaid(orderId: number): Promise<void> {
  let client;
  try {
    client = await pool.connect();

    const columnResult = await client.query(
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

    const hasPaymentCompleted = Boolean(columnResult.rows[0]?.hasPaymentCompleted);
    if (hasPaymentCompleted) {
      await client.query(
        'UPDATE "Order" SET "paymentCompleted" = TRUE, status = $1 WHERE id = $2',
        ['Paid', orderId]
      );
    } else {
      await client.query('UPDATE "Order" SET status = $1 WHERE id = $2', ['Paid', orderId]);
    }
  } finally {
    if (client) client.release();
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const reference = url.searchParams.get('reference') || '';
  const orderIdValue = Number(url.searchParams.get('orderId') || '0');
  const mock = url.searchParams.get('mock') === '1';
  const popup = url.searchParams.get('popup') === '1';
  const apiMode = url.searchParams.get('api') === '1';
  const mockOrderNumber = url.searchParams.get('orderNumber') || '';

  const jsonResult = (statusCode: number, body: Record<string, unknown>) =>
    Response.json(body, {
      status: statusCode,
      headers: { 'Cache-Control': 'no-store' },
    });

  if (!reference || !Number.isInteger(orderIdValue) || orderIdValue <= 0) {
    if (apiMode) {
      return jsonResult(400, { status: 'failed', reason: 'invalid_callback' });
    }
    if (popup) {
      return popupResult(request, { status: 'failed', reason: 'invalid_callback' });
    }
    return redirectTo(request, '/checkout', {
      payment: 'failed',
      reason: 'invalid_callback',
    });
  }

  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) {
    if (apiMode) {
      return jsonResult(500, { status: 'failed', reason: 'paystack_not_configured' });
    }
    if (popup) {
      return popupResult(request, { status: 'failed', reason: 'paystack_not_configured' });
    }
    return redirectTo(request, '/checkout', {
      payment: 'failed',
      reason: 'paystack_not_configured',
    });
  }

  if (mock && key.startsWith('sk_test_')) {
    await markOrderPaid(orderIdValue);
    if (apiMode) {
      return jsonResult(200, {
        status: 'success',
        orderNumber: mockOrderNumber,
        mode: 'mock',
      });
    }
    if (popup) {
      return popupResult(request, {
        status: 'success',
        orderNumber: mockOrderNumber,
        mode: 'mock',
      });
    }
    return redirectTo(request, '/checkout', {
      payment: 'success',
      orderNumber: mockOrderNumber,
      mode: 'mock',
    });
  }

  try {
    const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${key}`,
      },
      cache: 'no-store',
    });

    const payload = (await verifyResponse.json().catch(() => ({}))) as {
      status?: boolean;
      data?: { status?: string; metadata?: { orderNumber?: string } };
    };

    const paid = Boolean(verifyResponse.ok && payload.status && payload.data?.status === 'success');

    if (!paid) {
      if (apiMode) {
        return jsonResult(402, { status: 'failed', reason: 'verification_failed' });
      }
      if (popup) {
        return popupResult(request, { status: 'failed', reason: 'verification_failed' });
      }
      return redirectTo(request, '/checkout', {
        payment: 'failed',
        reason: 'verification_failed',
      });
    }

    await markOrderPaid(orderIdValue);

    const resolvedOrderNumber = payload.data?.metadata?.orderNumber || '';

    if (apiMode) {
      return jsonResult(200, {
        status: 'success',
        orderNumber: resolvedOrderNumber,
      });
    }

    if (popup) {
      return popupResult(request, {
        status: 'success',
        orderNumber: resolvedOrderNumber,
      });
    }

    return redirectTo(request, '/checkout', {
      payment: 'success',
      orderNumber: payload.data?.metadata?.orderNumber || '',
    });
  } catch {
    if (apiMode) {
      return jsonResult(500, { status: 'failed', reason: 'verification_error' });
    }
    if (popup) {
      return popupResult(request, { status: 'failed', reason: 'verification_error' });
    }
    return redirectTo(request, '/checkout', {
      payment: 'failed',
      reason: 'verification_error',
    });
  }
}
