"use client";

import { useState, useEffect, useMemo } from "react";
import { searchMedicines, createSale } from "./actions";
import type { Medicine, SaleItem } from "@/types";

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
  Minus: () => (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
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
  Cart: () => (
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
        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>
  ),
  Check: () => (
    <svg
      className="w-12 h-12"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
};

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function KasirPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Medicine[]>([]);
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // --- CALCULATIONS ---
  const { subtotal, totalDiscount, totalTax, grandTotal } = useMemo(() => {
    const sub = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const disc = (sub * discount) / 100;
    const afterDisc = sub - disc;
    const tx = (afterDisc * tax) / 100;
    const grand = afterDisc + tx;
    return {
      subtotal: sub,
      totalDiscount: disc,
      totalTax: tx,
      grandTotal: grand,
    };
  }, [cart, discount, tax]);

  // --- HANDLERS ---

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const results = await searchMedicines(searchQuery);
      setSearchResults(results);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function addToCart(medicine: Medicine) {
    const existing = cart.find((item) => item.medicineId === medicine.id);

    if (existing) {
      setCart(
        cart.map((item) =>
          item.medicineId === medicine.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * item.price,
              }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          medicineId: medicine.id,
          name: medicine.name,
          quantity: 1,
          price: medicine.price,
          subtotal: medicine.price,
        },
      ]);
    }
  }

  function updateQuantity(medicineId: string, delta: number) {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.medicineId === medicineId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return { ...item, quantity: newQty, subtotal: newQty * item.price };
          }
          return item;
        })
        .filter(Boolean) as SaleItem[];
    });
  }

  function removeFromCart(medicineId: string) {
    setCart(cart.filter((item) => item.medicineId !== medicineId));
  }

  function handleCheckoutClick() {
    if (cart.length === 0) {
      setErrorMessage("Keranjang belanja masih kosong.");
      return;
    }
    setErrorMessage("");
    setShowConfirmModal(true);
  }

  async function confirmCheckout() {
    setShowConfirmModal(false);
    setProcessing(true);

    const result = await createSale({
      items: cart,
      total: grandTotal,
      tax: totalTax,
      discount: totalDiscount,
      userId: "",
      createdAt: Date.now(),
    });

    setProcessing(false);

    if (result.success) {
      setShowSuccessModal(true);
      setCart([]);
      setDiscount(0);
      setTax(0);
      setSearchResults([]);
      setSearchQuery("");
      setErrorMessage("");
    } else {
      setErrorMessage(result.error || "Transaksi gagal diproses.");
    }
  }

  return (
    <div className="h-[calc(100vh-6rem)] overflow-hidden flex flex-col gap-6">
      {/* HEADER */}
      <div className="flex shrink-0 items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span className="text-emerald-600">
              <Icons.Cart />
            </span>
            Sistem Kasir
          </h1>
          <p className="text-xs text-slate-500">
            Pengelolaan data obat, persediaan, harga, dan supplier.
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="text-right hidden sm:block">
            <p className="text-slate-500 text-xs">Operator</p>
            <p className="font-semibold text-slate-800">Admin Apotek</p>
          </div>
          <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs border border-emerald-200">
            AD
          </div>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* LEFT COLUMN: PRODUCT SEARCH & RESULTS */}
        <div className="flex flex-1 flex-col gap-4 overflow-hidden">
          {/* Search Bar */}
          <div className="shrink-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Icons.Search />
                </div>
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Scan barcode atau cari nama obat..."
                  className="block w-full rounded-lg border border-slate-300 bg-slate-50 p-2.5 pl-10 text-sm text-slate-900 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-300 disabled:opacity-50 shadow-md"
              >
                {loading ? "Mencari..." : "Cari"}
              </button>
            </form>
          </div>

          {/* Results List */}
          <div className="flex-1 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-sm p-4">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
              {searchResults.length > 0
                ? `Hasil Pencarian (${searchResults.length})`
                : "Katalog Produk"}
            </h3>

            {searchResults.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center text-slate-400">
                <div className="mb-3 rounded-full bg-emerald-50 p-4">
                  <svg
                    className="w-8 h-8 opacity-50 text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <p className="text-sm">
                  Ketikan nama obat untuk memulai transaksi.
                </p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {searchResults.map((medicine) => (
                  <button
                    key={medicine.id}
                    onClick={() => addToCart(medicine)}
                    className="group relative flex flex-col justify-between rounded-lg border border-slate-200 p-4 text-left hover:border-emerald-500 hover:bg-emerald-50/30 transition-all hover:shadow-md"
                  >
                    <div>
                      <p className="font-semibold text-slate-900 group-hover:text-emerald-700 truncate">
                        {medicine.name}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 border border-slate-200">
                          Stok: {medicine.stock}
                        </span>
                        {medicine.barcode && (
                          <span className="font-mono">{medicine.barcode}</span>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <p className="font-bold text-emerald-600 font-mono text-sm">
                        {formatRupiah(medicine.price)}
                      </p>
                      <span className="h-6 w-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <Icons.Plus />
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: CART / RECEIPT */}
        <div className="flex w-full max-w-md flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          {/* Cart Header */}
          <div className="border-b border-slate-100 bg-slate-50/50 p-4">
            <h2 className="font-semibold text-slate-800">Daftar Pesanan</h2>
            <p className="text-xs text-slate-500">
              {cart.length} item di keranjang
            </p>
          </div>

          {/* Cart Items (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-slate-400">
                <Icons.Cart />
                <p className="mt-2 text-sm">Keranjang kosong</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.medicineId}
                    className="flex flex-col gap-2 rounded-lg border border-slate-100 bg-white p-3 shadow-sm"
                  >
                    <div className="flex justify-between">
                      <span className="font-medium text-slate-800">
                        {item.name}
                      </span>
                      <span className="font-mono font-bold text-slate-900">
                        {formatRupiah(item.subtotal)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-slate-500 font-mono">
                        @ {formatRupiah(item.price)}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center rounded-md border border-slate-200 bg-slate-50">
                        <button
                          onClick={() => updateQuantity(item.medicineId, -1)}
                          className="px-2 py-1 text-slate-600 hover:bg-slate-200 hover:text-rose-600 transition"
                        >
                          {item.quantity === 1 ? (
                            <Icons.Trash />
                          ) : (
                            <Icons.Minus />
                          )}
                        </button>
                        <div className="w-8 text-center text-sm font-bold text-slate-800 border-x border-slate-200 bg-white py-1">
                          {item.quantity}
                        </div>
                        <button
                          onClick={() => updateQuantity(item.medicineId, 1)}
                          className="px-2 py-1 text-slate-600 hover:bg-slate-200 hover:text-emerald-600 transition"
                        >
                          <Icons.Plus />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Summary */}
          <div className="border-t border-slate-200 bg-slate-50 p-4 space-y-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            {/* Disc & Tax Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Diskon (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-full rounded border-slate-300 text-sm py-1.5 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Pajak (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={tax}
                  onChange={(e) => setTax(Number(e.target.value))}
                  className="w-full rounded border-slate-300 text-sm py-1.5 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Calculations Text */}
            <div className="space-y-1 pt-2 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span className="font-mono">{formatRupiah(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Diskon</span>
                  <span className="font-mono">
                    -{formatRupiah(totalDiscount)}
                  </span>
                </div>
              )}
              {tax > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Pajak</span>
                  <span className="font-mono">+{formatRupiah(totalTax)}</span>
                </div>
              )}
            </div>

            {/* Grand Total - CHANGED to Emerald Gradient */}
            <div className="rounded-lg bg-gradient-to-r from-emerald-700 to-emerald-600 p-4 text-white shadow-lg shadow-emerald-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium opacity-90">
                  Total Bayar
                </span>
                <span className="text-2xl font-bold font-mono">
                  {formatRupiah(grandTotal)}
                </span>
              </div>
            </div>

            {errorMessage && (
              <div className="rounded bg-rose-100 p-2 text-center text-xs text-rose-700 border border-rose-200">
                {errorMessage}
              </div>
            )}

            <button
              onClick={handleCheckoutClick}
              disabled={processing || cart.length === 0}
              className="w-full rounded-lg bg-emerald-600 py-3 text-sm font-bold text-white shadow-md transition hover:bg-emerald-500 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? "Memproses..." : "PROSES PEMBAYARAN"}
            </button>
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm scale-100 rounded-2xl bg-white shadow-2xl transition-all animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <span className="font-bold text-lg">$</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Konfirmasi
                  </h3>
                  <p className="text-sm text-slate-500">
                    Selesaikan transaksi ini?
                  </p>
                </div>
              </div>

              <div className="my-6 rounded-lg border border-emerald-100 bg-emerald-50/50 p-4 space-y-2">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Total Item</span>
                  <span className="font-bold">{cart.length} item</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Metode</span>
                  <span className="font-bold">Cash</span>
                </div>
                <div className="border-t border-emerald-200 pt-2 mt-2 flex justify-between items-center">
                  <span className="font-bold text-slate-800">
                    Total Tagihan
                  </span>
                  <span className="text-xl font-bold text-emerald-700 font-mono">
                    {formatRupiah(grandTotal)}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 rounded-lg border border-slate-300 bg-white py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  onClick={confirmCheckout}
                  className="flex-1 rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow hover:bg-emerald-500"
                >
                  Ya, Bayar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm text-center rounded-2xl bg-white p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 animate-in zoom-in duration-300 delay-100">
              <Icons.Check />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              Pembayaran Sukses!
            </h2>
            <p className="text-slate-500 mt-1">
              Transaksi telah tercatat di sistem.
            </p>

            <div className="mt-6 rounded-lg bg-slate-50 p-4 border border-slate-100">
              <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">
                Kembalian
              </p>
              <p className="text-sm text-slate-400 mt-1">
                (Simulasi Cash: Pas)
              </p>
            </div>

            {/* Button Transaksi Baru - Changed from Black to Emerald */}
            <button
              onClick={() => setShowSuccessModal(false)}
              className="mt-6 w-full rounded-lg bg-emerald-700 py-3 text-sm font-bold text-white hover:bg-emerald-800 transition shadow-md"
            >
              Transaksi Baru
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
