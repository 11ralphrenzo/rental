import NoData from "@/components/custom/no-data";
import { cn } from "@/lib/utils";
import { Bill } from "@/models/bill";
import React from "react";
import CustomBill from "./custom-bill";
import LoadingView from "@/components/custom/loading-view";
import { Receipt } from "lucide-react";

type RenterBillsProps = {
  className?: string;
  bills?: Bill[];
};

function RenterBills({ className, bills }: RenterBillsProps) {
  return (
    <section className={cn("w-full flex flex-col space-y-6", className)}>
      <div className="flex flex-col space-y-1 px-1">
        <h2 className="text-xl font-bold tracking-tight">🧾 Payment History</h2>
        <p className="text-sm text-muted-foreground">
          Review your upcoming and previously settled charges.
        </p>
      </div>

      <LoadingView isLoading={bills === undefined}>
        <div className="flex flex-col space-y-3">
          {bills && bills.length > 0 ? (
            bills.map((bill) => <CustomBill key={bill.id} bill={bill} />)
          ) : (
            <NoData
              icon={Receipt}
              title="No bills yet"
              description="Your payment history will appear here once your landlord adds bills."
            />
          )}
        </div>
      </LoadingView>
    </section>
  );
}

export default RenterBills;
