import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    logId: { type: String, required: true, unique: true },
    actorName: { type: String, required: true },
    actorEmail: { type: String, required: true },
    action: { type: String, required: true },
    targetRecord: { type: String, required: true },
    reason: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("AuditLog", auditLogSchema);