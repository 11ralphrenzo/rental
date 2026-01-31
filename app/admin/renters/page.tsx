"use client";

import LoadingView from "@/components/custom/loading-view";
import { DrawerDialog } from "@/components/reusable/def-drawer-dialog";
import { DefTable } from "@/components/reusable/def-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatDate, handleAxiosError } from "@/lib/utils";
import { CirclePlus, Pencil, Save, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import useRenterModal from "./hooks/useRenterModal";
import { Renter } from "@/models/renter";
import {
  DeleteRenter,
  GetAllRenters,
  SaveRenter,
  UpdateRenter,
} from "@/services/renter-service";
import crypto from "crypto";
import { DefDatePicker } from "@/components/reusable/def-date-picker";
import { DefSelect } from "@/components/reusable/def-select";

function Page() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    control,
  } = useForm<Renter>({
    defaultValues: {
      pin_hash: crypto.randomBytes(2).toString("hex").toUpperCase(),
    },
  });
  const [renters, setRenters] = useState<Renter[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toDelete, setToDelete] = useState<Renter | null>(null);

  const {
    houses,
    selectedRenter,
    setSelectedRenter,
    isAdding,
    setIsAdding,
    openAdd,
    openEdit,
    close,
    getResources,
  } = useRenterModal();

  useEffect(() => {
    if (selectedRenter || isAdding) return;
    const getData = async () => {
      setIsLoading(true);
      try {
        const response = await GetAllRenters();
        if (response) setRenters(response.data);
      } catch (error) {
        handleAxiosError(error, "Failed to load renters.");
      } finally {
        setIsLoading(false);
      }
    };
    getData();
  }, [selectedRenter, isAdding, toDelete]);

  useEffect(() => {
    if (selectedRenter) {
      reset(selectedRenter);
    } else {
      reset({});
      getResources();
    }
  }, [reset, selectedRenter, isAdding, getResources]);

  const onSubmit = async (data: Renter) => {
    toast.loading(`${isAdding ? "Saving" : "Updating"} renter details...`);
    try {
      const response = isAdding
        ? await SaveRenter(data)
        : await UpdateRenter(data);
      toast.dismiss();
      if (response) {
        toast.success(
          `Renter details ${isAdding ? "saved" : "updated"} successfully.`,
        );

        if (isAdding) {
          setIsAdding(false);
        }
        setSelectedRenter(null);
      }
    } catch (err) {
      toast.dismiss();
      handleAxiosError(
        err,
        `Failed to ${isAdding ? "save" : "update"} renter details.`,
      );
    }
  };

  const onDelete = useCallback(async (data: Renter) => {
    setToDelete(data);
    toast.loading(`Deleting renter details...`);
    try {
      const response = await DeleteRenter(data.id);
      toast.dismiss();
      if (response) {
        toast.success(`Renter details deleted successfully.`);
        setToDelete(null);
        setSelectedRenter(null);
      }
    } catch (err) {
      toast.dismiss();
      handleAxiosError(err, `Failed to delete renter details.`);
    }
  }, []);

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex flex-col gap-4 sm:flex-row">
        <h1 className="flex-1 text-2xl font-bold">Renters</h1>
        <Button
          className="cursor-pointer"
          size="sm"
          variant="default"
          onClick={() => openAdd()}
          disabled={!renters}
        >
          <CirclePlus className="w-4 h-4" />
          Add Renter
        </Button>
      </div>
      <LoadingView
        isLoading={!renters || isLoading}
        loadingMessage="Loading Renters..."
      >
        {renters && (
          <DefTable
            columns={[
              "ID",
              "House",
              "Name",
              "Pin",
              "Start Date",
              "End Date",
              "",
            ]}
            data={renters}
            renderRow={(renter) => (
              <TableRow key={renter.id}>
                <TableCell>{renter.id}</TableCell>
                <TableCell>{renter.house?.name}</TableCell>
                <TableCell>{renter.name}</TableCell>
                <TableCell>{renter.pin_hash}</TableCell>
                <TableCell>{formatDate(renter.start_date)}</TableCell>
                <TableCell>{formatDate(renter.end_date)}</TableCell>

                <TableCell className="flex space-x-2 w-2">
                  <Button
                    className="cursor-pointer"
                    variant="outline"
                    size="sm"
                    onClick={() => openEdit(renter)}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    className="cursor-pointer"
                    variant="outline"
                    size="sm"
                    disabled={toDelete?.id === renter.id}
                    onClick={() => onDelete(renter)}
                  >
                    <Trash2 />
                  </Button>
                </TableCell>
              </TableRow>
            )}
            footer={<div className="text-right">Total: {renters.length}</div>}
          />
        )}
      </LoadingView>
      {(selectedRenter || isAdding) && (
        <DrawerDialog
          className="w-2xl"
          isOpen={!!selectedRenter || isAdding}
          onClose={() => {
            setSelectedRenter(null);
            if (isAdding) close();
          }}
          title={selectedRenter ? selectedRenter.name : "Add New Renter"}
          description="Details of the selected Renter"
        >
          <form
            className="flex flex-col space-y-4 p-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            <Input
              placeholder="Name"
              {...register("name", { required: "Name is required." })}
            />
            {errors.name && (
              <span className="text-sm text-red-500">
                {errors.name.message}
              </span>
            )}

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
              {...register("pin_hash", { required: "Monthly is required." })}
            />
            {errors.pin_hash && (
              <span className="text-sm text-red-500">
                {errors.pin_hash.message}
              </span>
            )}

            <div className="w-full flex gap-4">
              <Controller
                name="start_date"
                control={control}
                render={({ field }) => (
                  <DefDatePicker
                    className="flex-1"
                    value={field.value}
                    onChange={(date) => field.onChange(date?.toISOString())}
                    placeholder="Select start date"
                  />
                )}
              />
              {errors.start_date && (
                <span className="text-sm text-red-500">
                  {errors.start_date.message}
                </span>
              )}

              <Controller
                name="end_date"
                control={control}
                render={({ field }) => (
                  <DefDatePicker
                    className="flex-1"
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select end date"
                  />
                )}
              />
              {errors.end_date && (
                <span className="text-sm text-red-500">
                  {errors.end_date.message}
                </span>
              )}
            </div>

            <div className="flex space-x-2">
              {!isAdding && selectedRenter && (
                <Button
                  className="flex-1"
                  type="button"
                  variant="destructive"
                  disabled={isSubmitting}
                  onClick={() => onDelete(selectedRenter)}
                >
                  <Trash2 className="w-2 h-2" />
                  Delete
                </Button>
              )}

              <Button className="flex-1" type="submit" disabled={isSubmitting}>
                <Save />
                {isAdding ? "Save" : "Update"}
              </Button>
            </div>
          </form>
        </DrawerDialog>
      )}
    </div>
  );
}

export default Page;
