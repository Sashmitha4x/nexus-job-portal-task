import { FALLBACK_JOBS, FALLBACK_COMPANIES } from "../constants/nexusConstants.js";

const getApiRoots = () => {
  let raw = (import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1").trim();
  raw = raw.replace(/\/+$/, "");
  if (!raw.endsWith("/api/v1")) raw = `${raw}/api/v1`;
  return {
    JOBS_URL: `${raw}/jobs`,
    AUTH_URL: `${raw}/auth`,
    APPS_URL: `${raw}/applications`,
    ADMIN_URL: `${raw}/admin`,
    HEALTH_URL: `${raw}/health`,
  };
};

const { JOBS_URL, AUTH_URL, APPS_URL, ADMIN_URL, HEALTH_URL } = getApiRoots();

const getAuthHeaders = () => {
  const token = localStorage.getItem("nexus_token");
  return token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };
};

const parseJsonSafe = async (res) => {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return {
      success: false,
      message: text || `Server responded with HTTP ${res.status}`,
    };
  }
};

const checkAccountStatusInterceptor = (res, json) => {
  if (
    (res.status === 403 || res.status === 401) &&
    (json?.code === "ACCOUNT_SUSPENDED" || json?.code === "ACCOUNT_REMOVED")
  ) {
    window.dispatchEvent(
      new CustomEvent("nexus:force-logout", {
        detail: {
          title:
            json.code === "ACCOUNT_SUSPENDED"
              ? "Account Suspended by Administrator"
              : "Account Removed",
          message:
            json.message ||
            "Your session was terminated by a Platform Administrator.",
        },
      })
    );
  }
};

export const pingHealth = async () => {
  const start = performance.now();
  try {
    const res = await fetch(HEALTH_URL);
    if (!res.ok) throw new Error("Offline");
    const json = await parseJsonSafe(res);
    return {
      live: json.status === "Connected",
      latency: Math.max(1, Math.round(performance.now() - start)),
    };
  } catch {
    return { live: false, latency: 16 };
  }
};

export const fetchJobs = async (includeAll = false) => {
  const start = performance.now();
  try {
    const res = await fetch(`${JOBS_URL}?includeAll=${includeAll}`);
    if (!res.ok) throw new Error("API Offline");
    const json = await parseJsonSafe(res);
    return {
      data: json.data?.length ? json.data : FALLBACK_JOBS,
      live: json.dbConnected === true,
      latency: Math.max(1, Math.round(performance.now() - start)),
    };
  } catch {
    return { data: FALLBACK_JOBS, live: false, latency: 16 };
  }
};

export const fetchCompanies = async () => {
  try {
    const res = await fetch(`${JOBS_URL}/companies`);
    if (!res.ok) throw new Error("API Offline");
    const json = await parseJsonSafe(res);
    return json.data?.length ? json.data : FALLBACK_COMPANIES;
  } catch {
    return FALLBACK_COMPANIES;
  }
};

