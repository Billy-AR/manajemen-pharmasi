"use server";

import { adminDb } from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/auth";
import type { Medicine } from "@/types";

export async function getDashboardStats() {
  await requireAdmin();

  try {
    // Total obat
    const medicinesSnapshot = await adminDb.collection("medicines").count().get();
    const totalMedicines = medicinesSnapshot.data().count;

    // Stok rendah (stock <= minStock)
    const lowStockSnapshot = await adminDb.collection("medicines").where("stock", "<=", 10).get();
    const lowStockCount = lowStockSnapshot.size;

    // Obat akan kadaluarsa (30 hari ke depan)
    const thirtyDaysFromNow = Date.now() + 30 * 24 * 60 * 60 * 1000;
    const expiringSoonSnapshot = await adminDb.collection("medicines").where("expiredAt", "<=", thirtyDaysFromNow).where("expiredAt", ">", Date.now()).get();
    const expiringSoonCount = expiringSoonSnapshot.size;

    // Total penjualan hari ini
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const salesSnapshot = await adminDb.collection("sales").where("createdAt", ">=", startOfDay.getTime()).get();

    let todaySales = 0;
    const todayTransactions = salesSnapshot.size;

    salesSnapshot.forEach((doc) => {
      const data = doc.data();
      todaySales += data.total || 0;
    });

    // Peringatan dikirim (bulan ini)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const alertsSnapshot = await adminDb.collection("alerts").where("createdAt", ">=", startOfMonth.getTime()).get();
    const alertsCount = alertsSnapshot.size;

    // Ambil data stok rendah dan kadaluarsa
    const lowStockItems: Medicine[] = lowStockSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Medicine, "id">),
    }));

    const expiringSoonItems: Medicine[] = expiringSoonSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Medicine, "id">),
    }));

    return {
      totalMedicines,
      lowStockCount,
      lowStockItems,
      expiringSoonCount,
      expiringSoonItems,
      todaySales,
      todayTransactions,
      alertsCount,
    };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error fetching dashboard stats:", err.message);

    // Return empty data if Firestore is not enabled yet
    return {
      totalMedicines: 0,
      lowStockCount: 0,
      lowStockItems: [],
      expiringSoonCount: 0,
      expiringSoonItems: [],
      todaySales: 0,
      todayTransactions: 0,
      alertsCount: 0,
    };
  }
}
