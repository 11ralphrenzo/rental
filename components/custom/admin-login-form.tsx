import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebaseClient";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useAuth } from "@/context/AuthContext";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import Image from "next/image";

const authSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters.").max(100, "Password is too long.")
});

type AuthFormValues = z.infer<typeof authSchema>;

function AdminLoginForm() {
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/admin/properties");
    }
  }, [isAuthenticated, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onSubmit = async (data: AuthFormValues) => {
    toast.loading(isLogin ? "Authenticating..." : "Creating account...");

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
        const token = await userCredential.user.getIdToken();
        toast.dismiss();
        reset();
        login(token, {
          id: userCredential.user.uid,
          name: userCredential.user.displayName || userCredential.user.email || "Admin",
          accessToken: token,
          type: "1"
        });
        toast.success("Welcome back!");
        router.replace("/admin/properties");
      } else {
        await createUserWithEmailAndPassword(auth, data.email, data.password);
        toast.dismiss();
        toast.success("Account created! Please sign in.");
        setIsLogin(true);
        reset({ password: "" });
      }
    } catch (err: any) {
      toast.dismiss();
      reset({ password: "" }); 
      toast.error(err.message || "Authentication failed. Please try again.");
    }
  };

  const handleGoogleLogin = async () => {
    toast.loading("Redirecting to Google...");
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const token = await userCredential.user.getIdToken();
      toast.dismiss();
      login(token, {
        id: userCredential.user.uid,
        name: userCredential.user.displayName || userCredential.user.email || "Admin",
        accessToken: token,
        type: "1"
      });
      toast.success("Welcome back!");
      router.replace("/admin/properties");
    } catch (err: any) {
      toast.dismiss();
      toast.error(err.message || "Google login failed.");
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    reset();
  };

  return (
    <div className="w-full max-w-[420px] mx-auto bg-white rounded-[40px] p-8 md:p-10 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] border border-zinc-100 flex flex-col items-center transition-all">
      
      <div className="mb-8 mt-2 w-full flex flex-col items-center text-center">
        <img src="/logo.png" alt="Logo" width={100} height={100} className="mb-6 drop-shadow-sm" />
        <h1 className="text-3xl font-black tracking-tight text-zinc-900 mb-2">
          {isLogin ? "Welcome back" : "Create Account"}
        </h1>
        <p className="text-sm font-medium text-zinc-500">
          {isLogin ? "Sign in to manage your properties." : "Sign up to start managing properties."}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
        <div className="space-y-1">
          <Input
            className="h-14 px-6 rounded-full bg-zinc-50 border-transparent focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:border-zinc-200 transition-all font-medium placeholder:text-zinc-400"
            placeholder="Email"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-red-500 font-bold pl-4 pt-1">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <Input
            className="h-14 px-6 rounded-full bg-zinc-50 border-transparent focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:border-zinc-200 transition-all font-medium placeholder:text-zinc-400"
            placeholder="Password"
            type="password"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-red-500 font-bold pl-4 pt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-14 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-sm shadow-[0_8px_20px_-4px_rgba(0,0,0,0.2)] transition-all mt-4"
          disabled={isSubmitting}
        >
          {isSubmitting 
            ? (isLogin ? "Authenticating..." : "Creating account...") 
            : (isLogin ? "Sign In" : "Sign Up")}
        </Button>
      </form>
      
      <div className="mt-6 text-sm font-medium text-zinc-500">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button 
          type="button" 
          onClick={toggleMode} 
          className="text-zinc-900 font-bold hover:underline"
        >
          {isLogin ? "Sign Up" : "Sign In"}
        </button>
      </div>

      <div className="w-full flex items-center gap-4 my-8">
        <div className="h-px bg-zinc-200 flex-1" />
        <span className="text-xs font-bold text-zinc-400 tracking-widest uppercase">OR</span>
        <div className="h-px bg-zinc-200 flex-1" />
      </div>

      <button
        onClick={handleGoogleLogin}
        type="button"
        className="w-full h-14 flex items-center justify-center gap-3 bg-white border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 rounded-full font-bold text-sm text-zinc-700 shadow-sm transition-all"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </button>
    </div>
  );
}

export default AdminLoginForm;
