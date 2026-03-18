import pg from 'pg';
import { getUserBySessionToken, parseCookie } from '@/lib/serverAuth';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

type AdminSettings = {
  orderNotifications: boolean;
  allowCashOnDelivery: boolean;
  lowStockThreshold: number;
  supportEmail: string;
};

const DEFAULT_SETTINGS: AdminSettings = {
  orderNotifications: true,
  allowCashOnDelivery: true,
  lowStockThreshold: 5,
  supportEmail: 'support@wigfactory.com',
};

async function requireAdmin(request: Request) {
  const token = parseCookie(request.headers.get('cookie'), 'wf_session');
  if (!token) return null;

  const user = await getUserBySessionToken(token);
  if (!user || user.role !== 'admin') return null;
  return user;
}

async function ensureSettingsTable(client: pg.PoolClient) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS "AdminSetting" (
      key VARCHAR(120) PRIMARY KEY,
      value JSONB NOT NULL,
      "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

function sanitizeSettings(input: Partial<AdminSettings>): AdminSettings {
  return {
    orderNotifications: Boolean(input.orderNotifications),
    allowCashOnDelivery: Boolean(input.allowCashOnDelivery),
    lowStockThreshold:
      Number.isFinite(Number(input.lowStockThreshold)) && Number(input.lowStockThreshold) >= 0
        ? Number(input.lowStockThreshold)
        : DEFAULT_SETTINGS.lowStockThreshold,
    supportEmail:
      typeof input.supportEmail === 'string' && input.supportEmail.trim()
        ? input.supportEmail.trim()
        : DEFAULT_SETTINGS.supportEmail,
  };
}

export async function GET(request: Request) {
  let client;

  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    client = await pool.connect();
    await ensureSettingsTable(client);

    const result = await client.query('SELECT value FROM "AdminSetting" WHERE key = $1 LIMIT 1', ['global']);

    if (result.rows.length === 0) {
      return Response.json(DEFAULT_SETTINGS);
    }

    const settings = sanitizeSettings(result.rows[0].value as Partial<AdminSettings>);
    return Response.json(settings);
  } catch (error) {
    return Response.json(
      { error: 'Failed to fetch settings', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
}

export async function PUT(request: Request) {
  let client;

  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = (await request.json()) as Partial<AdminSettings>;
    const settings = sanitizeSettings(payload);

    client = await pool.connect();
    await ensureSettingsTable(client);

    await client.query(
      `
      INSERT INTO "AdminSetting" (key, value, "updatedAt")
      VALUES ($1, $2::jsonb, CURRENT_TIMESTAMP)
      ON CONFLICT (key)
      DO UPDATE SET value = EXCLUDED.value, "updatedAt" = CURRENT_TIMESTAMP
      `,
      ['global', JSON.stringify(settings)]
    );

    return Response.json(settings);
  } catch (error) {
    return Response.json(
      { error: 'Failed to save settings', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
}
