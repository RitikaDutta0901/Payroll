// src/routes/salarySlip.js
const express = require("express");
const mongoose = require("mongoose");
const { auth, requireRole } = require("../middleware/auth");
const SalarySlip = require("../models/SalarySlip");
const User = require("../models/User");

const router = express.Router();

// POST /salary-slip  (admin creates slip for an employee)
router.post("/", auth, requireRole("admin"), async (req, res) => {
  try {
    const { employeeId, month, basic, allowances, deductions } = req.body;

    if (!employeeId || !month || basic == null) {
      return res
        .status(400)
        .json({ message: "employeeId, month and basic are required" });
    }

    // ✅ validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({ message: "Invalid employeeId" });
    }

    // ✅ check that user exists and is employee
    const employee = await User.findById(employeeId);
    if (!employee) {
      return res.status(400).json({ message: "Employee not found" });
    }
    if (employee.role !== "employee") {
      return res
        .status(400)
        .json({ message: "Target user is not an employee" });
    }

    const basicNum = Number(basic);
    const allowancesNum = Number(allowances || 0);
    const deductionsNum = Number(deductions || 0);
    const net = basicNum + allowancesNum - deductionsNum;

    const slip = await SalarySlip.create({
      employee: employeeId,
      month,
      basic: basicNum,
      allowances: allowancesNum,
      deductions: deductionsNum,
      net
    });

    res.status(201).json(slip);
  } catch (error) {
    console.error("Create salary slip error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /salary-slip/:id  (admin updates)
router.put("/:id", auth, requireRole("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const { month, basic, allowances, deductions } = req.body;

    const slip = await SalarySlip.findById(id);
    if (!slip) {
      return res.status(404).json({ message: "Salary slip not found" });
    }

    if (month) slip.month = month;
    if (basic != null) slip.basic = Number(basic);
    if (allowances != null) slip.allowances = Number(allowances);
    if (deductions != null) slip.deductions = Number(deductions);

    slip.net = slip.basic + (slip.allowances || 0) - (slip.deductions || 0);

    await slip.save();

    res.json(slip);
  } catch (error) {
    console.error("Update salary slip error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /salary-slip
router.get("/", auth, async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "employee") {
      filter.employee = req.user._id;
    } else if (req.user.role === "admin") {
      if (req.query.employeeId) {
        filter.employee = req.query.employeeId;
      }
    }

    const slips = await SalarySlip.find(filter)
      .populate("employee", "name email")
      .sort({ month: -1, createdAt: -1 });

    res.json(slips);
  } catch (error) {
    console.error("Get salary slips error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
