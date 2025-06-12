const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const { authenticateToken } = require("../middleware/auth");

// All routes in this file are protected
router.use(authenticateToken);

router.get("/", profileController.getProfilePage);
router.post("/update", profileController.updateProfile);

module.exports = router;
