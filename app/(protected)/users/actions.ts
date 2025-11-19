"use server";

import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/auth";
import type { User } from "@/types";
import { revalidatePath } from "next/cache";

export async function getUsers() {
  await requireAdmin();

  try {
    const snapshot = await adminDb.collection("users").orderBy("email").get();
    const users: User[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<User, "id">),
    }));

    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

export async function createUser(email: string, password: string, role: "admin" | "staff") {
  await requireAdmin();

  try {
    // Create auth user
    const userRecord = await adminAuth.createUser({
      email,
      password,
    });

    // Store user data in Firestore
    await adminDb.collection("users").doc(userRecord.uid).set({
      email,
      role,
      createdAt: Date.now(),
    });

    // Set custom claims for role
    await adminAuth.setCustomUserClaims(userRecord.uid, { role });

    revalidatePath("/users");
    return { success: true };
  } catch (error) {
    console.error("Error creating user:", error);
    return { success: false, error: "Gagal membuat user" };
  }
}

export async function updateUserRole(id: string, role: "admin" | "staff") {
  await requireAdmin();

  try {
    await adminDb.collection("users").doc(id).update({
      role,
    });

    await adminAuth.setCustomUserClaims(id, { role });

    revalidatePath("/users");
    return { success: true };
  } catch (error) {
    console.error("Error updating user role:", error);
    return { success: false, error: "Gagal update role" };
  }
}

export async function deleteUser(id: string) {
  await requireAdmin();

  try {
    // Delete from Auth
    await adminAuth.deleteUser(id);

    // Delete from Firestore
    await adminDb.collection("users").doc(id).delete();

    revalidatePath("/users");
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: "Gagal menghapus user" };
  }
}
