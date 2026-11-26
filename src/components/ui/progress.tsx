"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

function Progress({
  className,
  value = 0,
  indicatorClassName,
  ...props
}: React.ComponentProps<"div"> & {
  value?: number | null;
  indicatorClassName?: string;
}) {
  const clamped = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div
      data-slot="progress"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped)}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-secondary/80",
        className
      )}
      {...props}
    >
      <div
        data-slot="progress-indicator"
        className={cn(
          "h-full rounded-full bg-[#101B2C] dark:bg-[#C3A477] transition-all duration-500 ease-out",
          indicatorClassName
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

export { Progress };
