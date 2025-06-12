const express = require("express");
const router = express.Router();
const organiserController = require("../controllers/organiserController");
const { authenticateToken } = require("../middleware/auth");

// All routes in this file are protected
router.use(authenticateToken);

router.get("/", organiserController.getOrganiserDashboard);
router.post("/create", organiserController.createEvent);
router.get("/edit/:id", organiserController.getEditEventForm);
router.post("/update/:id", organiserController.updateEvent);
router.post("/delete/:id", organiserController.deleteEvent);
router.get("/bookings/:id", organiserController.getEventBookings);

module.exports = router;
