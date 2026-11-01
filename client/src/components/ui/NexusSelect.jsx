import React, { useState, useRef, useEffect } from "react";

export default function NexusSelect({
  value,
  onChange,
  options = [],
  prefixLabel = "",
  icon = "",
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [alignRight, setAlignRight] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onEsc = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const handleToggle = () => {
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setAlignRight(rect.left + 260 > window.innerWidth - 12);
    }
    setOpen((p) => !p);
  };

  const normalized = options.map((o) =>
    typeof o === "object" ? o : { value: o, label: o }
  );
  const current =
    normalized.find((o) => String(o.value) === String(value)) ||
    normalized[0] || { value, label: value };

  return (
    <div
      ref={ref}
      className={`relative select-none max-w-full ${
        open ? "z-50" : "z-10"
      } ${className}`}
    >
      <button
        type="button"
        onClick={handleToggle}
        className={`w-full max-w-full h-10 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-body-sm flex items-center justify-between gap-2 transition-all overflow-hidden border ${
          open
            ? "border-primary-container bg-white ring-2 ring-primary-container/15"
            : "border-transparent"
        }`}
      >
        <span className="flex items-center gap-1.5 min-w-0 flex-1 overflow-hidden">
          {icon && (
            <span className="material-symbols-outlined text-[16px] text-primary shrink-0">
              {icon}
            </span>
          )}
          {prefixLabel && (
            <span className="font-headline-sm text-[12px] text-on-surface shrink-0">
              {prefixLabel}:
            </span>
          )}
          <span className="truncate text-on-surface-variant font-medium block">
            {current.label}
          </span>
        </span>
        <span
          className={`material-symbols-outlined text-[16px] text-outline transition-transform duration-200 shrink-0 ${
            open ? "rotate-180" : ""
          }`}
        >
          expand_more
        </span>
      </button>

      {open && (
        <div
          className={`animate-pop-in absolute ${
            alignRight ? "right-0" : "left-0"
          } mt-1.5 w-full min-w-[220px] max-w-[88vw] bg-white rounded-xl shadow-[0_18px_38px_rgba(11,28,48,0.16)] border border-outline-variant/40 py-1.5 z-[90] max-h-64 overflow-y-auto divide-y divide-surface-container-low`}
        >
          {normalized.map((opt) => {
            const active = String(opt.value) === String(value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full px-3.5 py-2.5 text-left font-body-sm text-body-sm flex items-center justify-between gap-2 transition-colors ${
                  active
                    ? "bg-surface-container text-primary font-semibold"
                    : "text-on-surface hover:bg-surface-container-low"
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {active && (
                  <span className="material-symbols-outlined text-[16px] text-primary shrink-0">
                    check
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}