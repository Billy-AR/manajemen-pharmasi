"use server";

import { createSession, clearSession } from "@/lib/auth";

export async function startSession(idToken: string) {
  await createSession(idToken);
}

export async function endSession() {
  await clearSession();
}
