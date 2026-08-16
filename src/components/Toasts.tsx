import { useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Icon, type IconName } from "./icons";
import type { Toast } from "../types";

const KIND_STYLE: Record<Toast["kind"], { icon: IconName; bar: string; iconColor: string }> = {
  success: { icon: "check", bar: "bg-pine-500", iconColor: "text-pine-500" },
  info: { icon: "bell", bar: "bg-ink-400", iconColor: "text-ink-500" },
  update: { icon: "trend", bar: "bg-honey-500", iconColor: "text-honey-600" },
};

function ToastItem({ toast }: { toast: Toast }) {
  const { dismissToast } = useApp();
  useEffect(() => {
    const t = window.setTimeout(() => dismissToast(toast.id), 4200);
    return () => window.clearTimeout(t);
  }, [toast.id, dismissToast]);

  const meta = KIND_STYLE[toast.kind];
  return (
    <div className="anim-toast pointer-events-auto relative flex w-[min(92vw,380px)] items-start gap-3 overflow-hidden rounded-lg border border-line bg-surface py-3 pl-4 pr-3 shadow-lift">
      <span className={`absolute inset-y-0 left-0 w-1 ${meta.bar}`} />
      <Icon name={meta.icon} className={`mt-0.5 h-4 w-4 flex-none ${meta.iconColor}`} />
      <p className="flex-1 text-[13px] font-medium leading-snug text-ink-800">{toast.message}</p>
      <button
        onClick={() => dismissToast(toast.id)}
        aria-label="Dismiss notification"
        className="rounded p-1 text-ink-400 transition-colors hover:bg-mist hover:text-ink-700"
      >
        <Icon name="x" className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function Toasts() {
  const { toasts } = useApp();
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[90] flex flex-col gap-2.5" role="status" aria-live="polite">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}
