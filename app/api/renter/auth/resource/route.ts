import { supabase } from "@/lib/supabaseClient";
import { House } from "@/models/house";
import { NextResponse } from "next/server";

export async function GET() {
  const { data, error } = await supabase
    .from("houses")
    .select("*")
    .order("name", { ascending: true });
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data.map(formatResponse));
}

const formatResponse = (house: House) => ({
  id: house.id,
  name: house.name,
});
