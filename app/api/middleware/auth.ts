import { NextRequest } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";

interface DecodedToken {
  id: string;
  name: string;
  email: string;
}

export async function verifyToken(request: NextRequest): Promise<DecodedToken | null> {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7);

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return {
      id: decodedToken.uid,
      name: decodedToken.name || decodedToken.email || "User",
      email: decodedToken.email || "",
    };
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}
