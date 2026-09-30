import { db } from "@/lib/firebaseAdmin";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../../middleware/auth";
import { Admin } from "@/models/admin";

export async function GET(request: NextRequest) {
  const tokenData = await verifyToken(request);

  if (!tokenData) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const docSnap = await db.collection("admins").doc(tokenData.id).get();
    if (!docSnap.exists) {
      return NextResponse.json({});
    }
    return NextResponse.json(docSnap.data());
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const tokenData = await verifyToken(req);
  if (!tokenData) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const body: Partial<Admin> = await req.json();
    const { messenger, viber, payment_channels } = body;

    const docRef = db.collection("admins").doc(tokenData.id);
    await docRef.set({
      messenger: messenger || "",
      viber: viber || "",
      payment_channels: payment_channels ?? [],
      updatedAt: new Date(),
    }, { merge: true });
    
    const updatedDoc = await docRef.get();
    return NextResponse.json(updatedDoc.data());
  } catch (err: any) {
    return NextResponse.json(
      { message: "Something went wrong. " + err },
      { status: 500 },
    );
  }
}
