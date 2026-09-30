"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { auth } from "@/lib/firebaseClient";
import { updateProfile } from "firebase/auth";
import { Save, User, AlertCircle } from "lucide-react";

const nameSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name is too long"),
});

export default function SettingsPage() {
  const { user, login } = useAuth();
  
  const {
    register: registerName,
    handleSubmit: handleNameSubmit,
    formState: { errors: nameErrors, isSubmitting: isNameSubmitting },
    reset: resetName,
  } = useForm<z.infer<typeof nameSchema>>({
    resolver: zodResolver(nameSchema),
    defaultValues: {
      name: user?.name || "",
    }
  });

  useEffect(() => {
    if (user) {
      resetName({ name: user.name });
    }
  }, [user, resetName]);

  const onUpdateName = async (data: z.infer<typeof nameSchema>) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("No user logged in.");

      await updateProfile(currentUser, { displayName: data.name });
      
      // Update local storage context
      if (user) {
        login(user.accessToken, { ...user, name: data.name });
      }
      
      toast.success("Name updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update name");
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight text-zinc-900">Settings</h1>
        <p className="text-sm font-medium text-zinc-500">
          Manage your account preferences.
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] border border-zinc-100 flex flex-col transition-all hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
            <User className="w-6 h-6 text-indigo-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-900 tracking-tight">Profile Information</h2>
            <p className="text-xs font-medium text-zinc-500">Update your personal details</p>
          </div>
        </div>

        <form onSubmit={handleNameSubmit(onUpdateName)} className="space-y-4 flex-1 flex flex-col">
          <div className="space-y-1.5 flex-1">
            <label className="text-[13px] font-bold text-zinc-700 ml-1">Full Name</label>
            <Input
              className="h-14 px-6 rounded-2xl bg-zinc-50/50 border-transparent focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-100 transition-all font-medium placeholder:text-zinc-400"
              placeholder="Enter your name"
              {...registerName("name")}
            />
            {nameErrors.name && (
              <p className="text-[11px] text-red-500 font-bold pl-2 flex items-center gap-1 mt-1.5">
                <AlertCircle className="w-3 h-3" />
                {nameErrors.name.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isNameSubmitting}
            className="w-full h-14 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-sm shadow-[0_8px_20px_-4px_rgba(0,0,0,0.1)] transition-all flex items-center justify-center gap-2 mt-4"
          >
            <Save className="w-4 h-4" />
            {isNameSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </div>
    </div>
  );
}
