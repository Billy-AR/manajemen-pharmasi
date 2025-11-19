"use client";

import { useState, useEffect, useMemo } from "react";
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "./actions";
import type { Supplier } from "@/types";

// --- ICONS ---
const Icons = {
  Search: () => (
    <svg
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  ),
  Plus: () => (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  ),
  Edit: () => (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      />
    </svg>
  ),
  Trash: () => (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  ),
  Phone: () => (
    <svg
      className="w-3.5 h-3.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
      />
    </svg>
  ),
  Mail: () => (
    <svg
      className="w-3.5 h-3.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  ),
  Map: () => (
    <svg
      className="w-3.5 h-3.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  ),
  Truck: () => (
    <svg
      className="w-8 h-8"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
      />
    </svg>
  ),
  Close: () => (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  ),
};

export default function SupplierPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    let isMounted = true;
    async function fetchSuppliers() {
      setLoading(true);
      const data = await getSuppliers();
      if (isMounted) {
        setSuppliers(data);
        setLoading(false);
      }
    }
    fetchSuppliers();
    return () => {
      isMounted = false;
    };
  }, []);

  const loadSuppliers = async () => {
    setLoading(true);
    const data = await getSuppliers();
    setSuppliers(data);
    setLoading(false);
  };

  // Filter logic
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(
      (s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.contact.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [suppliers, searchQuery]);

  function resetForm() {
    setFormData({ name: "", contact: "", email: "", phone: "", address: "" });
    setEditingId(null);
    setShowForm(false);
  }

  function handleEdit(supplier: Supplier) {
    setFormData({
      name: supplier.name,
      contact: supplier.contact,
      email: supplier.email || "",
      phone: supplier.phone || "",
      address: supplier.address || "",
    });
    setEditingId(supplier.id);
    setShowForm(true);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supplierData: Omit<Supplier, "id" | "createdAt" | "updatedAt"> = {
      name: formData.name,
      contact: formData.contact,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      address: formData.address || undefined,
    };

    const result = editingId
      ? await updateSupplier(editingId, supplierData)
      : await createSupplier(supplierData);

    if (result.success) {
      await loadSuppliers();
      resetForm();
    } else {
      alert(result.error);
    }
    setLoading(false);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Hapus supplier "${name}"?`)) return;
    setLoading(true);
    const result = await deleteSupplier(id);
    if (result.success) await loadSuppliers();
    else alert(result.error);
    setLoading(false);
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* HEADER */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Manajemen Supplier
          </h1>
          <p className="text-sm text-slate-500">
            Kelola database distributor dan pemasok obat.
          </p>
        </div>
        <button
          onClick={() => {
            if (showForm) resetForm();
            else setShowForm(true);
          }}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
            showForm
              ? "bg-slate-800 hover:bg-slate-900"
              : "bg-emerald-600 hover:bg-emerald-700"
          }`}
        >
          {showForm ? <Icons.Close /> : <Icons.Plus />}
          {showForm ? "Tutup Form" : "Tambah Supplier"}
        </button>
      </div>

      {/* FORM SECTION */}
      {showForm && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg animate-in fade-in slide-in-from-top-4">
          <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
            <h3 className="font-semibold text-slate-800">
              {editingId
                ? "✏️ Edit Informasi Supplier"
                : "✨ Input Supplier Baru"}
            </h3>
          </div>
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium uppercase text-slate-500">
                  Nama Perusahaan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                  placeholder="PT. Sumber Obat Jaya"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium uppercase text-slate-500">
                  Contact Person <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.contact}
                  onChange={(e) =>
                    setFormData({ ...formData, contact: e.target.value })
                  }
                  className="block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                  placeholder="Bpk. Budi Santoso"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium uppercase text-slate-500">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                  placeholder="supplier@example.com"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium uppercase text-slate-500">
                  No. Telepon
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                  placeholder="0812..."
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-xs font-medium uppercase text-slate-500">
                  Alamat Lengkap
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                  rows={2}
                  placeholder="Jalan Raya..."
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
              >
                Batalkan
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-emerald-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-50"
              >
                {loading ? "Menyimpan..." : "Simpan Data"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DATA TABLE SECTION */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="border-b border-slate-200 px-6 py-4 bg-white flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
          <div className="relative max-w-xs w-full">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Icons.Search />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari supplier..."
              className="block w-full rounded-lg border border-slate-300 bg-slate-50 py-2 pl-10 text-sm leading-5 placeholder-slate-500 focus:border-emerald-500 focus:bg-white focus:placeholder-slate-400 focus:ring-emerald-500 sm:text-sm transition"
            />
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Total:{" "}
            <span className="text-slate-900 font-bold">
              {filteredSuppliers.length}
            </span>{" "}
            Supplier
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex h-40 items-center justify-center text-slate-500">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent mr-2"></div>
              Memuat data...
            </div>
          ) : filteredSuppliers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <div className="mb-4 rounded-full bg-slate-50 p-4">
                <Icons.Truck />
              </div>
              <p className="text-sm font-medium">
                Data supplier tidak ditemukan.
              </p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50/50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500"
                  >
                    Perusahaan
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500"
                  >
                    Kontak
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500"
                  >
                    Alamat
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredSuppliers.map((supplier) => (
                  <tr
                    key={supplier.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg">
                          {supplier.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900">
                            {supplier.name}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-1">
                            CP: {supplier.contact}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        {supplier.phone ? (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <span className="text-slate-400">
                              <Icons.Phone />
                            </span>{" "}
                            {supplier.phone}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">
                            No Phone
                          </span>
                        )}
                        {supplier.email ? (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <span className="text-slate-400">
                              <Icons.Mail />
                            </span>{" "}
                            {supplier.email}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">
                            No Email
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {supplier.address ? (
                        <div className="flex items-start gap-2 text-sm text-slate-600 max-w-xs truncate">
                          <span className="text-slate-400 mt-0.5 shrink-0">
                            <Icons.Map />
                          </span>
                          <span className="truncate">{supplier.address}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">
                          Belum ada alamat
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(supplier)}
                          className="text-slate-400 hover:text-emerald-600 p-1.5 hover:bg-emerald-50 rounded transition-colors"
                          title="Edit"
                        >
                          <Icons.Edit />
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(supplier.id, supplier.name)
                          }
                          className="text-slate-400 hover:text-rose-600 p-1.5 hover:bg-rose-50 rounded transition-colors"
                          title="Hapus"
                        >
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
      </div>
    </div>
  );
}
