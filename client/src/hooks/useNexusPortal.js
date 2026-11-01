import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  fetchJobs,
  fetchCompanies,
  fetchApplications,
  fetchSessionMe,
  fetchAdminUsers,
  fetchAdminAuditLogs,
  apiAdminToggleUserStatus,
  apiAdminModerateJob,
  apiAuthRequest,
  apiSubmitApplication,
  apiToggleArchiveApplication,
  apiSaveCompanyProfile,
  apiCreateJob,
  apiUpdateJob,
  apiDeleteJob,
  apiUpdateApplicationStatus,
  pingHealth,
  apiRespondToOffer,
} from "../services/nexusService.js";
import {
  FALLBACK_JOBS,
  FALLBACK_COMPANIES,
} from "../constants/nexusConstants.js";

export function useNexusPortal() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("nexus_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem("nexus_currency") || "USD";
  });

  // Views: "jobs" | "companies" | "auth" | "seeker" | "employer" | "admin"
  const [activeView, setActiveView] = useState("jobs");
  const [pendingAction, setPendingAction] = useState(null);

  const [jobs, setJobs] = useState(FALLBACK_JOBS);
  const [companies, setCompanies] = useState(FALLBACK_COMPANIES);
  const [applications, setApplications] = useState([]);
  const [platformUsers, setPlatformUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  // Selected Job & Quick-Apply Modal
  const [selectedJobId, setSelectedJobId] = useState("JOB-2026-001");
  const [mobileJobDrawerOpen, setMobileJobDrawerOpen] = useState(false);
  const [quickApplyJob, setQuickApplyJob] = useState(null);

  // Selected Company for Public Company Profile Modal
  const [inspectedCompany, setInspectedCompany] = useState(null);

  const [bookmarkedJobIds, setBookmarkedJobIds] = useState(() => {
    const saved = localStorage.getItem("nexus_bookmarks");
    return saved ? JSON.parse(saved) : ["JOB-2026-001"];
  });

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [workModeFilter, setWorkModeFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [jobTypeFilter, setJobTypeFilter] = useState("ALL");
  const [minSalaryFilter, setMinSalaryFilter] = useState("0");
  const [companyFilterId, setCompanyFilterId] = useState("");
  const [sortBy, setSortBy] = useState("NEWEST");
  const [currentPage, setCurrentPage] = useState(1);

  const [isBackendLive, setIsBackendLive] = useState(false);
  const [latencyMs, setLatencyMs] = useState(16);

  const [toast, setToast] = useState({
    visible: false,
    title: "",
    message: "",
    isError: false,
  });

  const showToast = useCallback((title, message, isError = false) => {
    setToast({ visible: true, title, message, isError });
  }, []);

  const dismissToast = useCallback(() => {
    setToast((p) => ({ ...p, visible: false }));
  }, []);

  // Listen for instant Force-Logout when Admin suspends a logged-in account
  useEffect(() => {
    const onForceLogout = (e) => {
      localStorage.removeItem("nexus_token");
      localStorage.removeItem("nexus_user");
      setUser(null);
      setApplications([]);
      setQuickApplyJob(null);
      setActiveView("auth");
      showToast(
        e.detail?.title || "Account Suspended",
        e.detail?.message || "Your account has been suspended by an administrator.",
        true
      );
    };
    window.addEventListener("nexus:force-logout", onForceLogout);
    return () => window.removeEventListener("nexus:force-logout", onForceLogout);
  }, [showToast]);

  useEffect(() => {
    if (!toast.visible) return;
    const t = setTimeout(dismissToast, 3800);
    return () => clearTimeout(t);
  }, [toast.visible, dismissToast]);

  useEffect(() => {
    localStorage.setItem("nexus_currency", currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem("nexus_bookmarks", JSON.stringify(bookmarkedJobIds));
  }, [bookmarkedJobIds]);

  const loadPublicData = useCallback(async () => {
    const includeAll = user?.role === "employer" || user?.role === "admin";
    const [jobsRes, companiesRes] = await Promise.all([
      fetchJobs(includeAll),
      fetchCompanies(),
    ]);
    setJobs(jobsRes.data);
    setIsBackendLive(jobsRes.live);
    if (jobsRes.latency) setLatencyMs(jobsRes.latency);
    setCompanies(companiesRes);
  }, [user]);

const loadUserWorkspaceData = useCallback(async () => {
    if (!user || !localStorage.getItem("nexus_token")) {
      setApplications([]);
      setPlatformUsers([]);
      setAuditLogs([]);
      return;
    }
    try {
      await fetchSessionMe();
      const apps = await fetchApplications();
      setApplications(apps);
      if (user.role === "admin") {
        const [usersData, logsData] = await Promise.all([
          fetchAdminUsers(),
          fetchAdminAuditLogs(),
        ]);
        setPlatformUsers(usersData);
        setAuditLogs(logsData);
      }
    } catch {
      // Handled by interceptor if suspended
    }
  }, [user]);

  useEffect(() => {
    loadPublicData();
  }, [loadPublicData]);

  useEffect(() => {
    loadUserWorkspaceData();
  }, [loadUserWorkspaceData]);

  const isPollingRef = useRef(false);
  useEffect(() => {
    const interval = setInterval(async () => {
      if (isPollingRef.current) return;
      isPollingRef.current = true;
      try {
        const health = await pingHealth();
        setIsBackendLive(health.live);
        if (health.latency) setLatencyMs(health.latency);
        await loadPublicData();
        if (user && localStorage.getItem("nexus_token")) {
          await loadUserWorkspaceData();
        }
      } finally {
        isPollingRef.current = false;
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [user, loadPublicData, loadUserWorkspaceData]);

  const filteredJobs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const loc = locationQuery.toLowerCase().trim();
    const minSal = Number(minSalaryFilter || 0);

    const list = jobs.filter((job) => {
      if (job.status !== "Active") return false;
      if (workModeFilter !== "ALL" && job.workMode !== workModeFilter) return false;
      if (categoryFilter !== "ALL" && job.category !== categoryFilter) return false;
      if (jobTypeFilter !== "ALL" && job.jobType !== jobTypeFilter) return false;
      if (minSal > 0 && job.salaryMax < minSal) return false;
      if (companyFilterId && job.companyId !== companyFilterId) return false;

      if (q) {
        const matchesTitle = job.title.toLowerCase().includes(q);
        const matchesCompany = job.companyName.toLowerCase().includes(q);
        const matchesId = job.jobId.toLowerCase().includes(q);
        const matchesSkills = (job.skills || []).some((s) =>
          s.toLowerCase().includes(q)
        );
        if (!matchesTitle && !matchesCompany && !matchesId && !matchesSkills) {
          return false;
        }
      }

      if (loc) {
        const matchesLoc =
          job.location.toLowerCase().includes(loc) ||
          job.workMode.toLowerCase().includes(loc);
        if (!matchesLoc) return false;
      }

      return true;
    });

    if (sortBy === "SALARY_DESC") {
      list.sort((a, b) => b.salaryMax - a.salaryMax);
    } else if (sortBy === "FAST_REVIEW") {
      list.sort((a, b) => Number(b.fastReview) - Number(a.fastReview));
    } else {
      list.sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
    }

    return list;
  }, [
    jobs,
    searchQuery,
    locationQuery,
    workModeFilter,
    categoryFilter,
    jobTypeFilter,
    minSalaryFilter,
    companyFilterId,
    sortBy,
  ]);

  const selectedJob = useMemo(() => {
    return (
      filteredJobs.find((j) => j.jobId === selectedJobId) ||
      filteredJobs[0] ||
      jobs[0] ||
      null
    );
  }, [filteredJobs, jobs, selectedJobId]);

  const selectedJobCompany = useMemo(() => {
    if (!selectedJob) return companies[0] || null;
    return (
      companies.find(
        (c) =>
          c.companyId === selectedJob.companyId ||
          c.companyName.toLowerCase() === selectedJob.companyName.toLowerCase()
      ) || {
        companyId: selectedJob.companyId || "CMP-2026-001",
        companyName: selectedJob.companyName,
        initials: selectedJob.companyInitials || "ACL",
        industry: "Enterprise Cloud & SaaS",
        location: selectedJob.location,
        website: "https://auspify.com",
        companySize: "140+ Engineers",
        fundingStage: "Series B",
        rating: "4.9 / 5.0",
        description: selectedJob.overview,
        verified: true,
      }
    );
  }, [selectedJob, companies]);

  const activeFilterCount = useMemo(() => {
    let c = 0;
    if (searchQuery.trim() !== "") c++;
    if (locationQuery.trim() !== "") c++;
    if (workModeFilter !== "ALL") c++;
    if (categoryFilter !== "ALL") c++;
    if (jobTypeFilter !== "ALL") c++;
    if (Number(minSalaryFilter) > 0) c++;
    if (companyFilterId !== "") c++;
    if (sortBy !== "NEWEST") c++;
    return c;
  }, [
    searchQuery,
    locationQuery,
    workModeFilter,
    categoryFilter,
    jobTypeFilter,
    minSalaryFilter,
    companyFilterId,
    sortBy,
  ]);

  const resetAllFilters = useCallback(() => {
    setSearchQuery("");
    setLocationQuery("");
    setWorkModeFilter("ALL");
    setCategoryFilter("ALL");
    setJobTypeFilter("ALL");
    setMinSalaryFilter("0");
    setCompanyFilterId("");
    setSortBy("NEWEST");
    setCurrentPage(1);
  }, []);

  const toggleBookmarkJob = useCallback(
    (job) => {
      setBookmarkedJobIds((prev) => {
        const exists = prev.includes(job.jobId);
        const next = exists
          ? prev.filter((id) => id !== job.jobId)
          : [...prev, job.jobId];
        showToast(
          exists ? "Removed from Saved Roles" : "Requisition Bookmarked",
          exists
            ? `#${job.jobId} removed from your saved list.`
            : `${job.title} (#${job.jobId}) saved for quick access.`
        );
        return next;
      });
    },
    [showToast]
  );

  // Trigger Apply for Job (Opens Quick-Apply Modal if logged in as Seeker; otherwise routes to Auth)
  const handleTriggerApplyForJob = useCallback(
    (job) => {
      if (!user) {
        setPendingAction({
          type: "apply",
          jobId: job.jobId,
          jobTitle: job.title,
        });
        setActiveView("auth");
        setMobileJobDrawerOpen(false);
        showToast(
          "Sign In or Register to Apply",
          `Sign in as a Job Seeker to complete your application for ${job.title} (#${job.jobId}).`
        );
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      if (user.role !== "seeker") {
        showToast(
          "Candidate Role Required",
          "Employer and Admin accounts cannot apply to jobs. Sign in with a Job Seeker account.",
          true
        );
        return;
      }
      setSelectedJobId(job.jobId);
      setQuickApplyJob(job);
      setMobileJobDrawerOpen(false);
    },
    [user, showToast]
  );

  const handleTriggerPostJob = useCallback(() => {
    if (!user) {
      setPendingAction({ type: "post-job" });
      setActiveView("auth");
      showToast(
        "Employer Sign-In Required",
        "Sign in or register an Employer account to publish job openings and manage your company profile."
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (user.role === "employer") {
      setActiveView("employer");
    } else if (user.role === "admin") {
      setActiveView("admin");
    } else {
      showToast(
        "Employer Account Required",
        "Only Employer accounts can post job vacancies.",
        true
      );
    }
  }, [user, showToast]);

  const handleFilterJobsByCompany = useCallback((company) => {
    setCompanyFilterId(company.companyId);
    setInspectedCompany(null);
    setActiveView("jobs");
    setCurrentPage(1);
    window.scrollTo({ top: 320, behavior: "smooth" });
  }, []);

  // Authentication Handler (Sign In & Register)
  const handleAuthenticate = async (mode, payload) => {
    try {
      const endpoint = mode === "signin" ? "login" : "register";
      const res = await apiAuthRequest(endpoint, payload);
      localStorage.setItem("nexus_token", res.token);
      localStorage.setItem("nexus_user", JSON.stringify(res.user));
      setUser(res.user);

      showToast(
        mode === "register"
          ? "Verified Account Created"
          : "Authenticated to Nexus",
        `Welcome ${res.user.name}! Logged in as ${res.user.role.toUpperCase()}.`
      );

      // Route user based on role and any pending Guest intent
      if (res.user.role === "admin") {
        setActiveView("admin");
      } else if (res.user.role === "employer") {
        setActiveView("employer");
      } else {
        // Seeker
        if (pendingAction?.type === "apply" && pendingAction.jobId) {
          const target = jobs.find((j) => j.jobId === pendingAction.jobId);
          setSelectedJobId(pendingAction.jobId);
          setActiveView("seeker");
          if (target) setQuickApplyJob(target);
        } else {
          setActiveView("seeker");
        }
      }
      setPendingAction(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return true;
    } catch (err) {
      showToast("Authentication Error", err.message, true);
      return false;
    }
  };

  // Candidate Submits Application
  const handleSubmitApplication = async (formPayload) => {
    try {
      const created = await apiSubmitApplication(formPayload);
      setApplications((prev) => [created, ...prev]);
      await loadPublicData();
      setActiveView("seeker");
      showToast(
        `Application #${created.applicationId} Submitted!`,
        `Your CV and engineering note have been sent to ${created.companyName}.`
      );
      return true;
    } catch (err) {
      showToast("Application Error", err.message, true);
      return false;
    }
  };

  const handleToggleArchiveApplication = async (applicationId, archived) => {
    try {
      const updated = await apiToggleArchiveApplication(applicationId, archived);
      setApplications((prev) =>
        prev.map((a) => (a.applicationId === applicationId ? updated : a))
      );
      showToast(
        archived ? "Application Archived" : "Application Restored",
        `Application #${applicationId} ${
          archived ? "moved to archive" : "restored to active pipeline"
        }.`
      );
    } catch (err) {
      showToast("Update Failed", err.message, true);
    }
  };

  const handleRespondToOffer = async (applicationId, offerStatus) => {
    try {
      const updated = await apiRespondToOffer(applicationId, offerStatus);
      setApplications((prev) =>
        prev.map((a) => (a.applicationId === applicationId ? updated : a))
      );
      showToast(
        offerStatus === "Accepted"
          ? "🎉 Official Offer Accepted!"
          : "Offer Declined",
        offerStatus === "Accepted"
          ? `Congratulations! ${updated.companyName} has been notified of your acceptance.`
          : `You have declined the offer for #${updated.jobId}.`
      );
      return true;
    } catch (err) {
      showToast("Offer Response Error", err.message, true);
      return false;
    }
  };

  const handleUpdateProfile = async (
    updates,
    toastTitle = "Profile Updated"
  ) => {
    const nextUser = { ...user, ...updates };
    setUser(nextUser);
    localStorage.setItem("nexus_user", JSON.stringify(nextUser));

    try {
      const res = await apiAuthRequest("profile", nextUser);
      setUser(res.user);
      localStorage.setItem("nexus_user", JSON.stringify(res.user));
      showToast(toastTitle, "Your candidate dossier is synchronized with Atlas.");
      return true;
    } catch (err) {
      showToast("Update Error", err.message, true);
      return false;
    }
  };

  const handleUpdatePassword = async (currentPassword, newPassword) => {
    try {
      await apiAuthRequest("password", { currentPassword, newPassword });
      showToast(
        "Password Rotated",
        "Your account password has been re-encrypted."
      );
      return true;
    } catch (err) {
      showToast("Password Error", err.message, true);
      return false;
    }
  };

  const handleSaveCompanyProfile = async (companyPayload) => {
    try {
      const updated = await apiSaveCompanyProfile(companyPayload);
      setCompanies((prev) => {
        const exists = prev.some((c) => c.companyId === updated.companyId);
        return exists
          ? prev.map((c) => (c.companyId === updated.companyId ? updated : c))
          : [updated, ...prev];
      });
      await loadPublicData();
      showToast(
        "Company Profile Published",
        `${updated.companyName} public showcase and logo are now live across Nexus.`
      );
      return true;
    } catch (err) {
      showToast("Company Update Failed", err.message, true);
      return false;
    }
  };

  const handleEmployerCreateJob = async (jobPayload) => {
    try {
      const created = await apiCreateJob(jobPayload);
      setJobs((prev) => [created, ...prev]);
      showToast(
        `Requisition #${created.jobId} Deployed!`,
        `${created.title} is now live on the Public Job Board.`
      );
      return true;
    } catch (err) {
      showToast("Job Creation Error", err.message, true);
      return false;
    }
  };

  const handleEmployerUpdateJob = async (jobId, updates) => {
    try {
      const updated = await apiUpdateJob(jobId, updates);
      setJobs((prev) => prev.map((j) => (j.jobId === jobId ? updated : j)));
      showToast(
        `Requisition #${jobId} Updated`,
        updates.status
          ? `Listing status changed to ${updates.status}.`
          : `${updated.title} details saved.`
      );
      return true;
    } catch (err) {
      showToast("Update Failed", err.message, true);
      return false;
    }
  };

  const handleEmployerDeleteJob = async (jobId) => {
    try {
      await apiDeleteJob(jobId);
      setJobs((prev) => prev.filter((j) => j.jobId !== jobId));
      showToast(
        `Requisition #${jobId} Removed`,
        "Job listing has been delisted from the portal.",
        true
      );
      return true;
    } catch (err) {
      showToast("Delete Failed", err.message, true);
      return false;
    }
  };

  const handleEmployerUpdateAppStatus = async (applicationId, statusPayload) => {
    try {
      const updated = await apiUpdateApplicationStatus(
        applicationId,
        statusPayload
      );
      setApplications((prev) =>
        prev.map((a) => (a.applicationId === applicationId ? updated : a))
      );
      showToast(
        `Candidate #${applicationId} → ${statusPayload.status}`,
        "Candidate's live pipeline tracker has been updated."
      );
      return true;
    } catch (err) {
      showToast("Pipeline Update Error", err.message, true);
      return false;
    }
  };
  const handleAdminModerateJob = async (jobId, status, reason) => {
    try {
      const updated = await apiAdminModerateJob(jobId, status, reason);
      setJobs((prev) => prev.map((j) => (j.jobId === jobId ? updated : j)));
      const logsData = await fetchAdminAuditLogs();
      setAuditLogs(logsData);
      showToast(
        status === "Removed"
          ? `Requisition #${jobId} Removed`
          : `Requisition #${jobId} Restored`,
        `Action logged to immutable SHA-256 Audit Trail.`,
        status === "Removed"
      );
      return true;
    } catch (err) {
      showToast("Moderation Error", err.message, true);
      return false;
    }
  };

  const handleAdminToggleUserStatus = async (userId, nextStatus, reason) => {
    try {
      const updated = await apiAdminToggleUserStatus(userId, nextStatus, reason);
      setPlatformUsers((prev) =>
        prev.map((u) => (String(u.id) === String(userId) ? updated : u))
      );
      const logsData = await fetchAdminAuditLogs();
      setAuditLogs(logsData);
      showToast(
        nextStatus === "Suspended"
          ? `Account Suspended: ${updated.name}`
          : `Account Reactivated: ${updated.name}`,
        nextStatus === "Suspended"
          ? "Active sessions revoked and logged to Audit Trail."
          : "Access privileges restored.",
        nextStatus === "Suspended"
      );
      return true;
    } catch (err) {
      showToast("Status Update Error", err.message, true);
      return false;
    }
  };

  return {
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
    selectedJobId,
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
    reloadPortalData: loadPublicData,
    platformUsers, 
    auditLogs, 
    handleAdminModerateJob,
    handleAdminToggleUserStatus,
    handleRespondToOffer,
  };
}