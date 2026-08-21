"use client";

import { TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartData = [
  { day: "Monday", price: 2350 },
  { day: "Tuesday", price: 2380 },
  { day: "Wednesday", price: 2365 },
  { day: "Thursday", price: 2410 },
  { day: "Friday", price: 2450 },
  { day: "Saturday", price: 2445 },
  { day: "Sunday", price: 2480 },
];

const chartConfig = {
  price: {
    label: "Price (USD/oz)",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export function GoldChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gold Price Tracker (XAU/USD)</CardTitle>
        <CardDescription>Live tracking for the past 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Line
              dataKey="price"
              type="natural"
              stroke="var(--color-price)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Trending up by 5.2% this week <TrendingUp className="h-4 w-4 text-green-500" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing dummy data for the last 7 days.
        </div>
      </CardFooter>
    </Card>
  );
}
