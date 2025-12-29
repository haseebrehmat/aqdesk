import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success", duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Top-Right Notification Overlay */}
      <div className="fixed top-5 right-5 z-50 flex flex-col space-y-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// This hook intentionally shares the provider module with its context.
// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => useContext(ToastContext);

function ToastItem({ toast, onClose }) {
  const isSuccess = toast.type === "success";

  React.useEffect(() => {
    const timer = setTimeout(onClose, toast.duration);
    return () => clearTimeout(timer);
  }, [toast.duration, onClose]);

  return (
    <div
      className={`pointer-events-auto relative overflow-hidden rounded-xl border shadow-xl backdrop-blur-md p-4 transition-all duration-300 animate-in slide-in-from-top-2 fade-in ${
        isSuccess
          ? "bg-slate-900/95 border-emerald-500/40 text-emerald-200"
          : "bg-slate-900/95 border-red-500/40 text-red-200"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {isSuccess ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          )}
          <p className="text-xs sm:text-sm font-medium leading-snug">{toast.message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition shrink-0 p-0.5"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Animated Timed Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800/50 overflow-hidden">
        <div
          className={`h-full ${isSuccess ? "bg-emerald-500" : "bg-red-500"}`}
          style={{
            animation: `toastProgress ${toast.duration}ms linear forwards`,
          }}
        />
      </div>

      <style>{`
        @keyframes toastProgress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}
