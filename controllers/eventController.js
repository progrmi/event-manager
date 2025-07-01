const Event = require("../models/event");
const Attendee = require("../models/attendee");

// Show all events
exports.listEvents = (req, res) => {
  Event.findAll((err, events) => {
    if (err) return res.status(500).send("Error retrieving events");
    res.render("events/index", { events, title: "Upcoming Events" });
  });
};

// Show form to create a new event
exports.createEventForm = (req, res) => {
  res.render("events/create", { title: "Create a New Event" });
};

// Handle creation of a new event
exports.createEvent = (req, res) => {
  const newEvent = {
    title: req.body.title,
    description: req.body.description,
    event_date: req.body.event_date,
    location: req.body.location,
    max_attendees: req.body.max_attendees,
  };
  Event.create(newEvent, (err) => {
    if (err) {
            req.flash('error_msg', 'Could not create the event. Please try again.');
            return res.redirect('/events/create');
        }
    req.flash('success_msg', 'Event created successfully!');
    res.redirect("/events");
  });
};

// Show details for a specific event
exports.showEvent = (req, res) => {
  const eventId = req.params.id;
  Event.findById(eventId, (err, event) => {
    if (err || !event) return res.status(404).send("Event not found");
    Attendee.countByEventId(eventId, (err, result) => {
      const currentAttendees = err ? 0 : result.count;
      const spotsLeft = event.max_attendees - currentAttendees;
      res.render("events/detail", {
        event,
        spotsLeft,
        currentAttendees,
        title: event.title,
      });
    });
  });
};
exports.editEventForm = (req, res) => {
  const eventId = req.params.id;
  Event.findById(eventId, (err, event) => {
    if (err || !event) return res.status(404).send("Event not found");
    res.render("events/edit", { event, title: `Edit ${event.title}` });
  });
};

// Handle update of an existing event
exports.updateEvent = (req, res) => {
  const eventId = req.params.id;
  const updatedEvent = {
    title: req.body.title,
    description: req.body.description,
    event_date: req.body.event_date,
    location: req.body.location,
    max_attendees: req.body.max_attendees,
  };
  Event.update(eventId, updatedEvent, (err) => {
       if (err) {
            req.flash('error_msg', 'Could not update the event.');
            return res.redirect(`/events/${eventId}/edit`);
        }
        req.flash('success_msg', 'Event updated successfully!'); // <-- Add this
        res.redirect(`/events/${eventId}`);
  });
};

// Handle deletion of an event
exports.deleteEvent = (req, res) => {
  const eventId = req.params.id;
  Event.delete(eventId, (err) => {
    if (err) {
            req.flash('error_msg', 'Could not delete the event.');
            return res.redirect('/events');
        }
        req.flash('success_msg', 'Event has been deleted.'); // <-- Add this
        res.redirect('/events');
  });
};
