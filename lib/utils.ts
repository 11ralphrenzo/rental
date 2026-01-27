import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { format } from "date-fns";

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
  } else if (axiosError.request) {
    // Request was made but no response
    errorMessage = "No response from server. Please check your connection.";
  } else {
    // Something else caused the error
    errorMessage = axiosError.message || defaultMessage;
  }

  toast.error(errorMessage);
};

// Date formatting utilities

export const formatDate = (
  date: Date | string | null | undefined,
  dateFormat: string | undefined = "MMM dd, yyyy",
): string => {
  if (!date) return "-";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, dateFormat);
};

export const formatDateShort = (
  date: Date | string | null | undefined,
): string => {
  if (!date) return "-";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "MM/dd/yy");
};

export const formatDateTime = (
  date: Date | string | null | undefined,
): string => {
  if (!date) return "-";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "MMM dd, yyyy HH:mm");
};
