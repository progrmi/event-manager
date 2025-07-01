const { db } = require("../database");

class Attendee {
  static create(data, callback) {
    const sql =
      "INSERT INTO attendees (name, email, event_id) VALUES (?, ?, ?)";
    db.run(sql, [data.name, data.email, data.event_id], function (err) {
      callback(err, { id: this.lastID });
    });
  }

  static findByEventId(eventId, callback) {
    const sql = `
            SELECT a.*, e.title as event_title
            FROM attendees a
            JOIN events e ON a.event_id = e.id
            WHERE a.event_id = ?
            ORDER BY a.name`;
    db.all(sql, [eventId], callback);
  }

  static countByEventId(eventId, callback) {
    const sql = "SELECT COUNT(*) AS count FROM attendees WHERE event_id = ?";
    db.get(sql, [eventId], callback);
  }

  static checkIn(attendeeId, callback) {
    const sql = "UPDATE attendees SET checked_in = 1 WHERE id = ?";
    db.run(sql, [attendeeId], callback);
  }
}

module.exports = Attendee;
