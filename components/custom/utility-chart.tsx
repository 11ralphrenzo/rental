"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts"
import { Bill } from "@/models/bill"
import { X, CalendarDays, Activity } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

function UtilityDialog({ 
  name, 
  unit, 
  color, 
  chartData, 
  onClose 
}: { 
  name: string, 
  unit: string, 
  color: string, 
  chartData: any[], 
  onClose: () => void 
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className="w-full max-w-md max-h-[90vh] flex flex-col bg-white rounded-[28px] shadow-[0_24px_64px_-8px_rgba(0,0,0,0.18)] overflow-hidden animate-in slide-in-from-bottom-4 duration-300" onClick={e => e.stopPropagation()}>
         {/* Header */}
         <div className="relative shrink-0 bg-zinc-50 border-b border-zinc-100 px-6 py-5">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border border-zinc-200/50 bg-white" style={{ color: color }}>
                <Activity className="w-5 h-5" />
             </div>
             <div>
               <h2 className="text-base font-black text-zinc-900 leading-none">{name}</h2>
               <p className="text-[11px] text-zinc-500 font-medium mt-0.5">Usage History</p>
             </div>
           </div>
           <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white border border-zinc-200/60 flex items-center justify-center text-zinc-500 hover:text-zinc-900 transition-all">
             <X className="w-3.5 h-3.5" />
           </button>
         </div>

         {/* Chart (Bigger) */}
         <div className="shrink-0 p-6 pb-2 border-b border-zinc-100">
           <div className="h-[160px] w-full">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={chartData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                 <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-zinc-100" />
                 <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "#a1a1aa", fontWeight: 600 }} />
                 <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "#a1a1aa", fontWeight: 600 }} />
                 <RechartsTooltip
                    cursor={{ stroke: "rgba(0,0,0,0.05)", strokeWidth: 2 }}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white border border-zinc-100 rounded-[10px] shadow-lg p-2.5">
                            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1">{label}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-zinc-800">
                                {payload[0].value} <span className="text-[9px] font-medium text-zinc-400">{unit}</span>
                              </span>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                 />
                 <Line type="monotone" dataKey="value" stroke={color} strokeWidth={3} dot={{ r: 4, fill: color, strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6, fill: color, strokeWidth: 2, stroke: "#fff" }} />
               </LineChart>
             </ResponsiveContainer>
           </div>
         </div>

         {/* List of readings */}
         <div className="flex-1 overflow-y-auto px-6 py-2 pb-6">
            {chartData.slice().reverse().map((d, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-zinc-50 last:border-0">
                <div>
                  <p className="text-xs font-bold text-zinc-800">{d.month}</p>
                  <p className="text-[10px] text-zinc-400 font-medium mt-0.5 flex items-center gap-1">
                    <CalendarDays className="w-3 h-3" /> {d.fullDate}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-zinc-700">{d.value} <span className="text-[9px] text-zinc-400">{unit}</span></p>
                  <p className="text-[9px] font-medium text-zinc-400 mt-0.5">
                    {d.prev} → {d.curr} {d.rate !== undefined ? `@ ${formatCurrency(d.rate)}` : ""}
                  </p>
                </div>
              </div>
            ))}
         </div>
      </div>
    </div>,
    document.body
  )
}

export function UtilityChart({ bills }: { bills: Bill[] }) {
  const [selectedUtility, setSelectedUtility] = useState<string | null>(null);
  const utilityNames = new Set<string>();
  const utilityUnits = new Map<string, string>();

  bills.forEach(bill => {
    bill.utilities?.forEach(u => {
      if (u.prev !== undefined && u.curr !== undefined) {
        utilityNames.add(u.name);
        if (u.unit) utilityUnits.set(u.name, u.unit);
      }
    });
  });
  
  const uNames = Array.from(utilityNames);
  
  // Custom colors for utilities
  const colors = [
    "#8b5cf6", // purple-500
    "#0ea5e9", // sky-500
    "#10b981", // emerald-500
    "#f59e0b", // amber-500
    "#ef4444", // red-500
  ];

  if (uNames.length === 0) {
    return null;
  }

  // Individual chart data generator (for sparklines)
  const getUtilityData = (name: string) => {
    return bills
      .filter(b => {
        const u = b.utilities?.find(u => u.name === name);
        if (!u || u.prev === undefined || u.curr === undefined) return false;
        return (u.curr - u.prev) > 0;
      })
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
      .map(bill => {
        const u = bill.utilities?.find(u => u.name === name)!;
        const dateObj = typeof bill.month === "string" ? new Date(bill.month) : bill.month;
        return {
          month: dateObj.toLocaleDateString(undefined, { month: "short", year: "2-digit" }),
          fullDate: dateObj.toLocaleDateString(undefined, { month: "long", year: "numeric" }),
          value: Number((u.curr - u.prev).toFixed(2)),
          prev: Number(u.prev.toFixed(2)),
          curr: Number(u.curr.toFixed(2)),
          rate: u.rate
        };
      });
  };

  return (
    <>
      <div className="flex overflow-x-auto gap-3 pb-1 pt-1 -mx-1 px-1 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {uNames.map((name, index) => {
          const unit = utilityUnits.get(name) || "";
          const color = colors[index % colors.length];
          const chartData = getUtilityData(name);

          if (chartData.length === 0) return null;

          return (
            <button 
              key={name} 
              onClick={() => setSelectedUtility(name)}
              className="w-[106px] shrink-0 snap-start rounded-[16px] bg-white border border-zinc-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all group text-left relative"
            >
              <div className="p-3 pb-1 z-10 w-full">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }} />
                  <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest truncate">{name}</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-base font-black tracking-tight text-zinc-800 leading-none">{chartData[chartData.length - 1].value}</span>
                  <span className="text-[8px] font-medium text-zinc-400">{unit}</span>
                </div>
              </div>
              
              <div className="w-full h-[35px] mt-1.5 opacity-60 group-hover:opacity-100 transition-opacity duration-300 relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ left: -10, right: -10, top: 2, bottom: -10 }}>
                    <Line 
                      type="monotone"
                      dataKey="value" 
                      stroke={color} 
                      strokeWidth={1.5}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-8 opacity-[0.08] group-hover:opacity-[0.12] transition-opacity pointer-events-none" style={{ background: `linear-gradient(to top, ${color}, transparent)` }} />
            </button>
          )
        })}
      </div>

      {selectedUtility && (
        <UtilityDialog 
          name={selectedUtility}
          unit={utilityUnits.get(selectedUtility) || ""}
          color={colors[uNames.indexOf(selectedUtility) % colors.length]}
          chartData={getUtilityData(selectedUtility)}
          onClose={() => setSelectedUtility(null)}
        />
      )}
    </>
  )
}

