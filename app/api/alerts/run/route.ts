import { NextResponse } from "next/server";
import { runAlertCheck } from "@/lib/alerts";
import { requireAdmin } from "@/lib/auth";

export async function POST(request: Request) {
  // Cek apakah request dari Vercel Cron (bypass admin check)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    // Request dari Vercel Cron - langsung jalankan
    try {
      const result = await runAlertCheck();
      return NextResponse.json({ ok: true, ...result });
    } catch (err: any) {
      return NextResponse.json({ ok: false, error: err?.message || "failed" }, { status: 500 });
    }
  }

  // Request manual dari admin - perlu autentikasi
  await requireAdmin();
  try {
    const result = await runAlertCheck();
    return NextResponse.json({ ok: true, ...result });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || "failed" }, { status: 500 });
  }
}
