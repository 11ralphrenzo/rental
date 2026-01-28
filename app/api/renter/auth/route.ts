import { supabase } from "@/lib/supabaseClient";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
  const { houseId, pin_hash } = await request.json();

  const { data, error } = await supabase
    .from("renters")
    .select("*")
    .eq("houseId", houseId)
    .eq("pin_hash", pin_hash)
    .single();

  if (error || !data) {
    return NextResponse.json(
      {
        message:
          "There was an error with your house/pin combination. Please try again",
      },
      { status: 400 },
    );
  }

  const accessToken = await jwt.sign(
    {
      id: data.id,
      name: data.name,
      houseId: data.houseId,
    },
    process.env.JWT_SECRET as string,
    { expiresIn: "365d" },
  );

  return NextResponse.json({
    id: data.id,
    name: data.name,
    houseId: data.houseId,
    accessToken,
  });
}
