"use client";

import { useState, useEffect, useMemo } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getMedicines, createMedicine, updateMedicine, deleteMedicine } from "./actions";
import type { Medicine } from "@/types";

// --- HELPER FUNCTIONS ---

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(timestamp: number | string | undefined) {
  if (!timestamp) return "-";
  return new Date(timestamp).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// --- ICONS ---
const Icons = {
  Plus: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  ),
  Download: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  ),
  Search: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Edit: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  Trash: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  Close: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Filter: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
  ),
};

export default function ObatPage() {
  // --- STATE ---
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    stock: 0,
    minStock: 5,
    price: 0,
    buyPrice: 0,
    barcode: "",
    expiredAt: "",
    supplierId: "",
  });

  // --- STATISTICS (Derived State) ---
  const stats = useMemo(() => {
    const totalItems = medicines.length;
    const lowStockItems = medicines.filter((m) => m.stock <= m.minStock).length;
    const totalValue = medicines.reduce((acc, curr) => acc + curr.stock * curr.buyPrice, 0);
    return { totalItems, lowStockItems, totalValue };
  }, [medicines]);

  // --- EFFECTS ---
  useEffect(() => {
    loadMedicines();
  }, []);

  // --- LOGIC ---
  async function loadMedicines(searchTerm?: string) {
    setLoading(true);
    try {
      const data = await getMedicines(searchTerm);
      setMedicines(data);
    } catch (error) {
      console.error("Gagal memuat obat", error);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    loadMedicines(search);
  }

  function resetForm() {
    setFormData({
      name: "",
      stock: 0,
      minStock: 5,
      price: 0,
      buyPrice: 0,
      barcode: "",
      expiredAt: "",
      supplierId: "",
    });
    setEditingId(null);
    setShowForm(false);
  }

  function handleEdit(medicine: Medicine) {
    setFormData({
      name: medicine.name,
      stock: medicine.stock,
      minStock: medicine.minStock,
      price: medicine.price,
      buyPrice: medicine.buyPrice,
      barcode: medicine.barcode || "",
      expiredAt: medicine.expiredAt ? new Date(medicine.expiredAt).toISOString().split("T")[0] : "",
      supplierId: medicine.supplierId || "",
    });
    setEditingId(medicine.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const medicineData: Omit<Medicine, "id" | "createdAt" | "updatedAt"> = {
      name: formData.name,
      stock: Number(formData.stock),
      minStock: Number(formData.minStock),
      price: Number(formData.price),
      buyPrice: Number(formData.buyPrice),
      barcode: formData.barcode,
      expiredAt: formData.expiredAt ? new Date(formData.expiredAt).getTime() : undefined,
      supplierId: formData.supplierId || undefined,
    };

    let result;
    if (editingId) {
      result = await updateMedicine(editingId, medicineData);
    } else {
      result = await createMedicine(medicineData);
    }

    if (result.success) {
      await loadMedicines(search);
      resetForm();
    } else {
      alert(result.error);
    }
    setLoading(false);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Konfirmasi penghapusan: "${name}"?`)) return;
    setLoading(true);
    const result = await deleteMedicine(id);
    if (result.success) {
      await loadMedicines(search);
    } else {
      alert(result.error);
    }
    setLoading(false);
  }

  // --- PDF EXPORT ---
  function handleExportPdf() {
    if (medicines.length === 0) {
      alert("Data kosong.");
      return;
    }

    const doc = new jsPDF();
    const now = new Date();

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("LAPORAN INVENTARIS STOK", 14, 20);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(`Dicetak: ${now.toLocaleDateString("id-ID")} ${now.toLocaleTimeString("id-ID")}`, 14, 26);
    doc.text(`Total Valuasi: ${formatRupiah(stats.totalValue)}`, 14, 30);

    const tableRows = medicines.map((m) => [m.name, m.barcode || "-", m.stock, formatRupiah(m.buyPrice), formatRupiah(m.price), m.stock <= m.minStock ? "LOW STOCK" : "OK"]);

    autoTable(doc, {
      startY: 35,
      head: [["Nama Produk", "Kode", "Qty", "Harga Beli", "Harga Jual", "Status"]],
      body: tableRows,
      theme: "grid",
      headStyles: { fillColor: [30, 41, 59], textColor: 255, fontSize: 8 }, // Slate-800
      bodyStyles: { fontSize: 8, cellPadding: 3 },
      columnStyles: {
        2: { halign: "right" },
        3: { halign: "right" },
        4: { halign: "right" },
      },
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index === 5) {
          if (data.cell.raw === "LOW STOCK") {
            data.cell.styles.textColor = [220, 38, 38];
            data.cell.styles.fontStyle = "bold";
          }
        }
      },
    });

    doc.save(`Inventory_Report_${now.toISOString().slice(0, 10)}.pdf`);
  }

  // --- UI COMPONENTS ---
  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-12">
      {/* HEADER SECTION */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Manajemen Produk</h1>
          <p className="text-sm text-slate-500">Pusat data inventaris obat dan alat kesehatan.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportPdf}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1"
          >
            <Icons.Download /> Export
          </button>
          <button
            onClick={() => {
              if (showForm) resetForm();
              else setShowForm(true);
            }}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm transition focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 ${
              showForm ? "bg-slate-800 hover:bg-slate-900" : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {showForm ? <Icons.Close /> : <Icons.Plus />}
            {showForm ? "Batal" : "Tambah Produk"}
          </button>
        </div>
      </div>

      {/* STATISTICS SUMMARY (Professional Touch) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase text-slate-500">Total SKU</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{stats.totalItems}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase text-slate-500">Estimasi Aset</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{formatRupiah(stats.totalValue)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase text-slate-500">Stok Menipis</p>
            {stats.lowStockItems > 0 && <span className="flex h-2 w-2 rounded-full bg-rose-500"></span>}
          </div>
          <p className={`mt-1 text-2xl font-bold ${stats.lowStockItems > 0 ? "text-rose-600" : "text-slate-900"}`}>
            {stats.lowStockItems} <span className="text-sm font-normal text-slate-400">item</span>
          </p>
        </div>
      </div>

      {/* FORM SECTION */}
      {showForm && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg animate-in fade-in slide-in-from-top-2">
          <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
            <h2 className="font-semibold text-slate-800">{editingId ? "Edit Informasi Produk" : "Informasi Produk Baru"}</h2>
          </div>
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Group 1: Basic Info */}
              <div className="space-y-4 lg:col-span-2">
                <h3 className="text-xs font-bold uppercase tracking-wide text-slate-400">Identitas Produk</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Nama Obat</label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="block w-full rounded-md border-slate-300 text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-2"
                      placeholder="Nama lengkap produk"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Kode / Barcode</label>
                    <input
                      type="text"
                      value={formData.barcode}
                      onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                      className="block w-full rounded-md border-slate-300 text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-2"
                      placeholder="Scan atau ketik"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Tanggal Kadaluarsa</label>
                    <input
                      type="date"
                      value={formData.expiredAt}
                      onChange={(e) => setFormData({ ...formData, expiredAt: e.target.value })}
                      className="block w-full rounded-md border-slate-300 text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-2"
                    />
                  </div>
                </div>
              </div>

              {/* Group 2: Inventory & Pricing */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wide text-slate-400">Inventaris & Harga</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Stok</label>
                      <input
                        required
                        min="0"
                        type="number"
                        value={formData.stock}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            stock: Number(e.target.value),
                          })
                        }
                        className="block w-full rounded-md border-slate-300 text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-2"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Min. Stok</label>
                      <input
                        required
                        min="0"
                        type="number"
                        value={formData.minStock}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            minStock: Number(e.target.value),
                          })
                        }
                        className="block w-full rounded-md border-slate-300 text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-2"
                      />
                    </div>
                  </div>

                  {/* Harga dengan Prefix Rp */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Harga Beli</label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-slate-500 sm:text-sm">Rp</span>
                      </div>
                      <input
                        required
                        min="0"
                        type="number"
                        value={formData.buyPrice}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            buyPrice: Number(e.target.value),
                          })
                        }
                        className="block w-full rounded-md border-slate-300 pl-10 text-sm focus:border-emerald-500 focus:ring-emerald-500 p-2"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Harga Jual</label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-slate-500 sm:text-sm">Rp</span>
                      </div>
                      <input
                        required
                        min="0"
                        type="number"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            price: Number(e.target.value),
                          })
                        }
                        className="block w-full rounded-md border-slate-300 pl-10 text-sm focus:border-emerald-500 focus:ring-emerald-500 p-2"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-5">
              <button type="button" onClick={resetForm} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50">
                Batalkan
              </button>
              <button type="submit" disabled={loading} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50">
                {loading ? "Menyimpan..." : "Simpan Data"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TABLE SECTION */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <form onSubmit={handleSearch} className="relative w-full max-w-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-slate-400">
                <Icons.Search />
              </span>
            </div>
            <input
              type="text"
              className="block w-full rounded-lg border border-slate-300 bg-slate-50 p-2 pl-10 text-sm text-slate-900 focus:border-emerald-500 focus:ring-emerald-500"
              placeholder="Cari nama, SKU, atau barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
          <div className="hidden md:block">
            <button onClick={() => loadMedicines()} className="text-sm text-slate-500 hover:text-emerald-600">
              Refresh Data
            </button>
          </div>
        </div>

        <div className="relative overflow-x-auto">
          {loading ? (
            <div className="flex h-64 items-center justify-center bg-white">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600"></div>
            </div>
          ) : medicines.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center bg-slate-50 text-slate-500">
              <div className="mb-2 rounded-full bg-slate-200 p-3">
                <Icons.Search />
              </div>
              <p className="text-sm font-medium">Tidak ada data ditemukan.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th scope="col" className="px-6 py-3 font-semibold tracking-wider">
                    Produk
                  </th>
                  <th scope="col" className="px-6 py-3 font-semibold tracking-wider text-right">
                    Stok
                  </th>
                  <th scope="col" className="px-6 py-3 font-semibold tracking-wider text-right">
                    Harga Beli
                  </th>
                  <th scope="col" className="px-6 py-3 font-semibold tracking-wider text-right">
                    Harga Jual
                  </th>
                  <th scope="col" className="px-6 py-3 font-semibold tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 font-semibold tracking-wider text-center">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {medicines.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{item.name}</div>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-400">
                        <span className="font-mono tracking-tight">{item.barcode || "NO-CODE"}</span>
                        {item.expiredAt && (
                          <>
                            <span>•</span>
                            <span>Exp: {formatDate(item.expiredAt)}</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-700">{item.stock}</td>
                    <td className="px-6 py-4 text-right text-slate-600">{formatRupiah(item.buyPrice)}</td>
                    <td className="px-6 py-4 text-right font-medium text-slate-900">{formatRupiah(item.price)}</td>
                    <td className="px-6 py-4">
                      {item.stock <= item.minStock ? (
                        <span className="inline-flex items-center rounded-full bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700 ring-1 ring-inset ring-rose-600/20">Stok Menipis</span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">Tersedia</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleEdit(item)} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-emerald-600">
                          <Icons.Edit />
                        </button>
                        <button onClick={() => handleDelete(item.id, item.name)} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-rose-600">
                          <Icons.Trash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-3">
          <p className="text-xs text-slate-500">Menampilkan {medicines.length} data produk.</p>
        </div>
      </div>
    </div>
  );
}
