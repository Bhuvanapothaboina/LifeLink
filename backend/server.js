const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const donorRoutes=require("./routes/donorRoutes");
const recipientRoutes=require("./routes/recipientRoutes");

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cors({origin:CORS_ORIGIN,
  credentials:true,
}));

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ✅ Register routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/donor", require("./routes/donorRoutes"));
app.use("/api/recipient", require("./routes/recipientRoutes"));
app.use("/api/profile", require("./routes/profileRoutes"));



// Root route
app.get("/", (req, res) => {
  res.send("LifeLink API backend is running...");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));