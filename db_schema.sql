-- GatherUp Database Schema
-- This script defines the structure for the events, attendees, and sessions tables.

-- Drop tables if they exist to start from a clean state.
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS attendees;
DROP TABLE IF EXISTS events;

-- Table for storing event information
CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    event_date TEXT NOT NULL,
    location TEXT NOT NULL,
      host_name TEXT,         
    host_description TEXT,
    max_attendees INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for storing attendee registrations
-- The email is marked as UNIQUE for a given event_id to prevent duplicate registrations.
CREATE TABLE IF NOT EXISTS attendees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    event_id INTEGER NOT NULL,
    checked_in INTEGER DEFAULT 0,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE,
    UNIQUE(email, event_id)
);

-- Table for storing user sessions, managed by connect-sqlite3
-- This table is automatically created and managed by the application's session store,
-- but it is included here for completeness.
CREATE TABLE IF NOT EXISTS sessions (
    sid TEXT PRIMARY KEY,
    sess TEXT NOT NULL,
    expire INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
);
-- user table for storing user accounts
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT OR IGNORE INTO settings (key, value) VALUES ('site_name', 'GatherUp');

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_attendees_event_id ON attendees(event_id);