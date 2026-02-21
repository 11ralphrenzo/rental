import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { Bill } from "@/models/bill";
import { ChevronDown, ChevronUp, Droplets, Zap, Receipt } from "lucide-react";
import { useState } from "react";

type CustomBillProps = {
  bill: Bill;
};
function CustomBill({ bill }: CustomBillProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible
      className={cn(
        "flex flex-col rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-200",
        isOpen ? "ring-1 ring-primary/20 shadow-md" : "hover:shadow-md hover:border-border/80"
      )}
      key={bill.id}
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <div className="flex items-center px-5 py-4 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        {/* Left Side: Month Badge */}
        <div className="flex items-center gap-4 flex-1">
          <div className="flex flex-col items-center justify-center bg-primary/10 text-primary rounded-lg px-3 py-1.5 min-w-[3.5rem]">
            <span className="text-sm font-bold leading-none">
              {formatDate(bill.month, "MMM").toUpperCase()}
            </span>
            <span className="text-[10px] font-medium mt-1 opacity-80">
              {formatDate(bill.month, "yyyy")}
            </span>
          </div>

          {/* Center: Total Overview */}
          <div className="flex flex-col">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Total Due
            </span>
            <span className={cn(
              "text-lg font-bold tabular-nums tracking-tight",
              isOpen ? "text-primary" : "text-foreground"
            )}>
              {formatCurrency(bill.total)}
            </span>
          </div>
        </div>

        {/* Right Side: Caret */}
        <div className="flex items-center pl-4 bg-transparent border-none">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground pointer-events-none rounded-full">
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            <span className="sr-only">Toggle details</span>
          </Button>
        </div>
      </div>
      <CollapsibleContent className="px-5 pb-5 pt-1 animate-in slide-in-from-top-2 fade-in-50 duration-200">
        <Separator className="mb-4 opacity-50" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Electricity Block */}
          <div className="flex flex-col rounded-xl bg-muted/40 p-3 text-sm border shadow-sm">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/50">
              <div className="p-1 rounded-md bg-amber-500/10 text-amber-500">
                <Zap className="h-4 w-4" />
              </div>
              <span className="font-semibold text-foreground">Electricity</span>
            </div>
            <div className="grid grid-cols-2 gap-y-1.5 text-xs">
              <span className="text-muted-foreground">Current Read:</span>
              <span className="text-right font-medium">{bill.curr_electricity}</span>
              <span className="text-muted-foreground">Previous Read:</span>
              <span className="text-right font-medium">{bill.prev_electricity}</span>
              <span className="text-muted-foreground">Consumed:</span>
              <span className="text-right font-medium">
                {Number(bill.curr_electricity - bill.prev_electricity).toFixed(2)}
              </span>
              <span className="text-muted-foreground">Rate:</span>
              <span className="text-right font-medium">{formatCurrency(bill.rate_electricity)}</span>
            </div>
            <div className="mt-auto pt-2 mt-2 border-t border-border/50 flex justify-between items-center h-7">
              <span className="text-xs font-semibold text-muted-foreground">Total:</span>
              <span className="text-sm font-bold">{formatCurrency(bill.total_electricity)}</span>
            </div>
          </div>

          {/* Water Block */}
          <div className="flex flex-col rounded-xl bg-muted/40 p-3 text-sm border shadow-sm">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/50">
              <div className="p-1 rounded-md bg-blue-500/10 text-blue-500">
                <Droplets className="h-4 w-4" />
              </div>
              <span className="font-semibold text-foreground">Water</span>
            </div>
            <div className="grid grid-cols-2 gap-y-1.5 text-xs">
              <span className="text-muted-foreground">Current Read:</span>
              <span className="text-right font-medium">{bill.curr_water}</span>
              <span className="text-muted-foreground">Previous Read:</span>
              <span className="text-right font-medium">{bill.prev_water}</span>
              <span className="text-muted-foreground">Consumed:</span>
              <span className="text-right font-medium">
                {Number(bill.curr_water - bill.prev_water).toFixed(2)}
              </span>
              <span className="text-muted-foreground">Rate:</span>
              <span className="text-right font-medium">{formatCurrency(bill.rate_water)}</span>
            </div>
            <div className="mt-auto pt-2 mt-2 border-t border-border/50 flex justify-between items-center h-7">
              <span className="text-xs font-semibold text-muted-foreground">Total:</span>
              <span className="text-sm font-bold">{formatCurrency(bill.total_water)}</span>
            </div>
          </div>

          {/* Summary Block */}
          <div className="col-span-1 md:col-span-2 flex flex-col rounded-xl bg-primary/5 p-4 text-sm border border-primary/15 shadow-sm">
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-primary/10">
              <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                <Receipt className="h-4 w-4" />
              </div>
              <span className="font-semibold text-primary">Summary Breakdown</span>
            </div>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <span className="text-muted-foreground">Base Rent:</span>
              <span className="text-right font-medium">{formatCurrency(bill.rent)}</span>

              <span className="text-muted-foreground">Electricity:</span>
              <span className="text-right font-medium">{formatCurrency(bill.total_electricity)}</span>

              <span className="text-muted-foreground">Water:</span>
              <span className="text-right font-medium">{formatCurrency(bill.total_water)}</span>

              <span className="text-muted-foreground">Other Charges:</span>
              <span className="text-right font-medium">{formatCurrency(bill.others)}</span>
            </div>
            <div className="mt-3 pt-3 border-t border-primary/20 flex justify-between items-center">
              <span className="text-sm font-bold text-foreground">Total Amount</span>
              <span className="text-lg font-black text-primary tabular-nums tracking-tight">
                {formatCurrency(bill.total)}
              </span>
            </div>
          </div>

        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default CustomBill;
