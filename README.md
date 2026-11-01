# 🌐 Nexus — Global Engineering & Technical Talent Portal

> **Task 5 — Job Portal Application**  
> A full-stack web platform connecting Job Seekers with Employers, governed by a real-time Platform Admin Console. Built with the **MERN Stack** (MongoDB Atlas, Express.js, React, Node.js) and styled with the **Nexus Editorial Engineering Portal** design system (Tailwind CSS).

---

## 🔑 The Four Access Modes & Evaluator Credentials

Nexus enforces strict server-side **Role-Based Access Control (RBAC)** across four distinct access modes:

| Access Mode | Login Credentials | Key Capabilities |
| :--- | :--- | :--- |
| **1. Public Guest Mode** | Open site directly *(No login required)* | Browse active job requisitions, filter by role/skills/location/work mode/salary/category/job type, inspect full job descriptions in the Split-Pane Reading Dossier, and view public **Company Profiles**. |
| **2. Job Seeker (Candidate)** | **Email:** `seeker@auspify.com`<br>**Password:** `Seeker@2026!`<br>*(Or register a new Job Seeker account)* | Upload/replace default or tailored CVs from computer, submit applications with live **Skills Match %**, track applications across a **4-Stage Progress Bar** (`Applied` $\rightarrow$ `Under Review` $\rightarrow$ `Interview Scheduled` $\rightarrow$ `Offer Extended` / `Rejected with Feedback`), and **Accept or Decline job offers** in real time. |
| **3. Employer (Company / Recruiter)** | **Email:** `employer@auspify.com`<br>**Password:** `Employer@2026!`<br>*(Or register a new Employer account)* | Create and edit public **Company Profile & Logo** (uploaded from computer with instant global sync), publish `#JOB-2026-XXX` vacancies with **auto-expiring deadlines**, manage the **Applicant Pipeline** (`Shortlist`, `Schedule Interview`, `Extend Offer`, `Decline with Reason`), resolve Admin-hidden posts, and export applicant dossiers in **PDF, Excel (`.xls`), and CSV**. |
| **4. Platform Admin** | **Email:** `admin@auspify.com`<br>**Password:** `Admin@2026!` | Monitor 5 real-time platform KPIs, moderate all job listings (**Hide Post with Reason** $\rightarrow$ **Approve & Unhide** after Employer resolution, or **Delete Post with Reason**), manage Job Seeker & Employer accounts (**Suspend / Reactivate** with instant session termination), inspect the **SHA-256 Audit Trail** (in local time), and export platform ledgers. |

---

## ✨ Core Features & Specification Coverage

### 1. Public Job Board, Multi-Parameter Search & Public Company Profiles
- **Split-Pane Job Explorer:** Interactive 5-column scrollable job feed paired with a sticky 7-column Reading Dossier on desktop and a smooth slide-up portal drawer on mobile.
- **7-Parameter Real Database Search & Filtering:** Filter by Role/Keyword, Tech Stack/Skills, Location, Work Mode (`Remote`, `Hybrid`, `On-Site`), Base Compensation Band, Job Category, Job Type (`Full-Time`, `Contract`, `Part-Time`, `Internship`), and Sort order (`Newest`, `Highest Base`, `Fast Review`).
- **Public Company Directory & Dossier Modal:** Visitors can inspect verified employers, their official websites, engineering scale, and active open roles without signing in.

### 2. Unified Authentication & Server-Enforced RBAC
- **One Shared Login Portal:** Authenticates Job Seekers, Employers, and Admins from a single login screen and routes each user to their respective workspace automatically.
- **Strict Public Registration Guard:** Public registration strictly allows creating **Job Seeker** or **Employer** accounts only; Admin accounts cannot be self-registered.

### 3. Job Seeker (Candidate) Dashboard & Live Application Tracker
- **Computer CV Upload & Skills Tag Editor:** Upload PDF/DOCX resumes directly from your computer, maintain technical skill tags, and view profile completeness.
- **Bounded 4-Step Visual Progress Tracker:** Tracks `1. Applied`, `2. Under Review`, `3. Technical Interview`, and `4. Offer Extended`, plus a dedicated **Constructive Employer Feedback** branch for rejected applications.
- **Two-Way Offer Acceptance Sync:** Clicking **Accept Offer** or **Decline** immediately updates the Employer's Applicant Pipeline with a `✓ HIRED • ACCEPTED` badge.

### 4. Employer Recruitment HQ & Company Profile Management
- **Instant Company Logo & Brand Sync:** Upload a company logo from your computer (`.png`, `.jpg`, `.webp`) and update company details; changes propagate immediately across all job cards and public company modals.
- **Collision-Safe `#JOB-2026-XXX` Vacancy Publisher with Auto-Expiry:** Generates sequential job IDs on the backend and enforces an **Application Deadline / Expiry Date** that automatically transitions past-due listings to `Expired`.
- **Applicant Pipeline & Multi-Format Exports:** Inspect candidate CVs, schedule interviews, extend offers, or log constructive exit notes, and export pipelines to **Excel (`.xls`), CSV (`.csv`), and PDF (`.pdf`)**.

### 5. Platform Admin Governance, Hide/Resolve/Unhide Workflow & Audit Trail
- **Interactive Job Hide & Resolution Loop:**
  1. Admin selects a compliance reason and clicks **Hide Post** (or **Delete**).
  2. The Employer sees a **Moderation Alert Banner** with the Admin's exact reason, edits the job, and clicks **Submit to Admin to Unhide** (`Pending Review`).
  3. Admin reviews the updated listing and clicks **Approve & Unhide** to restore it to the public Job Board.
