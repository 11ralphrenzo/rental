import React from "react";
import { Spinner } from "../ui/spinner";

type LoadingViewProps = {
  children?: React.ReactNode;
  isLoading: boolean;
  loadingMessage?: string | React.ReactNode;
};
function LoadingView({
  isLoading,
  children,
  loadingMessage = "Loading...",
}: LoadingViewProps) {
  if (!isLoading) return children;
  return (
    <>
      <div className="h-50 flex justify-center items-center">
        <div className="flex items-center gap-4">
          <Spinner />
          {loadingMessage}
        </div>
      </div>
    </>
  );
}

export default LoadingView;
