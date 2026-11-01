import express from "express";
import {
  getJobs,
  getCompanies,
  upsertCompanyProfile,
  createJob,
  updateJob,
  deleteJob,
} from "../controllers/jobController.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getJobs);
router.get("/companies", getCompanies);
router.put(
  "/companies/profile",
  requireAuth,
  requireRole("employer", "admin"),
  upsertCompanyProfile
);
router.post("/", requireAuth, requireRole("employer", "admin"), createJob);
router.put("/:jobId", requireAuth, requireRole("employer", "admin"), updateJob);
router.delete("/:jobId", requireAuth, requireRole("employer", "admin"), deleteJob);

export default router;