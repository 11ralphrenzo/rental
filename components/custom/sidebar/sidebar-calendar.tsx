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
  const { billingDates, remainingList, renterRemainingDays } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const calcDates: Date[] = [];
    const calcList: { renter: Renter; days: number; date: Date }[] = [];

    // Filter renters if the user is a renter (only show their own property/renter info)
    const activeRenters = isRenter
      ? renters.filter((r) => r.propertyId === user.propertyId)
      : renters;

    activeRenters.forEach((renter) => {
      if (typeof renter.billing_day === "number") {
        // Find the next billing date
        let nextBillingDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          renter.billing_day,
        );

        // If the billing day has already passed this month, the next one is next month
        if (nextBillingDate < today) {
          nextBillingDate = new Date(
            today.getFullYear(),
            today.getMonth() + 1,
            renter.billing_day,
          );
        }

        calcDates.push(nextBillingDate);

        // Calculate difference in days
        const diffTime = nextBillingDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        calcList.push({ renter, days: diffDays, date: nextBillingDate });
      }
    });

    // Sort by fewest days remaining
    calcList.sort((a, b) => a.days - b.days);

    const renterRemainingDays =
      isRenter && calcList.length > 0 ? calcList[0] : null;

    return {
      billingDates: calcDates,
      remainingList: calcList,
      renterRemainingDays,
    };
  }, [renters, isRenter, user?.propertyId]);

  return (
    <>
      <SidebarGroup className="px-0">
        <SidebarGroupContent>
          <Calendar
            modifiers={{ billing: billingDates }}
            modifiersClassNames={{
              billing: "text-primary font-bold bg-primary/10 rounded-md",
            }}
            className="[&_[role=gridcell].bg-accent]:bg-sidebar-primary [&_[role=gridcell].bg-accent]:text-sidebar-primary-foreground [&_[role=gridcell]]:w-[33px] pb-0"
          />
        </SidebarGroupContent>
      </SidebarGroup>

      {isRenter &&
        !loading &&
        (renterRemainingDays ? (
          <SidebarGroup className="px-4 pb-2 mt-0">
            <div
              className={cn(
                "relative overflow-hidden rounded-xl border p-3 shadow-sm flex flex-col items-center justify-center text-center transition-all",
                renterRemainingDays.days <= 3
                  ? "bg-destructive/8 border-destructive/10"
                  : "bg-primary/3 border-primary/5",
              )}
            >
              <div className="absolute top-0 right-0 p-2 opacity-10">
                {renterRemainingDays.days <= 3 ? (
                  <AlertCircle size={30} />
                ) : (
                  <CalendarClock size={30} />
                )}
              </div>

              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Next Invoice In
              </p>

              <div className="flex items-baseline gap-1 py-1">
                <span
                  className={cn(
                    "text-3xl font-black tabular-nums tracking-tighter",
                    renterRemainingDays.days <= 3
                      ? "text-destructive"
                      : "text-primary",
                  )}
                >
                  {renterRemainingDays.days}
                </span>
                <span className="text-sm font-medium text-muted-foreground lowercase">
                  {renterRemainingDays.days === 1 ? "day" : "days"}
                </span>
              </div>

              <p className="text-[10px] text-muted-foreground mt-1 font-medium">
                {renterRemainingDays.date.toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </SidebarGroup>
        ) : (
          <SidebarGroup className="px-4 py-2 mt-0 border-t border-border/50">
            <NoData
              icon={Receipt}
              title="No billing schedule"
              description="Your next invoice date will appear once set up."
              className="py-8 px-4 min-h-[120px]"
            />
          </SidebarGroup>
        ))}

      {/* ADMIN VIEW: Upcoming Bills List or empty */}
      {!isRenter && !loading && (
        <SidebarGroup>
          <SidebarGroupLabel>Upcoming Bills</SidebarGroupLabel>
          <SidebarGroupContent>
            {remainingList.length > 0 ? (
              <SidebarMenu>
                {remainingList.map(({ renter, days }) => (
                  <SidebarMenuItem key={renter.id}>
                    <SidebarMenuButton className="flex items-center justify-between text-xs cursor-default hover:bg-transparent hover:text-sidebar-foreground">
                      <span className="truncate flex-1">{renter.name}</span>
                      <Badge
                        variant={days <= 3 ? "destructive" : "secondary"}
                        className="bg-primary/10 ml-auto text-[10px] px-1.5 py-2 h-4 min-w-[50px] flex items-center justify-center gap-1"
                      >
                        <Clock className="w-2.5 h-2.5" />
                        {days === 0 ? "Today" : `${days}d`}
                      </Badge>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            ) : (
              <NoData
                icon={Receipt}
                title="No upcoming bills"
                description="Billing dates will appear when properties are configured."
                className="py-6 px-4 min-h-[120px]"
              />
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      )}
    </>
  );
}
