import { db } from "@/lib/firebaseAdmin";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../../middleware/auth";

export async function DELETE(request: NextRequest) {
  const tokenData = await verifyToken(request);
  if (!tokenData) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const url = new URL(request.url);
    const segments = url.pathname.split("/");
    const id = segments.at(-1);

    if (!id) {
      return NextResponse.json(
        { message: "ID is not a valid input." },
        { status: 400 },
      );
    }

    const docRef = db.collection("utilities").doc(id);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) {
       return NextResponse.json(true);
    }
    
    if (docSnap.data()?.adminId && docSnap.data()?.adminId !== tokenData.id) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await docRef.delete();

    return NextResponse.json(true);
  } catch (err: any) {
    return NextResponse.json(
      { message: "Something went wrong." + err },
      { status: 500 },
    );
  }
}