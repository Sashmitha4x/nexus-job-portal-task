import mongoose from "mongoose";
import dns from "node:dns";

try {
  dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
} catch {
  // Ignore if restricted by host environment
}

let connectPromise = null;
let lastAttemptTime = 0;

export const isDbConnected = () => mongoose.connection.readyState === 1;

mongoose.connection.on("connected", () => {
  console.log(`✅ MongoDB Atlas Connected: ${mongoose.connection.host}`);
});

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ MongoDB Atlas disconnected. Auto-reconnecting on next activity...");
});

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return true;
  if (mongoose.connection.readyState === 2 && connectPromise) return connectPromise;

  if (!process.env.MONGO_URI || process.env.MONGO_URI.includes("YOUR_REAL_PASSWORD")) {
    return false;
  }

  const now = Date.now();
  if (now - lastAttemptTime < 5000 && connectPromise) {
    return connectPromise;
  }
  lastAttemptTime = now;

  connectPromise = mongoose
    .connect(process.env.MONGO_URI, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
      heartbeatFrequencyMS: 10000,
      family: 4,
    })
    .then(() => {
      connectPromise = null;
      return true;
    })
    .catch((err) => {
      connectPromise = null;
      console.warn(
        `⚠️ MongoDB Atlas unreachable (${err.message}). Running with In-Memory Engine.`
      );
      return false;
    });

  return connectPromise;
};