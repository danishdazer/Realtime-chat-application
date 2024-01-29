const express = require("express");

const authController = require("../controllers/authController");
const userModel = require("../models/userModel");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/logout/", authController.logout);
router.get("/user/:name", async (req, res) => {
  try {
    const query = req.params.name;
    const searchResults = await userModel.getUserByName(query);

    res.json(searchResults);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.get("/status/", authController.status);

module.exports = router;
