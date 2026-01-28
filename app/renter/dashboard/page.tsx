"use client";

import RenterBills from "./components/renter-bills";
import { GetRenterBills } from "@/services/renter/bills-service";
import { handleAxiosError } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Bill } from "@/models/bill";

function Dashboard() {
  const [bills, setBills] = useState<Bill[] | undefined>(undefined);
  useEffect(() => {
    const getBills = async () => {
      try {
        const response = await GetRenterBills();
        if (response.statusText === "OK") {
          setBills(response.data);
        }
      } catch (error) {
        handleAxiosError(error, "Failed to load bills.");
      }
    };

    getBills();
  }, []);

  return (
    <div className="grid grid-cols-3 grid-rows-3 h-full ">
      <RenterBills bills={bills} className="grid-cols-1 row-span-3" />
    </div>
  );
}

export default Dashboard;
