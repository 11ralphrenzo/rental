import { db } from "@/lib/firebaseAdmin";
import { Property } from "@/models/property";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../middleware/auth";

export async function GET(request: NextRequest) {
  const tokenData = verifyToken(request);

  if (!tokenData) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const snapshot = await db.collection("properties").orderBy("name", "asc").get();
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Property));
    return NextResponse.json(data.map(formatResponse));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: Property = await req.json();
    const { name, monthly, address, type, status, bedrooms, bathrooms } = body;

    const newDoc = db.collection("properties").doc();
    const id = newDoc.id;
    // Remove undefined, null, or NaN fields
    const propertyData = Object.fromEntries(
      Object.entries({ id, name, monthly, address, type, status, bedrooms, bathrooms }).filter(([_, v]) => v !== undefined && v !== null && !Number.isNaN(v))
    );
    
    await newDoc.set(propertyData);

    return NextResponse.json(formatResponse(propertyData as unknown as Property));
  } catch (err: any) {
    return NextResponse.json(
      { message: "Something went wrong." + err },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body: Property = await req.json();
    const { id, name, monthly, address, type, status, bedrooms, bathrooms } = body;

    if (!id) {
       return NextResponse.json({ message: "ID is required" }, { status: 400 });
    }

    const docRef = db.collection("properties").doc(id);
    const updateData = Object.fromEntries(
      Object.entries({ name, monthly, address, type, status, bedrooms, bathrooms }).filter(([_, v]) => v !== undefined && v !== null && !Number.isNaN(v))
    );
    await docRef.update(updateData);
    
    const updatedDoc = await docRef.get();
    const data = { id: updatedDoc.id, ...updatedDoc.data() } as Property;

    return NextResponse.json(formatResponse(data));
  } catch (err: any) {
    return NextResponse.json(
      { message: "Something went wrong." + err },
      { status: 500 },
    );
  }
}

const formatResponse = (property: Property) => ({
  id: property.id,
  name: property.name,
  monthly: property.monthly,
  address: property.address,
  type: property.type,
  status: property.status,
  bedrooms: property.bedrooms,
  bathrooms: property.bathrooms,
});
