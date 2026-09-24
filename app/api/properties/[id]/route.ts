import { db } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
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

    await db.collection("properties").doc(id).delete();

    return NextResponse.json(true);
  } catch (err: any) {
    return NextResponse.json(
      { message: "Something went wrong." + err },
      { status: 500 },
    );
  }
}
