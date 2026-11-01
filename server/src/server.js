import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { connectDB, isDbConnected } from "./config/db.js";
import jobRoutes from "./routes/jobRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { sanitizeRequest, errorHandler } from "./middleware/security.js";

dotenv.config();

const app = express();
app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);
app.use(compression());
app.use(express.json({ limit: "12mb" }));
app.use(sanitizeRequest);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000,
  skip: (req) => req.method === "GET",
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many write requests from this IP, please try again shortly.",
  },
});
app.use("/api", limiter);

app.get("/api/v1/health", async (_req, res) => {
  const start = Date.now();
  const connected = await connectDB();
  res.status(200).json({
    status: connected ? "Connected" : "Local Fallback",
    cluster: connected ? "MongoDB Atlas" : "In-Memory Engine",
    latencyMs: Math.max(12, Date.now() - start),
  });
});

const withDB = async (_req, _res, next) => {
  if (!isDbConnected()) {
    await connectDB();
  }
  next();
};

app.use("/api/v1/jobs", withDB, jobRoutes);
app.use("/api/v1/auth", withDB, authRoutes);
app.use("/api/v1/applications", withDB, applicationRoutes);
app.use("/api/v1/admin", withDB, adminRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== "production") {
  connectDB().finally(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Auspify Nexus Job Portal API running on http://localhost:${PORT}`);
    });
  });
}

export default app;