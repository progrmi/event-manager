# Event Manager 🎉

A modern, web-based event management system built with Node.js and Express for organizing and booking events with ease.

![Event Manager](https://img.shields.io/badge/Node.js-Express-green)
![Database](https://img.shields.io/badge/Database-SQLite-blue)
![License](https://img.shields.io/badge/License-ISC-yellow)

## 📋 Overview

Event Manager is a full-featured event management application that allows organizers to create and manage events while providing a seamless booking experience for attendees. The application features separate interfaces for organizers and attendees, with real-time capacity tracking and comprehensive booking management.

## ✨ Features

### For Organizers
- **Event Creation**: Create events with detailed information (title, description, date, time, location, capacity)
- **Event Management**: View all created events in a clean dashboard
- **Booking Analytics**: Track attendance and view booking statistics
- **Attendee Management**: View detailed attendee lists for each event
- **Event Deletion**: Remove events and associated bookings

### For Attendees
- **Event Discovery**: Browse available upcoming events
- **Real-time Availability**: See current booking status and available spots
- **Easy Booking**: Simple form-based booking system
- **Duplicate Prevention**: Automatic prevention of double bookings

### Technical Features
- **Responsive Design**: Mobile-friendly interface with modern CSS
- **Database Integration**: SQLite database with proper schema and relationships
- **Data Validation**: Form validation and error handling
- **Real-time Updates**: Automatic capacity tracking and updates

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd event-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Initialize the database**
   ```bash
   # For Unix/Linux/macOS
   npm run build-db
   
   # For Windows
   npm run build-db-win
   ```

4. **Start the application**
   ```bash
   # Production mode
   npm start
   
   # Development mode (with auto-restart)
   npm run dev
   ```

5. **Access the application**
   - Open your browser and navigate to `http://localhost:3000`
   - You'll be redirected to the organizer dashboard

## 📁 Project Structure

```
event-manager/
├── app.js                 # Main application entry point
├── db.js                  # Database connection and initialization
├── db_schema.sql          # Database schema with tables and views
├── package.json           # Project dependencies and scripts
├── .gitignore            # Git ignore rules
├── routes/
│   └── index.js          # Application routes and controllers
├── views/
│   ├── organiser.ejs     # Organizer dashboard view
│   ├── attendee.ejs      # Attendee booking view
│   └── bookings.ejs      # Event bookings management view
└── public/
    └── css/
        └── main.css      # Main stylesheet
```

## 🛠️ Technology Stack

- **Backend**: Node.js with Express.js framework
- **Database**: SQLite3 with proper relational schema
- **Frontend**: EJS templating engine with vanilla JavaScript
- **Styling**: Custom CSS with responsive design
- **Dependencies**:
  - `express`: Web application framework
  - `sqlite3`: SQLite database driver
  - `ejs`: Embedded JavaScript templating
  - `body-parser`: HTTP request body parsing
  - `nodemon`: Development auto-restart (dev dependency)

## 📊 Database Schema

The application uses a SQLite database with the following main tables:

### Events Table
```sql
CREATE TABLE events (
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
```

### Bookings Table
```sql
CREATE TABLE bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER,
    attendee_name TEXT NOT NULL,
    attendee_email TEXT NOT NULL,
    booking_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events (id)
);
```

## 🎯 Usage Guide

### Creating an Event (Organizer)
1. Navigate to the organizer dashboard
2. Fill out the "Create New Event" form with:
   - Event title and description
   - Date and time
   - Location
   - Maximum number of attendees
3. Click "Create Event"

### Booking an Event (Attendee)
1. Navigate to the attendee page
2. Browse available events
3. Fill out the booking form with your name and email
4. Click "Book Now"

### Managing Bookings (Organizer)
1. From the organizer dashboard, click "View Bookings" on any event
2. See detailed attendee list and booking statistics
3. Monitor capacity and booking trends

## 🔧 Available Scripts

```bash
# Start the application
npm start

# Start in development mode with auto-restart
npm run dev

# Build/rebuild the database from schema
npm run build-db        # Unix/Linux/macOS
npm run build-db-win    # Windows

# Clean the database (removes events.db)
npm run clean-db        # Unix/Linux/macOS
npm run clean-db-win    # Windows
```

## 🎨 Customization

### Styling
The application uses a custom CSS framework located in `/public/css/main.css`. The design features:
- Modern gradient backgrounds
- Responsive grid layouts
- Interactive hover effects
- Color-coded sections for different user roles

### Database
You can modify the database schema by:
1. Editing `db_schema.sql`
2. Running the build script to recreate the database
3. The schema includes views and indexes for optimized queries

## 🔒 Security Features

- **Input Validation**: Server-side validation for all form inputs
- **SQL Injection Prevention**: Parameterized queries using prepared statements
- **Duplicate Booking Prevention**: Email-based duplicate checking
- **Foreign Key Constraints**: Proper referential integrity

## 🚀 Deployment

### Local Development
The application runs on port 3000 by default. You can change this by setting the `PORT` environment variable.

### Production Deployment
1. Set `NODE_ENV=production`
2. Configure the appropriate port via `PORT` environment variable
3. Ensure SQLite database file has proper permissions
4. Consider using a process manager like PM2 for production

## 🤝 Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**Simon Katan**

## 🐛 Known Issues & Limitations

- SQLite database is file-based (suitable for small to medium scale)
- No user authentication system (events are publicly accessible)
- No email notifications for bookings
- Time zone handling uses local browser time

## 🔮 Future Enhancements

- [ ] User authentication and authorization
- [ ] Email notifications for bookings and reminders
- [ ] Calendar integration
- [ ] Event categories and filtering
- [ ] Payment integration
- [ ] Recurring events support
- [ ] Admin panel for system management
- [ ] API endpoints for mobile app integration

---

*Built with ❤️ using Node.js and Express*