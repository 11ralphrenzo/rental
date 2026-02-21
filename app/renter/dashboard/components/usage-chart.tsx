"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Bill } from "@/models/bill";
import { formatToTwoDecimals } from "@/lib/utils";
import LoadingView from "@/components/custom/loading-view";
import NoData from "@/components/custom/no-data";
import { Zap, Droplets } from "lucide-react";

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

  const isEmpty = chartData.length === 0;
  const unit = type === "electricity" ? "kWh" : "m³";

  return (
    <section className={className}>
      <div className="flex flex-col space-y-1 mb-6 px-1">
        <h2 className="text-xl font-bold tracking-tight">
          {type === "electricity" ? "⚡ Electricity" : "💧 Water"} Usage
        </h2>
        <p className="text-sm text-muted-foreground">
          Historical consumption tracked in {unit}.
        </p>
      </div>

      <LoadingView isLoading={bills === undefined}>
        {isEmpty ? (
          <NoData
            icon={type === "electricity" ? Zap : Droplets}
            title={`No ${type} data yet`}
            description="Usage trends will appear here once bills are recorded."
          />
        ) : (
        <div className="w-full bg-card/50 rounded-2xl border border-border/40 p-4 pt-6 pb-2 shadow-sm">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
            >
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "currentColor", opacity: 0.6, fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "currentColor", opacity: 0.6, fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                  backgroundColor: 'var(--background)',
                  color: 'var(--foreground)'
                }}
                itemStyle={{ fontWeight: 600 }}
              />
              <Line
                type="monotone"
                dataKey="data"
                stroke={type === "electricity" ? "#ff9900" : "#3b82f6"}
                strokeWidth={4}
                dot={{ r: 4, strokeWidth: 2, fill: "var(--background)" }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                name={type === "electricity" ? "Electricity (kWh)" : "Water (m³)"}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        )}
      </LoadingView>
    </section>
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
