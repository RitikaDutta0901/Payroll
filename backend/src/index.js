// backend/src/index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const bcrypt = require("bcryptjs");

const connectDB = require("./config/db");
const User = require("./models/User");

// routes
const authRoutes = require("./routes/auth");
const salarySlipRoutes = require("./routes/salarySlip");
const expenseRoutes = require("./routes/expense");
const userRoutes = require("./routes/user"); // ✅ NEW

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// health check
app.get("/", (req, res) => {
  res.send("Payroll Management System API running");
});

// route mounts
app.use("/auth", authRoutes);
app.use("/salary-slip", salarySlipRoutes);
app.use("/expense", expenseRoutes);
app.use("/users", userRoutes); // ✅ NEW

// Seed demo admin user
const seedAdminUser = async () => {
  try {
    const email = "hire-me@anshumat.org";
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      console.log("ℹ️ Demo admin user already exists");
      return;
    }

    const password = "HireMe@2025!";
    const passwordHash = await bcrypt.hash(password, 10);

    const admin = await User.create({
      name: "Demo Admin",
      email: email.toLowerCase(),
      passwordHash,
      role: "admin"
    });

    console.log("✅ Demo admin user created:");
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: ${password}`);
  } catch (error) {
    console.error("Error seeding admin user:", error);
  }
};

const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  await seedAdminUser();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});
