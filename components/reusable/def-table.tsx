"use client";

import * as React from "react";
import {
  Table as ShadTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // adjust path if needed

interface TableProps<T> {
  columns: string[]; // column headers
  data: T[]; // array of data objects
  renderRow: (row: T, index: number) => React.ReactNode;
  footer?: React.ReactNode; // optional footer slot
}

export function DefTable<T>({
  columns,
  data,
  renderRow,
  footer,
}: TableProps<T>) {
  return (
    <ShadTable>
      {/* Header */}
      <TableHeader>
        <TableRow>
          {columns.map((col) => (
            <TableHead key={col}>{col}</TableHead>
          ))}
        </TableRow>
      </TableHeader>

      {/* Body */}
      {data && data.length > 0 ? (
        <TableBody>{data.map((row, idx) => renderRow(row, idx))}</TableBody>
      ) : (
        <TableBody>
          <TableRow>
            <TableCell colSpan={columns.length}>
              <div className="flex w-full h-50 items-center justify-center">
                <span className="font-semibold">No Data</span>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      )}

      {/* Footer (optional) */}
      {footer && (
        <tfoot>
          <TableRow>
            <TableCell colSpan={columns.length}>{footer}</TableCell>
          </TableRow>
        </tfoot>
      )}
    </ShadTable>
  );
}
