import { supabase } from "@/lib/supabaseClient";
import { House } from "@/models/house";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../middleware/auth";

export async function GET(request: NextRequest) {
  const tokenData = verifyToken(request);

  if (!tokenData) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("houses")
    .select("*")
    .order("name", { ascending: true });
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data.map(formatResponse));
}

export async function POST(req: NextRequest) {
  try {
    const { id, name, monthly }: House = await req.json();

    const { data, error } = await supabase
      .from("houses")
      .insert({ id, name, monthly })
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json(
        { message: error?.message || "Database operation failed." },
        { status: 400 },
      );
    }

    return NextResponse.json(formatResponse(data));
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

    const { data, error } = await supabase
      .from("houses")
      .update({ name, monthly })
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json(
        { message: error?.message || "Database operation failed." },
        { status: 400 },
      );
    }

    return NextResponse.json(formatResponse(data));
  } catch (err) {
    return NextResponse.json(
      { message: "Something went wrong." + err },
      { status: 500 },
    );
  }
}

const formatResponse = (house: House) => ({
  id: house.id,
  name: house.name,
  monthly: house.monthly,
});
