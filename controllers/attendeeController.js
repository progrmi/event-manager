const eventModel = require("../models/eventModel");
const bookingModel = require("../models/bookingModel");
const db = require("../db"); // Required for transaction

// Show the attendee page with all available events
exports.getAvailableEvents = async (req, res) => {
  try {
    const events = await eventModel.findAllAvailable();
    res.render("attendee", {
      title: "Available Events",
      events,
      message: null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching available events.");
  }
};

// Show events booked by the current user
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await bookingModel.findAllByUserId(req.user.userId);
    res.render("my-bookings", {
      title: "My Booked Events",
      bookings,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching your bookings.");
  }
};

// Handle booking an event
exports.bookEvent = async (req, res) => {
  const eventId = req.params.id;
  const { userId, name, email } = req.user;

  try {
    // Check if already booked
    const existingBooking = await bookingModel.findByEventAndUser(
      eventId,
      userId
    );
    if (existingBooking) {
      return res.redirect("/attendee?error=already_booked");
    }

    // Check event capacity and status
    const event = await eventModel.findById(eventId);
    if (!event || event.status !== "published") {
      return res.redirect("/attendee?error=event_not_found");
    }
    if (event.current_attendees >= event.max_attendees) {
      return res.redirect("/attendee?error=event_full");
    }

    // Use a transaction to ensure atomicity
    db.serialize(async () => {
      db.run("BEGIN TRANSACTION");
      try {
        await bookingModel.create({ eventId, userId, name, email });
        await eventModel.incrementAttendees(eventId);
        db.run("COMMIT");
        res.redirect("/attendee/my-bookings?success=booked");
      } catch (err) {
        db.run("ROLLBACK");
        console.error("Booking transaction failed:", err);
        res.redirect("/attendee?error=booking_failed");
      }
    });
  } catch (error) {
    console.error("Booking error:", error);
    res.redirect("/attendee?error=booking_failed");
  }
};
