"use client";

import { useState } from "react";
import {
  MessageSquarePlus,
  X,
  Wrench,
  CreditCard,
  HelpCircle,
  AlertCircle,
  MoreHorizontal,
  Send,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { handleAxiosError } from "@/lib/utils";
import { CreateRequest } from "@/services/renter/requests-service";
import { RequestType } from "@/models/request";

// ─── Type config ──────────────────────────────────────────────────────────────
const REQUEST_TYPES: {
  value: RequestType;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  {
    value: "early_payment",
    label: "Early Payment",
    description: "I'd like to pay my bill ahead of schedule",
    icon: <CreditCard className="w-5 h-5" />,
    color: "from-emerald-500 to-teal-600",
  },
  {
    value: "maintenance",
    label: "Maintenance",
    description: "Report something that needs repair or fixing",
    icon: <Wrench className="w-5 h-5" />,
    color: "from-amber-500 to-orange-600",
  },
  {
    value: "inquiry",
    label: "Inquiry",
    description: "Ask a question about my tenancy",
    icon: <HelpCircle className="w-5 h-5" />,
    color: "from-blue-500 to-indigo-600",
  },
  {
    value: "concern",
    label: "Concern",
    description: "Raise a concern or complaint",
    icon: <AlertCircle className="w-5 h-5" />,
    color: "from-rose-500 to-pink-600",
  },
  {
    value: "other",
    label: "Other",
    description: "Something else I need assistance with",
    icon: <MoreHorizontal className="w-5 h-5" />,
    color: "from-violet-500 to-purple-600",
  },
];

type Step = "select" | "compose";

export default function RequestFAB() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("select");
  const [selectedType, setSelectedType] = useState<(typeof REQUEST_TYPES)[0] | null>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setStep("select");
    setSelectedType(null);
    setSubject("");
    setMessage("");
  };

  const handleClose = () => {
    setOpen(false);
    reset();
  };

  const handleSelectType = (type: (typeof REQUEST_TYPES)[0]) => {
    setSelectedType(type);
    setStep("compose");
  };

  const handleBack = () => {
    setStep("select");
    setSelectedType(null);
  };

  const handleSubmit = async () => {
    if (!selectedType) return;
    if (!subject.trim()) {
      toast.error("Please enter a subject.");
      return;
    }
    if (!message.trim()) {
      toast.error("Please describe your request.");
      return;
    }

    setLoading(true);
    try {
      await CreateRequest({
        type: selectedType.value,
        subject: subject.trim(),
        message: message.trim(),
      });
      toast.success("Request submitted! We'll get back to you shortly.");
      handleClose();
    } catch (error: any) {
      // Pass 429 rate limit message directly to the user
      const serverMsg = error?.response?.data?.message;
      if (serverMsg) {
        toast.error(serverMsg);
      } else {
        handleAxiosError(error, "Failed to submit request.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ── Backdrop ──────────────────────────────────────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          onClick={handleClose}
        />
      )}

      {/* ── Modal Panel ───────────────────────────────────────────────────── */}
      <div
        className={`
          fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)]
          bg-white rounded-3xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)]
          border border-zinc-100 overflow-hidden
          transition-all duration-300 ease-out origin-bottom-right
          ${open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-90 pointer-events-none"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-zinc-100">
          <div className="flex items-center gap-2.5">
            {step === "compose" && (
              <button
                onClick={handleBack}
                className="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 hover:bg-zinc-200 transition-colors"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
              </button>
            )}
            <div>
              <h2 className="text-sm font-bold text-zinc-900 leading-tight">
                {step === "select" ? "New Request" : selectedType?.label}
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                {step === "select"
                  ? "What do you need help with?"
                  : selectedType?.description}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 hover:bg-zinc-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Step 1: Type selection ──────────────────────────────────────── */}
        {step === "select" && (
          <div className="p-3 space-y-1.5">
            {REQUEST_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => handleSelectType(type)}
                className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl hover:bg-zinc-50 border border-transparent hover:border-zinc-100 transition-all group text-left"
              >
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center text-white flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform`}
                >
                  {type.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-800">{type.label}</p>
                  <p className="text-xs text-zinc-400 truncate">{type.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-500 transition-colors flex-shrink-0" />
              </button>
            ))}
          </div>
        )}

        {/* ── Step 2: Compose form ────────────────────────────────────────── */}
        {step === "compose" && selectedType && (
          <div className="p-4 space-y-3">
            {/* Subject */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={`Brief title for your ${selectedType.label.toLowerCase()}...`}
                maxLength={80}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-300 transition-all"
              />
            </div>

            {/* Message */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Details
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your request in detail..."
                maxLength={500}
                rows={4}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-300 transition-all resize-none"
              />
              <p className="text-xs text-zinc-400 text-right">{message.length}/500</p>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading || !subject.trim() || !message.trim()}
              className={`
                w-full flex items-center justify-center gap-2 py-3 rounded-2xl
                text-sm font-bold text-white transition-all
                bg-gradient-to-br ${selectedType.color}
                hover:opacity-90 active:scale-[0.98]
                disabled:opacity-50 disabled:cursor-not-allowed shadow-sm
              `}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {loading ? "Submitting..." : "Submit Request"}
            </button>

            <p className="text-xs text-zinc-400 text-center">
              We&apos;ll review your request and get back to you soon.
            </p>
          </div>
        )}
      </div>

      {/* ── FAB Trigger Button ────────────────────────────────────────────── */}
      <button
        id="renter-request-fab"
        onClick={() => setOpen((v) => !v)}
        className={`
          fixed bottom-6 right-6 z-50
          w-14 h-14 rounded-full shadow-[0_8px_30px_-4px_rgba(0,0,0,0.3)]
          flex items-center justify-center text-white
          bg-zinc-900 hover:bg-zinc-800 active:scale-95
          transition-all duration-200
          ${open ? "rotate-90" : "rotate-0"}
        `}
        aria-label="Open request panel"
      >
        {open ? (
          <X className="w-5 h-5" />
        ) : (
          <MessageSquarePlus className="w-5 h-5" />
        )}
      </button>
    </>
  );
}
