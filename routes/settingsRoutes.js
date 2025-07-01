const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');

router.get('/', settingsController.showSettingsForm);
router.post('/', settingsController.updateSettings);

module.exports = router;