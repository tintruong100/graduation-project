import { cn } from "@/lib/utils";

interface LoadingProps {
  text?: string;
  fullPage?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "w-4 h-4 border-2",
  md: "w-7 h-7 border-2",
  lg: "w-12 h-12 border-[3px]",
};

/** Circular spinner */
export function Spinner({ size = "md", className }: { size?: "sm" | "md" | "lg"; className?: string }) {
  return (
    <span
      className={cn(
        "inline-block rounded-full border-blue-200 border-t-blue-600 animate-spin",
        sizeMap[size],
        className,
      )}
    />
  );
}

export function Loading({ text = "Đang tải...", fullPage = false, size = "md", className }: LoadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        fullPage && "min-h-screen",
        !fullPage && "py-16",
        className,
      )}
    >
      <Spinner size={size} />
      {text && (
        <p className="text-sm font-medium text-gray-400 animate-pulse">{text}</p>
      )}
    </div>
  );
}

export function LoadingOverlay({ text }: { text?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <Loading text={text} size="lg" />
    </div>
  );
}

/** Skeleton block */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded bg-gray-200", className)} />
  );
}

/** Table skeleton — shows N placeholder rows */
export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      {/* Header skeleton */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Row skeletons */}
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="px-4 py-3.5 flex gap-4 border-b border-gray-100 last:border-0">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton
              key={c}
              className={cn("h-4 flex-1", c === 0 ? "max-w-[80px]" : c === cols - 1 ? "max-w-[100px]" : "")}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Card skeleton */
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("bg-white rounded-xl border border-gray-200 p-5 space-y-3", className)}>
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}
