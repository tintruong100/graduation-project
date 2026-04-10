"use client";

import { useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation, faTrashCan, faXmark } from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Xác nhận",
  cancelLabel = "Hủy",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      // Auto-focus confirm button for keyboard accessibility
      setTimeout(() => confirmBtnRef.current?.focus(), 50);

      const handleKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") onCancel();
      };
      document.addEventListener("keydown", handleKey);
      return () => document.removeEventListener("keydown", handleKey);
    }
  }, [open, onCancel]);

  if (!open) return null;

  const isDanger = variant === "danger";

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Đóng"
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>

        <div className="p-6">
          {/* Icon */}
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4",
            isDanger ? "bg-red-100" : "bg-amber-100"
          )}>
            <FontAwesomeIcon
              icon={isDanger ? faTrashCan : faTriangleExclamation}
              className={cn("text-xl", isDanger ? "text-red-600" : "text-amber-500")}
            />
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-gray-800 text-center mb-2">{title}</h3>

          {/* Message */}
          <p className="text-sm text-gray-500 text-center leading-relaxed">{message}</p>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              {cancelLabel}
            </button>
            <button
              ref={confirmBtnRef}
              onClick={onConfirm}
              className={cn(
                "flex-1 px-4 py-2.5 text-sm font-bold text-white rounded-xl transition-all active:scale-95",
                isDanger
                  ? "bg-red-600 hover:bg-red-700 shadow-sm shadow-red-200"
                  : "bg-amber-500 hover:bg-amber-600 shadow-sm shadow-amber-200"
              )}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
