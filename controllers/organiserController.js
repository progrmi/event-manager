const eventModel = require("../models/eventModel");
const bookingModel = require("../models/bookingModel");

// Show the main organiser dashboard with their events
exports.getOrganiserDashboard = async (req, res) => {
  try {
    const events = await eventModel.findAllByCreator(req.user.userId);
    res.render("organiser", {
      title: "My Events",
      events,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching organiser dashboard.");
  }
};

// Handle the creation of a new event
exports.createEvent = async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      creator_id: req.user.userId,
      status: req.body.publish ? "published" : "draft", // Handle publish checkbox
    };
    delete eventData.publish; // Clean up the object
    await eventModel.create(eventData);
    res.redirect("/organiser?success=created");
  } catch (error) {
    console.error("Error creating event:", error);
    res.redirect("/organiser?error=creation_failed");
  }
};

// Toggle an event's status between 'draft' and 'published'
exports.toggleEventStatus = async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await eventModel.findByIdAndCreator(eventId, req.user.userId);
    if (!event) {
      return res.redirect("/organiser?error=unauthorized_toggle");
    }
    const newStatus = event.status === "draft" ? "published" : "draft";
    await eventModel.updateStatus(eventId, newStatus);
    res.redirect("/organiser?success=status_updated");
  } catch (error) {
    console.error("Error toggling event status:", error);
    res.redirect("/organiser?error=toggle_failed");
  }
};

// Show the form to edit an existing event
exports.getEditEventForm = async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await eventModel.findByIdAndCreator(eventId, req.user.userId);
    if (!event) {
      return res.redirect("/organiser?error=unauthorized_edit");
    }
    // Format date for <input type="date">
    event.date = new Date(event.date).toISOString().split("T")[0];
    res.render("edit-event", {
      title: `Edit ${event.title}`,
      event,
    });
  } catch (error) {
    console.error(error);
    res.redirect("/organiser?error=not_found");
  }
};

// Handle the update of an event
exports.updateEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await eventModel.findByIdAndCreator(eventId, req.user.userId);
    if (!event) {
      return res.redirect("/organiser?error=unauthorized_update");
    }
    await eventModel.update(eventId, req.body);
    res.redirect("/organiser?success=updated");
  } catch (error) {
    console.error("Error updating event:", error);
    res.redirect(`/organiser/edit/${req.params.id}?error=update_failed`);
  }
};

// Handle the deletion of an event
exports.deleteEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await eventModel.findByIdAndCreator(eventId, req.user.userId);
    if (!event) {
      return res.redirect("/organiser?error=unauthorized_delete");
    }
    await eventModel.deleteById(eventId);
    res.redirect("/organiser?success=event_deleted");
  } catch (error) {
    console.error("Error deleting event:", error);
    res.redirect("/organiser?error=delete_failed");
  }
};

// Show all bookings for a specific event
exports.getEventBookings = async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await eventModel.findByIdAndCreator(eventId, req.user.userId);
    if (!event) {
      return res.redirect("/organiser?error=not_found");
    }
    const bookings = await bookingModel.findAllByEventId(eventId);
    res.render("bookings", {
      title: `Bookings for ${event.title}`,
      event,
      bookings,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching event bookings.");
  }
};
