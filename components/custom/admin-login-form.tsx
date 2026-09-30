import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebaseClient";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import Image from "next/image";

function AdminLoginForm() {
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/admin/properties");
    }
  }, [isAuthenticated, router]);

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

  return (
    <div className="w-full max-w-[420px] mx-auto bg-white/70 backdrop-blur-xl rounded-[28px] p-8 sm:p-10 shadow-[0_8px_40px_rgb(0,0,0,0.08)] border border-white/60 flex flex-col items-start relative overflow-hidden">
      
      {/* Subtle inner accent glow */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="mb-10 w-full flex flex-col items-start relative z-10">
        <img src="/logo.svg" alt="Logo" width={52} height={52} className="mb-6" />
        <h1 className="text-[28px] font-bold tracking-tight text-zinc-900 mb-3 leading-tight">
          Admin Portal
        </h1>
        <p className="text-[15px] leading-relaxed text-zinc-500">
          Securely manage your rental properties, tenants, and operational insights in one place.
        </p>
      </div>

      <div className="w-full mt-2 relative z-10 flex flex-col space-y-4">
        <button
          onClick={handleGoogleLogin}
          type="button"
          className="w-full h-12 flex items-center justify-center gap-3 bg-zinc-900 text-white shadow-[0_4px_12px_rgb(0,0,0,0.1)] hover:bg-zinc-800 hover:shadow-[0_6px_16px_rgb(0,0,0,0.15)] rounded-xl font-medium text-[15px] transition-all duration-200 active:scale-[0.98]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Sign in with Google
        </button>
      </div>

      <div className="mt-8 w-full border-t border-zinc-100/80 pt-6 text-center relative z-10">
        <p className="text-[13px] text-zinc-400">
          By signing in, you agree to our <a href="#" className="text-zinc-600 font-medium hover:text-zinc-900 transition-colors">Terms of Service</a> & <a href="#" className="text-zinc-600 font-medium hover:text-zinc-900 transition-colors">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}

export default AdminLoginForm;
