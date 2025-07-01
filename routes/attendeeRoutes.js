const express = require("express");
const router = express.Router();
const attendeeController = require("../controllers/attendeeController");

router.get("/export/:eventId", attendeeController.exportAttendees);
router.post("/register/:eventId", attendeeController.registerAttendee);
router.get("/list/:eventId", attendeeController.listAttendees);
router.post(
  "/checkin/:eventId/:attendeeId",
  attendeeController.checkInAttendee
);

module.exports = router;
