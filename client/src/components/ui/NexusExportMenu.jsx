import React, { useState, useRef, useEffect } from "react";

export default function NexusExportMenu({
  label = "Export Pipeline",
  onExportExcel,
  onExportCSV,
  onExportPDF,
}) {
  const [open, setOpen] = useState(false);
  const [alignRight, setAlignRight] = useState(true);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const handleToggle = () => {
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setAlignRight(rect.left + 230 > window.innerWidth - 12);
    }
    setOpen((p) => !p);
  };

  return (
    <div ref={ref} className={`relative select-none ${open ? "z-50" : "z-10"}`}>
      <button
        type="button"
        onClick={handleToggle}
        className="h-10 inline-flex items-center gap-2 px-4 py-2 bg-surface-container-low hover:bg-surface-container text-on-surface font-headline-sm text-headline-sm rounded-xl border border-outline-variant/30 transition-colors whitespace-nowrap"
      >
        <span className="material-symbols-outlined text-[18px] text-primary">
          file_download
        </span>
        <span>{label}</span>
        <span
          className={`material-symbols-outlined text-[17px] text-on-surface-variant transition-transform duration-200 ${
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
          } mt-2 w-56 max-w-[88vw] bg-surface-container-lowest rounded-2xl shadow-[0_18px_40px_rgba(11,28,48,0.18)] border border-outline-variant/40 p-1.5 z-[90] flex flex-col gap-0.5`}
        >
          <div className="px-3 py-1 font-mono-label text-[10px] text-outline uppercase tracking-wider">
            ATS Telemetry Export
          </div>
          <button
            type="button"
            onClick={() => {
              onExportExcel();
              setOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-xl hover:bg-surface-container-low font-body-sm text-body-sm text-on-surface flex items-center justify-between transition-colors"
          >
            <span>Candidate Dossiers (.xls)</span>
            <span className="font-mono-label text-[10px] px-1.5 py-0.5 rounded bg-secondary-container text-on-secondary-container">
              EXCEL
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              onExportCSV();
              setOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-xl hover:bg-surface-container-low font-body-sm text-body-sm text-on-surface flex items-center justify-between transition-colors"
          >
            <span>Interview Schedules (.csv)</span>
            <span className="font-mono-label text-[10px] px-1.5 py-0.5 rounded bg-surface-container text-primary">
              CSV
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              onExportPDF();
              setOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-xl hover:bg-surface-container-low font-body-sm text-body-sm text-on-surface flex items-center justify-between transition-colors"
          >
            <span>Compliance Audit (.pdf)</span>
            <span className="font-mono-label text-[10px] px-1.5 py-0.5 rounded bg-error-container text-on-error-container">
              PDF
            </span>
          </button>
        </div>
      )}
    </div>
  );
}