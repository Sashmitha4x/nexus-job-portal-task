import React, { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import NexusSelect from "../ui/NexusSelect.jsx";

const NOTICE_OPTIONS = [
  { value: "Immediate Availability", label: "Immediate Availability" },
  { value: "2 Weeks Notice (Standard)", label: "2 Weeks Notice (Standard)" },
  { value: "1 Month Notice", label: "1 Month Notice" },
  { value: "2 Months Notice", label: "2 Months Notice" },
];

export function QuickApplyCardContent({
  user,
  targetJob,
  allJobs = [],
  onSelectTargetJob,
  onSubmitApplication,
  onCancel,
  isModal = false,
}) {
  const fileInputRef = useRef(null);
  const defaultCvName = user?.defaultResume?.fileName || "Sashmitha_CV_2026.pdf";
  const defaultCvSize = user?.defaultResume?.fileSizeKB || 420;

  const [cvMode, setCvMode] = useState("default"); // "default" | "custom"
  const [customCvFile, setCustomCvFile] = useState(null); // { fileName, fileSizeKB, dataUrl }
  const [coverNote, setCoverNote] = useState(
    "Dear Hiring Team, I have strong production experience across the target technical stack and distributed systems architecture. I would love to contribute to your engineering group."
  );
  const [noticePeriod, setNoticePeriod] = useState("2 Weeks Notice (Standard)");
  const [expectedSalary, setExpectedSalary] = useState(
    targetJob ? `$${Number(targetJob.salaryMin || 130000).toLocaleString()} / year` : "$135,000 / year"
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (targetJob?.salaryMin) {
      setExpectedSalary(`$${Number(targetJob.salaryMin).toLocaleString()} / year`);
    }
  }, [targetJob]);

  // Calculate live Skills Match % between Candidate's skills and Job's required skills
  const matchInfo = useMemo(() => {
    const jobSkills = targetJob?.skills || ["React", "Node.js", "TypeScript"];
    const userSkills = (user?.skills || ["React", "Node.js", "TypeScript", "MongoDB"]).map(
      (s) => s.toLowerCase()
    );
    if (jobSkills.length === 0) return { pct: 92, matched: ["React", "Node.js"] };

    const matched = jobSkills.filter((js) =>
      userSkills.some(
        (us) => js.toLowerCase().includes(us) || us.includes(js.toLowerCase())
      )
    );
    const pct = Math.min(
      98,
      Math.max(68, Math.round(((matched.length + 1) / (jobSkills.length + 1)) * 100))
    );
    return {
      pct,
      matched: matched.length > 0 ? matched.slice(0, 3) : jobSkills.slice(0, 3),
    };
  }, [targetJob, user]);

  const handleCustomFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCustomCvFile({
        fileName: file.name,
        fileSizeKB: Math.max(12, Math.round(file.size / 1024)),
        dataUrl: typeof reader.result === "string" ? reader.result : "",
      });
      setCvMode("custom");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!targetJob) return;

    const chosenFileName =
      cvMode === "custom" && customCvFile?.fileName
        ? customCvFile.fileName
        : defaultCvName;
    const chosenSizeKB =
      cvMode === "custom" && customCvFile?.fileSizeKB
        ? customCvFile.fileSizeKB
        : defaultCvSize;

    setSubmitting(true);
    const ok = await onSubmitApplication({
      jobId: targetJob.jobId,
      coverNote: coverNote.trim(),
      skills: user?.skills || targetJob.skills,
      noticePeriod,
      expectedSalary,
      resumeFileName: chosenFileName,
      resumeFileSizeKB: chosenSizeKB,
      resumeDataUrl:
        cvMode === "custom"
          ? customCvFile?.dataUrl || ""
          : user?.defaultResume?.fileDataUrl || "",
    });
    setSubmitting(false);
    if (ok && isModal && onCancel) {
      onCancel();
    }
  };

  const activeJobsOptions = allJobs
    .filter((j) => j.status === "Active")
    .map((j) => ({
      value: j.jobId,
      label: `#${j.jobId} — ${j.title} (${j.companyName})`,
    }));

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 shadow-sm border border-outline-variant/30 flex flex-col gap-4"
    >
      {/* Top Status Strip */}
      <div className="bg-surface-container-low rounded-xl p-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-secondary animate-pulse"></span>
          <span className="font-mono-label text-mono-label text-on-surface font-bold uppercase">
            {isModal ? "Direct Requisition Application" : "Quick-Apply Console"}
          </span>
        </div>
        <span className="font-mono-label text-[10px] text-on-surface-variant uppercase">
          Applicant View
        </span>
      </div>

      {/* Role Selector (When embedded in Dashboard, candidate can switch which role to apply to) */}
      {!isModal && activeJobsOptions.length > 1 && onSelectTargetJob && (
        <div>
          <label className="font-mono-label text-[10px] uppercase text-outline block mb-1">
            Select Target Requisition
          </label>
          <NexusSelect
            value={targetJob?.jobId || ""}
            onChange={onSelectTargetJob}
            options={activeJobsOptions}
            icon="work"
          />
        </div>
      )}

      {/* Target Role Header */}
      <div className="flex flex-col gap-1 pb-1">
        <span className="font-mono-label text-mono-label text-primary font-bold">
          REQUISITION #{targetJob?.jobId || "JOB-2026-002"}
        </span>
        <h4 className="font-headline-lg text-xl sm:text-headline-lg text-on-surface font-bold leading-snug">
          {targetJob?.title || "Backend Cloud Architect"}
        </h4>
        <span className="font-body-md text-body-sm sm:text-body-md text-on-surface-variant">
          {targetJob?.companyName || "Stratum Data Systems"} •{" "}
          {targetJob?.department || "Distributed Systems Group"}
        </span>
      </div>

      {/* Skills Match Banner */}
      <div className="bg-secondary-fixed/25 border border-secondary/20 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-secondary">
            verified
          </span>
          <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
            Skills Match: {matchInfo.pct}%
          </span>
        </div>
        <span className="font-mono-label text-mono-label text-secondary font-semibold truncate">
          {matchInfo.matched.join(" • ")}
        </span>
      </div>

      {/* CV Selection Radio Cards */}
      <div className="flex flex-col gap-2">
        <label className="font-headline-sm text-headline-sm text-on-surface">
          Select CV to Submit
        </label>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,image/*"
          onChange={handleCustomFileChange}
          className="hidden"
        />

        <div className="grid grid-cols-1 gap-2">
          {/* Option 1: Verified Default CV */}
          <label
            onClick={() => setCvMode("default")}
            className={`flex items-center justify-between p-3 rounded-xl cursor-pointer border transition-all ${
              cvMode === "default"
                ? "bg-surface-container-low border-primary-container/40 shadow-xs"
                : "bg-surface-container-lowest hover:bg-surface-container-low border-outline-variant/25"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <input
                type="radio"
                name="resumeSelection"
                checked={cvMode === "default"}
                onChange={() => setCvMode("default")}
                className="w-4 h-4 accent-primary shrink-0"
              />
              <div className="flex flex-col min-w-0">
                <span className="font-headline-sm text-headline-sm text-on-surface">
                  Use Verified Default CV
                </span>
                <span className="font-mono-data text-xs text-on-surface-variant truncate">
                  {defaultCvName} ({defaultCvSize} KB)
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-secondary text-[20px] shrink-0">
              check_circle
            </span>
          </label>

          {/* Option 2: Upload Role-Specific CV from Computer */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`flex items-center justify-between p-3 rounded-xl cursor-pointer border transition-all ${
              cvMode === "custom"
                ? "bg-surface-container-low border-primary-container/40 shadow-xs"
                : "bg-surface-container-lowest hover:bg-surface-container-low border-outline-variant/25"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <input
                type="radio"
                name="resumeSelection"
                checked={cvMode === "custom"}
                onChange={() => fileInputRef.current?.click()}
                className="w-4 h-4 accent-primary shrink-0"
              />
              <div className="flex flex-col min-w-0">
                <span className="font-headline-sm text-headline-sm text-on-surface">
                  {customCvFile
                    ? "Tailored CV Uploaded from Computer"
                    : "Upload Tailored CV from Computer"}
                </span>
                <span className="font-mono-data text-xs text-on-surface-variant truncate">
                  {customCvFile
                    ? `${customCvFile.fileName} (${customCvFile.fileSizeKB} KB)`
                    : "Click to select .pdf, .doc, or .docx"}
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-primary text-[20px] shrink-0">
              upload_file
            </span>
          </div>
        </div>
      </div>

      {/* Engineering Cover Note */}
      <div className="flex flex-col gap-1">
        <label className="font-headline-sm text-headline-sm text-on-surface flex items-center justify-between">
          <span>Engineering Note (Optional)</span>
          <span className="font-mono-label text-[10px] text-on-surface-variant">
            {coverNote.length} / 500 CHARS
          </span>
        </label>
        <textarea
          rows="3"
          maxLength={500}
          value={coverNote}
          onChange={(e) => setCoverNote(e.target.value)}
          placeholder="Highlight relevant architecture experience, GitHub links, or key achievements..."
          className="bg-surface-container-low text-on-surface font-body-sm text-body-sm p-3 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-primary-container/20 border border-outline-variant/25 transition-all resize-none"
        />
      </div>

      {/* Notice Period & Target Salary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="font-headline-sm text-headline-sm text-on-surface">
            Notice Period
          </label>
          <NexusSelect
            value={noticePeriod}
            onChange={setNoticePeriod}
            options={NOTICE_OPTIONS}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-headline-sm text-headline-sm text-on-surface">
            Target Salary (USD/yr)
          </label>
          <input
            type="text"
            value={expectedSalary}
            onChange={(e) => setExpectedSalary(e.target.value)}
            className="h-9 bg-surface-container-low text-on-surface font-mono-data text-mono-data px-3 rounded-lg outline-none focus:bg-white border border-outline-variant/25"
          />
        </div>
      </div>

      {/* Submit & Cancel Actions */}
      <div className="flex flex-col gap-2 pt-1">
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 rounded-xl bg-primary-container hover:bg-primary disabled:opacity-60 text-on-primary font-headline-sm text-headline-sm transition-all shadow-md flex items-center justify-center gap-2 active:scale-[0.99]"
        >
          <span>{submitting ? "Submitting Dossier..." : "Submit Application"}</span>
          <span className="material-symbols-outlined text-[18px]">
            arrow_forward
          </span>
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="w-full py-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface-variant font-headline-sm text-headline-sm transition-colors text-center"
          >
            Cancel / Close
          </button>
        )}
      </div>

      <div className="text-center font-mono-label text-[10px] text-on-surface-variant">
        Direct submission notifies employer hiring team immediately
      </div>
    </form>
  );
}

export default function QuickApplyModal({
  isOpen,
  user,
  targetJob,
  allJobs = [],
  onClose,
  onSubmitApplication,
}) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen || !targetJob) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] bg-on-surface/50 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-w-lg w-full my-auto animate-pop-in"
      >
        <QuickApplyCardContent
          user={user}
          targetJob={targetJob}
          allJobs={allJobs}
          onSubmitApplication={onSubmitApplication}
          onCancel={onClose}
          isModal={true}
        />
      </div>
    </div>,
    document.body
  );
}