// app/api/admin/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import bcrypt from "bcryptjs";
import { AuthRequest } from "@/models/auth";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    const { username, password }: AuthRequest = await req.json();

    // Fetch admin by email
    const { data: data, error } = await supabase
      .from("admins")
      .select("*")
      .eq("username", username)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { message: "Invalid username or password." },
        { status: 401 },
      );
    }

    // Compare password
    const valid = await bcrypt.compare(password, data.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { message: "Invalid username or password." },
        { status: 401 },
      );
    }

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
