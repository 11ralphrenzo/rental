import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AuthRequest } from "@/models/auth";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { saveAdmin } from "@/app/services/local-storage";
import { AxiosError } from "axios";
import { Login } from "@/app/services/auth-service";

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

    try {
      const result = await Login(data);
      toast.dismiss();
      reset();
      saveAdmin(result.data);
      toast.success("Logged in successfully!");
      router.replace("/admin");
    } catch (err) {
      reset();
      const error = err as AxiosError;
      if (error.response) {
        // Request made and server responded
        console.log("Status:", error.response.status);
        console.log("Data:", error.response.data);
      } else if (error.request) {
        // Request was made but no response
        console.log("No response received:", error.request);
      } else {
        // Something else caused the error
        console.log("Error:", error.message);
      }
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
