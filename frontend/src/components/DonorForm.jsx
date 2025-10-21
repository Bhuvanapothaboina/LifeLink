import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";



const DonorForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    bloodGroup: "",
    city: "",
    contactNumber: "",
    availability: "yes",
    additionalInfo: "",
  });

  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");
  const API=process.env.REACT_APP_API_URL || "http://localhost:5000";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      await axios.post(`${API}/api/donor/profile`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage("✅ Donor profile created successfully!");
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Error saving donor profile.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>🩸 Donor Information</h2>

        {message && (
          <p style={{ color: message.includes("✅") ? "green" : "red", textAlign: "center" }}>
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <label>Blood Group</label>
          <select
            name="bloodGroup"
            value={formData.bloodGroup}
            onChange={handleChange}
            required
            style={styles.input}
          >
            <option value="">Select Blood Group</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
          </select>

          <label>City</label>
          <input
            type="text"
            name="city"
            placeholder="Enter your city"
            value={formData.city}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <label>Contact Number</label>
          <input
            type="tel"
            name="contactNumber"
            placeholder="Enter your phone number"
            value={formData.contactNumber}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <label>Availability</label>
          <select
            name="availability"
            value={formData.availability}
            onChange={handleChange}
            required
            style={styles.input}
          >
            <option value="yes">Available</option>
            <option value="no">Not Available</option>
          </select>

          <label>Additional Information</label>
          <textarea
            name="additionalInfo"
            placeholder="Any message or condition..."
            value={formData.additionalInfo}
            onChange={handleChange}
            style={{ ...styles.input, height: "80px" }}
          ></textarea>

          <button type="submit" style={styles.button}>
            Save Profile
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(to right, #f8cdda, #1d2b64)",
  },
  card: {
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "15px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    width: "400px",
  },
  title: {
    textAlign: "center",
    marginBottom: "20px",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  button: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#e63946",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default DonorForm;