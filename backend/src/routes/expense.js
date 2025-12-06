// src/routes/expense.js
const express = require("express");
const { auth, requireRole } = require("../middleware/auth");
const Expense = require("../models/Expense");

const router = express.Router();

// POST /expense  (employee submits expense)
router.post("/", auth, requireRole("employee"), async (req, res) => {
  try {
    const { amount, description, date } = req.body;

    if (amount == null || !description) {
      return res
        .status(400)
        .json({ message: "amount and description are required" });
    }

    const expense = await Expense.create({
      employee: req.user._id,
      amount: Number(amount),
      description,
      date: date ? new Date(date) : new Date()
    });

    res.status(201).json(expense);
  } catch (error) {
    console.error("Create expense error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /expense
// employee: only own
// admin: all, or filter by ?employeeId=... or ?status=pending/approved/rejected
router.get("/", auth, async (req, res) => {
  try {
    let filter = {};
    const { employeeId, status } = req.query;

    if (req.user.role === "employee") {
      filter.employee = req.user._id;
    } else if (req.user.role === "admin") {
      if (employeeId) {
        filter.employee = employeeId;
      }
    }

    if (status) {
      filter.status = status;
    }

    const expenses = await Expense.find(filter)
      .populate("employee", "name email")
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 });

    res.json(expenses);
  } catch (error) {
    console.error("Get expenses error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH /expense/:id/status  (admin approves/rejects)
router.patch("/:id/status", auth, requireRole("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // "approved" or "rejected"

    if (!["approved", "rejected"].includes(status)) {
      return res
        .status(400)
        .json({ message: "Status must be approved or rejected" });
    }

    const expense = await Expense.findById(id);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    expense.status = status;
    expense.reviewedBy = req.user._id;
    expense.reviewedAt = new Date();

    await expense.save();

    const populated = await expense
      .populate("employee", "name email")
      .populate("reviewedBy", "name email");

    res.json(populated);
  } catch (error) {
    console.error("Update expense status error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
