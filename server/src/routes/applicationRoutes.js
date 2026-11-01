import express from "express";
import {
  getApplications,
  submitApplication,
  updateApplicationStatus,
  toggleArchiveApplication,
  respondToOffer,
} from "../controllers/applicationController.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(requireAuth);
router.get("/", getApplications);
router.post("/", requireRole("seeker"), submitApplication);
router.put("/:applicationId/archive", requireRole("seeker"), toggleArchiveApplication);
router.put("/:applicationId/respond-offer", requireRole("seeker"), respondToOffer);
router.put(
  "/:applicationId/status",
  requireRole("employer", "admin"),
  updateApplicationStatus
);

export default router;