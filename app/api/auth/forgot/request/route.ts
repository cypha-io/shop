import pg from 'pg';
import { createHash, randomInt } from 'crypto';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

type ForgotRequestPayload = { phone: string };

const hashCode = (code: string) => createHash('sha256').update(code).digest('hex');

export async function POST(request: Request) {
  let client;

  try {
    const body = (await request.json()) as ForgotRequestPayload;
    const phone = body.phone?.trim();

    if (!phone) {
      return Response.json({ error: 'Phone is required' }, { status: 400 });
    }

    client = await pool.connect();
    const userResult = await client.query('SELECT id FROM "UserProfile" WHERE phone = $1 LIMIT 1', [phone]);

    // Do not reveal whether account exists in production.
    if (userResult.rows.length === 0) {
      return Response.json({ ok: true });
    }

    const userId = userResult.rows[0].id as number;
    const code = String(randomInt(100000, 1000000));

    await client.query(
      `
      INSERT INTO "PasswordReset" ("userProfileId", "codeHash", "expiresAt")
      VALUES ($1, $2, NOW() + INTERVAL '10 minutes')
      `,
      [userId, hashCode(code)]
    );

    const payload: Record<string, unknown> = { ok: true };
    if (process.env.NODE_ENV !== 'production') {
      payload.devCode = code;
    }

    return Response.json(payload);
  } catch (error) {
    return Response.json(
      { error: 'Failed to generate reset code', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
}
