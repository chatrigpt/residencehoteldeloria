import { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type = "success", onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const styles = {
    success: "bg-emerald-950 border-emerald-500/30 text-emerald-200",
    error: "bg-rose-950 border-rose-500/30 text-rose-200",
    info: "bg-amber-950 border-amber-500/30 text-amber-200",
  }[type];

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400" />,
    info: <Info className="w-5 h-5 text-amber-400" />,
  }[type];

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[99999] transition-all duration-300">
      <div className={`flex items-center gap-3 px-5 py-3.5 rounded-full shadow-2xl border ${styles} animate-slide-down`}>
        {icons}
        <span className="font-sans font-semibold text-xs whitespace-nowrap tracking-wide">{message}</span>
        <button
          onClick={onClose}
          className="hover:bg-white/10 p-1 rounded-full text-current/60 hover:text-current transition-colors ml-2"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
