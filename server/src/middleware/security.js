const cleanValue = (val) => {
  if (typeof val === "string") {
    return val.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "").trim();
  }
  if (Array.isArray(val)) return val.map(cleanValue);
  if (val && typeof val === "object") {
    const cleaned = {};
    for (const key of Object.keys(val)) {
      if (key.startsWith("$") || key.includes(".")) continue;
      cleaned[key] = cleanValue(val[key]);
    }
    return cleaned;
  }
  return val;
};

export const sanitizeRequest = (req, _res, next) => {
  if (req.body && typeof req.body === "object") {
    req.body = cleanValue(req.body);
  }
  next();
};

export const errorHandler = (err, _req, res, _next) => {
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Internal server error",
  });
};