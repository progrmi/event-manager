const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  if (req.user) {
    res.render("home", { title: "Welcome" });
  } else {
    res.redirect("/auth/login");
  }
});

module.exports = router;
