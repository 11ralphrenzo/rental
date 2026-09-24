"use client";

import {
  DeleteUtility,
  GetAllUtilities,
  SaveUtility,
  UpdateUtility,
} from "@/services/utility-service";
import { DrawerDialog } from "@/components/reusable/def-drawer-dialog";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatCurrency, handleAxiosError } from "@/lib/utils";
import { Utility } from "@/models/utility";
import { CirclePlus, Pencil, Save, Trash2, Zap } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import useUtilityModal from "./hooks/useUtilityModal";

export default function Page() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<Utility>();
  const [utilities, setUtilities] = useState<Utility[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const {
    selectedUtility,
    setSelectedUtility,
    isAdding,
    setIsAdding,
    openAdd,
    openEdit,
    close,
  } = useUtilityModal();

  useEffect(() => {
    if (selectedUtility || isAdding) return;
    const getData = async () => {
      setIsLoading(true);
      try {
        const response = await GetAllUtilities();
        if (response) setUtilities(response.data);
      } catch (error) {
        handleAxiosError(error, "Failed to load utilities.");
      } finally {
        setIsLoading(false);
      }
    };
    getData();
  }, [selectedUtility, isAdding, refreshKey]);

  useEffect(() => {
    if (selectedUtility) {
      reset(selectedUtility);
    } else reset({});
  }, [reset, selectedUtility, isAdding]);

  const onSubmit = async (data: Utility) => {
    toast.loading(`${isAdding ? "Saving" : "Updating"} utility...`);
    try {
      const response = isAdding
        ? await SaveUtility(data)
        : await UpdateUtility(data);
      toast.dismiss();
      if (response) {
        toast.success(
          `Utility ${isAdding ? "saved" : "updated"} successfully.`,
        );

        if (isAdding) {
          setIsAdding(false);
        }
        setSelectedUtility(null);
      }
    } catch (err) {
      toast.dismiss();
      handleAxiosError(
        err,
        `Failed to ${isAdding ? "save" : "update"} utility.`,
      );
    }
  };

  const onDelete = useCallback(async (data: Utility) => {
    toast.loading(`Deleting utility...`);
    try {
      const response = await DeleteUtility(data.id);
      toast.dismiss();
      if (response) {
        toast.success(`Utility deleted successfully.`);
        setSelectedUtility(null);
        setRefreshKey(k => k + 1);
      }
    } catch (err) {
      toast.dismiss();
      handleAxiosError(err, `Failed to delete utility.`);
    }
  }, [setSelectedUtility]);

  return (
    <div className="min-h-screen bg-[#eaebed] text-zinc-900 font-sans p-4 md:p-8 antialiased selection:bg-purple-100 selection:text-purple-700 -m-4">
      <div className="max-w-[1520px] mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/90 backdrop-blur-xl border border-white/80 rounded-[24px] p-6 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.04)]">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Utilities Masterlist</h1>
            <p className="text-xs text-zinc-500 mt-0.5">Manage rates for Electricity, Water, and other utilities.</p>
          </div>
          <button
            className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs rounded-full shadow-sm transition-all disabled:opacity-50"
            onClick={() => openAdd()}
            disabled={isLoading && !utilities}
          >
            <CirclePlus className="w-4 h-4" />
            Add Utility
          </button>
        </div>

        {/* Content Section */}
        <div className="w-full">
          {isLoading && !utilities ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-white/60 rounded-[24px] h-32 border border-white/80 shadow-sm" />
              ))}
            </div>
          ) : utilities && utilities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white/90 backdrop-blur-xl border border-white/80 rounded-[24px] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.04)]">
              <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 mb-4 shadow-sm">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold tracking-tight text-zinc-900 mb-2">No utilities found</h3>
              <p className="text-xs text-zinc-500 max-w-sm mb-6">
                You haven't added any utilities yet. Start by adding Electricity or Water.
              </p>
              <button
                onClick={() => openAdd()}
                className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs rounded-full shadow-sm transition-all"
              >
                <CirclePlus className="w-4 h-4" />
                Add New Utility
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {utilities?.map((utility) => (
                <div
                  key={utility.id}
                  className="bg-white/90 backdrop-blur-xl border border-white/80 rounded-[20px] p-4 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.04)] flex flex-col justify-between group transition-all hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)]"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-900 shadow-sm shrink-0">
                        <Zap className="w-4 h-4 stroke-[2.2]" />
                      </div>
                      <div>
                        <h3 className="font-bold tracking-tight text-zinc-900 line-clamp-1 text-sm">{utility.name}</h3>
                      </div>
                    </div>
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="w-7 h-7 rounded-full bg-white border border-zinc-200/60 flex items-center justify-center text-zinc-600 hover:text-zinc-900 shadow-sm transition-all"
                        onClick={() => openEdit(utility)}
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
  
                  <div className="mt-3 pt-3 border-t border-zinc-100 flex items-end justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold block mb-0.5">Rate / {utility.unit || 'Unit'}</span>
                      <span className="text-xl font-black tracking-tight text-zinc-900">{formatCurrency(utility.rate)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      {/* Drawer Dialog for Add/Edit */}
      {(selectedUtility || isAdding) && (
        <DrawerDialog
          variant="drawer"
          side="right"
          className="w-full sm:w-[450px]"
          isOpen={!!selectedUtility || isAdding}
          onClose={() => {
            setSelectedUtility(null);
            if (isAdding) close();
          }}
          title={
            selectedUtility
              ? `Edit ${selectedUtility.name}`
              : "Add New Utility"
          }
          description="Fill out the utility details below."
        >
          <form
            className="flex flex-col h-full overflow-hidden"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <div className="space-y-4">
                <h3 className="text-sm font-black text-zinc-900 border-b border-zinc-100 pb-2">Utility Details</h3>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700">Utility Name</label>
                  <Input
                    className="rounded-full border-zinc-200/50 bg-zinc-50/80 focus-visible:ring-1 focus-visible:bg-white text-sm px-4 h-10"
                    placeholder="e.g. Electricity"
                    {...register("name", { required: "Name is required." })}
                  />
                  {errors.name && <span className="text-[10px] text-red-500 font-semibold">{errors.name.message}</span>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700">Rate</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-semibold text-sm">₱</span>
                      <Input
                        className="rounded-full border-zinc-200/50 bg-zinc-50/80 focus-visible:ring-1 focus-visible:bg-white text-sm pl-8 pr-4 h-10"
                        type="number"
                        placeholder="0.00"
                        min={0}
                        step="0.01"
                        {...register("rate", { 
                          required: "Rate is required.",
                          min: { value: 0, message: "Cannot be negative" },
                          setValueAs: (v) => v === "" ? undefined : Number(v)
                        })}
                      />
                    </div>
                    {errors.rate && <span className="text-[10px] text-red-500 font-semibold">{errors.rate.message}</span>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700">Unit (e.g. kWh, Cubic)</label>
                    <Input
                      className="rounded-full border-zinc-200/50 bg-zinc-50/80 focus-visible:ring-1 focus-visible:bg-white text-sm px-4 h-10"
                      placeholder="e.g. kWh"
                      {...register("unit")}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 p-6 border-t border-zinc-100 bg-white/90 backdrop-blur-md">
              {!isAdding && selectedUtility && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      type="button"
                      className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-full border border-red-100 transition-all disabled:opacity-50"
                      disabled={isSubmitting}
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-[24px]">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete "{selectedUtility.name}". This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-full font-bold text-xs">Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => onDelete(selectedUtility)}
                        className="rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm"
                      >
                        Delete Utility
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              <button 
                className={`flex items-center justify-center gap-2 px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs rounded-full shadow-sm transition-all disabled:opacity-50 ${!isAdding && selectedUtility ? 'flex-1' : 'w-full'}`} 
                type="submit" 
                disabled={isSubmitting}
              >
                <Save className="w-4 h-4" />
                {isAdding ? "Save Utility" : "Update Utility"}
              </button>
            </div>
          </form>
        </DrawerDialog>
      )}
    </div>
    </div>
  );
}
