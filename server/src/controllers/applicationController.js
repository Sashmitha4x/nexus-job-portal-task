import Application from "../models/Application.js";
import Job from "../models/Job.js";
import { isDbConnected } from "../config/db.js";
import { memoryJobs } from "./jobController.js";

export let memoryApplications = [
  {
    applicationId: "APP-2026-001",
    jobId: "JOB-2026-001",
    jobTitle: "Senior Full-Stack Engineer (React / Node.js)",
    companyId: "CMP-2026-001",
    companyName: "Auspify Cloud Labs",
    companyInitials: "ACL",
    employerEmail: "employer@auspify.com",
    location: "Colombo, LK / Remote",
    salaryMin: 120000,
    salaryMax: 145000,
    candidateName: "Sashmitha Nanayakkara",
    candidateEmail: "seeker@auspify.com",
    candidatePhone: "+94 77 123 4567",
    candidateHeadline: "Full-Stack Engineer • React & Node.js",
    skills: ["React", "Node.js", "TypeScript", "MongoDB", "AWS ECS"],
    coverNote:
      "I have architected distributed MERN applications and real-time telemetry consoles with sub-20ms latency.",
    noticePeriod: "2 Weeks Notice (Standard)",
    expectedSalary: "$135,000 / year",
    resumeFileName: "Sashmitha_CV_2026.pdf",
    resumeFileSizeKB: 420,
    status: "Interview Scheduled",
    interviewDate: "Oct 30, 2026 • 10:30 AM",
    interviewDetails:
      "Technical System Architecture Round (Google Meet • 60 min with Lead Architect)",
    offerDetails: "",
    rejectionReason: "",
    archivedByCandidate: false,
    createdAt: new Date(Date.now() - 3 * 86400 * 1000).toISOString(),
  },
  {
    applicationId: "APP-2026-002",
    jobId: "JOB-2026-002",
    jobTitle: "Backend Cloud Architect (Golang & Kubernetes)",
    companyId: "CMP-2026-002",
    companyName: "Stratum Data Systems",
    companyInitials: "STR",
    employerEmail: "careers@stratumdata.io",
    location: "Singapore / Remote",
    salaryMin: 150000,
    salaryMax: 175000,
    candidateName: "Sashmitha Nanayakkara",
    candidateEmail: "seeker@auspify.com",
    candidatePhone: "+94 77 123 4567",
    candidateHeadline: "Full-Stack Engineer • React & Node.js",
    skills: ["Go 1.23", "Kubernetes", "Docker", "Microservices"],
    coverNote:
      "Dear Hiring Team at Stratum, I have 4+ years orchestrating microservices on Kubernetes and high-throughput backend services.",
    noticePeriod: "2 Weeks Notice (Standard)",
    expectedSalary: "$160,000 / year",
    resumeFileName: "Sashmitha_CV_2026.pdf",
    resumeFileSizeKB: 420,
    status: "Offer Extended",
    interviewDate: "Oct 23, 2026 (Passed)",
    interviewDetails: "Final Systems Design & Executive Round Completed",
    offerDetails:
      "$165,000 USD/yr base + 0.15% equity options + comprehensive health & wellness package.",
    rejectionReason: "",
    archivedByCandidate: false,
    createdAt: new Date(Date.now() - 9 * 86400 * 1000).toISOString(),
  },
  {
    applicationId: "APP-2026-003",
    jobId: "JOB-2026-004",
    jobTitle: "Lead Machine Learning Engineer (LLMs / PyTorch)",
    companyId: "CMP-2026-004",
    companyName: "Vertex Quantum AI",
    companyInitials: "VRT",
    employerEmail: "hiring@vertexquantum.ai",
    location: "Austin, TX / London",
    salaryMin: 160000,
    salaryMax: 190000,
    candidateName: "Sashmitha Nanayakkara",
    candidateEmail: "seeker@auspify.com",
    candidatePhone: "+94 77 123 4567",
    candidateHeadline: "Full-Stack Engineer • React & Node.js",
    skills: ["Python", "Distributed Systems", "TypeScript"],
    coverNote:
      "Applying for the Lead ML Infrastructure role with strong distributed systems experience.",
    noticePeriod: "1 Month Notice",
    expectedSalary: "$170,000 / year",
    resumeFileName: "Sashmitha_CV_2026.pdf",
    resumeFileSizeKB: 420,
    status: "Rejected",
    interviewDate: "",
    interviewDetails: "",
    offerDetails: "",
    rejectionReason:
      "Thank you for interviewing. For this specific role, we required 5+ years of specialized CUDA kernel optimization experience. We were impressed with your distributed systems background and have retained your dossier for upcoming architectural roles.",
    archivedByCandidate: false,
    createdAt: new Date(Date.now() - 14 * 86400 * 1000).toISOString(),
  },
];

