require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");
const { initializeApp, cert, getApps } = require("firebase-admin/app");

// Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Firebase Admin
if (!getApps().length) {
  try {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
  } catch (error) {
    console.error("Firebase admin initialization error", error);
    process.exit(1);
  }
}

const { getFirestore } = require("firebase-admin/firestore");
const db = getFirestore();

async function migrateTable(tableName) {
  console.log(`Migrating table: ${tableName}...`);
  const { data, error } = await supabase.from(tableName).select("*");
  if (error) {
    console.error(`Error fetching from ${tableName}:`, error);
    return;
  }
  
  console.log(`Found ${data.length} records in ${tableName}.`);
  const batch = db.batch();
  
  for (const record of data) {
    const docRef = db.collection(tableName).doc(String(record.id));
    // Firestore does not like undefined values, clean the record if necessary
    const cleanedRecord = Object.fromEntries(
      Object.entries(record).map(([k, v]) => {
        // Convert any ID fields to string
        if ((k === "id" || k.endsWith("Id")) && typeof v === "number") {
          return [k, String(v)];
        }
        return [k, v];
      }).filter(([_, v]) => v !== undefined && v !== null)
    );
    batch.set(docRef, cleanedRecord);
  }
  
  await batch.commit();
  console.log(`Successfully migrated ${tableName}.`);
}

async function migrate() {
  await migrateTable("admins");
  await migrateTable("houses");
  await migrateTable("renters");
  await migrateTable("bills");
  console.log("Migration complete!");
}

migrate().catch(console.error);
