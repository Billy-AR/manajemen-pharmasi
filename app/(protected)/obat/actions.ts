"use server";

import { adminDb } from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/auth";
import type { Medicine } from "@/types";
import { revalidatePath } from "next/cache";

export async function getMedicines(search?: string) {
  await requireAdmin();

  try {
    if (search) {
      // Firestore doesn't support case-insensitive search, so we'll filter client-side
      const snapshot = await adminDb.collection("medicines").get();
      const medicines: Medicine[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data() as Omit<Medicine, "id">;
        if (data.name.toLowerCase().includes(search.toLowerCase())) {
          medicines.push({
            id: doc.id,
            ...data,
          });
        }
      });

      return medicines;
    }

    const query = adminDb.collection("medicines").orderBy("name");
    const snapshot = await query.get();
    const medicines: Medicine[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Medicine, "id">),
    }));

    return medicines;
  } catch (error) {
    console.error("Error fetching medicines:", error);
    return [];
  }
}

export async function createMedicine(data: Omit<Medicine, "id" | "createdAt" | "updatedAt">) {
  await requireAdmin();

  try {
    const now = Date.now();
    await adminDb.collection("medicines").add({
      ...data,
      createdAt: now,
      updatedAt: now,
    });

    revalidatePath("/obat");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error creating medicine:", error);
    return { success: false, error: "Gagal menambah obat" };
  }
}

export async function updateMedicine(id: string, data: Partial<Omit<Medicine, "id" | "createdAt">>) {
  await requireAdmin();

  try {
    await adminDb
      .collection("medicines")
      .doc(id)
      .update({
        ...data,
        updatedAt: Date.now(),
      });

    revalidatePath("/obat");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error updating medicine:", error);
    return { success: false, error: "Gagal update obat" };
  }
}

export async function deleteMedicine(id: string) {
  await requireAdmin();

  try {
    await adminDb.collection("medicines").doc(id).delete();

    revalidatePath("/obat");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error deleting medicine:", error);
    return { success: false, error: "Gagal menghapus obat" };
  }
}
