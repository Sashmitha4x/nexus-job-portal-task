import React, { useMemo } from "react";
import { useNexusPortal } from "./hooks/useNexusPortal.js";
import TopNavbar from "./components/layout/TopNavbar.jsx";
import MobileBottomBar from "./components/layout/MobileBottomBar.jsx";
import Footer from "./components/layout/Footer.jsx";
import HeroSearchBanner from "./components/jobs/HeroSearchBanner.jsx";
import JobFilterBar from "./components/jobs/JobFilterBar.jsx";
import SplitJobExplorer from "./components/jobs/SplitJobExplorer.jsx";
import CompanyDirectoryView from "./components/companies/CompanyDirectoryView.jsx";
import CompanyProfileModal from "./components/companies/CompanyProfileModal.jsx";
import AuthView from "./components/auth/AuthView.jsx";
import SeekerDashboardView from "./components/seeker/SeekerDashboardView.jsx";
import QuickApplyModal from "./components/seeker/QuickApplyModal.jsx";
import Toast from "./components/ui/Toast.jsx";
import EmployerStudioView from "./components/employer/EmployerStudioView.jsx";
import {
  exportNexusPDF,
  exportNexusCSV,
  exportNexusExcel,
} from "./services/nexusService.js";
import AdminConsoleView from "./components/admin/AdminConsoleView.jsx";

