"use server";

import { adminDb } from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/auth";
import type { Supplier } from "@/types";
import { revalidatePath } from "next/cache";

export async function getSuppliers() {
  await requireAdmin();

  try {
    const snapshot = await adminDb.collection("suppliers").orderBy("name").get();
    const suppliers: Supplier[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Supplier, "id">),
    }));

    return suppliers;
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return [];
  }
}

export async function createSupplier(data: Omit<Supplier, "id" | "createdAt" | "updatedAt">) {
  await requireAdmin();

  try {
    const now = Date.now();
    await adminDb.collection("suppliers").add({
      ...data,
      createdAt: now,
      updatedAt: now,
    });

    revalidatePath("/supplier");
    return { success: true };
  } catch (error) {
    console.error("Error creating supplier:", error);
    return { success: false, error: "Gagal menambah supplier" };
  }
}

export async function updateSupplier(id: string, data: Partial<Omit<Supplier, "id" | "createdAt">>) {
  await requireAdmin();

  try {
    await adminDb
      .collection("suppliers")
      .doc(id)
      .update({
        ...data,
        updatedAt: Date.now(),
      });

    revalidatePath("/supplier");
    return { success: true };
  } catch (error) {
    console.error("Error updating supplier:", error);
    return { success: false, error: "Gagal update supplier" };
  }
}

export async function deleteSupplier(id: string) {
  await requireAdmin();

  try {
    await adminDb.collection("suppliers").doc(id).delete();

    revalidatePath("/supplier");
    return { success: true };
  } catch (error) {
    console.error("Error deleting supplier:", error);
    return { success: false, error: "Gagal menghapus supplier" };
  }
}
