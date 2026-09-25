import { db } from "@/lib/firebaseAdmin";
import { Bill } from "@/models/bill";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../middleware/auth";
import { Renter } from "@/models/renter";
import { Property } from "@/models/property";

export async function GET(request: NextRequest) {
  const tokenData = await verifyToken(request);

  if (!tokenData) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const renterId = searchParams.get("renterId");

  try {
    let query: FirebaseFirestore.Query = db.collection("bills").where("adminId", "==", tokenData.id);
    
    if (renterId) {
      query = query.where("renterId", "==", renterId);
    }

    const snapshot = await query.get();
    
    // Fetch all renters and properties to map them
    const rentersSnapshot = await db.collection("renters").where("adminId", "==", tokenData.id).get();
    const propertiesSnapshot = await db.collection("properties").where("adminId", "==", tokenData.id).get();
    
    const propertiesMap = new Map<string, Property>();
    propertiesSnapshot.docs.forEach(doc => {
      propertiesMap.set(doc.id, { id: doc.id, ...doc.data() } as Property);
    });

    const rentersMap = new Map<string, Renter>();
    rentersSnapshot.docs.forEach(doc => {
      const renterData = { id: doc.id, ...doc.data() } as Renter;
      renterData.property = propertiesMap.get(renterData.propertyId);
      rentersMap.set(doc.id, renterData);
    });

    const data = snapshot.docs.map((doc) => {
      const billData = { id: doc.id, ...doc.data() } as Bill;
      billData.renter = rentersMap.get(billData.renterId);
      return billData;
    });
    
    data.sort((a, b) => (b.month || "").localeCompare(a.month || ""));

    return NextResponse.json(data.map(formatResponse));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const tokenData = await verifyToken(req);
  if (!tokenData) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const body: Bill = await req.json();
    const {
      renterId,
      month,
      rent,
      utilities,
      customCharges,
      total,
      status,
    } = body;

    const newDoc = db.collection("bills").doc();
    const id = newDoc.id;
    const billData = Object.fromEntries(
      Object.entries({
        id,
        renterId,
        month,
        rent,
        utilities: utilities || [],
        customCharges: customCharges || [],
        total,
        status,
        adminId: tokenData.id,
        createdAt: new Date()
      }).filter(([_, v]) => v !== undefined && v !== null && (typeof v !== 'number' || !Number.isNaN(v)))
    );
    
    await newDoc.set(billData);

    const data = { ...billData } as unknown as Bill;
    if (renterId) {
       const renterDoc = await db.collection("renters").doc(renterId).get();
       if (renterDoc.exists && renterDoc.data()?.adminId === tokenData.id) {
          data.renter = { id: renterDoc.id, ...renterDoc.data() } as Renter;
          if (data.renter.propertyId) {
             const propDoc = await db.collection("properties").doc(data.renter.propertyId).get();
             if (propDoc.exists && propDoc.data()?.adminId === tokenData.id) {
                data.renter.property = { id: propDoc.id, ...propDoc.data() } as Property;
             }
          }
       }
    }

    return NextResponse.json(formatResponse(data));
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
    const body: Bill = await req.json();
    const {
      id,
      renterId,
      month,
      rent,
      utilities,
      customCharges,
      total,
      status,
    } = body;

    if (!id) {
       return NextResponse.json({ message: "ID is required" }, { status: 400 });
    }

    const docRef = db.collection("bills").doc(id);
    const docSnap = await docRef.get();
    if (!docSnap.exists || (docSnap.data()?.adminId && docSnap.data()?.adminId !== tokenData.id)) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const updateData = Object.fromEntries(
      Object.entries({
        renterId,
        month,
        rent,
        utilities: utilities || [],
        customCharges: customCharges || [],
        total,
        status,
      }).filter(([_, v]) => v !== undefined && v !== null && (typeof v !== 'number' || !Number.isNaN(v)))
    );
    await docRef.update(updateData);
    
    const updatedDoc = await docRef.get();
    const data = { id: updatedDoc.id, ...updatedDoc.data() } as Bill;
    
    if (data.renterId) {
       const renterDoc = await db.collection("renters").doc(data.renterId).get();
       if (renterDoc.exists && renterDoc.data()?.adminId === tokenData.id) {
          data.renter = { id: renterDoc.id, ...renterDoc.data() } as Renter;
          if (data.renter.propertyId) {
             const propDoc = await db.collection("properties").doc(data.renter.propertyId).get();
             if (propDoc.exists && propDoc.data()?.adminId === tokenData.id) {
                data.renter.property = { id: propDoc.id, ...propDoc.data() } as Property;
             }
          }
       }
    }

    return NextResponse.json(formatResponse(data));
  } catch (err: any) {
    return NextResponse.json(
      { message: "Something went wrong." + err },
      { status: 500 },
    );
  }
}

export const formatResponse = (bill: Bill) => ({
  id: bill.id,
  renterId: bill.renterId,
  renter: bill.renter,
  month: bill.month,
  rent: bill.rent,
  utilities: bill.utilities || [],
  customCharges: bill.customCharges || [],
  total: bill.total,
  status: bill.status,
});
