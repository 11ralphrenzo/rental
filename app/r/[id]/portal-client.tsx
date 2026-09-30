"use client";

import { Bill } from "@/models/bill";
import { PaymentChannel } from "@/models/admin";
import { formatCurrency } from "@/lib/utils";
import {
  CheckCircle2, Clock, Home, Zap, ChevronDown, ChevronUp, AlertCircle, Receipt, X,
  Loader2, MessageCircle, Phone, Plus, CreditCard, Copy, Check, QrCode,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { UtilityChart } from "@/components/custom/utility-chart";
import { refreshRenterData } from "./actions";
import QRCode from "react-qr-code";

// ── CHANNEL PRESETS ───────────────────────────────────────────────────────────
const CHANNEL_COLORS: Record<string, { color: string; bg: string }> = {
  GCash:     { color: "#0066FF", bg: "#EFF6FF" },
  Maya:      { color: "#00B14F", bg: "#ECFDF5" },
  BPI:       { color: "#B91C1C", bg: "#FEF2F2" },
  BDO:       { color: "#1D4ED8", bg: "#EFF6FF" },
  UnionBank: { color: "#7C3AED", bg: "#F5F3FF" },
  Metrobank: { color: "#B45309", bg: "#FFFBEB" },
  Maribank:  { color: "#EA580C", bg: "#FFF7ED" },
  GoTyme:    { color: "#0284C7", bg: "#F0F9FF" },
  Other:     { color: "#52525B", bg: "#F4F4F5" },
};
function getChannelStyle(ch: string) {
  return CHANNEL_COLORS[ch] ?? CHANNEL_COLORS["Other"];
}

// ── HOW TO PAY DIALOG ────────────────────────────────────────────────────────
function HowToPayDialog({
  channels,
  onClose,
}: {
  channels: PaymentChannel[];
  onClose: () => void;
}) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);
  const [qrZoom, setQrZoom] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") { if (qrZoom) setQrZoom(null); else onClose(); } };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, qrZoom]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const active = channels[activeIdx];
  if (!active) return null;
  const style = getChannelStyle(active.channel);

  return (
    <>
      {/* QR Fullscreen Overlay */}
      {qrZoom && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6 animate-in fade-in duration-200"
          onClick={() => setQrZoom(null)}
        >
          <div className="bg-white rounded-[24px] p-5 shadow-2xl max-w-xs w-full flex flex-col items-center gap-4 animate-in zoom-in-90 duration-200">
            <QRCode value={qrZoom} size={256} style={{ width: "100%", height: "auto" }} />
            <p className="text-xs font-bold text-zinc-500">Tap anywhere to close</p>
          </div>
        </div>
      )}

      {/* Main Dialog */}
      <div
        ref={backdropRef}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
      >
        <div className="w-full max-w-md bg-white rounded-[28px] shadow-[0_24px_64px_-8px_rgba(0,0,0,0.18)] overflow-hidden animate-in slide-in-from-bottom-4 duration-300">

          {/* Header */}
          <div className="relative bg-emerald-50 border-b border-emerald-100 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-base font-black text-zinc-900 leading-none">How to Pay</h2>
                <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                  {channels.length} payment channel{channels.length !== 1 ? "s" : ""} available
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/70 border border-zinc-200/60 flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:bg-white transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Channel Tabs */}
          {channels.length > 1 && (
            <div className="flex gap-1.5 px-4 pt-4 pb-1 overflow-x-auto no-scrollbar">
              {channels.map((ch, i) => {
                const s = getChannelStyle(ch.channel);
                return (
                  <button
                    key={ch.id}
                    onClick={() => setActiveIdx(i)}
                    className="px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all shrink-0"
                    style={activeIdx === i
                      ? { background: s.bg, color: s.color, borderColor: s.color + "40" }
                      : { background: "white", color: "#71717A", borderColor: "#E4E4E7" }
                    }
                  >
                    {ch.channel}
                  </button>
                );
              })}
            </div>
          )}

          {/* Active Channel Detail */}
          <div className="px-6 py-5 space-y-4">
            {/* Channel badge */}
            <div className="flex items-center gap-2">
              <span
                className="px-3 py-1 rounded-full text-xs font-black border"
                style={{ background: style.bg, color: style.color, borderColor: style.color + "30" }}
              >
                {active.channel}
              </span>
            </div>

            {/* Compact Account Details */}
            <div className="bg-zinc-50/80 border border-zinc-200/60 rounded-[14px] overflow-hidden">
              <div className="flex items-center justify-between p-3 gap-3">
                <div className="flex flex-col min-w-0">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-0.5">{active.account_name || "Account Number"}</p>
                  <p className="text-sm font-black text-zinc-900 tabular-nums tracking-tight truncate leading-none">{active.account_number}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(active.account_number, active.id + "-num")}
                  className="px-3 py-1.5 rounded-lg bg-white border border-zinc-200 shadow-sm flex items-center gap-1.5 text-[11px] font-bold text-zinc-700 hover:text-zinc-900 hover:border-zinc-300 transition-all shrink-0 active:scale-95"
                >
                  {copied === active.id + "-num" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied === active.id + "-num" ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            {/* QR Code */}
            {active.qr_data && (
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => setQrZoom(active.qr_data!)}
                  className="relative w-36 h-36 rounded-[20px] overflow-hidden border-2 border-zinc-100 bg-white shadow-sm hover:scale-105 active:scale-95 transition-transform p-3"
                >
                  <QRCode value={active.qr_data} size={120} style={{ width: "100%", height: "100%" }} />
                  <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center">
                    <QrCode className="w-2.5 h-2.5 text-white" />
                  </div>
                </button>
                <p className="text-[10px] text-zinc-400 font-semibold">Tap to enlarge</p>
              </div>
            )}

            {/* Instructions */}
            {active.instructions && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs font-semibold text-amber-800">{active.instructions}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs rounded-full shadow-sm transition-all"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── PENDING BILLS DIALOG ─────────────────────────────────
function PendingBillsDialog({
  bills,
  totalUnpaid,
  onClose,
}: {
  bills: Bill[];
  totalUnpaid: number;
  onClose: () => void;
}) {
  // Close on backdrop click
  const backdropRef = useRef<HTMLDivElement>(null);

  // Trap escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
    >
      <div className="w-full max-w-md bg-white rounded-[28px] shadow-[0_24px_64px_-8px_rgba(0,0,0,0.18)] overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <div className="relative bg-amber-50 border-b border-amber-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-base font-black text-zinc-900 leading-none">Pending Bills</h2>
              <p className="text-[11px] text-amber-700 font-semibold mt-0.5">
                You have {bills.length} unpaid bill{bills.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/70 border border-zinc-200/60 flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:bg-white transition-all"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Bill list */}
        <div className="divide-y divide-zinc-100 max-h-[60vh] overflow-y-auto">
          {bills.map(bill => (
            <div key={bill.id} className="px-6 py-4 space-y-3">
              {/* Bill Month + Date */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-black text-zinc-800">
                    {bill.month.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
                  </p>
                  <p className="text-[10px] text-zinc-400 font-medium mt-0.5 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" /> {bill.createdAt && !isNaN(bill.createdAt.getTime()) ? `Issued ${bill.createdAt.toLocaleDateString()}` : "Imported data"}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-100 text-amber-700 text-[9px] font-black uppercase tracking-wider">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Unpaid
                </span>
              </div>

              {/* Breakdown */}
              <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-3 space-y-1.5">
                {/* Rent */}
                <div className="flex justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-zinc-500 font-medium">
                    <Home className="w-3 h-3 text-zinc-300" /> Rent
                  </span>
                  <span className="font-bold text-zinc-700">{formatCurrency(bill.rent)}</span>
                </div>

                {/* Utilities */}
                {bill.utilities?.map((u, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-zinc-500 font-medium">
                      <Zap className="w-3 h-3 text-zinc-300" /> {u.name}
                      {(u.prev !== undefined || u.rate !== undefined) && (
                        <span className="text-[9px] bg-zinc-200/60 px-1.5 py-0.5 rounded-full text-zinc-400 font-normal">
                          {u.prev !== undefined && u.curr !== undefined ? `${u.prev} → ${u.curr} ` : ""}
                          {u.rate !== undefined ? `@ ${formatCurrency(u.rate)}/${u.unit || "unit"}` : u.unit || ""}
                        </span>
                      )}
                    </span>
                    <span className="font-bold text-zinc-700">{formatCurrency(u.total)}</span>
                  </div>
                ))}

                {/* Custom Charges */}
                {bill.customCharges?.map((c, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span className="text-zinc-500 font-medium">{c.name}</span>
                    <span className="font-bold text-zinc-700">{formatCurrency(c.amount)}</span>
                  </div>
                ))}

                {/* Total */}
                <div className="flex justify-between text-xs pt-2 mt-1 border-t border-zinc-200 font-black text-amber-700">
                  <span>Total</span>
                  <span>{formatCurrency(bill.total)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer total + dismiss */}
        <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between gap-4">
          <div>
            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Total Outstanding</p>
            <p className="text-xl font-black text-zinc-900 tabular-nums">{formatCurrency(totalUnpaid)}</p>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs rounded-full shadow-sm transition-all"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

function BillRow({ bill, isUnpaid }: { bill: Bill; isUnpaid: boolean }) {
  const [open, setOpen] = useState(isUnpaid);

  return (
    <div className={`border rounded-[18px] overflow-hidden transition-all ${isUnpaid ? "border-amber-100/80 bg-white/90" : "border-zinc-100 bg-white/80"}`}>
      {/* Row Header */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-zinc-50/60 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isUnpaid ? "bg-amber-50 border border-amber-100" : "bg-emerald-50 border border-emerald-100"}`}>
            {isUnpaid
              ? <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
              : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            }
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-zinc-800 leading-none">
              {bill.month.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
            </p>
            <p className="text-[10px] text-zinc-400 font-medium mt-0.5 flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" /> {bill.createdAt && !isNaN(bill.createdAt.getTime()) ? bill.createdAt.toLocaleDateString() : "Imported data"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <span className={`text-sm font-black tabular-nums ${isUnpaid ? "text-amber-700" : "text-zinc-700"}`}>
            {formatCurrency(bill.total)}
          </span>
          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${isUnpaid ? "bg-amber-50 text-amber-700 border-amber-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"}`}>
            {isUnpaid ? "Unpaid" : "Paid"}
          </span>
          {open ? <ChevronUp className="w-3.5 h-3.5 text-zinc-400" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />}
        </div>
      </button>

      {/* Expandable Details */}
      {open && (
        <div className={`px-4 pb-4 pt-1 border-t ${isUnpaid ? "border-amber-50" : "border-zinc-100"}`}>
          <div className="space-y-1.5 mt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-zinc-500 font-medium">
                <Home className="w-3 h-3 text-zinc-300" /> Rent
              </span>
              <span className="font-bold text-zinc-700">{formatCurrency(bill.rent)}</span>
            </div>

            {bill.utilities?.map((u, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-zinc-500 font-medium">
                  <Zap className="w-3 h-3 text-zinc-300" /> {u.name}
                  {(u.prev !== undefined || u.rate !== undefined) && (
                    <span className="text-[9px] bg-zinc-100 px-1.5 py-0.5 rounded-full text-zinc-400 font-normal">
                      {u.prev !== undefined && u.curr !== undefined ? `${u.prev} → ${u.curr} ` : ""}
                      {u.rate !== undefined ? `@ ${formatCurrency(u.rate)}/${u.unit || "unit"}` : u.unit || ""}
                    </span>
                  )}
                </span>
                <span className="font-bold text-zinc-700">{formatCurrency(u.total)}</span>
              </div>
            ))}

            {bill.customCharges?.map((c, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-zinc-500 font-medium">{c.name}</span>
                <span className="font-bold text-zinc-700">{formatCurrency(c.amount)}</span>
              </div>
            ))}

            <div className={`flex items-center justify-between text-xs pt-2 mt-1 border-t font-black ${isUnpaid ? "border-amber-50 text-amber-700" : "border-zinc-100 text-zinc-800"}`}>
              <span>Total</span>
              <span>{formatCurrency(bill.total)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type Props = {
  renterId: string;
  renterName: string;
  propertyName: string;
  billingDay?: number;
  daysUntilBilling: number | null;
  nextBillingDate: string | null;
  totalUnpaid: number;
  unpaidBills: Bill[];
  paidBills: Bill[];
  messenger?: string | null;
  viber?: string | null;
  paymentChannels?: PaymentChannel[];
};

export function RenterPortalClient({
  renterId, renterName, propertyName, billingDay,
  daysUntilBilling, nextBillingDate, totalUnpaid,
  unpaidBills, paidBills, messenger, viber, paymentChannels = [],
}: Props) {
  const unpaidParsed = unpaidBills.map(b => ({ ...b, month: new Date(b.month), createdAt: b.createdAt ? new Date(b.createdAt) : null }));
  const paidParsed = paidBills.map(b => ({ ...b, month: new Date(b.month), createdAt: b.createdAt ? new Date(b.createdAt) : null }));
  const nextDate = nextBillingDate ? new Date(nextBillingDate) : null;
  const isUrgent = daysUntilBilling !== null && daysUntilBilling <= 3;

  // Only show dialog once per 24 hours per renter
  const DIALOG_KEY = `pending_dialog_shown`;
  const THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 hours

  const shouldShowDialog = () => {
    if (unpaidParsed.length === 0) return false;
    try {
      const lastShown = localStorage.getItem(DIALOG_KEY);
      if (!lastShown) return true;
      return Date.now() - parseInt(lastShown, 10) > THRESHOLD_MS;
    } catch {
      return true;
    }
  };

  const [dialogOpen, setDialogOpen] = useState(() => shouldShowDialog());
  const [fabOpen, setFabOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);

  const handleCloseDialog = () => {
    try {
      localStorage.setItem(DIALOG_KEY, Date.now().toString());
    } catch {}
    setDialogOpen(false);
  };

  const formatTimeLeft = (days: number | null) => {
    if (days === null) return "—";
    if (days === 0) return "Today";
    if (days === 1) return "1 Day";
    if (days < 7) return `${days} Days`;
    if (days < 30) {
      const weeks = Math.floor(days / 7);
      return `${weeks} Week${weeks > 1 ? "s" : ""}`;
    }
    const months = Math.floor(days / 30);
    return `${months} Month${months > 1 ? "s" : ""}`;
  };

  // Pull to refresh logic
  const [refreshing, setRefreshing] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);
  const pullDist = useRef(0);
  const startY = useRef(0);
  const isPulling = useRef(false);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY <= 0 && !refreshing) {
        startY.current = e.touches[0].clientY;
        isPulling.current = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling.current || refreshing) return;
      
      const y = e.touches[0].clientY;
      const distance = y - startY.current;

      if (distance > 0 && window.scrollY <= 0) {
        if (e.cancelable) e.preventDefault();
        pullDist.current = Math.min(distance * 0.4, 80);
        setPullProgress(pullDist.current);
      }
    };

    const handleTouchEnd = async () => {
      if (!isPulling.current) return;
      isPulling.current = false;

      if (pullDist.current >= 60 && !refreshing) {
        setRefreshing(true);
        pullDist.current = 60;
        setPullProgress(60);

        await refreshRenterData(renterId);
        
        setRefreshing(false);
        pullDist.current = 0;
        setPullProgress(0);
      } else {
        pullDist.current = 0;
        setPullProgress(0);
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [refreshing, renterId]);

  useEffect(() => {
    // Prevent white bars during overscroll on mobile
    const originalBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#eaebed";
    return () => {
      document.body.style.backgroundColor = originalBg;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#eaebed] text-zinc-900 font-sans antialiased selection:bg-purple-100 selection:text-purple-700 relative overflow-hidden">
      
      {/* Pull to refresh indicator */}
      <div 
        className="absolute top-0 left-0 right-0 flex justify-center items-end overflow-hidden transition-all duration-300 ease-out"
        style={{ 
          height: `${pullProgress}px`,
          opacity: pullProgress > 10 ? 1 : 0,
          transition: isPulling.current ? 'none' : undefined
        }}
      >
        <div className="pb-4 text-zinc-500">
          <Loader2 
            className={`w-6 h-6 ${refreshing ? "animate-spin" : ""}`} 
            style={{ transform: `rotate(${pullProgress * 5}deg)` }} 
          />
        </div>
      </div>

      <div 
        className="px-4 pb-4 pt-6 md:p-6 md:pt-8 min-h-screen transition-all duration-300 ease-out"
        style={{
          transform: `translateY(${pullProgress}px)`,
          transition: isPulling.current ? 'none' : undefined
        }}
      >
        {/* Pending Bills Dialog */}
      {dialogOpen && unpaidParsed.length > 0 && (
        <PendingBillsDialog
          bills={unpaidParsed as Bill[]}
          totalUnpaid={totalUnpaid}
          onClose={handleCloseDialog}
        />
      )}

      {/* How to Pay Dialog */}
      {paymentOpen && paymentChannels.length > 0 && (
        <HowToPayDialog
          channels={paymentChannels}
          onClose={() => setPaymentOpen(false)}
        />
      )}

      <div className="max-w-[640px] mx-auto space-y-4">
        {/* ── HERO: UNIFIED CARD ── */}
        <div className={`relative overflow-hidden rounded-[24px] p-5 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.06)] border ${isUrgent ? "bg-gradient-to-br from-white/90 to-red-50/60 border-red-100" : "bg-white/90 border-white/80"} backdrop-blur-xl`}>
          {/* Glow */}
          <div className={`absolute top-0 right-0 w-56 h-56 rounded-full blur-3xl opacity-20 pointer-events-none ${isUrgent ? "bg-red-400" : "bg-purple-400"} -translate-y-1/3 translate-x-1/3`} />

          {/* Top row: Avatar + Name / Countdown */}
          <div className="relative z-10 flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-zinc-900 flex items-center justify-center text-white text-lg font-black shadow-md shrink-0">
                {renterName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight text-zinc-900 leading-none">{renterName}</h1>
                <p className="text-[11px] text-zinc-400 font-medium mt-1 flex items-center gap-1">
                  <Home className="w-3 h-3" /> {propertyName}
                </p>
              </div>
            </div>

            {/* Next invoice date badge */}
            {daysUntilBilling !== null && (
              <div className="flex flex-col items-end justify-center">
                <span className={`text-xl sm:text-2xl font-black tabular-nums leading-none tracking-tight ${isUrgent ? "text-red-500 drop-shadow-sm" : "text-zinc-900"}`}>
                  {formatTimeLeft(daysUntilBilling)}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mt-1.5">
                  Next Invoice
                </span>
              </div>
            )}
          </div>

          {/* Stat pills row */}
          <div className="relative z-10 flex items-center justify-between bg-zinc-50/50 border border-zinc-100 rounded-[16px] py-3 px-1 mb-3">
            <div className="flex flex-col items-center flex-1">
              <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Billing Day</p>
              <p className="text-base font-black text-zinc-800 tabular-nums leading-none">{billingDay || "—"}</p>
            </div>
            
            <div className="w-px h-6 bg-zinc-200" />
            
            <div className="flex flex-col items-center flex-1">
              <p className="text-[8px] font-bold text-amber-500 uppercase tracking-widest mb-0.5">Pending</p>
              <p className="text-base font-black text-amber-600 tabular-nums leading-none">{unpaidParsed.length}</p>
            </div>
            
            <div className="w-px h-6 bg-zinc-200" />
            
            <div className="flex flex-col items-center flex-1">
              <p className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest mb-0.5">Paid</p>
              <p className="text-base font-black text-emerald-600 tabular-nums leading-none">{paidParsed.length}</p>
            </div>
          </div>
          
          {/* ── UTILITIES CHART ── */}
          <div className="relative z-10 mt-2">
            <UtilityChart bills={[...unpaidParsed, ...paidParsed] as Bill[]} />
          </div>

        </div>

        {/* ── UNPAID BILLS ── */}
        {unpaidParsed.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
              <h2 className="text-xs font-black text-zinc-700 tracking-tight uppercase">Pending Bills</h2>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[8px] font-black uppercase tracking-wider">{unpaidParsed.length}</span>
            </div>
            <div className="space-y-2">
              {unpaidParsed.map(bill => (
                <BillRow key={bill.id} bill={bill as Bill} isUnpaid={true} />
              ))}
            </div>
          </div>
        )}

        {/* ── ALL CLEAR ── */}
        {/* Intentionally hidden per user request */}

        {/* ── BILLING HISTORY ── */}
        <div className="space-y-2 pb-8">
          <div className="flex items-center gap-2 px-1">
            <Receipt className="w-3.5 h-3.5 text-zinc-400" />
            <h2 className="text-xs font-black text-zinc-700 tracking-tight uppercase">Billing History</h2>
            <span className="px-2 py-0.5 rounded-full bg-zinc-200/60 text-zinc-500 text-[8px] font-black uppercase tracking-wider">{paidParsed.length}</span>
          </div>
          <div className="space-y-2">
            {paidParsed.length > 0 ? (
              paidParsed.map(bill => (
                <BillRow key={bill.id} bill={bill as Bill} isUnpaid={false} />
              ))
            ) : (
              <div className="bg-white/80 backdrop-blur-xl border border-white/80 rounded-[20px] p-6 text-center">
                <p className="text-xs font-semibold text-zinc-400">No billing history yet.</p>
              </div>
            )}
          </div>
        </div>
        </div>
      </div>

      {/* ── FLOATING ACTION MENU ── */}
      {/* Backdrop overlay when open */}
      {fabOpen && (
        <div 
          className="fixed inset-0 bg-black/5 backdrop-blur-[2px] z-40 transition-opacity duration-300"
          onClick={() => setFabOpen(false)}
        />
      )}
      
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        <div
          className={`flex flex-col items-end gap-3 mb-4 transition-all duration-300 origin-bottom ${fabOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-90 translate-y-8 pointer-events-none"}`}
        >
          {paymentChannels.length > 0 && (
            <button
              onClick={() => { setPaymentOpen(true); setFabOpen(false); }}
              className="flex items-center gap-3 bg-white px-4 py-3 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:scale-105 active:scale-95 transition-all text-zinc-900 font-semibold text-[13px] border border-zinc-100 appearance-none outline-none"
            >
              How to Pay
              <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                <CreditCard className="w-4 h-4 text-emerald-600" />
              </div>
            </button>
          )}
          {messenger && (
            <a
              href={messenger.startsWith('http') ? messenger : `https://m.me/${messenger}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-white px-4 py-3 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:scale-105 active:scale-95 transition-all text-zinc-900 font-semibold text-[13px] border border-zinc-100 appearance-none outline-none"
            >
              Contact via Messenger
              <div className="w-8 h-8 rounded-full bg-[#0084FF]/10 flex items-center justify-center shrink-0">
                <MessageCircle className="w-4 h-4 text-[#0084FF]" />
              </div>
            </a>
          )}
          {viber && (
            <a
              href={`viber://chat?number=${viber.replace(/[^0-9+]/g, '')}`}
              className="flex items-center gap-3 bg-white px-4 py-3 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:scale-105 active:scale-95 transition-all text-zinc-900 font-semibold text-[13px] border border-zinc-100 appearance-none outline-none"
            >
              Contact via Viber
              <div className="w-8 h-8 rounded-full bg-[#7360F2]/10 flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4 text-[#7360F2]" />
              </div>
            </a>
          )}
        </div>

        {/* FAB Toggle */}
        <button
          onClick={() => setFabOpen(!fabOpen)}
          className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-[0_12px_40px_rgba(79,70,229,0.4)] transition-all duration-300 outline-none [-webkit-tap-highlight-color:transparent] hover:scale-105 active:scale-95 z-50 relative ${fabOpen ? "bg-zinc-800 rotate-45" : "bg-indigo-600 rotate-0"}`}
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
