"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/firebaseAdmin";
import { RequestType } from "@/models/request";

export async function refreshRenterData(id: string) {
  revalidatePath(`/r/${id}`);
}

const RATE_LIMIT: Record<RequestType, { maxOpen: number; cooldownHours: number }> = {
  early_payment: { maxOpen: 1, cooldownHours: 24 },
  maintenance:   { maxOpen: 1, cooldownHours: 24 },
  inquiry:       { maxOpen: 3, cooldownHours: 24 },
  concern:       { maxOpen: 2, cooldownHours: 24 },
  other:         { maxOpen: 2, cooldownHours: 24 },
};

export async function createPublicRequest(
  renterId: string,
  type: RequestType,
  subject: string,
  message: string
) {
  if (!renterId || !type || !subject || !message) {
    throw new Error("Missing required fields.");
  }

  const limit = RATE_LIMIT[type];
  if (!limit) throw new Error("Invalid request type.");

  // Fetch renter info to attach name and adminId
  const renterDoc = await db.collection("renters").doc(renterId).get();
  if (!renterDoc.exists) {
    throw new Error("Renter not found.");
  }
  const renterData = renterDoc.data()!;

  // Check if admin allows requests
  if (renterData.adminId) {
    const adminDoc = await db.collection("admins").doc(renterData.adminId).get();
    if (adminDoc.exists && adminDoc.data()?.allow_requests === false) {
      throw new Error("Requests are currently disabled by your admin.");
    }
  }

  const cooldownStart = new Date(Date.now() - limit.cooldownHours * 60 * 60 * 1000);

  // Rate limiting checks
  const allSameTypeSnapshot = await db
    .collection("requests")
    .where("renterId", "==", renterId)
    .where("type", "==", type)
    .get();

  const allSameType = allSameTypeSnapshot.docs.map((d) => d.data());

  const openCount = allSameType.filter(
    (r) => r.status === "pending" || r.status === "seen"
  ).length;
  if (openCount >= limit.maxOpen) {
    throw new Error(`You already have an open ${type.replace("_", " ")} request. Please wait for it to be resolved first.`);
  }

  const recentCount = allSameType.filter((r) => {
    const ts = r.createdAt?._seconds
      ? r.createdAt._seconds * 1000
      : new Date(r.createdAt).getTime();
    return ts >= cooldownStart.getTime();
  }).length;
  if (recentCount >= limit.maxOpen) {
    throw new Error(`You've reached the limit for ${type.replace("_", " ")} requests. Please wait before submitting another.`);
  }

  const newDoc = db.collection("requests").doc();
  const requestData = {
    id: newDoc.id,
    renterId,
    renterName: renterData.name,
    propertyId: renterData.propertyId || null,
    adminId: renterData.adminId,
    type,
    subject: subject.trim(),
    message: message.trim(),
    status: "pending",
    createdAt: new Date(),
  };

  await newDoc.set(requestData);
  return { success: true };
}
