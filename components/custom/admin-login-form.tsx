import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AuthRequest } from "@/models/auth";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

function AdminLoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AuthRequest>();

  const onSubmit = async (data: AuthRequest) => {
    toast.loading("Logging in...");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    toast.dismiss();

    if (!res.ok) {
      toast.error(result.message || "Login failed!");
      reset({ password: "" });
    } else {
      toast.success("Logged in successfully!");
      console.log("Admin logged in:", result);
      // redirect to admin dashboard
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md">
      <Card>
        <CardTitle className="flex justify-center text-xl font-bold">
          Login Page
        </CardTitle>
        <CardContent className="flex flex-col space-y-4">
          <Input
            placeholder="Username"
            {...register("username", { required: "Username is required." })}
          />
          <Input
            placeholder="Password"
            type="password"
            {...register("password", { required: "Password is required." })}
          />
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            Login
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

export default AdminLoginForm;
