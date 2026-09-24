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
import {
  BillStatusOptions,
  billStatusStyle,
  formatCurrency,
  formatDate,
  formatToTwoDecimals,
  handleAxiosError,
} from "@/lib/utils";
import { Download, Eye, FilePlus, Pencil, Save, Trash2, ReceiptText, Calendar, Zap, Home } from "lucide-react";
import { downloadBillPdf, viewBillPdf } from "@/lib/generate-bill-pdf";
import { useCallback, useEffect, useState, useMemo } from "react";
import { Controller, useForm, useWatch, useFieldArray } from "react-hook-form";
import { toast } from "sonner";
import useBillModal from "./hooks/useBillModal";

import { DefDatePicker } from "@/components/reusable/def-date-picker";
import {
  DeleteBill,
  GetAllBills,
  GetLatestBillByRenter,
  SaveBill,
  UpdateBill,
} from "@/services/bills-service";
import { Bill } from "@/models/bill";
import { BillStatus } from "@/lib/enum";

export default function Page() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    control,
    setValue,
  } = useForm<Bill>({
    defaultValues: {
      status: BillStatus.PENDING,
      renterId: undefined,
      month: new Date(),
      customCharges: [],
      utilities: [],
    },
  });

  const { fields, replace } = useFieldArray({
    control,
    name: "utilities",
  });

  const { fields: customFields, append: appendCustomCharge, remove: removeCustomCharge } = useFieldArray({
    control,
    name: "customCharges",
  });

  const [bills, setBills] = useState<Bill[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingLatestBill, setIsLoadingLatestBill] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [filterRenterId, setFilterRenterId] = useState<string>("all");
  const [filterMonth, setFilterMonth] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [groupBy, setGroupBy] = useState<"none" | "renter" | "month">("month");

  const {
    renters,
    masterUtilities,
    selectedBill,
    setSelectedBill,
    isAdding,
    setIsAdding,
    openAdd,
    openEdit,
    close,
    getResources,
  } = useBillModal();

  const rent = useWatch({ control, name: "rent" });
  const watchedCustomCharges = useWatch({ control, name: "customCharges" });
  const renterId = useWatch({ control, name: "renterId" });
  const watchedUtilities = useWatch({ control, name: "utilities" });

  const isFieldsDisabled = !renterId;

  const filteredBills = useMemo(() => {
    if (!bills) return [];
    return bills.filter((b) => {
      if (filterRenterId !== "all" && b.renterId !== filterRenterId) return false;
      if (filterStatus !== "all" && b.status !== filterStatus) return false;
      if (filterMonth !== "all") {
        const bMonth = formatDate(b.month, "MMMM yyyy");
        if (bMonth !== filterMonth) return false;
      }
      return true;
    });
  }, [bills, filterRenterId, filterStatus, filterMonth]);

  const groupedBills = useMemo(() => {
    if (groupBy === "none") return { "All Bills": filteredBills };
    
    const groups: Record<string, Bill[]> = {};
    filteredBills.forEach((b) => {
      let key = "Unknown";
      if (groupBy === "renter") {
        key = b.renter?.name || "Unknown Renter";
      } else if (groupBy === "month") {
        key = formatDate(b.month, "MMMM yyyy");
      }
      
      if (!groups[key]) groups[key] = [];
      groups[key].push(b);
    });
    return groups;
  }, [filteredBills, groupBy]);

  const uniqueMonths = useMemo(() => {
    if (!bills) return [];
    const months = new Set(bills.map(b => formatDate(b.month, "MMMM yyyy")));
    return Array.from(months);
  }, [bills]);

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
  }, [selectedBill, isAdding, refreshKey]);

  useEffect(() => {
    // Fetch masterUtilities (and renters) initially so they are available when editing
    getResources();
  }, [getResources]);

  useEffect(() => {
    if (selectedBill) {
      if (masterUtilities && masterUtilities.length > 0) {
        const mergedUtilities = masterUtilities.map(mu => {
          const existingUtil = selectedBill.utilities?.find(u => u.utilityId === mu.id);
          if (existingUtil) return existingUtil;
          return {
            utilityId: mu.id,
            name: mu.name,
            rate: mu.rate,
            unit: mu.unit || '',
            prev: 0,
            curr: 0,
            total: 0
          };
        });
        reset({ ...selectedBill, utilities: mergedUtilities });
      } else {
        reset(selectedBill);
      }
    } else {
      const defaultUtilities = masterUtilities?.map(mu => ({
        utilityId: mu.id,
        name: mu.name,
        rate: mu.rate,
        unit: mu.unit || '',
        prev: 0,
        curr: 0,
        total: 0
      })) || [];
      reset({
        status: BillStatus.PENDING,
        month: new Date(),
        customCharges: [],
        utilities: defaultUtilities,
      });
    }
  }, [reset, selectedBill, masterUtilities]);

  // Single effect: recalculate per-utility totals AND the grand total together
  useEffect(() => {
    let utilsTotal = 0;
    watchedUtilities?.forEach((u, index) => {
      if (u.prev !== undefined && u.curr !== undefined && u.rate !== undefined) {
        const diff = Math.max(0, Number(u.curr) - Number(u.prev));
        const lineTotal = Number(formatToTwoDecimals(diff * Number(u.rate)));
        if (lineTotal !== Number(u.total)) {
          setValue(`utilities.${index}.total`, lineTotal);
        }
        utilsTotal += lineTotal;
      } else {
        utilsTotal += Number(u.total || 0);
      }
    });
    const customTotal = watchedCustomCharges?.reduce((sum, c) => sum + Number(c.amount || 0), 0) ?? 0;
    const grand = Number(rent ?? 0) + utilsTotal + customTotal;
    setValue("total", grand);
  }, [watchedUtilities, watchedCustomCharges, rent, setValue]);

  const grandTotal = useWatch({ control, name: "total" });

  const onSubmit = async (data: Bill) => {
    toast.loading(`${isAdding ? "Saving" : "Updating"} bill details...`);
    try {
      const response = isAdding ? await SaveBill(data) : await UpdateBill(data);
      toast.dismiss();
      if (response) {
        toast.success(`Bill details ${isAdding ? "saved" : "updated"} successfully.`);
        if (isAdding) setIsAdding(false);
        setSelectedBill(null);
      }
    } catch (err) {
      toast.dismiss();
      handleAxiosError(err, `Failed to ${isAdding ? "save" : "update"} bill details.`);
    }
  };

  const onDelete = useCallback(async (data: Bill) => {
    toast.loading(`Deleting bill...`);
    try {
      const response = await DeleteBill(data.id);
      toast.dismiss();
      if (response) {
        toast.success(`Bill deleted successfully.`);
        setSelectedBill(null);
        setRefreshKey(k => k + 1);
      }
    } catch (err) {
      toast.dismiss();
      handleAxiosError(err, `Failed to delete bill.`);
    }
  }, [setSelectedBill]);

  return (
    <div className="min-h-screen bg-[#eaebed] text-zinc-900 font-sans p-4 md:p-8 antialiased selection:bg-purple-100 selection:text-purple-700 -m-4">
      <div className="max-w-[1520px] mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/90 backdrop-blur-xl border border-white/80 rounded-[24px] p-6 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.04)]">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Bills Masterlist</h1>
            <p className="text-xs text-zinc-500 mt-0.5">Manage utility charges, rent, and payments.</p>
          </div>
          <button
            className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs rounded-full shadow-sm transition-all disabled:opacity-50"
            onClick={() => openAdd()}
            disabled={isLoading && !bills}
          >
            <FilePlus className="w-4 h-4" />
            New Bill
          </button>
        </div>

        {/* Filters & Grouping Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/90 backdrop-blur-xl border border-white/80 rounded-[20px] p-4 shadow-sm">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-1 w-full">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider whitespace-nowrap hidden sm:block">Filter</span>
            
            <div className="grid grid-cols-2 sm:flex w-full sm:w-auto gap-2 sm:gap-3">
              <Select value={filterRenterId} onValueChange={setFilterRenterId}>
                <SelectTrigger className="w-full sm:w-auto rounded-xl border-zinc-200/60 bg-white/60 focus:ring-1 text-xs h-9 px-3 min-w-[130px] shadow-sm">
                  <SelectValue placeholder="All Renters" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-zinc-200/60 shadow-md max-h-[300px]">
                  <SelectItem value="all" className="text-xs font-bold text-zinc-500">All Renters</SelectItem>
                  {renters?.map(r => (
                    <SelectItem key={r.id} value={r.id} className="text-xs font-medium rounded-lg">{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
  
              <Select value={filterMonth} onValueChange={setFilterMonth}>
                <SelectTrigger className="w-full sm:w-auto rounded-xl border-zinc-200/60 bg-white/60 focus:ring-1 text-xs h-9 px-3 min-w-[120px] shadow-sm">
                  <SelectValue placeholder="All Months" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-zinc-200/60 shadow-md">
                  <SelectItem value="all" className="text-xs font-bold text-zinc-500">All Months</SelectItem>
                  {uniqueMonths.map(m => (
                    <SelectItem key={m} value={m} className="text-xs font-medium rounded-lg">{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
  
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-auto rounded-xl border-zinc-200/60 bg-white/60 focus:ring-1 text-xs h-9 px-3 min-w-[110px] shadow-sm col-span-2 sm:col-span-1">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-zinc-200/60 shadow-md">
                  <SelectItem value="all" className="text-xs font-bold text-zinc-500">All Status</SelectItem>
                  {BillStatusOptions.map(s => (
                    <SelectItem key={s} value={s} className="text-xs font-medium rounded-lg">{s}</SelectItem>
                  ))}
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
                <SelectItem value="month" className="text-xs font-medium rounded-lg">Month</SelectItem>
                <SelectItem value="renter" className="text-xs font-medium rounded-lg">Renter</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Content Section */}
        <div className="w-full">
          {isLoading && !bills ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-white/60 rounded-[24px] h-64 border border-white/80 shadow-sm" />
              ))}
            </div>
          ) : bills && bills.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white/90 backdrop-blur-xl border border-white/80 rounded-[24px] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.04)]">
              <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 mb-4 shadow-sm">
                <ReceiptText className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold tracking-tight text-zinc-900 mb-2">No bills found</h3>
              <p className="text-xs text-zinc-500 max-w-sm mb-6">
                You haven't added any bills yet. Start by generating a new bill for a renter.
              </p>
              <button
                onClick={() => openAdd()}
                className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs rounded-full shadow-sm transition-all"
              >
                <FilePlus className="w-4 h-4" />
                Add New Bill
              </button>
            </div>
          ) : filteredBills.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white/90 backdrop-blur-xl border border-white/80 rounded-[24px] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.04)]">
              <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 mb-4 shadow-sm">
                <ReceiptText className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold tracking-tight text-zinc-900 mb-2">No bills found</h3>
              <p className="text-xs text-zinc-500 max-w-sm mb-6">
                No bills match your current filters. Try adjusting them.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedBills).map(([groupName, groupBills]) => (
                <div key={groupName} className="space-y-4">
                  {groupBy !== "none" && (
                    <div className="flex items-center gap-3 px-2">
                      <h2 className="text-lg font-black text-zinc-800 tracking-tight">{groupName}</h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-zinc-200/50 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                        {groupBills.length} Bill{groupBills.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {groupBills.map((bill) => (
                <div
                  key={bill.id}
                  className="bg-white/90 backdrop-blur-xl border border-white/80 rounded-[20px] p-4 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.04)] flex flex-col justify-between group transition-all hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)]"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-900 shadow-sm shrink-0">
                        <ReceiptText className="w-4 h-4 stroke-[2.2]" />
                      </div>
                      <div>
                        <h3 className="font-bold tracking-tight text-zinc-900 line-clamp-1 text-sm">{bill.renter?.name || "Unknown"}</h3>
                        <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-semibold mt-0.5">
                          <Calendar className="w-3 h-3 text-zinc-400" />
                          <span>{formatDate(bill.month)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="w-7 h-7 rounded-full bg-white border border-zinc-200/60 flex items-center justify-center text-zinc-600 hover:text-zinc-900 shadow-sm transition-all"
                        onClick={() => openEdit(bill)}
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
  
                  <div className="space-y-2 flex-1 p-3 bg-zinc-50/80 border border-zinc-100 rounded-2xl">
                    <div className="flex items-center justify-between text-[11px] font-medium text-zinc-700">
                      <span className="flex items-center gap-1.5"><Home className="w-3 h-3 text-zinc-400" /> Rent</span>
                      <span className="font-semibold">{formatCurrency(bill.rent)}</span>
                    </div>
                    {bill.utilities?.map((u, i) => (
                      <div key={i} className="flex items-center justify-between text-[11px] font-medium text-zinc-700">
                        <span className="flex items-center gap-1.5"><Zap className="w-3 h-3 text-zinc-400" /> {u.name}</span>
                        <span className="font-semibold">{formatCurrency(u.total)}</span>
                      </div>
                    ))}
                    {bill.customCharges?.map((c, i) => (
                      <div key={`custom-${i}`} className="flex items-center justify-between text-[11px] font-medium text-zinc-700">
                        <span className="flex items-center gap-1.5"><FilePlus className="w-3 h-3 text-zinc-400" /> {c.name}</span>
                        <span className="font-semibold">{formatCurrency(c.amount)}</span>
                      </div>
                    ))}
                  </div>
  
                  <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-bold block mb-0.5">Total Amount</span>
                      <span className="text-[13px] font-black text-zinc-900">{formatCurrency(bill.total)}</span>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 ${bill.status === BillStatus.PAID ? 'bg-emerald-100/80 text-emerald-800 border-emerald-200/50' : bill.status === BillStatus.OVERDUE ? 'bg-red-100/80 text-red-800 border-red-200/50' : 'bg-amber-100/80 text-amber-800 border-amber-200/50'} text-[9px] uppercase tracking-wider font-bold rounded-full border`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${bill.status === BillStatus.PAID ? 'bg-emerald-500' : bill.status === BillStatus.OVERDUE ? 'bg-red-500' : 'bg-amber-500'}`} />
                      {bill.status}
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
      {(selectedBill || isAdding) && (
        <DrawerDialog
          variant="drawer"
          side="right"
          className="w-full sm:w-[450px]"
          isOpen={!!selectedBill || isAdding}
          onClose={() => {
            setSelectedBill(null);
            if (isAdding) close();
          }}
          title={
            selectedBill
              ? `Edit Bill`
              : "Add New Bill"
          }
          description="Fill out the bill details below."
        >
          <form
            className="flex flex-col h-full overflow-hidden"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* General Details Section */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-zinc-900 uppercase tracking-wider px-1">General Details</h3>
                
                <div className="p-4 bg-white border border-zinc-100 rounded-2xl space-y-4 shadow-sm">
                  {/* Renter */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Renter</label>
                    <Controller
                      control={control}
                      name="renterId"
                      rules={{ required: "Renter is required." }}
                      render={({ field }) => (
                        <Select 
                          onValueChange={async (e) => {
                            field.onChange(e);
                            const renter = renters?.find((r) => r.id === String(e));
                            if (renter && renter.property) {
                              if (renter.property.monthly) setValue("rent", renter.property.monthly);
                              if (renter.billing_day) {
                                const d = new Date();
                                d.setDate(renter.billing_day);
                                setValue("month", d);
                              }
                            }
  
                            if (isAdding && e && masterUtilities) {
                              setIsLoadingLatestBill(true);
                              try {
                                const latestBill = await GetLatestBillByRenter(String(e));
                                const newUtilities = masterUtilities.map(mu => {
                                  const latestUtil = latestBill?.utilities?.find(u => u.utilityId === mu.id);
                                  return {
                                    utilityId: mu.id,
                                    name: mu.name,
                                    rate: mu.rate,
                                    unit: mu.unit || '',
                                    prev: latestUtil?.curr || 0,
                                    curr: 0,
                                    total: 0
                                  };
                                });
                                replace(newUtilities);
                              } catch {
                                // ignore
                              } finally {
                                setIsLoadingLatestBill(false);
                              }
                            }
                          }}
                          defaultValue={field.value}
                          disabled={!isAdding && !!selectedBill}
                        >
                          <SelectTrigger className="w-full rounded-xl border-zinc-200/60 bg-zinc-50/50 focus:ring-1 text-xs h-10 px-3">
                            <SelectValue placeholder="Select renter" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-zinc-200/60 shadow-md">
                            {renters?.map(renter => (
                              <SelectItem key={renter.id} value={renter.id} className="text-xs font-medium rounded-lg">
                                {renter.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.renterId && <span className="text-[10px] text-red-500 font-semibold">{errors.renterId.message}</span>}
                  </div>
  
                  {/* Billing Month */}
                  <div className="space-y-1.5 flex flex-col">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Billing Month</label>
                    <Controller
                      name="month"
                      control={control}
                      rules={{ required: "Month is required." }}
                      render={({ field }) => (
                        <DefDatePicker
                          className="rounded-xl border-zinc-200/60 bg-zinc-50/50 focus-visible:ring-1 focus-visible:bg-white text-xs px-3 h-10 w-full"
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select month"
                          disabled={isFieldsDisabled}
                        />
                      )}
                    />
                    {errors.month && <span className="text-[10px] text-red-500 font-semibold">{errors.month.message}</span>}
                  </div>
                    
                  <div className="grid grid-cols-2 gap-3">
                    {/* Status */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Status</label>
                      <Controller
                        control={control}
                        name="status"
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger className="w-full rounded-xl border-zinc-200/60 bg-zinc-50/50 focus:ring-1 text-xs h-10 px-3">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-zinc-200/60 shadow-md">
                              {BillStatusOptions.map(s => (
                                <SelectItem key={s} value={s} className="text-xs font-medium rounded-lg">{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
    
                    {/* Monthly Rent */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Monthly Rent</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-semibold text-xs">₱</span>
                        <Input
                          className="rounded-xl border-zinc-200/60 bg-zinc-50/50 focus-visible:ring-1 focus-visible:bg-white text-xs pl-7 pr-3 h-10 font-bold text-zinc-800"
                          type="number"
                          placeholder="0.00"
                          min={0}
                          step="0.01"
                          disabled={isFieldsDisabled}
                          {...register("rent", { 
                            required: "Rent is required.",
                            setValueAs: (v) => v === "" ? undefined : Number(v)
                          })}
                        />
                      </div>
                      {errors.rent && <span className="text-[10px] text-red-500 font-semibold">{errors.rent.message}</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Utilities Section */}
              {fields.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-zinc-900 uppercase tracking-wider px-1">Utilities</h3>
                  {fields.map((field, index) => (
                    <div key={field.id} className="p-4 bg-zinc-50/70 border border-zinc-100 rounded-2xl space-y-3 transition-all hover:border-zinc-200/80">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-bold text-zinc-800 flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-zinc-400"/> {field.name}</h4>
                        <span className="text-sm font-black text-zinc-900">₱{watchedUtilities?.[index]?.total || 0}</span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Rate</label>
                          <Input className="rounded-lg border-zinc-200/50 bg-white text-xs px-2.5 h-8 focus-visible:ring-1" type="number" step="0.01" disabled={isFieldsDisabled} {...register(`utilities.${index}.rate` as const, { required: true, setValueAs: (v) => v === "" ? undefined : Number(v) })} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Prev</label>
                          <Input className="rounded-lg border-zinc-200/50 bg-white text-xs px-2.5 h-8 focus-visible:ring-1" type="number" step="0.01" disabled={isFieldsDisabled} {...register(`utilities.${index}.prev` as const, { required: true, setValueAs: (v) => v === "" ? undefined : Number(v) })} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Curr</label>
                          <Input className="rounded-lg border-zinc-200/50 bg-white text-xs px-2.5 h-8 focus-visible:ring-1" type="number" step="0.01" disabled={isFieldsDisabled} {...register(`utilities.${index}.curr` as const, { required: true, setValueAs: (v) => v === "" ? undefined : Number(v) })} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Custom Charges Section */}
              <div className="space-y-3 px-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-zinc-900 uppercase tracking-wider">Custom Charges</h3>
                  <button
                    type="button"
                    onClick={() => appendCustomCharge({ name: "", amount: 0 })}
                    className="flex items-center gap-1 text-[10px] font-bold text-zinc-600 hover:text-zinc-900 bg-white border border-zinc-200 rounded-full px-2.5 py-1 transition-all shadow-sm"
                    disabled={isFieldsDisabled}
                  >
                    + Add Charge
                  </button>
                </div>
                
                {customFields.length === 0 ? (
                  <div className="text-center py-4 bg-zinc-50/50 border border-zinc-100 border-dashed rounded-xl">
                    <span className="text-[10px] font-medium text-zinc-400">No custom charges added</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {customFields.map((field, index) => (
                      <div key={field.id} className="flex gap-2 items-start bg-zinc-50/50 p-2.5 rounded-xl border border-zinc-100">
                        <div className="flex-1 space-y-1">
                          <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Name / Reason</label>
                          <Input
                            className="rounded-lg border-zinc-200/50 bg-white text-xs px-2.5 h-8 focus-visible:ring-1"
                            placeholder="e.g. Late Fee"
                            disabled={isFieldsDisabled}
                            {...register(`customCharges.${index}.name` as const, { required: true })}
                          />
                        </div>
                        <div className="w-28 space-y-1">
                          <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Amount</label>
                          <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 font-semibold text-xs">₱</span>
                            <Input
                              className="rounded-lg border-zinc-200/50 bg-white text-xs pl-6 pr-2.5 h-8 focus-visible:ring-1"
                              type="number"
                              step="0.01"
                              disabled={isFieldsDisabled}
                              {...register(`customCharges.${index}.amount` as const, { 
                                required: true,
                                setValueAs: (v) => v === "" ? undefined : Number(v)
                              })}
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeCustomCharge(index)}
                          className="mt-5 w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 transition-all shrink-0"
                          disabled={isFieldsDisabled}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-zinc-900 text-white p-4 rounded-[20px] flex justify-between items-center shadow-md">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">Grand Total</span>
                <span className="text-xl font-black">{formatCurrency(grandTotal ?? 0)}</span>
              </div>
              
              {!isAdding && selectedBill && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 py-2.5 bg-white border border-zinc-200 text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50 font-bold text-xs rounded-full transition-all"
                    onClick={() => downloadBillPdf(selectedBill)}
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download PDF
                  </button>
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 py-2.5 bg-white border border-zinc-200 text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50 font-bold text-xs rounded-full transition-all"
                    onClick={() => viewBillPdf(selectedBill)}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View PDF
                  </button>
                </div>
              )}
            </div>

            <div className="flex space-x-3 p-6 border-t border-zinc-100 bg-white/90 backdrop-blur-md">
              {!isAdding && selectedBill && (
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
                        This will permanently delete this bill. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-full font-bold text-xs">Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => onDelete(selectedBill)}
                        className="rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm"
                      >
                        Delete Bill
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              <button 
                className={`flex items-center justify-center gap-2 px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs rounded-full shadow-sm transition-all disabled:opacity-50 ${!isAdding && selectedBill ? 'flex-1' : 'w-full'}`} 
                type="submit" 
                disabled={isSubmitting || isFieldsDisabled || isLoadingLatestBill}
              >
                <Save className="w-4 h-4" />
                {isAdding ? "Save Bill" : "Update Bill"}
              </button>
            </div>
          </form>
        </DrawerDialog>
      )}
    </div>
    </div>
  );
}
