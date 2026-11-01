import React, { useState } from "react";

export default function CompanyDirectoryView({
  companies = [],
  jobs = [],
  onInspectCompany,
  onFilterJobsByCompany,
}) {
  const [search, setSearch] = useState("");

  const filtered = companies.filter((c) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      c.companyName.toLowerCase().includes(q) ||
      c.industry.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col gap-6 animate-fade-up">
      {/* Directory Header */}
      <section className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-sm border border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-mono-label text-[10px] uppercase">
            <span className="material-symbols-outlined text-[13px]">verified</span>
            <span>Public Employer Directory</span>
          </div>
          <h1 className="font-headline-xl text-2xl sm:text-headline-xl font-bold text-on-surface">
            Verified Engineering Organizations ({companies.length})
          </h1>
          <p className="font-body-md text-on-surface-variant max-w-2xl">
            Explore public company profiles, technical stacks, headquarters locations, and
            open engineering requisitions.
          </p>
        </div>

        <div className="relative flex items-center w-full md:w-80">
          <span className="material-symbols-outlined absolute left-3.5 text-outline text-[19px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company, industry, or city..."
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-surface-container-low text-on-surface font-body-sm focus:outline-none focus:ring-2 focus:ring-primary-container/20 border border-outline-variant/30"
          />
        </div>
      </section>

      {/* Companies Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((comp) => {
          const openRoles = jobs.filter(
            (j) =>
              j.status === "Active" &&
              (j.companyId === comp.companyId ||
                j.companyName.toLowerCase() === comp.companyName.toLowerCase())
          ).length;

          return (
            <article
              key={comp.companyId}
              className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm hover:shadow-md border border-outline-variant/30 flex flex-col justify-between gap-5 transition-all hover:-translate-y-0.5"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    {comp.logoUrl ? (
                      <img
                        src={comp.logoUrl}
                        alt={comp.companyName}
                        className="w-12 h-12 rounded-xl object-contain bg-white p-1 border border-outline-variant/30 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary font-headline-lg text-[17px] flex items-center justify-center font-extrabold shadow-sm shrink-0">
                        {comp.initials || "ACL"}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
                          {comp.companyName}
                        </h2>
                        <span className="material-symbols-outlined text-secondary text-[16px]">
                          verified
                        </span>
                      </div>
                      <span className="font-body-sm text-xs text-on-surface-variant block">
                        {comp.industry}
                      </span>
                    </div>
                  </div>
                  <span className="font-mono-label text-[10px] px-2 py-0.5 rounded bg-surface-container text-outline">
                    #{comp.companyId}
                  </span>
                </div>

                <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-3 leading-relaxed">
                  {comp.description}
                </p>

                <div className="flex flex-wrap items-center gap-2 text-xs text-on-surface-variant">
                  <span className="px-2.5 py-1 rounded-lg bg-surface-container-low flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-primary">
                      location_on
                    </span>
                    {comp.location}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-surface-container-low font-mono-data">
                    {comp.companySize || "140+ Engineers"}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-outline-variant/20 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onInspectCompany(comp)}
                  className="px-3.5 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-headline-sm text-xs transition-colors"
                >
                  Full Company Dossier
                </button>

                <button
                  type="button"
                  onClick={() => onFilterJobsByCompany(comp)}
                  className="px-3.5 py-2 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-headline-sm text-xs inline-flex items-center gap-1 shadow-xs transition-all"
                >
                  <span>
                    {openRoles} Open {openRoles === 1 ? "Role" : "Roles"}
                  </span>
                  <span className="material-symbols-outlined text-[14px]">
                    arrow_forward
                  </span>
                </button>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}