const userModel = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

const generateTokenAndSetCookie = (res, user) => {
  const token = jwt.sign(
    { userId: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: "24h" }
  );
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  });
};

// Show login page
exports.getLoginPage = (req, res) => {
  if (req.user) return res.redirect("/");
  res.render("login", { title: "Login", message: null, formData: {} });
};

// Handle login logic
exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).render("login", {
        title: "Login",
        message: { type: "error", text: "Invalid email or password" },
        formData: { email },
      });
    }

    generateTokenAndSetCookie(res, user);
    res.redirect("/");
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).render("login", {
      title: "Login",
      message: { type: "error", text: "An error occurred during login." },
      formData: { email: req.body.email },
    });
  }
};

// Show registration page
exports.getRegisterPage = (req, res) => {
  if (req.user) return res.redirect("/");
  res.render("register", { title: "Register", message: null, formData: {} });
};

// Handle registration logic
exports.postRegister = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await userModel.findByEmail(email);

    if (existingUser) {
      return res.status(400).render("register", {
        title: "Register",
        message: { type: "error", text: "User with this email already exists" },
        formData: { name, email },
      });
    }

    const newUser = await userModel.create({ name, email, password });
    generateTokenAndSetCookie(res, newUser);
    res.redirect("/");
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).render("register", {
      title: "Register",
      message: {
        type: "error",
        text: "An error occurred during registration.",
      },
      formData: req.body,
    });
  }
};

// Handle logout
exports.logout = (req, res) => {
  res.clearCookie("token");
  res.redirect("/auth/login");
};
