import { supabase } from "@/lib/supabaseClient";
import { Renter } from "@/models/renter";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const { data, error } = await supabase
    .from("renters")
    .select("*, properties(id, name, monthly)")
    .order("name", { ascending: true });
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data.map(formatResponse));
}

export async function POST(req: NextRequest) {
  try {
    const {
      id,
      name,
      propertyId,
      pin_hash,
      active,
      start_date,
      end_date,
      billing_day,
    }: Renter = await req.json();

    const { data, error } = await supabase
      .from("renters")
      .insert({ id, name, propertyId, pin_hash, active, start_date, end_date, billing_day })
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
    const {
      id,
      name,
      propertyId,
      pin_hash,
      active,
      start_date,
      end_date,
      billing_day,
    }: Renter = await req.json();

    const { data, error } = await supabase
      .from("renters")
      .update({ name, propertyId, pin_hash, active, start_date, end_date, billing_day })
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

const formatResponse = (renter: Renter) => ({
  id: renter.id,
  name: renter.name,
  propertyId: renter.propertyId,
  property: renter.properties,
  pin_hash: renter.pin_hash,
  start_date: renter.start_date,
  end_date: renter.end_date,
  active: renter.active,
  billing_day: renter.billing_day,
});
