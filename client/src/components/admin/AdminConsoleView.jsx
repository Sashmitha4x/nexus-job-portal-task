import React, { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { formatSalaryBand } from "../../constants/nexusConstants.js";
import NexusExportMenu from "../ui/NexusExportMenu.jsx";

const ADMIN_MODERATION_REASONS = [
  "Salary band or compensation details require clarification to meet transparency rules.",
  "Job description is missing mandatory technical stack or role deliverables.",
  "External redirect or unverified contact link detected in role overview.",
  "Duplicate requisition or misclassified work mode (Remote vs On-Site).",
];

export default function AdminConsoleView({
  user,
  jobs = [],
  companies = [],
  applications = [],
  platformUsers = [],
  auditLogs = [],
  currency = "USD",
  latencyMs = 16,
  onModerateJob,
  onToggleUserStatus,
  onInspectJobOnBoard,
  onUpdateProfile,
  onUpdatePassword,
  onExportPDF,
  onExportExcel,
  onExportCSV,
  onShowToast,
}) {
  // Top Horizontal Admin Section Tabs: "overview" | "jobs" | "users" | "audit" | "settings"
  const [adminTab, setAdminTab] = useState("overview");

  // Panel A: Job Listings Moderation Filters & Target Selection
  const [jobSearch, setJobSearch] = useState("");
  const [jobStatusFilter, setJobStatusFilter] = useState("ALL"); // "ALL" | "Active" | "Pending Review" | "Hidden" | "Paused" | "Removed"
  const [targetJobForModeration, setTargetJobForModeration] = useState(
    () => jobs[0] || null
  );
  const [moderationMode, setModerationMode] = useState("Hidden"); // "Hidden" | "Removed"
  const [selectedReasonPreset, setSelectedReasonPreset] = useState(
    ADMIN_MODERATION_REASONS[0]
  );
  const [customModerationReason, setCustomModerationReason] = useState("");
  const [isModerating, setIsModerating] = useState(false);

  // Panel B: User & Employer Directory Filters & Pagination
  const [accountRoleFilter, setAccountRoleFilter] = useState("ALL"); // "ALL" | "seeker" | "employer" | "Suspended"
  const [accountSearch, setAccountSearch] = useState("");
  const [userPage, setUserPage] = useState(1);
  const [inspectedUser, setInspectedUser] = useState(null);
  const [userToSuspend, setUserToSuspend] = useState(null);
  const [suspendReason, setSuspendReason] = useState(
    "Violation of Auspify Nexus KYC / platform authenticity policy."
  );

  // Admin Profile & Password Settings State
  const [adminName, setAdminName] = useState(user?.name || "Sashmitha N.");
  const [adminHeadline, setAdminHeadline] = useState(
    user?.headline || "Platform Administrator • Superuser #001"
  );
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Compute KPI Metrics
  const seekersCount = useMemo(
    () => platformUsers.filter((u) => u.role === "seeker").length,
    [platformUsers]
  );
  const employersCount = useMemo(() => {
    const empUsers = platformUsers.filter((u) => u.role === "employer").length;
    return Math.max(empUsers, companies.length);
  }, [platformUsers, companies]);

  const activeJobsCount = useMemo(
    () => jobs.filter((j) => j.status === "Active").length,
    [jobs]
  );
  const pendingReviewJobsCount = useMemo(
    () => jobs.filter((j) => j.status === "Pending Review").length,
    [jobs]
  );
  const hiddenJobsCount = useMemo(
    () => jobs.filter((j) => j.status === "Hidden").length,
    [jobs]
  );
  const pausedJobsCount = useMemo(
    () =>
      jobs.filter((j) => j.status === "Paused" || j.status === "Closed").length,
    [jobs]
  );
  const removedJobsCount = useMemo(
    () => jobs.filter((j) => j.status === "Removed").length,
    [jobs]
  );

  const offersCount = useMemo(
    () => applications.filter((a) => a.status === "Offer Extended").length,
    [applications]
  );
  const activePipelineCount = useMemo(
    () =>
      applications.filter(
        (a) =>
          a.status === "Applied" ||
          a.status === "Under Review" ||
          a.status === "Interview Scheduled"
      ).length,
    [applications]
  );

  // Filtered Jobs for Moderation Console
  const filteredJobs = useMemo(() => {
    const q = jobSearch.toLowerCase().trim();
    return jobs.filter((j) => {
      if (jobStatusFilter !== "ALL" && j.status !== jobStatusFilter)
        return false;
      if (!q) return true;
      return (
        j.jobId.toLowerCase().includes(q) ||
        j.title.toLowerCase().includes(q) ||
        j.companyName.toLowerCase().includes(q) ||
        (j.category && j.category.toLowerCase().includes(q))
      );
    });
  }, [jobs, jobSearch, jobStatusFilter]);

  // Enrich Users with Platform Activity Counts (Excludes Admin)
  const enrichedAccounts = useMemo(() => {
    const q = accountSearch.toLowerCase().trim();
    return platformUsers
      .filter((u) => u.role !== "admin")
      .map((u) => {
        if (u.role === "employer") {
          const postedJobs = jobs.filter(
            (j) =>
              (j.employerEmail &&
                j.employerEmail.toLowerCase() === u.email.toLowerCase()) ||
              (u.companyName &&
                j.companyName.toLowerCase() === u.companyName.toLowerCase())
          );
          const candidateReviews = applications.filter(
            (a) =>
              a.employerEmail &&
              a.employerEmail.toLowerCase() === u.email.toLowerCase()
          ).length;
          return {
            ...u,
            primaryMetric: `${postedJobs.length} Jobs Posted`,
            secondaryMetric:
              u.status === "Suspended"
                ? "Auto-quarantined on ingress"
                : `${candidateReviews || 2} Active Candidate Reviews`,
          };
        }

        const userApps = applications.filter(
          (a) =>
            a.candidateEmail &&
            a.candidateEmail.toLowerCase() === u.email.toLowerCase()
        );
        const offers = userApps.filter(
          (a) => a.status === "Offer Extended"
        ).length;
        const interviews = userApps.filter(
          (a) => a.status === "Interview Scheduled"
        ).length;
        return {
          ...u,
          primaryMetric: `${userApps.length || 1} Applications`,
          secondaryMetric: `${offers} Offer, ${interviews} Interview active`,
        };
      })
      .filter((u) => {
        if (accountRoleFilter === "Suspended") {
          if (u.status !== "Suspended") return false;
        } else if (
          accountRoleFilter !== "ALL" &&
          u.role !== accountRoleFilter
        ) {
          return false;
        }
        if (!q) return true;
        return (
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.companyName && u.companyName.toLowerCase().includes(q))
        );
      });
  }, [platformUsers, jobs, applications, accountRoleFilter, accountSearch]);

  const userPageSize = 6;
  const totalUserPages = Math.max(
    1,
    Math.ceil(enrichedAccounts.length / userPageSize)
  );
  const safeUserPage = Math.min(userPage, totalUserPages);
  const paginatedUsers = enrichedAccounts.slice(
    (safeUserPage - 1) * userPageSize,
    safeUserPage * userPageSize
  );

  const handleTriggerJobModeration = (job, actionType = "Hidden") => {
    setTargetJobForModeration(job);
    setModerationMode(actionType);
    setSelectedReasonPreset(ADMIN_MODERATION_REASONS[0]);
    setCustomModerationReason("");
    document
      .getElementById("admin-moderation-protocol-card")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleConfirmModerationSubmit = async (e) => {
    e.preventDefault();
    if (!targetJobForModeration) return;
    const finalReason =
      selectedReasonPreset === "CUSTOM"
        ? customModerationReason.trim()
        : selectedReasonPreset;

    if (!finalReason) {
      onShowToast(
        "Reason Required",
        "Please select or enter a reason so the company knows what to fix.",
        true
      );
      return;
    }

    setIsModerating(true);
    const ok = await onModerateJob(
      targetJobForModeration.jobId,
      moderationMode,
      finalReason
    );
    setIsModerating(false);
    if (ok) {
      setCustomModerationReason("");
    }
  };

  const handleAdminPasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      onShowToast(
        "Password Mismatch",
        "New password and confirmation do not match.",
        true
      );
      return;
    }
    const ok = await onUpdatePassword(currentPassword, newPassword);
    if (ok) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const getEventBadgeStyle = (action = "") => {
    if (
      action.includes("SUSPENDED") ||
      action.includes("REMOVED") ||
      action.includes("HIDDEN")
    ) {
      return "bg-error-container text-on-error-container";
    }
    if (
      action.includes("APPROVED") ||
      action.includes("VERIFIED") ||
      action.includes("REACTIVATED") ||
      action.includes("UNHIDDEN")
    ) {
      return "bg-secondary-fixed text-on-secondary-fixed";
    }
    return "bg-primary-fixed text-primary";
  };

  return (
    <>
      {/* =====================================================================
          MODAL 1: INSPECT USER / EMPLOYER DOSSIER MODAL
         ===================================================================== */}
      {inspectedUser &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-[100] bg-on-surface/50 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setInspectedUser(null)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-outline-variant/40 flex flex-col gap-4 animate-pop-in"
            >
              <div className="flex items-start justify-between gap-3 border-b border-surface-container pb-3">
                <div>
                  <span className="font-mono-label text-[10px] px-2 py-0.5 rounded bg-primary-fixed text-primary uppercase font-bold">
                    {inspectedUser.role === "employer"
                      ? "EMPLOYER ORGANIZATION"
                      : "CANDIDATE DOSSIER"}
                  </span>
                  <h3 className="font-headline-lg font-bold text-on-surface mt-1">
                    {inspectedUser.companyName || inspectedUser.name}
                  </h3>
                  <span className="font-mono-data text-xs text-on-surface-variant">
                    {inspectedUser.email}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setInspectedUser(null)}
                  className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    close
                  </span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-body-sm">
                <div className="p-3 rounded-xl bg-surface-container-low">
                  <span className="font-mono-label text-[10px] text-outline uppercase block">
                    Contact Person
                  </span>
                  <span className="font-headline-sm font-semibold text-on-surface mt-0.5 block">
                    {inspectedUser.name}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-surface-container-low">
                  <span className="font-mono-label text-[10px] text-outline uppercase block">
                    Account Status
                  </span>
                  <span
                    className={`font-mono-label text-xs font-bold mt-0.5 inline-block ${
                      inspectedUser.status === "Suspended"
                        ? "text-error"
                        : "text-secondary"
                    }`}
                  >
                    {inspectedUser.status || "Active"}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-surface-container-low">
                  <span className="font-mono-label text-[10px] text-outline uppercase block">
                    Location
                  </span>
                  <span className="font-body-sm text-on-surface mt-0.5 block">
                    {inspectedUser.location || "Colombo / Remote"}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-surface-container-low">
                  <span className="font-mono-label text-[10px] text-outline uppercase block">
                    Platform Activity
                  </span>
                  <span className="font-mono-data text-xs font-bold text-primary mt-0.5 block">
                    {inspectedUser.primaryMetric}
                  </span>
                </div>
              </div>

              {inspectedUser.skills?.length > 0 && (
                <div>
                  <span className="font-mono-label text-[10px] text-outline uppercase block mb-1.5">
                    Verified Technical Stack
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {inspectedUser.skills.map((sk) => (
                      <span
                        key={sk}
                        className="px-2.5 py-0.5 rounded bg-surface-container font-mono-data text-xs text-on-surface"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setInspectedUser(null)}
                  className="px-4 py-2 rounded-xl bg-surface-container text-on-surface font-headline-sm text-xs"
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* =====================================================================
          MODAL 2: SUSPEND / REACTIVATE ACCOUNT CONFIRMATION MODAL
         ===================================================================== */}
      {userToSuspend &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-[100] bg-on-surface/50 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setUserToSuspend(null)}
          >
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const nextStatus =
                  userToSuspend.status === "Suspended" ? "Active" : "Suspended";
                await onToggleUserStatus(
                  userToSuspend.id,
                  nextStatus,
                  suspendReason.trim()
                );
                setUserToSuspend(null);
              }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl border border-outline-variant/40 flex flex-col gap-4 animate-pop-in"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    userToSuspend.status === "Suspended"
                      ? "bg-secondary-fixed text-secondary"
                      : "bg-error-container text-error"
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {userToSuspend.status === "Suspended"
                      ? "verified_user"
                      : "block"}
                  </span>
                </div>
                <div>
                  <h3 className="font-headline-md font-bold text-on-surface">
                    {userToSuspend.status === "Suspended"
                      ? `Reactivate ${userToSuspend.name}?`
                      : `Suspend ${userToSuspend.name}?`}
                  </h3>
                  <p className="font-body-sm text-on-surface-variant mt-0.5">
                    {userToSuspend.status === "Suspended"
                      ? "Restoring access will allow this user to sign in and interact with the portal."
                      : "Suspending immediately blocks backend access, revokes active JWT sessions, and logs an immutable audit event."}
                  </p>
                </div>
              </div>

              <div>
                <label className="font-mono-label text-[11px] uppercase text-on-surface-variant block mb-1">
                  Audit Log Reason (Required)
                </label>
                <textarea
                  rows="3"
                  required
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  className="w-full p-3 rounded-xl bg-surface-container-low text-body-sm text-on-surface focus:outline-none border border-outline-variant/30 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUserToSuspend(null)}
                  className="px-4 py-2 rounded-xl bg-surface-container text-on-surface font-headline-sm text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-xl font-headline-sm text-xs font-semibold shadow-sm ${
                    userToSuspend.status === "Suspended"
                      ? "bg-secondary text-on-secondary"
                      : "bg-error text-on-error"
                  }`}
                >
                  {userToSuspend.status === "Suspended"
                    ? "Confirm Reactivation"
                    : "Confirm Suspension"}
                </button>
              </div>
            </form>
          </div>,
          document.body
        )}

      <div className="w-full flex flex-col gap-6 animate-fade-up">
        {/* ===================================================================
            DASHBOARD SUB-HEADER / CONTEXT ROW
           =================================================================== */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-surface-container">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="font-headline-xl text-2xl sm:text-headline-xl text-on-surface tracking-tight font-bold">
                Admin Oversight &amp; Governance
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-mono-label text-mono-label">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                ROOT SESSION
              </span>
              {pendingReviewJobsCount > 0 && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-mono-label text-[10px] font-bold">
                  🔔 {pendingReviewJobsCount} Employer Resolution Pending
                  Approval
                </span>
              )}
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Real-time candidate telemetry, job hide/unhide compliance
              workflow, and immutable SHA-256 audit trails.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <NexusExportMenu
              label="Export Platform Ledger"
              onExportCSV={onExportCSV}
              onExportExcel={onExportExcel}
              onExportPDF={onExportPDF}
            />
          </div>
        </div>

        {/* ===================================================================
            HORIZONTAL ADMIN SECTION TABS
           =================================================================== */}
        <div className="w-full flex items-center justify-between border-b border-surface-container overflow-x-auto no-scrollbar pb-1 gap-4">
          <nav className="flex items-center gap-1.5 whitespace-nowrap">
            {[
              {
                id: "overview",
                icon: "📊",
                label: "Platform Overview & KPIs",
              },
              {
                id: "jobs",
                icon: "💼",
                label: "All Job Listings Moderation",
                badge: jobs.length,
              },
              {
                id: "users",
                icon: "👥",
                label: "User & Employer Management",
                badge: enrichedAccounts.length,
              },
              {
                id: "audit",
                icon: "🛡️",
                label: "Admin Audit Trail & Logs",
                badge: auditLogs.length,
              },
              {
                id: "settings",
                icon: "⚙️",
                label: "Admin Security Settings",
              },
            ].map((t) => {
              const active = adminTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setAdminTab(t.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2.5 border-b-2 font-headline-sm text-xs sm:text-headline-sm transition-colors ${
                    active
                      ? "border-primary text-primary font-bold"
                      : "border-transparent text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  <span>{t.icon}</span>
                  <span>{t.label}</span>
                  {t.badge !== undefined && (
                    <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface font-mono-label text-[10px]">
                      {t.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="hidden lg:flex items-center gap-2 text-on-surface-variant font-mono-label text-mono-label shrink-0">
            <span className="material-symbols-outlined text-[14px] text-secondary">
              update
            </span>
            <span>
              SYNC CYCLE:{" "}
              <strong className="text-on-surface">{latencyMs}ms</strong>
            </span>
          </div>
        </div>

        {/* ===================================================================
            5-CARD BENTO PLATFORM KPI ROW
           =================================================================== */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-4 bg-surface-container-lowest rounded-xl border border-surface-container shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="font-mono-label text-[11px] uppercase text-on-surface-variant font-semibold tracking-wider">
                Total Job Seekers
              </span>
              <div className="w-7 h-7 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[16px]">
                  person_search
                </span>
              </div>
            </div>
            <div className="my-2">
              <div className="font-headline-xl text-[28px] font-bold text-on-surface tracking-tight leading-none">
                {seekersCount}
              </div>
              <div className="font-body-sm text-[12px] text-on-surface-variant mt-1">
                Registered Candidates
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-secondary-fixed/50 w-fit font-mono-label text-[11px] text-secondary font-semibold">
              <span className="material-symbols-outlined text-[13px]">
                trending_up
              </span>
              <span>Verified Dossiers</span>
            </div>
          </div>

          <div className="p-4 bg-surface-container-lowest rounded-xl border border-surface-container shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="font-mono-label text-[11px] uppercase text-on-surface-variant font-semibold tracking-wider">
                Verified Employers
              </span>
              <div className="w-7 h-7 rounded-lg bg-secondary-fixed flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[16px]">
                  corporate_fare
                </span>
              </div>
            </div>
            <div className="my-2">
              <div className="font-headline-xl text-[28px] font-bold text-on-surface tracking-tight leading-none">
                {employersCount}
              </div>
              <div className="font-body-sm text-[12px] text-on-surface-variant mt-1">
                Active Tech Companies
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-secondary-fixed/50 w-fit font-mono-label text-[11px] text-secondary font-semibold">
              <span className="material-symbols-outlined text-[13px]">
                verified
              </span>
              <span>100% Tier-1 Vetted</span>
            </div>
          </div>

          <div className="p-4 bg-surface-container-lowest rounded-xl border border-surface-container shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="font-mono-label text-[11px] uppercase text-on-surface-variant font-semibold tracking-wider">
                Active Job Listings
              </span>
              <div className="w-7 h-7 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface">
                <span className="material-symbols-outlined text-[16px]">
                  work
                </span>
              </div>
            </div>
            <div className="my-2">
              <div className="font-headline-xl text-[28px] font-bold text-on-surface tracking-tight leading-none">
                {activeJobsCount}
              </div>
              <div className="font-body-sm text-[12px] text-on-surface-variant mt-1">
                Open • {hiddenJobsCount} Hidden • {removedJobsCount} Removed
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-surface-container w-fit font-mono-label text-[11px] text-on-surface-variant font-semibold">
              <span className="material-symbols-outlined text-[13px]">
                layers
              </span>
              <span>{jobs.length} Total Requisitions</span>
            </div>
          </div>

          <div className="p-4 bg-surface-container-lowest rounded-xl border border-surface-container shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="font-mono-label text-[11px] uppercase text-on-surface-variant font-semibold tracking-wider">
                Total Applications
              </span>
              <div className="w-7 h-7 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[16px]">
                  assignment_turned_in
                </span>
              </div>
            </div>
            <div className="my-2">
              <div className="font-headline-xl text-[28px] font-bold text-on-surface tracking-tight leading-none">
                {applications.length}
              </div>
              <div className="font-body-sm text-[12px] text-on-surface-variant mt-1">
                Submitted • {offersCount} Offers
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-primary-fixed/50 w-fit font-mono-label text-[11px] text-primary font-semibold">
              <span className="material-symbols-outlined text-[13px]">hub</span>
              <span>{activePipelineCount} Active in Pipeline</span>
            </div>
          </div>

          <div className="p-4 bg-surface-container-lowest rounded-xl border border-surface-container shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="font-mono-label text-[11px] uppercase text-on-surface-variant font-semibold tracking-wider">
                Moderation Queue
              </span>
              <div className="w-7 h-7 rounded-lg bg-secondary-fixed flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[16px]">
                  verified_user
                </span>
              </div>
            </div>
            <div className="my-2">
              <div className="font-headline-xl text-[28px] font-bold text-secondary tracking-tight leading-none">
                {pendingReviewJobsCount > 0
                  ? `${pendingReviewJobsCount} Ready`
                  : "100%"}
              </div>
              <div className="font-body-sm text-[12px] text-on-surface-variant mt-1">
                {pendingReviewJobsCount > 0
                  ? "Awaiting Admin Approval"
                  : "Policy Compliant"}
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-secondary-fixed/50 w-fit font-mono-label text-[11px] text-secondary font-semibold">
              <span className="material-symbols-outlined text-[13px]">
                check_circle
              </span>
              <span>
                {hiddenJobsCount} Hidden • {pendingReviewJobsCount} Resolved
              </span>
            </div>
          </div>
        </section>

        {/* ===================================================================
            PANEL A: JOB LISTINGS MODERATION CONSOLE & HIDE/REMOVE PROTOCOL
           =================================================================== */}
        {(adminTab === "overview" || adminTab === "jobs") && (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT 8 COLS: Job Listings Moderation Table */}
            <div className="lg:col-span-8 flex flex-col gap-4 bg-surface-container-lowest p-5 rounded-2xl border border-surface-container shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-surface-container">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">
                    Job Listings Moderation Console
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-primary font-mono-label text-[11px] font-semibold">
                    {jobs.length} Total Requisitions
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                  <span className="text-on-surface-variant font-mono-label text-[11px] font-semibold tracking-wider uppercase">
                    HIDE • RESOLVE • APPROVE WORKFLOW
                  </span>
                </div>
              </div>

              {/* Filter Controls Bar */}
              <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                <div className="relative flex-1">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-outline">
                    search
                  </span>
                  <input
                    type="text"
                    value={jobSearch}
                    onChange={(e) => setJobSearch(e.target.value)}
                    placeholder="Filter by #JOB ID, title, or employer..."
                    className="w-full pl-9 pr-4 py-2 bg-surface border border-surface-container rounded-xl text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-all"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
                  {[
                    { id: "ALL", label: `All (${jobs.length})` },
                    { id: "Active", label: `Active (${activeJobsCount})` },
                    {
                      id: "Pending Review",
                      label: `🔔 Pending Approval (${pendingReviewJobsCount})`,
                    },
                    { id: "Hidden", label: `Hidden (${hiddenJobsCount})` },
                    { id: "Paused", label: `Paused (${pausedJobsCount})` },
                    { id: "Removed", label: `Removed (${removedJobsCount})` },
                  ].map((pill) => (
                    <button
                      key={pill.id}
                      type="button"
                      onClick={() => setJobStatusFilter(pill.id)}
                      className={`px-3 py-1.5 rounded-lg font-mono-label text-[11px] font-semibold transition-colors whitespace-nowrap ${
                        jobStatusFilter === pill.id
                          ? "bg-primary text-on-primary shadow-sm"
                          : "bg-surface hover:bg-surface-container text-on-surface border border-surface-container"
                      }`}
                    >
                      {pill.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Desktop Moderation Table (Locked Column Proportions — Never Shifts or Squishes!) */}
              <div className="hidden md:block w-full overflow-x-auto border border-surface-container rounded-xl">
                <table className="w-full table-fixed text-left border-collapse min-w-[720px]">
                  <thead>
                    <tr className="bg-surface border-b border-surface-container font-mono-label text-[11px] uppercase tracking-wider text-on-surface-variant">
                      <th className="py-3 px-3.5 w-[14%]">JOB ID</th>
                      <th className="py-3 px-3.5 w-[35%]">
                        Role Title &amp; Moderation Note
                      </th>
                      <th className="py-3 px-3.5 w-[18%]">Employer</th>
                      <th className="py-3 px-3.5 w-[14%]">Status</th>
                      <th className="py-3 px-3.5 w-[19%] text-right">
                        Admin Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container font-body-sm text-body-sm text-on-surface">
                    {filteredJobs.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-8 text-center text-on-surface-variant font-body-sm"
                        >
                          No job requisitions match the selected status filter.
                        </td>
                      </tr>
                    ) : (
                      filteredJobs.map((job) => {
                        const isRemoved = job.status === "Removed";
                        const isHidden = job.status === "Hidden";
                        const isPendingReview = job.status === "Pending Review";
                        const isActive = job.status === "Active";

                        return (
                          <tr
                            key={job.jobId}
                            className={`hover:bg-surface/80 transition-colors align-top ${
                              targetJobForModeration?.jobId === job.jobId
                                ? "bg-primary-fixed/15"
                                : isPendingReview
                                ? "bg-amber-50/70"
                                : ""
                            }`}
                          >
                            {/* Col 1: Job ID */}
                            <td className="py-3.5 px-3.5 font-mono-data text-primary font-semibold whitespace-nowrap">
                              #{job.jobId}
                            </td>

                            {/* Col 2: Role Title & Compact Reason Callout (35% Width — Never Squished!) */}
                            <td className="py-3.5 px-3.5">
                              <div
                                className={`font-headline-sm font-semibold leading-snug ${
                                  isRemoved
                                    ? "line-through text-on-surface-variant"
                                    : "text-on-surface"
                                }`}
                              >
                                {job.title}
                              </div>
                              <div className="text-on-surface-variant text-[11px] mt-0.5 truncate">
                                {job.category} •{" "}
                                {formatSalaryBand(
                                  job.salaryMin,
                                  job.salaryMax,
                                  currency,
                                  true
                                )}
                              </div>

                              {(isHidden || isRemoved) && job.removalReason && (
                                <div
                                  title={job.removalReason}
                                  className="mt-1.5 px-2.5 py-1 rounded-lg bg-error-container/45 border border-error/20 text-[11px] text-on-error-container font-medium leading-snug line-clamp-2"
                                >
                                  <strong className="font-semibold">
                                    Reason:
                                  </strong>{" "}
                                  &ldquo;{job.removalReason}&rdquo;
                                </div>
                              )}

                              {isPendingReview && (
                                <div className="mt-1.5 px-2.5 py-1 rounded-lg bg-amber-100/90 border border-amber-300 text-[11px] text-amber-900 font-medium leading-snug line-clamp-2">
                                  <strong>✓ Employer Resolved:</strong>{" "}
                                  {job.employerResolutionNote ||
                                    "Updated listing per Admin feedback; ready to unhide."}
                                </div>
                              )}
                            </td>

                            {/* Col 3: Employer */}
                            <td className="py-3.5 px-3.5">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="w-6 h-6 rounded-md bg-primary-fixed text-primary flex items-center justify-center font-mono-label text-[10px] font-bold shrink-0">
                                  {job.companyInitials || "ACL"}
                                </span>
                                <span className="font-medium text-on-surface truncate">
                                  {job.companyName}
                                </span>
                              </div>
                            </td>

                            {/* Col 4: Status */}
                            <td className="py-3.5 px-3.5 whitespace-nowrap">
                              {isActive ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-mono-label text-[10px] font-semibold">
                                  <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                                  Active
                                </span>
                              ) : isPendingReview ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-mono-label text-[10px] font-bold">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping"></span>
                                  Pending Approval
                                </span>
                              ) : isHidden ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-mono-label text-[10px] font-semibold">
                                  Hidden (Needs Fix)
                                </span>
                              ) : isRemoved ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-error-container text-on-error-container font-mono-label text-[10px] font-semibold">
                                  Removed
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-highest text-on-surface font-mono-label text-[10px] font-semibold">
                                  {job.status}
                                </span>
                              )}
                            </td>

                            {/* Col 5: Admin Actions (Compact & Consistent Width) */}
                            <td className="py-3.5 px-3.5 text-right">
                              <div className="inline-flex flex-wrap items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => onInspectJobOnBoard(job)}
                                  className="px-2.5 py-1 bg-surface-container-lowest border border-surface-container rounded-lg font-headline-sm text-[11px] text-on-surface hover:bg-surface-container transition-colors"
                                >
                                  Inspect
                                </button>

                                {(isPendingReview ||
                                  isHidden ||
                                  isRemoved) && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      onModerateJob(
                                        job.jobId,
                                        "Active",
                                        "Employer resolution approved by Admin; job unhidden and restored to live portal."
                                      )
                                    }
                                    className="px-2.5 py-1 bg-secondary text-on-secondary rounded-lg font-headline-sm text-[11px] font-semibold hover:opacity-90 transition-opacity shadow-xs whitespace-nowrap"
                                  >
                                    {isPendingReview
                                      ? "Approve & Unhide"
                                      : "Unhide"}
                                  </button>
                                )}

                                {!isHidden && !isRemoved && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleTriggerJobModeration(job, "Hidden")
                                    }
                                    className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg font-headline-sm text-[11px] font-semibold transition-colors whitespace-nowrap"
                                  >
                                    Hide
                                  </button>
                                )}

                                {!isRemoved && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleTriggerJobModeration(job, "Removed")
                                    }
                                    className="px-2.5 py-1 bg-error-container text-on-error-container rounded-lg font-headline-sm text-[11px] font-semibold hover:bg-error hover:text-on-error transition-colors whitespace-nowrap"
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Job Moderation Cards (<768px) */}
              <div className="md:hidden flex flex-col gap-3">
                {filteredJobs.map((job) => {
                  const isRemoved = job.status === "Removed";
                  const isHidden = job.status === "Hidden";
                  const isPendingReview = job.status === "Pending Review";
                  return (
                    <div
                      key={job.jobId}
                      className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container flex flex-col gap-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono-data text-xs font-bold text-primary">
                          #{job.jobId} • {job.companyName}
                        </span>
                        <span className="px-2 py-0.5 rounded-full font-mono-label text-[10px] font-bold bg-surface-container text-on-surface">
                          {job.status}
                        </span>
                      </div>
                      <h4 className="font-headline-sm font-bold text-on-surface">
                        {job.title}
                      </h4>
                      {(isHidden || isRemoved) && job.removalReason && (
                        <div className="text-xs text-on-error-container bg-error-container/50 p-2 rounded-lg">
                          <strong>Reason:</strong> &ldquo;{job.removalReason}
                          &rdquo;
                        </div>
                      )}
                      {isPendingReview && (
                        <div className="text-xs text-amber-900 bg-amber-100 p-2 rounded-lg">
                          <strong>Employer Resolved:</strong>{" "}
                          {job.employerResolutionNote ||
                            "Ready for Admin approval to unhide."}
                        </div>
                      )}
                      <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-surface-container">
                        {(isPendingReview || isHidden || isRemoved) && (
                          <button
                            type="button"
                            onClick={() =>
                              onModerateJob(
                                job.jobId,
                                "Active",
                                "Approved and unhidden by Admin."
                              )
                            }
                            className="px-3 py-1 rounded-lg bg-secondary text-white font-headline-sm text-xs"
                          >
                            {isPendingReview ? "Approve & Unhide" : "Unhide"}
                          </button>
                        )}
                        {!isHidden && !isRemoved && (
                          <button
                            type="button"
                            onClick={() =>
                              handleTriggerJobModeration(job, "Hidden")
                            }
                            className="px-3 py-1 rounded-lg bg-amber-100 text-amber-900 font-headline-sm text-xs font-semibold"
                          >
                            Hide Post
                          </button>
                        )}
                        {!isRemoved && (
                          <button
                            type="button"
                            onClick={() =>
                              handleTriggerJobModeration(job, "Removed")
                            }
                            className="px-3 py-1 rounded-lg bg-error-container text-on-error-container font-headline-sm text-xs font-semibold"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT 4 COLS: HIDE / REMOVE MODERATION PROTOCOL CONSOLE WITH REASON SELECTION */}
            <form
              id="admin-moderation-protocol-card"
              onSubmit={handleConfirmModerationSubmit}
              className={`lg:col-span-4 flex flex-col justify-between bg-surface-container-lowest p-5 rounded-2xl border shadow-sm relative overflow-hidden ${
                moderationMode === "Hidden"
                  ? "border-amber-400/60"
                  : "border-error/30"
              }`}
            >
              <div
                className={`absolute top-0 left-0 right-0 h-1 ${
                  moderationMode === "Hidden" ? "bg-amber-500" : "bg-error"
                }`}
              ></div>

              <div className="flex flex-col gap-3">
                {/* Action Mode Switcher: Hide vs Delete/Remove */}
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-surface-container-low rounded-xl">
                  <button
                    type="button"
                    onClick={() => setModerationMode("Hidden")}
                    className={`py-1.5 px-2 rounded-lg font-mono-label text-[11px] font-bold transition-all ${
                      moderationMode === "Hidden"
                        ? "bg-amber-500 text-white shadow-xs"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    👁️ Hide Post (Fixable)
                  </button>
                  <button
                    type="button"
                    onClick={() => setModerationMode("Removed")}
                    className={`py-1.5 px-2 rounded-lg font-mono-label text-[11px] font-bold transition-all ${
                      moderationMode === "Removed"
                        ? "bg-error text-white shadow-xs"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    🗑️ Delete / Remove Post
                  </button>
                </div>

                <h3 className="font-headline-md text-headline-md text-on-surface font-bold leading-snug">
                  {moderationMode === "Hidden"
                    ? "Hide Job & Request Employer Changes"
                    : "Delete Policy-Violating Job Listing"}
                </h3>

                {/* Target Job Box */}
                <div className="p-3 bg-surface-container-low rounded-xl border border-surface-container">
                  <div className="font-mono-label text-[10px] uppercase text-on-surface-variant font-semibold">
                    Target Requisition:
                  </div>
                  <div className="font-mono-data text-xs text-on-surface font-bold break-words mt-0.5">
                    #{targetJobForModeration?.jobId || "JOB-2026-001"} •{" "}
                    {targetJobForModeration?.title || "Select a Job"}
                  </div>
                  <div className="text-[11px] text-primary font-medium mt-1">
                    Company:{" "}
                    {targetJobForModeration?.companyName || "Employer"} (
                    Current Status:{" "}
                    {targetJobForModeration?.status || "Active"})
                  </div>
                </div>

                {/* Preset Reason Selector */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono-label text-[11px] uppercase text-on-surface-variant font-semibold">
                    Select Reason Sent to Company
                  </label>

                  <div className="space-y-1.5">
                    {ADMIN_MODERATION_REASONS.map((preset, idx) => (
                      <label
                        key={idx}
                        className={`flex items-start gap-2 p-2.5 rounded-xl border cursor-pointer text-xs transition-all ${
                          selectedReasonPreset === preset
                            ? "bg-surface-container-low border-primary-container font-medium text-on-surface"
                            : "border-surface-container text-on-surface-variant hover:bg-surface"
                        }`}
                      >
                        <input
                          type="radio"
                          name="adminModReason"
                          checked={selectedReasonPreset === preset}
                          onChange={() => setSelectedReasonPreset(preset)}
                          className="mt-0.5 accent-primary shrink-0"
                        />
                        <span>{preset}</span>
                      </label>
                    ))}

                    <label
                      className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer text-xs transition-all ${
                        selectedReasonPreset === "CUSTOM"
                          ? "bg-surface-container-low border-primary-container font-medium text-on-surface"
                          : "border-surface-container text-on-surface-variant hover:bg-surface"
                      }`}
                    >
                      <input
                        type="radio"
                        name="adminModReason"
                        checked={selectedReasonPreset === "CUSTOM"}
                        onChange={() => setSelectedReasonPreset("CUSTOM")}
                        className="accent-primary shrink-0"
                      />
                      <span>Write custom reason for the company...</span>
                    </label>

                    {selectedReasonPreset === "CUSTOM" && (
                      <textarea
                        rows="2"
                        required
                        value={customModerationReason}
                        onChange={(e) =>
                          setCustomModerationReason(e.target.value)
                        }
                        placeholder="Describe what the company needs to fix..."
                        className="w-full p-2.5 bg-surface border border-primary-container rounded-xl text-body-sm text-on-surface focus:outline-none resize-none"
                      />
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-2 p-2.5 bg-surface-container-low rounded-xl text-on-surface-variant text-body-sm">
                  <span className="material-symbols-outlined text-[16px] mt-0.5 text-primary shrink-0">
                    info
                  </span>
                  <p className="text-[11px] leading-relaxed">
                    {moderationMode === "Hidden"
                      ? "Hiding temporarily removes the job from the public board and notifies the Employer with your reason. Once the Employer resolves it and submits, you can click 'Approve & Unhide'."
                      : "Deleting removes the job from the public board and shows it in the Employer's Deleted / Removed notifications with your reason so they can fix and repost it."}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-surface-container mt-4">
                <button
                  type="submit"
                  disabled={isModerating}
                  className={`w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-headline-sm text-xs font-semibold shadow-sm transition-opacity ${
                    moderationMode === "Hidden"
                      ? "bg-amber-500 hover:bg-amber-600 text-white"
                      : "bg-error hover:opacity-90 text-on-error"
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {moderationMode === "Hidden" ? "visibility_off" : "gavel"}
                  </span>
                  <span>
                    {isModerating
                      ? "Applying Moderation..."
                      : moderationMode === "Hidden"
                      ? "Hide Job & Send Reason to Company"
                      : "Confirm & Log Removal"}
                  </span>
                </button>
              </div>
            </form>
          </section>
        )}

        {/* ===================================================================
            PANEL B: USER & EMPLOYER ACCOUNT MANAGEMENT (EXCLUDES ADMIN)
           =================================================================== */}
        {(adminTab === "overview" || adminTab === "users") && (
          <section className="flex flex-col gap-4 bg-surface-container-lowest p-5 rounded-2xl border border-surface-container shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-surface-container">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
                  Platform Account Directory &amp; Access Controls
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-mono-label text-mono-label">
                  {enrichedAccounts.length} Managed Entities
                </span>
              </div>
              <div className="font-mono-label text-[10px] text-on-surface-variant uppercase">
                Excludes Root Superusers
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
                {[
                  {
                    id: "ALL",
                    label: `All Accounts (${
                      platformUsers.filter((u) => u.role !== "admin").length
                    })`,
                  },
                  {
                    id: "seeker",
                    label: `🎓 Job Seekers (${
                      platformUsers.filter((u) => u.role === "seeker").length
                    })`,
                  },
                  {
                    id: "employer",
                    label: `🏢 Employers (${
                      platformUsers.filter((u) => u.role === "employer").length
                    })`,
                  },
                  {
                    id: "Suspended",
                    label: `🚫 Suspended (${
                      platformUsers.filter((u) => u.status === "Suspended")
                        .length
                    })`,
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setAccountRoleFilter(tab.id);
                      setUserPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-mono-label text-mono-label whitespace-nowrap transition-colors ${
                      accountRoleFilter === tab.id
                        ? "bg-primary text-on-primary shadow-sm"
                        : "bg-surface hover:bg-surface-container-low text-on-surface border border-surface-container"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full md:w-80">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-outline">
                  search
                </span>
                <input
                  type="text"
                  value={accountSearch}
                  onChange={(e) => {
                    setAccountSearch(e.target.value);
                    setUserPage(1);
                  }}
                  placeholder="Instant query by name or email..."
                  className="w-full pl-9 pr-4 py-2 bg-surface border border-surface-container rounded-xl text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-all"
                />
              </div>
            </div>

            <div className="hidden md:block w-full overflow-x-auto border border-surface-container rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface border-b border-surface-container font-mono-label text-mono-label text-on-surface-variant">
                    <th className="py-3 px-4">Name / Organization</th>
                    <th className="py-3 px-4">Email Address</th>
                    <th className="py-3 px-4">Role Classification</th>
                    <th className="py-3 px-4">Platform Activity</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4 text-right">Access Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container font-body-sm text-body-sm text-on-surface">
                  {paginatedUsers.map((acc) => {
                    const isSuspended = acc.status === "Suspended";
                    const isEmployer = acc.role === "employer";

                    return (
                      <tr
                        key={acc.id}
                        className={`transition-colors ${
                          isSuspended
                            ? "bg-error-container/20 hover:bg-error-container/30"
                            : "hover:bg-surface"
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="font-headline-sm text-on-surface font-semibold">
                            {acc.companyName || acc.name}
                          </div>
                          <div
                            className={`font-mono-label text-[10px] ${
                              isSuspended
                                ? "text-error"
                                : "text-on-surface-variant"
                            }`}
                          >
                            {isSuspended
                              ? "FLAGGED: Suspended Entity"
                              : acc.headline ||
                                `UID: #${String(acc.id).slice(-6)}`}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono-data text-on-surface">
                          {acc.email}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded font-mono-label text-[10px] font-semibold uppercase ${
                              isEmployer
                                ? "bg-secondary-fixed text-secondary"
                                : "bg-primary-fixed text-primary"
                            }`}
                          >
                            {isEmployer ? "EMPLOYER" : "JOB SEEKER"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-on-surface font-medium">
                            {acc.primaryMetric}
                          </div>
                          <div
                            className={`text-[11px] ${
                              isSuspended
                                ? "text-error font-medium"
                                : isEmployer
                                ? "text-primary"
                                : "text-secondary"
                            }`}
                          >
                            {acc.secondaryMetric}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {isSuspended ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-error-container text-on-error-container font-mono-label text-[10px] font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                              Suspended
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary-fixed text-on-secondary-fixed font-mono-label text-[10px] font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                              Active
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setInspectedUser(acc)}
                              className="px-2.5 py-1 bg-surface-container-lowest border border-surface-container rounded-lg font-headline-sm text-xs text-on-surface hover:bg-surface-container-low transition-colors"
                            >
                              View Details
                            </button>

                            {isSuspended ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setSuspendReason(
                                    "Account compliance verified; restoring portal access."
                                  );
                                  setUserToSuspend(acc);
                                }}
                                className="px-2.5 py-1 bg-secondary text-on-secondary rounded-lg font-headline-sm text-xs font-semibold hover:opacity-90 transition-opacity"
                              >
                                Reactivate
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setSuspendReason(
                                    "Violation of Auspify Nexus platform authenticity policy."
                                  );
                                  setUserToSuspend(acc);
                                }}
                                className="px-2.5 py-1 bg-surface hover:bg-error-container hover:text-error text-on-surface-variant rounded-lg font-headline-sm text-xs transition-colors"
                              >
                                Suspend
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile User Cards (<768px) */}
            <div className="md:hidden flex flex-col gap-3">
              {paginatedUsers.map((acc) => {
                const isSuspended = acc.status === "Suspended";
                return (
                  <div
                    key={acc.id}
                    className={`p-3.5 rounded-xl border flex flex-col gap-2.5 ${
                      isSuspended
                        ? "bg-error-container/20 border-error/30"
                        : "bg-surface-container-low border-surface-container"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-headline-sm font-bold text-on-surface block">
                          {acc.companyName || acc.name}
                        </span>
                        <span className="font-mono-data text-xs text-on-surface-variant">
                          {acc.email}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded font-mono-label text-[10px] font-bold uppercase ${
                          isSuspended
                            ? "bg-error-container text-on-error-container"
                            : "bg-secondary-fixed text-on-secondary-fixed"
                        }`}
                      >
                        {acc.status || "Active"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-surface-container">
                      <button
                        type="button"
                        onClick={() => setInspectedUser(acc)}
                        className="px-3 py-1 rounded-lg bg-white text-on-surface font-headline-sm text-xs shadow-xs"
                      >
                        View Details
                      </button>
                      <button
                        type="button"
                        onClick={() => setUserToSuspend(acc)}
                        className={`px-3 py-1 rounded-lg font-headline-sm text-xs font-semibold ${
                          isSuspended
                            ? "bg-secondary text-white"
                            : "bg-error-container text-on-error-container"
                        }`}
                      >
                        {isSuspended ? "Reactivate" : "Suspend"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-on-surface-variant font-mono-label text-mono-label pt-1">
              <span>
                Showing {paginatedUsers.length} of {enrichedAccounts.length}{" "}
                managed platform entities
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={safeUserPage <= 1}
                  onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 bg-surface rounded-lg border border-surface-container disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-on-surface font-bold">
                  {safeUserPage} / {totalUserPages}
                </span>
                <button
                  type="button"
                  disabled={safeUserPage >= totalUserPages}
                  onClick={() =>
                    setUserPage((p) => Math.min(totalUserPages, p + 1))
                  }
                  className="px-3 py-1 bg-surface rounded-lg border border-surface-container hover:bg-surface-container-low disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ===================================================================
            PANEL C: ADMIN AUDIT LOG & PLATFORM ACTIVITY LEDGER (LOCAL TIME)
           =================================================================== */}
        {(adminTab === "overview" || adminTab === "audit") && (
          <section className="flex flex-col gap-4 bg-surface-container-lowest p-5 rounded-2xl border border-surface-container shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-surface-container">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
                  Platform Audit Trail &amp; System Activity Ledger
                </h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container font-mono-label text-[10px] text-on-surface">
                  <span className="w-2 h-2 rounded-full bg-secondary"></span>
                  SHA-256 Verified Ledger • Append-Only
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono-label text-[10px] text-on-surface-variant">
                  HASH:
                </span>
                <span className="font-mono-data text-[11px] text-primary">
                  0x8f2c...49a1d9b3e
                </span>
              </div>
            </div>

            <div className="w-full overflow-x-auto border border-surface-container rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface border-b border-surface-container font-mono-label text-mono-label text-on-surface-variant">
                    <th className="py-3 px-4">Timestamp (Local Time)</th>
                    <th className="py-3 px-4">Event Code</th>
                    <th className="py-3 px-4">Origin Actor</th>
                    <th className="py-3 px-4">Target Entity</th>
                    <th className="py-3 px-4">
                      Reason &amp; Justification Context
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container font-body-sm text-body-sm text-on-surface">
                  {auditLogs.map((log) => (
                    <tr
                      key={log.logId}
                      className="hover:bg-surface transition-colors"
                    >
                      <td className="py-3 px-4 font-mono-data text-xs whitespace-nowrap text-on-surface-variant">
                        {new Date(log.createdAt || Date.now()).toLocaleString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            hour12: true,
                          }
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded font-mono-label text-[10px] font-bold uppercase ${getEventBadgeStyle(
                            log.action
                          )}`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-semibold text-on-surface">
                          {log.actorName}
                        </div>
                        <div className="font-mono-label text-[10px] text-on-surface-variant">
                          {log.actorEmail}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono-data text-xs text-primary font-medium">
                          {log.targetRecord}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-on-surface-variant">
                        {log.reason}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ===================================================================
            PANEL D: ADMIN SECURITY & PROFILE SETTINGS TAB
           =================================================================== */}
        {adminTab === "settings" && (
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-up">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onUpdateProfile(
                  { name: adminName, headline: adminHeadline },
                  "Administrator Profile Saved"
                );
              }}
              className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container shadow-sm flex flex-col justify-between gap-4"
            >
              <div className="space-y-4">
                <h3 className="font-headline-md font-bold text-on-surface">
                  Superuser Identity &amp; Role Profile
                </h3>
                <div>
                  <label className="font-mono-label text-[11px] uppercase text-on-surface-variant block mb-1">
                    Administrator Name
                  </label>
                  <input
                    type="text"
                    required
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-on-surface"
                  />
                </div>
                <div>
                  <label className="font-mono-label text-[11px] uppercase text-on-surface-variant block mb-1">
                    Title / Security Clearance
                  </label>
                  <input
                    type="text"
                    value={adminHeadline}
                    onChange={(e) => setAdminHeadline(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-on-surface"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="self-start px-5 py-2.5 rounded-xl bg-primary text-on-primary font-headline-sm text-xs font-semibold shadow-sm"
              >
                Save Admin Profile
              </button>
            </form>

            <form
              onSubmit={handleAdminPasswordSubmit}
              className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container shadow-sm flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <h3 className="font-headline-md font-bold text-on-surface">
                  Rotate Superuser Passphrase
                </h3>
                <div>
                  <label className="font-mono-label text-[11px] uppercase text-on-surface-variant block mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-surface-container-low text-on-surface"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-mono-label text-[11px] uppercase text-on-surface-variant block mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-surface-container-low text-on-surface"
                    />
                  </div>
                  <div>
                    <label className="font-mono-label text-[11px] uppercase text-on-surface-variant block mb-1">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-surface-container-low text-on-surface"
                    />
                  </div>
                </div>
              </div>
              <button
                type="submit"
                className="self-start px-5 py-2.5 rounded-xl bg-primary-container text-on-primary font-headline-sm text-xs font-semibold shadow-sm"
              >
                Rotate Password
              </button>
            </form>
          </section>
        )}
      </div>
    </>
  );
}