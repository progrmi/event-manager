const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");

router.get("/", eventController.listEvents);
router.get("/create", eventController.createEventForm);
router.post("/create", eventController.createEvent);

// Route to show the edit form
router.get("/:id/edit", eventController.editEventForm);

// Route to handle the update
router.post("/:id/update", eventController.updateEvent);

// Route to handle the deletion
router.post("/:id/delete", eventController.deleteEvent);

// This must be the LAST "get" route to avoid conflicts
router.get("/:id", eventController.showEvent);

module.exports = router;
