import { Inbox } from "lucide-react";
import React from "react";

function NoData() {
  return (
    <div className="flex flex-col h-full w-full items-center justify-center space-y-2">
      <Inbox className="w-10 h-10 text-card-foreground" />
      <span className="text-sm">No data found</span>
    </div>
  );
}

export default NoData;
