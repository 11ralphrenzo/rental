import { db } from "@/lib/firebaseAdmin";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/app/api/middleware/auth";

export async function POST(req: NextRequest) {
  const tokenData = await verifyToken(req);
  if (!tokenData) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const adminId = tokenData.id;
  const collections = ["properties", "renters", "bills", "utilities"];
  let updatedCount = 0;

  try {
    for (const coll of collections) {
      const snapshot = await db.collection(coll).get();
      
      const batch = db.batch();
      let hasUpdates = false;

      for (const doc of snapshot.docs) {
        const data = doc.data();
        if (!data.adminId) {
          batch.update(doc.ref, { adminId });
          hasUpdates = true;
          updatedCount++;
        }
      }

      if (hasUpdates) {
        await batch.commit();
      }
    }

    return NextResponse.json({ 
      message: `Successfully linked ${updatedCount} legacy records to your account.`,
      linkedRecords: updatedCount
    });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
