import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    jobId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    employerEmail: { type: String, default: "", lowercase: true, trim: true },
    companyId: { type: String, default: "CMP-2026-001", uppercase: true },
    companyName: { type: String, required: true, trim: true, index: true },
    companyInitials: { type: String, default: "ACL", uppercase: true },
    companyLogo: { type: String, default: "" },
    companyBadgeColor: { type: String, default: "indigo" },
    title: { type: String, required: true, trim: true, index: true },
    department: { type: String, default: "Core Infrastructure Team", trim: true },
    category: {
      type: String,
      enum: [
        "Engineering, Systems & AI",
        "Frontend & Full-Stack",
        "Cloud, DevOps & SRE",
        "Product & Design Systems",
        "Data Science & ML",
      ],
      default: "Engineering, Systems & AI",
      index: true,
    },
    jobType: {
      type: String,
      enum: ["Full-Time", "Contract", "Part-Time", "Internship"],
      default: "Full-Time",
      index: true,
    },
    workMode: {
      type: String,
      enum: ["Remote", "Hybrid", "On-Site"],
      default: "Remote",
      index: true,
    },
    location: { type: String, required: true, trim: true },
    experienceLevel: { type: String, default: "Senior (5+ Yrs)", trim: true },
    salaryMin: { type: Number, required: true, default: 120000, index: true },
    salaryMax: { type: Number, required: true, default: 145000 },
    skills: {
      type: [String],
      default: ["React 19", "Node.js", "TypeScript", "AWS ECS"],
      index: true,
    },
    overview: { type: String, required: true, trim: true },
    responsibilities: { type: [String], default: [] },
    requirements: { type: [String], default: [] },
    benefits: {
      type: [String],
      default: [
        "$2,500 Home Ergonomics & Hardware Budget",
        "Flexible Time Off & Async Working Cadence",
        "Comprehensive Health & Global Travel Insurance",
        "$1,500 Annual Research & Conference Stipend",
      ],
    },
    fastReview: { type: Boolean, default: true },
    highlightNote: { type: String, default: "Fast Review (48h)" },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 86400 * 1000),
      index: true,
    },
    status: {
      type: String,
      enum: [
        "Active",
        "Paused",
        "Closed",
        "Expired",
        "Hidden",
        "Pending Review",
        "Removed",
      ],
      default: "Active",
      index: true,
    },
    removalReason: { type: String, default: "" },
    employerResolutionNote: { type: String, default: "" },
    applicantsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

jobSchema.index({ status: 1, workMode: 1, category: 1, createdAt: -1 });

export default mongoose.model("Job", jobSchema);