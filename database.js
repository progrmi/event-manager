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

  db.serialize(() => {
    db.run(eventsTable, (err) => {
      if (err) console.error("Error creating events table:", err.message);
    });
    db.run(attendeesTable, (err) => {
      if (err) console.error("Error creating attendees table:", err.message);
    });
  });
};

module.exports = { db, initialize };
