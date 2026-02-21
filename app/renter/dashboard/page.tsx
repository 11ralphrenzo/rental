"use client";

import RenterBills from "./components/renter-bills";
import { GetRenterBills } from "@/services/renter/bills-service";
import { handleAxiosError } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Bill } from "@/models/bill";
import UsageChart from "./components/usage-chart";
import { useAuth } from "@/context/AuthContext";

function Dashboard() {
  const { user } = useAuth();
  const [bills, setBills] = useState<Bill[] | undefined>(undefined);

  useEffect(() => {
    const getBills = async () => {
      try {
        const response = await GetRenterBills();
        if (response.data) {
          setBills(response.data);
        }
      } catch (error) {
        handleAxiosError(error, "Failed to load bills.");
      }
    };

    getBills();
  }, []);

  return (
    <div className="w-full flex flex-col space-y-8 p-4 md:p-8 overflow-hidden max-w-7xl mx-auto">

      {/* Welcome Header */}
      <div className="flex flex-col space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Welcome back{user?.name ? `, ${user.name}` : ""}
        </h1>
        <p className="text-muted-foreground text-base">
          Here is an overview of your payment history and utility usage.
        </p>
      </div>

      {/* Asymmetrical Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 w-full">

        {/* Left Column (1/3 Width on LG): Payment History */}
        <div className="lg:col-span-1 w-full order-2 lg:order-1">
          <RenterBills bills={bills} />
        </div>

        {/* Right Column (2/3 Width on LG): Usage Charts */}
        <div className="lg:col-span-2 w-full flex flex-col space-y-8 order-1 lg:order-2">
          <UsageChart type="electricity" bills={bills} />
          <UsageChart type="water" bills={bills} />
        </div>

      </div>
    </div>
  );
}

export default Dashboard;
