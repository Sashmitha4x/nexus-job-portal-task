import React from "react";
import { CURRENCIES } from "../../constants/nexusConstants.js";

export default function TopNavbar({
  user,
  currency,
  onCurrencyChange,
  activeView,
  onSelectView,
  activeJobsCount,
  companiesCount,
  isBackendLive,
  latencyMs,
  onPostJobClick,
  onLogout,
}) {
  const firstName = user?.name ? user.name.trim().split(" ")[0] : "";

  return (
    <>
      {/* TIER 1: Midnight Slate Telemetry Bar */}
      <div className="w-full bg-inverse-surface text-inverse-on-surface border-b border-outline-variant/20">
        <div className="h-9 max-w-[1440px] mx-auto px-3 sm:px-6 flex items-center justify-between gap-2 font-mono-label text-mono-label">
          {/* Left: Live Database Status */}
          <div className="flex items-center gap-2 min-w-0 shrink-0">
            <span className="relative flex h-2 w-2 shrink-0">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isBackendLive ? "bg-secondary-fixed" : "bg-amber-400"
                }`}
              ></span>
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isBackendLive ? "bg-secondary" : "bg-amber-400"
                }`}
              ></span>
            </span>
            <span className="text-inverse-on-surface tracking-normal whitespace-nowrap">
              <span className="sm:hidden">
                Atlas • {latencyMs}ms
              </span>
              <span className="hidden sm:inline">
                Atlas Database: {isBackendLive ? "Live" : "Sync Ready"} • {latencyMs}ms
              </span>
            </span>
          </div>

          {/* Right: Access Mode Pill + Currency Selector */}
          <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-tertiary text-inverse-on-surface uppercase text-[10px] tracking-wider whitespace-nowrap">
              <span className="material-symbols-outlined text-[13px]">
                {user ? "verified_user" : "visibility"}
              </span>
              <span>
                {user
                  ? `${user.role.toUpperCase()} SESSION`
                  : "Guest Browsing Mode"}
              </span>
            </div>

            <div className="h-3 w-[1px] bg-outline-variant/30 hidden xs:block"></div>

            <div className="flex items-center gap-1 text-inverse-on-surface shrink-0">
              <span className="material-symbols-outlined text-[14px] text-secondary-fixed hidden sm:inline">
                payments
              </span>
              <select
                value={currency}
                onChange={(e) => onCurrencyChange(e.target.value)}
                className="bg-transparent text-inverse-on-surface font-mono-label text-mono-label cursor-pointer focus:outline-none pr-1"
              >
                {Object.values(CURRENCIES).map((c) => (
                  <option
                    key={c.code}
                    value={c.code}
                    className="bg-inverse-surface text-inverse-on-surface"
                  >
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* TIER 2: Sticky Glassmorphic Navigation Bar */}
      <header className="sticky top-0 z-40 w-full bg-surface-container-lowest/95 backdrop-blur-md border-b border-outline-variant/40">
        <div className="h-16 sm:h-[72px] max-w-[1440px] mx-auto px-3 sm:px-6 flex items-center justify-between gap-3 sm:gap-6">
          {/* Left: Brand Identity */}
          <button
            type="button"
            onClick={() => onSelectView("jobs")}
            className="flex items-center gap-2.5 sm:gap-3 text-left shrink-0 group"
          >
            <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary-container text-on-primary shadow-sm group-hover:bg-primary transition-colors">
              <span className="material-symbols-outlined text-[21px] sm:text-[22px]">
                hub
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 sm:gap-2">
              <span className="font-headline-lg text-xl sm:text-headline-lg tracking-tight text-on-surface font-extrabold">
                NEXUS.
              </span>
              <span className="hidden xs:inline-block px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-mono-label text-[10px] uppercase tracking-wider whitespace-nowrap">
                by Auspify
              </span>
            </div>
          </button>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-7">
            <button
              type="button"
              onClick={() => onSelectView("jobs")}
              className={`transition-colors flex items-center gap-1.5 py-1 ${
                activeView === "jobs"
                  ? "text-primary font-headline-sm border-b-2 border-primary-container"
                  : "text-on-surface-variant hover:text-on-surface font-body-md"
              }`}
            >
              <span>Browse Jobs ({activeJobsCount} Active)</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectView("companies")}
              className={`transition-colors flex items-center gap-1.5 py-1 ${
                activeView === "companies"
                  ? "text-primary font-headline-sm border-b-2 border-primary-container"
                  : "text-on-surface-variant hover:text-on-surface font-body-md"
              }`}
            >
              <span>Company Profiles ({companiesCount})</span>
            </button>

            {user?.role === "seeker" && (
              <button
                type="button"
                onClick={() => onSelectView("seeker")}
                className={`transition-colors flex items-center gap-1.5 py-1 ${
                  activeView === "seeker"
                    ? "text-primary font-headline-sm border-b-2 border-primary-container"
                    : "text-on-surface-variant hover:text-on-surface font-body-md"
                }`}
              >
                <span>Candidate Dashboard</span>
              </button>
            )}

            {user?.role === "employer" && (
              <button
                type="button"
                onClick={() => onSelectView("employer")}
                className={`transition-colors flex items-center gap-1.5 py-1 ${
                  activeView === "employer"
                    ? "text-primary font-headline-sm border-b-2 border-primary-container"
                    : "text-on-surface-variant hover:text-on-surface font-body-md"
                }`}
              >
                <span>Employer Studio</span>
              </button>
            )}

            {user?.role === "admin" && (
              <button
                type="button"
                onClick={() => onSelectView("admin")}
                className={`transition-colors flex items-center gap-1.5 py-1 ${
                  activeView === "admin"
                    ? "text-primary font-headline-sm border-b-2 border-primary-container"
                    : "text-on-surface-variant hover:text-on-surface font-body-md"
                }`}
              >
                <span>Admin Console</span>
              </button>
            )}
          </nav>

          {/* Right Actions: Guest Buttons OR Logged-In User Pill */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {!user ? (
              <>
                <button
                  type="button"
                  onClick={() => onSelectView("auth")}
                  className="px-3 sm:px-4 py-2 rounded-lg border border-outline-variant text-on-surface font-headline-sm text-xs sm:text-headline-sm hover:bg-surface-container-low transition-all whitespace-nowrap"
                >
                  Sign In / Register
                </button>
                <button
                  type="button"
                  onClick={onPostJobClick}
                  className="px-3 sm:px-4 py-2 rounded-lg bg-primary-container text-on-primary font-headline-sm text-xs sm:text-headline-sm hover:bg-primary transition-all flex items-center gap-1.5 shadow-sm whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-[17px] sm:text-[18px]">
                    add
                  </span>
                  <span>Post a Job</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() =>
                    onSelectView(
                      user.role === "admin"
                        ? "admin"
                        : user.role === "employer"
                        ? "employer"
                        : "seeker"
                    )
                  }
                  className="flex items-center gap-2 bg-surface-container-low hover:bg-surface-container px-2.5 py-1.5 rounded-full transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-mono-label text-xs font-bold">
                    {firstName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex flex-col text-left pr-1">
                    <span className="font-headline-sm text-xs sm:text-headline-sm leading-tight text-on-surface max-w-[90px] sm:max-w-[130px] truncate">
                      <span className="sm:hidden">{firstName}</span>
                      <span className="hidden sm:inline">{user.name}</span>
                    </span>
                    <span className="font-mono-label text-[9px] text-primary uppercase">
                      {user.role}
                    </span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={onLogout}
                  className="px-3 py-2 rounded-lg border border-outline-variant/60 hover:bg-error-container hover:text-on-error-container text-on-surface font-headline-sm text-xs transition-colors whitespace-nowrap"
                >
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
}