export default function App() {
  const {
    user,
    setUser,
    currency,
    setCurrency,
    activeView,
    setActiveView,
    pendingAction,
    setPendingAction,
    jobs,
    filteredJobs,
    companies,
    applications,
    selectedJob,
    setSelectedJobId,
    selectedJobCompany,
    mobileJobDrawerOpen,
    setMobileJobDrawerOpen,
    quickApplyJob,
    setQuickApplyJob,
    inspectedCompany,
    setInspectedCompany,
    bookmarkedJobIds,
    toggleBookmarkJob,
    searchQuery,
    setSearchQuery,
    locationQuery,
    setLocationQuery,
    workModeFilter,
    setWorkModeFilter,
    categoryFilter,
    setCategoryFilter,
    jobTypeFilter,
    setJobTypeFilter,
    minSalaryFilter,
    setMinSalaryFilter,
    companyFilterId,
    setCompanyFilterId,
    sortBy,
    setSortBy,
    currentPage,
    setCurrentPage,
    activeFilterCount,
    resetAllFilters,
    isBackendLive,
    latencyMs,
    toast,
    showToast,
    dismissToast,
    handleTriggerApplyForJob,
    handleTriggerPostJob,
    handleFilterJobsByCompany,
    handleAuthenticate,
    handleSubmitApplication,
    handleToggleArchiveApplication,
    handleUpdateProfile,
    handleUpdatePassword,
    handleSaveCompanyProfile,
    handleEmployerCreateJob,
    handleEmployerUpdateJob,
    handleEmployerDeleteJob,
    handleEmployerUpdateAppStatus,
    platformUsers,
    auditLogs,
    handleAdminModerateJob,
    handleAdminToggleUserStatus,
    handleRespondToOffer,
  } = useNexusPortal();

  const activeJobsCount = useMemo(
    () => jobs.filter((j) => j.status === "Active").length,
    [jobs]
  );

  const avgBaseSalaryUSD = useMemo(() => {
    const active = jobs.filter((j) => j.status === "Active");
    if (active.length === 0) return 138400;
    const sum = active.reduce(
      (acc, j) => acc + (Number(j.salaryMin) + Number(j.salaryMax)) / 2,
      0
    );
    return Math.round(sum / active.length);
  }, [jobs]);

  const activeCompanyFilterObj = useMemo(
    () => companies.find((c) => c.companyId === companyFilterId) || null,
    [companies, companyFilterId]
  );

  const handleLogout = () => {
    localStorage.removeItem("nexus_token");
    localStorage.removeItem("nexus_user");
    setUser(null);
    setPendingAction(null);
    setQuickApplyJob(null);
    setActiveView("jobs");
    showToast("Signed Out", "Returned to Public Guest Browsing Mode.");
  };

  const handleShareJob = (job) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href).catch(() => {});
    }
    showToast(
      "Requisition Link Copied",
      `Direct link to #${job.jobId} (${job.title}) copied to clipboard.`
    );
  };

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen flex flex-col">
      <Toast toast={toast} onDismiss={dismissToast} />

      {/* Public Company Dossier Modal */}
      <CompanyProfileModal
        company={inspectedCompany}
        jobs={jobs}
        currency={currency}
        onClose={() => setInspectedCompany(null)}
        onSelectJobFromCompany={(job) => {
          setSelectedJobId(job.jobId);
          setInspectedCompany(null);
          setActiveView("jobs");
          if (window.innerWidth < 1024) setMobileJobDrawerOpen(true);
        }}
      />

      {/* Candidate Quick-Apply Portal Modal */}
      <QuickApplyModal
        isOpen={Boolean(quickApplyJob)}
        user={user}
        targetJob={quickApplyJob}
        allJobs={jobs}
        onClose={() => setQuickApplyJob(null)}
        onSubmitApplication={handleSubmitApplication}
      />

      <TopNavbar
        user={user}
        currency={currency}
        onCurrencyChange={setCurrency}
        activeView={activeView}
        onSelectView={setActiveView}
        activeJobsCount={activeJobsCount}
        companiesCount={companies.length}
        isBackendLive={isBackendLive}
        latencyMs={latencyMs}
        onPostJobClick={handleTriggerPostJob}
        onLogout={handleLogout}
      />

      <main className="w-full flex-1 bg-surface">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
          {/* SECTION 1A: PUBLIC JOB BOARD & SPLIT-PANE DOSSIER */}
          {activeView === "jobs" && (
            <div className="flex flex-col w-full">
              <HeroSearchBanner
                totalActiveCount={activeJobsCount}
                searchQuery={searchQuery}
                onSearchChange={(val) => {
                  setSearchQuery(val);
                  setCurrentPage(1);
                }}
                locationQuery={locationQuery}
                onLocationChange={(val) => {
                  setLocationQuery(val);
                  setCurrentPage(1);
                }}
                workModeFilter={workModeFilter}
                onWorkModeChange={(mode) => {
                  setWorkModeFilter(mode);
                  setCurrentPage(1);
                }}
                avgBaseSalaryUSD={avgBaseSalaryUSD}
                currency={currency}
                onSearchSubmit={() => setCurrentPage(1)}
              />

              <JobFilterBar
                categoryFilter={categoryFilter}
                onCategoryChange={(val) => {
                  setCategoryFilter(val);
                  setCurrentPage(1);
                }}
                jobTypeFilter={jobTypeFilter}
                onJobTypeChange={(val) => {
                  setJobTypeFilter(val);
                  setCurrentPage(1);
                }}
                minSalaryFilter={minSalaryFilter}
                onMinSalaryChange={(val) => {
                  setMinSalaryFilter(val);
                  setCurrentPage(1);
                }}
                sortBy={sortBy}
                onSortChange={setSortBy}
                companyFilterName={activeCompanyFilterObj?.companyName || ""}
                onClearCompanyFilter={() => setCompanyFilterId("")}
                activeFilterCount={activeFilterCount}
                onResetAll={resetAllFilters}
              />

              <SplitJobExplorer
                jobs={filteredJobs}
                allCompanies={companies}
                selectedJob={selectedJob}
                selectedJobCompany={selectedJobCompany}
                currency={currency}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                bookmarkedJobIds={bookmarkedJobIds}
                onToggleBookmark={toggleBookmarkJob}
                onSelectJob={(jobId, openMobile = false) => {
                  setSelectedJobId(jobId);
                  if (openMobile) setMobileJobDrawerOpen(true);
                }}
                mobileDrawerOpen={mobileJobDrawerOpen}
                onCloseMobileDrawer={() => setMobileJobDrawerOpen(false)}
                onApplyForJob={handleTriggerApplyForJob}
                onOpenCompanyModal={setInspectedCompany}
                onFilterByCompany={handleFilterJobsByCompany}
                onResetFilters={resetAllFilters}
                onShareJob={handleShareJob}
              />
            </div>
          )}

          {/* SECTION 1B: PUBLIC COMPANY PROFILES DIRECTORY */}
          {activeView === "companies" && (
            <CompanyDirectoryView
              companies={companies}
              jobs={jobs}
              onInspectCompany={setInspectedCompany}
              onFilterJobsByCompany={handleFilterJobsByCompany}
            />
          )}

          {/* SECTION 2: SPLIT-SCREEN AUTHENTICATION CONSOLE */}
          {activeView === "auth" && (
            <AuthView
              pendingAction={pendingAction}
              onAuthenticate={handleAuthenticate}
              onContinueAsGuest={() => {
                setPendingAction(null);
                setActiveView("jobs");
              }}
            />
          )}

          {/* SECTION 3: JOB SEEKER (CANDIDATE) DASHBOARD & PIPELINE TRACKER */}
          {activeView === "seeker" && user && (
            <SeekerDashboardView
              user={user}
              applications={applications}
              jobs={jobs}
              bookmarkedJobIds={bookmarkedJobIds}
              currency={currency}
              selectedJobForQuickApply={selectedJob}
              onSelectJobForQuickApply={(jobId) => setSelectedJobId(jobId)}
              onSubmitApplication={handleSubmitApplication}
              onToggleArchiveApplication={handleToggleArchiveApplication}
              onUpdateProfile={handleUpdateProfile}
              onUpdatePassword={handleUpdatePassword}
              onRespondToOffer={handleRespondToOffer}
              onExploreJobs={() => setActiveView("jobs")}
              onInspectJobOnBoard={(job) => {
                setSelectedJobId(job.jobId);
                setActiveView("jobs");
                window.scrollTo({ top: 320, behavior: "smooth" });
              }}
              onShowToast={showToast}
            />
          )}

          {/* SECTION 4: EMPLOYER RECRUITMENT HQ & APPLICANT PIPELINE */}
          {activeView === "employer" && user && (
            <EmployerStudioView
              user={user}
              companies={companies}
              jobs={jobs}
              applications={applications}
              currency={currency}
              onSaveCompanyProfile={handleSaveCompanyProfile}
              onCreateJob={handleEmployerCreateJob}
              onUpdateJob={handleEmployerUpdateJob}
              onDeleteJob={handleEmployerDeleteJob}
              onUpdateApplicationStatus={handleEmployerUpdateAppStatus}
              onInspectPublicCompany={setInspectedCompany}
              onViewPublicBoard={() => setActiveView("jobs")}
              onExportPDF={(list, comp) => {
                exportNexusPDF(list, comp);
                showToast("PDF Audit Ready", "Compliance PDF report generated.");
              }}
              onExportExcel={(list, comp) => {
                exportNexusExcel(list, comp);
                showToast("Excel Exported", "Candidate dossiers downloaded (.xls).");
              }}
              onExportCSV={(list) => {
                exportNexusCSV(list);
                showToast("CSV Exported", "Interview schedule log downloaded (.csv).");
              }}
              onShowToast={showToast}
            />
          )}
          {/* SECTION 5: PLATFORM ADMIN OVERSIGHT & GOVERNANCE CONSOLE */}
          {activeView === "admin" && user?.role === "admin" && (
            <AdminConsoleView
              user={user}
              jobs={jobs}
              companies={companies}
              applications={applications}
              platformUsers={platformUsers}
              auditLogs={auditLogs}
              currency={currency}
              latencyMs={latencyMs}
              onModerateJob={handleAdminModerateJob}
              onToggleUserStatus={handleAdminToggleUserStatus}
              onInspectJobOnBoard={(job) => {
                setSelectedJobId(job.jobId);
                setActiveView("jobs");
                window.scrollTo({ top: 320, behavior: "smooth" });
              }}
              onUpdateProfile={handleUpdateProfile}
              onUpdatePassword={handleUpdatePassword}
              onExportPDF={() => {
                exportNexusPDF(
                  applications,
                  "Auspify Nexus Root Governance",
                  "Platform Compliance & Audit Ledger"
                );
                showToast("Audit PDF Ready", "Platform ledger PDF generated.");
              }}
              onExportExcel={() => {
                exportNexusExcel(applications, "Auspify Nexus Root Governance");
                showToast("Excel Ledger Exported", "Platform ledger (.xls) downloaded.");
              }}
              onExportCSV={() => {
                exportNexusCSV(applications, "Nexus_Admin_Platform_Ledger");
                showToast("CSV Ledger Exported", "Platform raw ledger (.csv) downloaded.");
              }}
              onShowToast={showToast}
            />
          )}
        </div>
      </main>

      <Footer onSelectView={setActiveView} />

      <MobileBottomBar
        activeView={activeView}
        user={user}
        onSelectView={setActiveView}
        onPostJobClick={handleTriggerPostJob}
      />
    </div>
  );
}