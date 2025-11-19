"use client";

import { useState, useEffect } from "react";
import { getUsers, createUser, updateUserRole, deleteUser } from "./actions";
import type { User } from "@/types";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "staff" as "admin" | "staff",
  });

  useEffect(() => {
    let isMounted = true;

    async function loadUsers() {
      if (isMounted) {
        setLoading(true);
        const data = await getUsers();
        if (isMounted) {
          setUsers(data);
          setLoading(false);
        }
      }
    }

    loadUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  async function loadUsers() {
    setLoading(true);
    const data = await getUsers();
    setUsers(data);
    setLoading(false);
  }

  function resetForm() {
    setFormData({
      email: "",
      password: "",
      role: "staff",
    });
    setShowForm(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const result = await createUser(formData.email, formData.password, formData.role);

    if (result.success) {
      await loadUsers();
      resetForm();
    } else {
      alert(result.error);
    }

    setLoading(false);
  }

  async function handleRoleChange(id: string, role: "admin" | "staff") {
    if (!confirm(`Ubah role user menjadi ${role}?`)) return;

    setLoading(true);
    const result = await updateUserRole(id, role);
    if (result.success) {
      await loadUsers();
    } else {
      alert(result.error);
    }
    setLoading(false);
  }

  async function handleDelete(id: string, email: string) {
    if (!confirm(`Hapus user "${email}"?`)) return;

    setLoading(true);
    const result = await deleteUser(id);
    if (result.success) {
      await loadUsers();
    } else {
      alert(result.error);
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-emerald-100/80 bg-white/80 px-4 py-4 text-slate-800 shadow-[0_20px_60px_-40px_rgba(16,185,129,0.5)] backdrop-blur md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">User Management</p>
          <h1 className="text-2xl font-bold text-slate-900">Kelola User & Role</h1>
          <p className="text-sm text-slate-500">Admin dan staff dengan pembatasan akses</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500">
          {showForm ? "Tutup Form" : "+ Tambah User"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-white/70 bg-white/90 p-6 shadow-[0_20px_40px_-35px_rgba(16,185,129,0.6)] backdrop-blur">
          <h3 className="text-lg font-semibold text-slate-900">Tambah User Baru</h3>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-900">
                Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-900">
                Password <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-900">
                Role <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as "admin" | "staff" })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50">
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
            <button type="button" onClick={resetForm} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              Batal
            </button>
          </div>
        </form>
      )}

      <div className="rounded-2xl border border-white/70 bg-white/90 p-6 shadow-[0_20px_40px_-35px_rgba(16,185,129,0.6)] backdrop-blur">
        {loading ? (
          <div className="py-12 text-center text-sm text-slate-500">Loading...</div>
        ) : users.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-500">Belum ada user. Tambah user baru.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <th className="px-3 py-3 font-semibold text-slate-700">Email</th>
                  <th className="px-3 py-3 font-semibold text-slate-700">Role</th>
                  <th className="px-3 py-3 font-semibold text-slate-700">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-3 py-3">
                      <div>
                        <p className="font-semibold text-slate-800">{user.email}</p>
                        {user.displayName && <p className="text-xs text-slate-500">{user.displayName}</p>}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as "admin" | "staff")}
                        className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-900 outline-none focus:border-emerald-400"
                      >
                        <option value="admin">Admin</option>
                        <option value="staff">Staff</option>
                      </select>
                    </td>
                    <td className="px-3 py-3">
                      <button onClick={() => handleDelete(user.id, user.email)} className="rounded-lg bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-200">
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <p className="font-semibold">💡 Catatan:</p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-xs">
          <li>Admin: Akses penuh ke semua fitur</li>
          <li>Staff: Akses terbatas (kasir dan view data saja)</li>
          <li>Password minimal 6 karakter</li>
        </ul>
      </div>
    </div>
  );
}
