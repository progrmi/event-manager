const express = require("express");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
const db = require("./database");
const eventRoutes = require("./routes/eventRoutes");
const attendeeRoutes = require("./routes/attendeeRoutes");

const app = express();
const PORT = 3000;

// Initialize the database
db.initialize();

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "a_secret_key_to_sign_the_cookie", // Replace with a real secret in production
    resave: false,
    saveUninitialized: true,
  })
);

app.use(flash());

// Custom middleware to make flash messages available in all views
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  next();
});
// Set view engine and views directory
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files (CSS, client-side JS)
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/events", eventRoutes);
app.use("/attendees", attendeeRoutes);

// Home route - redirect to the events list
app.get("/", (req, res) => {
  res.redirect("/events");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
