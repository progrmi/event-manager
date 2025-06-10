const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");

// JWT Secret (in production, use environment variable)
const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Demo users for testing (in production, these would be in database)
const DEMO_USERS = [
  {
    id: 1,
    email: "admin@eventmanager.com",
    password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // admin123
    role: "organiser",
    name: "Admin User",
  },
  {
    id: 2,
    email: "user@eventmanager.com",
    password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // user123
    role: "attendee",
    name: "Regular User",
  },
];

// Login page
router.get("/login", (req, res) => {
  // If already logged in, redirect based on role
  if (req.user) {
    return res.redirect(
      req.user.role === "organiser" ? "/organiser" : "/attendee"
    );
  }
  res.render("login", { message: null, formData: {} });
});

// Login POST
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user (in production, query database)
    const user = DEMO_USERS.find((u) => u.email === email);

    if (!user) {
      return res.render("login", {
        message: { type: "error", text: "Invalid email or password" },
        formData: { email },
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.render("login", {
        message: { type: "error", text: "Invalid email or password" },
        formData: { email },
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Set token as HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    // Redirect based on role
    if (user.role === "organiser") {
      res.redirect("/organiser");
    } else {
      res.redirect("/attendee");
    }
  } catch (error) {
    console.error("Login error:", error);
    res.render("login", {
      message: { type: "error", text: "An error occurred during login" },
      formData: { email: req.body.email },
    });
  }
});

// Register page
router.get("/register", (req, res) => {
  // If already logged in, redirect
  if (req.user) {
    return res.redirect(
      req.user.role === "organiser" ? "/organiser" : "/attendee"
    );
  }
  res.render("register", { message: null, formData: {} });
});

// Register POST (basic implementation)
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = DEMO_USERS.find((u) => u.email === email);
    if (existingUser) {
      return res.render("register", {
        message: { type: "error", text: "User with this email already exists" },
        formData: { name, email, role },
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // In production, save to database
    const newUser = {
      id: DEMO_USERS.length + 1,
      email,
      password: hashedPassword,
      role: role || "attendee",
      name,
    };

    // For demo purposes, just add to memory array
    DEMO_USERS.push(newUser);

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role,
        name: newUser.name,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Set token as cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    });

    // Redirect based on role
    if (newUser.role === "organiser") {
      res.redirect("/organiser");
    } else {
      res.redirect("/attendee");
    }
  } catch (error) {
    console.error("Registration error:", error);
    res.render("register", {
      message: { type: "error", text: "An error occurred during registration" },
      formData: req.body,
    });
  }
});

// Logout
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/auth/login");
});

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/auth/login");
});

module.exports = router;
