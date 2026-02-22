"use client";

import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface SelectOption {
  value: string | number;
  label: string;
}

interface DefSelectProps {
  value?: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  options?: SelectOption[];
  disabled?: boolean;
  className?: string;
}

export const DefSelect = ({
  value,
  onChange,
  placeholder = "Select an option",
  options,
  disabled = false,
  className,
}: DefSelectProps) => {
  return (
    <Select
      value={String(value)}
      onValueChange={onChange}
      disabled={disabled || !options || options.length === 0}
    >
      <SelectTrigger
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
          className,
        )}
      >
        <SelectValue placeholder={placeholder}></SelectValue>
        {/* <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon asChild>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </SelectPrimitive.Icon> */}
      </SelectTrigger>

      <SelectContent>
        {options?.map((option) => (
          <SelectItem key={option.value} value={String(option.value)}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
