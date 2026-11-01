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
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 py-3 px-4 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/25 relative z-30">
      <div className="flex flex-wrap items-center gap-2">
        <NexusSelect
          prefixLabel="Category"
          value={categoryFilter}
          onChange={onCategoryChange}
          options={JOB_CATEGORIES}
        />

        <NexusSelect
          prefixLabel="Job Type"
          value={jobTypeFilter}
          onChange={onJobTypeChange}
          options={JOB_TYPES}
        />

        <NexusSelect
          prefixLabel="Base"
          value={minSalaryFilter}
          onChange={onMinSalaryChange}
          options={SALARY_BANDS}
        />

        {companyFilterName && (
          <button
            type="button"
            onClick={onClearCompanyFilter}
            className="h-9 px-3 rounded-lg bg-primary-fixed text-primary font-mono-label text-mono-label inline-flex items-center gap-1.5"
          >
            <span>Company: {companyFilterName}</span>
            <span className="material-symbols-outlined text-[14px]">close</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 ml-auto">
        <NexusSelect
          prefixLabel="Sort"
          icon="tune"
          value={sortBy}
          onChange={onSortChange}
          options={SORT_OPTIONS}
        />

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={onResetAll}
            className="h-9 px-3 rounded-lg bg-error-container/50 hover:bg-error-container text-on-error-container font-mono-label text-mono-label flex items-center gap-1 transition-colors whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[14px]">restart_alt</span>
            <span>Reset ({activeFilterCount})</span>
          </button>
        )}
      </div>
    </div>
  );
}