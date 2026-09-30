import { initializeApp, cert, getApps, getApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

let app: any;
let initError: any = null;

try {
  if (!getApps().length) {
    let privateKey = process.env.FIREBASE_PRIVATE_KEY || "";
    if (privateKey) {
      privateKey = privateKey.replace(/\\n/g, "\n");
      if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
        privateKey = privateKey.slice(1, -1);
      }
    }
    
    app = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });
  } else {
    app = getApp();
  }
} catch (error) {
  initError = error;
  console.error("Firebase admin initialization error", error);
}

export const db = new Proxy({}, {
  get: (target, prop) => {
    if (initError) throw new Error("Firebase init failed: " + (initError.message || initError));
    return (getFirestore(app) as any)[prop];
  }
}) as ReturnType<typeof getFirestore>;

export const adminAuth = new Proxy({}, {
  get: (target, prop) => {
    if (initError) throw new Error("Firebase init failed: " + (initError.message || initError));
    return (getAuth(app) as any)[prop];
  }
}) as ReturnType<typeof getAuth>;
