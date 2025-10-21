const mongoose = require("mongoose");

const recipientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  patientName:{
    type:String,
    required:true
  },
   bloodGroup: {
    type: String,
    required: true,
    enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
  },
   city: {
    type: String,
    required: true,
  },
  hospitalName: {
    type: String,
    required: true,
  },
  contactNumber: {
    type: String,
    required: true,
    match: [/^[0-9]{10}$/, "Please enter a valid 10-digit phone number"],
  },
  urgency: {
    type: String,
    enum: ["low", "medium", "high"],
    required: true,
  },
 
  unitsRequired: {
    type: Number,
    required: true,
    min: [1, "At least one unit is required"],
  },
  status:{
    type:String,
    enum:["pending","fulfilled"],
    default:"pending"
  },
  
  dateRequested: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Recipient", recipientSchema);