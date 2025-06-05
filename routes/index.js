const express = require("express");
const router = express.Router();
const db = require("../db");

// Home page - redirect to organiser page
router.get("/", (req, res) => {
  res.redirect("/organiser");
});

// Organiser page - for creating and managing events
router.get("/organiser", (req, res) => {
  db.all("SELECT * FROM events ORDER BY date ASC", (err, events) => {
    if (err) {
      console.error(err);
      events = [];
    }
    res.render("organiser", { events: events });
  });
});

// Create new event
router.post("/organiser/create", (req, res) => {
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
router.post("/organiser/delete/:id", (req, res) => {
  const eventId = req.params.id;

  db.run("DELETE FROM bookings WHERE event_id = ?", [eventId], (err) => {
    if (err) {
      console.error("Error deleting bookings:", err);
    }
    db.run("DELETE FROM events WHERE id = ?", [eventId], (err) => {
      if (err) {
        console.error("Error deleting event:", err);
      }
      res.redirect("/organiser");
    });
  });
});

// View event bookings (for organiser)
router.get("/organiser/bookings/:id", (req, res) => {
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

// Attendee page - for viewing and booking events
router.get("/attendee", (req, res) => {
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
router.post("/attendee/book/:id", (req, res) => {
  const eventId = req.params.id;
  const { attendee_name, attendee_email } = req.body;

  db.get(
    "SELECT * FROM events WHERE id = ? AND current_attendees < max_attendees",
    [eventId],
    (err, event) => {
      if (err || !event) {
        return res.redirect("/attendee?error=Event not available");
      }

      db.get(
        "SELECT * FROM bookings WHERE event_id = ? AND attendee_email = ?",
        [eventId, attendee_email],
        (err, existingBooking) => {
          if (existingBooking) {
            return res.redirect(
              "/attendee?error=You have already booked this event"
            );
          }

          const stmt = db.prepare(
            "INSERT INTO bookings (event_id, attendee_name, attendee_email) VALUES (?, ?, ?)"
          );
          stmt.run([eventId, attendee_name, attendee_email], function (err) {
            if (err) {
              console.error("Error creating booking:", err);
              return res.redirect("/attendee?error=Booking failed");
            }

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

module.exports = router;
