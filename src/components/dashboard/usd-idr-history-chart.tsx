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
import { Calendar, Database, Info, ShieldCheck } from "lucide-react";

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
  const first = history.firstPoint;
  const isPositiveChange = (history.changeAmount ?? 0) >= 0;

  return (
    <Card
      id="usd-idr-history"
      className="w-full shadow-xs bg-card border-border hover:border-[#C3A477]/50 transition-colors"
    >
      <CardHeader className="border-b border-border/70 pb-4">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C] font-bold">
                <Database className="w-3 h-3" />
                <span>Historical FX Series • {history.unitLabel}</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-0.5 rounded border border-[#C3A477]/50 bg-[#C3A477]/10 text-foreground">
                {history.classificationNote}
              </span>
            </div>
            <CardTitle className="text-lg md:text-xl font-bold text-foreground">
              Riwayat Nilai Tukar Referensi Harian USD/IDR ({history.unitLabel})
            </CardTitle>
            <CardDescription className="text-xs font-mono text-muted-foreground">
              Sumber: {history.sourceAttribution} • Frekuensi: Referensi Penutupan Harian (EOD)
            </CardDescription>
          </div>

          {latest && (
            <div className="flex flex-col lg:items-end justify-center shrink-0 rounded-xl border border-border bg-secondary/40 px-4 py-2.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                Observasi Terakhir ({latest.sourceDate})
              </span>
              <div className="text-xl font-bold font-mono text-foreground">
                {formatIdrNumber(latest.numericValue, latest.trimmedDecimalValue)}{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  / USD
                </span>
              </div>
              {canRenderTrend &&
                history.changeAmount !== null &&
                history.changePercent !== null &&
                first && (
                  <span
                    className={`text-[11px] font-mono font-semibold mt-0.5 ${
                      isPositiveChange
                        ? "text-amber-700 dark:text-amber-400"
                        : "text-emerald-700 dark:text-emerald-400"
                    }`}
                  >
                    {isPositiveChange ? "+" : ""}
                    {history.changeAmount.toLocaleString("id-ID")} IDR (
                    {isPositiveChange ? "+" : ""}
                    {history.changePercent.toFixed(2)}%) sejak {first.sourceDate}
                  </span>
                )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-5">
        {canRenderTrend ? (
          <div className="space-y-4">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={history.points}
                  margin={{ top: 10, right: 14, left: 4, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorUsdIdr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C3A477" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#C3A477" stopOpacity={0.0} />
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
                      "Kurs Referensi Harian",
                    ]}
                    labelFormatter={(label: unknown) =>
                      `Tanggal Observasi ECB: ${String(label)}`
                    }
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      borderColor: "#C3A477",
                      color: "var(--foreground)",
                      borderRadius: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="numericValue"
                    stroke="#C3A477"
                    fillOpacity={1}
                    fill="url(#colorUsdIdr)"
                    strokeWidth={2.5}
                    activeDot={{
                      r: 5,
                      fill: "var(--background)",
                      stroke: "#C3A477",
                      strokeWidth: 2.5,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60 text-[11px] font-mono text-muted-foreground">
              <span>{history.message}</span>
              <span>
                Satuan: {history.unitLabel} • Urutan Kronologis Ascending (
                {first?.sourceDate} → {latest?.sourceDate})
              </span>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-secondary/30 p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-foreground font-semibold">
                <Info className="w-4 h-4 text-[#C3A477] shrink-0" />
                <span>
                  {history.status === "insufficient_history"
                    ? "Data Historis Belum Mencukupi untuk Grafik Tren (1 Observasi Terverifikasi)"
                    : history.status === "unavailable"
                      ? "Riwayat Observasi Sementara Tidak Tersedia"
                      : "Belum Ada Observasi Historis USD/IDR"}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {history.message}
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-mono text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C3A477]" />
                  <span>Satuan: {history.unitLabel}</span>
                </span>
                <span>•</span>
                <span>Sumber: {history.sourceAttribution}</span>
              </div>
            </div>

            {latest && (
              <div className="rounded-xl border border-[#C3A477]/40 bg-card p-4 shrink-0 space-y-1.5 min-w-[230px]">
                <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#C3A477]" />
                    <span>Tanggal Sumber</span>
                  </span>
                  <span className="font-bold text-foreground">
                    {latest.sourceDate}
                  </span>
                </div>
                <div className="text-lg font-bold font-mono text-foreground">
                  {formatIdrNumber(
                    latest.numericValue,
                    latest.trimmedDecimalValue
                  )}
                </div>
                <div className="text-[11px] font-mono text-muted-foreground">
                  {latest.trimmedDecimalValue} {history.unitLabel}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
