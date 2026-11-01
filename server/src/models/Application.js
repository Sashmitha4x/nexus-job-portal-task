import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    applicationId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    jobId: { type: String, required: true, uppercase: true, index: true },
    jobTitle: { type: String, required: true },
    companyId: { type: String, default: "CMP-2026-001" },
    companyName: { type: String, required: true },
    companyInitials: { type: String, default: "ACL" },
    companyLogo: { type: String, default: "" },
    employerEmail: { type: String, default: "", lowercase: true, index: true },
    location: { type: String, default: "Colombo / Remote" },
    salaryMin: { type: Number, default: 120000 },
    salaryMax: { type: Number, default: 145000 },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      default: null,
    },
    candidateName: { type: String, required: true },
    candidateEmail: { type: String, required: true, lowercase: true, index: true },
    candidatePhone: { type: String, default: "" },
    candidateHeadline: { type: String, default: "Full-Stack Engineer" },
    skills: { type: [String], default: [] },
    coverNote: { type: String, default: "", trim: true },
    noticePeriod: { type: String, default: "2 Weeks Notice (Standard)" },
    expectedSalary: { type: String, default: "$135,000 / year" },
    resumeFileName: { type: String, required: true },
    resumeFileType: { type: String, default: "application/pdf" },
    resumeFileSizeKB: { type: Number, default: 420 },
    resumeDataUrl: { type: String, default: "" },
    status: {
      type: String,
      enum: [
        "Applied",
        "Under Review",
        "Interview Scheduled",
        "Offer Extended",
        "Rejected",
      ],
      default: "Applied",
      index: true,
    },
    interviewDate: { type: String, default: "" },
    interviewDetails: { type: String, default: "" },
    offerDetails: { type: String, default: "" },
    offerStatus: {
      type: String,
      enum: ["Pending", "Accepted", "Declined"],
      default: "Pending",
    },
    offerRespondedAt: { type: Date, default: null },
    rejectionReason: { type: String, default: "" },
    archivedByCandidate: { type: Boolean, default: false },
  },
  { timestamps: true }
);

applicationSchema.index({ jobId: 1, candidateEmail: 1 }, { unique: true });

export default mongoose.model("Application", applicationSchema);