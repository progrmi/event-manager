const db = require("../db");

// Find a booking by event ID and user ID
exports.findByEventAndUser = (eventId, userId) => {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT * FROM bookings WHERE event_id = ? AND user_id = ?",
      [eventId, userId],
      (err, booking) => {
        if (err) reject(err);
        resolve(booking);
      }
    );
  });
};

// Find all bookings for a specific event
exports.findAllByEventId = (eventId) => {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT * FROM bookings WHERE event_id = ? ORDER BY booking_date DESC",
      [eventId],
      (err, bookings) => {
        if (err) reject(err);
        resolve(bookings);
      }
    );
  });
};

// Create a new booking
exports.create = ({ eventId, userId, name, email }) => {
  return new Promise((resolve, reject) => {
    const sql =
      "INSERT INTO bookings (event_id, user_id, user_name, user_email) VALUES (?, ?, ?, ?)";
    db.run(sql, [eventId, userId, name, email], function (err) {
      if (err) reject(err);
      resolve({ id: this.lastID });
    });
  });
};
