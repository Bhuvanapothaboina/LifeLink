import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!token) navigate("/login");
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/profile/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data.user);
      setProfileData(res.data.profileData);
      setFormData({ ...res.data.user, ...res.data.profileData });
    } catch (err) {
      console.error(err);
      setMessage("Error fetching profile");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put("http://localhost:5000/api/profile/update", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage(res.data.message);
      fetchProfile();
    } catch (err) {
      console.error(err);
      setMessage("Failed to update profile");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete("http://localhost:5000/api/profile/delete", {
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    } catch (err) {
      console.error(err);
      setMessage("Failed to delete account");
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>👤 My Profile</h2>
        {message && <p style={styles.message}>{message}</p>}
        <form onSubmit={handleUpdate} style={styles.form}>
          {/* Common fields */}
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name || ""}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email || ""}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <label>Password</label>
          <div style={styles.passwordContainer}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter new password"
              value={formData.password || ""}
              onChange={handleChange}
            //   style={{ ...styles.input, marginBottom: 0 }}
            // />
            // <span onClick={() => setShowPassword(!showPassword)} style={styles.eye}>
            //   {showPassword ? "🙈" : "👁️"}
            // </span>
             style={{
      width: "100%",
      padding: "10px 40px 10px 10px", // extra right padding for the icon
      borderRadius: "8px",
      border: "1px solid #ccc",
      outline: "none",
      boxSizing: "border-box",
    }}
  />

          {/* Eye icon toggle (SVG) */}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            style={{
              position: "absolute",
              right: "8px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "transparent",
              border: "none",
              padding: 4,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {showPassword ? (
              // eye off (closed) SVG
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20.5 11 11 0 0 1 1.5 11a20.6 20.6 0 0 1 3.59-4.64" />
                <path d="M1 1l22 22" />
              </svg>
            ) : (
              // eye (open) SVG
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
          </div>

          {/* Donor fields */}
          {user.role === "donor" && profileData && (
            <>
              <label>Blood Group</label>
              <input
                type="text"
                name="bloodGroup"
                value={formData.bloodGroup || ""}
                onChange={handleChange}
                required
                style={styles.input}
              />
              <label>City</label>
              <input
                type="text"
                name="city"
                value={formData.city || ""}
                onChange={handleChange}
                required
                style={styles.input}
              />
              <label>Contact Number</label>
              <input
                type="text"
                name="contactNumber"
                value={formData.contactNumber || ""}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </>
          )}

          {/* Recipient fields */}
          {user.role === "recipient" && profileData && (
            <>
              <label>Patient Name</label>
              <input
                type="text"
                name="patientName"
                value={formData.patientName || ""}
                onChange={handleChange}
                required
                style={styles.input}
              />
              <label>Hospital Name</label>
              <input
                type="text"
                name="hospitalName"
                value={formData.hospitalName || ""}
                onChange={handleChange}
                required
                style={styles.input}
              />
              <label>Units Required</label>
              <input
                type="number"
                name="unitsRequired"
                value={formData.unitsRequired || ""}
                onChange={handleChange}
                required
                style={styles.input}
              />
              <label>Urgency</label>
              <select
                name="urgency"
                value={formData.urgency || ""}
                onChange={handleChange}
                required
                style={styles.input}
              >
                <option value="">Select urgency</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <label>City</label>
              <input
                type="text"
                name="city"
                value={formData.city || ""}
                onChange={handleChange}
                required
                style={styles.input}
              />
              <label>Contact Number</label>
              <input
                type="text"
                name="contactNumber"
                value={formData.contactNumber || ""}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </>
          )}

          <button type="submit" style={styles.updateBtn}>
            Update Profile
          </button>
        </form>

        <button onClick={handleDelete} style={styles.deleteBtn}>
          Delete Account
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(to right, #a1c4fd, #c2e9fb)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
  },
  card: {
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "15px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "500px",
  },
  title: {
    textAlign: "center",
    marginBottom: "20px",
  },
  message: {
    color: "green",
    textAlign: "center",
    marginBottom: "15px",
    fontWeight: "bold",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  input: {
    padding: "10px",
    marginBottom: "15px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    outline: "none",
  },
  passwordContainer: {
    position: "relative",
    marginBottom: "15px",
  },
  eye: {
    position: "absolute",
    right: "10px",
    top: "10px",
    cursor: "pointer",
  },
  updateBtn: {
    padding: "12px",
    backgroundColor: "#2a9d8f",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    marginTop: "10px",
  },
  deleteBtn: {
    padding: "12px",
    backgroundColor: "#e63946",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    marginTop: "10px",
    width: "100%",
  },
};

export default Profile;