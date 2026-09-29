const express = require("express");
const { body } = require("express-validator");
const { register, login, me, updateProfilePhoto } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
const nameValidation = body("name").trim().notEmpty().withMessage("Name is required");
const emailValidation = body("email").trim().isEmail().withMessage("A valid email is required");
const passwordValidation = body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters");

router.post("/register", [nameValidation, emailValidation, passwordValidation], register);
router.post("/login", [emailValidation, body("password").notEmpty().withMessage("Password is required")], login);
router.get("/me", authMiddleware, me);
router.patch("/profile", authMiddleware, updateProfilePhoto);

module.exports = router;