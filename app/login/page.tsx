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
    <div className="relative flex min-h-dvh w-full items-center justify-center bg-gradient-to-b from-background via-background to-muted/30 px-4 py-12">
      {/* Subtle accent glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <div className="rounded-2xl border border-border/50 bg-card/50 px-6 py-10 shadow-sm ring-1 ring-border/20 backdrop-blur-sm sm:px-10 sm:py-12">
          <div className="flex flex-col items-center space-y-8">
            <div className="flex flex-col items-center space-y-4 text-center">
              <Image
                src="/logo.png"
                alt="App Logo"
                width={140}
                height={105}
                priority
                className="object-contain"
              />
              <div>
                <h1 className="text-lg font-semibold tracking-tight text-foreground">
                  Tenant Portal
                </h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Enter your 4-digit PIN to continue
                </p>
              </div>
            </div>

            <form
              className="flex w-full flex-col items-center space-y-6"
              onSubmit={handleSubmit(onSubmit)}
            >
              <div className="flex w-full flex-col items-center gap-4 sm:flex-row sm:justify-center">
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
                  size="lg"
                  className="h-12 w-full shrink-0 sm:w-12 sm:rounded-xl"
                >
                  <span className="block sm:hidden">Login</span>
                  <ArrowRight className="hidden h-5 w-5 sm:block" />
                </Button>
              </div>

              {errors.pin_hash && (
                <p className="text-center text-sm text-destructive">
                  {errors.pin_hash.message}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page;
