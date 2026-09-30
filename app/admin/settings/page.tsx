"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { auth } from "@/lib/firebaseClient";
import { updateProfile } from "firebase/auth";
import {
  Save, User, AlertCircle, Plus, Trash2, CreditCard,
  Upload, X, QrCode, ChevronDown, ChevronUp, Loader2,
} from "lucide-react";
import { PaymentChannel } from "@/models/admin";
import jsQR from "jsqr";
import QRCode from "react-qr-code";

// ─── CHANNEL PRESETS ──────────────────────────────────────────────────────────
const CHANNEL_PRESETS = [
  { label: "GCash",      color: "#0066FF", bg: "#EFF6FF" },
  { label: "Maya",       color: "#00B14F", bg: "#ECFDF5" },
  { label: "BPI",        color: "#B91C1C", bg: "#FEF2F2" },
  { label: "BDO",        color: "#1D4ED8", bg: "#EFF6FF" },
  { label: "UnionBank",  color: "#7C3AED", bg: "#F5F3FF" },
  { label: "Metrobank",  color: "#B45309", bg: "#FFFBEB" },
  { label: "Maribank",   color: "#EA580C", bg: "#FFF7ED" },
  { label: "GoTyme",     color: "#0284C7", bg: "#F0F9FF" },
  { label: "Other",      color: "#52525B", bg: "#F4F4F5" },
];

function getPreset(channel: string) {
  return CHANNEL_PRESETS.find(p => p.label === channel) ?? CHANNEL_PRESETS[CHANNEL_PRESETS.length - 1];
}

// ─── ZOD SCHEMA ───────────────────────────────────────────────────────────────
const paymentChannelSchema = z.object({
  id: z.string(),
  channel: z.string().min(1, "Select a channel"),
  account_number: z.string().min(1, "Account number is required"),
  account_name: z.string().optional(),
  qr_data: z.string().optional(),
  instructions: z.string().optional(),
});

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name is too long"),
  messenger: z.string().optional(),
  viber: z.string().optional(),
  payment_channels: z.array(paymentChannelSchema),
  allow_requests: z.boolean(),
});

type FormValues = z.infer<typeof profileSchema>;

// ─── QR SCANNER BUTTON ─────────────────────────────────────────────────────────
function QrScanner({
  current,
  onScanned,
  onRemoved,
}: {
  current?: string;
  onScanned: (data: string) => void;
  onRemoved: () => void;
}) {
  const [scanning, setScanning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setScanning(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code) {
             onScanned(code.data);
             toast.success("QR code decoded successfully");
          } else {
             toast.error("Could not find a valid QR code in the image");
          }
        }
        setScanning(false);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  if (current) {
    return (
      <div className="flex items-center gap-3">
        <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-zinc-200 bg-zinc-50 shrink-0 flex items-center justify-center p-2">
          <QRCode value={current} size={48} style={{ width: "100%", height: "100%" }} />
        </div>
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            <Upload className="w-3 h-3" /> Replace
          </button>
          <button
            type="button"
            onClick={onRemoved}
            className="flex items-center gap-1.5 text-[11px] font-bold text-red-500 hover:text-red-600 transition-colors"
          >
            <X className="w-3 h-3" /> Remove
          </button>
        </div>
        <input ref={inputRef} type="file" accept="image/*" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }} />
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={scanning}
      onClick={() => inputRef.current?.click()}
      className="flex items-center gap-2 h-10 px-4 rounded-xl border border-dashed border-zinc-300 bg-zinc-50/50 hover:bg-zinc-100 text-zinc-500 hover:text-zinc-700 text-xs font-semibold transition-all disabled:opacity-50"
    >
      {scanning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <QrCode className="w-3.5 h-3.5" />}
      {scanning ? "Scanning..." : "Upload QR Image (optional)"}
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }} />
    </button>
  );
}

