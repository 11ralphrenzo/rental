import { db } from "./lib/firebaseAdmin";

async function main() {
  const snapshot = await db.collection("bills").get();
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    console.log(`Bill ${doc.id}: month=`, data.month, `type=`, typeof data.month, `isTimestamp=`, data.month && typeof data.month.toDate === 'function');
  });
}
main().catch(console.error);
