import { Calendar } from "@/components/ui/calendar";
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarSeparator } from "@/components/ui/sidebar";
import { House } from "@/models/house";
import { useEffect, useState, useMemo } from "react";
import { GetAllHouses } from "@/services/house-service";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function SideBarCalendar() {
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch houses data
  useEffect(() => {
    async function fetchHouses() {
      try {
        const response = await GetAllHouses();
        if (response?.data) {
          setHouses(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch houses for calendar", error);
      } finally {
        setLoading(false);
      }
    }
    fetchHouses();
  }, []);

  // Compute billing dates and remaining days
  const { billingDates, remainingList } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const calcDates: Date[] = [];
    const calcList: { house: House; days: number; date: Date }[] = [];

    houses.forEach((house) => {
      if (typeof house.billing_day === "number") {
        // Find the next billing date
        let nextBillingDate = new Date(today.getFullYear(), today.getMonth(), house.billing_day);

        // If the billing day has already passed this month, the next one is next month
        if (nextBillingDate < today) {
          nextBillingDate = new Date(today.getFullYear(), today.getMonth() + 1, house.billing_day);
        }

        calcDates.push(nextBillingDate);

        // Calculate difference in days
        const diffTime = nextBillingDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        calcList.push({ house, days: diffDays, date: nextBillingDate });
      }
    });

    // Sort by fewest days remaining
    calcList.sort((a, b) => a.days - b.days);

    return { billingDates: calcDates, remainingList: calcList };
  }, [houses]);

  return (
    <>
      <SidebarGroup className="px-0">
        <SidebarGroupContent>
          <Calendar
            modifiers={{ billing: billingDates }}
            modifiersClassNames={{
              billing: "text-primary font-bold bg-primary/10 rounded-md",
            }}
            className="[&_[role=gridcell].bg-accent]:bg-sidebar-primary [&_[role=gridcell].bg-accent]:text-sidebar-primary-foreground [&_[role=gridcell]]:w-[33px]"
          />
        </SidebarGroupContent>
      </SidebarGroup>

      {remainingList.length > 0 && (
        <SidebarGroup>
          <SidebarGroupLabel>Upcoming Bills</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {remainingList.map(({ house, days, date }) => (
                <SidebarMenuItem key={house.id}>
                  <SidebarMenuButton className="flex items-center justify-between text-xs cursor-default hover:bg-transparent hover:text-sidebar-foreground">
                    <span className="truncate flex-1">{house.name}</span>
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
          </SidebarGroupContent>
        </SidebarGroup>
      )}
    </>
  );
}