const getNextAppNumber = async () => {
  if (isDbConnected()) {
    const docs = await Application.find({}, { applicationId: 1 }).lean();
    const max = docs.reduce((acc, d) => {
      const m = String(d.applicationId || "").match(/APP-\d{4}-(\d+)/i);
      const n = m ? parseInt(m[1], 10) : 0;
      return n > acc ? n : acc;
    }, 0);
    return max + 1;
  }
  return memoryApplications.length + 1;
};

export const getApplications = async (req, res, next) => {
  try {
    const role = req.user.role;
    if (isDbConnected()) {
      const count = await Application.countDocuments();
      if (count === 0) {
        await Application.insertMany(memoryApplications);
      }
      let filter = {};
      if (role === "seeker") {
        filter = { candidateEmail: req.user.email };
      } else if (role === "employer") {
        filter = { employerEmail: req.user.email };
      }
      const list = await Application.find(filter).sort({ createdAt: -1 }).lean();
      return res.status(200).json({ success: true, count: list.length, data: list });
    }

    let list = [...memoryApplications];
    if (role === "seeker") {
      list = list.filter((a) => a.candidateEmail === req.user.email);
    } else if (role === "employer") {
      list = list.filter((a) => a.employerEmail === req.user.email);
    }
    res.status(200).json({ success: true, count: list.length, data: list });
  } catch (err) {
    next(err);
  }
};

export const submitApplication = async (req, res, next) => {
  try {
    if (req.user.role !== "seeker") {
      return res.status(403).json({
        success: false,
        message: "Only Job Seeker (Candidate) accounts can submit job applications.",
      });
    }

    const {
      jobId,
      coverNote,
      skills,
      noticePeriod,
      expectedSalary,
      resumeFileName,
      resumeFileSizeKB,
      resumeDataUrl,
    } = req.body;

    if (!jobId || !resumeFileName) {
      return res.status(400).json({
        success: false,
        message: "Job ID and a verified CV/Resume file are required.",
      });
    }

    const cleanJobId = jobId.toUpperCase();

    if (isDbConnected()) {
      const job = await Job.findOne({ jobId: cleanJobId });
      if (!job || job.status !== "Active") {
        return res.status(400).json({
          success: false,
          message: "This job requisition is closed or paused and no longer accepts applications.",
        });
      }

      const duplicate = await Application.findOne({
        jobId: cleanJobId,
        candidateEmail: req.user.email,
      });
      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: `You have already applied for #${cleanJobId} (${job.title}).`,
        });
      }

      const nextNum = await getNextAppNumber();
      const applicationId = `APP-2026-${String(nextNum).padStart(3, "0")}`;

      const created = await Application.create({
        applicationId,
        jobId: cleanJobId,
        jobTitle: job.title,
        companyId: job.companyId,
        companyName: job.companyName,
        companyInitials: job.companyInitials,
        employerEmail: job.employerEmail,
        location: job.location,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        candidate: req.user._id,
        candidateName: req.user.name,
        candidateEmail: req.user.email,
        candidatePhone: req.user.phone || "",
        candidateHeadline: req.user.headline || "Full-Stack Software Engineer",
        skills: Array.isArray(skills) ? skills : req.user.skills || [],
        coverNote: coverNote || "",
        noticePeriod: noticePeriod || "2 Weeks Notice (Standard)",
        expectedSalary: expectedSalary || `$${job.salaryMin.toLocaleString()} / year`,
        resumeFileName,
        resumeFileSizeKB: Number(resumeFileSizeKB || 420),
        resumeDataUrl: resumeDataUrl || "",
        status: "Applied",
      });

      await Job.updateOne({ jobId: cleanJobId }, { $inc: { applicantsCount: 1 } });

      return res.status(201).json({ success: true, data: created });
    }

    const memJob = memoryJobs.find((j) => j.jobId === cleanJobId);
    if (!memJob || memJob.status !== "Active") {
      return res.status(400).json({
        success: false,
        message: "This job requisition is no longer accepting applications.",
      });
    }

    const dupMem = memoryApplications.find(
      (a) => a.jobId === cleanJobId && a.candidateEmail === req.user.email
    );
    if (dupMem) {
      return res.status(409).json({
        success: false,
        message: `You have already applied for #${cleanJobId}.`,
      });
    }

    const createdMem = {
      applicationId: `APP-2026-${String(memoryApplications.length + 1).padStart(3, "0")}`,
      jobId: cleanJobId,
      jobTitle: memJob.title,
      companyId: memJob.companyId,
      companyName: memJob.companyName,
      companyInitials: memJob.companyInitials,
      employerEmail: memJob.employerEmail,
      location: memJob.location,
      salaryMin: memJob.salaryMin,
      salaryMax: memJob.salaryMax,
      candidateName: req.user.name,
      candidateEmail: req.user.email,
      candidatePhone: req.user.phone || "",
      candidateHeadline: req.user.headline || "Full-Stack Engineer",
      skills: Array.isArray(skills) ? skills : req.user.skills || [],
      coverNote: coverNote || "",
      noticePeriod: noticePeriod || "2 Weeks Notice (Standard)",
      expectedSalary: expectedSalary || `$${memJob.salaryMin.toLocaleString()} / year`,
      resumeFileName,
      resumeFileSizeKB: Number(resumeFileSizeKB || 420),
      resumeDataUrl: resumeDataUrl || "",
      status: "Applied",
      interviewDate: "",
      interviewDetails: "",
      offerDetails: "",
      rejectionReason: "",
      archivedByCandidate: false,
      createdAt: new Date().toISOString(),
    };
    memoryApplications = [createdMem, ...memoryApplications];
    memJob.applicantsCount = (memJob.applicantsCount || 0) + 1;

    res.status(201).json({ success: true, data: createdMem });
  } catch (err) {
    next(err);
  }
};

