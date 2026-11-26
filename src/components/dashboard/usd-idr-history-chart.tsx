"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { UsdIdrHistoryChartState } from "@/lib/market-data/read";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface UsdIdrHistoryChartProps {
  history: UsdIdrHistoryChartState;
}

function formatIdrNumber(num: number, rawTrimmed?: string): string {
  const hasFraction = rawTrimmed ? rawTrimmed.includes(".") : !Number.isInteger(num);
  const fractionDigits = hasFraction
    ? Math.min(4, Math.max(2, ((rawTrimmed || String(num)).split(".")[1] || "").length))
    : 0;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(num);
}

export function UsdIdrHistoryChart({ history }: UsdIdrHistoryChartProps) {
  const canRenderTrend =
    history.canRenderChart &&
    history.status === "ready" &&
    history.points.length >= 2;

  const latest = history.latestPoint;

  return (
    <Card id="usd-idr-history" className="w-full border-border bg-card shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base font-bold text-foreground">
              Riwayat Kurs Referensi USD/IDR
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Sumber: {history.sourceAttribution} ({history.classificationNote})
            </CardDescription>
          </div>

          {latest && (
            <div className="text-left sm:text-right shrink-0">
              <div className="text-base font-bold font-mono text-foreground">
                {formatIdrNumber(latest.numericValue, latest.trimmedDecimalValue)}
              </div>
              <span className="text-xs text-muted-foreground">
                Tanggal: {latest.sourceDate}
              </span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {canRenderTrend ? (
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={history.points}
                margin={{ top: 10, right: 12, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorUsdIdr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--border)"
                />
                <XAxis
                  dataKey="sourceDate"
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  domain={["auto", "auto"]}
                  tickFormatter={(val: number) =>
                    `Rp${Number(val).toLocaleString("id-ID")}`
                  }
                />
                <Tooltip
                  formatter={(value: unknown) => [
                    `${formatIdrNumber(Number(value))} (${history.unitLabel})`,
                    "Kurs Referensi",
                  ]}
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    color: "var(--foreground)",
                    borderRadius: "10px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="numericValue"
                  stroke="#2563EB"
                  fillOpacity={1}
                  fill="url(#colorUsdIdr)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="rounded-xl bg-secondary/50 p-4 text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">
              {history.status === "insufficient_history"
                ? "Data Historis Belum Mencukupi untuk Grafik Tren (1 Observasi Terverifikasi)"
                : "Belum Ada Riwayat Observasi"}
            </p>
            <p className="leading-relaxed">{history.message}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
