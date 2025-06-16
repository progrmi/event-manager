-- Enables foreign key constraints. This is important for data integrity.
PRAGMA foreign_keys = ON;

-- Users table to store registered user information.
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Events table to store details about each event.
CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    creator_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    location TEXT NOT NULL,
    cost REAL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'draft',
    max_attendees INTEGER NOT NULL,
    current_attendees INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Bookings table to link users to events.
-- Every booking must be associated with a registered user.
CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    booking_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    UNIQUE(event_id, user_id)
);

-- Site Settings table to store global configuration.
CREATE TABLE IF NOT EXISTS site_settings (
    setting_key TEXT PRIMARY KEY NOT NULL,
    setting_value TEXT NOT NULL
);

-- Insert default settings if they don't already exist.
INSERT OR IGNORE INTO site_settings (setting_key, setting_value) VALUES
('site_name', 'Event Manager'),
('welcome_title', 'Welcome Back!'),
('welcome_subtitle', 'Choose how you''d like to interact with our event management system. Whether you''re organizing events or looking to attend them, we''ve got you covered.');