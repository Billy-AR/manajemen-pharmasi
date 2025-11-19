import Link from "next/link";
import { getDashboardStats } from "./actions";
import { AlertButton } from "./alert-button";
import type { Medicine } from "@/types";
import { TrendingUp, Package, AlertTriangle, Mail, ShoppingCart, Pill, Factory, Users, Activity, ArrowUpRight, Clock, LayoutDashboard } from "lucide-react";

// --- Helper Functions ---
function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  // Data Kartu Statistik
  const penjualanDash = {
    title: "Penjualan Hari Ini",
    value: formatRupiah(stats.todaySales),
    desc: `${stats.todayTransactions} transaksi sukses`,
    icon: TrendingUp,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    indicator: "bg-emerald-500",
  };

  const cards = [
    {
      title: "Stok Menipis",
      value: `${stats.lowStockCount} SKU`,
      desc: stats.lowStockCount > 0 ? "Perlu restock segera" : "Stok aman",
      icon: Package,
      color: stats.lowStockCount > 0 ? "text-amber-600" : "text-emerald-600",
      bg: stats.lowStockCount > 0 ? "bg-amber-50" : "bg-emerald-50",
      border: stats.lowStockCount > 0 ? "border-amber-100" : "border-emerald-100",
      indicator: stats.lowStockCount > 0 ? "bg-amber-500" : "bg-emerald-500",
    },
    {
      title: "Segera Kadaluarsa",
      value: `${stats.expiringSoonCount} SKU`,
      desc: stats.expiringSoonCount > 0 ? "Dalam 30 hari" : "Tidak ada",
      icon: Clock,
      color: stats.expiringSoonCount > 0 ? "text-rose-600" : "text-emerald-600",
      bg: stats.expiringSoonCount > 0 ? "bg-rose-50" : "bg-emerald-50",
      border: stats.expiringSoonCount > 0 ? "border-rose-100" : "border-emerald-100",
      indicator: stats.expiringSoonCount > 0 ? "bg-rose-500" : "bg-emerald-500",
    },
    {
      title: "Notifikasi System",
      value: `${stats.alertsCount} Pesan`,
      desc: "Alert terkirim bulan ini",
      icon: Mail,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
      indicator: "bg-blue-500",
    },
  ];

  // Menu Akses Cepat
  const quickActions = [
    {
      href: "/kasir",
      icon: ShoppingCart,
      title: "Kasir",
      desc: "Transaksi Baru",
      color: "text-purple-600",
      bg: "bg-purple-50",
      border: "group-hover:border-purple-200",
    },
    {
      href: "/obat",
      icon: Pill,
      title: "Obat",
      desc: "Kelola Stok",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "group-hover:border-emerald-200",
    },
    {
      href: "/supplier",
      icon: Factory,
      title: "Supplier",
      desc: "Data Pemasok",
      color: "text-orange-600",
      bg: "bg-orange-50",
      border: "group-hover:border-orange-200",
    },
    {
      href: "/users",
      icon: Users,
      title: "Users",
      desc: "Hak Akses",
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "group-hover:border-blue-200",
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* --- HEADER HERO --- */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/40">
        <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-emerald-50 blur-3xl opacity-60 mix-blend-multiply"></div>
        <div className="absolute -left-10 -bottom-10 h-64 w-64 rounded-full bg-blue-50 blur-3xl opacity-60 mix-blend-multiply"></div>

        <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Live System</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">Dashboard</h1>
            <p className="max-w-xl text-sm text-slate-500 md:text-base">Selamat datang kembali. Berikut adalah performa penjualan dan status inventaris terkini.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/obat" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-emerald-600">
              <Package className="h-4 w-4" />
              Stok Obat
            </Link>
            <Link href="/laporan" className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-slate-900/20 transition-all hover:bg-slate-800 hover:-translate-y-0.5">
              <Activity className="h-4 w-4" />
              Laporan
            </Link>
          </div>
        </div>
      </div>

      {/* --- STATS CARDS GRID --- */}
      <div key={penjualanDash.title} className={`group relative overflow-hidden rounded-2xl border bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg ${penjualanDash.border}`}>
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{penjualanDash.title}</p>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">{penjualanDash.value}</h3>
            <p className={`text-xs font-medium ${penjualanDash.color}`}>{penjualanDash.desc}</p>
          </div>
          <div className={`rounded-xl p-3 ${penjualanDash.bg}`}>
            <penjualanDash.icon className={`h-6 w-6 ${penjualanDash.color}`} />
          </div>
        </div>
        <div className={`absolute bottom-0 left-0 h-1 w-full opacity-0 transition-opacity group-hover:opacity-100 ${penjualanDash.indicator}`}></div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card, idx) => (
          <div key={idx} className={`group relative overflow-hidden rounded-2xl border bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg ${card.border}`}>
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{card.title}</p>
                <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">{card.value}</h3>
                <p className={`text-xs font-medium ${card.color}`}>{card.desc}</p>
              </div>
              <div className={`rounded-xl p-3 ${card.bg}`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
            </div>
            <div className={`absolute bottom-0 left-0 h-1 w-full opacity-0 transition-opacity group-hover:opacity-100 ${card.indicator}`}></div>
          </div>
        ))}
      </div>

      {/* --- MAIN CONTENT SECTIONS --- */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* LEFT COLUMN (2/3 Width) */}
        <div className="space-y-8 lg:col-span-2">
          {/* Low Stock Panel */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-amber-100 p-2 text-amber-600">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-slate-900">Stok Menipis</h3>
              </div>
              <Link href="/obat" className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-emerald-600 hover:text-emerald-700">
                Lihat Semua <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="p-0">
              {stats.lowStockItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-3 rounded-full bg-slate-100 p-3">
                    <Package className="h-6 w-6 text-slate-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-500">Semua stok aman terkendali</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {stats.lowStockItems.slice(0, 5).map((item: Medicine) => (
                    <div key={item.id} className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-amber-50/30">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{item.name}</p>
                        <p className="mt-0.5 text-xs text-slate-500">Min: {item.minStock} unit</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center rounded-md bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700">Sisa: {item.stock}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Expiring Soon Panel */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-rose-100 p-2 text-rose-600">
                  <Clock className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-slate-900">Segera Kadaluarsa</h3>
              </div>
              <Link href="/laporan" className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-emerald-600 hover:text-emerald-700">
                Laporan <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="p-0">
              {stats.expiringSoonItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-3 rounded-full bg-slate-100 p-3">
                    <Activity className="h-6 w-6 text-slate-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-500">Tidak ada obat expired dalam 30 hari</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {stats.expiringSoonItems.slice(0, 5).map((item: Medicine) => (
                    <div key={item.id} className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-rose-50/30">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{item.name}</p>
                        <p className="mt-0.5 text-xs text-slate-500">Stok: {item.stock}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold uppercase text-slate-400">Expired</p>
                        <p className="font-mono text-xs font-bold text-rose-600">{item.expiredAt ? formatDate(item.expiredAt) : "-"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN (1/3 Width) */}
        <div className="space-y-8">
          {/* Quick Actions */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-slate-500">
              <LayoutDashboard className="h-4 w-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider">Akses Cepat</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className={`group flex flex-col items-center justify-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 text-center transition-all hover:bg-white hover:shadow-md ${action.border}`}
                >
                  <div className={`rounded-full p-3 transition-transform group-hover:scale-110 ${action.bg} ${action.color}`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900">{action.title}</span>
                </Link>
              ))}
            </div>
          </section>

          {/* --- BAGIAN YANG DIPERBAIKI (Menyatu dalam satu Card) --- */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-slate-500">
              <Activity className="h-4 w-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider">Kontrol Manual</h3>
            </div>
            {/* Tombol alert ditempatkan di dalam wrapper section ini */}
            <AlertButton />
          </section>
        </div>
      </div>
    </div>
  );
}
