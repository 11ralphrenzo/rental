"use client";

import AdminLoginForm from "@/components/custom/admin-login-form";
import { Toaster } from "sonner";

// import { useEffect, useState } from "react";

export default function Login() {
  return (
    <div className="w-dvw h-dvh flex items-center justify-center">
      <AdminLoginForm />
      <Toaster position="top-right" />
    </div>
  );
}
