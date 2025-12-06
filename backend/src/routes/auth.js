// src/routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { auth } = require("../middleware/auth");
const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");

const router = express.Router();

// helper: format user
const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role
});

// helper: create access token
const createAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "15m"
    }
  );
};

// helper: create refresh token in DB
const createRefreshToken = async (userId) => {
  const expiresInStr = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // simple: 7 days

  const token = jwt.sign(
    { id: userId },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: expiresInStr }
  );

  await RefreshToken.create({
    user: userId,
    token,
    expiresAt
  });

  return token;
};

// POST /auth/signup  (employee signup)
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: "employee"
    });

    const accessToken = createAccessToken(user);
    const refreshToken = await createRefreshToken(user._id);

    res.status(201).json({
      accessToken,
      refreshToken,
      user: formatUser(user)
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const accessToken = createAccessToken(user);
    const refreshToken = await createRefreshToken(user._id);

    res.json({
      accessToken,
      refreshToken,
      user: formatUser(user)
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /auth/me
router.get("/me", auth, async (req, res) => {
  res.json({ user: formatUser(req.user) });
});

// POST /auth/refresh
// Body: { refreshToken }
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "refreshToken is required" });
    }

    const stored = await RefreshToken.findOne({ token: refreshToken }).populate(
      "user"
    );
    if (!stored) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    try {
      jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
      await RefreshToken.deleteOne({ _id: stored._id });
      return res.status(401).json({ message: "Refresh token expired" });
    }

    const user = stored.user;
    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    const newAccessToken = createAccessToken(user);

    res.json({
      accessToken: newAccessToken
    });
  } catch (error) {
    console.error("Refresh error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /auth/logout
// Body: { refreshToken }
router.post("/logout", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: "refreshToken is required" });
    }

    await RefreshToken.deleteOne({ token: refreshToken });

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
