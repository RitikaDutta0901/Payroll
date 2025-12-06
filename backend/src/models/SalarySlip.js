// src/models/SalarySlip.js
const mongoose = require("mongoose");

const salarySlipSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    month: {
      type: String, // e.g. "2025-01"
      required: true
    },
    basic: { type: Number, required: true },
    allowances: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    net: { type: Number, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("SalarySlip", salarySlipSchema);
