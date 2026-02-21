import { LucideIcon, Inbox } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";

type NoDataProps = {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  className?: string;
};

function NoData({
  icon: Icon = Inbox,
  title = "No data yet",
  description = "Nothing to display here.",
  className,
}: NoDataProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center rounded-2xl",
        "bg-muted/30 border border-border/40 border-dashed",
        "py-12 px-6 min-h-[200px]",
        className
      )}
    >
      <div className="rounded-full bg-muted/60 p-4 mb-4 ring-1 ring-border/30">
        <Icon className="w-8 h-8 text-muted-foreground/80" strokeWidth={1.5} />
      </div>
      <h3 className="text-sm font-semibold text-foreground tracking-tight mb-1">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground max-w-[240px] leading-relaxed">
        {description}
      </p>
    </div>
  );
}

export default NoData;
