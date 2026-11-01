import React, { useState, useMemo, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  formatSalaryBand,
  JOB_CATEGORIES,
  JOB_TYPES,
} from "../../constants/nexusConstants.js";
import NexusSelect from "../ui/NexusSelect.jsx";
import NexusExportMenu from "../ui/NexusExportMenu.jsx";

const INDUSTRY_OPTIONS = [
  { value: "Enterprise Cloud & SaaS", label: "Cloud & DevOps Architecture" },
  {
    value: "FinTech Distributed Infrastructure",
    label: "FinTech Distributed Infrastructure",
  },
  {
    value: "Applied AI & Foundation Models",
    label: "AI & Data Engineering Platform",
  },
  { value: "Design Systems & UI Tooling", label: "Design Systems & UI Tooling" },
  { value: "Cloud Security & Identity", label: "Zero-Trust Cloud Security" },
];

const WORK_MODE_OPTIONS = [
  { value: "Remote", label: "Remote First" },
  { value: "Hybrid", label: "Hybrid" },
  { value: "On-Site", label: "On-Site (HQ)" },
];

const REJECTION_PRESETS = [
  "Role requires 5+ years of production distributed systems and cluster orchestration experience. We have retained your dossier for upcoming mid-level openings.",
  "Position has been filled by an internal architectural transfer. We were impressed by your React and Node.js portfolio.",
  "Mismatch on required timezone overlap and hybrid on-site availability for this specific engineering squad.",
];

const generateNextJobCode = (jobs = []) => {
  const max = jobs.reduce((acc, j) => {
    const m = String(j.jobId || "").match(/JOB-\d{4}-(\d+)/i);
    const n = m ? parseInt(m[1], 10) : 0;
    return n > acc ? n : acc;
  }, 0);
  return `JOB-2026-${String(max + 1).padStart(3, "0")}`;
};

const defaultExpiryStr = () =>
  new Date(Date.now() + 30 * 86400 * 1000).toISOString().slice(0, 10);

