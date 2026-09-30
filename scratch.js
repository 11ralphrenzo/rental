const admin = require("firebase-admin");
const { getApps } = require("firebase-admin/app");

if (getApps().length === 0) {
  admin.initializeApp({ projectId: "demo-rental" }); // Assuming local emulator or something, wait no, firebaseClient.ts might have real config. Let's see firebaseClient.ts
}
