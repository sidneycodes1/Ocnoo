import { NextResponse } from "next/server";
import { drainOutbox } from "@/lib/email/outbox";

/**
 * Drains the order-email queue.
 *
 * Vercel Cron calls this on a schedule (`vercel.json`) and sends
 * `Authorization: Bearer $CRON_SECRET` automatically once that variable exists.
 * A manual `curl` with the same header works too, which is how the queue gets
 * flushed during a demo without waiting ten minutes.
 *
 * The route is shut unless CRON_SECRET is set. It is the one endpoint in the app
 * that can read every customer email address in the database, so "no secret
 * configured" must mean "nobody may call this", not "anybody may".
 */
export const dynamic = "force-dynamic";

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

async function run(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json(
      {
        error: process.env.CRON_SECRET
          ? "Unauthorized"
          : "CRON_SECRET is not set, so this worker refuses every request",
      },
      { status: process.env.CRON_SECRET ? 401 : 503 },
    );
  }

  const report = await drainOutbox();
  return NextResponse.json(report);
}

export async function GET(request: Request) {
  return run(request);
}

export async function POST(request: Request) {
  return run(request);
}
