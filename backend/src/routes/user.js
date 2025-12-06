// backend/src/routes/user.js
const express = require("express");
const { auth, requireRole } = require("../middleware/auth");
const User = require("../models/User");

const router = express.Router();

/**
 * GET /users/employees
 * Admin-only endpoint to list all employees with their IDs and emails
 */
router.get("/employees", auth, requireRole("admin"), async (req, res) => {
  try {
    const employees = await User.find({ role: "employee" }).select(
      "name email _id"
    );

    res.json(employees);
  } catch (error) {
    console.error("Get employees error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
