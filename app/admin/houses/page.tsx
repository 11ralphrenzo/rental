"use client";

import {
  DeleteHouse,
  GetAllHouses,
  SaveHouse,
  UpdateHouse,
} from "@/services/house-service";
import LoadingView from "@/components/custom/loading-view";
import { DrawerDialog } from "@/components/reusable/def-drawer-dialog";
import { DefTable } from "@/components/reusable/def-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
import { handleAxiosError } from "@/lib/utils";
import { House } from "@/models/house";
import { CirclePlus, Pencil, Save, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import useHouseModal from "./hooks/useHouseModal";

function Page() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<House>();
  const [houses, setHouses] = useState<House[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toDelete, setToDelete] = useState<House | null>(null);

  const {
    selectedHouse,
    setSelectedHouse,
    isAdding,
    setIsAdding,
    openAdd,
    openEdit,
    close,
  } = useHouseModal();

  useEffect(() => {
    if (selectedHouse || isAdding) return;
    const getData = async () => {
      setIsLoading(true);
      try {
        const response = await GetAllHouses();
        if (response) setHouses(response.data);
      } catch (error) {
        handleAxiosError(error, "Failed to load houses.");
      } finally {
        setIsLoading(false);
      }
    };
    getData();
  }, [selectedHouse, isAdding, toDelete]);

  useEffect(() => {
    if (selectedHouse) {
      reset(selectedHouse);
    } else reset({});
  }, [reset, selectedHouse, isAdding]);

  const onSubmit = async (data: House) => {
    toast.loading(`${isAdding ? "Saving" : "Updating"} house details...`);
    try {
      const response = isAdding
        ? await SaveHouse(data)
        : await UpdateHouse(data);
      toast.dismiss();
      if (response) {
        toast.success(
          `House details ${isAdding ? "saved" : "updated"} successfully.`,
        );

        if (isAdding) {
          setIsAdding(false);
        }
        setSelectedHouse(null);
      }
    } catch (err) {
      toast.dismiss();
      handleAxiosError(
        err,
        `Failed to ${isAdding ? "save" : "update"} house details.`,
      );
    }
  };

  const onDelete = useCallback(async (data: House) => {
    setToDelete(data);
    toast.loading(`Deleting house details...`);
    try {
      const response = await DeleteHouse(data.id);
      toast.dismiss();
      if (response) {
        toast.success(`House details deleted successfully.`);
        setToDelete(null);
        setSelectedHouse(null);
      }
    } catch (err) {
      toast.dismiss();
      handleAxiosError(err, `Failed to delete house details.`);
    }
  }, []);

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex flex-col gap-4 sm:flex-row">
        <h1 className="flex-1 text-2xl font-bold">Houses</h1>
        <Button
          className="cursor-pointer"
          size="sm"
          variant="default"
          onClick={() => openAdd()}
          disabled={!houses}
        >
          <CirclePlus className="w-4 h-4" />
          Add House
        </Button>
      </div>
      <LoadingView
        isLoading={!houses || isLoading}
        loadingMessage="Loading Houses..."
      >
        {houses && (
          <DefTable
            columns={["ID", "Name", "Monthly", ""]}
            data={houses}
            renderRow={(house) => (
              <TableRow key={house.id}>
                <TableCell>{house.id}</TableCell>
                <TableCell>{house.name}</TableCell>
                <TableCell>{house.monthly}</TableCell>
                <TableCell className="flex space-x-2 w-2">
                  <Button
                    className="cursor-pointer"
                    variant="outline"
                    size="sm"
                    onClick={() => openEdit(house)}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    className="cursor-pointer"
                    variant="outline"
                    size="sm"
                    disabled={toDelete?.id === house.id}
                    onClick={() => onDelete(house)}
                  >
                    <Trash2 />
                  </Button>
                </TableCell>
              </TableRow>
            )}
            footer={<div className="text-right">Total: {houses.length}</div>}
          />
        )}
      </LoadingView>
      {(selectedHouse || isAdding) && (
        <DrawerDialog
          className="w-2xl"
          isOpen={!!selectedHouse || isAdding}
          onClose={() => {
            setSelectedHouse(null);
            if (isAdding) close();
          }}
          title={selectedHouse ? selectedHouse.name : "Add New House"}
          description="Details of the selected House"
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
            <Input
              type="number"
              placeholder="Monthly Rent"
              min={0}
              max={100000}
              {...register("monthly", { required: "Monthly is required." })}
            />
            {errors.monthly && (
              <span className="text-sm text-red-500">
                {errors.monthly.message}
              </span>
            )}

            <div className="flex space-x-2">
              {!isAdding && selectedHouse && (
                <Button
                  className="flex-1"
                  type="button"
                  variant="destructive"
                  disabled={isSubmitting}
                  onClick={() => onDelete(selectedHouse)}
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