export const updateApplicationStatus = async (req, res, next) => {
  try {
    const applicationId = req.params.applicationId.toUpperCase();
    const { status, rejectionReason, interviewDate, interviewDetails, offerDetails } =
      req.body;

    if (status === "Rejected" && (!rejectionReason || !rejectionReason.trim())) {
      return res.status(400).json({
        success: false,
        message: "A constructive rejection reason is required when rejecting an application.",
      });
    }

    if (isDbConnected()) {
      const appDoc = await Application.findOne({ applicationId });
      if (!appDoc) {
        return res.status(404).json({ success: false, message: "Application not found." });
      }
      appDoc.status = status;
      if (rejectionReason !== undefined) appDoc.rejectionReason = rejectionReason;
      if (interviewDate !== undefined) appDoc.interviewDate = interviewDate;
      if (interviewDetails !== undefined) appDoc.interviewDetails = interviewDetails;
      if (offerDetails !== undefined) appDoc.offerDetails = offerDetails;
      await appDoc.save();
      return res.status(200).json({ success: true, data: appDoc });
    }

    memoryApplications = memoryApplications.map((a) =>
      a.applicationId === applicationId
        ? {
            ...a,
            status,
            rejectionReason: rejectionReason ?? a.rejectionReason,
            interviewDate: interviewDate ?? a.interviewDate,
            interviewDetails: interviewDetails ?? a.interviewDetails,
            offerDetails: offerDetails ?? a.offerDetails,
          }
        : a
    );
    const updated = memoryApplications.find((a) => a.applicationId === applicationId);
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

export const toggleArchiveApplication = async (req, res, next) => {
  try {
    const applicationId = req.params.applicationId.toUpperCase();
    const { archived } = req.body;

    if (isDbConnected()) {
      const appDoc = await Application.findOne({
        applicationId,
        candidateEmail: req.user.email,
      });
      if (!appDoc) {
        return res.status(404).json({ success: false, message: "Application not found." });
      }
      appDoc.archivedByCandidate = Boolean(archived);
      await appDoc.save();
      return res.status(200).json({ success: true, data: appDoc });
    }

    memoryApplications = memoryApplications.map((a) =>
      a.applicationId === applicationId && a.candidateEmail === req.user.email
        ? { ...a, archivedByCandidate: Boolean(archived) }
        : a
    );
    const updated = memoryApplications.find((a) => a.applicationId === applicationId);
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};
// PUT /api/v1/applications/:applicationId/respond-offer (Candidate Accepts or Declines an Offer)
export const respondToOffer = async (req, res, next) => {
  try {
    const applicationId = req.params.applicationId.toUpperCase();
    const { offerStatus } = req.body; // "Accepted" | "Declined"

    if (!["Accepted", "Declined"].includes(offerStatus)) {
      return res.status(400).json({
        success: false,
        message: "Offer response must be 'Accepted' or 'Declined'.",
      });
    }

    if (isDbConnected()) {
      const appDoc = await Application.findOne({ applicationId });
      if (!appDoc) {
        return res.status(404).json({ success: false, message: "Application not found." });
      }
      appDoc.offerStatus = offerStatus;
      appDoc.offerRespondedAt = new Date();
      await appDoc.save();
      return res.status(200).json({ success: true, data: appDoc });
    }

    memoryApplications = memoryApplications.map((a) =>
      a.applicationId === applicationId
        ? {
            ...a,
            offerStatus,
            offerRespondedAt: new Date().toISOString(),
          }
        : a
    );
    const updated = memoryApplications.find((a) => a.applicationId === applicationId);
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};