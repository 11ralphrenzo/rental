"use client";

import AdminLoginForm from "@/components/custom/admin-login-form";
import LoginBackground from "@/components/custom/login-background";

export default function Login() {
  return (
    <div className="relative w-dvw h-dvh flex items-center justify-center bg-[#F5F5F7] overflow-hidden">
      <LoginBackground />
      <div className="z-10 w-full px-4">
        <AdminLoginForm />
      </div>
    </div>
  );
}
