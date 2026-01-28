import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Bill } from "@/models/bill";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

type CustomBillProps = {
  bill: Bill;
};
function CustomBill({ bill }: CustomBillProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible
      className="flex flex-col py-3 px-4 bg-border/30 border border-border/40 rounded-sm "
      key={bill.id}
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <div className="flex items-center">
        <div className="flex-1 flex flex-col space-y-0">
          <span className="ftext-sm font-semibold">
            {formatDate(bill.month, "MMM").toUpperCase()}
          </span>
          <span className="text-xs font-light">
            {formatDate(bill.month, "yyyy")}
          </span>
        </div>
        <span className="text-sm font-medium">
          {formatCurrency(bill.total)}
        </span>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="icon">
            {isOpen ? <ChevronUp /> : <ChevronDown />}
            <span className="sr-only">Toggle details</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="grid grid-cols-4 pt-2 gap-2">
        <Separator className="col-span-full" />
        <div className="col-span-2 grid text-xs grid-cols-2 px-2 py-2 border border-border/80 rounded-sm gap-1">
          <span className="font-semibold col-span-2">Electricity</span>
          <span className="">Current:</span>
          <span className="text-end">{bill.curr_electricity}</span>
          <span className="">Previous:</span>
          <span className="text-end">{bill.prev_electricity}</span>
          <Separator className="col-span-2" />
          <span className="">Consumed:</span>
          <span className="text-end">
            {Number(bill.curr_electricity - bill.prev_electricity).toFixed(2)}
          </span>
          <span className="">Rate:</span>
          <span className="text-end">
            {formatCurrency(bill.rate_electricity)}
          </span>
          <Separator className="col-span-2" />
          <span className="">Total:</span>
          <span className="text-end font-semibold">
            {formatCurrency(bill.total_electricity)}
          </span>
        </div>
        <div className="col-span-2 grid text-xs grid-cols-2 px-2 py-2 border border-border/80 rounded-sm gap-1">
          <span className="font-semibold col-span-2">Water</span>
          <span className="">Current:</span>
          <span className="text-end">{bill.curr_water}</span>
          <span className="">Previous:</span>
          <span className="text-end">{bill.prev_water}</span>
          <Separator className="col-span-2" />
          <span className="">Consumed:</span>
          <span className="text-end">
            {Number(bill.curr_water - bill.prev_water).toFixed(2)}
          </span>
          <span className="">Rate:</span>
          <span className="text-end">{formatCurrency(bill.rate_water)}</span>
          <Separator className="col-span-2" />
          <span className="">Total:</span>
          <span className="text-end font-semibold">
            {formatCurrency(bill.total_water)}
          </span>
        </div>
        <div className="col-span-full grid text-xs grid-cols-2 px-2 py-2 border border-border/80 rounded-sm gap-1">
          <span className="font-semibold col-span-2">Summary</span>
          <span className="">Rent:</span>
          <span className="text-end">{formatCurrency(bill.rent)}</span>
          <span className="">Electricity:</span>
          <span className="text-end">
            {formatCurrency(bill.total_electricity)}
          </span>
          <span className="">Water:</span>
          <span className="text-end">{formatCurrency(bill.total_water)}</span>
          <span className="">Other:</span>
          <span className="text-end">{formatCurrency(bill.total_water)}</span>
          <Separator className="col-span-2" />
          <span className="">Total:</span>
          <span className="text-end font-semibold">
            {formatCurrency(bill.total)}
          </span>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default CustomBill;
