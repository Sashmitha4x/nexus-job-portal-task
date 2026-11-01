import express from "express";
import {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  updatePassword,
} from "../controllers/authController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", requireAuth, getMe);
router.put("/profile", requireAuth, updateProfile);
router.put("/password", requireAuth, updatePassword);

export default router;