import { NextResponse } from "next/server";
import { runAlertCheck } from "@/lib/alerts";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    // Verifikasi request dari Vercel Cron
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    // Jalankan pengecekan alert
    const result = await runAlertCheck();

    return NextResponse.json({
      ok: true,
      message: result.sent ? `Alert terkirim untuk ${result.items.length} item` : "Tidak ada alert yang perlu dikirim",
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("Cron alert error:", err);
    return NextResponse.json(
      {
        ok: false,
        error: err?.message || "Failed to run alert check",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