export const apiSaveCompanyProfile = async (payload) => {
  const res = await fetch(`${JOBS_URL}/companies/profile`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const json = await parseJsonSafe(res);
  checkAccountStatusInterceptor(res, json);
  if (!res.ok) throw new Error(json.message || "Failed to update company profile");
  return json.data;
};

export const apiCreateJob = async (payload) => {
  const res = await fetch(JOBS_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const json = await parseJsonSafe(res);
  checkAccountStatusInterceptor(res, json);
  if (!res.ok) throw new Error(json.message || "Failed to publish job");
  return json.data;
};

export const apiUpdateJob = async (jobId, payload) => {
  const res = await fetch(`${JOBS_URL}/${encodeURIComponent(jobId)}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const json = await parseJsonSafe(res);
  checkAccountStatusInterceptor(res, json);
  if (!res.ok) throw new Error(json.message || "Failed to update job");
  return json.data;
};

export const apiDeleteJob = async (jobId) => {
  const res = await fetch(`${JOBS_URL}/${encodeURIComponent(jobId)}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  const json = await parseJsonSafe(res);
  checkAccountStatusInterceptor(res, json);
  if (!res.ok) throw new Error(json.message || "Failed to delete job");
  return json;
};

export const apiAuthRequest = async (endpoint, payload) => {
  const method = endpoint === "profile" || endpoint === "password" ? "PUT" : "POST";
  const res = await fetch(`${AUTH_URL}/${endpoint}`, {
    method,
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const json = await parseJsonSafe(res);
  checkAccountStatusInterceptor(res, json);
  if (!res.ok) throw new Error(json.message || "Authentication failed");
  return json;
};

export const fetchSessionMe = async () => {
  const res = await fetch(`${AUTH_URL}/me`, { headers: getAuthHeaders() });
  const json = await parseJsonSafe(res);
  checkAccountStatusInterceptor(res, json);
  if (!res.ok) throw new Error(json.message || "Session invalid");
  return json.user;
};

export const fetchApplications = async () => {
  const res = await fetch(APPS_URL, { headers: getAuthHeaders() });
  const json = await parseJsonSafe(res);
  checkAccountStatusInterceptor(res, json);
  if (!res.ok) throw new Error(json.message || "Failed to load applications");
  return json.data;
};

export const apiSubmitApplication = async (payload) => {
  const res = await fetch(APPS_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const json = await parseJsonSafe(res);
  checkAccountStatusInterceptor(res, json);
  if (!res.ok) throw new Error(json.message || "Failed to submit application");
  return json.data;
};

export const apiUpdateApplicationStatus = async (applicationId, payload) => {
  const res = await fetch(
    `${APPS_URL}/${encodeURIComponent(applicationId)}/status`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    }
  );
  const json = await parseJsonSafe(res);
  checkAccountStatusInterceptor(res, json);
  if (!res.ok) throw new Error(json.message || "Failed to update status");
  return json.data;
};

export const apiToggleArchiveApplication = async (applicationId, archived) => {
  const res = await fetch(
    `${APPS_URL}/${encodeURIComponent(applicationId)}/archive`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ archived }),
    }
  );
  const json = await parseJsonSafe(res);
  checkAccountStatusInterceptor(res, json);
  if (!res.ok) throw new Error(json.message || "Failed to update archive state");
  return json.data;
};

export const apiRespondToOffer = async (applicationId, offerStatus) => {
  const res = await fetch(
    `${APPS_URL}/${encodeURIComponent(applicationId)}/respond-offer`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ offerStatus }),
    }
  );
  const json = await parseJsonSafe(res);
  checkAccountStatusInterceptor(res, json);
  if (!res.ok) throw new Error(json.message || "Failed to respond to offer");
  return json.data;
};

export const fetchAdminUsers = async () => {
  const res = await fetch(`${ADMIN_URL}/users`, { headers: getAuthHeaders() });
  const json = await parseJsonSafe(res);
  checkAccountStatusInterceptor(res, json);
  if (!res.ok) throw new Error(json.message || "Failed to load users");
  return json.data;
};

export const apiAdminToggleUserStatus = async (id, status, reason) => {
  const res = await fetch(`${ADMIN_URL}/users/${encodeURIComponent(id)}/status`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status, reason }),
  });
  const json = await parseJsonSafe(res);
  if (!res.ok) throw new Error(json.message || "Failed to update user status");
  return json.data;
};

export const apiAdminModerateJob = async (jobId, status, reason) => {
  const res = await fetch(
    `${ADMIN_URL}/jobs/${encodeURIComponent(jobId)}/moderate`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, reason }),
    }
  );
  const json = await parseJsonSafe(res);
  if (!res.ok) throw new Error(json.message || "Failed to moderate job");
  return json.data;
};

export const fetchAdminAuditLogs = async () => {
  const res = await fetch(`${ADMIN_URL}/audit-logs`, { headers: getAuthHeaders() });
  const json = await parseJsonSafe(res);
  if (!res.ok) throw new Error(json.message || "Failed to load audit logs");
  return json.data;
};

