import { db } from "@/lib/firebaseAdmin";
import { RenterRequest, RequestStatus } from "@/models/request";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../../middleware/auth";

// ─── GET /api/admin/requests — list all requests for this admin's renters ────
export async function GET(request: NextRequest) {
  const tokenData = await verifyToken(request);
  if (!tokenData) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const snapshot = await db
      .collection("requests")
      .where("adminId", "==", tokenData.id)
      .get();

    const data = snapshot.docs
      .map((doc) => formatResponse(doc.id, doc.data()))
      .sort((a, b) => {
        const aTime = (a.createdAt as any)?._seconds ?? new Date(a.createdAt as any).getTime() / 1000;
        const bTime = (b.createdAt as any)?._seconds ?? new Date(b.createdAt as any).getTime() / 1000;
        return bTime - aTime;
      });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ─── PATCH /api/admin/requests — update status and/or adminNote ──────────────
export async function PATCH(req: NextRequest) {
  const tokenData = await verifyToken(req);
  if (!tokenData) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: { id: string; status?: RequestStatus; adminNote?: string } = await req.json();
    const { id, status, adminNote } = body;

    if (!id) {
      return NextResponse.json({ message: "id is required." }, { status: 400 });
    }

    const docRef = db.collection("requests").doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ message: "Request not found." }, { status: 404 });
    }
    if (docSnap.data()?.adminId !== tokenData.id) {
      return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }

    const updateData: Record<string, any> = {};
    if (status) updateData.status = status;
    if (adminNote !== undefined) updateData.adminNote = adminNote;
    if (status === "resolved") updateData.resolvedAt = new Date();

    await docRef.update(updateData);

    const updated = await docRef.get();
    return NextResponse.json(formatResponse(updated.id, updated.data()!));
  } catch (error: any) {
    return NextResponse.json({ message: "Something went wrong: " + error.message }, { status: 500 });
  }
}

function formatResponse(id: string, data: any): RenterRequest {
  return {
    id,
    renterId: data.renterId,
    renterName: data.renterName,
    propertyId: data.propertyId,
    type: data.type,
    subject: data.subject,
    message: data.message,
    status: data.status,
    createdAt: data.createdAt,
    resolvedAt: data.resolvedAt,
    adminNote: data.adminNote,
  };
}
