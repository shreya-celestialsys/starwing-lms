const express = require("express");
const { registerUser, authenticateUser, getSafeUser, findUserById } = require("../services/userService");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", async (req, res, next) => {
  try {
    const authResponse = await registerUser(req.body);
    res.status(201).json(authResponse);
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const authResponse = await authenticateUser(req.body);
    res.json(authResponse);
  } catch (error) {
    next(error);
  }
});

router.get("/me", requireAuth, (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(404).json({ error: "User not found" });
    }
    const user = findUserById(req.user.id);
    res.json({ user: getSafeUser(user) });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
