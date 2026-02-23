import { QrCodeIcon } from "lucide-react";
import React from "react";

function Page() {
  return (
    <div className="flex-1 flex items-center justify-center space-x-2">
      <QrCodeIcon className="text-blue-500 border border-blue-500 h-20 w-20 flex items-center justify-center rounded-xl font-semibold shadow-xs shadow-gray-800/30">
        GCash
      </QrCodeIcon>
      <div className="bg-green-600 border border-green-700 h-20 w-20 flex items-center justify-center rounded-3xl text-white font-semibold shadow-xs shadow-gray-800/30">
        Maya
      </div>
      <div className="bg-orange-500 border border-orange-600 h-20 w-20 flex items-center justify-center rounded-3xl text-white font-semibold shadow-xs shadow-gray-800/30">
        Maribank
      </div>
      <div className="bg-blue-400 border border-blue-500 h-20 w-20 flex items-center justify-center rounded-3xl text-white font-semibold shadow-xs shadow-gray-800/30">
        GoTyme
      </div>
    </div>
  );
}

export default Page;
