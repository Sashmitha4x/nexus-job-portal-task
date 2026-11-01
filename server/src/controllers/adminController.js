import User from "../models/User.js";
import Job from "../models/Job.js";
import AuditLog from "../models/AuditLog.js";
import { isDbConnected } from "../config/db.js";
import { memoryUsers, formatUser, ensureCoreAccounts } from "./authController.js";
import { memoryJobs } from "./jobController.js";

export let memoryAuditLogs = [
  {
    logId: "LOG-2026-004",
    actorName: "Admin • Sashmitha N.",
    actorEmail: "admin@auspify.com",
    action: "ACCOUNT_SUSPENDED",
    targetRecord: "user: bot-lead@apexdigital-fake.net (Employer Org)",
    reason: "Detected automated mass job submission without company verification.",
    createdAt: "2026-10-29T08:14:22.000Z",
  },
  {
    logId: "LOG-2026-003",
    actorName: "System Automated Rule Engine",
    actorEmail: "system@auspify.com",
    action: "JOB_LISTING_APPROVED",
    targetRecord: "job: #JOB-2026-001 (Senior Full-Stack Engineer)",
    reason: "Passed all KYC and salary transparency compliance checks.",
    createdAt: "2026-10-28T16:40:05.000Z",
  },
  {
    logId: "LOG-2026-002",
    actorName: "Admin • Sashmitha N.",
    actorEmail: "admin@auspify.com",
    action: "PASSWORD_RESET_DISPATCH",
    targetRecord: "user: kavindi.perera@gmail.com (Candidate)",
    reason: "User requested multi-factor verification recovery via support ticket #SUP-882.",
    createdAt: "2026-10-27T11:22:19.000Z",
  },
  {
    logId: "LOG-2026-001",
    actorName: "Admin • Sashmitha N.",
    actorEmail: "admin@auspify.com",
    action: "EMPLOYER_VERIFIED",
    targetRecord: "org: Auspify Cloud Labs (Tax ID #ORG-9924-ACL)",
    reason: "Verified corporate registration documents and direct domain DNS ownership.",
    createdAt: "2026-10-26T09:05:43.000Z",
  },
];

const recordAudit = async ({ actorName, actorEmail, action, targetRecord, reason }) => {
  const entry = {
    logId: `LOG-2026-${String(Date.now()).slice(-4)}`,
    actorName: `Admin • ${actorName}`,
    actorEmail,
    action,
    targetRecord,
    reason: reason || "Administrative policy enforcement",
    createdAt: new Date().toISOString(),
  };
  memoryAuditLogs = [entry, ...memoryAuditLogs];
  if (isDbConnected()) {
    await AuditLog.create(entry).catch(() => {});
  }
};

export const getPlatformUsers = async (_req, res, next) => {
  try {
    if (isDbConnected()) {
      await ensureCoreAccounts();
      // Strictly excludes Root Superusers (role !== 'admin')
      const users = await User.find({ role: { $ne: "admin" } })
        .sort({ createdAt: -1 })
        .lean();
      return res.status(200).json({
        success: true,
        count: users.length,
        data: users.map(formatUser),
      });
    }
    const list = memoryUsers
      .filter((u) => u.role !== "admin")
      .map(formatUser);
    res.status(200).json({ success: true, count: list.length, data: list });
  } catch (err) {
    next(err);
  }
};

export const toggleUserStatusAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (isDbConnected()) {
      const target = await User.findById(id);
      if (!target || target.role === "admin") {
        return res.status(404).json({ success: false, message: "Account not found." });
      }
      target.status = status;
      await target.save();

      await recordAudit({
        actorName: req.user.name,
        actorEmail: req.user.email,
        action: status === "Suspended" ? "ACCOUNT_SUSPENDED" : "ACCOUNT_REACTIVATED",
        targetRecord: `user: ${target.email} (${
          target.role === "employer" ? "Employer Org" : "Candidate"
        })`,
        reason:
          reason ||
          (status === "Suspended"
            ? "Account suspended by Platform Administrator."
            : "Account access restored after compliance review."),
      });

      return res.status(200).json({ success: true, data: formatUser(target) });
    }

    const memTarget = memoryUsers.find((u) => String(u._id) === String(id));
    if (!memTarget) {
      return res.status(404).json({ success: false, message: "Account not found." });
    }
    memTarget.status = status;
    await recordAudit({
      actorName: req.user.name,
      actorEmail: req.user.email,
      action: status === "Suspended" ? "ACCOUNT_SUSPENDED" : "ACCOUNT_REACTIVATED",
      targetRecord: `user: ${memTarget.email} (${
        memTarget.role === "employer" ? "Employer Org" : "Candidate"
      })`,
      reason,
    });
    res.status(200).json({ success: true, data: formatUser(memTarget) });
  } catch (err) {
    next(err);
  }
};

export const moderateJobListingAdmin = async (req, res, next) => {
  try {
    const jobId = req.params.jobId.toUpperCase();
    const { status, reason } = req.body; // status: "Hidden" | "Removed" | "Active"

    if (
      (status === "Hidden" || status === "Removed") &&
      (!reason || !reason.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: `Please select or enter a reason before ${
          status === "Hidden" ? "hiding" : "removing"
        } this job listing.`,
      });
    }

    const actionCode =
      status === "Hidden"
        ? "JOB_LISTING_HIDDEN"
        : status === "Removed"
        ? "JOB_LISTING_REMOVED"
        : "JOB_APPROVED_UNHIDDEN";

    if (isDbConnected()) {
      const job = await Job.findOne({ jobId });
      if (!job) {
        return res.status(404).json({ success: false, message: "Job listing not found." });
      }
      job.status = status || "Active";
      if (status === "Hidden" || status === "Removed") {
        job.removalReason = reason.trim();
        job.employerResolutionNote = "";
      } else if (status === "Active") {
        job.removalReason = "";
        job.employerResolutionNote = "";
      }
      await job.save();

      await recordAudit({
        actorName: req.user.name,
        actorEmail: req.user.email,
        action: actionCode,
        targetRecord: `job: #${jobId} (${job.title} • ${job.companyName})`,
        reason:
          reason ||
          (status === "Active"
            ? "Employer resolution approved; job listing unhidden and restored to live board."
            : `Requisition status set to ${job.status}.`),
      });

      return res.status(200).json({ success: true, data: job });
    }

    const memJob = memoryJobs.find((j) => j.jobId === jobId);
    if (memJob) {
      memJob.status = status || "Active";
      if (status === "Hidden" || status === "Removed") {
        memJob.removalReason = reason.trim();
        memJob.employerResolutionNote = "";
      } else if (status === "Active") {
        memJob.removalReason = "";
        memJob.employerResolutionNote = "";
      }
    }
    await recordAudit({
      actorName: req.user.name,
      actorEmail: req.user.email,
      action: actionCode,
      targetRecord: `job: #${jobId} (${memJob?.title || "Requisition"})`,
      reason:
        reason ||
        "Employer resolution approved; job listing unhidden and restored to live board.",
    });
    res.status(200).json({ success: true, data: memJob });
  } catch (err) {
    next(err);
  }
};

export const getAuditLogsAdmin = async (_req, res, next) => {
  try {
    if (isDbConnected()) {
      const count = await AuditLog.countDocuments();
      if (count === 0) {
        await AuditLog.insertMany(memoryAuditLogs).catch(() => {});
      }
      const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(50).lean();
      return res.status(200).json({
        success: true,
        data: logs.length > 0 ? logs : memoryAuditLogs,
      });
    }
    res.status(200).json({ success: true, data: memoryAuditLogs });
  } catch (err) {
    next(err);
  }
};