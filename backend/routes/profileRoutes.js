// backend/routes/profile.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");
const Donor = require("../models/Donor");
const Recipient = require("../models/Recipient");

/**
 * Helper: normalize user id (works whether req.user._id or req.user.id)
 */
function getUserId(req) {
  return req.user && (req.user._id || req.user.id || req.user);
}

/**
 * GET /api/profile/me
 * Returns user (without password) and any role-specific profile data (donor or recipient)
 */
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const userId = getUserId(req);
    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Search donor/recipient using either userId or user field so it's robust
    const donor = await Donor.findOne({ $or: [{ userId }, { user: userId }] });
    const recipient = await Recipient.findOne({ $or: [{ userId }, { user: userId }] });

    const profileData = donor || recipient || null;

    return res.json({ user, profileData });
  } catch (err) {
    console.error("Profile /me error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * PUT /api/profile/update
 * Update name/email and optionally password
 */



router.put("/update", authMiddleware, async (req, res) => {
  try {
    const userId = getUserId(req);
    const { name, email, password, ...roleData } = req.body;

    const updateUser = {};
    if (name) updateUser.name = name;
    if (email) updateUser.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateUser.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateUser, { new: true }).select("-password");

    // Role-specific update
    const user = await User.findById(userId);
    if (user.role === "donor") {
      await Donor.findOneAndUpdate({ userId }, {
        bloodGroup: roleData.bloodGroup,
        city: roleData.city,
        contactNumber: roleData.contactNumber,
      });
    } else if (user.role === "recipient") {
      await Recipient.findOneAndUpdate({ userId }, {
        patientName: roleData.patientName,
        hospitalName: roleData.hospitalName,
        unitsRequired: roleData.unitsRequired,
        urgency: roleData.urgency,
        city: roleData.city,
        contactNumber: roleData.contactNumber,
      });
    }

    return res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (err) {
    console.error("Profile update error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * DELETE /api/profile/delete
 * Deletes user and any linked Donor/Recipient profile
 */
router.delete("/delete", authMiddleware, async (req, res) => {
  try {
    const userId = getUserId(req);

    // delete role-specific documents (if any)
    await Donor.findOneAndDelete({ $or: [{ userId }, { user: userId }] });
    await Recipient.findOneAndDelete({ $or: [{ userId }, { user: userId }] });

    // delete user
    await User.findByIdAndDelete(userId);

    return res.json({ message: "Account and related profile deleted successfully" });
  } catch (err) {
    console.error("Profile delete error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /api/profile/check
 * Returns { exists: true, role: "donor" | "recipient" } or { exists: false }
 * Used after login to determine whether to redirect to /dashboard or the form.
 */
router.get("/check", authMiddleware, async (req, res) => {
  try {
    const userId = getUserId(req);

    // Check donor collection first
    const donor = await Donor.findOne({ $or: [{ userId }, { user: userId }] });
    if (donor) return res.json({ exists: true, role: "donor" });

    // Check recipient collection
    const recipient = await Recipient.findOne({ $or: [{ userId }, { user: userId }] });
    if (recipient) return res.json({ exists: true, role: "recipient" });

    // Not found
    return res.json({ exists: false });
  } catch (err) {
    console.error("Profile check error:", err);
    return res.status(500).json({ message: "Server error checking profile" });
  }
});

module.exports = router;