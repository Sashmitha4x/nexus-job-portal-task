import React from "react";

export default function MobileBottomBar({
  activeView,
  user,
  onSelectView,
  onPostJobClick,
}) {
  const role = user?.role; // "seeker" | "employer" | "admin" | undefined

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-surface-container-lowest/95 backdrop-blur-md border-t border-outline-variant/40 z-40 grid grid-cols-4 items-center px-2 md:hidden select-none">
      {/* Tab 1: Browse Jobs */}
      <button
        type="button"
        onClick={() => onSelectView("jobs")}
        className={`flex flex-col items-center justify-center gap-0.5 ${
          activeView === "jobs" ? "text-primary-container font-bold" : "text-outline"
        }`}
      >
        <span className="material-symbols-outlined text-[20px]">travel_explore</span>
        <span className="font-mono-label text-[10px]">Jobs</span>
      </button>

      {/* Tab 2: Companies Directory */}
      <button
        type="button"
        onClick={() => onSelectView("companies")}
        className={`flex flex-col items-center justify-center gap-0.5 ${
          activeView === "companies" ? "text-primary-container font-bold" : "text-outline"
        }`}
      >
        <span className="material-symbols-outlined text-[20px]">apartment</span>
        <span className="font-mono-label text-[10px]">Companies</span>
      </button>

      {/* Tab 3: Role-Specific Action (NEVER shows "Post Job" to Job Seekers or Admins) */}
      {role === "seeker" ? (
        <button
          type="button"
          onClick={() => onSelectView("seeker")}
          className={`flex flex-col items-center justify-center gap-0.5 ${
            activeView === "seeker" ? "text-primary-container font-bold" : "text-outline"
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">
            assignment_turned_in
          </span>
          <span className="font-mono-label text-[10px]">My Apps</span>
        </button>
      ) : role === "admin" ? (
        <button
          type="button"
          onClick={() => onSelectView("admin")}
          className={`flex flex-col items-center justify-center gap-0.5 ${
            activeView === "admin" ? "text-primary-container font-bold" : "text-outline"
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">
            admin_panel_settings
          </span>
          <span className="font-mono-label text-[10px]">Moderation</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={onPostJobClick}
          className="flex flex-col items-center justify-center gap-0.5 text-secondary font-bold"
        >
          <span className="material-symbols-outlined text-[21px]">add_circle</span>
          <span className="font-mono-label text-[10px]">Post Job</span>
        </button>
      )}

      {/* Tab 4: Workspace / Sign In */}
      <button
        type="button"
        onClick={() =>
          onSelectView(
            !user
              ? "auth"
              : role === "admin"
              ? "admin"
              : role === "employer"
              ? "employer"
              : "seeker"
          )
        }
        className={`flex flex-col items-center justify-center gap-0.5 ${
          activeView === "auth" ||
          activeView === "seeker" ||
          activeView === "employer" ||
          activeView === "admin"
            ? "text-primary-container font-bold"
            : "text-outline"
        }`}
      >
        <span className="material-symbols-outlined text-[20px]">
          {user ? "person" : "login"}
        </span>
        <span className="font-mono-label text-[10px]">
          {!user
            ? "Sign In"
            : role === "admin"
            ? "Admin"
            : role === "employer"
            ? "Studio"
            : "Profile"}
        </span>
      </button>
    </nav>
  );
}