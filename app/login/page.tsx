"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Renter } from "@/models/renter";
import { Controller, useForm } from "react-hook-form";
import { handleAxiosError } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Login } from "../../services/renter/auth-service";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import RenterPin from "@/components/custom/renter-pin";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

function Page() {
  const router = useRouter();
  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    reset,
  } = useForm<Renter>();
  const { login } = useAuth();

  // useEffect(() => {
  //   const getResources = async () => {
  //     try {
  //       const response = await GetHousesResource();
  //       if (response) {
  //         setHouses(response.data);
  //       }
  //     } catch (error) {
  //       handleAxiosError(error, "Failed to load resources.");
  //     }
  //   };

  //   getResources();
  // }, []);

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
      reset({
        pin_hash: "",
      });
    }
  };

  return (
    <div className="flex w-dvw h-dvh items-center justify-center">
      <Card className="w-md">
        {/* <CardHeader>
          <span className="text-lg font-semibold">Login</span>
        </CardHeader> */}
        <CardContent className="flex flex-col items-center space-y-0">
          <Image src="/logo.png" alt="App Logo" width={200} height={200} />
          <form
            className="flex flex-col space-y-2 items-center justify-center"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="flex space-x-2 items-center justify-center">
              <Controller
                name="pin_hash"
                control={control}
                rules={{ required: "PIN is required." }}
                render={({ field }) => (
                  <RenterPin value={field.value} onChange={field.onChange} />
                )}
              />

              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-10 w-10 rounded-full"
              >
                <ArrowRight />
              </Button>
            </div>

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
        </CardContent>
      </Card>
    </div>
  );
}

export default Page;
