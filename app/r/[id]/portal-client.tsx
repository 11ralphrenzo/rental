"use client";

import { Bill } from "@/models/bill";
import { formatCurrency } from "@/lib/utils";
import {
  CheckCircle2, Clock, Home, Zap, ChevronDown, ChevronUp, AlertCircle, Receipt, CreditCard, X
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

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
                    <Clock className="w-2.5 h-2.5" /> Issued {bill.createdAt.toLocaleDateString()}
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
                      {u.prev !== undefined && u.curr !== undefined && (
                        <span className="text-[9px] bg-zinc-200/60 px-1.5 py-0.5 rounded-full text-zinc-400 font-normal">
                          {u.prev} → {u.curr} {u.unit}
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
              <Clock className="w-2.5 h-2.5" /> {bill.createdAt.toLocaleDateString()}
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
                  {u.prev !== undefined && u.curr !== undefined && (
                    <span className="text-[9px] bg-zinc-100 px-1.5 py-0.5 rounded-full text-zinc-400 font-normal">
                      {u.prev} → {u.curr} {u.unit}
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
  renterName: string;
  propertyName: string;
  billingDay?: number;
  daysUntilBilling: number | null;
  nextBillingDate: string | null;
  totalUnpaid: number;
  unpaidBills: Bill[];
  paidBills: Bill[];
};

export function RenterPortalClient({
  renterName, propertyName, billingDay,
  daysUntilBilling, nextBillingDate, totalUnpaid,
  unpaidBills, paidBills,
}: Props) {
  const unpaidParsed = unpaidBills.map(b => ({ ...b, month: new Date(b.month), createdAt: new Date(b.createdAt) }));
  const paidParsed = paidBills.map(b => ({ ...b, month: new Date(b.month), createdAt: new Date(b.createdAt) }));
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

  const handleCloseDialog = () => {
    try {
      localStorage.setItem(DIALOG_KEY, Date.now().toString());
    } catch {}
    setDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#eaebed] text-zinc-900 font-sans p-4 md:p-6 antialiased selection:bg-purple-100 selection:text-purple-700">

      {/* Pending Bills Dialog */}
      {dialogOpen && unpaidParsed.length > 0 && (
        <PendingBillsDialog
          bills={unpaidParsed as Bill[]}
          totalUnpaid={totalUnpaid}
          onClose={handleCloseDialog}
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

            {/* Countdown badge */}
            {nextDate && daysUntilBilling !== null && (
              <div className={`flex flex-col items-center justify-center px-4 py-2.5 rounded-2xl shrink-0 ${isUrgent ? "bg-red-500 shadow-[0_4px_16px_rgba(239,68,68,0.4)]" : "bg-zinc-900 shadow-[0_4px_16px_rgba(0,0,0,0.15)]"}`}>
                <span className={`text-3xl font-black tabular-nums leading-none tracking-tighter text-white`}>
                  {daysUntilBilling}
                </span>
                <span className="text-[8px] font-bold uppercase tracking-widest text-white/50 mt-0.5">
                  {daysUntilBilling === 1 ? "Day" : "Days"}
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

          {/* Next date + outstanding footer */}
          {nextDate && daysUntilBilling !== null && (
            <div className="relative z-10 flex items-center justify-between pt-3 border-t border-zinc-100">
              <p className="text-[10px] text-zinc-400 font-semibold flex items-center gap-1">
                <CreditCard className="w-3 h-3" /> Next invoice on {nextDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
              </p>
              {totalUnpaid > 0 && (
                <span className={`text-xs font-black ${isUrgent ? "text-red-600" : "text-zinc-700"}`}>{formatCurrency(totalUnpaid)} due</span>
              )}
            </div>
          )}
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
        {unpaidParsed.length === 0 && (
          <div className="bg-white/90 backdrop-blur-xl border border-white/80 rounded-[24px] p-5 shadow-sm flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />
            </div>
            <div>
              <p className="font-black text-zinc-800 text-sm">All caught up!</p>
              <p className="text-[10px] text-zinc-400 font-medium">No outstanding bills.</p>
            </div>
          </div>
        )}

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
  );
}
