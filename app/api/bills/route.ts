import { supabase } from "@/lib/supabaseClient";
import { Bill } from "@/models/bill";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const { data, error } = await supabase
    .from("bills")
    .select("*, renters(id, name)")
    .order("month", { ascending: false });
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data.map(formatResponse));
}

export async function POST(req: NextRequest) {
  try {
    const {
      id,
      renterId,
      month,
      rent,
      rate_electricity,
      prev_electricity,
      curr_electricity,
      total_electricity,
      rate_water,
      prev_water,
      curr_water,
      total_water,
      others,
      total,
      status,
    }: Bill = await req.json();

    const { data, error } = await supabase
      .from("bills")
      .insert({
        id,
        renterId,
        month,
        rent,
        rate_electricity,
        prev_electricity,
        curr_electricity,
        total_electricity,
        rate_water,
        prev_water,
        curr_water,
        total_water,
        others,
        total,
        status,
      })
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
      renterId,
      month,
      rent,
      rate_electricity,
      prev_electricity,
      curr_electricity,
      total_electricity,
      rate_water,
      prev_water,
      curr_water,
      total_water,
      others,
      total,
      status,
    }: Bill = await req.json();

    const { data, error } = await supabase
      .from("bills")
      .update({
        id,
        renterId,
        month,
        rent,
        rate_electricity,
        prev_electricity,
        curr_electricity,
        total_electricity,
        rate_water,
        prev_water,
        curr_water,
        total_water,
        others,
        total,
        status,
      })
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

export const formatResponse = (bill: Bill) => ({
  id: bill.id,
  renterId: bill.renterId,
  renter: bill.renters,
  month: bill.month,
  rent: bill.rent,
  rate_electricity: bill.rate_electricity,
  prev_electricity: bill.prev_electricity,
  curr_electricity: bill.curr_electricity,
  total_electricity: bill.total_electricity,
  rate_water: bill.rate_water,
  prev_water: bill.prev_water,
  curr_water: bill.curr_water,
  total_water: bill.total_water,
  others: bill.others,
  total: bill.total,
  status: bill.status,
});
