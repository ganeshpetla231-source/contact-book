const requiredProductionVariables = ["MONGO_URI", "JWT_SECRET", "CLIENT_URL"];

const validateEnvironment = () => {
  const missing = requiredProductionVariables.filter((name) => !process.env[name]);
  if (process.env.NODE_ENV === "production" && missing.length > 0) {
    throw new Error(`Missing production environment variables: ${missing.join(", ")}`);
  }

  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is not configured");
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not configured");
};

const getPort = () => Number.parseInt(process.env.PORT, 10) || 5000;

module.exports = { getPort, validateEnvironment };