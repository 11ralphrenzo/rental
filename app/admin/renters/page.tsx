"use client";

import { DrawerDialog } from "@/components/reusable/def-drawer-dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { formatDate, getDuration, handleAxiosError, toOrdinal } from "@/lib/utils";
import { CirclePlus, Pencil, Save, Trash2, User, Home, Calendar, Clock, Lock } from "lucide-react";
import { useCallback, useEffect, useState, useMemo } from "react";
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

export default function Page() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    control,
  } = useForm<Renter>({
    defaultValues: {
      pin_hash: crypto.randomBytes(2).toString("hex").toUpperCase(),
      active: true,
    },
  });
  const [renters, setRenters] = useState<Renter[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const [filterProperty, setFilterProperty] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [groupBy, setGroupBy] = useState<"none" | "property" | "status">("status");

  const {
    properties,
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
  }, [selectedRenter, isAdding, refreshKey]);

  const filteredRenters = useMemo(() => {
    if (!renters) return [];
    return renters.filter((r) => {
      if (filterProperty !== "all") {
        if (filterProperty === "none" && r.propertyId) return false;
        if (filterProperty !== "none" && r.propertyId !== filterProperty) return false;
      }
      if (filterStatus !== "all") {
        const isActive = r.active !== false;
        if (filterStatus === "active" && !isActive) return false;
        if (filterStatus === "inactive" && isActive) return false;
      }
      return true;
    });
  }, [renters, filterProperty, filterStatus]);

  const groupedRenters = useMemo(() => {
    if (groupBy === "none") return { "All Renters": filteredRenters };

    const groups: Record<string, Renter[]> = {};
    filteredRenters.forEach((r) => {
      let key = "Unknown";
      if (groupBy === "property") {
        key = r.property?.name || "No Property";
      } else if (groupBy === "status") {
        key = r.active !== false ? "Active" : "Inactive";
      }

      if (!groups[key]) groups[key] = [];
      groups[key].push(r);
    });
    return groups;
  }, [filteredRenters, groupBy]);

  useEffect(() => {
    if (selectedRenter) {
      reset(selectedRenter);
    } else {
      reset({ pin_hash: crypto.randomBytes(2).toString("hex").toUpperCase(), active: true });
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
    toast.loading(`Deleting renter details...`);
    try {
      const response = await DeleteRenter(data.id);
      toast.dismiss();
      if (response) {
        toast.success(`Renter details deleted successfully.`);
        setSelectedRenter(null);
        setRefreshKey(k => k + 1);
      }
    } catch (err) {
      toast.dismiss();
      handleAxiosError(err, `Failed to delete renter details.`);
    }
  }, [setSelectedRenter]);

  return (
    <div className="min-h-screen bg-[#eaebed] text-zinc-900 font-sans p-4 md:p-8 antialiased selection:bg-purple-100 selection:text-purple-700 -m-4">
      <div className="max-w-[1520px] mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/90 backdrop-blur-xl border border-white/80 rounded-[24px] p-6 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.04)]">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Renters Masterlist</h1>
            <p className="text-xs text-zinc-500 mt-0.5">Manage and track your active and past tenants.</p>
          </div>
          
          <button
            className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs rounded-full shadow-sm transition-all disabled:opacity-50"
            onClick={() => openAdd()}
            disabled={isLoading && !renters}
          >
            <CirclePlus className="w-4 h-4" />
            Add Renter
          </button>
        </div>

        {/* Filters & Grouping Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/90 backdrop-blur-xl border border-white/80 rounded-[20px] p-4 shadow-sm">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-1 w-full">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider whitespace-nowrap hidden sm:block">Filter</span>
            
            <div className="grid grid-cols-2 sm:flex w-full sm:w-auto gap-2 sm:gap-3">
              <Select value={filterProperty} onValueChange={setFilterProperty}>
                <SelectTrigger className="w-full sm:w-auto rounded-xl border-zinc-200/60 bg-white/60 focus:ring-1 text-xs h-9 px-3 min-w-[130px] shadow-sm">
                  <SelectValue placeholder="All Properties" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-zinc-200/60 shadow-md max-h-[300px]">
                  <SelectItem value="all" className="text-xs font-bold text-zinc-500">All Properties</SelectItem>
                  {properties?.map(p => (
                    <SelectItem key={p.id} value={p.id} className="text-xs font-medium rounded-lg">{p.name}</SelectItem>
                  ))}
                  <SelectItem value="none" className="text-xs font-medium rounded-lg">No Property</SelectItem>
                </SelectContent>
              </Select>
  
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-auto rounded-xl border-zinc-200/60 bg-white/60 focus:ring-1 text-xs h-9 px-3 min-w-[110px] shadow-sm">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-zinc-200/60 shadow-md">
                  <SelectItem value="all" className="text-xs font-bold text-zinc-500">All Status</SelectItem>
                  <SelectItem value="active" className="text-xs font-medium rounded-lg">Active</SelectItem>
                  <SelectItem value="inactive" className="text-xs font-medium rounded-lg">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="h-6 w-px bg-zinc-200 hidden md:block"></div>
          <div className="h-px w-full bg-zinc-200 block md:hidden"></div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full md:w-auto">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider whitespace-nowrap mb-1 sm:mb-0">Group by</span>
            <Select value={groupBy} onValueChange={(v: any) => setGroupBy(v)}>
              <SelectTrigger className="w-full sm:w-auto rounded-xl border-zinc-200/60 bg-white/60 focus:ring-1 text-xs h-9 px-3 min-w-[120px] shadow-sm">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-zinc-200/60 shadow-md">
                <SelectItem value="none" className="text-xs font-medium rounded-lg">None</SelectItem>
                <SelectItem value="property" className="text-xs font-medium rounded-lg">Property</SelectItem>
                <SelectItem value="status" className="text-xs font-medium rounded-lg">Status</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Content Section */}
        <div className="w-full">
          {isLoading && !renters ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-white/60 rounded-[24px] h-64 border border-white/80 shadow-sm" />
              ))}
            </div>
          ) : renters && renters.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white/90 backdrop-blur-xl border border-white/80 rounded-[24px] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.04)]">
              <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 mb-4 shadow-sm">
                <User className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold tracking-tight text-zinc-900 mb-2">No renters found</h3>
              <p className="text-xs text-zinc-500 max-w-sm mb-6">
                You haven't added any renters yet. Add a tenant to a property to start tracking.
              </p>
              <button
                onClick={() => openAdd()}
                className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs rounded-full shadow-sm transition-all"
              >
                <CirclePlus className="w-4 h-4" />
                Add New Renter
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {filteredRenters.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white/90 backdrop-blur-xl border border-white/80 rounded-[24px] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.04)]">
                  <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 mb-4 shadow-sm">
                    <User className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold tracking-tight text-zinc-900 mb-2">No renters found</h3>
                  <p className="text-xs text-zinc-500 max-w-sm mb-6">
                    No renters match your current filters. Try adjusting them.
                  </p>
                </div>
              ) : Object.entries(groupedRenters)
                .sort(([nameA], [nameB]) => {
                  if (groupBy === "status") return nameA === "Active" ? -1 : 1;
                  return nameA.localeCompare(nameB);
                })
                .map(([groupName, groupRenters]) => (
                <div key={groupName} className="space-y-4">
                  {groupBy !== "none" && (
                    <div className="flex items-center gap-3 px-2">
                      <h2 className="text-lg font-black text-zinc-800 tracking-tight">{groupName}</h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-zinc-200/50 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                        {groupRenters.length} Renter{groupRenters.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {groupRenters.map((renter) => (
                      <div
                        key={renter.id}
                        onClick={() => openEdit(renter)}
                  className="cursor-pointer bg-white/90 backdrop-blur-xl border border-white/80 rounded-[20px] p-4 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.04)] flex flex-col justify-between group transition-all hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)]"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-900 shadow-sm shrink-0">
                        <User className="w-4 h-4 stroke-[2.2]" />
                      </div>
                      <div>
                        <h3 className="font-bold tracking-tight text-zinc-900 line-clamp-1 text-sm">{renter.name}</h3>
                        <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-semibold mt-0.5">
                          <Home className="w-3 h-3 text-zinc-400" />
                          <span>{renter.property?.name || 'No Property'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <button
                        className="w-7 h-7 rounded-full bg-white border border-zinc-200/60 flex items-center justify-center text-zinc-600 hover:text-zinc-900 shadow-sm transition-all"
                        title="Copy Portal Link"
                        onClick={(e) => {
                          e.stopPropagation();
                          const url = `${window.location.origin}/r/${renter.id}`;
                          navigator.clipboard.writeText(url);
                          toast.success("Portal link copied to clipboard!");
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-link"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                      </button>
                      <button
                        className="w-7 h-7 rounded-full bg-white border border-zinc-200/60 flex items-center justify-center text-zinc-600 hover:text-zinc-900 shadow-sm transition-all"
                        onClick={(e) => { e.stopPropagation(); openEdit(renter); }}
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
  
                  <div className="space-y-2 flex-1 p-3 bg-zinc-50/80 border border-zinc-100 rounded-2xl">
                    <div className="flex items-center justify-between text-[11px] font-medium text-zinc-700">
                      <span className="flex items-center gap-1.5"><Lock className="w-3 h-3 text-zinc-400" /> PIN Hash</span>
                      <span className="font-bold font-mono tracking-wider bg-white px-1.5 py-0.5 rounded shadow-sm border border-zinc-100">{renter.pin_hash}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-medium text-zinc-700">
                      <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3 text-zinc-400" /> Billing Day</span>
                      <span className="font-semibold">{toOrdinal(renter.billing_day || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-medium text-zinc-700">
                      <span className="flex items-center gap-1.5"><Clock className="w-3 h-3 text-zinc-400" /> Duration</span>
                      <span className="font-semibold">{getDuration(renter.start_date, renter.end_date)}</span>
                    </div>
                  </div>
  
                  <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-bold block mb-0.5">Contract</span>
                      <span className="text-[11px] font-semibold text-zinc-700">{formatDate(renter.start_date)} - {renter.end_date ? formatDate(renter.end_date) : 'Ongoing'}</span>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 ${renter.active !== false ? 'bg-emerald-100/80 text-emerald-800 border-emerald-200/50' : 'bg-zinc-100/80 text-zinc-600 border-zinc-200/50'} text-[9px] uppercase tracking-wider font-bold rounded-full border`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${renter.active !== false ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
                      {renter.active !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            </div>
          ))}
        </div>
      )}
    </div>

      {/* Drawer Dialog for Add/Edit */}
      {(selectedRenter || isAdding) && (
        <DrawerDialog
          variant="drawer"
          side="right"
          className="w-full sm:w-[450px]"
          isOpen={!!selectedRenter || isAdding}
          onClose={() => {
            setSelectedRenter(null);
            if (isAdding) close();
          }}
          title={
            selectedRenter
              ? `Edit ${selectedRenter.name}`
              : "Add New Renter"
          }
          description="Fill out the renter details below."
        >
          <form
            className="flex flex-col h-full overflow-hidden"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* General Details Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-zinc-900 border-b border-zinc-100 pb-2">General Details</h3>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700">Renter Name</label>
                  <Input
                    className="rounded-full border-zinc-200/50 bg-zinc-50/80 focus-visible:ring-1 focus-visible:bg-white text-sm px-4 h-10"
                    placeholder="e.g. John Doe"
                    {...register("name", { required: "Name is required." })}
                  />
                  {errors.name && <span className="text-[10px] text-red-500 font-semibold">{errors.name.message}</span>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700">Property</label>
                  <Controller
                    control={control}
                    name="propertyId"
                    rules={{ required: "Property is required." }}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger className="w-full rounded-full border-zinc-200/50 bg-zinc-50/80 focus:ring-1 text-sm h-10 px-4">
                          <SelectValue placeholder="Select property" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-zinc-200/50 shadow-md">
                          {properties?.map(property => (
                            <SelectItem key={property.id} value={property.id} className="text-sm font-medium rounded-xl">
                              {property.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.propertyId && <span className="text-[10px] text-red-500 font-semibold">{errors.propertyId.message}</span>}
                </div>
              </div>

              {/* Account Settings Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-zinc-900 border-b border-zinc-100 pb-2">Account Settings</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700">PIN Hash</label>
                    <Input
                      className="rounded-full border-zinc-200/50 bg-zinc-50/80 focus-visible:ring-1 focus-visible:bg-white text-sm px-4 h-10 font-mono tracking-widest"
                      placeholder="e.g. A1B2"
                      {...register("pin_hash", { required: "PIN is required." })}
                    />
                    {errors.pin_hash && <span className="text-[10px] text-red-500 font-semibold">{errors.pin_hash.message}</span>}
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700">Status</label>
                    <Controller
                      control={control}
                      name="active"
                      render={({ field }) => (
                        <Select onValueChange={(val) => field.onChange(val === "true")} defaultValue={String(field.value !== false)}>
                          <SelectTrigger className="w-full rounded-full border-zinc-200/50 bg-zinc-50/80 focus:ring-1 text-sm h-10 px-4">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-zinc-200/50 shadow-md">
                            <SelectItem value="true" className="text-sm font-medium rounded-xl">Active</SelectItem>
                            <SelectItem value="false" className="text-sm font-medium rounded-xl">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Lease Details Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-zinc-900 border-b border-zinc-100 pb-2">Lease Details</h3>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700">Billing Day (1-31)</label>
                  <Input
                    className="rounded-full border-zinc-200/50 bg-zinc-50/80 focus-visible:ring-1 focus-visible:bg-white text-sm px-4 h-10"
                    type="number"
                    placeholder="1"
                    min={1}
                    max={31}
                    {...register("billing_day", { 
                      required: "Billing Day is required.",
                      min: { value: 1, message: "Minimum 1" },
                      max: { value: 31, message: "Maximum 31" },
                      setValueAs: (v) => v === "" ? undefined : Number(v)
                    })}
                  />
                  {errors.billing_day && <span className="text-[10px] text-red-500 font-semibold">{errors.billing_day.message}</span>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 flex flex-col">
                    <label className="text-xs font-bold text-zinc-700">Start Date</label>
                    <Controller
                      name="start_date"
                      control={control}
                      rules={{ required: "Start date is required." }}
                      render={({ field }) => (
                        <DefDatePicker
                          className="rounded-full border-zinc-200/50 bg-zinc-50/80 focus-visible:ring-1 focus-visible:bg-white text-sm px-4 h-10 w-full"
                          value={field.value}
                          onChange={(date) => field.onChange(date?.toISOString())}
                          placeholder="Select start date"
                        />
                      )}
                    />
                    {errors.start_date && <span className="text-[10px] text-red-500 font-semibold">{errors.start_date.message}</span>}
                  </div>
                  <div className="space-y-1.5 flex flex-col">
                    <label className="text-xs font-bold text-zinc-700">End Date</label>
                    <Controller
                      name="end_date"
                      control={control}
                      render={({ field }) => (
                        <DefDatePicker
                          className="rounded-full border-zinc-200/50 bg-zinc-50/80 focus-visible:ring-1 focus-visible:bg-white text-sm px-4 h-10 w-full"
                          value={field.value}
                          onChange={(date) => field.onChange(date?.toISOString())}
                          placeholder="Select end date"
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 p-6 border-t border-zinc-100 bg-white/90 backdrop-blur-md">
              {!isAdding && selectedRenter && (
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
                        This will permanently delete the renter "{selectedRenter.name}". This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-full font-bold text-xs">Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => onDelete(selectedRenter)}
                        className="rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm"
                      >
                        Delete Renter
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              <button 
                className={`flex items-center justify-center gap-2 px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs rounded-full shadow-sm transition-all disabled:opacity-50 ${!isAdding && selectedRenter ? 'flex-1' : 'w-full'}`} 
                type="submit" 
                disabled={isSubmitting}
              >
                <Save className="w-4 h-4" />
                {isAdding ? "Save Renter" : "Update Renter"}
              </button>
            </div>
          </form>
        </DrawerDialog>
      )}
    </div>
    </div>
  );
}
