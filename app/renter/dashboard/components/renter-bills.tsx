import NoData from "@/components/custom/no-data";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Bill } from "@/models/bill";
import React from "react";
import CustomBill from "./custom-bill";
import LoadingView from "@/components/custom/loading-view";

type RenterBillsProps = {
  className?: string;
  bills?: Bill[];
};

function RenterBills({ className, bills }: RenterBillsProps) {
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="space-y-0 gap-0">
        <span className="text-lg font-semibold">🧾 Bills</span>
        <span className="text-sm text-muted-foreground">
          Upcoming & Past Charges
        </span>
      </CardHeader>
      <CardContent>
        <LoadingView isLoading={bills === undefined}>
          <div className="flex flex-col space-y-2">
            {bills && bills.length > 0 ? (
              bills.map((bill) => <CustomBill key={bill.id} bill={bill} />)
            ) : (
              <NoData />
            )}
          </div>
        </LoadingView>
      </CardContent>
    </Card>
  );
}

export default RenterBills;
