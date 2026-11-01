import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { isDbConnected } from "../config/db.js";
import { memoryUsers } from "../controllers/authController.js";

const JWT_SECRET = process.env.JWT_SECRET || "auspify_nexus_portal_jwt_secret_2026";

export const signToken = (userId, role) =>
  jwt.sign({ id: String(userId), role }, JWT_SECRET, { expiresIn: "30d" });

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        code: "NO_TOKEN",
        message: "Authentication required. Please sign in to continue.",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    let user = null;
    if (isDbConnected()) {
      user = await User.findById(decoded.id);
    } else {
      user = memoryUsers.find((u) => String(u._id) === String(decoded.id));
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        code: "ACCOUNT_REMOVED",
        message: "Account no longer exists. You have been signed out.",
      });
    }

    if (user.status === "Suspended") {
      return res.status(403).json({
        success: false,
        code: "ACCOUNT_SUSPENDED",
        message: "Your account has been suspended by a Platform Administrator.",
      });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({
      success: false,
      code: "TOKEN_EXPIRED",
      message: "Session expired or invalid. Please sign in again.",
    });
  }
};

export const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `RBAC Security: Required role (${allowedRoles.join(" or ")}) not satisfied.`,
    });
  }
  next();
};