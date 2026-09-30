import { db } from "@/lib/firebaseAdmin";
import { notFound } from "next/navigation";
import { Renter } from "@/models/renter";
import { Bill } from "@/models/bill";
import { Property } from "@/models/property";
import { RenterPortalClient } from "./portal-client";

export const revalidate = 3600; // Cache for 1 hour

export default async function RenterPortal({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const renterDoc = await db.collection("renters").doc(id).get();
  if (!renterDoc.exists) notFound();

  const renter = { id: renterDoc.id, ...renterDoc.data() } as Renter;

  let property: Property | null = null;
  let adminId: string | null = null;
  
  if (renter.propertyId) {
    const propDoc = await db.collection("properties").doc(renter.propertyId).get();
    if (propDoc.exists) {
      property = { id: propDoc.id, ...propDoc.data() } as Property;
      adminId = propDoc.data()?.adminId || null;
    }
  }
  
  // Fallback to renter.adminId if needed, though property is the source of truth
  if (!adminId && (renter as any).adminId) {
    adminId = (renter as any).adminId;
  }
  
  let messenger = null;
  let viber = null;
  let paymentChannels = [];
  if (adminId) {
    const adminDoc = await db.collection("admins").doc(adminId).get();
    if (adminDoc.exists) {
      const adminData = adminDoc.data();
      messenger = adminData?.messenger || null;
      viber = adminData?.viber || null;
      paymentChannels = adminData?.payment_channels || [];
    }
  }

  const billsSnapshot = await db.collection("bills").where("renterId", "==", id).get();
  const bills = billsSnapshot.docs
    .map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        month: data.month?.toDate ? data.month.toDate().toISOString() : data.month,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
      };
    })
    .sort((a, b) => new Date(b.month).getTime() - new Date(a.month).getTime());

  const unpaidBills = (bills as any[]).filter(b => b.status !== "PAID") as unknown as Bill[];
  const paidBills = (bills as any[]).filter(b => b.status === "PAID") as unknown as Bill[];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let nextBillingDate: string | null = null;
  let daysUntilBilling: number | null = null;
  if (typeof renter.billing_day === "number") {
    let next = new Date(today.getFullYear(), today.getMonth(), renter.billing_day);
    if (next <= today) next = new Date(today.getFullYear(), today.getMonth() + 1, renter.billing_day);
    nextBillingDate = next.toISOString();
    daysUntilBilling = Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  const totalUnpaid = unpaidBills.reduce((sum, b) => sum + (b.total || 0), 0);

  return (
    <RenterPortalClient
      renterId={id}
      renterName={renter.name}
      propertyName={property?.name || "No Property Assigned"}
      billingDay={renter.billing_day}
      daysUntilBilling={daysUntilBilling}
      nextBillingDate={nextBillingDate}
      totalUnpaid={totalUnpaid}
      unpaidBills={unpaidBills}
      paidBills={paidBills}
      messenger={messenger}
      viber={viber}
      paymentChannels={paymentChannels}
    />
  );
}
