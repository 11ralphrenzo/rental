import { db } from "@/lib/firebaseAdmin";
import { Renter } from "@/models/renter";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../middleware/auth";
import { Property } from "@/models/property";

export async function GET(request: NextRequest) {
  const tokenData = verifyToken(request);

  if (!tokenData) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const snapshot = await db.collection("renters").orderBy("name", "asc").get();
    
    // Fetch all properties to map them to renters
    const propertiesSnapshot = await db.collection("properties").get();
    const propertiesMap = new Map<string, Property>();
    propertiesSnapshot.docs.forEach(doc => {
      propertiesMap.set(doc.id, { id: doc.id, ...doc.data() } as Property);
    });

    const data = snapshot.docs.map((doc) => {
      const renterData = { id: doc.id, ...doc.data() } as Renter;
      renterData.property = propertiesMap.get(renterData.propertyId);
      return renterData;
    });

    return NextResponse.json(data.map(formatResponse));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: Renter = await req.json();
    const { name, propertyId, pin_hash, active, start_date, end_date, billing_day } = body;

    const newDoc = db.collection("renters").doc();
    const id = newDoc.id;
    const renterData = Object.fromEntries(
      Object.entries({ id, name, propertyId, pin_hash, active, start_date, end_date, billing_day, createdAt: new Date() }).filter(([_, v]) => v !== undefined && v !== null && !Number.isNaN(v))
    );
    
    await newDoc.set(renterData);

    const data = { ...renterData } as unknown as Renter;
    if (propertyId) {
       const propDoc = await db.collection("properties").doc(propertyId).get();
       if (propDoc.exists) data.property = { id: propDoc.id, ...propDoc.data() } as Property;
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
  try {
    const body: Renter = await req.json();
    const { id, name, propertyId, pin_hash, active, start_date, end_date, billing_day } = body;

    if (!id) {
       return NextResponse.json({ message: "ID is required" }, { status: 400 });
    }

    const docRef = db.collection("renters").doc(id);
    const updateData = Object.fromEntries(
      Object.entries({ name, propertyId, pin_hash, active, start_date, end_date, billing_day }).filter(([_, v]) => v !== undefined && v !== null && !Number.isNaN(v))
    );
    await docRef.update(updateData);
    
    const updatedDoc = await docRef.get();
    const data = { id: updatedDoc.id, ...updatedDoc.data() } as Renter;
    if (propertyId) {
       const propDoc = await db.collection("properties").doc(propertyId).get();
       if (propDoc.exists) data.property = { id: propDoc.id, ...propDoc.data() } as Property;
    }

    return NextResponse.json(formatResponse(data));
  } catch (err: any) {
    return NextResponse.json(
      { message: "Something went wrong." + err },
      { status: 500 },
    );
  }
}

const formatResponse = (renter: Renter) => ({
  id: renter.id,
  name: renter.name,
  propertyId: renter.propertyId,
  property: renter.property,
  pin_hash: renter.pin_hash,
  start_date: renter.start_date,
  end_date: renter.end_date,
  active: renter.active,
  billing_day: renter.billing_day,
});
