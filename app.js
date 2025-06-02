const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

// Set up EJS as template engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

// Initialize SQLite database
const db = new sqlite3.Database("events.db", (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to SQLite database");
    initializeDatabase();
  }
});

// Create tables if they don't exist
function initializeDatabase() {
  // Events table
  db.run(`CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        location TEXT NOT NULL,
        max_attendees INTEGER NOT NULL,
        current_attendees INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

  // Bookings table
  db.run(`CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER,
        attendee_name TEXT NOT NULL,
        attendee_email TEXT NOT NULL,
        booking_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES events (id)
    )`);
}

// Routes

// Home page - redirect to organiser page
app.get("/", (req, res) => {
  res.redirect("/organiser");
});

// Organiser page - for creating and managing events
app.get("/organiser", (req, res) => {
  db.all("SELECT * FROM events ORDER BY date ASC", (err, events) => {
    if (err) {
      console.error(err);
      events = [];
    }
    res.render("organiser", { events: events });
  });
});

// Create new event
app.post("/organiser/create", (req, res) => {
  const { title, description, date, time, location, max_attendees } = req.body;

  const stmt =
    db.prepare(`INSERT INTO events (title, description, date, time, location, max_attendees) 
                            VALUES (?, ?, ?, ?, ?, ?)`);

  stmt.run(
    [title, description, date, time, location, max_attendees],
    function (err) {
      if (err) {
        console.error("Error creating event:", err);
      }
      res.redirect("/organiser");
    }
  );

  stmt.finalize();
});

// Delete event
app.post("/organiser/delete/:id", (req, res) => {
  const eventId = req.params.id;

  // Delete bookings first
  db.run("DELETE FROM bookings WHERE event_id = ?", [eventId], (err) => {
    if (err) {
      console.error("Error deleting bookings:", err);
    }

    // Then delete the event
    db.run("DELETE FROM events WHERE id = ?", [eventId], (err) => {
      if (err) {
        console.error("Error deleting event:", err);
      }
      res.redirect("/organiser");
    });
  });
});

// Attendee page - for viewing and booking events
app.get("/attendee", (req, res) => {
  db.all(
    `SELECT * FROM events 
            WHERE date >= date('now') 
            AND current_attendees < max_attendees 
            ORDER BY date ASC`,
    (err, events) => {
      if (err) {
        console.error(err);
        events = [];
      }
      res.render("attendee", { events: events, message: null });
    }
  );
});

// Book event
app.post("/attendee/book/:id", (req, res) => {
  const eventId = req.params.id;
  const { attendee_name, attendee_email } = req.body;

  // Check if event is still available
  db.get(
    "SELECT * FROM events WHERE id = ? AND current_attendees < max_attendees",
    [eventId],
    (err, event) => {
      if (err || !event) {
        return res.redirect("/attendee?error=Event not available");
      }

      // Check if user already booked this event
      db.get(
        "SELECT * FROM bookings WHERE event_id = ? AND attendee_email = ?",
        [eventId, attendee_email],
        (err, existingBooking) => {
          if (existingBooking) {
            return res.redirect(
              "/attendee?error=You have already booked this event"
            );
          }

          // Create booking
          const stmt = db.prepare(
            "INSERT INTO bookings (event_id, attendee_name, attendee_email) VALUES (?, ?, ?)"
          );
          stmt.run([eventId, attendee_name, attendee_email], function (err) {
            if (err) {
              console.error("Error creating booking:", err);
              return res.redirect("/attendee?error=Booking failed");
            }

            // Update current attendees count
            db.run(
              "UPDATE events SET current_attendees = current_attendees + 1 WHERE id = ?",
              [eventId],
              (err) => {
                if (err) {
                  console.error("Error updating attendee count:", err);
                }
                res.redirect("/attendee?success=Booking successful");
              }
            );
          });
          stmt.finalize();
        }
      );
    }
  );
});

// View event bookings (for organiser)
app.get("/organiser/bookings/:id", (req, res) => {
  const eventId = req.params.id;

  db.get("SELECT * FROM events WHERE id = ?", [eventId], (err, event) => {
    if (err || !event) {
      return res.redirect("/organiser");
    }

    db.all(
      "SELECT * FROM bookings WHERE event_id = ? ORDER BY booking_date DESC",
      [eventId],
      (err, bookings) => {
        if (err) {
          console.error(err);
          bookings = [];
        }
        res.render("bookings", { event: event, bookings: bookings });
      }
    );
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Event Manager server running on port ${PORT}`);
  console.log(`Organiser page: http://localhost:${PORT}/organiser`);
  console.log(`Attendee page: http://localhost:${PORT}/attendee`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log("Database connection closed.");
    process.exit(0);
  });
});
