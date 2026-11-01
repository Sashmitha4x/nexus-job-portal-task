import React from "react";
import NexusSelect from "../ui/NexusSelect.jsx";
import {
  JOB_CATEGORIES,
  JOB_TYPES,
  SALARY_BANDS,
  SORT_OPTIONS,
} from "../../constants/nexusConstants.js";

export default function JobFilterBar({
  categoryFilter,
  onCategoryChange,
  jobTypeFilter,
  onJobTypeChange,
  minSalaryFilter,
  onMinSalaryChange,
  sortBy,
  onSortChange,
  companyFilterName,
  onClearCompanyFilter,
  activeFilterCount,
  onResetAll,
}) {
  return (
    <div className="mt-5 flex flex-col lg:flex-row lg:items-center justify-between gap-3 py-3.5 px-3.5 sm:px-4 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/25 relative z-30 overflow-visible">
      {/* Left Filter Group: Category, Job Type, Base Salary & Active Company Chip */}
      <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto min-w-0">
        <div className="w-full sm:w-auto max-w-full">
          <NexusSelect
            prefixLabel="Category"
            value={categoryFilter}
            onChange={onCategoryChange}
            options={JOB_CATEGORIES}
          />
        </div>

        <div className="w-full xs:w-auto max-w-full">
          <NexusSelect
            prefixLabel="Job Type"
            value={jobTypeFilter}
            onChange={onJobTypeChange}
            options={JOB_TYPES}
          />
        </div>

        <div className="w-full xs:w-auto max-w-full">
          <NexusSelect
            prefixLabel="Base"
            value={minSalaryFilter}
            onChange={onMinSalaryChange}
            options={SALARY_BANDS}
          />
        </div>

        {companyFilterName && (
          <button
            type="button"
            onClick={onClearCompanyFilter}
            className="h-10 px-3 rounded-xl bg-primary-fixed text-primary font-mono-label text-mono-label inline-flex items-center gap-1.5 max-w-full truncate"
          >
            <span className="truncate">Company: {companyFilterName}</span>
            <span className="material-symbols-outlined text-[14px] shrink-0">
              close
            </span>
          </button>
        )}
      </div>

      {/* Right Sort & Reset Group: Wraps cleanly inside the card on mobile so Reset never clips */}
      <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 w-full lg:w-auto lg:ml-auto pt-2.5 lg:pt-0 border-t lg:border-t-0 border-outline-variant/20 min-w-0">
        <div className="flex-1 sm:flex-initial min-w-[180px] max-w-full">
          <NexusSelect
            prefixLabel="Sort"
            icon="tune"
            value={sortBy}
            onChange={onSortChange}
            options={SORT_OPTIONS}
          />
        </div>

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={onResetAll}
            className="h-10 px-3.5 rounded-xl bg-error-container/50 hover:bg-error-container text-on-error-container font-mono-label text-mono-label inline-flex items-center justify-center gap-1.5 transition-colors shrink-0 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[15px]">
              restart_alt
            </span>
            <span>Reset ({activeFilterCount})</span>
          </button>
        )}
      </div>
    </div>
  );
}