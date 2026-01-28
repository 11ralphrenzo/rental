import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/app/api/middleware/auth";
import { supabase } from "@/lib/supabaseClient";
import { formatResponse } from "../../bills/route";

export async function GET(request: NextRequest) {
  const tokenData = verifyToken(request);

  if (!tokenData) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id: renterId } = tokenData;
  const { data, error } = await supabase
    .from("bills")
    .select("*")
    .eq("renterId", renterId)
    .order("month", { ascending: false });

  if (error || !data) {
    return NextResponse.json(
      {
        message: "Database operation failed.",
      },
      { status: 400 },
    );
  }

  return NextResponse.json(data.map(formatResponse));
}
