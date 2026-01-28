"use client";

import { DefSelect } from "@/components/reusable/def-select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Renter } from "@/models/renter";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { handleAxiosError } from "@/lib/utils";
import { House } from "@/models/house";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Login } from "../../services/renter/auth-service";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { GetHousesResource } from "@/services/renter/renter-house-service";

function Page() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    control,
  } = useForm<Renter>();
  const [houses, setHouses] = useState<House[] | undefined>(undefined);
  const { login } = useAuth();

  useEffect(() => {
    const getResources = async () => {
      try {
        const response = await GetHousesResource();
        if (response) {
          setHouses(response.data);
        }
      } catch (error) {
        handleAxiosError(error, "Failed to load resources.");
      }
    };

    getResources();
  }, []);

  const onSubmit = async (data: Renter) => {
    toast.loading("Logging in...");
    try {
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
    <div className="flex w-dvw h-dvh items-center justify-center">
      <Card className="w-md">
        <CardHeader>
          <span className="text-lg font-semibold">Login</span>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-col space-y-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            <Controller
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
            )}

            <Input
              placeholder="Pin"
              // value={
              //   isAdding
              //     ? crypto.randomBytes(2).toString("hex").toUpperCase()
              //     : undefined
              // }
              {...register("pin_hash", { required: "Pin is required." })}
            />
            {errors.pin_hash && (
              <span className="text-sm text-red-500">
                {errors.pin_hash.message}
              </span>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default Page;
