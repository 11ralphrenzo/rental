import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const segments = url.pathname.split("/");
    const id = Number(segments.at(-1));

    if (isNaN(id))
      return NextResponse.json(
        { message: "ID is not a valid input." },
        { status: 400 },
      );

    const { error } = await supabase.from("bills").delete().eq("id", id);

    if (error)
      return NextResponse.json(
        { message: error?.message || "Database operation failed." },
        { status: 400 },
      );
    return NextResponse.json(true);
  } catch (err) {
    return NextResponse.json(
      { message: "Something went wrong." + err },
      { status: 500 },
    );
  }
}
