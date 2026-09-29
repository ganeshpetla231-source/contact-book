const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authorization = req.get("Authorization");

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const token = authorization.slice(7);

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;