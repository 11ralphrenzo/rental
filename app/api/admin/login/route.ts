// app/api/admin/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import bcrypt from "bcryptjs";
import { AuthRequest } from "@/models/auth";

export async function POST(req: NextRequest) {
  try {
    const { username, password }: AuthRequest = await req.json();

    // Fetch admin by email
    const { data: admin, error } = await supabase
      .from("admins")
      .select("*")
      .eq("username", username)
      .single();

    if (error || !admin) {
      return NextResponse.json(
        { message: "Invalid username or password" },
        { status: 401 },
      );
    }

    // Compare password
    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { message: "Invalid username or password" },
        { status: 401 },
      );
    }

    // Success: return admin info
    return NextResponse.json({
      id: admin.id,
      username: admin.username,
      type: admin.type,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Something went wrong" + err },
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
//     console.error(err);
//     return NextResponse.json(
//       { message: "Something went wrong" },
//       { status: 500 },
//     );
//   }
// }
