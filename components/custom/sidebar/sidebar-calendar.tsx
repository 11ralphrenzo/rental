import { Calendar } from "@/components/ui/calendar";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Renter } from "@/models/renter";
import { useEffect, useState, useMemo } from "react";
import { GetAllRenters } from "@/services/renter-service";
import { Clock, CalendarClock, AlertCircle, Receipt } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import NoData from "@/components/custom/no-data";

export function SideBarCalendar() {
  const { user } = useAuth();
  const isRenter = !!user?.propertyId;

  const [renters, setRenters] = useState<Renter[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch renters data
  useEffect(() => {
    async function fetchRenters() {
      try {
        const response = await GetAllRenters();
        if (response?.data) {
          setRenters(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch renters for calendar", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRenters();
  }, []);

  // Compute billing dates and remaining days
  const { closestBilling } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const calcList: { renter: Renter; days: number; date: Date }[] = [];

    // Filter renters if the user is a renter (only show their own property/renter info)
    const activeRenters = isRenter
      ? renters.filter((r) => r.propertyId === user.propertyId && r.active !== false)
      : renters.filter((r) => r.active !== false);

    activeRenters.forEach((renter) => {
      if (typeof renter.billing_day === "number") {
        let nextBillingDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          renter.billing_day,
        );

        if (nextBillingDate < today) {
          nextBillingDate = new Date(
            today.getFullYear(),
            today.getMonth() + 1,
            renter.billing_day,
          );
        }

        const diffTime = nextBillingDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        calcList.push({ renter, days: diffDays, date: nextBillingDate });
      }
    });

    calcList.sort((a, b) => a.days - b.days);

    return {
      closestBilling: calcList.length > 0 ? calcList[0] : null,
    };
  }, [renters, isRenter, user?.propertyId]);

  return (
    <SidebarGroup className="px-3 pt-3 pb-4">
      {!loading &&
        (closestBilling ? (
          <div className="bg-white/70 backdrop-blur-2xl border border-white/80 rounded-[20px] p-3 shadow-sm hover:shadow-md transition-all flex items-center gap-3 w-full relative overflow-hidden group">
            
            {/* Subtle Background Glow */}
            <div className={cn(
              "absolute -right-4 -top-4 w-16 h-16 rounded-full blur-2xl opacity-20 transition-all",
              closestBilling.days <= 3 ? "bg-red-500" : "bg-emerald-500"
            )} />

            {/* Icon */}
            <div className={cn(
              "p-2 rounded-full shrink-0 z-10",
              closestBilling.days <= 3 ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-600"
            )}>
              {closestBilling.days <= 3 ? (
                <AlertCircle size={18} strokeWidth={2.5} />
              ) : (
                <CalendarClock size={18} strokeWidth={2.5} />
              )}
            </div>

            {/* Details (Name & Date) */}
            <div className="flex-1 min-w-0 z-10">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">
                Next Invoice
              </p>
              <p className="text-xs text-zinc-700 font-semibold truncate">
                {!isRenter && <span className="text-zinc-400 font-medium">{closestBilling.renter.name || "Renter"} • </span>}
                {closestBilling.date.toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>

            {/* Days Left */}
            <div className="flex flex-col items-center justify-center pr-1 shrink-0 z-10">
              <span
                className={cn(
                  "text-2xl font-black tabular-nums leading-none tracking-tighter",
                  closestBilling.days <= 3
                    ? "text-red-500"
                    : "text-zinc-800"
                )}
              >
                {closestBilling.days}
              </span>
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">
                {closestBilling.days === 1 ? "Day" : "Days"}
              </span>
            </div>
          </div>
        ) : (
          <NoData
            icon={Receipt}
            title="No billing schedule"
            description="Your next invoice date will appear once set up."
            className="py-8 px-4 bg-white/50 backdrop-blur-xl border border-white/60 rounded-[24px]"
          />
        ))}
    </SidebarGroup>
  );
}
