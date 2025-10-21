import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "donor",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
   const API=process.env.REACT_APP_API_URL || "http://localhost:5000";


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await axios.post(`${API}/api/auth/register`, formData);
      setMessage("Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
      console.log("Registration success:", res.data);
    } catch (err) {
      setMessage(err.response?.data?.message || "Registration failed. Try again.");
      console.error(err);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>🩸 LifeLink Registration</h2>

        {message && <p style={{ color: "red", textAlign: "center" }}>{message}</p>}

        <form onSubmit={handleSubmit}>
          <label>Name</label>
          <input
            type="text"
            name="name"
            placeholder="Enter your name"
            value={formData.name}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <label>Password</label>
          <div style={styles.passwordContainer}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            //   style={{ ...styles.input, marginBottom: 0 }}
            // />
            // <span
            //   onClick={() => setShowPassword(!showPassword)}
            //   style={styles.eye}
            // >
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

          <label>Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            style={styles.input}
          >
            <option value="donor">Donor</option>
            <option value="recipient">Recipient</option>
          </select>

          <button type="submit" style={styles.button}>Register</button>
        </form>

        <p style={{ textAlign: "center", marginTop: "10px" }}>
          Already have an account?{" "}
          <span style={styles.link} onClick={() => navigate("/login")}>
            Login
          </span>
        </p>
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
    background: "linear-gradient(to right, #ffdde1, #ee9ca7)",
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
  passwordContainer: {
    position: "relative",
    marginBottom: "10px",
  },
  eye: {
    position: "absolute",
    right: "10px",
    top: "8px",
    cursor: "pointer",
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
  link: {
    color: "#e63946",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default Register;