import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingProps {
  text?: string;
  fullPage?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-10 h-10",
};

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
      <Loader2 className={cn("animate-spin text-blue-600", sizeMap[size])} />
      {text && (
        <p className="text-sm font-medium text-gray-500 animate-pulse">{text}</p>
      )}
    </div>
  );
}

export function LoadingOverlay({ text }: { text?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
      <Loading text={text} size="lg" />
    </div>
  );
}
