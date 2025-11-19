"use client";

import { FormEvent, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase-client";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Loader2,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<"email" | "google" | null>(null);

  const redirect = params.get("redirect") || "/dashboard";

  async function exchangeSession(idToken: string) {
    const res = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Gagal membuat sesi login.");
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading("email");
    try {
      const auth = getFirebaseAuth();
      const credential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const idToken = await credential.user.getIdToken();
      await exchangeSession(idToken);
      router.push(redirect);
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Login gagal. Periksa kembali email dan sandi Anda.";
      setError(message);
    } finally {
      setLoading(null);
    }
  }

  async function handleGoogle() {
    setError(null);
    setLoading("google");
    try {
      const auth = getFirebaseAuth();
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(auth, provider);
      const idToken = await credential.user.getIdToken();
      await exchangeSession(idToken);
      router.push(redirect);
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal terhubung dengan Google.";
      setError(message);
    } finally {
      setLoading(null);
    }
  }

  return (
    <main className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden font-sans text-slate-900">
      {/* Professional Background Pattern (Grid) */}
      <div className="absolute inset-0 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-emerald-400 opacity-20 blur-[100px]"></div>

      <div className="w-full max-w-[400px] relative z-10">
        {/* Brand Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20 mb-4">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Apotek An Nisa
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Masuk untuk mengelola inventaris & penjualan.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl ring-1 ring-slate-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@apotek.com"
                  className="block w-full rounded-lg border-slate-300 bg-white py-2.5 pl-10 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 transition-all outline-none"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs font-medium text-emerald-600 hover:text-emerald-500 transition-colors"
                >
                  Lupa password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full rounded-lg border-slate-300 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="rounded-lg bg-rose-50 p-3 text-sm text-rose-600 ring-1 ring-inset ring-rose-200 flex items-start gap-2">
                <svg
                  className="h-5 w-5 shrink-0 text-rose-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading === "email"}
              className="group relative flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading === "email" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative">
              <div
                className="absolute inset-0 flex items-center"
                aria-hidden="true"
              >
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-2 text-xs uppercase tracking-wider text-slate-500">
                  Atau masuk dengan
                </span>
              </div>
            </div>

            {/* Google Button */}
            <button
              type="button"
              onClick={handleGoogle}
              disabled={loading === "google"}
              className="flex w-full items-center justify-center gap-3 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition-all disabled:opacity-50"
            >
              {loading === "google" ? (
                <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
              ) : (
                <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                  <path
                    d="M12.0003 24.0001C18.6003 24.0001 24.0003 18.6001 24.0003 12.0001C24.0003 5.40009 18.6003 0.0000915527 12.0003 0.0000915527C5.40029 0.0000915527 0.000292969 5.40009 0.000292969 12.0001C0.000292969 18.6001 5.40029 24.0001 12.0003 24.0001Z"
                    fill="#FFFFFF"
                  />
                  <path
                    d="M20.2826 10.0872H12.3913V14.2609H16.9565C16.1304 16.7392 13.7391 18.4348 10.913 18.4348C7.34783 18.4348 4.47826 15.5653 4.47826 12.0001C4.47826 8.43487 7.34783 5.5653 10.913 5.5653C12.5217 5.5653 13.9565 6.13052 15.087 7.08704L18.1739 4.00009C16.2609 2.21748 13.7391 1.39139 10.913 1.39139C5.04348 1.39139 0.304348 6.13052 0.304348 12.0001C0.304348 17.8697 5.04348 22.6088 10.913 22.6088C16.7826 22.6088 21.5217 17.8697 21.5217 12.0001C21.5217 11.3479 21.4348 10.6957 21.3043 10.087H20.2826H20.2826Z"
                    fill="#4285F4"
                  />
                </svg>
              )}
              <span className="text-slate-600">Google</span>
            </button>
          </form>
        </div>

        {/* Simple Footer */}
        <p className="mt-6 text-center text-xs text-slate-400">
          &copy; 2025 Apotek Cloud System. Protected.
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
