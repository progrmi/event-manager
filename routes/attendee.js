const express = require("express");
const router = express.Router();
const attendeeController = require("../controllers/attendeeController");
const { authenticateToken } = require("../middleware/auth");

// All routes in this file are protected
router.use(authenticateToken);

router.get("/", attendeeController.getAvailableEvents);
router.get("/my-bookings", attendeeController.getMyBookings);
router.post("/book/:id", attendeeController.bookEvent);

module.exports = router;
