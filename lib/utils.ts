import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { format, formatDuration, intervalToDuration } from "date-fns";
import { BillStatus } from "./enum";

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

// Currency formatting utility
// ...existing code...

export function formatCurrency(
  amount: number,
  currency: string = "PHP",
): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Fortmat 2 Decimals
export function formatToTwoDecimals(value: number) {
  return Math.round(value * 100) / 100;
}

export function getDuration(
  startDate: Date | string,
  endDate?: Date | string | null,
) {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  if (!startDate || start > end) return "-";

  const { years = 0, months = 0 } = intervalToDuration({ start, end });

  const parts: string[] = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? "year" : "years"}`);
  if (months > 0) parts.push(`${months} ${months === 1 ? "month" : "months"}`);

  return parts.length > 0 ? parts.join(" ") : "Less than 1 month";
}

// Bills

export const billStatusStyle: Record<BillStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  PARTIAL: "bg-blue-100 text-blue-800 border-blue-200",
  PAID: "bg-green-100 text-green-800 border-green-200",
  OVERDUE: "bg-red-100 text-red-800 border-red-200",
  CANCELLED: "bg-gray-100 text-gray-600 border-gray-200",
};

export const BillStatusOptions = Object.values(BillStatus);
