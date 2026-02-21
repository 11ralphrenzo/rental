"use client";

import { Renter } from "@/models/renter";
import { Controller, useForm } from "react-hook-form";
import { handleAxiosError } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Login } from "../../services/renter/auth-service";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import RenterPin from "@/components/custom/renter-pin";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";

function Page() {
  const router = useRouter();
  const {
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
    control,
    reset,
  } = useForm<Renter>();
  const { login, isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const pinParams = searchParams.get("pin");

  useEffect(() => {
    // 1. Auto redirect if already authenticated
    if (isAuthenticated) {
      router.replace("/renter/dashboard");
      return;
    }

    if (pinParams) {
      reset({
        pin_hash: pinParams,
      });
    }
  }, [reset, pinParams, isAuthenticated, router]);

  const onSubmit = async (data: Renter) => {
    toast.loading("Logging in...");
    try {
      data.pin_hash = data.pin_hash.toUpperCase();
      const response = await Login(data);
      toast.dismiss();
      if (response.data?.accessToken) {
        login(response.data.accessToken, response.data);
        toast.success(`Logged in successfully.`);
        router.replace("renter/dashboard");
      }
    } catch (err) {
      toast.dismiss();
      handleAxiosError(err, "Login failed. Please check your House and Pin.");
    }
  };

  return (
    <div className="relative flex w-dvw h-dvh items-center justify-center overflow-hidden">
      {/* Decorative blurred background elements for modern glassmorphism feel */}
      <div className="absolute top-1/4 -left-4 w-72 h-72 bg-primary/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-1/3 right-10 w-72 h-72 bg-rose-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 w-full max-w-sm sm:max-w-md mx-4 flex flex-col items-center justify-center">
        <div className="space-y-4 text-center pb-8 pt-6">
          <div className="flex justify-center">
            <Image
              src="/logo.png"
              alt="App Logo"
              width={160}
              height={120}
              priority
              className="object-contain"
            />
          </div>
          <p className="text-muted-foreground font-medium text-base">
            Please enter your 4-digit PIN to access your tenant portal.
          </p>
        </div>

        <div className="w-full">
          <form
            className="flex flex-col items-center justify-center space-y-6"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0 items-center justify-center w-full">
              <Controller
                name="pin_hash"
                control={control}
                rules={{ required: "PIN is required." }}
                render={({ field }) => (
                  <RenterPin
                    value={field.value}
                    onChange={field.onChange}
                    onComplete={() => onSubmit(getValues())}
                  />
                )}
              />

              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-12 w-full sm:w-12 sm:rounded-full rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all active:scale-[0.98] flex items-center justify-center"
              >
                <span className="block sm:hidden font-semibold">Login</span>
                <ArrowRight className="hidden sm:block" />
              </Button>
            </div>

            <div className="text-center h-6">
              {errors.pin_hash && (
                <p className="text-sm text-destructive font-medium animate-in slide-in-from-top-1">
                  {errors.pin_hash.message}
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Page;
