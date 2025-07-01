const sqlite3 = require("sqlite3").verbose();
const DB_SOURCE = "gatherup.db";

const db = new sqlite3.Database(DB_SOURCE, (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to the SQLite database.");
  }
});

const initialize = () => {
  const eventsTable = `
        CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            event_date TEXT NOT NULL,
            location TEXT NOT NULL,
            host_name TEXT,
            host_description TEXT,
            max_attendees INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

  const attendeesTable = `
        CREATE TABLE IF NOT EXISTS attendees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            event_id INTEGER NOT NULL,
            checked_in INTEGER DEFAULT 0,
            registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (event_id) REFERENCES events (id)
        );
    `;
     const settingsTable = `
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT
        );
    `;
    const usersTable = `
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            password TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

  db.serialize(() => {
    db.run(eventsTable, (err) => {
      if (err) console.error("Error creating events table:", err.message);
    });
    db.run(attendeesTable, (err) => {
      if (err) console.error("Error creating attendees table:", err.message);
    });
    db.run(settingsTable, (err) => {
            if (err) console.error("Error creating settings table:", err.message);
            else {
                // Insert default site name if it doesn't exist
                const sql = "INSERT OR IGNORE INTO settings (key, value) VALUES ('site_name', 'GatherUp')";
                db.run(sql);
            }
        });
    db.run(usersTable, (err) => {
        if (err) console.error("Error creating users table:", err.message);
    });
  });
};

module.exports = { db, initialize };
