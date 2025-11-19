"use client";

import { useState } from "react";
import { Mail, Loader2, CheckCircle2, AlertCircle, Info } from "lucide-react";

type AlertResult = {
  sent: boolean;
  items: Array<{ id: string; name: string; reason: string }>;
  error?: string;
};

export function AlertButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AlertResult | null>(null);

  async function handleTest() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/alerts/run", { method: "POST" });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({
        sent: false,
        items: [],
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
    setLoading(false);
  }

  return (
    <div className="w-full">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Bagian Kiri: Icon & Info */}
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Email Alert System
            </h4>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed max-w-[250px]">
              Kirim notifikasi stok menipis & kadaluarsa ke email admin.
            </p>
          </div>
        </div>

        {/* Bagian Kanan: Tombol */}
        <button
          onClick={handleTest}
          disabled={loading}
          className="group relative flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white transition-all hover:bg-emerald-700 hover:shadow-md hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed w-full sm:w-auto"
        >
          {loading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Memproses...</span>
            </>
          ) : (
            <>
              <span>Test Email</span>
            </>
          )}
        </button>
      </div>

      {/* Bagian Bawah: Hasil Feedback (Tanpa Emoticon) */}
      {result && (
        <div
          className={`mt-4 flex items-start gap-3 rounded-lg border p-3 text-xs animate-in fade-in slide-in-from-top-2 duration-300 ${
            result.sent
              ? "border-emerald-200 bg-emerald-50/50 text-emerald-900"
              : result.error
              ? "border-rose-200 bg-rose-50/50 text-rose-900"
              : "border-slate-200 bg-slate-50 text-slate-700"
          }`}
        >
          <div className="mt-0.5 shrink-0">
            {result.sent ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            ) : result.error ? (
              <AlertCircle className="h-4 w-4 text-rose-600" />
            ) : (
              <Info className="h-4 w-4 text-slate-500" />
            )}
          </div>

          <div className="flex-1">
            {result.sent ? (
              <>
                <p className="font-bold">Email Berhasil Terkirim</p>
                <p className="mt-1 opacity-80">
                  Ditemukan {result.items.length} item yang perlu perhatian.
                  Silakan cek inbox.
                </p>
              </>
            ) : result.error ? (
              <>
                <p className="font-bold">Gagal Mengirim Email</p>
                <p className="mt-1 opacity-80">{result.error}</p>
              </>
            ) : (
              <>
                <p className="font-bold">Sistem Aman</p>
                <p className="mt-1 opacity-80">
                  Tidak ada stok menipis atau obat kadaluarsa.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
