import { getApps, initializeApp, applicationDefault, cert } from "firebase-admin/app";
import { getAuth as getAdminAuth } from "firebase-admin/auth";
import { getFirestore as getAdminDb } from "firebase-admin/firestore";

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : undefined;

const adminApp =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp({
        credential: serviceAccountJson ? cert(serviceAccountJson) : applicationDefault(),
      });

export const adminAuth = getAdminAuth(adminApp);
export const adminDb = getAdminDb(adminApp);
