import { Suspense } from "react";
import { Loading } from "@/components/ui/Loading";
import { cn } from "@/lib/utils";

interface PageWrapperProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

function PageSkeleton() {
  return <Loading fullPage={false} text="Đang tải trang..." />;
}

export function PageWrapper({
  title,
  description,
  actions,
  children,
  className,
}: PageWrapperProps) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <div className={cn("p-4 md:p-6 space-y-6", className)}>
        {(title || actions) && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              {title && (
                <h1 className="text-xl md:text-2xl font-bold text-gray-800">{title}</h1>
              )}
              {description && (
                <p className="text-sm text-gray-500 mt-1">{description}</p>
              )}
            </div>
            {actions && <div className="flex items-center gap-3">{actions}</div>}
          </div>
        )}
        {children}
      </div>
    </Suspense>
  );
}
