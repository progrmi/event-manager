const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");

// JWT Secret (in production, use environment variable)
const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

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

    // Find user in the database
    db.get(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (err, user) => {
        if (err) {
          console.error("Database error during login:", err);
          return res.render("login", {
            message: { type: "error", text: "An error occurred during login." },
            formData: { email },
          });
        }

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
      }
    );
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

// Register POST
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    db.get(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (err, existingUser) => {
        if (err) {
          console.error("Database error during registration:", err);
          return res.render("register", {
            message: {
              type: "error",
              text: "An error occurred during registration",
            },
            formData: req.body,
          });
        }

        if (existingUser) {
          return res.render("register", {
            message: {
              type: "error",
              text: "User with this email already exists",
            },
            formData: { name, email, role },
          });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save new user to the database
        const sql =
          "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";
        const params = [name, email, hashedPassword, role || "attendee"];

        db.run(sql, params, function (err) {
          if (err) {
            console.error("Error inserting user:", err);
            return res.render("register", {
              message: {
                type: "error",
                text: "An error occurred during registration",
              },
              formData: req.body,
            });
          }

          const newUser = {
            id: this.lastID,
            email: email,
            role: role || "attendee",
            name: name,
          };

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
        });
      }
    );
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
