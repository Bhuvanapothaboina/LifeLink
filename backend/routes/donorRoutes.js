// const express = require("express");
// const router = express.Router();
// const Donor = require("../models/Donor");
// const Recipient = require("../models/Recipient");
// const protect = require("../middleware/authMiddleware");

// // Add or update donor profile
// router.post("/add", protect, async (req, res) => {
//   try {
//     const existing = await Donor.findOne({ userId: req.user._id });
//     if (existing)
//       return res.status(400).json({ message: "Profile already exists" });

//     const donor = new Donor({
//       userId: req.user._id,
//       ...req.body,
//     });

//     await donor.save();
//     res.status(201).json({ message: "Donor profile created", donor });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// });

// // Get donor profile
// router.get("/me", protect, async (req, res) => {
//   try {
//     const donor = await Donor.findOne({ userId: req.user._id });
//     if (!donor) return res.status(404).json({ message: "No profile found" });
//     res.json(donor);
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// });

// // Update availability
// router.put("/availability", protect, async (req, res) => {
//   try {
//     const donor = await Donor.findOneAndUpdate(
//       { userId: req.user._id },
//       { availability: req.body.availability },
//       { new: true }
//     );
//     res.json({ message: "Availability updated", donor });
//   } catch (error) {
//     res.status(500).json({ message: "Error updating availability" });
//   }
// });

// // View all recipient requests (for donors)
// router.get("/requests", protect, async (req, res) => {
//   try {
//     const requests = await Recipient.find({
//       bloodGroup: req.user.bloodGroup,
//     });
//     res.json(requests);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching requests" });
//   }
// });

// // Delete donor profile
// router.delete("/delete", protect, async (req, res) => {
//   try {
//     await Donor.findOneAndDelete({ userId: req.user._id });
//     res.json({ message: "Donor profile deleted" });
//   } catch (error) {
//     res.status(500).json({ message: "Error deleting profile" });
//   }
// });

// module.exports = router;



const express = require("express");
const router = express.Router();
const Donor = require("../models/Donor");
const Recipient=require("../models/Recipient");
const authMiddleware = require("../middleware/authMiddleware");

// Create or Update Donor Profile
router.post("/profile", authMiddleware, async (req, res) => {
  try {
    const { bloodGroup, city, contactNumber, availability, additionalInfo } = req.body;

    if (!bloodGroup || !city || !contactNumber) {
      return res.status(400).json({ message: "Please fill all required fields." });
    }

    // If donor profile already exists → update
    let donor = await Donor.findOne({ userId: req.user.id });
    if (donor) {
      donor.bloodGroup = bloodGroup;
      donor.city = city;
      donor.contactNumber = contactNumber;
      donor.availability = availability;
      donor.additionalInfo = additionalInfo;
      await donor.save();
      return res.json({ message: "Donor profile updated successfully!" });
    }

    // Else create new donor profile
    donor = new Donor({
      userId: req.user.id,
      bloodGroup,
      city,
      contactNumber,
      availability,
      additionalInfo,
    });

    await donor.save();
    res.status(201).json({ message: "Donor profile created successfully!" });
  } catch (err) {
    console.error("Error in donor profile route:", err.message);
    res.status(500).json({ message: "Server error creating donor profile." });
  }
});

// Get Donor Profile (for verification)
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const donor = await Donor.findOne({ userId: req.user.id });
    if (!donor) return res.status(404).json({ message: "No donor profile found." });
    res.json(donor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching donor profile." });
  }
});

// Toggle donor availability
router.put("/availability", authMiddleware, async (req, res) => {
  try {
    const donor = await Donor.findOne({ userId: req.user.id });
    if (!donor) return res.status(404).json({ message: "Donor profile not found" });

    donor.availability = req.body.availability; // "yes" or "no"
    await donor.save();

    res.json({ message: `Availability updated to ${donor.availability}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating availability" });
  }
});

// 🗑 Delete donor profile
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id);
    if (!donor) return res.status(404).json({ message: "Donor profile not found" });
    if (donor.userId.toString() !== req.user.id)
      return res.status(401).json({ message: "Not authorized" });

    await donor.remove();
    res.json({ message: "Donor profile deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting donor profile" });
  }
});


// Only logged-in recipients should access this
router.get("/available", authMiddleware, async (req, res) => {
  try {
    const availableDonors = await Donor.find({ availability: "yes" }).populate("userId", "name email");
    res.json(availableDonors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching available donors" });
  }
});




// Returns all requests that were sent TO the logged-in donor
router.get("/requests", authMiddleware, async (req, res) => {
  try {
    // req.user.id should be the donor's user id (from auth middleware)
    // we assume your Donor documents are linked by userId -> User._id
    const donorDoc = await Donor.findOne({ userId: req.user.id }).populate({
      path: "requests.recipient",
      model: "User", // adjust if your ref name differs
      select: "name email", // only return these fields
    });

    if (!donorDoc) {
      return res.status(404).json({ message: "Donor profile not found" });
    }

    // If no requests, return empty array
    const requests = (donorDoc.requests || []).map((r) => {
      return {
        _id: r._id,
        status: r.status,
        createdAt: r.createdAt,
        recipientId: r.recipient?._id || null,
        recipientName: r.recipient?.name || "Unknown",
        recipientEmail: r.recipient?.email || "",
        // include any other recipient fields you stored in User or Recipient model
      };
    });

    return res.json(requests);
  } catch (err) {
    console.error("Error fetching donor requests:", err);
    return res.status(500).json({ message: "Error fetching requests" });
  }
});

//  Get all registered recipients (for donor dashboard)
router.get("/all-recipients", authMiddleware, async (req, res) => {
  try {
    const recipients = await Recipient.find()
      .sort({ createdAt: -1 })
      .select("patientName bloodGroup city hospitalName contactNumber urgency unitsRequired ");
      if(!recipients || recipients.length===0){
        return res.json([]);
      }

    res.json(recipients);
  } catch (err) {
    console.error("Error fetching recipients:", err);
    res.status(500).json({ message: "Error fetching recipients" });
  }
});

// router.get("/all", authMiddleware, async (req, res) => {
//   try {
//     const requests = await Recipient.find({ status: "pending" }).sort({ createdAt: -1 });
//     return res.json(requests);
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: "Error fetching requests" });
//   }
// });








module.exports = router;