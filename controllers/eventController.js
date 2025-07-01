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
        host_name: req.body.host_name,
        host_description: req.body.host_description,
        max_attendees: req.body.max_attendees,
        // The 'status' is determined by which button the user clicked
        status: req.body.action === 'publish' ? 'published' : 'draft'
    };
    Event.create(newEvent, (err, result) => {
        if (err) {
            req.flash('error_msg', 'Could not save the event.');
            return res.redirect('/events/create');
        }
        if (newEvent.status === 'published') {
            req.flash('success_msg', 'Event published successfully!');
            res.redirect('/events');
        } else {
            req.flash('success_msg', 'Event saved as a draft.');
            res.redirect('/events/drafts');
        }
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
        host_name: req.body.host_name,
        host_description: req.body.host_description,
        max_attendees: req.body.max_attendees,
        status: req.body.action === 'publish' ? 'published' : 'draft'
    };
    Event.update(eventId, updatedEvent, (err) => {
        if (err) { /* ... */ }
        if (updatedEvent.status === 'published') {
            req.flash('success_msg', 'Event updated and published!');
            res.redirect(`/events/${eventId}`);
        } else {
            req.flash('success_msg', 'Draft updated successfully.');
            res.redirect('/events/drafts');
        }
    });
};
exports.listDrafts = (req, res) => {
    Event.findDrafts((err, events) => {
        if (err) {
            req.flash('error_msg', 'Could not retrieve drafts.');
            return res.redirect('/');
        }
        res.render('events/drafts', { events, title: 'Draft Events' });
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
