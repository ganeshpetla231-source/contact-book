require("dotenv").config();

const cors = require("cors");
const express = require("express");
const corsOptions = require("./config/cors");
const connectDatabase = require("./config/db");
const { getPort, validateEnvironment } = require("./config/env");
const authRoutes = require("./routes/authRoutes");
const groupRoutes = require("./routes/groupRoutes");
const contactRoutes = require("./routes/contactRoutes");

const app = express();
const port = getPort();

app.use(cors());
app.use(express.json({ limit: "5mb" }));

app.get("/api/health", (req, res) => res.status(200).json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/contacts", contactRoutes);

app.use((req, res) => {
  return res.status(404).json({ message: "Route not found" });
});

app.use((error, req, res, next) => {
  console.error(error);
  if (error instanceof SyntaxError && error.status === 400 && error.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Invalid JSON body" });
  }
  return res.status(error.status || 500).json({
    message: error.status ? error.message : "Internal server error",
  });
});

const startServer = async () => {
  try {
    validateEnvironment();
    await connectDatabase();
    app.listen(port, () => console.log(`Server running on port ${port}`));
  } catch (error) {
    console.error(`Database connection failed: ${error.message}`);
    process.exit(1);
  }
};

if (require.main === module) startServer();

module.exports = { app, startServer };