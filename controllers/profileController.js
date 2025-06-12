const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Show the user's profile page
exports.getProfilePage = (req, res) => {
  res.render("profile", {
    title: "Your Profile",
    message: null,
  });
};

// Handle profile updates
exports.updateProfile = async (req, res) => {
  const { name, password, confirmPassword } = req.body;
  const { userId, email } = req.user;

  if (password && password !== confirmPassword) {
    return res.status(400).render("profile", {
      title: "Your Profile",
      message: { type: "error", text: "Passwords do not match." },
    });
  }

  try {
    const updateData = { userId, name };
    if (password && password.length >= 6) {
      updateData.password = password;
    }

    await userModel.update(updateData);

    // Generate a new token with the updated name
    const token = jwt.sign({ userId, email, name }, JWT_SECRET, {
      expiresIn: "24h",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    });

    // Re-render with a success message. The new user info will be picked up
    // by the `addUserToLocals` middleware on the next request, but we can
    // manually update it here for immediate feedback.
    res.locals.user.name = name;
    res.render("profile", {
      title: "Your Profile",
      message: { type: "success", text: "Profile updated successfully!" },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).render("profile", {
      title: "Your Profile",
      message: { type: "error", text: "An error occurred during update." },
    });
  }
};
