const jwt = require("jsonwebtoken");

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Middleware to check if user is authenticated
const authenticateToken = (req, res, next) => {
  const token = req?.cookies?.token || null;
  console.log("Token in authenticateToken middleware:", token);

  if (!token) {
    return res.redirect("/auth/login");
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Decoded token:", decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    res.clearCookie("token");
    return res.redirect("/auth/login");
  }
};

// Middleware to add user info to all templates (optional authentication)
const addUserToLocals = (req, res, next) => {
  const token = req?.cookies?.token || null;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      res.locals.user = decoded;
    } catch (error) {
      // Token invalid, clear it
      res.clearCookie("token");
      req.user = null;
      res.locals.user = null;
    }
  } else {
    req.user = null;
    res.locals.user = null;
  }

  next();
};

// Middleware to redirect authenticated users away from login/register pages
const redirectIfAuthenticated = (req, res, next) => {
  const token = req?.cookies?.token || null;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      // Redirect to home page instead of role-specific pages
      return res.redirect("/");
    } catch (error) {
      // Token invalid, clear it and continue
      res.clearCookie("token");
    }
  }

  next();
};

// New middleware to require authentication but allow access to home page
const optionalAuth = (req, res, next) => {
  const token = req?.cookies?.token || null;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      res.locals.user = decoded;
    } catch (error) {
      // Token invalid, clear it
      res.clearCookie("token");
      req.user = null;
      res.locals.user = null;
    }
  } else {
    req.user = null;
    res.locals.user = null;
  }

  next();
};

module.exports = {
  authenticateToken,
  addUserToLocals,
  redirectIfAuthenticated,
  optionalAuth,
};