// Client-side square logo compressor (Max 360x360 JPEG)
const compressLogoFile = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 360;
        let w = img.width;
        let h = img.height;
        if (w > h && w > maxDim) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else if (h > maxDim) {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.88));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export default function EmployerStudioView({
  user,
  companies = [],
  jobs = [],
  applications = [],
  currency = "USD",
  onSaveCompanyProfile,
  onCreateJob,
  onUpdateJob,
  onDeleteJob,
  onUpdateApplicationStatus,
  onInspectPublicCompany,
  onViewPublicBoard,
  onExportPDF,
  onExportExcel,
  onExportCSV,
  onShowToast,
}) {
  // Sub-Navigation Tabs: "ALL" | "COMPANY" | "JOBS" | "PIPELINE"
  const [studioTab, setStudioTab] = useState("ALL");

  // Find Employer's Company Profile
  const myCompany = useMemo(() => {
    return (
      companies.find(
        (c) =>
          (c.employerEmail &&
            user?.email &&
            c.employerEmail.toLowerCase() === user.email.toLowerCase()) ||
          (user?.companyName &&
            c.companyName.toLowerCase() === user.companyName.toLowerCase())
      ) ||
      companies[0] || {
        companyId: "CMP-2026-001",
        companyName: user?.companyName || "Auspify Cloud Labs",
        initials: "ACL",
        logoUrl: "",
        industry: "Enterprise Cloud & SaaS",
        location: "Colombo 07, Sri Lanka • Hybrid / Remote",
        website: "https://auspify.com",
        companySize: "140+ Engineers",
        fundingStage: "Series B",
        description:
          "Auspify Cloud Labs is an elite cloud architecture and distributed systems engineering studio building fault-tolerant infrastructure and scalable backend services for enterprise clients worldwide.",
      }
    );
  }, [companies, user]);

  // Company Profile Editor State
  const logoInputRef = useRef(null);
  const [compName, setCompName] = useState(
    myCompany.companyName || "Auspify Cloud Labs"
  );
  const [compLogo, setCompLogo] = useState(myCompany.logoUrl || "");
  const [compIndustry, setCompIndustry] = useState(
    myCompany.industry || "Enterprise Cloud & SaaS"
  );
  const [compWebsite, setCompWebsite] = useState(
    myCompany.website || "https://auspify.com"
  );
  const [compLocation, setCompLocation] = useState(
    myCompany.location || "Colombo 07, Sri Lanka • Hybrid / Remote"
  );
  const [compDesc, setCompDesc] = useState(
    myCompany.description ||
      "Auspify Cloud Labs is an elite cloud architecture and distributed systems engineering studio building fault-tolerant infrastructure and scalable backend services for enterprise clients worldwide."
  );
  const [savingCompany, setSavingCompany] = useState(false);

  useEffect(() => {
    setCompName(myCompany.companyName || "Auspify Cloud Labs");
    setCompLogo(myCompany.logoUrl || "");
    setCompIndustry(myCompany.industry || "Enterprise Cloud & SaaS");
    setCompWebsite(myCompany.website || "https://auspify.com");
    setCompLocation(
      myCompany.location || "Colombo 07, Sri Lanka • Hybrid / Remote"
    );
    setCompDesc(myCompany.description || "");
  }, [myCompany]);

  // Employer's Jobs (Scoped to this Employer or ACL default showcase)
  const myJobs = useMemo(() => {
    const owned = jobs.filter(
      (j) =>
        (j.employerEmail &&
          user?.email &&
          j.employerEmail.toLowerCase() === user.email.toLowerCase()) ||
        j.companyId === myCompany.companyId ||
        j.companyName.toLowerCase() === compName.toLowerCase()
    );
    return owned.length > 0 ? owned : jobs.slice(0, 4);
  }, [jobs, user, myCompany.companyId, compName]);

  // Applicant Pipeline Scoped to Employer
  const [pipelineStage, setPipelineStage] = useState("ALL"); // "ALL" | "Applied" | "Under Review" | "Interview Scheduled" | "Offer Extended" | "Rejected"
  const [candidateSearch, setCandidateSearch] = useState("");

  const filteredCandidates = useMemo(() => {
    const q = candidateSearch.toLowerCase().trim();
    return applications.filter((a) => {
      if (pipelineStage !== "ALL" && a.status !== pipelineStage) return false;
      if (!q) return true;
      return (
        a.candidateName.toLowerCase().includes(q) ||
        a.jobId.toLowerCase().includes(q) ||
        a.jobTitle.toLowerCase().includes(q) ||
        (a.skills || []).some((s) => s.toLowerCase().includes(q))
      );
    });
  }, [applications, pipelineStage, candidateSearch]);

  // Create / Edit Job Vacancy Console State
  const [jobFormMode, setJobFormMode] = useState("create"); // "create" | "edit"
  const [mobileJobFormOpen, setMobileJobFormOpen] = useState(false);
  const [editingJobId, setEditingJobId] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobCategory, setJobCategory] = useState("Engineering, Systems & AI");
  const [jobType, setJobType] = useState("Full-Time");
  const [jobWorkMode, setJobWorkMode] = useState("Remote");
  const [jobLocation, setJobLocation] = useState(
    "Remote (Global / UTC-5 to UTC+6)"
  );
  const [jobExpiresAt, setJobExpiresAt] = useState(defaultExpiryStr);
  const [salaryMin, setSalaryMin] = useState("120000");
  const [salaryMax, setSalaryMax] = useState("150000");
  const [stackTags, setStackTags] = useState(["Golang", "Kubernetes", "gRPC"]);
  const [newTagInput, setNewTagInput] = useState("");
  const [showAddTagInput, setShowAddTagInput] = useState(false);
  const [jobResponsibilities, setJobResponsibilities] = useState("");
  const [submittingJob, setSubmittingJob] = useState(false);

  // Action Modals State:
  // 1. Schedule Interview Modal
  const [interviewModalApp, setInterviewModalApp] = useState(null);
  const [interviewDateInput, setInterviewDateInput] = useState(
    "Oct 30, 2026 • 10:30 AM IST"
  );
  const [interviewNotesInput, setInterviewNotesInput] = useState(
    "Technical System Architecture Round (Google Meet • 60 min with Lead Architect)"
  );

  // 2. Extend Offer Confirmation Modal
  const [offerModalApp, setOfferModalApp] = useState(null);
  const [offerPackageInput, setOfferPackageInput] = useState(
    "$165,000 USD/yr base + 0.25% equity options + comprehensive health & wellness package."
  );

  // 3. Reject with Constructive Feedback Modal
  const [rejectModalApp, setRejectModalApp] = useState(null);
  const [rejectPreset, setRejectPreset] = useState(REJECTION_PRESETS[0]);
  const [customRejectReason, setCustomRejectReason] = useState("");

  // 4. Delete Job Confirmation Modal
  const [jobToDelete, setJobToDelete] = useState(null);

  const compInitials = useMemo(() => {
    return (
      compName
        .trim()
        .split(/\s+/)
        .slice(0, 3)
        .map((w) => w[0]?.toUpperCase() || "")
        .join("") || "ACL"
    );
  }, [compName]);

  // Immediately compresses and saves the uploaded company logo across CompanyProfile, Jobs & Applications
  const handleLogoFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressLogoFile(file);
      setCompLogo(dataUrl);
      await onSaveCompanyProfile({
        companyId: myCompany.companyId,
        companyName: compName.trim(),
        logoUrl: dataUrl,
        industry: compIndustry,
        website: compWebsite.trim(),
        location: compLocation.trim(),
        description: compDesc.trim(),
      });
    } catch {
      onShowToast(
        "Image Error",
        "Could not process the selected image file.",
        true
      );
    }
    e.target.value = "";
  };

  const handleRemoveLogo = async () => {
    setCompLogo("");
    await onSaveCompanyProfile({
      companyId: myCompany.companyId,
      companyName: compName.trim(),
      logoUrl: "",
      industry: compIndustry,
      website: compWebsite.trim(),
      location: compLocation.trim(),
      description: compDesc.trim(),
    });
  };

  const handleSaveCompany = async (e) => {
    e.preventDefault();
    setSavingCompany(true);
    await onSaveCompanyProfile({
      companyId: myCompany.companyId,
      companyName: compName.trim(),
      logoUrl: compLogo,
      industry: compIndustry,
      website: compWebsite.trim(),
      location: compLocation.trim(),
      description: compDesc.trim(),
    });
    setSavingCompany(false);
  };

  const resetJobForm = () => {
    setJobFormMode("create");
    setEditingJobId("");
    setJobTitle("");
    setJobCategory("Engineering, Systems & AI");
    setJobType("Full-Time");
    setJobWorkMode("Remote");
    setJobLocation("Remote (Global / UTC-5 to UTC+6)");
    setJobExpiresAt(defaultExpiryStr());
    setSalaryMin("120000");
    setSalaryMax("150000");
    setStackTags(["Golang", "Kubernetes", "gRPC"]);
    setJobResponsibilities("");
  };

  const handleEditJobClick = (job) => {
    setJobFormMode("edit");
    setEditingJobId(job.jobId);
    setJobTitle(job.title);
    setJobCategory(job.category || "Engineering, Systems & AI");
    setJobType(job.jobType || "Full-Time");
    setJobWorkMode(job.workMode || "Remote");
    setJobLocation(job.location || "Colombo / Remote");
    setJobExpiresAt(
      job.expiresAt
        ? new Date(job.expiresAt).toISOString().slice(0, 10)
        : defaultExpiryStr()
    );
    setSalaryMin(String(job.salaryMin || 120000));
    setSalaryMax(String(job.salaryMax || 150000));
    setStackTags(
      job.skills?.length ? job.skills : ["React", "Node.js", "TypeScript"]
    );
    setJobResponsibilities(
      Array.isArray(job.responsibilities) && job.responsibilities.length > 0
        ? job.responsibilities.join("\n")
        : job.overview || ""
    );
    if (window.innerWidth < 1024) {
      setMobileJobFormOpen(true);
    } else {
      document
        .getElementById("jobVacancyCard")
        ?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleAddStackTag = () => {
    const clean = newTagInput.trim();
    if (!clean) return;
    if (!stackTags.some((t) => t.toLowerCase() === clean.toLowerCase())) {
      setStackTags((prev) => [...prev, clean]);
    }
    setNewTagInput("");
    setShowAddTagInput(false);
  };

const handleJobFormSubmit = async (e) => {
    e.preventDefault();
    if (!jobTitle.trim()) return;

    setSubmittingJob(true);
    const lines = jobResponsibilities
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const existingJob = jobs.find((j) => j.jobId === editingJobId);
    const isResolvingHidden =
      jobFormMode === "edit" && existingJob?.status === "Hidden";

    const payload = {
      companyId: myCompany.companyId || "CMP-2026-001",
      companyName: compName.trim(),
      companyInitials: compInitials,
      companyLogo: compLogo,
      title: jobTitle.trim(),
      category: jobCategory,
      jobType,
      workMode: jobWorkMode,
      location: jobLocation.trim() || "Remote",
      expiresAt: jobExpiresAt,
      salaryMin: Number(String(salaryMin).replace(/[^0-9]/g, "")) || 120000,
      salaryMax: Number(String(salaryMax).replace(/[^0-9]/g, "")) || 150000,
      skills:
        stackTags.length > 0 ? stackTags : ["React", "Node.js", "TypeScript"],
      overview:
        lines[0] ||
        `${compName} is seeking a ${jobTitle.trim()} to architect scalable distributed systems and high-reliability cloud services.`,
      responsibilities:
        lines.length > 0
          ? lines
          : [
              `Architect and ship production ${stackTags.join(
                ", "
              )} services with high test coverage.`,
              "Collaborate with Principal Engineers on system design RFCs and latency optimization.",
            ],
      status: isResolvingHidden ? "Pending Review" : "Active",
      employerResolutionNote: isResolvingHidden
        ? `Resolved Admin feedback ("${existingJob.removalReason}") and updated requisition details.`
        : "",
    };

    let ok = false;
    if (jobFormMode === "create") {
      ok = await onCreateJob(payload);
    } else {
      ok = await onUpdateJob(editingJobId, payload);
    }
    setSubmittingJob(false);

    if (ok) {
      resetJobForm();
      setMobileJobFormOpen(false);
    }
  };

  const handleInspectCandidateCv = (app) => {
    if (app.resumeDataUrl) {
      const a = document.createElement("a");
      a.href = app.resumeDataUrl;
      a.download = app.resumeFileName || `${app.candidateName}_CV.pdf`;
      a.click();
      return;
    }
    const win = window.open("", "_blank", "width=860,height=720");
    if (!win) return;
    win.document.write(`
      <html>
        <head><title>Candidate_Dossier_${app.applicationId}</title></head>
        <body style="font-family:'Segoe UI',Inter,sans-serif;padding:36px;color:#0b1c30;">
          <div style="border-bottom:2px solid #3525cd;padding-bottom:12px;margin-bottom:20px;">
            <span style="font-family:monospace;color:#3525cd;font-weight:bold;">VERIFIED CANDIDATE DOSSIER • #${
              app.applicationId
            }</span>
            <h1 style="margin:6px 0 4px;">${app.candidateName}</h1>
            <p style="margin:0;color:#464555;">${
              app.candidateHeadline || "Senior Software Engineer"
            } • ${app.candidateEmail} • ${
      app.candidatePhone || "+94 77 123 4567"
    }</p>
          </div>
          <h3>Applied Requisition: #${app.jobId} — ${app.jobTitle}</h3>
          <p><strong>Submitted CV Document:</strong> ${app.resumeFileName} (${
      app.resumeFileSizeKB || 420
    } KB)</p>
          <p><strong>Target Compensation:</strong> ${
            app.expectedSalary || "$135,000 / year"
          } • <strong>Notice Period:</strong> ${
      app.noticePeriod || "2 Weeks"
    }</p>
          <h4>Verified Technical Stack</h4>
          <p>${(app.skills || []).join(" • ")}</p>
          <h4>Candidate Engineering Note</h4>
          <blockquote style="background:#eff4ff;padding:14px;border-left:4px solid #3525cd;border-radius:6px;">
            ${
              app.coverNote ||
              "Submitted via Auspify Nexus Direct Application Engine."
            }
          </blockquote>
          <script>window.onload = () => setTimeout(() => window.print(), 250);</script>
        </body>
      </html>
    `);
    win.document.close();
  };

  const liveJobsCount = myJobs.filter((j) => j.status === "Active").length;
  const pausedJobsCount = myJobs.filter((j) => j.status !== "Active").length;

  const renderJobVacancyForm = (isMobile = false) => (
    <form onSubmit={handleJobFormSubmit} className="flex flex-col gap-4">
      <div className="flex items-center justify-between pb-3 border-b border-outline-variant/25">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">
            post_add
          </span>
          <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
            {jobFormMode === "create"
              ? "Create Job Vacancy"
              : `Edit #${editingJobId}`}
          </h3>
        </div>
        <span className="font-mono-label text-[10px] px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-bold">
          #
          {jobFormMode === "create"
            ? `${generateNextJobCode(jobs)} (AUTO)`
            : editingJobId}
        </span>
      </div>

      {/* Position Title */}
      <div className="flex flex-col gap-1">
        <label className="font-mono-label text-mono-label uppercase text-on-surface-variant">
          Position Title
        </label>
        <input
          type="text"
          required
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          placeholder="e.g. Senior Distributed Systems Engineer"
          className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-on-surface font-headline-sm text-body-md focus:outline-none focus:bg-white border border-outline-variant/25 transition-all"
        />
      </div>

      {/* Engineering Domain */}
      <div className="flex flex-col gap-1">
        <label className="font-mono-label text-mono-label uppercase text-on-surface-variant">
          Engineering Domain
        </label>
        <NexusSelect
          value={jobCategory}
          onChange={setJobCategory}
          options={JOB_CATEGORIES.filter((c) => c.value !== "ALL")}
          icon="category"
        />
      </div>

      {/* Type & Work Mode */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div className="flex flex-col gap-1">
          <label className="font-mono-label text-mono-label uppercase text-on-surface-variant">
            Type
          </label>
          <NexusSelect
            value={jobType}
            onChange={setJobType}
            options={JOB_TYPES.filter((t) => t.value !== "ALL")}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-mono-label text-mono-label uppercase text-on-surface-variant">
            Work Mode
          </label>
          <NexusSelect
            value={jobWorkMode}
            onChange={setJobWorkMode}
            options={WORK_MODE_OPTIONS}
          />
        </div>
      </div>

      {/* Timezone / Location Bounds */}
      <div className="flex flex-col gap-1">
        <label className="font-mono-label text-mono-label uppercase text-on-surface-variant">
          Timezone / Location Bounds
        </label>
        <input
          type="text"
          required
          value={jobLocation}
          onChange={(e) => setJobLocation(e.target.value)}
          placeholder="Remote (Global / UTC-5 to UTC+6)"
          className="w-full px-3.5 py-2 rounded-xl bg-surface-container-low text-on-surface font-body-sm focus:outline-none focus:bg-white border border-outline-variant/25"
        />
      </div>

      {/* Application Deadline / Job Expiry Date */}
      <div className="flex flex-col gap-1">
        <label className="font-mono-label text-mono-label uppercase text-on-surface-variant flex items-center justify-between">
          <span>Application Deadline / Expiry Date</span>
          <span className="text-[10px] text-secondary font-semibold">
            AUTO-EXPIRES
          </span>
        </label>
        <input
          type="date"
          required
          min={new Date().toISOString().slice(0, 10)}
          value={jobExpiresAt}
          onChange={(e) => setJobExpiresAt(e.target.value)}
          className="w-full px-3.5 py-2 rounded-xl bg-surface-container-low text-on-surface font-mono-data text-body-sm focus:outline-none focus:bg-white border border-outline-variant/25"
        />
      </div>

      {/* Annual Compensation */}
      <div className="flex flex-col gap-1">
        <label className="font-mono-label text-mono-label uppercase text-on-surface-variant">
          Annual Compensation (USD / YR)
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-on-surface-variant font-mono-data text-body-sm">
              $
            </span>
            <input
              type="number"
              required
              min="10000"
              step="1000"
              value={salaryMin}
              onChange={(e) => setSalaryMin(e.target.value)}
              className="w-full pl-7 pr-2.5 py-2 rounded-xl bg-surface-container-low text-on-surface font-mono-data text-body-sm focus:outline-none border border-outline-variant/25"
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-on-surface-variant font-mono-data text-body-sm">
              $
            </span>
            <input
              type="number"
              required
              min="10000"
              step="1000"
              value={salaryMax}
              onChange={(e) => setSalaryMax(e.target.value)}
              className="w-full pl-7 pr-2.5 py-2 rounded-xl bg-surface-container-low text-on-surface font-mono-data text-body-sm focus:outline-none border border-outline-variant/25"
            />
          </div>
        </div>
      </div>

      {/* Mandatory Stack Chips */}
      <div className="flex flex-col gap-1">
        <label className="font-mono-label text-mono-label uppercase text-on-surface-variant">
          Mandatory Stack Chips
        </label>
        <div className="flex items-center gap-1.5 flex-wrap p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/20">
          {stackTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container-lowest text-on-surface font-mono-data text-mono-label shadow-xs"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() =>
                  setStackTags((prev) => prev.filter((item) => item !== tag))
                }
                className="hover:text-error text-on-surface-variant text-[12px] ml-0.5"
              >
                ✕
              </button>
            </span>
          ))}

          {showAddTagInput ? (
            <div className="inline-flex items-center gap-1">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddStackTag();
                  }
                }}
                placeholder="e.g. Rust"
                autoFocus
                className="px-2 py-0.5 rounded bg-white text-xs border border-primary-container focus:outline-none w-24"
              />
              <button
                type="button"
                onClick={handleAddStackTag}
                className="px-2 py-0.5 rounded bg-primary-container text-white font-mono-label text-[10px]"
              >
                Add
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowAddTagInput(true)}
              className="px-2.5 py-1 rounded-lg bg-primary-fixed text-on-primary-fixed font-mono-label text-mono-label hover:opacity-90"
            >
              + Add Tag
            </button>
          )}
        </div>
      </div>

      {/* Deliverables & Responsibilities */}
      <div className="flex flex-col gap-1">
        <label className="font-mono-label text-mono-label uppercase text-on-surface-variant">
          Deliverables &amp; Responsibilities
        </label>
        <textarea
          rows="3"
          required
          value={jobResponsibilities}
          onChange={(e) => setJobResponsibilities(e.target.value)}
          placeholder="Describe the candidate's core daily technical deliveries (one per line)..."
          className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-on-surface font-body-sm focus:outline-none focus:bg-white border border-outline-variant/25 resize-none"
        />
      </div>

      <div className="flex flex-col gap-2 pt-1">
        <button
          type="submit"
          disabled={submittingJob}
          className="w-full py-3 rounded-xl bg-primary hover:bg-primary-container disabled:opacity-60 text-on-primary font-headline-sm text-headline-sm font-bold shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
        >
          <span>
            {submittingJob
              ? "Deploying Requisition..."
              : jobFormMode === "create"
              ? "Publish Vacancy Immediately"
              : "Save & Republish Requisition"}
          </span>
          <span className="material-symbols-outlined text-[18px]">
            arrow_forward
          </span>
        </button>

        {(jobFormMode === "edit" || isMobile) && (
          <button
            type="button"
            onClick={() => {
              resetJobForm();
              if (isMobile) setMobileJobFormOpen(false);
            }}
            className="w-full py-2 rounded-xl bg-surface-container text-on-surface-variant font-headline-sm text-xs"
          >
            {isMobile ? "Close Drawer" : "Cancel Edit / Reset to New Job"}
          </button>
        )}
      </div>

      <p className="font-mono-label text-[10px] text-on-surface-variant text-center">
        Instant deployment to Auspify Nexus Public Job Board. Candidates
        auto-routed to live pipeline.
      </p>
    </form>
  );

  return (
    <>
      {/* =====================================================================
          MODAL 1: SCHEDULE / RESCHEDULE INTERVIEW MODAL
         ===================================================================== */}
      {interviewModalApp &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-[100] bg-on-surface/50 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setInterviewModalApp(null)}
          >
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await onUpdateApplicationStatus(
                  interviewModalApp.applicationId,
                  {
                    status: "Interview Scheduled",
                    interviewDate: interviewDateInput.trim(),
                    interviewDetails: interviewNotesInput.trim(),
                  }
                );
                setInterviewModalApp(null);
              }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl border border-outline-variant/40 flex flex-col gap-4 animate-pop-in"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">
                    videocam
                  </span>
                </div>
                <div>
                  <h3 className="font-headline-md font-bold text-on-surface">
                    Schedule Technical Interview
                  </h3>
                  <p className="font-body-sm text-on-surface-variant">
                    Candidate: <strong>{interviewModalApp.candidateName}</strong>{" "}
                    (#{interviewModalApp.jobId})
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="font-mono-label text-[11px] uppercase text-on-surface block mb-1">
                    Interview Date &amp; Time Slot
                  </label>
                  <input
                    type="text"
                    required
                    value={interviewDateInput}
                    onChange={(e) => setInterviewDateInput(e.target.value)}
                    placeholder="e.g. Oct 30, 2026 • 10:30 AM IST"
                    className="w-full h-10 px-3.5 rounded-xl bg-surface-container-low text-on-surface font-mono-data"
                  />
                </div>
                <div>
                  <label className="font-mono-label text-[11px] uppercase text-on-surface block mb-1">
                    Meeting Format &amp; Interviewer Details
                  </label>
                  <textarea
                    rows="3"
                    required
                    value={interviewNotesInput}
                    onChange={(e) => setInterviewNotesInput(e.target.value)}
                    className="w-full p-3 rounded-xl bg-surface-container-low text-on-surface font-body-sm resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setInterviewModalApp(null)}
                  className="px-4 py-2 rounded-xl bg-surface-container text-on-surface font-headline-sm text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary-container hover:bg-primary text-white font-headline-sm text-xs shadow-sm"
                >
                  Confirm &amp; Dispatch Invite
                </button>
              </div>
            </form>
          </div>,
          document.body
        )}

      {/* =====================================================================
          MODAL 2: ADVANCE TO OFFER STAGE CONFIRMATION MODAL
         ===================================================================== */}
      {offerModalApp &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-[100] bg-on-surface/50 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setOfferModalApp(null)}
          >
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await onUpdateApplicationStatus(offerModalApp.applicationId, {
                  status: "Offer Extended",
                  offerDetails: offerPackageInput.trim(),
                });
                setOfferModalApp(null);
              }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl border border-outline-variant/40 flex flex-col gap-4 animate-pop-in"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary text-on-secondary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">
                    celebration
                  </span>
                </div>
                <div>
                  <h3 className="font-headline-md font-bold text-on-surface">
                    Extend Formal Offer to {offerModalApp.candidateName}?
                  </h3>
                  <p className="font-body-sm text-on-surface-variant">
                    This advances #{offerModalApp.applicationId} to Stage 4
                    (Offer Extended) on the candidate&apos;s live tracker.
                  </p>
                </div>
              </div>

              <div>
                <label className="font-mono-label text-[11px] uppercase text-on-surface block mb-1">
                  Formal Offer Package Summary
                </label>
                <textarea
                  rows="3"
                  required
                  value={offerPackageInput}
                  onChange={(e) => setOfferPackageInput(e.target.value)}
                  className="w-full p-3 rounded-xl bg-surface-container-low text-on-surface font-body-sm resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOfferModalApp(null)}
                  className="px-4 py-2 rounded-xl bg-surface-container text-on-surface font-headline-sm text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-secondary text-on-secondary font-headline-sm text-xs shadow-sm"
                >
                  Deliver Official Offer →
                </button>
              </div>
            </form>
          </div>,
          document.body
        )}

      {/* =====================================================================
          MODAL 3: DECLINE CANDIDACY WITH CONSTRUCTIVE FEEDBACK MODAL
         ===================================================================== */}
      {rejectModalApp &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-[100] bg-on-surface/50 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setRejectModalApp(null)}
          >
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const finalReason =
                  rejectPreset === "CUSTOM"
                    ? customRejectReason.trim()
                    : rejectPreset;
                if (!finalReason) return;
                await onUpdateApplicationStatus(rejectModalApp.applicationId, {
                  status: "Rejected",
                  rejectionReason: finalReason,
                });
                setRejectModalApp(null);
                setCustomRejectReason("");
              }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-outline-variant/40 flex flex-col gap-4 animate-pop-in"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-error-container text-on-error-container flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">
                    comment
                  </span>
                </div>
                <div>
                  <h3 className="font-headline-md font-bold text-on-surface">
                    Log Decision &amp; Constructive Feedback
                  </h3>
                  <p className="font-body-sm text-on-surface-variant">
                    Select or write a constructive exit note for{" "}
                    <strong>{rejectModalApp.candidateName}</strong>. This note
                    is shared directly on the candidate&apos;s application card.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {REJECTION_PRESETS.map((preset, i) => (
                  <label
                    key={i}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer text-body-sm ${
                      rejectPreset === preset
                        ? "bg-surface-container-low border-primary-container font-medium text-on-surface"
                        : "border-outline-variant/30 text-on-surface-variant"
                    }`}
                  >
                    <input
                      type="radio"
                      name="rejectPreset"
                      checked={rejectPreset === preset}
                      onChange={() => setRejectPreset(preset)}
                      className="mt-1 accent-primary shrink-0"
                    />
                    <span>{preset}</span>
                  </label>
                ))}

                <label
                  className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer text-body-sm ${
                    rejectPreset === "CUSTOM"
                      ? "bg-surface-container-low border-primary-container font-medium text-on-surface"
                      : "border-outline-variant/30 text-on-surface-variant"
                  }`}
                >
                  <input
                    type="radio"
                    name="rejectPreset"
                    checked={rejectPreset === "CUSTOM"}
                    onChange={() => setRejectPreset("CUSTOM")}
                    className="accent-primary shrink-0"
                  />
                  <span>Write custom evaluation note...</span>
                </label>

                {rejectPreset === "CUSTOM" && (
                  <textarea
                    rows="3"
                    required
                    value={customRejectReason}
                    onChange={(e) => setCustomRejectReason(e.target.value)}
                    placeholder="Provide specific, constructive engineering feedback..."
                    className="w-full p-3 rounded-xl bg-surface-container-low text-body-sm focus:outline-none border border-primary-container"
                  />
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalApp(null)}
                  className="px-4 py-2 rounded-xl bg-surface-container text-on-surface font-headline-sm text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-error text-on-error font-headline-sm text-xs shadow-sm"
                >
                  Log Decision &amp; Notify Candidate
                </button>
              </div>
            </form>
          </div>,
          document.body
        )}

      {/* =====================================================================
          MODAL 4: DELETE JOB REQUISITION CONFIRMATION MODAL
         ===================================================================== */}
      {jobToDelete &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-[100] bg-on-surface/50 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setJobToDelete(null)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl border border-outline-variant/40 flex flex-col gap-4 animate-pop-in"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-error-container text-error flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">
                    delete_forever
                  </span>
                </div>
                <div>
                  <h3 className="font-headline-md font-bold text-on-surface">
                    Remove Requisition #{jobToDelete.jobId}?
                  </h3>
                  <p className="font-body-sm text-on-surface-variant mt-1">
                    Are you sure you want to permanently delete{" "}
                    <strong>{jobToDelete.title}</strong> from the public job
                    board?
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setJobToDelete(null)}
                  className="px-4 py-2 rounded-xl bg-surface-container text-on-surface font-headline-sm text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await onDeleteJob(jobToDelete.jobId);
                    setJobToDelete(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-error text-white font-headline-sm text-xs shadow-sm"
                >
                  Yes, Delete Requisition
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Mobile Slide-Up Job Vacancy Drawer (<1024px) */}
      {mobileJobFormOpen &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            className="lg:hidden fixed inset-0 z-[100] bg-on-surface/50 backdrop-blur-sm flex flex-col justify-end"
            onClick={() => setMobileJobFormOpen(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-surface-container-lowest rounded-t-3xl p-5 max-h-[90vh] overflow-y-auto animate-slide-up"
            >
              {renderJobVacancyForm(true)}
            </div>
          </div>,
          document.body
        )}

      {/* Hidden File Input for Company Logo */}
      <input
        ref={logoInputRef}
        type="file"
        accept="image/*"
        onChange={handleLogoFileChange}
        className="hidden"
      />

      <div className="flex flex-col w-full gap-6 animate-fade-up">
        {/* TOP SECTION HEADER & DASHBOARD CONTROLS */}
        <div className="w-full bg-surface-container-lowest p-5 sm:p-6 shadow-sm rounded-2xl border border-outline-variant/25">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-5">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="font-headline-xl text-2xl sm:text-headline-lg font-bold text-on-surface">
                  Employer Recruitment HQ
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-mono-label text-mono-label font-semibold">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                  ATS CORE ENGINE ONLINE
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container text-primary font-mono-label text-[10px] font-semibold">
                  QUOTA: {myJobs.length}/25 ACTIVE
                </span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Orchestrate public listings, technical candidate pipelines, and
                architectural hiring benchmarks for{" "}
                <strong className="text-on-surface font-semibold">
                  {compName}
                </strong>
                .
              </p>
            </div>

            {/* Action Group */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={onViewPublicBoard}
                className="h-10 inline-flex items-center gap-1.5 px-3.5 py-2 bg-surface-container-lowest hover:bg-surface-container-low text-on-surface font-headline-sm text-xs sm:text-headline-sm rounded-xl border border-outline-variant/40 transition-colors"
              >
                <span className="material-symbols-outlined text-[17px] text-primary">
                  open_in_new
                </span>
                <span>View Public Job Board</span>
              </button>

              <NexusExportMenu
                label="Export Pipeline"
                onExportExcel={() => onExportExcel(filteredCandidates, compName)}
                onExportCSV={() => onExportCSV(filteredCandidates)}
                onExportPDF={() => onExportPDF(filteredCandidates, compName)}
              />

              <button
                type="button"
                onClick={() => {
                  resetJobForm();
                  if (window.innerWidth < 1024) {
                    setMobileJobFormOpen(true);
                  } else {
                    document
                      .getElementById("jobVacancyCard")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="h-10 inline-flex items-center gap-1.5 px-4 py-2 bg-primary-container text-on-primary font-headline-sm text-xs sm:text-headline-sm rounded-xl shadow-sm hover:bg-primary transition-all whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-[18px]">
                  add_circle
                </span>
                <span>+ Create New Job</span>
              </button>
            </div>
          </div>

          {/* Sub-Navigation Segment Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-surface-container-low p-1.5 rounded-xl">
            {[
              { id: "ALL", label: "All Recruitment Modules", icon: "dashboard" },
              {
                id: "COMPANY",
                label: "Company Profile Editor",
                icon: "apartment",
              },
              {
                id: "JOBS",
                label: "Job Posting Console",
                icon: "work",
                badge: `${myJobs.length} Listings`,
              },
              {
                id: "PIPELINE",
                label: "Applicant Pipeline Manager",
                icon: "groups",
                badge: `${applications.length} Active`,
              },
            ].map((t) => {
              const active = studioTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setStudioTab(t.id)}
                  className={`px-3.5 py-2 rounded-lg font-headline-sm text-xs sm:text-headline-sm transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
                    active
                      ? "bg-primary-container text-on-primary font-semibold shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {t.icon}
                  </span>
                  <span>{t.label}</span>
                  {t.badge && (
                    <span
                      className={`font-mono-label text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                        active
                          ? "bg-primary text-on-primary"
                          : "bg-surface-container-highest text-on-surface"
                      }`}
                    >
                      {t.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* =====================================================================
            MODULE 1: COMPANY PROFILE MANAGEMENT CARD
           ===================================================================== */}
        {(studioTab === "ALL" || studioTab === "COMPANY") && (
          <div className="w-full bg-surface-container-lowest p-5 sm:p-6 rounded-2xl shadow-sm border border-outline-variant/25">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 mb-6 border-b border-outline-variant/20 gap-3">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[24px]">
                    corporate_fare
                  </span>
                  <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
                    Company Profile &amp; Public Showcase
                  </h2>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  Real-time public listing brand representation for Auspify
                  Nexus Candidates
                </p>
              </div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  type="button"
                  onClick={() =>
                    onInspectPublicCompany({
                      ...myCompany,
                      companyName: compName,
                      initials: compInitials,
                      logoUrl: compLogo,
                      industry: compIndustry,
                      website: compWebsite,
                      location: compLocation,
                      description: compDesc,
                    })
                  }
                  className="px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-primary font-headline-sm text-xs inline-flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[15px]">
                    visibility
                  </span>
                  <span>Preview Public Profile</span>
                </button>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-mono-label text-[10px] font-semibold">
                  <span className="material-symbols-outlined text-[14px]">
                    cloud_done
                  </span>
                  PUBLIC DIRECTORY PREVIEW SYNCED
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left 4 Cols: Brand Monogram & Logo Upload */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                <div className="p-5 rounded-xl bg-surface-container-low flex flex-col items-center text-center border border-outline-variant/20">
                  <div className="relative w-24 h-24 rounded-2xl bg-primary flex items-center justify-center text-on-primary font-headline-xl text-headline-xl font-extrabold shadow-sm mb-3 overflow-hidden">
                    {compLogo ? (
                      <img
                        src={compLogo}
                        alt={compName}
                        className="w-full h-full object-contain bg-white p-2"
                      />
                    ) : (
                      <span>{compInitials}</span>
                    )}
                    <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-on-secondary shadow-xs">
                      <span className="material-symbols-outlined text-[14px]">
                        verified
                      </span>
                    </span>
                  </div>
                  <span className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                    Primary Brand Insignia
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    High-contrast SVG or raster asset
                  </span>
                  <div className="flex items-center gap-2 mt-3 w-full justify-center">
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container-high text-on-surface font-headline-sm text-xs transition-colors flex items-center gap-1 shadow-xs"
                    >
                      <span className="material-symbols-outlined text-[15px]">
                        sync
                      </span>
                      <span>Replace Mark</span>
                    </button>
                    {compLogo && (
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="p-1.5 rounded-lg bg-surface-container-lowest hover:bg-error-container text-on-surface-variant hover:text-error transition-colors shadow-xs"
                        title="Reset to Monogram"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          delete
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Dashed Upload Zone */}
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="p-4 rounded-xl bg-surface-container-lowest border-2 border-dashed border-primary/35 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-surface-container-low transition-colors"
                >
                  <span className="material-symbols-outlined text-primary text-[28px] mb-1">
                    cloud_upload
                  </span>
                  <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                    Upload Company Logo from Computer
                  </span>
                  <span className="font-mono-label text-[10px] text-on-surface-variant mt-1">
                    .PNG, .JPG, .WEBP (AUTO-SYNCS TO ALL JOBS)
                  </span>
                </button>

                {/* Verification Snapshot */}
                <div className="p-4 rounded-xl bg-surface-container-low flex flex-col gap-2 border border-outline-variant/20">
                  <div className="flex items-center justify-between">
                    <span className="font-mono-label text-mono-label text-on-surface-variant uppercase">
                      Public Status
                    </span>
                    <span className="font-mono-label text-[10px] px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container font-semibold">
                      LIVE &amp; APPROVED
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Active Requisitions
                    </span>
                    <span className="font-mono-data text-mono-data text-on-surface font-bold">
                      {String(liveJobsCount).padStart(2, "0")} Positions
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Talent Pipeline Total
                    </span>
                    <span className="font-mono-data text-mono-data text-on-surface font-bold">
                      {String(applications.length).padStart(2, "0")} Candidates
                    </span>
                  </div>
                </div>
              </div>

              {/* Right 8 Cols: Editable Company Fields */}
              <form
                onSubmit={handleSaveCompany}
                className="lg:col-span-8 flex flex-col justify-between gap-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="font-mono-label text-mono-label uppercase text-on-surface-variant">
                      Company Name
                    </label>
                    <input
                      type="text"
                      required
                      value={compName}
                      onChange={(e) => setCompName(e.target.value)}
                      className="px-4 py-2.5 rounded-xl bg-surface-container-low text-on-surface font-headline-sm focus:outline-none focus:bg-white border border-outline-variant/25 transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-mono-label text-mono-label uppercase text-on-surface-variant">
                      Primary Industry Domain
                    </label>
                    <NexusSelect
                      value={compIndustry}
                      onChange={setCompIndustry}
                      options={INDUSTRY_OPTIONS}
                      icon="domain"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-mono-label text-mono-label uppercase text-on-surface-variant">
                      Official Web Identity
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        required
                        value={compWebsite}
                        onChange={(e) => setCompWebsite(e.target.value)}
                        className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-surface-container-low text-on-surface font-body-md focus:outline-none focus:bg-white border border-outline-variant/25 transition-all"
                      />
                      <span className="material-symbols-outlined text-[18px] text-tertiary absolute right-3 top-3">
                        open_in_new
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-mono-label text-mono-label uppercase text-on-surface-variant">
                      Global HQ &amp; Modality
                    </label>
                    <input
                      type="text"
                      required
                      value={compLocation}
                      onChange={(e) => setCompLocation(e.target.value)}
                      className="px-4 py-2.5 rounded-xl bg-surface-container-low text-on-surface font-body-md focus:outline-none focus:bg-white border border-outline-variant/25 transition-all"
                    />
                  </div>

                  <div className="md:col-span-2 flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <label className="font-mono-label text-mono-label uppercase text-on-surface-variant">
                        Enterprise Narrative &amp; Mission
                      </label>
                      <span className="font-mono-label text-[10px] text-on-surface-variant">
                        {compDesc.length} / 600 Chars
                      </span>
                    </div>
                    <textarea
                      rows="5"
                      maxLength={600}
                      required
                      value={compDesc}
                      onChange={(e) => setCompDesc(e.target.value)}
                      className="px-4 py-3 rounded-xl bg-surface-container-low text-on-surface font-body-md focus:outline-none focus:bg-white border border-outline-variant/25 transition-all resize-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-outline-variant/20 gap-3">
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-secondary text-[18px]">
                      bolt
                    </span>
                    <span className="font-body-sm text-body-sm">
                      Edits propagate to verified applicants and public
                      directory in real-time.
                    </span>
                  </div>
                  <button
                    type="submit"
                    disabled={savingCompany}
                    className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-container disabled:opacity-60 text-on-primary font-headline-sm text-headline-sm font-semibold shadow-sm transition-all self-end sm:self-auto active:scale-[0.99]"
                  >
                    {savingCompany
                      ? "Saving Profile..."
                      : "Save Company Profile"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =====================================================================
            MODULE 2: SPLIT WORKSPACE (LEFT 8 COLS: PIPELINE & LISTINGS | RIGHT 4 COLS: REQUISITION CREATOR)
           ===================================================================== */}
        {studioTab !== "COMPANY" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT 8 COLUMNS */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {/* PANEL A: APPLICANT PIPELINE MANAGER */}
              {(studioTab === "ALL" || studioTab === "PIPELINE") && (
                <div className="bg-surface-container-lowest p-5 sm:p-6 rounded-2xl shadow-sm border border-outline-variant/25">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-3 h-3 rounded-full bg-primary"></div>
                      <div>
                        <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                          Applicant Pipeline Manager (
                          {filteredCandidates.length})
                        </h3>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          Active candidacies scoped to {compName} requisitions
                        </p>
                      </div>
                    </div>

                    {/* Search input inside pipeline */}
                    <div className="relative w-full md:w-64">
                      <input
                        type="text"
                        value={candidateSearch}
                        onChange={(e) => setCandidateSearch(e.target.value)}
                        placeholder="Filter candidates by skill, ID..."
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-container-low text-on-surface font-body-sm focus:outline-none focus:bg-white border border-outline-variant/25"
                      />
                      <span className="material-symbols-outlined text-[18px] text-tertiary absolute left-3 top-2.5">
                        search
                      </span>
                    </div>
                  </div>

                  {/* Segmented Filter Tabs */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2 mb-4">
                    {[
                      {
                        id: "ALL",
                        label: "All Candidates",
                        count: applications.length,
                      },
                      {
                        id: "Applied",
                        label: "📥 Applied",
                        count: applications.filter(
                          (a) => a.status === "Applied"
                        ).length,
                      },
                      {
                        id: "Under Review",
                        label: "🔍 Under Review",
                        count: applications.filter(
                          (a) => a.status === "Under Review"
                        ).length,
                      },
                      {
                        id: "Interview Scheduled",
                        label: "📅 Interview Scheduled",
                        count: applications.filter(
                          (a) => a.status === "Interview Scheduled"
                        ).length,
                      },
                      {
                        id: "Offer Extended",
                        label: "🎉 Offer Extended",
                        count: applications.filter(
                          (a) => a.status === "Offer Extended"
                        ).length,
                      },
                      {
                        id: "Rejected",
                        label: "✕ Rejected",
                        count: applications.filter(
                          (a) => a.status === "Rejected"
                        ).length,
                      },
                    ].map((tab) => {
                      const active = pipelineStage === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setPipelineStage(tab.id)}
                          className={`px-3 py-1.5 rounded-xl font-headline-sm text-xs flex items-center gap-1.5 whitespace-nowrap transition-all shrink-0 ${
                            active
                              ? "bg-primary-container text-on-primary font-semibold shadow-sm"
                              : "bg-surface-container-low hover:bg-surface-container text-on-surface-variant"
                          }`}
                        >
                          <span>{tab.label}</span>
                          <span
                            className={`font-mono-label text-[10px] px-1.5 py-0.2 rounded font-bold ${
                              active
                                ? "bg-primary text-on-primary"
                                : "bg-surface-container text-on-surface"
                            }`}
                          >
                            {tab.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* CANDIDATE LIST (VERTICAL CARDS) */}
                  {filteredCandidates.length === 0 ? (
                    <div className="p-8 rounded-xl bg-surface-container-low/50 text-center text-body-sm text-on-surface-variant">
                      No candidates in the <strong>{pipelineStage}</strong>{" "}
                      stage match your filter.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {filteredCandidates.map((cand) => {
                        const isOffer = cand.status === "Offer Extended";
                        const isRejected = cand.status === "Rejected";
                        const isInterview =
                          cand.status === "Interview Scheduled";
                        const initials = cand.candidateName
                          .split(" ")
                          .slice(0, 2)
                          .map((w) => w[0]?.toUpperCase() || "")
                          .join("");

                        return (
                          <div
                            key={cand.applicationId}
                            className={`p-4 sm:p-5 rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md border border-outline-variant/25 transition-all relative overflow-hidden ${
                              isRejected ? "opacity-90" : ""
                            }`}
                          >
                            <div
                              className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                                isOffer
                                  ? "bg-secondary"
                                  : isRejected
                                  ? "bg-outline-variant"
                                  : "bg-primary"
                              }`}
                            ></div>

                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                              <div className="flex items-start gap-3.5">
                                <div
                                  className={`w-12 h-12 rounded-xl flex items-center justify-center font-headline-md font-bold shrink-0 ${
                                    isOffer
                                      ? "bg-secondary-fixed text-on-secondary-fixed"
                                      : isRejected
                                      ? "bg-surface-container text-on-surface-variant"
                                      : "bg-primary-fixed text-on-primary-fixed"
                                  }`}
                                >
                                  {initials || "CN"}
                                </div>
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-headline-md text-headline-md font-bold text-on-surface">
                                      {cand.candidateName}
                                    </span>
                                    {isOffer ? (
                                      <span className="font-mono-label text-[10px] px-2.5 py-0.5 rounded-full bg-secondary text-on-secondary font-bold uppercase">
                                        {cand.offerStatus === "Accepted"
                                          ? "✓ OFFER ACCEPTED • HIRED"
                                          : cand.offerStatus === "Declined"
                                          ? "OFFER DECLINED"
                                          : "OFFER DELIVERED"}
                                      </span>
                                    ) : isRejected ? (
                                      <span className="font-mono-label text-[10px] px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-semibold">
                                        DECISION LOGGED
                                      </span>
                                    ) : (
                                      <span className="font-mono-label text-[10px] px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container font-bold">
                                        94% MATCH
                                      </span>
                                    )}
                                  </div>
                                  <span className="font-body-md text-body-md text-on-surface font-medium mt-0.5">
                                    {cand.candidateHeadline ||
                                      "Senior Full-Stack Engineer"}{" "}
                                    • {cand.jobTitle}
                                  </span>
                                  <div className="flex items-center gap-2 font-mono-data text-xs text-on-surface-variant mt-1 flex-wrap">
                                    <span className="text-primary font-semibold">
                                      #{cand.jobId}
                                    </span>
                                    <span>•</span>
                                    <span>
                                      Applied{" "}
                                      {new Date(
                                        cand.createdAt || Date.now()
                                      ).toLocaleDateString()}
                                    </span>
                                    <span>•</span>
                                    <span>{cand.candidateEmail}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Inspect CV Button */}
                              <button
                                type="button"
                                onClick={() => handleInspectCandidateCv(cand)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-headline-sm text-xs shadow-xs transition-colors shrink-0 self-start"
                              >
                                <span className="material-symbols-outlined text-[16px] text-primary">
                                  description
                                </span>
                                <span>
                                  Inspect CV ({cand.resumeFileSizeKB || 420} KB)
                                </span>
                              </button>
                            </div>

                            {/* Tech Stack Chips */}
                            <div className="flex items-center gap-1.5 flex-wrap mt-3">
                              {(cand.skills || []).map((sk) => (
                                <span
                                  key={sk}
                                  className="px-2.5 py-0.5 rounded bg-surface-container font-mono-data text-xs text-on-surface font-medium"
                                >
                                  {sk}
                                </span>
                              ))}
                            </div>

                            {/* Cover Note Snippet */}
                            {cand.coverNote && !isRejected && (
                              <div className="p-3 rounded-lg bg-surface-container-low mt-3">
                                <p className="font-body-sm text-body-sm text-on-surface-variant italic">
                                  &ldquo;{cand.coverNote}&rdquo;
                                </p>
                              </div>
                            )}

                            {/* Interactive Interview Callout */}
                            {isInterview && (
                              <div className="p-3.5 rounded-xl bg-primary-fixed/30 border border-primary/20 mt-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
                                <div className="flex items-start gap-3">
                                  <div className="p-2 rounded-lg bg-primary text-on-primary shrink-0">
                                    <span className="material-symbols-outlined text-[20px]">
                                      videocam
                                    </span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
                                      {cand.interviewDetails ||
                                        "Technical System Architecture Round"}
                                    </span>
                                    <span className="font-mono-data text-xs text-primary font-semibold mt-0.5">
                                      {cand.interviewDate ||
                                        "Oct 30, 2026 • 10:30 AM IST (Google Meet)"}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setInterviewDateInput(
                                        cand.interviewDate ||
                                          "Nov 02, 2026 • 11:00 AM IST"
                                      );
                                      setInterviewModalApp(cand);
                                    }}
                                    className="px-3 py-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface font-headline-sm text-xs transition-colors"
                                  >
                                    Reschedule
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Offer Extended Banner (With Live Candidate Acceptance Sync!) */}
                            {isOffer && (
                              <div className="p-3.5 rounded-xl bg-secondary-container/35 border border-secondary/25 mt-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5">
                                  <span className="material-symbols-outlined text-secondary text-[22px]">
                                    celebration
                                  </span>
                                  <div className="flex flex-col">
                                    <span className="font-headline-sm text-headline-sm font-bold text-on-secondary-container">
                                      Offer Extended (
                                      {cand.offerDetails ||
                                        "$165k/yr + 0.25% Equity"}
                                      )
                                    </span>
                                    <span className="font-mono-data text-xs text-on-surface-variant">
                                      {cand.offerStatus === "Accepted"
                                        ? "🎉 Candidate Accepted Offer • Officially Hired!"
                                        : cand.offerStatus === "Declined"
                                        ? "Candidate declined the offer"
                                        : "Awaiting Candidate Acceptance"}
                                    </span>
                                  </div>
                                </div>
                                <span
                                  className={`px-3 py-1 rounded-full font-mono-label text-[10px] font-bold uppercase shrink-0 ${
                                    cand.offerStatus === "Accepted"
                                      ? "bg-secondary text-on-secondary"
                                      : cand.offerStatus === "Declined"
                                      ? "bg-error-container text-on-error-container"
                                      : "bg-surface-container-lowest text-secondary"
                                  }`}
                                >
                                  {cand.offerStatus === "Accepted"
                                    ? "✓ HIRED • ACCEPTED"
                                    : cand.offerStatus === "Declined"
                                    ? "DECLINED"
                                    : "SIGNATURE PENDING"}
                                </span>
                              </div>
                            )}

                            {/* Rejected Feedback Box */}
                            {isRejected && (
                              <div className="p-3 rounded-xl bg-surface-container-low mt-3">
                                <div className="flex items-center gap-1 font-mono-label text-[10px] text-error uppercase mb-1">
                                  <span className="material-symbols-outlined text-[14px]">
                                    comment
                                  </span>
                                  <span>Candidate Exit Evaluation Note:</span>
                                </div>
                                <p className="font-body-sm text-body-sm text-on-surface-variant italic">
                                  &ldquo;
                                  {cand.rejectionReason ||
                                    "Candidate dossier retained for future architectural openings."}
                                  &rdquo;
                                </p>
                              </div>
                            )}

                            {/* Candidate Phase Transition Action Bar */}
                            {!isOffer && !isRejected && (
                              <div className="flex flex-wrap items-center justify-between pt-3 mt-3 border-t border-outline-variant/20 gap-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  {cand.status === "Applied" && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        onUpdateApplicationStatus(
                                          cand.applicationId,
                                          { status: "Under Review" }
                                        )
                                      }
                                      className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-headline-sm text-xs transition-colors"
                                    >
                                      Shortlist (→ Under Review)
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setInterviewDateInput(
                                        cand.interviewDate ||
                                          "Oct 30, 2026 • 10:30 AM IST"
                                      );
                                      setInterviewModalApp(cand);
                                    }}
                                    className="px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-headline-sm text-xs transition-colors"
                                  >
                                    📅 Schedule Interview
                                  </button>
                                </div>

                                <div className="flex items-center gap-2 ml-auto">
                                  <button
                                    type="button"
                                    onClick={() => setOfferModalApp(cand)}
                                    className="px-3.5 py-1.5 rounded-lg bg-secondary text-on-secondary font-headline-sm text-xs font-semibold hover:opacity-90 shadow-xs transition-all"
                                  >
                                    Advance to Offer Stage
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setRejectModalApp(cand)}
                                    className="px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-error-container text-on-surface-variant hover:text-error font-headline-sm text-xs transition-colors"
                                  >
                                    Decline
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* PANEL B: MY PUBLISHED JOB LISTINGS (INCLUDING HIDDEN & REMOVED BY ADMIN) */}
              {(studioTab === "ALL" || studioTab === "JOBS") && (
                <div className="bg-surface-container-lowest p-5 sm:p-6 rounded-2xl shadow-sm border border-outline-variant/25">
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-outline-variant/20">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[22px]">
                        list_alt
                      </span>
                      <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                        Published &amp; Moderated Job Requisitions ({myJobs.length})
                      </h3>
                    </div>
                    <span className="font-mono-label text-[10px] px-2.5 py-1 rounded-full bg-surface-container text-on-surface font-semibold">
                      {liveJobsCount} LIVE • {pausedJobsCount} MODERATED/PAUSED
                    </span>
                  </div>

                  <div className="flex flex-col gap-3">
                    {myJobs.map((job) => {
                      const isHidden = job.status === "Hidden";
                      const isPendingReview = job.status === "Pending Review";
                      const isRemoved = job.status === "Removed";
                      const isPausedOrClosed = job.status !== "Active";
                      const jobAppCount = applications.filter(
                        (a) => a.jobId === job.jobId
                      ).length;

                      return (
                        <div
                          key={job.jobId}
                          className={`p-4 rounded-xl transition-colors flex flex-col gap-3 border ${
                            isRemoved
                              ? "border-error/40 bg-error-container/15"
                              : isHidden
                              ? "border-amber-400/60 bg-amber-50/60"
                              : isPendingReview
                              ? "border-primary/40 bg-primary-fixed/15"
                              : "bg-surface-container-low hover:bg-surface-container border-outline-variant/20"
                          }`}
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono-data text-mono-data text-primary font-bold">
                                  #{job.jobId}
                                </span>
                                <span
                                  className={`font-headline-sm text-headline-sm font-bold ${
                                    isRemoved
                                      ? "text-on-surface-variant line-through"
                                      : "text-on-surface"
                                  }`}
                                >
                                  {job.title}
                                </span>
                                {isPausedOrClosed && (
                                  <span
                                    className={`font-mono-label text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                                      isRemoved
                                        ? "bg-error-container text-on-error-container"
                                        : isHidden
                                        ? "bg-amber-200 text-amber-950"
                                        : isPendingReview
                                        ? "bg-primary-fixed text-primary"
                                        : "bg-surface-container-highest text-on-surface"
                                    }`}
                                  >
                                    {isPendingReview
                                      ? "PENDING ADMIN UNHIDE"
                                      : isHidden
                                      ? "HIDDEN BY ADMIN"
                                      : isRemoved
                                      ? "DELETED BY ADMIN"
                                      : job.status}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 font-mono-data text-xs text-on-surface-variant flex-wrap">
                                <span>
                                  {job.workMode} ({job.location})
                                </span>
                                <span>•</span>
                                <span className="font-bold text-on-surface">
                                  {formatSalaryBand(
                                    job.salaryMin,
                                    job.salaryMax,
                                    currency
                                  )}
                                </span>
                                <span>•</span>
                                <span>
                                  Expires:{" "}
                                  {new Date(
                                    job.expiresAt ||
                                      Date.now() + 30 * 86400 * 1000
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </span>
                                <span>•</span>
                                <span className="text-primary font-semibold">
                                  {jobAppCount}{" "}
                                  {jobAppCount === 1 ? "Applicant" : "Applicants"}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {!isRemoved && (
                                <button
                                  type="button"
                                  onClick={() => handleEditJobClick(job)}
                                  className="px-3 py-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container-high text-on-surface font-headline-sm text-xs transition-colors shadow-xs"
                                >
                                  {isHidden ? "Edit & Resolve" : "Edit"}
                                </button>
                              )}

                              {job.status === "Active" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    onUpdateJob(job.jobId, { status: "Paused" })
                                  }
                                  className="px-3 py-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container-high text-on-surface-variant font-headline-sm text-xs transition-colors shadow-xs"
                                >
                                  Pause
                                </button>
                              )}

                              {job.status === "Paused" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    onUpdateJob(job.jobId, { status: "Active" })
                                  }
                                  className="px-3 py-1.5 rounded-lg bg-primary-container text-on-primary font-headline-sm text-xs font-semibold hover:bg-primary transition-colors shadow-xs"
                                >
                                  Reopen Listing
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => setJobToDelete(job)}
                                className="p-1.5 rounded-lg text-on-surface-variant hover:bg-error-container hover:text-error transition-colors"
                                title="Delete Requisition"
                              >
                                <span className="material-symbols-outlined text-[18px]">
                                  delete
                                </span>
                              </button>
                            </div>
                          </div>

                          {/* CASE 1: HIDDEN BY ADMIN -> EMPLOYER CAN RESOLVE & SUBMIT FOR ADMIN UNHIDE */}
                          {isHidden && (
                            <div className="p-3.5 rounded-xl bg-amber-100/90 border border-amber-400/60 text-amber-950 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex items-start gap-2">
                                <span className="material-symbols-outlined text-[18px] text-amber-800 shrink-0 mt-0.5">
                                  visibility_off
                                </span>
                                <div>
                                  <strong className="block font-headline-sm">
                                    Post Hidden by Platform Admin — Action Required:
                                  </strong>
                                  <span>
                                    Reason: &ldquo;
                                    {job.removalReason ||
                                      "Please review and update job details."}
                                    &rdquo;
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleEditJobClick(job)}
                                  className="px-3 py-1.5 rounded-lg bg-white text-amber-950 font-headline-sm text-xs shadow-xs"
                                >
                                  1. Edit Details
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    onUpdateJob(job.jobId, {
                                      status: "Pending Review",
                                      employerResolutionNote: `Company resolved "${job.removalReason}" and requested Admin approval to unhide.`,
                                    })
                                  }
                                  className="px-3.5 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-headline-sm text-xs font-semibold shadow-xs"
                                >
                                  2. Submit to Admin to Unhide →
                                </button>
                              </div>
                            </div>
                          )}

                          {/* CASE 2: PENDING ADMIN REVIEW (RESOLVED BY EMPLOYER) */}
                          {isPendingReview && (
                            <div className="p-3 rounded-xl bg-primary-fixed/40 border border-primary/25 text-primary text-xs flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[17px]">
                                  hourglass_top
                                </span>
                                <span>
                                  <strong>Submitted to Admin for Approval:</strong>{" "}
                                  Your resolution has been sent to the Platform Admin
                                  to approve and unhide this post.
                                </span>
                              </div>
                            </div>
                          )}

                          {/* CASE 3: DELETED / REMOVED BY ADMIN -> SHOW REASON & ALLOW FIX & REPOST */}
                          {isRemoved && (
                            <div className="p-3.5 rounded-xl bg-error-container/60 border border-error/30 text-on-error-container text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex items-start gap-2">
                                <span className="material-symbols-outlined text-[18px] text-error shrink-0 mt-0.5">
                                  gavel
                                </span>
                                <div>
                                  <strong className="block font-headline-sm">
                                    Deleted / Removed by Platform Admin:
                                  </strong>
                                  <span>
                                    Reason: &ldquo;
                                    {job.removalReason ||
                                      "Removed due to platform policy violation."}
                                    &rdquo; — You can fix this issue and repost it as a
                                    new compliant vacancy.
                                  </span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  // Pre-fill form in "create" mode so the company can fix and repost it!
                                  handleEditJobClick(job);
                                  setJobFormMode("create");
                                  setEditingJobId("");
                                }}
                                className="px-3.5 py-1.5 rounded-lg bg-error text-white font-headline-sm text-xs font-semibold shrink-0 self-end sm:self-center shadow-xs"
                              >
                                Fix &amp; Repost Vacancy →
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT 4 COLUMNS: STICKY CREATE / EDIT JOB VACANCY CONSOLE */}
            <div
              className="hidden lg:block lg:col-span-4 sticky top-24"
              id="jobVacancyCard"
            >
              <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/25">
                {renderJobVacancyForm(false)}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}