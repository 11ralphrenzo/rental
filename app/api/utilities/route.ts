import { db } from "@/lib/firebaseAdmin";
import { Utility } from "@/models/utility";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../middleware/auth";

export async function GET(request: NextRequest) {
  const tokenData = await verifyToken(request);

  if (!tokenData) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const snapshot = await db.collection("utilities").where("adminId", "==", tokenData.id).get();
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Utility));
    data.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    return NextResponse.json(data.map(formatResponse));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const tokenData = await verifyToken(req);
  if (!tokenData) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const body: Utility = await req.json();
    const { name, rate, unit } = body;

    const newDoc = db.collection("utilities").doc();
    const id = newDoc.id;
    const utilityData = Object.fromEntries(
      Object.entries({ id, name, rate, unit, adminId: tokenData.id, createdAt: new Date() }).filter(([_, v]) => v !== undefined && v !== null && !Number.isNaN(v))
    );
    
    await newDoc.set(utilityData);

    return NextResponse.json(formatResponse(utilityData as unknown as Utility));
  } catch (err: any) {
    return NextResponse.json(
      { message: "Something went wrong." + err },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  const tokenData = await verifyToken(req);
  if (!tokenData) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const body: Utility = await req.json();
    const { id, name, rate, unit } = body;

    if (!id) {
       return NextResponse.json({ message: "ID is required" }, { status: 400 });
    }

    const docRef = db.collection("utilities").doc(id);
    const docSnap = await docRef.get();
    if (!docSnap.exists || (docSnap.data()?.adminId && docSnap.data()?.adminId !== tokenData.id)) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const updateData = Object.fromEntries(
      Object.entries({ name, rate, unit }).filter(([_, v]) => v !== undefined && v !== null && !Number.isNaN(v))
    );
    await docRef.update(updateData);
    
    const updatedDoc = await docRef.get();
    const data = { id: updatedDoc.id, ...updatedDoc.data() } as Utility;

    return NextResponse.json(formatResponse(data));
  } catch (err: any) {
    return NextResponse.json(
      { message: "Something went wrong." + err },
      { status: 500 },
    );
  }
}

const formatResponse = (utility: Utility) => ({
  id: utility.id,
  name: utility.name,
  rate: utility.rate,
  unit: utility.unit,
});
