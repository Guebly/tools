
import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

export interface ToastMessage {
  id:      number;
  type:    "success" | "error" | "info";
  title:   string;
  body?:   string;
}

interface Props {
  toasts:   ToastMessage[];
  onRemove: (id: number) => void;
}

export default function ToastContainer({ toasts, onRemove }: Props) {
  return (
    <div className="fixed bottom-5 right-4 z-[9999] flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      {toasts.map(t => (
        <div key={t.id}
          className={`toast-in pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl
            border shadow-2xl backdrop-blur-xl text-sm font-semibold
            ${t.type === "success"
              ? "bg-emerald-950/90 border-emerald-700 text-emerald-200"
              : t.type === "error"
              ? "bg-red-950/90 border-red-700 text-red-200"
              : "bg-slate-900/90 border-slate-700 text-slate-200"
            }`}>
          <span className="mt-0.5 flex-shrink-0">
            {t.type === "success" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
          </span>
          <div className="flex-1 min-w-0">
            <p className="leading-snug">{t.title}</p>
            {t.body && <p className="text-xs font-normal opacity-75 mt-0.5 leading-snug">{t.body}</p>}
          </div>
          <button onClick={() => onRemove(t.id)}
            className="flex-shrink-0 opacity-50 hover:opacity-100 transition mt-0.5">
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}
