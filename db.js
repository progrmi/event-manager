const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.resolve(__dirname, "events.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error connecting to database:", err);
    return;
  }
  console.log("Connected to SQLite database");
  initializeDatabase();
});

function initializeDatabase() {
  // Enable foreign key support
  db.serialize(() => {
    db.run("PRAGMA foreign_keys = ON;");

    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Events table
    db.run(`CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        creator_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        location TEXT NOT NULL,
        cost REAL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'draft',
        max_attendees INTEGER NOT NULL,
        current_attendees INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (creator_id) REFERENCES users (id) ON DELETE CASCADE
    )`);

    // Bookings table
    db.run(`CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        user_name TEXT NOT NULL,
        user_email TEXT NOT NULL,
        booking_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        UNIQUE(event_id, user_id)
    )`);

    // Site Settings table
    db.run(
      `CREATE TABLE IF NOT EXISTS site_settings (
        setting_key TEXT PRIMARY KEY NOT NULL,
        setting_value TEXT NOT NULL
    )`,
      function (err) {
        if (err) {
          console.error("Error creating site_settings table:", err);
          return;
        }

        // Only insert default settings after table is created
        const defaultSettings = {
          site_name: "Event Manager",
          welcome_title: "Welcome Back!",
          welcome_subtitle:
            "Choose how you'd like to interact with our event management system. Whether you're organizing events or looking to attend them, we've got you covered.",
          footer_bio:
            "We are dedicated to making event management simple and efficient.",
          email: "contact@eventmanager.com",
          phone: "+1 (555) 123-4567",
        };

        const stmt = db.prepare(
          "INSERT OR IGNORE INTO site_settings (setting_key, setting_value) VALUES (?, ?)"
        );
        for (const [key, value] of Object.entries(defaultSettings)) {
          stmt.run(key, value);
        }
        stmt.finalize();
      }
    );
  });
}

module.exports = db;
