import React from "react";

export default function Toast({ toast, onDismiss }) {
  if (!toast.visible) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:w-full sm:max-w-sm z-[120] animate-pop-in">
      <div
        className={`p-4 rounded-2xl shadow-2xl border flex items-start gap-3 ${
          toast.isError
            ? "bg-[#fff1f2] border-[#fecdd3] text-error"
            : "bg-inverse-surface border-outline-variant/30 text-inverse-on-surface"
        }`}
      >
        <span
          className={`material-symbols-outlined text-[20px] mt-0.5 shrink-0 ${
            toast.isError ? "text-error" : "text-secondary-fixed"
          }`}
        >
          {toast.isError ? "error" : "check_circle"}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-headline-sm text-body-md font-bold leading-tight">
            {toast.title}
          </p>
          <p
            className={`font-body-sm text-body-sm mt-1 break-words ${
              toast.isError ? "text-on-error-container" : "text-inverse-on-surface/85"
            }`}
          >
            {toast.message}
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="opacity-70 hover:opacity-100 transition-opacity shrink-0"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      </div>
    </div>
  );
}