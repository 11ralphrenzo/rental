"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Bill } from "@/models/bill";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatToTwoDecimals } from "@/lib/utils";
import LoadingView from "@/components/custom/loading-view";

type UsageChartProps = {
  className?: string;
  type: "electricity" | "water";
  bills?: Bill[];
};

function UsageChart({
  className,
  type = "electricity",
  bills,
}: UsageChartProps) {
  // Transform bills data for chart
  const chartData =
    bills?.map((bill) => ({
      month: new Date(bill.month).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
      data: formatToTwoDecimals(
        type === "electricity"
          ? bill.curr_electricity - bill.prev_electricity
          : bill.curr_water - bill.prev_water,
      ),
      //   water: formatToTwoDecimals(bill.curr_water - bill.prev_water),
    })) || [];

  return (
    <Card className={className}>
      <CardHeader>
        <span className="text-lg font-semibold">
          {type === "electricity" ? "⚡ Electricity" : "💧 Water"} Usage
        </span>
        <span className="text-sm text-muted-foreground">
          {type === "electricity" ? "kWh" : "m³"}
        </span>
      </CardHeader>
      <CardContent>
        <LoadingView isLoading={bills === undefined}>
          <ResponsiveContainer height={250}>
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="data"
                stroke={type === "electricity" ? "#ff9900" : "#3d85c6"}
                strokeWidth={4}
                name={
                  type === "electricity" ? "Electricity (kWh)" : "Water (m³)"
                }
              />
            </LineChart>
          </ResponsiveContainer>
        </LoadingView>
      </CardContent>
    </Card>
  );
}

export default UsageChart;

{
  /* <Card className="col-span-2">
        <CardHeader>
          <span className="text-lg font-semibold">Water Usage</span>
          <span className="text-sm text-muted-foreground">m³</span>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="water"
                stroke="#10b981"
                strokeWidth={2}
                name="Water (m³)"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card> */
}
