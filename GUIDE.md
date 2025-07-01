
---

### `README.md` (Setup and Run Guide)

This is a detailed guide for anyone (including your future self!) who wants to clone the project and get it running locally. Create a file named `README.md` in the root of your project and add this content.

```markdown
# GatherUp: The Simple Event Planner

GatherUp is a lightweight, easy-to-use web application for creating and managing small community events, workshops, and meetups. It's built with Node.js, Express, and EJS, using SQLite for simple, file-based data persistence.

 <!-- Optional: Add a screenshot of your app -->

## Core Features

-   **Simple Event Creation**: Create and publish an event page in minutes.
-   **Edit & Delete Events**: Easily manage event details or remove events.
-   **One-Click RSVP**: Guests can register with just their name and email.
-   **Attendee Management**: View a list of registered attendees and perform check-ins.
-   **Export to CSV**: Download the attendee list for offline use or record-keeping.
-   **Flash Messages**: Clear, user-friendly feedback for all actions.
-   **Capacity Limits**: Automatically close registrations when an event is full.

## Technology Stack

-   **Backend**: Node.js, Express.js
-   **Frontend**: EJS (Embedded JavaScript) for server-side rendering, basic HTML & CSS
-   **Database**: SQLite3
-   **Session Management**: `express-session` with `connect-sqlite3` for persistent sessions.

---

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You need to have [Node.js](https://nodejs.org/) installed on your system (version 14.x or higher is recommended). You can check your version with:

```bash
node -v
```

### Installation and Setup

1.  **unzip folder**


2.  **Install Dependencies**

    Install all the required npm packages as defined in `package.json`.

    ```bash
    npm install
    ```

3.  **Run the Application**

    Start the development server using `nodemon`, which will automatically restart the server when you make file changes.

    ```bash
    npm start
    ```

    The application will now be running. You should see the following output in your terminal:

    ```
    Server is running at http://localhost:3000
    Connected to the SQLite database.
    ```

4.  **Access the Application**

    Open your web browser and navigate to **[http://localhost:3000](http://localhost:3000)**.

    That's it! The application is running. The first time you run it, a database file named `gatherup.db` will be automatically created in the project's root directory.

---

## Project Structure

The project follows the Model-View-Controller (MVC) architectural pattern.

```
gatherup/
├── controllers/      # Handles business logic and requests
├── models/           # Manages data and database interactions
├── public/           # Static assets (CSS, images)
├── routes/           # Defines application URLs and maps them to controllers
├── views/            # EJS templates for the user interface
├── database.js       # Database connection and initialization
├── db_schema.sql     # SQL schema for documentation
├── app.js            # Main application entry point
├── package.json      # Project metadata and dependencies
└── README.md         # This file
```

## Deployment

This application is configured for easy deployment to platforms like Railway, Heroku, or Render.

The key configuration points for deployment are:

-   **Port Binding**: The `app.js` file is configured to use the `process.env.PORT` environment variable, which is required by hosting platforms.
-   **Persistent Sessions**: It uses `connect-sqlite3` to store session data in the SQLite database file, preventing memory leaks and ensuring users stay logged in across server restarts.
-   **Start Script**: The `package.json` file has a `start` script (`"start": "node app.js"` or similar for production) that the hosting platform will use to run the application. For Railway, `nodemon app.js` is fine, but for production, `node app.js` is often preferred.

To deploy, simply connect your Git repository to the hosting service of your choice and follow their instructions.
```