// ============================================================================
// TELEMETRY & PIPELINE EXPORT GENERATORS (PDF, EXCEL .XLS, CSV)
// ============================================================================
export const exportNexusPDF = (
  applications = [],
  companyName = "Auspify Cloud Labs",
  title = "Applicant Pipeline & Compliance Audit"
) => {
  const win = window.open("", "_blank", "width=980,height=760");
  if (!win) return;

  const rowsHtml = applications
    .map(
      (a) => `
      <tr>
        <td class="mono">#${a.applicationId}</td>
        <td class="mono">#${a.jobId}</td>
        <td><strong>${a.candidateName}</strong><br/><span class="sub">${a.candidateEmail}</span></td>
        <td>${a.jobTitle}</td>
        <td><span class="badge">${a.status}</span></td>
        <td class="mono">${a.expectedSalary || "$135,000 / yr"}</td>
        <td>${(a.skills || []).slice(0, 4).join(", ")}</td>
      </tr>`
    )
    .join("");

  win.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Nexus_ATS_Report_${new Date().toISOString().slice(0, 10)}</title>
        <style>
          body { font-family: 'Segoe UI', Inter, sans-serif; color: #0b1c30; margin: 32px; }
          .head { display: flex; justify-content: space-between; border-bottom: 2px solid #3525cd; padding-bottom: 14px; margin-bottom: 22px; }
          .brand { font-size: 22px; font-weight: 800; color: #3525cd; }
          .sub { font-size: 11px; color: #464555; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th { background: #eff4ff; color: #0b1c30; text-align: left; padding: 9px; font-size: 10px; text-transform: uppercase; border-bottom: 1px solid #c7c4d8; }
          td { padding: 9px; border-bottom: 1px solid #e5eeff; vertical-align: top; }
          .mono { font-family: monospace; font-weight: 600; }
          .badge { background: #e2dfff; color: #0f0069; padding: 2px 8px; border-radius: 99px; font-size: 10px; font-weight: 700; }
        </style>
      </head>
      <body>
        <div class="head">
          <div>
            <div class="brand">NEXUS. by Auspify — ${companyName}</div>
            <div class="sub">${title}</div>
          </div>
          <div style="text-align:right;font-size:12px;">
            <div>Generated: <strong>${new Date().toISOString().slice(0, 10)}</strong></div>
            <div>Total Records: <strong>${applications.length}</strong></div>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>App ID</th>
              <th>Job ID</th>
              <th>Candidate</th>
              <th>Target Role</th>
              <th>Stage</th>
              <th>Target Base</th>
              <th>Core Stack</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml || '<tr><td colspan="7">No candidate records found.</td></tr>'}
          </tbody>
        </table>
        <script>window.onload = () => setTimeout(() => window.print(), 250);</script>
      </body>
    </html>
  `);
  win.document.close();
};

export const exportNexusCSV = (applications = [], filePrefix = "Nexus_ATS_Pipeline") => {
  const headers = [
    "Application ID",
    "Job ID",
    "Candidate Name",
    "Candidate Email",
    "Role Title",
    "Company",
    "Stage Status",
    "Interview Schedule",
    "Target Base",
    "Submitted CV",
  ];
  const rows = applications.map((a) =>
    [
      `"${a.applicationId}"`,
      `"${a.jobId}"`,
      `"${a.candidateName}"`,
      `"${a.candidateEmail}"`,
      `"${String(a.jobTitle || "").replace(/"/g, '""')}"`,
      `"${a.companyName}"`,
      `"${a.status}"`,
      `"${a.interviewDate || "N/A"}"`,
      `"${a.expectedSalary || ""}"`,
      `"${a.resumeFileName || ""}"`,
    ].join(",")
  );
  const blob = new Blob(["\uFEFF" + [headers.join(","), ...rows].join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filePrefix}_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

export const exportNexusExcel = (applications = [], companyName = "Auspify Cloud Labs") => {
  const rows = applications
    .map(
      (a) => `
      <tr>
        <td style="border:1px solid #cbd5e1;padding:6px;font-family:monospace;">#${a.applicationId}</td>
        <td style="border:1px solid #cbd5e1;padding:6px;font-family:monospace;">#${a.jobId}</td>
        <td style="border:1px solid #cbd5e1;padding:6px;font-weight:bold;">${a.candidateName}</td>
        <td style="border:1px solid #cbd5e1;padding:6px;">${a.candidateEmail}</td>
        <td style="border:1px solid #cbd5e1;padding:6px;">${a.jobTitle}</td>
        <td style="border:1px solid #cbd5e1;padding:6px;font-weight:bold;">${a.status}</td>
        <td style="border:1px solid #cbd5e1;padding:6px;">${(a.skills || []).join(", ")}</td>
      </tr>`
    )
    .join("");

  const html = `
    <html><head><meta charset="UTF-8"></head><body>
      <h2>Auspify Nexus ATS — Candidate Dossiers (${companyName})</h2>
      <table style="border-collapse:collapse;width:100%;">
        <thead>
          <tr style="background:#3525cd;color:#ffffff;">
            <th style="padding:8px;">Application ID</th>
            <th style="padding:8px;">Job ID</th>
            <th style="padding:8px;">Candidate Name</th>
            <th style="padding:8px;">Email</th>
            <th style="padding:8px;">Role Title</th>
            <th style="padding:8px;">Stage</th>
            <th style="padding:8px;">Technical Stack</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </body></html>`;

  const blob = new Blob([html], { type: "application/vnd.ms-excel" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Nexus_Candidate_Dossiers_${new Date().toISOString().slice(0, 10)}.xls`;
  link.click();
  URL.revokeObjectURL(url);
};