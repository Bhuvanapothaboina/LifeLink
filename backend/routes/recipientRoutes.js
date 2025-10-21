// backend/routes/recipient.js
const express = require("express");
const router = express.Router();
const Recipient = require("../models/Recipient");
const Donor=require("../models/Donor");
const authMiddleware = require("../middleware/authMiddleware");



  // 🩸 Send Request to a Donor
router.post("/send-request", authMiddleware, async (req, res) => {
  try {
    const { donorId } = req.body;
    const recipientId = req.user.id;

    if (!donorId) {
      return res.status(400).json({ message: "Donor ID is required" });
    }

    const donor = await Donor.findById(donorId);
    if (!donor) {
      return res.status(404).json({ message: "Donor not found" });
    }

    donor.requests = donor.requests || [];

    // ✅ Prevent duplicate request
    const alreadyRequested = donor.requests.some(
      (r) => r.recipient.toString() === recipientId.toString()
    );

    if (alreadyRequested) {
      return res.status(400).json({ message: "You have already sent a request to this donor." });
    }

    donor.requests.push({ recipient: recipientId, status: "Pending" });
    await donor.save();

    res.json({ message: "Request sent successfully!" });
  } catch (err) {
    console.error("Error sending request:", err);
    res.status(500).json({ message: "Server error while sending request" });
  }
});

//🩸 Create Blood Request
router.post("/request", authMiddleware, async (req, res) => {
  try {
    const {
      patientName,
      bloodGroup,
      city,
      hospitalName,
      contactNumber,
      urgency,
      unitsRequired,
    } = req.body;



    if (!patientName || !bloodGroup || !city || !contactNumber || !urgency || !unitsRequired) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const newRequest = new Recipient({
      userId: req.user.id,
      //donorId: donorId || null,
      patientName,
      bloodGroup,
      city,
      hospitalName,
      contactNumber,
      urgency,
      unitsRequired,
    });

    await newRequest.save();
    return res.status(201).json({ message: "Blood request submitted successfully!" });
  } catch (err) {
    console.error("Error in recipient request:", err.message);
    return res.status(500).json({ message: "Server error while submitting request" });
  }
});

// 🧾 Fetch all donor-visible requests (Donor Dashboard)
router.get("/all", authMiddleware, async (req, res) => {
  try {
    const requests = await Recipient.find({ status: "pending" }).sort({ createdAt: -1 });
    return res.json(requests);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error fetching requests" });
  }
});


// Returns an array of donorIds that this recipient has sent requests to (and details)
router.get("/sent", authMiddleware, async (req, res) => {
  try {
    const recipientId = req.user.id;
    // find donors where requests array contains recipient
    const donors = await Donor.find({ "requests.recipient": recipientId }).select(
      "userId bloodGroup city contactNumber availability"
    ).populate({ path: "userId", select: "name email" });

    // Map to simple list of donorIds (and some donor info)
    const sent = donors.map(d => ({
      donorId: d._id,
      name: d.userId?.name || "",
      email: d.userId?.email || "",
      bloodGroup: d.bloodGroup,
      city: d.city,
      contactNumber: d.contactNumber,
      availability: d.availability,
    }));

    return res.json(sent);
  } catch (err) {
    console.error("Error in GET /api/recipient/sent:", err);
    return res.status(500).json({ message: "Server error" });
  }
});




// DELETE /api/recipient/cancel-request/:donorId
// 🗑 Cancel Blood Request
router.post("/cancel-request", authMiddleware, async (req, res) => {
  try {
    const { donorId } = req.body;
    const recipientId = req.user.id;

    const donor = await Donor.findById(donorId);
    if (!donor) {
      return res.status(404).json({ message: "Donor not found" });
    }

    // Remove request where recipient matches
    donor.requests = donor.requests.filter(
      (r) => r.recipient.toString() !== recipientId.toString()
    );
    await donor.save();

    res.json({ message: "Request cancelled successfully!" });
  } catch (err) {
    console.error("Error cancelling request:", err);
    res.status(500).json({ message: "Server error while cancelling request" });
  }
});

// 🧾 Fetch logged-in user's requests (Recipient Dashboard)
router.get("/mine", authMiddleware, async (req, res) => {
  try {
    const requests = await Recipient.find({ userId: req.user.id }).sort({ createdAt: -1 });
    return res.json(requests);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error fetching your requests" });
  }
});

// 🗑 Delete a request (Recipient action)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const request = await Recipient.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });
    if (request.userId.toString() !== req.user.id)
      return res.status(401).json({ message: "Not authorized" });

    await request.remove();
    return res.json({ message: "Request deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error deleting request" });
  }
});

module.exports = router;