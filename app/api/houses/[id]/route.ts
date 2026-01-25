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

    // Fetch admin by email
    const { error } = await supabase
      .from("houses")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error)
      return NextResponse.json({ message: "Invalid inputs." }, { status: 400 });

    return NextResponse.json(true);
  } catch (err) {
    return NextResponse.json(
      { message: "Something went wrong." + err },
      { status: 500 },
    );
  }
}
