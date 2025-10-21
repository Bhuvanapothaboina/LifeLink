const mongoose = require("mongoose");

const donorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  bloodGroup: {
    type: String,
    required: true,
    enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
  },
  contactNumber: {
    type: String,
    required: true,
    match: [/^[0-9]{10}$/, "Please enter a valid 10-digit phone number"],
  },
  city: {
    type: String,
    required: true,
  },
  availability: {
    type: Boolean,
    default: true,
  },
  additionalInfo: {
    type: String,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
  requests: [
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: { type: String, default: "Pending" },
    createdAt:{type:Date,default:Date.now},
  },
],
});

module.exports = mongoose.model("Donor", donorSchema);