const getAllowedOrigins = () => (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  credentials: true,
  origin(origin, callback) {
    const allowedOrigins = getAllowedOrigins();
    const isLocalDevelopment = process.env.NODE_ENV !== "production" && allowedOrigins.length === 0;

    if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin) || isLocalDevelopment) {
      return callback(null, true);
    }

    return callback(new Error("Origin is not allowed by CORS"));
  },
};

module.exports = corsOptions;