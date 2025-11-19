"use server";

import { adminDb } from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/auth";
import type { Sale, Medicine } from "@/types";
import { revalidatePath } from "next/cache";

export async function searchMedicines(query: string) {
  await requireAdmin();

  try {
    const snapshot = await adminDb.collection("medicines").get();
    const medicines: Medicine[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data() as Omit<Medicine, "id">;
      const searchTerm = query.toLowerCase();
      if (data.name.toLowerCase().includes(searchTerm) || data.barcode?.toLowerCase().includes(searchTerm)) {
        medicines.push({
          id: doc.id,
          ...data,
        });
      }
    });

    return medicines.slice(0, 10); // Limit results
  } catch (error) {
    console.error("Error searching medicines:", error);
    return [];
  }
}

export async function createSale(sale: Omit<Sale, "id">) {
  const user = await requireAdmin();

  try {
    const batch = adminDb.batch();

    // Add sale
    const saleRef = adminDb.collection("sales").doc();
    batch.set(saleRef, {
      ...sale,
      userId: user.uid,
      createdAt: Date.now(),
    });

    // Update stock for each item
    for (const item of sale.items) {
      const medicineRef = adminDb.collection("medicines").doc(item.medicineId);
      const medicineDoc = await medicineRef.get();

      if (medicineDoc.exists) {
        const currentStock = medicineDoc.data()?.stock || 0;
        batch.update(medicineRef, {
          stock: currentStock - item.quantity,
          updatedAt: Date.now(),
        });
      }
    }

    await batch.commit();

    revalidatePath("/kasir");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error creating sale:", error);
    return { success: false, error: "Gagal membuat transaksi" };
  }
}

export async function getSales(startDate?: number, endDate?: number) {
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

    return sales;
  } catch (error) {
    console.error("Error fetching sales:", error);
    return [];
  }
}
