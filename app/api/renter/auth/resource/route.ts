import { supabase } from "@/lib/supabaseClient";
import { Property } from "@/models/property";
import { NextResponse } from "next/server";

export async function GET() {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .order("name", { ascending: true });
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data.map(formatResponse));
}

const formatResponse = (property: Property) => ({
  id: property.id,
  name: property.name,
});
