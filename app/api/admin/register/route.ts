import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  username: z.string().min(1).max(50),
  password: z.string().min(1).max(100),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = registerSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { message: "Invalid username or password format." },
        { status: 400 }
      );
    }

    const { username, password } = parseResult.data;

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("admins")
      .select("id")
      .eq("username", username)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { message: "Username is already taken." },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new admin
    const { data: newAdmin, error: insertError } = await supabase
      .from("admins")
      .insert({
        username: username,
        passwordHash: hashedPassword,
        type: 1,
      })
      .select()
      .single();

    if (insertError || !newAdmin) {
      return NextResponse.json(
        { message: "Failed to create account. Please try again.", error: insertError },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Account created successfully. You can now log in.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { message: "Something went wrong.", error: err.message },
      { status: 500 }
    );
  }
}
