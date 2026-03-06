import { useCallback, useEffect } from "react";
import { smartPaste } from "@/lib/utils";

/**
 * Hook: Smart Copy/Paste
 * Automatically strips commas, currency symbols, and formatting
 * when user pastes a value from an email or bank statement.
 */
export function useSmartPaste(
  onPaste: (cleaned: string) => void,
  ref?: React.RefObject<HTMLElement>
) {
  const handler = useCallback(
    (e: ClipboardEvent) => {
      const raw = e.clipboardData?.getData("text") || "";
      const cleaned = smartPaste(raw);
      if (cleaned && cleaned !== raw) {
        e.preventDefault();
        onPaste(cleaned);
      }
    },
    [onPaste]
  );

  useEffect(() => {
    const el = ref?.current || document;
    el.addEventListener("paste", handler as EventListener);
    return () => el.removeEventListener("paste", handler as EventListener);
  }, [handler, ref]);
}

/**
 * Hook: Keyboard Shortcuts
 * Global keyboard shortcuts for the calculator.
 */
export function useKeyboardShortcuts(
  handlers: Record<string, () => void>
) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = `${e.ctrlKey ? "Ctrl+" : ""}${e.shiftKey ? "Shift+" : ""}${e.key}`;
      if (handlers[key]) {
        e.preventDefault();
        handlers[key]();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handlers]);
}
