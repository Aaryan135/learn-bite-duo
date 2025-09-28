import React from "react";
import clsx from "clsx";
export const PageIndicators: React.FC<{
  count: number;
  current: number;
}> = ({ count, current }) => (
  <div className="flex flex-col items-center gap-2 absolute left-4 top-1/2 -translate-y-1/2 z-20">
    {Array.from({ length: count }).map((_, i) => (
      <span
        key={i}
        className={clsx(
          "block w-2 h-2 rounded-full bg-[var(--color-outline)] transition-all duration-200",
          i === current
            ? "scale-125 opacity-100 bg-[var(--color-primary)]"
            : "scale-100 opacity-60"
        )}
        aria-current={i === current}
      />
    ))}
  </div>
);
