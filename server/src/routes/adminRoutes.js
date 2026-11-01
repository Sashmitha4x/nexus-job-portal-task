import express from "express";
import {
  getPlatformUsers,
  toggleUserStatusAdmin,
  moderateJobListingAdmin,
  getAuditLogsAdmin,
} from "../controllers/adminController.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(requireAuth, requireRole("admin"));
router.get("/users", getPlatformUsers);
router.put("/users/:id/status", toggleUserStatusAdmin);
router.put("/jobs/:jobId/moderate", moderateJobListingAdmin);
router.get("/audit-logs", getAuditLogsAdmin);

export default router;