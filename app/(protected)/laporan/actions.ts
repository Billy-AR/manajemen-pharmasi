"use server";

import { adminDb } from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/auth";
import type { Sale, Medicine } from "@/types";

export async function getSalesReport(startDate?: number, endDate?: number) {
  await requireAdmin();

  try {
    let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = adminDb.collection("sales").orderBy("createdAt", "desc");

    if (startDate) {
      query = query.where("createdAt", ">=", startDate);
    }
    if (endDate) {
      query = query.where("createdAt", "<=", endDate);
    }

    const snapshot = await query.limit(100).get();
    const sales: Sale[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Sale, "id">),
    }));

    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalTransactions = sales.length;

    return { sales, totalRevenue, totalTransactions };
  } catch (error) {
    console.error("Error fetching sales report:", error);
    return { sales: [], totalRevenue: 0, totalTransactions: 0 };
  }
}

export async function getLowStockReport() {
  await requireAdmin();

  try {
    const snapshot = await adminDb.collection("medicines").get();
    const lowStock: Medicine[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data() as Omit<Medicine, "id">;
      if (data.stock <= data.minStock) {
        lowStock.push({
          id: doc.id,
          ...data,
        });
      }
    });

    return lowStock.sort((a, b) => a.stock - b.stock);
  } catch (error) {
    console.error("Error fetching low stock report:", error);
    return [];
  }
}

export async function getExpiringSoonReport(daysAhead: number = 30) {
  await requireAdmin();

  try {
    const expiryThreshold = Date.now() + daysAhead * 24 * 60 * 60 * 1000;
    const snapshot = await adminDb.collection("medicines").where("expiredAt", "<=", expiryThreshold).where("expiredAt", ">", Date.now()).get();

    const expiringSoon: Medicine[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Medicine, "id">),
    }));

    return expiringSoon.sort((a, b) => (a.expiredAt || 0) - (b.expiredAt || 0));
  } catch (error) {
    console.error("Error fetching expiring soon report:", error);
    return [];
  }
}
