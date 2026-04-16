"use client";

import { useState, useCallback } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning";
}

interface ConfirmState extends ConfirmOptions {
  open: boolean;
  onConfirm: () => void;
}

const DEFAULT_STATE: ConfirmState = {
  open: false,
  title: "",
  message: "",
  onConfirm: () => {},
};

/**
 * useConfirm — drop-in replacement for window.confirm()
 *
 * Usage:
 *   const { confirm, ConfirmUI } = useConfirm();
 *
 *   // In handler:
 *   const ok = await confirm({ title: "Xoá?", message: "..." });
 *   if (!ok) return;
 *
 *   // In JSX:
 *   return <>{ConfirmUI}</>
 */
export function useConfirm() {
  const [state, setState] = useState<ConfirmState>(DEFAULT_STATE);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        ...options,
        open: true,
        onConfirm: () => {
          setState(DEFAULT_STATE);
          resolve(true);
        },
      });
    });
  }, []);

  const handleCancel = useCallback(() => {
    setState(DEFAULT_STATE);
  }, []);

  const ConfirmUI = (
    <ConfirmDialog
      open={state.open}
      title={state.title}
      message={state.message}
      confirmLabel={state.confirmLabel}
      cancelLabel={state.cancelLabel}
      variant={state.variant}
      onConfirm={state.onConfirm}
      onCancel={handleCancel}
    />
  );

  return { confirm, ConfirmUI };
}
