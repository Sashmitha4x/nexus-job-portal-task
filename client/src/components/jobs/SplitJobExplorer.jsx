import React from "react";
import { createPortal } from "react-dom";
import {
  formatSalaryBand,
  formatTimeAgo,
} from "../../constants/nexusConstants.js";

const getAvatarBadgeStyle = (color) => {
  switch (color) {
    case "teal":
      return "bg-secondary text-on-secondary";
    case "slate":
      return "bg-tertiary-container text-on-tertiary-container";
    case "violet":
      return "bg-surface-container-highest text-primary";
    default:
      return "bg-primary-container text-on-primary";
  }
};

export default function SplitJobExplorer({
  jobs,
  allCompanies,
  selectedJob,
  selectedJobCompany,
  currency,
  currentPage,
  onPageChange,
  bookmarkedJobIds,
  onToggleBookmark,
  onSelectJob,
  mobileDrawerOpen,
  onCloseMobileDrawer,
  onApplyForJob,
  onOpenCompanyModal,
  onFilterByCompany,
  onResetFilters,
  onShareJob,
}) {
  const pageSize = 4;
  const totalPages = Math.max(1, Math.ceil(jobs.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedJobs = jobs.slice(startIndex, startIndex + pageSize);

  if (jobs.length === 0) {
    return (
      <div className="mt-6 bg-surface-container-lowest rounded-2xl p-12 text-center shadow-sm border border-outline-variant/30 animate-fade-up">
        <span className="material-symbols-outlined text-[42px] text-outline">
          work_off
        </span>
        <h3 className="font-headline-lg text-on-surface mt-2">
          No active technical requisitions match your current filters
        </h3>
        <p className="font-body-md text-on-surface-variant mt-1 max-w-md mx-auto">
          Try clearing your search keyword, work mode, or base compensation filter to view
          all open engineering roles.
        </p>
        <button
          type="button"
          onClick={onResetFilters}
          className="mt-4 px-5 py-2.5 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-headline-sm text-headline-sm inline-flex items-center gap-1.5 shadow-sm"
        >
          <span className="material-symbols-outlined text-[17px]">restart_alt</span>
          <span>Reset All Search Filters</span>
        </button>
      </div>
    );
  }

  const openRolesAtSelectedCompany = jobs.filter(
    (j) =>
      j.companyName.toLowerCase() ===
      (selectedJobCompany?.companyName || "").toLowerCase()
  ).length;

  const renderReadingDossier = (isMobileModal = false) => {
    if (!selectedJob) return null;
    const isBookmarked = bookmarkedJobIds.includes(selectedJob.jobId);

    return (
      <div className="bg-surface-container-lowest rounded-2xl shadow-md border border-outline-variant/30 p-5 sm:p-8 flex flex-col gap-6">
        {/* Requisition Top Metadata Header */}
        <div className="flex flex-col gap-4 border-b border-outline-variant/30 pb-5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono-label text-mono-label px-2.5 py-1 rounded bg-surface-container text-primary font-bold">
                #{selectedJob.jobId}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-secondary-container text-on-secondary-container font-mono-label text-mono-label">
                <span className="material-symbols-outlined text-[14px]">verified</span>
                <span>Verified Employer</span>
              </span>
              {selectedJob.expiresAt && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-surface-container-low text-on-surface-variant font-mono-label text-mono-label">
                  <span className="material-symbols-outlined text-[14px] text-primary">
                    event_upcoming
                  </span>
                  <span>
                    Closes{" "}
                    {new Date(selectedJob.expiresAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onShareJob(selectedJob)}
                className="w-9 h-9 rounded-lg bg-surface-container-low hover:bg-surface-container flex items-center justify-center text-outline hover:text-on-surface transition-colors"
                title="Copy Requisition Link"
              >
                <span className="material-symbols-outlined text-[18px]">share</span>
              </button>
              <button
                type="button"
                onClick={() => onToggleBookmark(selectedJob)}
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                  isBookmarked
                    ? "bg-primary-container text-white"
                    : "bg-surface-container-low hover:bg-surface-container text-outline hover:text-primary"
                }`}
                title="Bookmark Role"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isBookmarked ? "bookmark_added" : "bookmark"}
                </span>
              </button>
              {isMobileModal && (
                <button
                  type="button"
                  onClick={onCloseMobileDrawer}
                  className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-on-surface"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              )}
            </div>
          </div>

          <div>
            <h2 className="font-headline-xl text-2xl sm:text-headline-xl text-on-surface font-bold leading-tight">
              {selectedJob.title}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-body-md text-body-md text-on-surface-variant">
              <button
                type="button"
                onClick={() => onOpenCompanyModal(selectedJobCompany)}
                className="font-semibold text-on-surface hover:text-primary flex items-center gap-1 transition-colors"
              >
                <span>{selectedJob.companyName}</span>
                <span className="material-symbols-outlined text-secondary text-[16px]">
                  verified
                </span>
              </button>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-outline">
                  location_on
                </span>
                {selectedJob.location}
              </span>
              <span>•</span>
              <span className="text-outline font-mono-label text-mono-label">
                {selectedJob.department || "Core Engineering"} •{" "}
                {formatTimeAgo(selectedJob.createdAt)}
              </span>
            </div>
          </div>

          {/* 4-Card Highlight Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-surface-container-low flex flex-col">
              <span className="font-mono-label text-[10px] text-outline uppercase">
                Compensation
              </span>
              <span className="font-mono-data text-mono-data font-bold text-on-surface mt-1">
                {formatSalaryBand(
                  selectedJob.salaryMin,
                  selectedJob.salaryMax,
                  currency,
                  true
                )}
              </span>
              <span className="font-body-sm text-[11px] text-on-surface-variant">
                Base annual ({currency})
              </span>
            </div>

            <div className="p-3 rounded-xl bg-surface-container-low flex flex-col">
              <span className="font-mono-label text-[10px] text-outline uppercase">
                Work Style
              </span>
              <span className="font-headline-sm text-headline-sm font-bold text-secondary mt-1">
                {selectedJob.workMode === "Remote"
                  ? "100% Remote"
                  : selectedJob.workMode}
              </span>
              <span className="font-body-sm text-[11px] text-on-surface-variant">
                {selectedJob.location}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-surface-container-low flex flex-col">
              <span className="font-mono-label text-[10px] text-outline uppercase">
                Employment
              </span>
              <span className="font-headline-sm text-headline-sm font-bold text-on-surface mt-1">
                {selectedJob.jobType}
              </span>
              <span className="font-body-sm text-[11px] text-on-surface-variant">
                Direct Requisition
              </span>
            </div>

            <div className="p-3 rounded-xl bg-surface-container-low flex flex-col">
              <span className="font-mono-label text-[10px] text-outline uppercase">
                Experience
              </span>
              <span className="font-headline-sm text-headline-sm font-bold text-on-surface mt-1">
                {selectedJob.experienceLevel || "Senior (5+ Yrs)"}
              </span>
              <span className="font-body-sm text-[11px] text-on-surface-variant">
                Verified Tier
              </span>
            </div>
          </div>

          {/* Primary Apply Conversion Bar */}
          <div className="p-4 rounded-xl bg-surface-container flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 font-headline-sm text-headline-sm text-on-surface">
                <span className="material-symbols-outlined text-primary text-[18px]">
                  lock_open
                </span>
                <span>Direct Candidate Application</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Proceeding will route to verification login or open the instant CV
                application console.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onApplyForJob(selectedJob)}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-headline-sm text-headline-sm text-center transition-all flex items-center justify-center gap-1.5 shadow-sm shrink-0 active:scale-[0.99]"
            >
              <span>Apply for Job</span>
              <span className="material-symbols-outlined text-[18px]">
                arrow_forward
              </span>
            </button>
          </div>
        </div>

        {/* Role Overview & Mandate */}
        <div className="flex flex-col gap-2.5">
          <h3 className="font-headline-md text-headline-md text-on-surface font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">
              terminal
            </span>
            <span>Role Overview &amp; Mandate</span>
          </h3>
          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            {selectedJob.overview}
          </p>
        </div>

        {/* Key Responsibilities */}
        {selectedJob.responsibilities?.length > 0 && (
          <div className="flex flex-col gap-2.5">
            <h3 className="font-headline-md text-headline-md text-on-surface font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">
                task_alt
              </span>
              <span>Key Responsibilities</span>
            </h3>
            <ul className="space-y-2.5 font-body-md text-body-md text-on-surface-variant">
              {selectedJob.responsibilities.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-secondary text-[18px] mt-0.5 shrink-0">
                    check_circle
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Target Technical Stack */}
        <div className="flex flex-col gap-2.5">
          <h3 className="font-headline-md text-headline-md text-on-surface font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">
              stacks
            </span>
            <span>Target Technical Stack</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {(selectedJob.skills || []).map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 rounded-lg bg-surface-container font-mono-data text-mono-data text-on-surface"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Benefits & Equipment */}
        {selectedJob.benefits?.length > 0 && (
          <div className="flex flex-col gap-2.5">
            <h3 className="font-headline-md text-headline-md text-on-surface font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[20px]">
                workspace_premium
              </span>
              <span>Benefits &amp; Equipment</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-body-sm text-body-sm text-on-surface">
              {selectedJob.benefits.map((b, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-lg bg-surface-container-low flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-primary text-[18px] shrink-0">
                    verified
                  </span>
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Embedded Public Company Profile Dossier Card */}
        {selectedJobCompany && (
          <div className="mt-1 p-5 sm:p-6 rounded-2xl bg-surface-container-low/60 border border-outline-variant/30 shadow-sm flex flex-col gap-4 hover:border-outline-variant/60 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex items-center gap-3.5">
                {selectedJobCompany.logoUrl ? (
                  <img
                    src={selectedJobCompany.logoUrl}
                    alt={selectedJobCompany.companyName}
                    className="w-12 h-12 rounded-xl object-contain bg-white p-1 border border-outline-variant/30 shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary font-headline-lg text-[18px] flex items-center justify-center font-extrabold shadow-sm shrink-0">
                    {selectedJobCompany.initials || "ACL"}
                  </div>
                )}
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">
                      {selectedJobCompany.companyName}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[11px] font-mono-label font-semibold">
                      <span className="material-symbols-outlined text-[13px]">
                        verified
                      </span>
                      Verified
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-on-surface-variant font-body-sm text-[12px]">
                    <span>{selectedJobCompany.industry}</span>
                    <span className="text-outline">•</span>
                    <span>{selectedJobCompany.location}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onOpenCompanyModal(selectedJobCompany)}
                className="px-3.5 py-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container border border-outline-variant/30 text-on-surface hover:text-primary text-[12px] font-headline-sm transition-all flex items-center justify-center gap-1.5 shadow-sm shrink-0"
              >
                <span>View Profile</span>
                <span className="material-symbols-outlined text-[14px]">
                  open_in_new
                </span>
              </button>
            </div>

            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              {selectedJobCompany.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="px-3 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant/20 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-outline">
                  group
                </span>
                <div className="flex flex-col">
                  <span className="font-mono-data text-mono-data font-semibold text-on-surface">
                    {selectedJobCompany.companySize || "140+"}
                  </span>
                  <span className="text-[10px] text-on-surface-variant uppercase font-mono-label">
                    Team Scale
                  </span>
                </div>
              </div>

              <div className="px-3 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant/20 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-secondary">
                  verified
                </span>
                <div className="flex flex-col">
                  <span className="font-mono-data text-mono-data font-semibold text-on-surface">
                    {selectedJobCompany.fundingStage || "Series B"}
                  </span>
                  <span className="text-[10px] text-on-surface-variant uppercase font-mono-label">
                    Verified Stage
                  </span>
                </div>
              </div>

              <div className="px-3 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant/20 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-primary">
                  star
                </span>
                <div className="flex flex-col">
                  <span className="font-mono-data text-mono-data font-semibold text-on-surface">
                    {selectedJobCompany.rating || "4.9 / 5.0"}
                  </span>
                  <span className="text-[10px] text-on-surface-variant uppercase font-mono-label">
                    Engineer Rating
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-outline-variant/20">
              <div className="flex items-center gap-2 text-on-surface-variant font-mono-label text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                <span>Actively hiring distributed systems talent</span>
              </div>
              <button
                type="button"
                onClick={() => onFilterByCompany(selectedJobCompany)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-primary hover:bg-surface-container-high font-mono-label text-mono-label font-semibold transition-colors"
              >
                <span>
                  {openRolesAtSelectedCompany} Open{" "}
                  {openRolesAtSelectedCompany === 1 ? "Role" : "Roles"} at{" "}
                  {selectedJobCompany.initials || selectedJobCompany.companyName}
                </span>
                <span className="material-symbols-outlined text-[14px]">
                  arrow_forward
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Slide-Up Job Dossier Sheet (<1024px) */}
      {mobileDrawerOpen &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            className="lg:hidden fixed inset-0 z-[100] bg-on-surface/50 backdrop-blur-sm flex flex-col justify-end"
            onClick={onCloseMobileDrawer}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="max-h-[90vh] overflow-y-auto rounded-t-3xl bg-surface p-3 animate-slide-up"
            >
              {renderReadingDossier(true)}
            </div>
          </div>,
          document.body
        )}

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT 5 COLUMNS: Scrollable Job Cards Feed */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 font-headline-sm text-headline-sm text-on-surface">
              <span>Active Requisitions</span>
              <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-primary font-mono-label text-mono-label">
                {jobs.length} Open
              </span>
            </div>
            <span className="font-mono-label text-mono-label text-outline">
              Showing {startIndex + 1}–{Math.min(startIndex + pageSize, jobs.length)} of{" "}
              {jobs.length}
            </span>
          </div>

          {paginatedJobs.map((job) => {
            const isSelected = selectedJob?.jobId === job.jobId;
            const companyObj =
              allCompanies.find(
                (c) =>
                  c.companyId === job.companyId ||
                  c.companyName.toLowerCase() === job.companyName.toLowerCase()
              ) || null;
            const logoSrc = job.companyLogo || companyObj?.logoUrl || "";

            return (
              <article
                key={job.jobId}
                onClick={() => {
                  onSelectJob(job.jobId);
                  if (window.innerWidth < 1024) {
                    onSelectJob(job.jobId, true);
                  }
                }}
                className={`relative p-5 rounded-xl bg-surface-container-lowest cursor-pointer transition-all group border ${
                  isSelected
                    ? "shadow-md border-primary-container/40 bg-surface-container-low/30"
                    : "shadow-sm hover:shadow-md border-outline-variant/25 hover:bg-surface-container-low/50"
                }`}
              >
                {isSelected && (
                  <div className="absolute left-0 top-3 bottom-3 w-1.5 bg-primary-container rounded-r-md"></div>
                )}

                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {logoSrc ? (
                      <img
                        src={logoSrc}
                        alt={job.companyName}
                        className="w-10 h-10 rounded-lg object-contain bg-white p-1 border border-outline-variant/30 shrink-0"
                      />
                    ) : (
                      <div
                        className={`w-10 h-10 rounded-lg font-headline-sm text-headline-sm flex items-center justify-center font-bold shadow-sm shrink-0 ${getAvatarBadgeStyle(
                          job.companyBadgeColor
                        )}`}
                      >
                        {job.companyInitials || "ACL"}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (companyObj) onOpenCompanyModal(companyObj);
                          }}
                          className="font-body-md text-[13px] font-semibold text-on-surface hover:text-primary truncate transition-colors"
                        >
                          {job.companyName}
                        </button>
                        <span
                          className="material-symbols-outlined text-secondary text-[16px] shrink-0"
                          title="Verified Enterprise Employer"
                        >
                          verified
                        </span>
                      </div>
                      <span className="font-mono-label text-mono-label text-outline uppercase tracking-wider block">
                        #{job.jobId}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded font-mono-label text-[11px] font-bold uppercase shrink-0 ${
                      job.workMode === "Remote"
                        ? "bg-secondary-container text-on-secondary-container"
                        : "bg-surface-container text-on-surface-variant"
                    }`}
                  >
                    {job.workMode}
                  </span>
                </div>

                <h2 className="mt-3 font-headline-md text-headline-md text-on-surface font-bold group-hover:text-primary transition-colors">
                  {job.title}
                </h2>

                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-mono-data text-mono-data font-semibold">
                    {formatSalaryBand(job.salaryMin, job.salaryMax, currency)}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-body-sm text-body-sm">
                    {job.jobType}
                  </span>
                  <span className="text-on-surface-variant font-body-sm text-body-sm flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-outline">
                      pin_drop
                    </span>
                    {job.location}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(job.skills || []).slice(0, 4).map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface font-body-sm text-[11px]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-outline-variant/15 flex flex-wrap items-center justify-between gap-2 text-outline font-mono-label text-mono-label">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span>{formatTimeAgo(job.createdAt)}</span>
                    <span>•</span>
                    <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant text-[10px]">
                      Expires:{" "}
                      {new Date(
                        job.expiresAt || Date.now() + 30 * 86400 * 1000
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <span className="flex items-center gap-1 text-secondary font-semibold">
                    <span className="material-symbols-outlined text-[14px]">
                      group
                    </span>
                    {job.applicantsCount ?? 0}{" "}
                    {job.applicantsCount === 1 ? "Applicant" : "Applicants"}
                  </span>
                </div>
              </article>
            );
          })}

          {/* Pagination Footer */}
          <div className="mt-1 flex items-center justify-between p-4 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/25">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => onPageChange(Math.max(1, safePage - 1))}
              className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface disabled:text-outline disabled:cursor-not-allowed font-body-sm text-body-sm hover:bg-surface-container-high transition-colors"
            >
              Previous
            </button>

            <div className="flex items-center gap-1 font-mono-label text-mono-label">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => onPageChange(num)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    safePage === num
                      ? "bg-primary-container text-on-primary font-bold"
                      : "hover:bg-surface-container text-on-surface"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>

            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => onPageChange(Math.min(totalPages, safePage + 1))}
              className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface disabled:text-outline disabled:cursor-not-allowed font-body-sm text-body-sm hover:bg-surface-container-high transition-colors"
            >
              Next
            </button>
          </div>
        </div>

        {/* RIGHT 7 COLUMNS: Sticky Reading Dossier (Desktop) */}
        <div className="hidden lg:flex lg:col-span-7 flex-col gap-6 lg:sticky lg:top-24">
          {renderReadingDossier(false)}
        </div>
      </div>
    </>
  );
}