const { db } = require("../database");

class Event {
  static create(data, callback) {
    const sql =
      "INSERT INTO events (title, description, event_date, location, max_attendees) VALUES (?, ?, ?, ?, ?)";
    db.run(
      sql,
      [
        data.title,
        data.description,
        data.event_date,
        data.location,
        data.max_attendees,
      ],
      function (err) {
        callback(err, { id: this.lastID });
      }
    );
  }

  static findAll(callback) {
    const sql = "SELECT * FROM events ORDER BY event_date DESC";
    db.all(sql, [], callback);
  }

  static findById(id, callback) {
    const sql = "SELECT * FROM events WHERE id = ?";
    db.get(sql, [id], callback);
  }
  static update(id, data, callback) {
    const sql =
      "UPDATE events SET title = ?, description = ?, event_date = ?, location = ?, max_attendees = ? WHERE id = ?";
    db.run(
      sql,
      [
        data.title,
        data.description,
        data.event_date,
        data.location,
        data.max_attendees,
        id,
      ],
      function (err) {
        callback(err, { changes: this.changes });
      }
    );
  }

  static delete(id, callback) {
    // We should also delete associated attendees to keep the database clean
    const deleteAttendeesSql = "DELETE FROM attendees WHERE event_id = ?";
    db.run(deleteAttendeesSql, [id], (err) => {
      if (err) return callback(err);

      const deleteEventSql = "DELETE FROM events WHERE id = ?";
      db.run(deleteEventSql, [id], function (err) {
        callback(err, { changes: this.changes });
      });
    });
  }
}

module.exports = Event;
