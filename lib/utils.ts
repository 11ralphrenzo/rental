import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { AxiosError } from "axios";
import { toast } from "sonner";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ErrorResponse {
  message?: string;
  error?: string;
}

export const handleAxiosError = (
  error: unknown,
  defaultMessage: string = "An error occurred",
) => {
  const axiosError = error as AxiosError<ErrorResponse>;

  let errorMessage = defaultMessage;

  if (axiosError.response) {
    // Request made and server responded with error
    const data = axiosError.response.data;
    errorMessage =
      data?.message || data?.error || `Error: ${axiosError.response.status}`;
    console.error("API Error:", {
      status: axiosError.response.status,
      data: axiosError.response.data,
    });
  } else if (axiosError.request) {
    // Request was made but no response
    errorMessage = "No response from server. Please check your connection.";
    console.error("No response received:", axiosError.request);
  } else {
    // Something else caused the error
    errorMessage = axiosError.message || defaultMessage;
    console.error("Error:", axiosError.message);
  }

  toast.error(errorMessage);
};
