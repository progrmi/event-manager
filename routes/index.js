const express = require("express");
const router = express.Router();
const db = require("../db");
const {
  authenticateToken,
  requireOrganiser,
  addUserToLocals,
} = require("../middleware/auth");

// Apply user info to all routes
router.use(addUserToLocals);

// Home page - redirect based on authentication status
router.get("/", (req, res) => {
  if (req.user) {
    // Redirect based on user role
    if (req.user.role === "organiser") {
      res.redirect("/organiser");
    } else {
      res.redirect("/attendee");
    }
  } else {
    // Not authenticated, redirect to login
    res.redirect("/auth/login");
  }
});

// Organiser page - for creating and managing events (requires authentication + organiser role)
router.get("/organiser", authenticateToken, requireOrganiser, (req, res) => {
  db.all("SELECT * FROM events ORDER BY date ASC", (err, events) => {
    if (err) {
      console.error(err);
      events = [];
    }
    res.render("organiser", { events: events });
  });
});

// Create new event (requires authentication + organiser role)
router.post(
  "/organiser/create",
  authenticateToken,
  requireOrganiser,
  (req, res) => {
    const { title, description, date, time, location, max_attendees } =
      req.body;
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
  }
);

// Delete event (requires authentication + organiser role)
router.post(
  "/organiser/delete/:id",
  authenticateToken,
  requireOrganiser,
  (req, res) => {
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
  }
);

// View event bookings (requires authentication + organiser role)
router.get(
  "/organiser/bookings/:id",
  authenticateToken,
  requireOrganiser,
  (req, res) => {
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
  }
);

// Attendee page - for viewing and booking events (open to all, but enhanced for authenticated users)
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

// Book event (requires authentication for booking)
router.post("/attendee/book/:id", authenticateToken, (req, res) => {
  const eventId = req.params.id;
  const userId = req.user.id;

  // Check if user already booked this event
  db.get(
    "SELECT * FROM bookings WHERE event_id = ? AND user_id = ?",
    [eventId, userId],
    (err, booking) => {
      if (booking) {
        return res.redirect("/attendee?error=already_booked");
      }

      // Check event capacity
      db.get("SELECT * FROM events WHERE id = ?", [eventId], (err, event) => {
        if (err || !event) {
          return res.redirect("/attendee?error=event_not_found");
        }

        if (event.current_attendees >= event.max_attendees) {
          return res.redirect("/attendee?error=event_full");
        }

        // Create booking and update attendee count
        db.serialize(() => {
          db.run("BEGIN TRANSACTION");

          db.run(
            "INSERT INTO bookings (event_id, user_id, booking_date) VALUES (?, ?, datetime('now'))",
            [eventId, userId],
            (err) => {
              if (err) {
                db.run("ROLLBACK");
                return res.redirect("/attendee?error=booking_failed");
              }

              db.run(
                "UPDATE events SET current_attendees = current_attendees + 1 WHERE id = ?",
                [eventId],
                (err) => {
                  if (err) {
                    db.run("ROLLBACK");
                    return res.redirect("/attendee?error=booking_failed");
                  }

                  db.run("COMMIT");
                  res.redirect("/attendee?success=booked");
                }
              );
            }
          );
        });
      });
    }
  );
});

module.exports = router;
