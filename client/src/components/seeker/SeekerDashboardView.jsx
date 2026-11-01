import React, { useState, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { formatSalaryBand } from "../../constants/nexusConstants.js";
import { QuickApplyCardContent } from "./QuickApplyModal.jsx";

export default function SeekerDashboardView({
  user,
  applications = [],
  jobs = [],
  bookmarkedJobIds = [],
  currency = "USD",
  selectedJobForQuickApply,
  onSelectJobForQuickApply,
  onSubmitApplication,
  onToggleArchiveApplication,
  onRespondToOffer,
  onUpdateProfile,
  onUpdatePassword,
  onExploreJobs,
  onInspectJobOnBoard,
  onShowToast,
}) {
  // Sub-Navigation Tab: "ALL" | "SAVED" | "PROFILE"
  const [subTab, setSubTab] = useState("ALL");

  // Application Pipeline Filter: "ALL" | "Applied" | "Under Review" | "Interview Scheduled" | "Offer Extended" | "Rejected" | "ARCHIVED"
  const [stageFilter, setStageFilter] = useState("ALL");

  // Candidate Profile Form State
  const [fullName, setFullName] = useState(user?.name || "Sashmitha N.");
  const [headline, setHeadline] = useState(
    user?.headline || "Full-Stack Engineer • React & Node.js"
  );
  const [phone, setPhone] = useState(user?.phone || "+94 77 123 4567");
  const [location, setLocation] = useState(
    user?.location || "Colombo, Sri Lanka (Open to Remote & Relocation)"
  );
  const [skills, setSkills] = useState(
    user?.skills?.length
      ? user.skills
      : ["React", "Node.js", "TypeScript", "MongoDB", "AWS ECS", "Tailwind CSS"]
  );
  const [newSkillText, setNewSkillText] = useState("");
  const [showSkillInput, setShowSkillInput] = useState(false);

  // Default CV State
  const cvFileInputRef = useRef(null);
  const [defaultResume, setDefaultResume] = useState(
    user?.defaultResume?.fileName
      ? user.defaultResume
      : {
          fileName: "Sashmitha_CV_2026.pdf",
          fileType: "application/pdf",
          fileSizeKB: 420,
          fileDataUrl: "",
          uploadedAt: new Date().toISOString(),
        }
  );

  // Change Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Compute Pipeline Counts
  const nonArchivedApps = useMemo(
    () => applications.filter((a) => !a.archivedByCandidate),
    [applications]
  );
  const archivedApps = useMemo(
    () => applications.filter((a) => a.archivedByCandidate),
    [applications]
  );

  const activeStageApps = useMemo(
    () =>
      nonArchivedApps.filter(
        (a) =>
          a.status === "Applied" ||
          a.status === "Under Review" ||
          a.status === "Interview Scheduled"
      ),
    [nonArchivedApps]
  );

  const interviewApps = useMemo(
    () => nonArchivedApps.filter((a) => a.status === "Interview Scheduled"),
    [nonArchivedApps]
  );

  const offerApps = useMemo(
    () => nonArchivedApps.filter((a) => a.status === "Offer Extended"),
    [nonArchivedApps]
  );

  const filteredApplications = useMemo(() => {
    if (stageFilter === "ARCHIVED") return archivedApps;
    if (stageFilter === "ALL") return nonArchivedApps;
    return nonArchivedApps.filter((a) => a.status === stageFilter);
  }, [nonArchivedApps, archivedApps, stageFilter]);

  const savedJobsList = useMemo(
    () => jobs.filter((j) => bookmarkedJobIds.includes(j.jobId)),
    [jobs, bookmarkedJobIds]
  );

  // Profile Completeness %
  const completenessPct = useMemo(() => {
    let score = 40;
    if (fullName.trim()) score += 10;
    if (headline.trim()) score += 10;
    if (phone.trim()) score += 10;
    if (skills.length >= 3) score += 15;
    if (defaultResume?.fileName) score += 15;
    return Math.min(100, score);
  }, [fullName, headline, phone, skills, defaultResume]);

  // Bounded 4-Step Progress Bar Mapping (0%, 33.33%, 66.66%, 100%)
  const getStageStepConfig = (status) => {
    switch (status) {
      case "Applied":
        return { step: 1, barWidth: "0%" };
      case "Under Review":
        return { step: 2, barWidth: "33.33%" };
      case "Interview Scheduled":
        return { step: 3, barWidth: "66.66%" };
      case "Offer Extended":
        return { step: 4, barWidth: "100%" };
      default:
        return { step: 0, barWidth: "0%" };
    }
  };

  const handleAddSkill = () => {
    const clean = newSkillText.trim();
    if (!clean) return;
    if (!skills.some((s) => s.toLowerCase() === clean.toLowerCase())) {
      setSkills((prev) => [...prev, clean]);
    }
    setNewSkillText("");
    setShowSkillInput(false);
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills((prev) => prev.filter((s) => s !== skillToRemove));
  };

  const handleUploadDefaultCv = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const updatedCv = {
        fileName: file.name,
        fileType: file.type || "application/pdf",
        fileSizeKB: Math.max(15, Math.round(file.size / 1024)),
        fileDataUrl: typeof reader.result === "string" ? reader.result : "",
        uploadedAt: new Date().toISOString(),
      };
      setDefaultResume(updatedCv);
      await onUpdateProfile(
        { defaultResume: updatedCv },
        "Verified Default CV Updated"
      );
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleDownloadCv = () => {
    if (defaultResume?.fileDataUrl) {
      const a = document.createElement("a");
      a.href = defaultResume.fileDataUrl;
      a.download = defaultResume.fileName || "Candidate_CV.pdf";
      a.click();
      return;
    }
    // Generate a printable CV summary if using the seeded default CV
    const win = window.open("", "_blank", "width=850,height=700");
    if (!win) return;
    win.document.write(`
      <html>
        <head><title>${defaultResume?.fileName || "Candidate_CV"}</title></head>
        <body style="font-family:Inter,sans-serif;padding:40px;color:#0b1c30;">
          <h1>${fullName}</h1>
          <p><strong>${headline}</strong> • ${location} • ${phone}</p>
          <hr/>
          <h3>Core Technical Stack</h3>
          <p>${skills.join(" • ")}</p>
          <h3>Verified Auspify Nexus Candidate Dossier</h3>
          <p>Document: ${defaultResume?.fileName || "Sashmitha_CV_2026.pdf"}</p>
          <script>window.onload = () => setTimeout(() => window.print(), 250);</script>
        </body>
      </html>
    `);
    win.document.close();
  };

  const handleSaveCandidateProfile = async (e) => {
    e.preventDefault();
    await onUpdateProfile(
      {
        name: fullName.trim(),
        headline: headline.trim(),
        phone: phone.trim(),
        location: location.trim(),
        skills,
        defaultResume,
      },
      "Candidate Dossier & CV Saved"
    );
  };

  const handlePasswordSubmit = async (e) => {
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
      setShowPasswordModal(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const firstName = (user?.name || "Sashmitha").split(" ")[0];

  return (
    <>
      {/* Change Password Modal */}
      {showPasswordModal &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-[100] bg-on-surface/50 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setShowPasswordModal(false)}
          >
            <form
              onSubmit={handlePasswordSubmit}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl border border-outline-variant/40 flex flex-col gap-4 animate-pop-in"
            >
              <div className="flex items-center justify-between border-b border-outline-variant/25 pb-3">
                <div>
                  <h3 className="font-headline-md font-bold text-on-surface">
                    Rotate Account Password
                  </h3>
                  <span className="font-mono-label text-[10px] text-secondary">
                    256-BIT BCRYPT ENCRYPTION
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="font-mono-label text-[11px] uppercase text-on-surface block mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full h-10 px-3.5 rounded-xl bg-surface-container-low text-on-surface"
                  />
                </div>
                <div>
                  <label className="font-mono-label text-[11px] uppercase text-on-surface block mb-1">
                    New Password (Min 6 chars)
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full h-10 px-3.5 rounded-xl bg-surface-container-low text-on-surface"
                  />
                </div>
                <div>
                  <label className="font-mono-label text-[11px] uppercase text-on-surface block mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full h-10 px-3.5 rounded-xl bg-surface-container-low text-on-surface"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 rounded-xl bg-surface-container text-on-surface font-headline-sm text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary-container hover:bg-primary text-white font-headline-sm text-xs shadow-sm"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>,
          document.body
        )}

      {/* Hidden File Input for Default CV Upload */}
      <input
        ref={cvFileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,image/*"
        onChange={handleUploadDefaultCv}
        className="hidden"
      />

      <div className="flex flex-col gap-6 animate-fade-up">
        {/* 1. CANDIDATE HEADER CONTEXT & SUB-NAVIGATION */}
        <section className="flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-headline-xl text-2xl sm:text-headline-xl text-on-surface tracking-tight font-extrabold">
                  Welcome back, {firstName}
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-mono-label text-mono-label font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                  Live ATS Sync
                </span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Track active applications, interview schedules, and manage your verified
                engineer profile.
              </p>
            </div>

            <div className="flex items-center gap-2.5 self-start lg:self-auto">
              <button
                type="button"
                onClick={onExploreJobs}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-primary font-headline-sm text-headline-sm hover:bg-surface-container transition-all shadow-xs"
              >
                <span>Explore Opportunities</span>
                <span className="material-symbols-outlined text-[16px]">
                  arrow_outward
                </span>
              </button>
            </div>
          </div>

          {/* Sub-Navigation Pills */}
          <div className="flex items-center gap-2 p-1.5 bg-surface-container-low rounded-xl overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setSubTab("ALL")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-headline-sm text-headline-sm transition-all shrink-0 ${
                subTab === "ALL"
                  ? "bg-primary-container text-on-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-lowest"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                space_dashboard
              </span>
              <span>Applications &amp; Dashboard ({nonArchivedApps.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setSubTab("SAVED")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-headline-sm text-headline-sm transition-all shrink-0 ${
                subTab === "SAVED"
                  ? "bg-primary-container text-on-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-lowest"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">bookmark</span>
              <span>Saved Roles ({savedJobsList.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSubTab("ALL");
                document
                  .getElementById("candidate-profile-section")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-lowest font-headline-sm text-headline-sm transition-colors shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">badge</span>
              <span>Candidate Profile &amp; CV</span>
            </button>
          </div>
        </section>

        {/* 2. CANDIDATE KPI SUMMARY ROW */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* KPI 1 */}
          <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/25 flex flex-col justify-between shadow-sm">
            <div className="flex items-start justify-between gap-2 mb-4">
              <div className="flex flex-col">
                <span className="font-mono-label text-mono-label text-on-surface-variant uppercase tracking-wider">
                  Active Pipeline
                </span>
                <span className="font-headline-md text-headline-md text-on-surface font-bold mt-0.5">
                  Applications Submitted
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined text-[20px]">send</span>
              </div>
            </div>
            <div className="flex items-baseline gap-2.5 mb-1">
              <span className="font-headline-xl text-headline-xl text-on-surface font-extrabold">
                {nonArchivedApps.length} Total
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-mono-data text-mono-data font-semibold">
                {activeStageApps.length} In Active Stages
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-body-sm text-body-sm text-on-surface-variant pt-1">
              <span className="material-symbols-outlined text-[15px] text-secondary">
                sync
              </span>
              <span>Real-time sync enabled across employer portals</span>
            </div>
          </div>

          {/* KPI 2 */}
          <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/25 flex flex-col justify-between shadow-sm">
            <div className="flex items-start justify-between gap-2 mb-4">
              <div className="flex flex-col">
                <span className="font-mono-label text-mono-label text-on-surface-variant uppercase tracking-wider">
                  Upcoming Schedule
                </span>
                <span className="font-headline-md text-headline-md text-on-surface font-bold mt-0.5">
                  Interview Invitations
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center text-on-primary shrink-0">
                <span className="material-symbols-outlined text-[20px]">
                  video_camera_front
                </span>
              </div>
            </div>
            <div className="flex items-baseline gap-2.5 mb-1 flex-wrap">
              <span className="font-headline-xl text-headline-xl text-on-surface font-extrabold">
                {interviewApps.length} Scheduled
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-mono-data text-mono-data font-semibold">
                {interviewApps[0]?.interviewDate || "Oct 30 • 10:30 AM"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-body-sm text-body-sm text-on-surface-variant pt-1">
              <span className="material-symbols-outlined text-[15px] text-primary">
                calendar_today
              </span>
              <span className="truncate">
                {interviewApps[0]?.interviewDetails ||
                  "System Architecture Round • Google Meet"}
              </span>
            </div>
          </div>

          {/* KPI 3 */}
          <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/25 flex flex-col justify-between shadow-sm">
            <div className="flex items-start justify-between gap-2 mb-4">
              <div className="flex flex-col">
                <span className="font-mono-label text-mono-label text-on-surface-variant uppercase tracking-wider">
                  Verified CV
                </span>
                <span className="font-headline-md text-headline-md text-on-surface font-bold mt-0.5">
                  Default Dossier
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center text-on-secondary-container shrink-0">
                <span className="material-symbols-outlined text-[20px]">verified</span>
              </div>
            </div>
            <div className="flex flex-col gap-1 mb-1">
              <span className="font-mono-data text-mono-data text-on-surface font-bold truncate">
                {defaultResume?.fileName || "No CV Uploaded"}
              </span>
              <span className="inline-flex items-center self-start gap-1 px-2.5 py-0.5 rounded-full bg-secondary/10 text-secondary font-mono-label text-mono-label font-semibold">
                <span className="material-symbols-outlined text-[13px]">
                  verified_user
                </span>
                Verified &amp; Encrypted
              </span>
            </div>
            <div className="flex items-center justify-between font-body-sm text-body-sm pt-1">
              <button
                type="button"
                onClick={handleDownloadCv}
                className="text-primary hover:underline font-headline-sm text-headline-sm inline-flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[15px]">download</span>
                <span>Download CV</span>
              </button>
              <button
                type="button"
                onClick={() => cvFileInputRef.current?.click()}
                className="text-on-surface-variant hover:text-on-surface font-headline-sm text-headline-sm inline-flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[15px]">
                  upload_file
                </span>
                <span>Replace CV</span>
              </button>
            </div>
          </div>
        </section>

        {/* SAVED ROLES VIEW (When Candidate clicks Saved Roles tab) */}
        {subTab === "SAVED" && (
          <section className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/25 space-y-4 animate-fade-up">
            <div className="flex items-center justify-between">
              <h2 className="font-headline-md font-bold text-on-surface">
                Bookmarked Engineering Requisitions ({savedJobsList.length})
              </h2>
              <button
                type="button"
                onClick={() => setSubTab("ALL")}
                className="font-mono-label text-primary hover:underline"
              >
                ← Back to Pipeline
              </button>
            </div>
            {savedJobsList.length === 0 ? (
              <p className="font-body-sm text-on-surface-variant py-6 text-center">
                No bookmarked roles yet. Click the bookmark icon on any job card on the Job
                Board to save it here.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedJobsList.map((j) => (
                  <div
                    key={j.jobId}
                    className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/25 flex items-center justify-between gap-3"
                  >
                    <div>
                      <span className="font-mono-label text-[10px] text-primary font-bold">
                        #{j.jobId} • {j.companyName}
                      </span>
                      <h4 className="font-headline-sm font-bold text-on-surface mt-0.5">
                        {j.title}
                      </h4>
                      <span className="font-mono-data text-xs text-on-surface-variant">
                        {formatSalaryBand(j.salaryMin, j.salaryMax, currency)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onInspectJobOnBoard(j)}
                      className="px-3.5 py-2 rounded-lg bg-primary-container text-white font-headline-sm text-xs shrink-0"
                    >
                      Inspect &amp; Apply
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* 3. MY APPLICATIONS PIPELINE TRACKER */}
        <section className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-surface-container-lowest p-4 rounded-xl shadow-sm border border-outline-variant/25">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined text-[18px]">timeline</span>
              </div>
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
                  Application Pipeline &amp; Stage Milestones
                </h2>
                <p className="font-mono-label text-[10px] text-on-surface-variant uppercase">
                  TRACKING {nonArchivedApps.length} ACTIVE APPLICATIONS ACROSS STAGES
                </p>
              </div>
            </div>

            {/* Stage Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
              {[
                { id: "ALL", label: `All (${nonArchivedApps.length})` },
                {
                  id: "Applied",
                  label: `Applied (${
                    nonArchivedApps.filter((a) => a.status === "Applied").length
                  })`,
                },
                {
                  id: "Under Review",
                  label: `Under Review (${
                    nonArchivedApps.filter((a) => a.status === "Under Review").length
                  })`,
                },
                {
                  id: "Interview Scheduled",
                  label: `Interview (${interviewApps.length})`,
                },
                {
                  id: "Offer Extended",
                  label: `Offer (${offerApps.length})`,
                },
                {
                  id: "Rejected",
                  label: `Decision Logged (${
                    nonArchivedApps.filter((a) => a.status === "Rejected").length
                  })`,
                },
                {
                  id: "ARCHIVED",
                  label: `Archived (${archivedApps.length})`,
                },
              ].map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setStageFilter(pill.id)}
                  className={`px-3 py-1.5 rounded-lg font-mono-label text-mono-label transition-all whitespace-nowrap shrink-0 ${
                    stageFilter === pill.id
                      ? "bg-inverse-surface text-inverse-on-surface shadow-sm"
                      : "bg-surface-container-low hover:bg-surface-container text-on-surface-variant"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Application Cards Stack */}
          {filteredApplications.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-2xl p-10 text-center border border-outline-variant/25">
              <span className="material-symbols-outlined text-[38px] text-outline">
                work_history
              </span>
              <h3 className="font-headline-md font-bold text-on-surface mt-2">
                No applications in this stage
              </h3>
              <p className="font-body-sm text-on-surface-variant mt-1">
                Submit a new application using the Quick-Apply console below or browse open
                roles on the Job Board.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredApplications.map((app) => {
                const { step, barWidth } = getStageStepConfig(app.status);
                const isOffer = app.status === "Offer Extended";
                const isRejected = app.status === "Rejected";
                const isInterview = app.status === "Interview Scheduled";

                return (
                  <article
                    key={app.applicationId}
                    className="bg-surface-container-lowest rounded-xl p-5 sm:p-6 shadow-sm border border-outline-variant/25 flex flex-col gap-5"
                  >
                    {/* Card Header */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl font-headline-lg font-extrabold flex items-center justify-center shrink-0 shadow-sm ${
                            isOffer
                              ? "bg-secondary-fixed text-on-secondary-fixed"
                              : isRejected
                              ? "bg-surface-container-highest text-tertiary"
                              : "bg-primary-container text-on-primary"
                          }`}
                        >
                          {app.companyInitials || "ACL"}
                        </div>
                        <div className="flex flex-col">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                              {app.companyName}
                            </span>
                            <span className="text-on-surface-variant">•</span>
                            <span className="font-mono-data text-xs text-on-surface-variant">
                              Applied{" "}
                              {new Date(app.createdAt || Date.now()).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-surface-container font-mono-label text-[10px] text-primary font-semibold">
                              #{app.jobId}
                            </span>
                          </div>

                          <h3 className="font-headline-lg text-lg sm:text-headline-lg text-on-surface font-bold tracking-tight">
                            {app.jobTitle}
                          </h3>

                          <div className="flex flex-wrap items-center gap-4 mt-1 font-body-sm text-body-sm text-on-surface-variant">
                            <span className="inline-flex items-center gap-1">
                              <span className="material-symbols-outlined text-[16px] text-secondary">
                                location_on
                              </span>
                              {app.location || "Colombo / Remote"}
                            </span>
                            <span className="inline-flex items-center gap-1 font-mono-data text-mono-data text-on-surface font-semibold">
                              <span className="material-symbols-outlined text-[16px] text-secondary">
                                payments
                              </span>
                              {formatSalaryBand(
                                app.salaryMin || 120000,
                                app.salaryMax || 145000,
                                currency
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Status Badge */}
                      <div className="flex flex-col items-start lg:items-end gap-1 shrink-0">
                        {isOffer ? (
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-on-secondary font-mono-label text-mono-label tracking-wide uppercase shadow-sm">
                            <span className="material-symbols-outlined text-[16px]">
                              celebration
                            </span>
                            <span>Official Offer Extended</span>
                          </div>
                        ) : isRejected ? (
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-error-container text-on-error-container font-mono-label text-mono-label tracking-wide uppercase">
                            <span className="material-symbols-outlined text-[16px]">
                              do_not_disturb_on
                            </span>
                            <span>Decision Logged</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-container text-on-primary font-mono-label text-mono-label tracking-wide uppercase shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-surface-container-lowest animate-pulse"></span>
                            <span>{app.status}</span>
                          </div>
                        )}
                        <span className="font-mono-label text-[10px] text-on-surface-variant">
                          Application ID: #{app.applicationId}
                        </span>
                      </div>
                    </div>

                    {/* OUTCOME BRANCH A: OFFER EXTENDED BANNER */}
                    {isOffer && (
                      <div className="bg-secondary-fixed/25 border border-secondary/25 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">🎉</span>
                          <div className="flex flex-col">
                            <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                              {app.offerStatus === "Accepted"
                                ? "Offer Accepted! You Are Officially Hired"
                                : app.offerStatus === "Declined"
                                ? "Offer Declined by Candidate"
                                : "Congratulations! Employer Selected You for Hire"}
                            </span>
                            <p className="font-body-md text-body-sm sm:text-body-md text-on-surface-variant mt-0.5">
                              {app.offerDetails ||
                                "$165,000 USD/yr base + equity options + comprehensive health & wellness package."}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {app.offerStatus === "Accepted" ? (
                            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-secondary text-on-secondary font-mono-label text-xs font-bold shadow-xs">
                              <span className="material-symbols-outlined text-[16px]">
                                verified
                              </span>
                              <span>OFFER ACCEPTED • HIRED</span>
                            </span>
                          ) : app.offerStatus === "Declined" ? (
                            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-surface-container text-on-surface-variant font-mono-label text-xs font-semibold">
                              Offer Declined
                            </span>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  onRespondToOffer &&
                                  onRespondToOffer(app.applicationId, "Accepted")
                                }
                                className="px-4 py-2 rounded-lg bg-secondary text-on-secondary font-headline-sm text-xs hover:opacity-90 transition-opacity shadow-sm"
                              >
                                Accept Offer
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  onRespondToOffer &&
                                  onRespondToOffer(app.applicationId, "Declined")
                                }
                                className="px-3.5 py-2 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface font-headline-sm text-xs transition-colors shadow-xs"
                              >
                                Decline
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* OUTCOME BRANCH B: REJECTED WITH CONSTRUCTIVE EMPLOYER FEEDBACK */}
                    {isRejected ? (
                      <div className="bg-error-container/30 border border-error/20 rounded-xl p-4 flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-error">
                          <span className="material-symbols-outlined text-[20px]">
                            chat
                          </span>
                          <span className="font-headline-sm text-headline-sm font-bold">
                            Constructive Employer Feedback
                          </span>
                        </div>
                        <p className="font-body-md text-body-md text-on-surface pl-7 italic">
                          &ldquo;
                          {app.rejectionReason ||
                            "Thank you for interviewing. We have retained your dossier for upcoming architectural roles."}
                          &rdquo;
                        </p>
                        <div className="flex flex-wrap items-center justify-between gap-2 pl-7 pt-1">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={onExploreJobs}
                              className="text-primary hover:underline font-headline-sm text-xs inline-flex items-center gap-1"
                            >
                              <span>Explore Related Roles</span>
                              <span className="material-symbols-outlined text-[15px]">
                                arrow_forward
                              </span>
                            </button>
                            <span className="text-outline">•</span>
                            <button
                              type="button"
                              onClick={() =>
                                onToggleArchiveApplication(
                                  app.applicationId,
                                  !app.archivedByCandidate
                                )
                              }
                              className="text-on-surface-variant hover:text-on-surface font-headline-sm text-xs"
                            >
                              {app.archivedByCandidate
                                ? "Restore Application"
                                : "Archive Application"}
                            </button>
                          </div>
                          <span className="font-mono-label text-[10px] text-on-surface-variant font-semibold">
                            Dossier Retained in Active Pool
                          </span>
                        </div>
                      </div>
                    ) : (
                      /* 4-STEP BOUNDED PROGRESS TRACKER (For Active & Offer Extended Applications) */
                      <div className="bg-surface-container-low rounded-xl p-4 sm:p-6">
                        <div className="relative w-full">
                          {/* Bounded Track Container strictly between Center of Step 1 (12.5%) and Step 4 (12.5%) */}
                          <div className="absolute top-5 left-[12.5%] right-[12.5%] h-1 bg-surface-container-highest rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-500 rounded-full ${
                                isOffer ? "bg-secondary" : "bg-primary-container"
                              }`}
                              style={{ width: barWidth }}
                            ></div>
                          </div>

                          <div className="relative z-10 grid grid-cols-4 w-full">
                            {[
                              {
                                idx: 1,
                                label: "1. Applied",
                                sub: "Dossier Logged",
                                icon: "check",
                              },
                              {
                                idx: 2,
                                label: "2. Under Review",
                                sub:
                                  step >= 2 ? "Screen Passed" : "Awaiting Review",
                                icon: "manage_search",
                              },
                              {
                                idx: 3,
                                label: "3. Technical Interview",
                                sub:
                                  app.interviewDate ||
                                  (step >= 3 ? "Scheduled" : "Pending"),
                                icon: "videocam",
                              },
                              {
                                idx: 4,
                                label: "4. Offer Extended",
                                sub: isOffer
                                  ? "Offer Ready"
                                  : "Pending Decision",
                                icon: "verified",
                              },
                            ].map((s) => {
                              const done = step > s.idx || isOffer;
                              const active = step === s.idx && !isOffer;
                              return (
                                <div
                                  key={s.idx}
                                  className="flex flex-col items-center text-center px-1"
                                >
                                  <div
                                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-sm mb-2 transition-all ${
                                      done
                                        ? "bg-secondary text-on-secondary"
                                        : active
                                        ? "bg-primary-container text-on-primary ring-4 ring-primary-container/20"
                                        : "bg-surface-container-highest text-on-surface-variant"
                                    }`}
                                  >
                                    <span className="material-symbols-outlined text-[18px] sm:text-[20px]">
                                      {done ? "check" : s.icon}
                                    </span>
                                  </div>
                                  <span
                                    className={`font-headline-sm text-[11px] sm:text-headline-sm leading-tight ${
                                      done || active
                                        ? "text-on-surface font-bold"
                                        : "text-on-surface-variant"
                                    }`}
                                  >
                                    {s.label}
                                  </span>
                                  <span
                                    className={`font-mono-label text-[9px] sm:text-mono-label mt-0.5 ${
                                      active
                                        ? "text-primary font-bold"
                                        : "text-on-surface-variant"
                                    }`}
                                  >
                                    {s.sub}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {isInterview && (
                          <div className="mt-4 bg-surface-container-lowest rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border border-outline-variant/20">
                            <div className="flex items-center gap-2 text-on-surface font-body-sm text-body-sm">
                              <span className="material-symbols-outlined text-primary text-[18px] shrink-0">
                                info
                              </span>
                              <span>
                                <strong>Next Step:</strong>{" "}
                                {app.interviewDetails ||
                                  "Technical System Architecture Round (Google Meet • 60 min)"}
                              </span>
                            </div>
                            <span className="font-mono-data text-mono-data text-primary font-semibold shrink-0">
                              {app.interviewDate || "Upcoming"}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Card Footer Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const jobObj = jobs.find((j) => j.jobId === app.jobId);
                            if (jobObj) onInspectJobOnBoard(jobObj);
                          }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-headline-sm text-xs transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            description
                          </span>
                          <span>View Job Description</span>
                        </button>

                        <span className="font-mono-label text-[10px] text-outline px-2">
                          Submitted CV: {app.resumeFileName}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          onToggleArchiveApplication(
                            app.applicationId,
                            !app.archivedByCandidate
                          )
                        }
                        className="font-mono-label text-xs text-outline hover:text-on-surface transition-colors"
                      >
                        {app.archivedByCandidate ? "Restore to Active" : "Archive"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* 4. BOTTOM SECTION: 2-COLUMN PROFILE & DEFAULT CV MANAGER + QUICK-APPLY CONSOLE */}
        <section
          id="candidate-profile-section"
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pt-2 scroll-mt-24"
        >
          {/* LEFT 7 COLUMNS: Candidate Profile & Default CV Manager */}
          <div className="lg:col-span-7 bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/25 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono-label text-mono-label text-primary font-bold uppercase tracking-wider">
                  Candidate Profile
                </span>
                <h3 className="font-headline-lg text-headline-lg text-on-surface font-bold">
                  Profile &amp; Default CV Manager
                </h3>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-mono-label text-[10px] text-on-surface-variant">
                  COMPLETENESS
                </span>
                <span className="font-headline-sm text-headline-sm text-primary font-bold">
                  {completenessPct}% Complete
                </span>
              </div>
            </div>

            <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
              <div
                className="h-full bg-primary-container rounded-full transition-all duration-300"
                style={{ width: `${completenessPct}%` }}
              ></div>
            </div>

            <form
              onSubmit={handleSaveCandidateProfile}
              className="flex flex-col gap-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-headline-sm text-headline-sm text-on-surface">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bg-surface-container-low text-on-surface font-body-md px-3.5 py-2.5 rounded-xl outline-none focus:bg-white border border-outline-variant/25"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-headline-sm text-headline-sm text-on-surface">
                    Professional Headline
                  </label>
                  <input
                    type="text"
                    required
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    className="bg-surface-container-low text-on-surface font-body-md px-3.5 py-2.5 rounded-xl outline-none focus:bg-white border border-outline-variant/25"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-headline-sm text-headline-sm text-on-surface flex items-center justify-between">
                    <span>Work Email</span>
                    <span className="font-mono-label text-[10px] text-secondary font-semibold">
                      VERIFIED
                    </span>
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || "seeker@auspify.com"}
                    className="bg-surface-container-highest text-on-surface-variant font-mono-data px-3.5 py-2.5 rounded-xl cursor-not-allowed opacity-80"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-headline-sm text-headline-sm text-on-surface">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-surface-container-low text-on-surface font-body-md px-3.5 py-2.5 rounded-xl outline-none focus:bg-white border border-outline-variant/25"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-headline-sm text-headline-sm text-on-surface">
                  Primary Location &amp; Mobility
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="bg-surface-container-low text-on-surface font-body-md px-3.5 py-2.5 rounded-xl outline-none focus:bg-white border border-outline-variant/25"
                />
              </div>

              {/* Interactive Core Technical Skills Tag Editor */}
              <div className="flex flex-col gap-2">
                <label className="font-headline-sm text-headline-sm text-on-surface flex items-center justify-between">
                  <span>Core Technical Skills</span>
                  <span className="font-mono-label text-mono-label text-on-surface-variant font-semibold">
                    {skills.length} Skills Active
                  </span>
                </label>
                <div className="flex flex-wrap items-center gap-2 p-3 bg-surface-container-low rounded-xl border border-outline-variant/20">
                  {skills.map((sk) => (
                    <span
                      key={sk}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-container-lowest text-on-surface font-body-sm text-body-sm shadow-xs"
                    >
                      <span>{sk}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(sk)}
                        className="text-on-surface-variant hover:text-error text-[16px] leading-none"
                        title="Remove Skill"
                      >
                        ×
                      </button>
                    </span>
                  ))}

                  {showSkillInput ? (
                    <div className="inline-flex items-center gap-1">
                      <input
                        type="text"
                        value={newSkillText}
                        onChange={(e) => setNewSkillText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddSkill();
                          }
                        }}
                        placeholder="e.g. Docker"
                        autoFocus
                        className="px-2.5 py-1 rounded-lg bg-white text-body-sm border border-primary-container focus:outline-none w-28"
                      />
                      <button
                        type="button"
                        onClick={handleAddSkill}
                        className="px-2.5 py-1 rounded-lg bg-primary-container text-white font-headline-sm text-xs"
                      >
                        Add
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowSkillInput(true)}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 font-headline-sm text-xs transition-colors"
                    >
                      <span className="material-symbols-outlined text-[15px]">
                        add
                      </span>
                      <span>Add Skill</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Default Resume / CV Document Upload */}
              <div className="flex flex-col gap-2">
                <label className="font-headline-sm text-headline-sm text-on-surface">
                  Default Resume / CV Document
                </label>
                <div className="bg-surface-container-low rounded-xl p-4 flex flex-col gap-3 border border-outline-variant/20">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-lowest p-3 rounded-xl shadow-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[20px]">
                          picture_as_pdf
                        </span>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-mono-data text-mono-data text-on-surface font-bold truncate">
                          {defaultResume?.fileName || "No default CV uploaded"}
                        </span>
                        <span className="font-mono-label text-[10px] text-on-surface-variant">
                          {defaultResume?.fileSizeKB || 420} KB • Verified Candidate
                          Dossier
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handleDownloadCv}
                        className="px-2.5 py-1.5 rounded-lg bg-surface-container text-primary font-headline-sm text-xs hover:bg-surface-container-highest transition-colors"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => cvFileInputRef.current?.click()}
                        className="px-2.5 py-1.5 rounded-lg bg-surface-container text-on-surface font-headline-sm text-xs hover:bg-surface-container-highest transition-colors"
                      >
                        Replace
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => cvFileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 py-2 rounded-lg border border-dashed border-primary/35 hover:bg-surface-container font-body-sm text-body-sm text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      cloud_upload
                    </span>
                    <span>
                      Click to upload or replace default CV from Computer (.pdf, .docx)
                    </span>
                  </button>
                </div>
              </div>

              {/* Account Security Row */}
              <div className="flex items-center justify-between p-3.5 bg-surface-container-low rounded-xl">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[20px] text-on-surface-variant">
                    lock_reset
                  </span>
                  <div className="flex flex-col">
                    <span className="font-headline-sm text-headline-sm text-on-surface">
                      Account Security
                    </span>
                    <span className="font-mono-label text-[10px] text-on-surface-variant">
                      Bcrypt 12-round encrypted password
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(true)}
                  className="px-3.5 py-2 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface font-headline-sm text-xs transition-colors shadow-xs"
                >
                  Change Password
                </button>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-headline-sm text-headline-sm transition-all shadow-sm active:scale-[0.99]"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT 5 COLUMNS: Live Quick-Apply Console */}
          <div className="lg:col-span-5">
            <QuickApplyCardContent
              user={{ ...user, skills, defaultResume }}
              targetJob={selectedJobForQuickApply || jobs[1] || jobs[0]}
              allJobs={jobs}
              onSelectTargetJob={onSelectJobForQuickApply}
              onSubmitApplication={onSubmitApplication}
              isModal={false}
            />
          </div>
        </section>
      </div>
    </>
  );
}