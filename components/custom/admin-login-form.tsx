import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Login } from "@/services/auth-service";
import { AuthRequest } from "@/models/auth";
import { handleAxiosError } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";

// 1. Define Zod schema for client validation
const loginSchema = z.object({
  username: z.string().min(1, "Username is required.").max(50, "Username is too long."),
  password: z.string().min(1, "Password is required.").max(100, "Password is too long.")
});

type LoginFormValues = z.infer<typeof loginSchema>;

function AdminLoginForm() {
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/admin/houses");
    }
  }, [isAuthenticated, router]);

  // 2. Initialize React Hook Form with Zod resolver
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  });

  const onSubmit = async (data: LoginFormValues) => {
    toast.loading("Authenticating...");

    try {
      // The API interface requires a 'type' field, though we use it differently now
      const payload: AuthRequest = {
        username: data.username,
        password: data.password,
        type: 1
      };
      const result = await Login(payload);
      toast.dismiss();
      reset();
      login(result.data.accessToken, result.data);
      toast.success("Welcome back!");
      router.replace("/admin/houses");
    } catch (err) {
      toast.dismiss();
      reset({ password: "" }); // Only reset password on failure
      handleAxiosError(err);
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Decorative blurred background elements for modern glassmorphism feel */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-rose-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

      <Card className="relative backdrop-blur-md bg-white/60 dark:bg-black/40 border border-white/20 dark:border-white/10 shadow-2xl p-2 pt-10 rounded-2xl">
        <CardHeader className="space-y-1 text-center pb-6">
          <CardTitle className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-rose-400 bg-clip-text text-transparent">
            <img src="/logo.png" alt="Logo" width={130} height={130} className="mx-auto" />
          </CardTitle>
          <CardDescription className="text-muted-foreground font-medium">
            Enter your credentials to securely access the dashboard.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="flex flex-col space-y-5">
            <div className="space-y-2 relative">
              <div className="relative flex items-center">
                <User className="absolute left-3.5 h-4 w-4 text-muted-foreground/70" />
                <Input
                  className="pl-10 h-11 bg-white/50 dark:bg-black/20 border-white/30 dark:border-white/10 focus-visible:ring-primary/50 transition-all rounded-xl"
                  placeholder="Username"
                  aria-invalid={!!errors.username}
                  {...register("username")}
                />
              </div>
              {errors.username && (
                <p className="text-xs text-destructive font-medium pl-1 animate-in slide-in-from-top-1">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-2 relative">
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 h-4 w-4 text-muted-foreground/70" />
                <Input
                  className="pl-10 pr-10 h-11 bg-white/50 dark:bg-black/20 border-white/30 dark:border-white/10 focus-visible:ring-primary/50 transition-all rounded-xl"
                  placeholder="Password"
                  type={showPassword ? "text" : "password"}
                  aria-invalid={!!errors.password}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-muted-foreground/50 hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive font-medium pl-1 animate-in slide-in-from-top-1">
                  {errors.password.message}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="pt-2 pb-6">
            <Button
              type="submit"
              className="w-full h-11 rounded-xl font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all active:scale-[0.98]"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Authenticating..." : "Sign In"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default AdminLoginForm;
