const express = require("express");
const router = express.Router();
const settingsController = require("../controllers/settingsController");
const { authenticateToken } = require("../middleware/auth");

// All routes in this file are protected
router.use(authenticateToken);

router.get("/", settingsController.getSettingsPage);
router.post("/update", settingsController.updateSettings);

module.exports = router;
