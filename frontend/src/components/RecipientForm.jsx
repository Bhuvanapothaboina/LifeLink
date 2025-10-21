import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const RecipientForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    patientName: "",
    bloodGroup: "",
    city: "",
    hospitalName: "",
    contactNumber: "",
    urgency: "medium",
    unitsRequired: 1,
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
      await axios.post(`${API}/api/recipient/request`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage("✅ Blood request submitted successfully!");
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Error submitting request");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>🩸 Send Blood Request</h2>

        {message && (
          <p style={{ color: message.includes("✅") ? "green" : "red", textAlign: "center" }}>
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <label>Patient Name</label>
          <input
            type="text"
            name="patientName"
            value={formData.patientName}
            onChange={handleChange}
            required
            style={styles.input}
          />

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
            value={formData.city}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <label>Hospital Name</label>
          <input
            type="text"
            name="hospitalName"
            value={formData.hospitalName}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <label>Contact Number</label>
          <input
            type="tel"
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <label>Urgency</label>
          <select
            name="urgency"
            value={formData.urgency}
            onChange={handleChange}
            required
            style={styles.input}
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <label>Units Required</label>
          <input
            type="number"
            name="unitsRequired"
            value={formData.unitsRequired}
            onChange={handleChange}
            min={1}
            style={styles.input}
          />

          <button type="submit" style={styles.button}>
            Submit Request
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
    background: "linear-gradient(to right, #ffecd2, #fcb69f)",
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

export default RecipientForm;