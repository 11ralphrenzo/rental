import React from "react";
import { Spinner } from "../ui/spinner";
import { cn } from "@/lib/utils";

type LoadingViewProps = {
  className?: string;
  children?: React.ReactNode;
  isLoading: boolean;
  loadingMessage?: string | React.ReactNode;
};
function LoadingView({
  className,
  isLoading,
  children,
  loadingMessage = "Loading...",
}: LoadingViewProps) {
  if (!isLoading) return children;
  return (
    <>
      <div className={cn("h-50 flex justify-center items-center", className)}>
        <div className="flex items-center gap-4">
          <Spinner />
          {loadingMessage}
        </div>
      </div>
    </>
  );
}

export default LoadingView;
