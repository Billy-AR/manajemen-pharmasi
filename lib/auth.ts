"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth } from "./firebase-admin";

const SESSION_COOKIE_NAME = "session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 5; // 5 days

export type SessionUser = {
  uid: string;
  email: string | null;
  role: "admin";
};

export async function createSession(idToken: string) {
  const cookieStore = await cookies();
  const sessionCookie = await adminAuth.createSessionCookie(idToken, {
    expiresIn: SESSION_MAX_AGE * 1000,
  });

  cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME);
  if (!session) return null;

  try {
    const decoded = await adminAuth.verifySessionCookie(session.value, true);
    const role: SessionUser["role"] = "admin"; // single role for now
    return { uid: decoded.uid, email: decoded.email ?? null, role };
  } catch {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
    return null;
  }
}

export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    redirect("/login");
  }
  return user;
}
