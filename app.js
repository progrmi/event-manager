const express = require("express");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
const db = require("./database");
const { addUserToLocals } = require("./middleware/auth");
const eventRoutes = require("./routes/eventRoutes");
const attendeeRoutes = require("./routes/attendeeRoutes");
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const settingsRoutes = require('./routes/settingsRoutes'); // <-- Add this require
const Setting = require('./models/setting');    
const SQLiteStore = require('connect-sqlite3')(session);
const cookieParser = require("cookie-parser");

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize the database
db.initialize();

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
    // Tell express-session to use the new store
    store: new SQLiteStore({
        db: 'gatherup.db',  // The name of your database file
        dir: './',          // The directory where the db file is located
        table: 'sessions'   // The name of the table to create/use
    }),
    secret: 'a_secret_key_to_sign_the_cookie', // IMPORTANT: Change this to a long, random string
    resave: false,
    saveUninitialized: false, // Recommended for production to save space
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 } // Example: 7 days
}));

app.use(flash());

// Custom middleware to make flash messages available in all views
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
   Setting.findByKey('site_name', (err, setting) => {
        res.locals.siteName = (err || !setting) ? 'GatherUp' : setting.value;
        next();
    });
});
// Set view engine and views directory
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files (CSS, client-side JS)
app.use(express.static(path.join(__dirname, "public")));
app.use(addUserToLocals);
// Routes
app.use("/auth", authRouter);
app.use("/events", eventRoutes);
app.use("/attendees", attendeeRoutes);
app.use("/profile", profileRouter);
app.use('/settings', settingsRoutes);

// Home route - redirect to the events list
app.get("/", (req, res) => {
  res.redirect("/events");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