- **User & Employer Account Governance:** Suspend or reactivate accounts; suspending a logged-in user immediately revokes their session via a global `403 ACCOUNT_SUSPENDED` interceptor.
- **Immutable Audit Trail (Local Time):** Records `ACCOUNT_SUSPENDED`, `JOB_LISTING_HIDDEN`, `JOB_APPROVED_UNHIDDEN`, and `JOB_LISTING_REMOVED` events with local timestamps.

---

## 🛠️ Technology Stack & Security Standards

- **Frontend:** React 18 (Vite), Tailwind CSS (`Plus Jakarta Sans`, `Inter`, `JetBrains Mono`), React Portals (`createPortal`), Viewport-Aware Popovers (`NexusSelect`, `NexusExportMenu`), HTML5 Canvas Logo Compression.
- **Backend:** Node.js, Express.js REST API, Mongoose ODM, MongoDB Atlas (with automatic IPv4 DNS resolution and In-Memory fail-safe fallback).
- **Security:**
  - `bcryptjs` (12-round salted password hashing)
  - `jsonwebtoken` (Stateless JWT authentication + live database status verification on every request)
  - `helmet` (HTTP security headers)
  - `express-rate-limit` (API abuse prevention)
  - Custom NoSQL injection & XSS payload sanitizer (`security.js`)

---

## 📂 Project Directory Structure

```text
Job Portal Application/
├── client/                               # React + Vite + Tailwind Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/                    # AdminConsoleView (KPIs, Job Moderation, User Governance, Audit Log)
│   │   │   ├── auth/                     # AuthView (Unified Sign In & Seeker/Employer Registration)
│   │   │   ├── companies/                # CompanyDirectoryView & CompanyProfileModal
│   │   │   ├── employer/                 # EmployerStudioView (Company Editor, Job Publisher, Applicant Pipeline)
│   │   │   ├── jobs/                     # HeroSearchBanner, JobFilterBar, SplitJobExplorer
│   │   │   ├── layout/                   # TopNavbar, MobileBottomBar, Footer
│   │   │   ├── seeker/                   # SeekerDashboardView & QuickApplyModal
│   │   │   └── ui/                       # NexusSelect, NexusExportMenu, Toast
│   │   ├── constants/                    # Currencies, Categories, Seeded Fallback Data
│   │   ├── hooks/                        # useNexusPortal (Global State, Live Polling & RBAC Routing)
│   │   ├── services/                     # REST API Client & PDF/Excel/CSV Export Generators
│   │   └── App.jsx
│   └── vercel.json
└── server/                               # Node.js + Express + MongoDB Backend API
    ├── src/
    │   ├── config/                       # db.js (MongoDB Atlas connection pool)
    │   ├── controllers/                  # jobController, authController, applicationController, adminController
    │   ├── middleware/                   # authMiddleware (JWT + RBAC + Suspension Check), security.js
    │   ├── models/                       # User.js, CompanyProfile.js, Job.js, Application.js, AuditLog.js
    │   ├── routes/                       # jobRoutes, authRoutes, applicationRoutes, adminRoutes
    │   └── server.js
    ├── .env.example
    └── vercel.json
```

---

## 🔌 REST API Endpoints Summary

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Public | Database connectivity & latency telemetry |
| `GET` | `/api/v1/jobs` | Public | Query active jobs with search, filter & live applicant counts |
| `GET` | `/api/v1/jobs/companies` | Public | Fetch all public employer company profiles |
| `PUT` | `/api/v1/jobs/companies/profile` | Employer / Admin | Update company profile & sync logo across all jobs |
| `POST` | `/api/v1/jobs` | Employer / Admin | Publish a new `#JOB-2026-XXX` requisition with expiry date |
| `PUT` | `/api/v1/jobs/:jobId` | Employer / Admin | Edit job, pause/reopen, or submit resolution for Admin unhide |
| `DELETE` | `/api/v1/jobs/:jobId` | Employer / Admin | Delete a job requisition |
| `POST` | `/api/v1/auth/register` | Public | Register a verified Job Seeker or Employer account |
| `POST` | `/api/v1/auth/login` | Public | Authenticate Seeker, Employer, or Admin |
| `GET` | `/api/v1/auth/me` | Auth (`JWT`) | Verify active session & check account suspension status |
| `PUT` | `/api/v1/auth/profile` | Auth (`JWT`) | Update candidate/employer profile, skills & default CV |
| `PUT` | `/api/v1/auth/password` | Auth (`JWT`) | Rotate account password |
| `GET` | `/api/v1/applications` | Auth (`JWT`) | Fetch candidate's applications or employer's applicant pipeline |
| `POST` | `/api/v1/applications` | Seeker (`JWT`) | Submit a job application with CV & prevent duplicates |
| `PUT` | `/api/v1/applications/:id/status` | Employer / Admin | Advance stage, schedule interview, extend offer, or reject |
| `PUT` | `/api/v1/applications/:id/respond-offer`| Seeker (`JWT`) | Accept or decline an extended job offer |
| `GET` | `/api/v1/admin/users` | Admin (`JWT`) | List all Job Seeker & Employer accounts (excludes Admin) |
| `PUT` | `/api/v1/admin/users/:id/status` | Admin (`JWT`) | Suspend or reactivate user account & log audit event |
| `PUT` | `/api/v1/admin/jobs/:jobId/moderate`| Admin (`JWT`) | Hide, remove, or approve & unhide a job listing |
| `GET` | `/api/v1/admin/audit-logs` | Admin (`JWT`) | Fetch chronological SHA-256 platform audit logs |

---