import { supabase } from "@/lib/supabaseClient";
import { House } from "@/models/house";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const { data, error } = await supabase
    .from("houses")
    .select("*")
    .order("name", { ascending: true });
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  try {
    const { id, name, monthly }: House = await req.json();

    // Fetch admin by email
    const { data, error } = await supabase
      .from("houses")
      .insert({ id, name, monthly })
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json({ message: "Invalid inputs." }, { status: 400 });
    }

    return NextResponse.json({
      id: data.id,
      name: data.username,
      monthly: data.monthly,
    });
  } catch (err) {
    return NextResponse.json(
      { message: "Something went wrong." + err },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, name, monthly }: House = await req.json();

    // Fetch admin by email
    const { data, error } = await supabase
      .from("houses")
      .update({ name, monthly })
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json({ message: "Invalid inputs." }, { status: 400 });
    }

    return NextResponse.json({
      id: data.id,
      name: data.username,
      monthly: data.monthly,
    });
  } catch (err) {
    return NextResponse.json(
      { message: "Something went wrong." + err },
      { status: 500 },
    );
  }
}
