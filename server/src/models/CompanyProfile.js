import mongoose from "mongoose";

const companyProfileSchema = new mongoose.Schema(
  {
    companyId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      default: null,
    },
    employerEmail: { type: String, default: "", lowercase: true, trim: true },
    companyName: { type: String, required: true, trim: true, index: true },
    initials: { type: String, default: "ACL", uppercase: true, trim: true },
    logoUrl: { type: String, default: "" },
    badgeColor: { type: String, default: "indigo" },
    industry: {
      type: String,
      default: "Enterprise Cloud & SaaS",
      trim: true,
    },
    location: {
      type: String,
      default: "Colombo 07 & San Francisco",
      trim: true,
    },
    website: { type: String, default: "https://auspify.com", trim: true },
    companySize: { type: String, default: "140+ Engineers", trim: true },
    fundingStage: { type: String, default: "Series B", trim: true },
    rating: { type: String, default: "4.9 / 5.0", trim: true },
    description: {
      type: String,
      default:
        "Delivering mission-critical distributed cloud primitives, scalable API orchestration frameworks, and high-performance developer tooling.",
      trim: true,
    },
    verified: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("CompanyProfile", companyProfileSchema);