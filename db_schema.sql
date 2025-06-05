-- Event Manager Database Schema
-- SQLite Database Schema for Event Management System

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- Events table
-- Stores all event information including capacity and current attendance
CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    location TEXT NOT NULL,
    max_attendees INTEGER NOT NULL,
    current_attendees INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Bookings table
-- Stores individual booking records linking attendees to events
CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER,
    attendee_name TEXT NOT NULL,
    attendee_email TEXT NOT NULL,
    booking_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_attendance ON events(current_attendees, max_attendees);
CREATE INDEX IF NOT EXISTS idx_bookings_event_id ON bookings(event_id);
CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(attendee_email);
CREATE INDEX IF NOT EXISTS idx_bookings_event_email ON bookings(event_id, attendee_email);

-- Views for common queries
-- View for available events (future events with available spots)
CREATE VIEW IF NOT EXISTS available_events AS
SELECT *
FROM events
WHERE date >= date('now')
  AND current_attendees < max_attendees
ORDER BY date ASC;

-- View for event booking summary
CREATE VIEW IF NOT EXISTS event_booking_summary AS
SELECT 
    e.id,
    e.title,
    e.date,
    e.time,
    e.location,
    e.max_attendees,
    e.current_attendees,
    (e.max_attendees - e.current_attendees) AS available_spots,
    ROUND((CAST(e.current_attendees AS REAL) / e.max_attendees) * 100, 2) AS occupancy_percentage
FROM events e
ORDER BY e.date ASC;

-- Sample data (optional - uncomment to insert test data)
/*
INSERT INTO events (title, description, date, time, location, max_attendees) VALUES
('Tech Conference 2025', 'Annual technology conference featuring latest innovations', '2025-07-15', '09:00', 'Convention Center Hall A', 200),
('Workshop: Web Development', 'Hands-on workshop covering modern web development practices', '2025-06-20', '14:00', 'Training Room B', 30),
('Networking Dinner', 'Professional networking event with dinner', '2025-06-25', '18:30', 'Grand Hotel Ballroom', 100);

INSERT INTO bookings (event_id, attendee_name, attendee_email) VALUES
(1, 'John Doe', 'john.doe@email.com'),
(1, 'Jane Smith', 'jane.smith@email.com'),
(2, 'Bob Johnson', 'bob.johnson@email.com');
*/