import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const resumeMetaSchema = new mongoose.Schema(
  {
    fileName: { type: String, default: "" },
    fileType: { type: String, default: "application/pdf" },
    fileSizeKB: { type: Number, default: 0 },
    fileDataUrl: { type: String, default: "" },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 90 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, required: true, minlength: 6, select: false },
    role: {
      type: String,
      enum: ["seeker", "employer", "admin"],
      default: "seeker",
      index: true,
    },
    status: {
      type: String,
      enum: ["Active", "Suspended"],
      default: "Active",
      index: true,
    },
    // Candidate Profile Fields
    headline: {
      type: String,
      default: "Full-Stack Software Engineer",
      trim: true,
    },
    phone: { type: String, default: "", trim: true },
    location: { type: String, default: "Colombo, Sri Lanka", trim: true },
    portfolioUrl: { type: String, default: "", trim: true },
    skills: {
      type: [String],
      default: ["React", "Node.js", "TypeScript", "MongoDB"],
    },
    bio: { type: String, default: "", trim: true },
    defaultResume: {
      type: resumeMetaSchema,
      default: () => ({
        fileName: "",
        fileType: "",
        fileSizeKB: 0,
        fileDataUrl: "",
      }),
    },
    savedJobs: { type: [String], default: [] },
    // Employer quick reference
    companyName: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", userSchema);