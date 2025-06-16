const settingsModel = require("../models/settingsModel");

// Show the site settings page
exports.getSettingsPage = (req, res) => {
  // Settings are already available in res.locals.siteSettings from middleware
  res.render("settings", {
    title: "Site Settings",
    message: null,
  });
};

// Handle updating site settings
exports.updateSettings = async (req, res) => {
  try {
    await settingsModel.update(req.body);

    // For immediate feedback on the page, we update res.locals.
    // The change will be globally available on the next request cycle.
    Object.assign(res.locals.siteSettings, req.body);

    res.render("settings", {
      title: "Site Settings",
      message: { type: "success", text: "Settings updated successfully!" },
    });
  } catch (error) {
    console.error("Settings update error:", error);
    res.status(500).render("settings", {
      title: "Site Settings",
      message: { type: "error", text: "An error occurred during update." },
    });
  }
};
