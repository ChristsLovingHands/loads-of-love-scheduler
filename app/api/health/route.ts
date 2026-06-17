import { NextResponse } from "next/server";
import { Pool } from "pg";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function hasValue(value: string | undefined) {
  return Boolean(value && value.trim().length > 0);
}

export async function GET() {
  const databaseUrl = process.env.DATABASE_URL;
  const config = {
    databaseUrl: hasValue(databaseUrl),
    appUrl: hasValue(process.env.APP_URL),
    publicAppUrl: hasValue(process.env.NEXT_PUBLIC_APP_URL),
    jwtSecret: hasValue(process.env.JWT_SECRET),
    mailerSendApiKey: hasValue(process.env.MAILERSEND_API_KEY),
    cronSecret: hasValue(process.env.CRON_SECRET),
  };

  if (!databaseUrl) {
    return NextResponse.json(
      {
        status: "error",
        db: "missing DATABASE_URL",
        config,
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }

  const pool = new Pool({ connectionString: databaseUrl });

  try {
    const result = await pool.query("select 1 as ok");
    return NextResponse.json({
      status: "ok",
      db: "connected",
      result: result.rows[0] ?? null,
      config,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        db: error instanceof Error ? error.message : "Database connection failed",
        config,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  } finally {
    await pool.end();
  }
}
