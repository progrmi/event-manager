const { db } = require("../database");

class Event {
  static create(data, callback) {
    const sql =
      "INSERT INTO events (title, description, event_date, location, host_name, host_description, max_attendees, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    db.run(
      sql,
      [
        data.title,
        data.description,
        data.event_date,
        data.location,
        data.host_name,
        data.host_description,
        data.max_attendees,
        data.status,
      ],
      function (err) {
        callback(err, { id: this.lastID });
      }
    );
  }

  static findAll(callback) {
    const sql = "SELECT * FROM events WHERE status = 'published' ORDER BY event_date DESC";
    db.all(sql, [], callback);
}

  static findById(id, callback) {
    const sql = "SELECT * FROM events WHERE id = ?";
    db.get(sql, [id], callback);
  }
  static update(id, data, callback) {
    const sql = 'UPDATE events SET title = ?, description = ?, event_date = ?, location = ?, host_name = ?, host_description = ?, max_attendees = ?, status = ? WHERE id = ?';
    db.run(sql, [data.title, data.description, data.event_date, data.location, data.host_name, data.host_description, data.max_attendees, data.status, id], function(err) {
        callback(err, { changes: this.changes });
    });
}
static findDrafts(callback) {
    const sql = "SELECT * FROM events WHERE status = 'draft' ORDER BY created_at DESC";
    db.all(sql, [], callback);
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