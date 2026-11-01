import React from "react";
import { WORK_MODES, CURRENCIES } from "../../constants/nexusConstants.js";

export default function HeroSearchBanner({
  totalActiveCount,
  searchQuery,
  onSearchChange,
  locationQuery,
  onLocationChange,
  workModeFilter,
  onWorkModeChange,
  avgBaseSalaryUSD,
  currency,
  onSearchSubmit,
}) {
  const cur = CURRENCIES[currency] || CURRENCIES.USD;
  const convertedAvg = Math.round(avgBaseSalaryUSD * cur.rate).toLocaleString();

  return (
    <section
      className="relative w-full rounded-2xl overflow-hidden text-on-primary p-5 sm:p-8 md:p-10 shadow-lg border border-outline-variant/30 animate-fade-up"
      style={{
        background:
          "radial-gradient(circle at 85% 15%, rgba(53, 37, 205, 0.45) 0%, transparent 55%), radial-gradient(circle at 10% 90%, rgba(0, 106, 97, 0.3) 0%, transparent 50%), linear-gradient(135deg, #091224 0%, #0d1b38 50%, #15254d 100%)",
      }}
    >
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      ></div>

      <div className="relative z-10 max-w-4xl flex flex-col gap-4">
        <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-surface-container-lowest/15 backdrop-blur-sm text-secondary-fixed font-mono-label text-[10px] sm:text-mono-label tracking-wide">
          <span className="inline-block w-2 h-2 rounded-full bg-secondary-fixed animate-pulse shrink-0"></span>
          <span>
            GUEST ACCESS • {totalActiveCount} VERIFIED TECHNICAL REQUISITIONS
          </span>
        </div>

        <h1 className="font-headline-xl text-2xl sm:text-headline-xl text-on-primary font-bold tracking-tight max-w-3xl leading-tight">
          Discover Verified Engineering, Architecture &amp; Product Leadership Roles
        </h1>

        <p className="font-body-lg text-sm sm:text-body-lg text-inverse-on-surface/90 max-w-2xl">
          High-signal technical opportunities across distributed infrastructure, platform
          engineering, and applied artificial intelligence laboratories.
        </p>

        {/* 3-Part Search Console Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSearchSubmit();
          }}
          className="mt-2 bg-surface-container-lowest rounded-xl shadow-lg p-2.5 flex flex-col md:flex-row items-stretch gap-2.5"
        >
          <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-surface-container-low rounded-lg">
            <span className="material-symbols-outlined text-outline text-[20px] shrink-0">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search role title, skill (React, Go, PyTorch, K8s), or company..."
              className="w-full bg-transparent font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="text-outline hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          <div className="h-auto w-px bg-outline-variant/40 hidden md:block my-1"></div>

          <div className="flex items-center gap-2 px-3 py-2 bg-surface-container-low rounded-lg md:w-64">
            <span className="material-symbols-outlined text-outline text-[20px] shrink-0">
              location_on
            </span>
            <input
              type="text"
              value={locationQuery}
              onChange={(e) => onLocationChange(e.target.value)}
              placeholder="Location: All Cities / Remote"
              className="w-full bg-transparent font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-headline-sm text-headline-sm transition-all flex items-center justify-center gap-2 shadow-sm shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">
              travel_explore
            </span>
            <span>Search Jobs</span>
          </button>
        </form>

        {/* Quick Work Mode Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-body-sm">
          <span className="text-inverse-on-surface/70 font-mono-label text-mono-label uppercase mr-1">
            Quick Filter:
          </span>

          {WORK_MODES.map((m) => {
            const active = workModeFilter === m.id;
            const isRemoteChip = m.id === "Remote";
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onWorkModeChange(m.id)}
                className={`px-3 py-1 rounded-full text-[12px] flex items-center gap-1 transition-all ${
                  active
                    ? isRemoteChip
                      ? "bg-secondary-container text-on-secondary-container font-mono-label shadow-sm"
                      : "bg-primary-container text-on-primary font-headline-sm shadow-sm"
                    : "bg-surface-container-lowest/15 text-inverse-on-surface hover:bg-surface-container-lowest/25"
                }`}
              >
                {m.icon && (
                  <span className="material-symbols-outlined text-[14px]">
                    {m.icon}
                  </span>
                )}
                <span>{m.label}</span>
              </button>
            );
          })}

          <div className="hidden sm:flex items-center gap-1 ml-auto text-inverse-on-surface/80 font-mono-label text-mono-label">
            <span className="material-symbols-outlined text-[14px] text-secondary-fixed">
              bolt
            </span>
            <span>
              Avg. Base Compensation: {cur.symbol}
              {convertedAvg} {cur.code}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}