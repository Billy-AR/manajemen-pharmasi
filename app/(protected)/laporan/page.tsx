"use client";

import { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { getSalesReport, getLowStockReport, getExpiringSoonReport } from "./actions";
import type { Sale, Medicine } from "@/types";

// --- ICONS ---
const Icons = {
  Download: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  ),
  Calendar: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  TrendingUp: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  Alert: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  Box: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  Filter: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
  ),
};

// --- HELPER FUNCTIONS ---
function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDateTime(timestamp: number) {
  return new Date(timestamp).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(timestamp: number | string | undefined) {
  if (!timestamp) return "-";
  return new Date(timestamp).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function LaporanPage() {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState<"sales" | "lowStock" | "expiring">("sales");
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Sales Data
  const [sales, setSales] = useState<Sale[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Inventory Data
  const [lowStock, setLowStock] = useState<Medicine[]>([]);
  const [expiringSoon, setExpiringSoon] = useState<Medicine[]>([]);
  const [daysAhead, setDaysAhead] = useState(30);

  // --- EFFECTS ---
  useEffect(() => {
    if (activeTab === "sales") loadSalesReport();
    else if (activeTab === "lowStock") loadLowStockReport();
    else loadExpiringSoonReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // --- LOADERS ---
  async function loadSalesReport() {
    setLoading(true);
    const start = startDate ? new Date(startDate).getTime() : undefined;
    const end = endDate ? new Date(endDate).getTime() : undefined;
    const data = await getSalesReport(start, end);
    setSales(data.sales);
    setTotalRevenue(data.totalRevenue);
    setTotalTransactions(data.totalTransactions);
    setLoading(false);
  }

  async function loadLowStockReport() {
    setLoading(true);
    const data = await getLowStockReport();
    setLowStock(data);
    setLoading(false);
  }

  async function loadExpiringSoonReport() {
    setLoading(true);
    const data = await getExpiringSoonReport(daysAhead);
    setExpiringSoon(data);
    setLoading(false);
  }

  // --- PDF EXPORT ---
  const handleExportPDF = () => {
    setIsExporting(true);
    const doc = new jsPDF();
    const today = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Professional Header
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(4, 120, 87); // Emerald-700 for PDF Title
    doc.text("LAPORAN ANALITIK APOTEK", 14, 20);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(`Generated: ${today}`, 14, 26);

    // Line Separator
    doc.setDrawColor(16, 185, 129); // Emerald color
    doc.line(14, 30, 196, 30);

    if (activeTab === "sales") {
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text("Ringkasan Penjualan", 14, 40);
      doc.setFontSize(9);
      doc.text(`Periode: ${startDate || "Awal"} s/d ${endDate || "Hari ini"}`, 14, 46);
      doc.text(`Total Revenue: ${formatRupiah(totalRevenue)}`, 14, 52);
      doc.text(`Total Transaksi: ${totalTransactions}`, 14, 57);

      const tableBody = sales.map((sale) => [formatDateTime(sale.createdAt), sale.items.map((i) => `${i.name} (x${i.quantity})`).join(", "), formatRupiah(sale.total)]);

      autoTable(doc, {
        startY: 65,
        head: [["Waktu Transaksi", "Detail Item", "Total"]],
        body: tableBody,
        theme: "grid",
        headStyles: { fillColor: [16, 185, 129], textColor: 255 },
        columnStyles: { 2: { halign: "right" } },
      });
    } else if (activeTab === "lowStock") {
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text("Laporan Stok Menipis (Low Stock)", 14, 40);

      const tableBody = lowStock.map((item) => [item.name, item.stock.toString(), item.minStock.toString(), "RESTOCK"]);

      autoTable(doc, {
        startY: 48,
        head: [["Nama Produk", "Sisa Stok", "Min. Limit", "Status"]],
        body: tableBody,
        theme: "grid",
        headStyles: { fillColor: [245, 158, 11], textColor: 255 },
        didParseCell: (data) => {
          if (data.section === "body" && data.column.index === 3) {
            data.cell.styles.textColor = [180, 83, 9];
            data.cell.styles.fontStyle = "bold";
          }
        },
      });
    } else if (activeTab === "expiring") {
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text(`Laporan Kadaluarsa (${daysAhead} hari ke depan)`, 14, 40);

      const tableBody = expiringSoon.map((item) => [item.name, item.stock.toString(), item.expiredAt ? formatDate(item.expiredAt) : "-", "URGENT"]);

      autoTable(doc, {
        startY: 48,
        head: [["Nama Produk", "Qty", "Tgl Kadaluarsa", "Status"]],
        body: tableBody,
        theme: "grid",
        headStyles: { fillColor: [225, 29, 72], textColor: 255 },
        didParseCell: (data) => {
          if (data.section === "body" && data.column.index === 3) {
            data.cell.styles.textColor = [190, 18, 60];
            data.cell.styles.fontStyle = "bold";
          }
        },
      });
    }

    doc.save(`Report_${activeTab}_${Date.now()}.pdf`);
    setIsExporting(false);
  };

  // --- COMPONENT RENDER ---
  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      {/* HEADER SECTION */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-emerald-900">Analisis & Laporan</h1>
          <p className="text-sm text-slate-500">Pusat wawasan performa bisnis dan kesehatan inventaris.</p>
        </div>

        {/* Tab Switching - Segmented Control Style */}
        <div className="inline-flex rounded-lg bg-slate-100 p-1 shadow-inner">
          {[
            { id: "sales", label: "Penjualan" },
            { id: "lowStock", label: "Stok Menipis" },
            { id: "expiring", label: "Kadaluarsa" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${activeTab === tab.id ? "bg-white text-emerald-900 shadow ring-1 ring-black/5" : "text-slate-500 hover:text-emerald-700"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT CONTAINER */}
      <div className="flex flex-col gap-6">
        {/* --- SALES VIEW --- */}
        {activeTab === "sales" && (
          <>
            {/* Sales Toolbar & KPI */}
            <div className="grid gap-4 lg:grid-cols-4">
              {/* KPI Card 1 */}
              <div className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <Icons.TrendingUp />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase text-emerald-600/70">Total Pendapatan</p>
                    <p className="text-xl font-bold text-emerald-900">{formatRupiah(totalRevenue)}</p>
                  </div>
                </div>
              </div>
              {/* KPI Card 2 */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-50 text-sky-600">
                    <Icons.Box />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase text-slate-500">Total Transaksi</p>
                    <p className="text-xl font-bold text-slate-900">{totalTransactions}</p>
                  </div>
                </div>
              </div>

              {/* Filters & Action (Spanning 2 cols) */}
              <div className="flex flex-col justify-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-2">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-1 items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 border border-slate-200">
                    <span className="text-slate-400">
                      <Icons.Calendar />
                    </span>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-transparent text-sm outline-none text-slate-700 w-full" />
                    <span className="text-slate-300">-</span>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-transparent text-sm outline-none text-slate-700 w-full" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={loadSalesReport} disabled={loading} className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50 shadow-md">
                      {loading ? "..." : "Filter"}
                    </button>
                    <button onClick={handleExportPDF} disabled={loading || sales.length === 0} className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                      <Icons.Download /> Export
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sales Table */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-4">
                <h3 className="font-semibold text-slate-800">Riwayat Transaksi</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Waktu</th>
                      <th className="px-6 py-3 font-semibold">Rincian Item</th>
                      <th className="px-6 py-3 text-right font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr>
                        <td colSpan={3} className="py-12 text-center text-slate-500">
                          Memuat data...
                        </td>
                      </tr>
                    ) : sales.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-12 text-center text-slate-500">
                          Tidak ada data penjualan pada periode ini.
                        </td>
                      </tr>
                    ) : (
                      sales.map((sale) => (
                        <tr key={sale.id} className="hover:bg-slate-50/50">
                          <td className="whitespace-nowrap px-6 py-4 font-mono text-xs text-slate-500">{formatDateTime(sale.createdAt)}</td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              {sale.items.map((item, i) => (
                                <div key={i} className="flex items-center gap-2 text-slate-700">
                                  <span className="font-medium">{item.name}</span>
                                  <span className="text-xs text-slate-400 bg-slate-100 px-1.5 rounded">x{item.quantity}</span>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-right font-mono font-medium text-emerald-900">{formatRupiah(sale.total)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* --- LOW STOCK VIEW (UPDATED with Box & Icon) --- */}
        {activeTab === "lowStock" && (
          <div className="space-y-4">
            {/* Header Box - New "Kotak" Style */}
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
                <Icons.Alert />
                <span className="text-sm font-medium">
                  Item Perlu Restock: <span className="font-bold">{lowStock.length}</span>
                </span>
              </div>

              {/* Export Button with Icon */}
              <button onClick={handleExportPDF} disabled={lowStock.length === 0} className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50 shadow-sm">
                <Icons.Download /> Export
              </button>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Nama Produk</th>
                      <th className="px-6 py-3 font-semibold text-right">Sisa Stok</th>
                      <th className="px-6 py-3 font-semibold text-right">Batas Minimum</th>
                      <th className="px-6 py-3 font-semibold text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {lowStock.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-slate-500">
                          Semua stok dalam kondisi aman.
                        </td>
                      </tr>
                    ) : (
                      lowStock.map((item) => (
                        <tr key={item.id} className="hover:bg-amber-50/20">
                          <td className="px-6 py-4 font-medium text-slate-900">{item.name}</td>
                          <td className="px-6 py-4 text-right font-bold text-rose-600">{item.stock}</td>
                          <td className="px-6 py-4 text-right text-slate-500">{item.minStock}</td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 border border-amber-200">Restock</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- EXPIRING VIEW --- */}
        {activeTab === "expiring" && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-slate-700">Filter Kadaluarsa:</label>
                <select value={daysAhead} onChange={(e) => setDaysAhead(Number(e.target.value))} className="rounded-lg border border-slate-300 bg-slate-50 py-1.5 pl-3 pr-8 text-sm focus:border-rose-500 focus:ring-rose-500">
                  <option value={7}>7 Hari ke depan</option>
                  <option value={14}>14 Hari ke depan</option>
                  <option value={30}>30 Hari ke depan</option>
                  <option value={60}>60 Hari ke depan</option>
                </select>
                <button onClick={loadExpiringSoonReport} className="rounded-lg bg-white border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  Terapkan
                </button>
              </div>
              <button onClick={handleExportPDF} disabled={expiringSoon.length === 0} className="flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50">
                <Icons.Download /> Export
              </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Nama Produk</th>
                    <th className="px-6 py-3 font-semibold text-right">Stok Saat Ini</th>
                    <th className="px-6 py-3 font-semibold text-right">Tanggal Kadaluarsa</th>
                    <th className="px-6 py-3 font-semibold text-center">Prioritas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expiringSoon.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-slate-500">
                        Tidak ada item yang mendekati kadaluarsa dalam {daysAhead} hari.
                      </td>
                    </tr>
                  ) : (
                    expiringSoon.map((item) => (
                      <tr key={item.id} className="hover:bg-rose-50/10">
                        <td className="px-6 py-4 font-medium text-slate-900">{item.name}</td>
                        <td className="px-6 py-4 text-right text-slate-600">{item.stock}</td>
                        <td className="px-6 py-4 text-right font-mono font-medium text-rose-600">{formatDate(item.expiredAt)}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-800 border border-rose-200">URGENT</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
