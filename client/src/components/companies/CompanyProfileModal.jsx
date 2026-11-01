import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { formatSalaryBand } from "../../constants/nexusConstants.js";

export default function CompanyProfileModal({
  company,
  jobs = [],
  currency = "USD",
  onClose,
  onSelectJobFromCompany,
}) {
  useEffect(() => {
    if (!company) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [company, onClose]);

  if (!company) return null;

  const companyJobs = jobs.filter(
    (j) =>
      j.status === "Active" &&
      (j.companyId === company.companyId ||
        j.companyName.toLowerCase() === company.companyName.toLowerCase())
  );

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] bg-on-surface/50 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-surface-container-lowest rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-outline-variant/40 flex flex-col gap-6 my-auto animate-pop-in max-h-[90vh] overflow-y-auto"
      >
        {/* Top Banner & Close */}
        <div className="flex items-start justify-between gap-4 border-b border-outline-variant/30 pb-5">
          <div className="flex items-center gap-4">
            {company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt={company.companyName}
                className="w-16 h-16 rounded-2xl object-contain bg-white p-1.5 border border-outline-variant/30 shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-primary-container text-on-primary font-headline-xl flex items-center justify-center font-extrabold shadow-md shrink-0">
                {company.initials || "ACL"}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-headline-xl text-2xl sm:text-headline-xl text-on-surface font-bold">
                  {company.companyName}
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-mono-label text-mono-label">
                  <span className="material-symbols-outlined text-[14px]">
                    verified
                  </span>
                  Verified Employer
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-body-sm text-on-surface-variant mt-1">
                <span>{company.industry}</span>
                <span>•</span>
                <span>{company.location}</span>
                <span>•</span>
                <span className="font-mono-label text-primary">
                  #{company.companyId}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Company Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-surface-container-low">
            <span className="font-mono-label text-[10px] text-outline uppercase block">
              Engineering Scale
            </span>
            <span className="font-mono-data font-bold text-on-surface mt-1 block">
              {company.companySize || "140+ Engineers"}
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-surface-container-low">
            <span className="font-mono-label text-[10px] text-outline uppercase block">
              Stage
            </span>
            <span className="font-mono-data font-bold text-secondary mt-1 block">
              {company.fundingStage || "Series B"}
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-surface-container-low">
            <span className="font-mono-label text-[10px] text-outline uppercase block">
              Rating
            </span>
            <span className="font-mono-data font-bold text-on-surface mt-1 block">
              ★ {company.rating || "4.9 / 5.0"}
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-surface-container-low">
            <span className="font-mono-label text-[10px] text-outline uppercase block">
              Official Website
            </span>
            <a
              href={company.website || "https://auspify.com"}
              target="_blank"
              rel="noreferrer"
              className="font-mono-data font-bold text-primary hover:underline mt-1 inline-flex items-center gap-1 truncate max-w-full"
            >
              <span className="truncate">
                {(company.website || "https://auspify.com").replace(/^https?:\/\//, "")}
              </span>
              <span className="material-symbols-outlined text-[14px]">
                open_in_new
              </span>
            </a>
          </div>
        </div>

        {/* About Company */}
        <div className="space-y-2">
          <h3 className="font-headline-md text-on-surface font-bold">
            About {company.companyName}
          </h3>
          <p className="font-body-md text-on-surface-variant leading-relaxed">
            {company.description}
          </p>
        </div>

        {/* Active Open Roles at this Company */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-headline-md text-on-surface font-bold">
              Active Open Requisitions ({companyJobs.length})
            </h3>
            <span className="font-mono-label text-mono-label text-secondary">
              Direct Application Enabled
            </span>
          </div>

          {companyJobs.length === 0 ? (
            <div className="p-6 rounded-xl bg-surface-container-low text-center text-body-sm text-on-surface-variant">
              No active open requisitions listed at this moment.
            </div>
          ) : (
            <div className="space-y-2.5">
              {companyJobs.map((job) => (
                <div
                  key={job.jobId}
                  className="p-4 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-outline-variant/25"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono-label text-[10px] text-primary font-bold">
                        #{job.jobId}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container font-mono-label text-[10px] font-bold">
                        {job.workMode}
                      </span>
                      <span className="font-body-sm text-xs text-on-surface-variant">
                        {job.location}
                      </span>
                    </div>
                    <h4 className="font-headline-sm text-base font-bold text-on-surface mt-1">
                      {job.title}
                    </h4>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <span className="font-mono-data font-bold text-on-surface">
                      {formatSalaryBand(job.salaryMin, job.salaryMax, currency, true)}
                    </span>
                    <button
                      type="button"
                      onClick={() => onSelectJobFromCompany(job)}
                      className="px-3.5 py-2 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-headline-sm text-xs flex items-center gap-1 shadow-xs"
                    >
                      <span>Inspect Role</span>
                      <span className="material-symbols-outlined text-[15px]">
                        arrow_forward
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}