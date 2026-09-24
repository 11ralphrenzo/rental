"use client";

import {
  DeleteProperty,
  GetAllProperties,
  SaveProperty,
  UpdateProperty,
} from "@/services/property-service";
import { DrawerDialog } from "@/components/reusable/def-drawer-dialog";
import { Button } from "@/components/ui/button";
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
import { formatCurrency, handleAxiosError } from "@/lib/utils";
import { Property } from "@/models/property";
import { Building, CirclePlus, Home, MapPin, Pencil, Save, Trash2, Bed, Bath } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import usePropertyModal from "./hooks/usePropertyModal";

export default function Page() {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<Property>();
  const [properties, setProperties] = useState<Property[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toDelete, setToDelete] = useState<Property | null>(null);

  const {
    selectedProperty,
    setSelectedProperty,
    isAdding,
    setIsAdding,
    openAdd,
    openEdit,
    close,
  } = usePropertyModal();

  useEffect(() => {
    if (selectedProperty || isAdding) return;
    const getData = async () => {
      setIsLoading(true);
      try {
        const response = await GetAllProperties();
        if (response) setProperties(response.data);
      } catch (error) {
        handleAxiosError(error, "Failed to load properties.");
      } finally {
        setIsLoading(false);
      }
    };
    getData();
  }, [selectedProperty, isAdding, toDelete]);

  useEffect(() => {
    if (selectedProperty) {
      reset(selectedProperty);
    } else reset({ type: "Apartment", status: "Available" });
  }, [reset, selectedProperty, isAdding]);

  const onSubmit = async (data: Property) => {
    toast.loading(`${isAdding ? "Saving" : "Updating"} property...`);
    try {
      const response = isAdding
        ? await SaveProperty(data)
        : await UpdateProperty(data);
      toast.dismiss();
      if (response) {
        toast.success(
          `Property ${isAdding ? "saved" : "updated"} successfully.`,
        );

        if (isAdding) {
          setIsAdding(false);
        }
        setSelectedProperty(null);
      }
    } catch (err) {
      toast.dismiss();
      handleAxiosError(
        err,
        `Failed to ${isAdding ? "save" : "update"} property.`,
      );
    }
  };

  const onDelete = useCallback(async (data: Property) => {
    setToDelete(data);
    toast.loading(`Deleting property...`);
    try {
      const response = await DeleteProperty(data.id);
      toast.dismiss();
      if (response) {
        toast.success(`Property deleted successfully.`);
        setToDelete(null);
        setSelectedProperty(null);
      }
    } catch (err) {
      toast.dismiss();
      handleAxiosError(err, `Failed to delete property.`);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#eaebed] text-zinc-900 font-sans p-4 md:p-8 antialiased selection:bg-purple-100 selection:text-purple-700 -m-4">
      <div className="max-w-[1520px] mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/90 backdrop-blur-xl border border-white/80 rounded-[24px] p-6 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.04)]">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Properties Portfolio</h1>
            <p className="text-xs text-zinc-500 mt-0.5">Manage and monitor all your rental units.</p>
          </div>
          <button
            className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs rounded-full shadow-sm transition-all disabled:opacity-50"
            onClick={() => openAdd()}
            disabled={isLoading && !properties}
          >
            <CirclePlus className="w-4 h-4" />
            Add Property
          </button>
        </div>

        {/* Content Section */}
        <div className="w-full">
          {isLoading && !properties ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-white/60 rounded-[24px] h-64 border border-white/80 shadow-sm" />
              ))}
            </div>
          ) : properties && properties.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white/90 backdrop-blur-xl border border-white/80 rounded-[24px] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.04)]">
              <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 mb-4 shadow-sm">
                <Home className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold tracking-tight text-zinc-900 mb-2">No properties found</h3>
              <p className="text-xs text-zinc-500 max-w-sm mb-6">
                You haven't added any properties yet. Start building your portfolio by adding your first property.
              </p>
              <button
                onClick={() => openAdd()}
                className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs rounded-full shadow-sm transition-all"
              >
                <CirclePlus className="w-4 h-4" />
                Add New Property
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {properties?.map((property) => (
                <div
                  key={property.id}
                  className="bg-white/90 backdrop-blur-xl border border-white/80 rounded-[20px] p-4 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.04)] flex flex-col justify-between group transition-all hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)]"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-900 shadow-sm shrink-0">
                        {property.type === "House" ? <Home className="w-4 h-4 stroke-[2.2]" /> : <Building className="w-4 h-4 stroke-[2.2]" />}
                      </div>
                      <div>
                        <h3 className="font-bold tracking-tight text-zinc-900 line-clamp-1 text-sm">{property.name}</h3>
                        <span className="text-[10px] text-zinc-500 font-semibold px-2 py-0.5 bg-zinc-50 rounded-full border border-zinc-200/50 inline-block mt-0.5">
                          {property.type || "Property"}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="w-7 h-7 rounded-full bg-white border border-zinc-200/60 flex items-center justify-center text-zinc-600 hover:text-zinc-900 shadow-sm transition-all"
                        onClick={() => openEdit(property)}
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
  
                  <div className="space-y-2 flex-1 p-3 bg-zinc-50/80 border border-zinc-100 rounded-2xl">
                    {property.address && (
                      <div className="flex items-start text-[11px] font-medium text-zinc-700 gap-1.5">
                        <MapPin className="w-3 h-3 mt-0.5 text-zinc-400 shrink-0" />
                        <span className="line-clamp-1">{property.address}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-600">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Bed className="w-3 h-3 text-zinc-400" />
                          <span>{property.bedrooms || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Bath className="w-3 h-3 text-zinc-400" />
                          <span>{property.bathrooms || 0}</span>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 ${property.status === 'Available' ? 'bg-emerald-100/80 text-emerald-800 border-emerald-200/50' : property.status === 'Occupied' ? 'bg-purple-100/80 text-purple-800 border-purple-200/50' : 'bg-amber-100/80 text-amber-800 border-amber-200/50'} text-[9px] uppercase tracking-wider font-bold rounded-full border`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${property.status === 'Available' ? 'bg-emerald-500' : property.status === 'Occupied' ? 'bg-purple-500' : 'bg-amber-500'}`} />
                        {property.status || 'Unknown'}
                      </span>
                    </div>
                  </div>
  
                  <div className="mt-3 pt-3 border-t border-zinc-100 flex items-end justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold block mb-0.5">Monthly Rent</span>
                      <span className="text-xl font-black tracking-tight text-zinc-900">{formatCurrency(property.monthly)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      {/* Drawer Dialog for Add/Edit */}
      {(selectedProperty || isAdding) && (
        <DrawerDialog
          variant="drawer"
          side="right"
          className="w-full sm:w-[450px]"
          isOpen={!!selectedProperty || isAdding}
          onClose={() => {
            setSelectedProperty(null);
            if (isAdding) close();
          }}
          title={
            selectedProperty
              ? `Edit ${selectedProperty.name}`
              : "Add New Property"
          }
          description="Fill out the property details below."
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
                  <label className="text-xs font-bold text-zinc-700">Property Name</label>
                  <Input
                    className="rounded-full border-zinc-200/50 bg-zinc-50/80 focus-visible:ring-1 focus-visible:bg-white text-sm px-4 h-10"
                    placeholder="e.g. Sunset Apartments"
                    {...register("name", { required: "Name is required." })}
                  />
                  {errors.name && <span className="text-[10px] text-red-500 font-semibold">{errors.name.message}</span>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700">Property Type</label>
                    <Controller
                      control={control}
                      name="type"
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value || "Apartment"}>
                          <SelectTrigger className="rounded-full border-zinc-200/50 bg-zinc-50/80 focus:ring-1 text-sm h-10 px-4">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-zinc-200/50 shadow-md">
                            <SelectItem value="Apartment" className="text-sm font-medium rounded-xl">Apartment</SelectItem>
                            <SelectItem value="House" className="text-sm font-medium rounded-xl">House</SelectItem>
                            <SelectItem value="Commercial" className="text-sm font-medium rounded-xl">Commercial</SelectItem>
                            <SelectItem value="Room" className="text-sm font-medium rounded-xl">Room</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700">Status</label>
                    <Controller
                      control={control}
                      name="status"
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value || "Available"}>
                          <SelectTrigger className="rounded-full border-zinc-200/50 bg-zinc-50/80 focus:ring-1 text-sm h-10 px-4">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-zinc-200/50 shadow-md">
                            <SelectItem value="Available" className="text-sm font-medium rounded-xl">Available</SelectItem>
                            <SelectItem value="Occupied" className="text-sm font-medium rounded-xl">Occupied</SelectItem>
                            <SelectItem value="Maintenance" className="text-sm font-medium rounded-xl">Maintenance</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700">Address (Optional)</label>
                  <Input
                    className="rounded-full border-zinc-200/50 bg-zinc-50/80 focus-visible:ring-1 focus-visible:bg-white text-sm px-4 h-10"
                    placeholder="123 Main St..."
                    {...register("address")}
                  />
                </div>
              </div>

              {/* Financials Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-zinc-900 border-b border-zinc-100 pb-2">Financials</h3>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700">Monthly Rent</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-semibold text-sm">₱</span>
                    <Input
                      className="rounded-full border-zinc-200/50 bg-zinc-50/80 focus-visible:ring-1 focus-visible:bg-white text-sm pl-8 pr-4 h-10"
                      type="number"
                      placeholder="0.00"
                      min={0}
                      step="0.01"
                      {...register("monthly", { 
                        required: "Monthly is required.",
                        min: { value: 0, message: "Cannot be negative" },
                        setValueAs: (v) => v === "" ? undefined : Number(v)
                      })}
                    />
                  </div>
                  {errors.monthly && <span className="text-[10px] text-red-500 font-semibold">{errors.monthly.message}</span>}
                </div>
              </div>

              {/* Features Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-zinc-900 border-b border-zinc-100 pb-2">Features</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700">Bedrooms</label>
                    <Input
                      className="rounded-full border-zinc-200/50 bg-zinc-50/80 focus-visible:ring-1 focus-visible:bg-white text-sm px-4 h-10"
                      type="number"
                      placeholder="0"
                      min={0}
                      {...register("bedrooms", { 
                        min: { value: 0, message: "Cannot be negative" },
                        setValueAs: (v) => v === "" ? undefined : Number(v) 
                      })}
                    />
                    {errors.bedrooms && <span className="text-[10px] text-red-500 font-semibold">{errors.bedrooms.message}</span>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700">Bathrooms</label>
                    <Input
                      className="rounded-full border-zinc-200/50 bg-zinc-50/80 focus-visible:ring-1 focus-visible:bg-white text-sm px-4 h-10"
                      type="number"
                      placeholder="0"
                      min={0}
                      {...register("bathrooms", { 
                        min: { value: 0, message: "Cannot be negative" },
                        setValueAs: (v) => v === "" ? undefined : Number(v) 
                      })}
                    />
                    {errors.bathrooms && <span className="text-[10px] text-red-500 font-semibold">{errors.bathrooms.message}</span>}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 p-6 border-t border-zinc-100 bg-white/90 backdrop-blur-md">
              {!isAdding && selectedProperty && (
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
                        This will permanently delete the property "{selectedProperty.name}" from your portfolio. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-full font-bold text-xs">Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => onDelete(selectedProperty)}
                        className="rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm"
                      >
                        Delete Property
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              <button 
                className={`flex items-center justify-center gap-2 px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs rounded-full shadow-sm transition-all disabled:opacity-50 ${!isAdding && selectedProperty ? 'flex-1' : 'w-full'}`} 
                type="submit" 
                disabled={isSubmitting}
              >
                <Save className="w-4 h-4" />
                {isAdding ? "Save Property" : "Update Property"}
              </button>
            </div>
          </form>
        </DrawerDialog>
      )}
    </div>
    </div>
  );
}
