const db = require("../db");

// Find a single event by its ID
exports.findById = (id) => {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM events WHERE id = ?", [id], (err, event) => {
      if (err) reject(err);
      resolve(event);
    });
  });
};

// Find a single event by ID, ensuring it belongs to a specific creator
exports.findByIdAndCreator = (id, creatorId) => {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT * FROM events WHERE id = ? AND creator_id = ?",
      [id, creatorId],
      (err, event) => {
        if (err) reject(err);
        resolve(event);
      }
    );
  });
};

// Find all events created by a specific user
exports.findAllByCreator = (creatorId) => {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT * FROM events WHERE creator_id = ? ORDER BY date ASC",
      [creatorId],
      (err, events) => {
        if (err) reject(err);
        resolve(events);
      }
    );
  });
};

// Find all available events for attendees
exports.findAllAvailable = () => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM events 
       WHERE date >= date('now') 
       AND current_attendees < max_attendees 
       ORDER BY date ASC`,
      (err, events) => {
        if (err) reject(err);
        resolve(events);
      }
    );
  });
};

// Create a new event
exports.create = (eventData) => {
  const {
    creator_id,
    title,
    description,
    date,
    time,
    location,
    max_attendees,
  } = eventData;
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO events (creator_id, title, description, date, time, location, max_attendees) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.run(
      sql,
      [creator_id, title, description, date, time, location, max_attendees],
      function (err) {
        if (err) reject(err);
        resolve({ id: this.lastID });
      }
    );
  });
};

// Update an existing event
exports.update = (id, eventData) => {
  const { title, description, date, time, location, max_attendees } = eventData;
  return new Promise((resolve, reject) => {
    const sql = `UPDATE events SET title = ?, description = ?, date = ?, time = ?, location = ?, max_attendees = ?
                     WHERE id = ?`;
    db.run(
      sql,
      [title, description, date, time, location, max_attendees, id],
      (err) => {
        if (err) reject(err);
        resolve();
      }
    );
  });
};

// Delete an event by ID
exports.deleteById = (id) => {
  return new Promise((resolve, reject) => {
    // ON DELETE CASCADE in the schema handles associated bookings
    db.run("DELETE FROM events WHERE id = ?", [id], (err) => {
      if (err) reject(err);
      resolve();
    });
  });
};

// Increment the current number of attendees for an event
exports.incrementAttendees = (id) => {
  return new Promise((resolve, reject) => {
    const sql =
      "UPDATE events SET current_attendees = current_attendees + 1 WHERE id = ?";
    db.run(sql, [id], (err) => {
      if (err) reject(err);
      resolve();
    });
  });
};
