// app/api/admin/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";

// Simple in-memory rate limiter for login attempts
const rateLimitMap = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

const loginSchema = z.object({
  username: z.string().min(1).max(50),
  password: z.string().min(1).max(100),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting Check
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown-ip";
    const now = Date.now();
    const rt = rateLimitMap.get(ip);

    if (rt) {
      if (now - rt.lastAttempt < WINDOW_MS) {
        if (rt.count >= MAX_ATTEMPTS) {
          return NextResponse.json(
            { message: "Too many login attempts. Please try again later." },
            { status: 429 }
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
    const body = await req.json();
    const parseResult = loginSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { message: "Invalid username or password format." },
        { status: 400 }
      );
    }

    const { username, password } = parseResult.data;

    // Fetch admin by email
    const { data: data, error } = await supabase
      .from("admins")
      .select("*")
      .eq("username", username)
      .single();

    // Artificial delay to obscure timing differences between valid/invalid usernames
    const failDelay = () => new Promise((resolve) => setTimeout(resolve, 1000));

    if (error || !data) {
      await failDelay();
      return NextResponse.json(
        { message: "Invalid username or password." },
        { status: 401 },
      );
    }

    // Compare password
    const valid = await bcrypt.compare(password, data.passwordHash);
    if (!valid) {
      await failDelay();
      return NextResponse.json(
        { message: "Invalid username or password." },
        { status: 401 },
      );
    }

    // Reset rate limiter on successful login
    rateLimitMap.delete(ip);

    const accessToken = await jwt.sign(
      {
        id: data.id,
        name: data.userName,
        type: data.type,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "365d" },
    );

    // Success: return admin info
    return NextResponse.json({
      id: data.id,
      name: data.username,
      type: data.type,
      accessToken,
    });
  } catch (err) {
    return NextResponse.json(
      { message: "Something went wrong." + err },
      { status: 500 },
    );
  }
}

// export async function POST(req: NextRequest) {
//   try {
//     const body: AuthRequest = await req.json();
//     const { username, password } = body;

//     if (!username || !password) {
//       return NextResponse.json(
//         { message: "All fields are required!" },
//         { status: 400 },
//       );
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Insert new admin
//     const { data: newAdmin, error: insertError } = await supabase
//       .from("admins")
//       .insert({
//         username: username,
//         passwordHash: hashedPassword,
//         type: 1,
//       })
//       .select()
//       .single();

//     if (insertError || !newAdmin) {
//       return NextResponse.json(
//         { message: "Failed to create admin" },
//         { status: 500 },
//       );
//     }

//     return NextResponse.json({
//       id: newAdmin.id,
//       email: newAdmin.email,
//       name: newAdmin.name,
//     });
//   } catch (err) {
//     return NextResponse.json(
//       { message: "Something went wrong" },
//       { status: 500 },
//     );
//   }
// }
