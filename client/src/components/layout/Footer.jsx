import React from "react";

export default function Footer({ onSelectView }) {
  return (
    <footer className="w-full bg-surface-container-lowest border-t border-outline-variant/40 mt-auto pb-16 md:pb-0">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-outline-variant/20">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="font-headline-md text-headline-md tracking-tight text-on-surface font-bold">
                NEXUS.
              </span>
              <span className="font-mono-label text-mono-label text-outline uppercase">
                Engineering Requisitions
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md">
              High-density career infrastructure for high-caliber distributed systems,
              platform, and technical leadership talent.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-5 sm:gap-6 font-body-sm text-body-sm text-on-surface-variant">
            <button
              type="button"
              onClick={() => onSelectView("jobs")}
              className="hover:text-on-surface transition-colors"
            >
              Job Directory
            </button>
            <button
              type="button"
              onClick={() => onSelectView("companies")}
              className="hover:text-on-surface transition-colors"
            >
              Verified Companies
            </button>
            <button
              type="button"
              onClick={() => onSelectView("auth")}
              className="hover:text-on-surface transition-colors"
            >
              Candidate &amp; Employer Portal
            </button>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono-label text-mono-label text-on-surface-variant">
          <div className="flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-secondary"></span>
            <span>Atlas Gateway Operational • Cluster node 01-ap-south</span>
          </div>
          <div>
            © 2026 Auspify Technologies Inc. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}