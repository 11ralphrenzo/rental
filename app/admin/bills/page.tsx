"use client";

import LoadingView from "@/components/custom/loading-view";
import { DrawerDialog } from "@/components/reusable/def-drawer-dialog";
import { DefTable } from "@/components/reusable/def-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  formatCurrency,
  formatDate,
  formatToTwoDecimals,
  handleAxiosError,
} from "@/lib/utils";
import { Download, Eye, FilePlus, Pencil, Save, Trash2 } from "lucide-react";
import { downloadBillPdf, viewBillPdf } from "@/lib/generate-bill-pdf";
import { useCallback, useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import useBillModal from "./hooks/useBillModal";

import { DefDatePicker } from "@/components/reusable/def-date-picker";
import { DefSelect } from "@/components/reusable/def-select";
import {
  DeleteBill,
  GetAllBills,
  GetLatestBillByRenter,
  SaveBill,
  UpdateBill,
} from "@/services/bills-service";
import { Bill } from "@/models/bill";
import { Separator } from "@/components/ui/separator";

function Page() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    control,
    setValue,
  } = useForm<Bill>({
    defaultValues: {
      month: new Date(),
    },
  });
  const [bills, setBills] = useState<Bill[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingLatestBill, setIsLoadingLatestBill] = useState(false);
  const [toDelete, setToDelete] = useState<Bill | null>(null);

  const {
    renters,
    selectedBill,
    setSelectedBill,
    isAdding,
    setIsAdding,
    openAdd,
    openEdit,
    close,
    getResources,
  } = useBillModal();

  // Watch specific fields
  const rateElectric = useWatch({ control, name: "rate_electricity" });
  const prevElectric = useWatch({ control, name: "prev_electricity" });
  const currElectric = useWatch({ control, name: "curr_electricity" });
  const totalElectric = useWatch({ control, name: "total_electricity" });
  const rateWater = useWatch({ control, name: "rate_water" });
  const prevWater = useWatch({ control, name: "prev_water" });
  const currWater = useWatch({ control, name: "curr_water" });
  const totalWater = useWatch({ control, name: "total_water" });
  const rent = useWatch({ control, name: "rent" });
  const others = useWatch({ control, name: "others" });
  const renterId = useWatch({ control, name: "renterId" });

  const isFieldsDisabled = !renterId;

  useEffect(() => {
    if (selectedBill || isAdding) return;
    const getData = async () => {
      setIsLoading(true);
      try {
        const response = await GetAllBills();
        if (response) setBills(response.data);
      } catch (error) {
        handleAxiosError(error, "Failed to load bills.");
      } finally {
        setIsLoading(false);
      }
    };
    getData();
  }, [selectedBill, isAdding, toDelete]);

  useEffect(() => {
    if (selectedBill) {
      reset(selectedBill);
    } else {
      reset({});
      getResources();
    }
  }, [reset, selectedBill, isAdding, getResources]);

  // Calculate totals
  useEffect(() => {
    if (prevElectric && currElectric) {
      const total = formatToTwoDecimals(
        (Number(currElectric) - Number(prevElectric)) * rateElectric,
      );
      setValue("total_electricity", total);
    }
  }, [prevElectric, currElectric, rateElectric, setValue]);

  useEffect(() => {
    if (prevWater && currWater) {
      const total = formatToTwoDecimals(
        (Number(currWater) - Number(prevWater)) * rateWater,
      );
      setValue("total_water", total);
    }
  }, [prevWater, currWater, rateWater, setValue]);

  // Calculate grand total
  const grandTotal = useWatch({ control, name: "total" });

  useEffect(() => {
    const total =
      Number(rent ?? 0) +
      Number(totalElectric ?? 0) +
      Number(totalWater ?? 0) +
      Number(others ?? 0);
    setValue("total", total);
  }, [
    rent,
    totalWater,
    totalElectric,
    prevElectric,
    currElectric,
    prevWater,
    currWater,
    others,
    setValue,
  ]);

  const onSubmit = async (data: Bill) => {
    toast.loading(`${isAdding ? "Saving" : "Updating"} bill details...`);
    try {
      const response = isAdding ? await SaveBill(data) : await UpdateBill(data);
      toast.dismiss();
      if (response) {
        toast.success(
          `Bill details ${isAdding ? "saved" : "updated"} successfully.`,
        );

        if (isAdding) {
          setIsAdding(false);
        }
        setSelectedBill(null);
      }
    } catch (err) {
      toast.dismiss();
      handleAxiosError(
        err,
        `Failed to ${isAdding ? "save" : "update"} bill details.`,
      );
    }
  };

  const onDelete = useCallback(async (data: Bill) => {
    setToDelete(data);
    toast.loading(`Deleting renter details...`);
    try {
      const response = await DeleteBill(data.id);
      toast.dismiss();
      if (response) {
        toast.success(`Renter details deleted successfully.`);
        setToDelete(null);
        setSelectedBill(null);
      }
    } catch (err) {
      toast.dismiss();
      handleAxiosError(err, `Failed to delete bill details.`);
    }
  }, []);

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex flex-col gap-4 sm:flex-row">
        <h1 className="flex-1 text-2xl font-bold">Bills</h1>
        <Button
          className="cursor-pointer"
          size="sm"
          variant="default"
          onClick={() => openAdd()}
          disabled={!bills}
        >
          <FilePlus className="w-4 h-4" />
          New Bill
        </Button>
      </div>
      <LoadingView
        isLoading={!bills || isLoading}
        loadingMessage="Loading Bills..."
      >
        {bills && (
          <DefTable
            columns={[
              "Date",
              "Renter",
              "Monthly Rent",
              // "Rate Elec",
              // "Prev Elec",
              // "Curr Elect",
              "Total Elect",
              // "Rate Water",
              // "Prev Water",
              // "Curr Water",
              "Total Water",
              "Other Charges",
              "Total Bill",
              "Actions",
            ]}
            data={bills}
            renderRow={(bill) => (
              <TableRow key={bill.id}>
                <TableCell>{formatDate(bill.month)}</TableCell>
                <TableCell>{bill.renter?.name}</TableCell>
                <TableCell>{formatCurrency(bill.rent)}</TableCell>
                {/* <TableCell>{formatCurrency(bill.rate_electricity)}</TableCell>
                <TableCell>{bill.prev_electricity}</TableCell>
                <TableCell>{bill.curr_electricity}</TableCell> */}
                <TableCell>{formatCurrency(bill.total_electricity)}</TableCell>
                {/* <TableCell>{formatCurrency(bill.rate_water)}</TableCell>
                <TableCell>{bill.prev_water}</TableCell>
                <TableCell>{bill.curr_water}</TableCell> */}
                <TableCell>{formatCurrency(bill.total_water)}</TableCell>
                <TableCell>{formatCurrency(bill.others)}</TableCell>
                <TableCell>{formatCurrency(bill.total)}</TableCell>

                <TableCell className="flex space-x-2 w-2">
                  <Button
                    className="cursor-pointer"
                    variant="outline"
                    size="sm"
                    onClick={() => openEdit(bill)}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    className="cursor-pointer"
                    variant="outline"
                    size="sm"
                    disabled={toDelete?.id === bill.id}
                    onClick={() => onDelete(bill)}
                  >
                    <Trash2 />
                  </Button>
                </TableCell>
              </TableRow>
            )}
            footer={<div className="text-right">Total: {bills.length}</div>}
          />
        )}
      </LoadingView>
      {(selectedBill || isAdding) && (
        <DrawerDialog
          className="w-2xl"
          isOpen={!!selectedBill || isAdding}
          onClose={() => {
            setSelectedBill(null);
            if (isAdding) close();
          }}
          title={selectedBill ? "Update Bill" : "Add New Bill"}
          description="Details of the selected Bill"
        >
          <form
            className="flex flex-col space-y-4 p-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            <Controller
              name="renterId"
              control={control}
              rules={{ required: "Renter is required." }}
              render={({ field }) => (
                <DefSelect
                  value={field.value}
                  onChange={async (e) => {
                    field.onChange(e);

                    const renter = renters?.find((r) => r.id === Number(e));
                    if (renter && renter.house) {
                      if (renter.house.monthly)
                        setValue("rent", renter.house.monthly);
                      if (renter.house.elect_rate)
                        setValue("rate_electricity", renter.house.elect_rate);
                      if (renter.house.water_rate)
                        setValue("rate_water", renter.house.water_rate);

                      if (renter.house.billing_day) {
                        const d = new Date();
                        d.setDate(renter.house.billing_day);
                        setValue("month", d);
                      }
                    }

                    if (isAdding && e) {
                      setIsLoadingLatestBill(true);
                      try {
                        const latestBill = await GetLatestBillByRenter(
                          Number(e),
                        );
                        if (latestBill) {
                          setValue(
                            "prev_electricity",
                            latestBill.curr_electricity,
                          );
                          setValue("prev_water", latestBill.curr_water);
                        }
                      } catch {
                        // ignore - renter may have no bills yet
                      } finally {
                        setIsLoadingLatestBill(false);
                      }
                    }
                  }}
                  placeholder="Select Renter"
                  options={renters?.map((renter) => ({
                    value: renter.id,
                    label: renter.name,
                  }))}
                />
              )}
            />
            {errors.renterId && (
              <span className="text-sm text-red-500">
                {errors.renterId.message}
              </span>
            )}

            <div className="flex space-x-2">
              <Input
                min={0}
                className="flex-1"
                placeholder="Monthly Rent"
                disabled={isFieldsDisabled}
                {...register("rent", { required: "Rent is required." })}
              />
              {errors.rent && (
                <span className="text-sm text-red-500">
                  {errors.rent.message}
                </span>
              )}

              <Controller
                name="month"
                control={control}
                render={({ field }) => (
                  <DefDatePicker
                    className="flex-1"
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select month"
                    disabled={isFieldsDisabled}
                  />
                )}
              />
              {errors.month && (
                <span className="text-sm text-red-500">
                  {errors.month.message}
                </span>
              )}
            </div>

            <Separator />
            <div className="flex items-center">
              <span className="flex-1 text-sm font-semibold">Electricity</span>
              <Input
                min={0}
                className="w-20"
                placeholder="Rate"
                disabled={isFieldsDisabled}
                {...register("rate_electricity", {
                  required: "Rate is required.",
                })}
              />
            </div>
            <div className="flex space-x-2">
              <Input
                min={0}
                className="flex-1"
                placeholder="Previous"
                disabled={isFieldsDisabled}
                {...register("prev_electricity", {
                  required: "Previous Reading is required.",
                })}
              />

              <Input
                min={0}
                className="flex-1"
                placeholder="Current"
                disabled={isFieldsDisabled}
                {...register("curr_electricity", {
                  required: "Current is required.",
                })}
              />

              <Input
                min={0}
                className="flex-1"
                placeholder="Total"
                disabled
                value={totalElectric}
                {...register("total_electricity")}
              />
            </div>

            <Separator />
            <div className="flex items-center">
              <span className="flex-1 text-sm font-semibold">Water</span>
              <Input
                min={0}
                className="w-20"
                placeholder="Rate"
                disabled={isFieldsDisabled}
                {...register("rate_water", {
                  required: "Rate is required.",
                })}
              />
            </div>
            <div className="flex space-x-2">
              <Input
                min={0}
                className="flex-1"
                placeholder="Previous"
                disabled={isFieldsDisabled}
                {...register("prev_water", {
                  required: "Previous Reading is required.",
                })}
              />

              <Input
                min={0}
                className="flex-1"
                placeholder="Current"
                disabled={isFieldsDisabled}
                {...register("curr_water", {
                  required: "Current is required.",
                })}
              />

              <Input
                className="flex-1"
                placeholder="Total"
                disabled
                min={0}
                value={totalWater}
                {...register("total_water")}
              />
            </div>

            <Separator />
            <div className="flex">
              <Input
                className="w-50"
                min={0}
                placeholder="Other Charges"
                disabled={isFieldsDisabled}
                {...register("others", { valueAsNumber: true })}
              />
            </div>

            <Separator />

            <div className="flex justify-between pb-2 px-2 bg-slate-100 rounded p-2">
              <span className="text-sm font-medium">Total Bill:</span>
              <span className="text-sm font-semibold">
                {formatCurrency(grandTotal)}
              </span>
            </div>

            {/* 
            <Input
              placeholder="Pin"
              value={
                isAdding
                  ? crypto.randomBytes(2).toString("hex").toUpperCase()
                  : undefined
              }
              {...register("pin_hash", { required: "Monthly is required." })}
            />
            {errors.pin_hash && (
              <span className="text-sm text-red-500">
                {errors.pin_hash.message}
              </span>
            )} */}

            {/* <div className="w-full flex gap-4">
              <Controller
                name="prev_electricity"
                control={control}
                render={({ field }) => (
                  <DefDatePicker
                    className="flex-1"
                    value={field.value}
                    onChange={(date) => field.onChange(date?.toISOString())}
                    placeholder="Select previous electricity date"
                  />
                )}
              />
              {errors.prev_electricity && (
                <span className="text-sm text-red-500">
                  {errors.prev_electricity.message}
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
            </div> */}

            {!isAdding && selectedBill && (
              <div className="flex space-x-2">
                <Button
                  className="flex-1"
                  type="button"
                  variant="outline"
                  onClick={() => downloadBillPdf(selectedBill)}
                >
                  <Download className="w-4 h-4" />
                  Download Bill
                </Button>
                <Button
                  className="flex-1"
                  type="button"
                  variant="outline"
                  onClick={() => viewBillPdf(selectedBill)}
                >
                  <Eye className="w-4 h-4" />
                  View Bill
                </Button>
              </div>
            )}

            <div className="flex space-x-2">
              {!isAdding && selectedBill && (
                <Button
                  className="flex-1"
                  type="button"
                  variant="destructive"
                  disabled={isSubmitting}
                  onClick={() => onDelete(selectedBill)}
                >
                  <Trash2 className="w-2 h-2" />
                  Delete
                </Button>
              )}

              <Button
                className="flex-1"
                type="submit"
                disabled={
                  isSubmitting || isFieldsDisabled || isLoadingLatestBill
                }
              >
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
