const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");
const { addUserToLocals } = require("./middleware/auth");

// Import Routers
const indexRouter = require("./routes/index");
const authRouter = require("./routes/auth");
const organiserRouter = require("./routes/organiser");
const attendeeRouter = require("./routes/attendee");
const profileRouter = require("./routes/profile");

const app = express();

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Custom middleware to add user info to all templates
app.use(addUserToLocals);

// Mount Routers
app.use("/", indexRouter);
app.use("/auth", authRouter);
app.use("/organiser", organiserRouter);
app.use("/attendee", attendeeRouter);
app.use("/profile", profileRouter);

// Basic error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
