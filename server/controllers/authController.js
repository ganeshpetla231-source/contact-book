const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/User");

const createToken = (userId) => jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
const publicUser = (user) => ({ id: user.id, name: user.name, email: user.email, photo: user.photo || "", createdAt: user.createdAt });

const validationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: errors.array()[0].msg });
    return true;
  }
  return false;
};

const register = async (req, res) => {
  if (validationErrors(req, res)) return;

  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email.toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) return res.status(400).json({ message: "Email is already registered" });

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email: normalizedEmail, password: hashedPassword });

    return res.status(201).json({
      user: publicUser(user),
      token: createToken(user.id),
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to register user" });
  }
};

const login = async (req, res) => {
  if (validationErrors(req, res)) return;

  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    const passwordMatches = user && await bcrypt.compare(password, user.password);

    if (!user || !passwordMatches) return res.status(401).json({ message: "Invalid email or password" });

    return res.status(200).json({
      user: publicUser(user),
      token: createToken(user.id),
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to log in" });
  }
};

const me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ user });
  } catch (error) {
    return res.status(404).json({ message: "User not found" });
  }
};

const updateProfilePhoto = async (req, res) => {
  if (typeof req.body.photo !== "string" && req.body.photo !== null) return res.status(400).json({ message: "A valid photo is required" });
  try {
    const user = await User.findByIdAndUpdate(req.user.id, { photo: req.body.photo || null }, { returnDocument: "after", runValidators: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ user: publicUser(user) });
  } catch (error) {
    return res.status(400).json({ message: "Unable to save profile photo" });
  }
};

module.exports = { register, login, me, updateProfilePhoto };