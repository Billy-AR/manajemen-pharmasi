import { NextResponse } from "next/server";
import { createSession, clearSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();
    if (!idToken) {
      return NextResponse.json({ ok: false, error: "Missing idToken" }, { status: 400 });
    }
    await createSession(idToken);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to start session" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  await clearSession();
  return NextResponse.json({ ok: true });
}
