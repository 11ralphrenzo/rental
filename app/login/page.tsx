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
  const { login } = useAuth();
  const searchParams = useSearchParams();
  const pinParams = searchParams.get("pin");

  useEffect(() => {
    if (pinParams) {
      reset({
        pin_hash: pinParams,
      });
    }
  }, [reset, pinParams]);

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
    <div className="flex w-dvw h-dvh items-center justify-center ">
      <div className="flex flex-col justify-center items-center space-y-20 sm:space-y-10">
        <Image
          className="w-50 sm:w-40"
          src="/logo.png"
          alt="App Logo"
          width={200}
          height={150}
        />
        <form
          className="w-md flex flex-col items-center justify-center space-y-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-2 sm:space-y-0 items-center justify-center">
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
              className="h-10 w-full sm:w-10 rounded-full cursor-pointer"
            >
              <span className="block sm:hidden">Login</span>
              <ArrowRight />
            </Button>
          </div>
          <span className="text-xs text-muted-foreground">
            Enter 4 digit code or pin.
          </span>
          {errors.pin_hash && (
            <span className="flex-1 text-sm text-red-500">
              {errors.pin_hash.message}
            </span>
          )}

          {/* <Controller
              name="houseId"
              control={control}
              rules={{ required: "House is required." }}
              render={({ field }) => (
                <DefSelect
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select House"
                  options={houses?.map((house) => ({
                    value: house.id,
                    label: house.name,
                  }))}
                />
              )}
            />
            {errors.houseId && (
              <span className="text-sm text-red-500">
                {errors.houseId.message}
              </span>
            )} */}

          {/* <Input
              placeholder="Pin"
    
              {...register("pin_hash", { required: "Pin is required." })}
            />
            {errors.pin_hash && (
              <span className="text-sm text-red-500">
                {errors.pin_hash.message}
              </span>
            )} */}
        </form>
      </div>
    </div>
  );
}

export default Page;
