"use client";

import RenterBills from "./components/renter-bills";
import { GetRenterBills } from "@/services/renter/bills-service";
import { handleAxiosError } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Bill } from "@/models/bill";
import UsageChart from "./components/usage-chart";

function Dashboard() {
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
    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2  w-full overflow-hidden">
      <RenterBills bills={bills} className="sm:col-span-2 row-span-2" />
      <UsageChart type="electricity" bills={bills} className="sm:col-span-3" />
      <UsageChart type="water" bills={bills} className="sm:col-span-3" />
    </div>
  );
}

export default Dashboard;
