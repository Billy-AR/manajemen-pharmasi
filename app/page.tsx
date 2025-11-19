import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";

const features = [
  {
    title: "Manajemen Obat",
    desc: "CRUD, stok minimum, kadaluarsa, supplier.",
  },
  {
    title: "Kasir & Penjualan",
    desc: "Scan barcode, diskon, pajak, riwayat transaksi.",
  },
  {
    title: "Reminder Pintar",
    desc: "Stok rendah & kadaluarsa, email alert admin.",
  },
  {
    title: "Laporan & Dashboard",
    desc: "Penjualan periodik, stok menipis, grafik ringkas.",
  },
];

export default async function Home() {
  const user = await getSessionUser();
  if (user) redirect("/dashboard");

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-sky-50 to-white px-4 py-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 lg:flex-row lg:items-center">
        <div className="flex-1 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
            Apotek Cloud · Next.js 15 + Firebase
          </div>
          <h1 className="text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">
            Dashboard farmasi modern untuk stok & penjualan
          </h1>
          <p className="max-w-2xl text-lg leading-7 text-slate-600">
            Kelola obat, stok, kasir, dan laporan dalam satu tempat. Role saat ini: admin. Login
            untuk lanjut, atau setup Firebase Auth & Firestore lebih dulu.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/login"
              className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5 hover:bg-emerald-500"
            >
              Masuk ke dashboard
            </Link>
            <Link
              href="https://firebase.google.com/docs/auth/web/start"
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-emerald-200 hover:bg-emerald-50/60"
            >
              Setup Firebase
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {features.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-[0_20px_60px_-40px_rgba(16,185,129,0.6)] backdrop-blur"
              >
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="text-sm text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-2xl backdrop-blur">
          <p className="text-sm font-semibold text-emerald-700">Status</p>
          <h3 className="text-xl font-bold text-slate-900">Langkah cepat</h3>
          <ol className="mt-4 space-y-3 text-sm text-slate-700">
            <li>1) Isi .env.local dengan config Firebase & service account.</li>
            <li>2) Aktifkan Email/Password & (opsional) Google Sign-in.</li>
            <li>3) Buat akun admin di Firebase Authentication.</li>
            <li>4) Jalankan `npm run dev` dan login.</li>
          </ol>
          <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-sm text-emerald-800">
            Email alert stok rendah & kadaluarsa siap diaktifkan via SMTP env.
          </div>
        </div>
      </div>
    </main>
  );
}