// ─── CHANNEL CARD ─────────────────────────────────────────────────────────────
function ChannelCard({
  index,
  adminId,
  register,
  watch,
  setValue,
  errors,
  onRemove,
}: {
  index: number;
  adminId: string;
  register: any;
  watch: any;
  setValue: any;
  errors: any;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const channel = watch(`payment_channels.${index}.channel`);
  const qrData = watch(`payment_channels.${index}.qr_data`);
  const preset = getPreset(channel || "Other");

  return (
    <div className="bg-zinc-50/60 border border-zinc-100 rounded-[20px] overflow-hidden">
      {/* Card Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          className="flex items-center gap-2.5 flex-1 text-left"
        >
          <span
            className="w-7 h-7 rounded-xl flex items-center justify-center text-[10px] font-black shrink-0"
            style={{ background: preset.bg, color: preset.color }}
          >
            {(channel || "?").charAt(0)}
          </span>
          <span className="text-sm font-bold text-zinc-800">
            {channel || "New Channel"}
          </span>
          {expanded
            ? <ChevronUp className="w-3.5 h-3.5 text-zinc-400 ml-auto" />
            : <ChevronDown className="w-3.5 h-3.5 text-zinc-400 ml-auto" />}
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="ml-3 w-7 h-7 rounded-full hover:bg-red-50 flex items-center justify-center text-zinc-400 hover:text-red-500 transition-colors shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-zinc-100 pt-3">
          {/* Channel Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-600 ml-1">Channel</label>
            <div className="flex flex-wrap gap-1.5">
              {CHANNEL_PRESETS.map(p => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setValue(`payment_channels.${index}.channel`, p.label)}
                  className="px-3 py-1 rounded-full text-[11px] font-bold border transition-all"
                  style={channel === p.label
                    ? { background: p.bg, color: p.color, borderColor: p.color + "40" }
                    : { background: "white", color: "#71717A", borderColor: "#E4E4E7" }
                  }
                >
                  {p.label}
                </button>
              ))}
            </div>
            {errors?.payment_channels?.[index]?.channel && (
              <p className="text-[10px] text-red-500 font-bold pl-1 flex items-center gap-1">
                <AlertCircle className="w-2.5 h-2.5" />
                {errors.payment_channels[index].channel.message}
              </p>
            )}
          </div>

          {/* Account Number */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-600 ml-1">
              Account Number <span className="text-red-400">*</span>
            </label>
            <Input
              className="h-11 px-4 rounded-xl bg-white border border-zinc-200/70 focus-visible:ring-4 focus-visible:ring-indigo-500/10 focus-visible:border-indigo-500 transition-all font-medium text-sm placeholder:text-zinc-400"
              placeholder="e.g. 09123456789"
              {...register(`payment_channels.${index}.account_number`)}
            />
            {errors?.payment_channels?.[index]?.account_number && (
              <p className="text-[10px] text-red-500 font-bold pl-1 flex items-center gap-1">
                <AlertCircle className="w-2.5 h-2.5" />
                {errors.payment_channels[index].account_number.message}
              </p>
            )}
          </div>

          {/* Account Name (optional) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-600 ml-1">
              Account Name <span className="text-zinc-400 font-normal">(optional)</span>
            </label>
            <Input
              className="h-11 px-4 rounded-xl bg-white border border-zinc-200/70 focus-visible:ring-4 focus-visible:ring-indigo-500/10 focus-visible:border-indigo-500 transition-all font-medium text-sm placeholder:text-zinc-400"
              placeholder="e.g. Juan Dela Cruz"
              {...register(`payment_channels.${index}.account_name`)}
            />
          </div>

          {/* Instructions (optional) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-600 ml-1">
              Instructions <span className="text-zinc-400 font-normal">(optional)</span>
            </label>
            <Input
              className="h-11 px-4 rounded-xl bg-white border border-zinc-200/70 focus-visible:ring-4 focus-visible:ring-indigo-500/10 focus-visible:border-indigo-500 transition-all font-medium text-sm placeholder:text-zinc-400"
              placeholder="e.g. Include unit # in remarks"
              {...register(`payment_channels.${index}.instructions`)}
            />
          </div>

          {/* QR Code (optional) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-600 ml-1">
              QR Code <span className="text-zinc-400 font-normal">(optional)</span>
            </label>
            <QrScanner
              current={qrData}
              onScanned={(data) => setValue(`payment_channels.${index}.qr_data`, data)}
              onRemoved={() => setValue(`payment_channels.${index}.qr_data`, "")}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SETTINGS PAGE ────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { user, login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
    control,
  } = useForm<FormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      messenger: "",
      viber: "",
      payment_channels: [],
      allow_requests: true,
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "payment_channels" });

  useEffect(() => {
    if (user) {
      fetch("/api/admin/profile", {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      })
        .then(res => res.json())
        .then(data => {
          reset({
            name: user.name,
            messenger: data.messenger || "",
            viber: data.viber || "",
            payment_channels: data.payment_channels || [],
            allow_requests: data.allow_requests ?? true,
          });
        })
        .catch(console.error);
    }
  }, [user, reset]);

  const onSubmit = async (data: FormValues) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("No user logged in.");

      await updateProfile(currentUser, { displayName: data.name });

      await fetch("/api/admin/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.accessToken}`,
        },
        body: JSON.stringify({
          messenger: data.messenger,
          viber: data.viber,
          payment_channels: data.payment_channels,
          allow_requests: data.allow_requests,
        }),
      });

      if (user) login(user.accessToken, { ...user, name: data.name });
      toast.success("Settings saved successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to save settings");
    }
  };

  const addChannel = () => {
    append({
      id: crypto.randomUUID(),
      channel: "GCash",
      account_number: "",
      account_name: "",
      qr_data: "",
      instructions: "",
    } as PaymentChannel);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight text-zinc-900">Settings</h1>
        <p className="text-sm font-medium text-zinc-500">Manage your account preferences.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[13px] font-bold text-zinc-700 ml-1">Full Name</label>
              <Input
                className="h-14 px-5 rounded-2xl bg-zinc-50/50 border border-zinc-200/50 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-indigo-500/10 focus-visible:border-indigo-500 transition-all font-medium placeholder:text-zinc-400"
                placeholder="Enter your name"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-[11px] text-red-500 font-bold pl-2 flex items-center gap-1 mt-1.5">
                  <AlertCircle className="w-3 h-3" />{errors.name.message}
                </p>
              )}
            </div>
          </div>

          <div className="h-px w-full bg-zinc-100 my-6" />

          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-bold text-zinc-900">Social Contacts</h3>
              <p className="text-xs font-medium text-zinc-500 mt-0.5">These links will be available to your renters in their portal.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 relative group">
                <label className="text-[12px] font-bold text-zinc-700 ml-1 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-[#0084FF]/10 flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-[#0084FF]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.477 2 2 6.14 2 11.25c0 2.91 1.488 5.495 3.792 7.152.122.088.2.228.21.378l.18 2.684a.434.434 0 00.672.316l2.918-1.925a.438.438 0 01.353-.06c1.17.333 2.454.515 3.875.515 5.523 0 10-4.14 10-9.25S17.523 2 12 2zm1.09 12.63l-2.42-2.59-4.73 2.59 5.2-5.5 2.5 2.59 4.65-2.59-5.2 5.5z"/>
                    </svg>
                  </span>
                  Messenger
                </label>
                <Input
                  className="h-14 pl-5 pr-5 rounded-2xl bg-zinc-50/50 border border-zinc-200/50 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-[#0084FF]/10 focus-visible:border-[#0084FF] transition-all font-medium placeholder:text-zinc-400"
                  placeholder="m.me/username"
                  {...register("messenger")}
                />
              </div>
              <div className="space-y-1.5 relative group">
                <label className="text-[12px] font-bold text-zinc-700 ml-1 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-[#7360F2]/10 flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-[#7360F2]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M21.05 15.68c-.62-.16-1.91-.48-2.61-.59-.28-.05-.58.05-.75.25l-1.35 1.55c-2.48-1.2-4.47-3.09-5.75-5.5l1.64-1.25c.22-.16.32-.47.28-.75-.09-.69-.4-1.95-.55-2.56-.16-.62-.51-.62-1.01-.62-1.27.02-2.31.25-2.73 1.1-.38.77-.38 1.94 1.34 4.8 1.83 3.01 4.28 5.17 7.04 5.75 1.05.21 2.05-.1 2.7-.6.63-.48.72-1.56.74-2.85 0-.5-.03-.84-.66-1.02z" />
                    </svg>
                  </span>
                  Viber
                </label>
                <Input
                  className="h-14 pl-5 pr-5 rounded-2xl bg-zinc-50/50 border border-zinc-200/50 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-[#7360F2]/10 focus-visible:border-[#7360F2] transition-all font-medium placeholder:text-zinc-400"
                  placeholder="+639123456789"
                  {...register("viber")}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Payment Channels Card */}
        <div className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] border border-zinc-100 transition-all hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-zinc-900 tracking-tight">Payment Channels</h2>
                <p className="text-xs font-medium text-zinc-500">Renters see these when they tap "How to Pay"</p>
              </div>
            </div>
            <button
              type="button"
              onClick={addChannel}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[12px] font-bold transition-colors border border-emerald-100"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>

          {fields.length === 0 ? (
            <div className="border-2 border-dashed border-zinc-100 rounded-[20px] py-10 flex flex-col items-center gap-3 text-center">
              <div className="w-10 h-10 rounded-2xl bg-zinc-100 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-zinc-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-500">No payment channels yet</p>
                <p className="text-xs text-zinc-400 mt-0.5">Add at least one so renters know where to send payment.</p>
              </div>
              <button
                type="button"
                onClick={addChannel}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition-colors mt-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Channel
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {fields.map((field, index) => (
                <ChannelCard
                  key={field.id}
                  index={index}
                  adminId={user?.id || "unknown"}
                  register={register}
                  watch={watch}
                  setValue={setValue}
                  errors={errors}
                  onRemove={() => remove(index)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Renter Permissions Card */}
        <div className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] border border-zinc-100 flex flex-col transition-all hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)]">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 tracking-tight">Renter Permissions</h2>
              <p className="text-xs font-medium text-zinc-500">Manage what renters can do</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
            <div>
              <p className="text-sm font-bold text-zinc-900">Allow Renter Requests</p>
              <p className="text-xs text-zinc-500 mt-0.5">Let renters send maintenance, inquiry, and payment requests from their portal.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-4">
              <input type="checkbox" className="sr-only peer" {...register("allow_requests")} />
              <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 transition-colors"></div>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-14 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-sm shadow-[0_8px_20px_-4px_rgba(0,0,0,0.1)] transition-all flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          {isSubmitting ? "Saving changes..." : "Save Changes"}
        </Button>
      </form>
    </div>
  );
}
