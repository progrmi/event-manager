const Attendee = require("../models/attendee");
const Event = require("../models/event");
const { Parser } = require("json2csv");

// Handle registration for an event
exports.registerAttendee = (req, res) => {
  const eventId = req.params.eventId;
  const newAttendee = {
    name: req.body.name,
    email: req.body.email,
    event_id: eventId,
  };

  Attendee.countByEventId(eventId, (err, result) => {
    if (err) return res.status(500).send("Error checking capacity.");
    Event.findById(eventId, (err, event) => {
      if (err || !event) return res.status(404).send("Event not found.");
      if (result.count >= event.max_attendees) {
        req.flash('error_msg', 'Sorry, this event is full.'); // <-- Add this
        return res.status(400).send("Sorry, this event is full.");
      }
      Attendee.create(newAttendee, (err) => {
          if (err) {
                if (err.code === 'SQLITE_CONSTRAINT') {
                    req.flash('error_msg', 'This email is already registered for the event.'); // <-- Add this
                } else {
                    req.flash('error_msg', 'Something went wrong. Please try again.'); // <-- Add this
                }
                return res.redirect(`/events/${eventId}`);
            }
            req.flash('success_msg', 'You have successfully registered for the event!'); // <-- Add this
            
        res.redirect(`/events/${eventId}?registered=true`);
      });
    });
  });
};

// List all attendees for a specific event
exports.listAttendees = (req, res) => {
  const eventId = req.params.eventId;
  Attendee.findByEventId(eventId, (err, attendees) => {
    if (err) return res.status(500).send("Error retrieving attendees");
    const eventTitle =
      attendees.length > 0 ? attendees[0].event_title : "Attendee List";
    res.render("attendees/list", {
      attendees,
      eventId,
      title: `Attendees for ${eventTitle}`,
    });
  });
};

// Handle attendee check-in
exports.checkInAttendee = (req, res) => {
  const { eventId, attendeeId } = req.params;
  Attendee.checkIn(attendeeId, (err) => {
    if (err) return res.status(500).send("Error checking in attendee");
    res.redirect(`/attendees/list/${eventId}`);
  });
};
exports.exportAttendees = (req, res) => {
  const eventId = req.params.eventId;

  Attendee.findByEventId(eventId, (err, attendees) => {
    if (err) {
      return res.status(500).send("Error retrieving attendees for export.");
    }

    // Define the columns for the CSV file
    const fields = [
      { label: "Name", value: "name" },
      { label: "Email", value: "email" },
      { label: "Status", value: "status" },
    ];

    // Format the data to be more user-friendly (e.g., 'Yes'/'No' for checked in)
    const processedAttendees = attendees.map((att) => ({
      name: att.name,
      email: att.email,
      status: att.checked_in ? "Checked In" : "Registered",
    }));

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(processedAttendees);

    // Set the HTTP headers to trigger a file download
    res.header("Content-Type", "text/csv");
    res.attachment(`event-${eventId}-attendees.csv`);
    res.send(csv);
  });
};
