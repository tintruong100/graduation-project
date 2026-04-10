"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * TopProgressBar — thin NProgress-style bar at the top of the main content.
 * Appears on route change; header/sidebar are NOT affected.
 */
export function TopProgressBar() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const prevPathRef = useRef(pathname);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (prevPathRef.current === pathname) return;
    prevPathRef.current = pathname;

    // Start animation
    setProgress(0);
    setVisible(true);

    // Rapid climb to ~80%, then stall
    const t1 = setTimeout(() => setProgress(30), 50);
    const t2 = setTimeout(() => setProgress(65), 200);
    const t3 = setTimeout(() => setProgress(80), 500);

    // Complete
    timerRef.current = setTimeout(() => {
      setProgress(100);
      // Fade out after complete
      setTimeout(() => setVisible(false), 300);
    }, 700);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [pathname]);

  if (!visible && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[999] h-[3px] pointer-events-none"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 0.3s ease" }}
    >
      <div
        className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-400 shadow-sm shadow-blue-400/50"
        style={{
          width: `${progress}%`,
          transition: progress === 100
            ? "width 0.2s ease-out"
            : "width 0.4s cubic-bezier(0.4,0,0.2,1)",
        }}
      />
    </div>
  );
}
