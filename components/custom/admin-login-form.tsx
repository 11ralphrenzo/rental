import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AuthRequest } from "@/models/auth";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { saveAdmin } from "@/app/services/local-storage";

function AdminLoginForm() {
  const router = useRouter();
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
      reset({ password: "" });
      toast.error(result.message || "Login failed!");
    } else {
      reset();
      saveAdmin(result);
      toast.success("Logged in successfully!");
      router.replace("/admin/main");
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
