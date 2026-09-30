import { db } from "@/lib/firebaseAdmin";
import { RenterRequest, RequestType } from "@/models/request";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../../middleware/auth";

// ─── Rate limiting config per request type ────────────────────────────────────
const RATE_LIMIT: Record<RequestType, { maxOpen: number; cooldownHours: number }> = {
  early_payment: { maxOpen: 1, cooldownHours: 24 },
  maintenance:   { maxOpen: 1, cooldownHours: 24 },
  inquiry:       { maxOpen: 3, cooldownHours: 24 },
  concern:       { maxOpen: 2, cooldownHours: 24 },
  other:         { maxOpen: 2, cooldownHours: 24 },
};

// ─── GET  /api/renter/requests  — list renter's own requests ─────────────────
export async function GET(request: NextRequest) {
  const tokenData = await verifyToken(request);
  if (!tokenData) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const snapshot = await db
      .collection("requests")
      .where("renterId", "==", tokenData.id)
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

// ─── POST /api/renter/requests  — submit a new request ───────────────────────
export async function POST(req: NextRequest) {
  const tokenData = await verifyToken(req);
  if (!tokenData) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: Pick<RenterRequest, "type" | "subject" | "message"> = await req.json();
    const { type, subject, message } = body;

    if (!type || !subject || !message) {
      return NextResponse.json({ message: "type, subject, and message are required." }, { status: 400 });
    }

    const limit = RATE_LIMIT[type];
    if (!limit) {
      return NextResponse.json({ message: "Invalid request type." }, { status: 400 });
    }

    // ── Rate limiting: single query, filter in-memory (no composite index needed) ──
    const cooldownStart = new Date(Date.now() - limit.cooldownHours * 60 * 60 * 1000);

    const allSameTypeSnapshot = await db
      .collection("requests")
      .where("renterId", "==", tokenData.id)
      .where("type", "==", type)
      .get();

    const allSameType = allSameTypeSnapshot.docs.map((d) => d.data());

    // Block if already has open (pending/seen) requests of this type
    const openCount = allSameType.filter(
      (r) => r.status === "pending" || r.status === "seen"
    ).length;
    if (openCount >= limit.maxOpen) {
      return NextResponse.json(
        {
          message: `You already have an open ${type.replace("_", " ")} request. Please wait for it to be resolved first.`,
        },
        { status: 429 }
      );
    }

    // Block if submitted too many within the cooldown window (even if resolved)
    const recentCount = allSameType.filter((r) => {
      const ts = r.createdAt?._seconds
        ? r.createdAt._seconds * 1000
        : new Date(r.createdAt).getTime();
      return ts >= cooldownStart.getTime();
    }).length;
    if (recentCount >= limit.maxOpen) {
      return NextResponse.json(
        {
          message: `You've reached the limit for ${type.replace("_", " ")} requests. Please wait before submitting another.`,
        },
        { status: 429 }
      );
    }

    // ── Fetch renter info to attach name and adminId ──────────────────────────
    const renterDoc = await db.collection("renters").doc(tokenData.id).get();
    if (!renterDoc.exists) {
      return NextResponse.json({ message: "Renter not found." }, { status: 404 });
    }
    const renterData = renterDoc.data()!;

    const newDoc = db.collection("requests").doc();
    const requestData = {
      id: newDoc.id,
      renterId: tokenData.id,
      renterName: renterData.name || tokenData.name,
      propertyId: renterData.propertyId || null,
      adminId: renterData.adminId,
      type,
      subject: subject.trim(),
      message: message.trim(),
      status: "pending",
      createdAt: new Date(),
    };

    await newDoc.set(requestData);

    return NextResponse.json(formatResponse(newDoc.id, requestData), { status: 201 });
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
