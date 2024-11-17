const express = require("express");
const User = require("../models/user");
const { isAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/users", isAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

router.delete("/users/:id/role", isAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error updating user role" });
  }
});

module.exports = router;
