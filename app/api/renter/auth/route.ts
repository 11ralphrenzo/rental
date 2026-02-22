import { supabase } from "@/lib/supabaseClient";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { z } from "zod";

// Simple in-memory rate limiter for login attempts
const rateLimitMap = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

const pinSchema = z.object({
  pin_hash: z.string().min(1).max(50),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Rate Limiting Check
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown-ip";
    const now = Date.now();
    const rt = rateLimitMap.get(ip);

    if (rt) {
      if (now - rt.lastAttempt < WINDOW_MS) {
        if (rt.count >= MAX_ATTEMPTS) {
          return NextResponse.json(
            { message: "Too many login attempts. Please try again later." },
            { status: 429 },
          );
        }
        rt.count++;
        rt.lastAttempt = now;
      } else {
        rateLimitMap.set(ip, { count: 1, lastAttempt: now });
      }
    } else {
      rateLimitMap.set(ip, { count: 1, lastAttempt: now });
    }

    // 2. Validate input with Zod
    const body = await request.json();
    const parseResult = pinSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { message: "Invalid PIN format." },
        { status: 400 },
      );
    }

    const { pin_hash } = parseResult.data;

    const { data, error } = await supabase
      .from("renters")
      .select("*")
      .eq("pin_hash", pin_hash)
      .single();

    // Artificial delay to obscure database timing differences
    const failDelay = () => new Promise((resolve) => setTimeout(resolve, 1000));

    if (error || !data) {
      await failDelay();
      return NextResponse.json(
        {
          message:
            "There was an error with your house/pin combination. Please try again.",
        },
        { status: 400 },
      );
    }

    // Reset rate limiter on successful login
    rateLimitMap.delete(ip);

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
  } catch (err) {
    return NextResponse.json(
      { message: "An unexpected error occurred." },
      { status: 500 },
    );
  }
}
