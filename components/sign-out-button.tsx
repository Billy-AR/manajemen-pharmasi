"use client";

import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();

  async function handle() {
    await fetch("/api/auth/session", { method: "DELETE" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handle}
      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50/60"
    >
      Keluar
    </button>
  );
}
