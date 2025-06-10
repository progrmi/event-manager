-- Event Manager Database Schema
-- SQLite Database Schema for Event Management System

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- Users table
-- Stores user credentials and role information
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('organiser', 'attendee')) DEFAULT 'attendee',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

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
-- Stores individual booking records linking users to events
CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER,
    user_id INTEGER,
    booking_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    UNIQUE(event_id, user_id) -- Ensures a user can only book an event once
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_attendance ON events(current_attendees, max_attendees);
CREATE INDEX IF NOT EXISTS idx_bookings_event_id ON bookings(event_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);


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
-- Passwords are 'admin123' and 'user123' hashed with bcrypt
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@eventmanager.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'organiser'),
('Regular User', 'user@eventmanager.com', '$2a$10$y.imL5/gw24s9f9gT1.gReMvW24Uzu8nS5cEw0GWcE8UaZzL.Hhfu', 'attendee');

INSERT INTO events (title, description, date, time, location, max_attendees) VALUES
('Tech Conference 2025', 'Annual technology conference featuring latest innovations', '2025-07-15', '09:00', 'Convention Center Hall A', 200),
('Workshop: Web Development', 'Hands-on workshop covering modern web development practices', '2025-08-20', '14:00', 'Training Room B', 30),
('Networking Dinner', 'Professional networking event with dinner', '2025-08-25', '18:30', 'Grand Hotel Ballroom', 100);

INSERT INTO bookings (event_id, user_id) VALUES
(1, 1),
(1, 2),
(2, 2);
*/
