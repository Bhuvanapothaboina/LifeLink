import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const API=process.env.REACT_APP_API_URL || "http://localhost:5000";

  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [donors, setDonors] = useState([]);
  const [filteredDonors, setFilteredDonors] = useState([]);
  const [cityFilter, setCityFilter] = useState("");
  const [bloodFilter, setBloodFilter] = useState("");
  const [availability, setAvailability] = useState("yes");
  

  const [message, setMessage] = useState("");
  const [sentRequests, setSentRequests]=useState([]);

  useEffect(() => {
    if (!user || !token) navigate("/login");

    if (user.role === "donor") fetchAllRecipients();
    else {
      fetchAvailableDonors();
      fetchSentRequests();
    }
  }, []);

  // Donor: fetch all recipient requests
  // const fetchRecipientRequests = async () => {
  //   try {
  //     const res = await axios.get("http://localhost:5000/api/recipient/all", {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     setRequests(res.data);
  //     setFilteredRequests(res.data);
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  
  // Donor: fetch all registered recipients
const fetchAllRecipients = async () => {
  try {
    const res = await axios.get(`${API}/api/donor/all-recipients`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setRequests(res.data);
    setFilteredRequests(res.data);
  } catch (err) {
    console.error("Error fetching recipients:", err);
  }
};


// Recipient: fetch list of donors this recipient has already requested (so we can show "Request Sent")
const fetchSentRequests = async () => {
  try {
    const res = await axios.get(`${API}/api/recipient/sent`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    // res.data is array of donor infos; map to ids
    const ids = res.data.map(d => d.donorId);
    setSentRequests(ids);
  } catch (err) {
    console.error("Error fetching sent requests:", err);
  }
};



// Recipient: fetch all available donors
  const fetchAvailableDonors = async () => {
    try {
      const res = await axios.get(`${API}/api/donor/available`, {
        headers: { Authorization: `Bearer ${token}` },
      });
        const data = res.data.map((d) => ({
      ...d,
      requestSent: d.requests?.some(
        (r) => r.recipient === user.id || r.recipient === user._id
      ),
    }));
      setDonors(data);
      setFilteredDonors(data);
    } catch (err) {
      console.error(err);
    }
  };

useEffect(() => {
  const fetchDonor = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/api/donor/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDonors(res.data);
      setAvailability(res.data.availability || "yes");
    } catch (err) {
      console.error("Error fetching donor data:", err);
    }
  };
  fetchDonor();
}, []);
  // Donor: toggle availability
  const toggleAvailability = async () => {
    try {
      const newStatus = availability === "yes" ? "no" : "yes";
      const token=localStorage.getItem("token");
      await axios.put(
        `${API}/api/donor/availability`,
        { availability: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAvailability(newStatus);
      alert(`Availability updated to: ${newStatus==="yes" ? "Available" : "Not Available"}`);
    } catch (err) {
      console.error(err);
    }
  };




  const fetchRecipientRequests = async () => {
  try {
    const res = await axios.get(`${API}/api/donor/requests`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setRequests(res.data);
  } catch (err) {
    console.error("Error fetching requests:", err);
  }
};

  // Apply filters (both donor & recipient)
  const applyFilters = () => {
    if (user.role === "donor") {
      let filtered = requests;
      if (cityFilter)
        filtered = filtered.filter((r) =>
          r.city.toLowerCase().includes(cityFilter.toLowerCase())
        );
      if (bloodFilter)
        filtered = filtered.filter((r) => r.bloodGroup === bloodFilter);
      setFilteredRequests(filtered);
    } else {
      let filtered = donors;
      if (cityFilter)
        filtered = filtered.filter((d) =>
          d.city.toLowerCase().includes(cityFilter.toLowerCase())
        );
      if (bloodFilter)
        filtered = filtered.filter((d) => d.bloodGroup === bloodFilter);
      setFilteredDonors(filtered);
    }
  };

  // Recipient: send blood request to donor
  // const sendRequest = async (donorId) => {
  //   try {
  //     const res = await axios.post(
  //       "http://localhost:5000/api/recipient/request",
  //       { donorId },
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );
  //     setMessage(res.data.message || "Request sent successfully!");
  //   } catch (err) {
  //     console.error(err);
  //     setMessage("Failed to send request. Please try again.");
  //   }
  // };

//   const sendRequest = async (donorId) => {
//   try {
//     if(!window.confirm("Send request to this donor?")) return;
//     const res = await axios.post(
//       "http://localhost:5000/api/recipient/send-request", // ✅ new endpoint
//       { donorId },
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );
//     alert("Request sent successfully!");
//     setMessage(res.data.message || "Request sent successfully!");
//     setSentRequests(prev => Array.from(new Set([...prev,donorId])));
//   } catch (err) {
//     console.error("Request error:", err.response?.data || err.message);
//     alert("Failed to send request. Please try again.");
//     setMessage("Failed to send request. Please try again.");
//   }
// };

const sendRequest = async (donorId, alreadyRequested) => {
  if (alreadyRequested) {
    // CANCEL REQUEST FLOW
    const confirmCancel = window.confirm("Do you want to cancel this request?");
    if (!confirmCancel) return;

    try {
      const res = await axios.post(
        `${API}/api/recipient/cancel-request`,
        { donorId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message);
      setDonors((prev) =>
        prev.map((d) =>
          d._id === donorId ? { ...d, requestSent: false } : d
        )
      );
    } catch (err) {
      console.error("Cancel error:", err);
      alert("Failed to cancel request.");
    }
  } else {
    // SEND REQUEST FLOW
    const confirmSend = window.confirm("Do you want to send request to this donor?");
    if (!confirmSend) return;

    try {
      const res = await axios.post(
        `${API}/api/recipient/send-request`,
        { donorId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message);
      setDonors((prev) =>
        prev.map((d) =>
          d._id === donorId ? { ...d, requestSent: true } : d
        )
      );
    } catch (err) {
      console.error("Send error:", err);
      alert("Failed to send request.");
    }
  }
};


const handleCall = (phoneNumber) => {
  // Check if device is mobile
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (isMobile) {
    // open dialer
    window.location.href = `tel:${phoneNumber}`;
  } else {
    // show alert on laptop
    alert(`Call not available on laptop. Please dial this number manually: ${phoneNumber}`);
  }
};


  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>
          Welcome, {user.name} ({user.role})
        </h1>
        <button style={styles.profileButton} onClick={() => navigate("/profile")}>
          View My Profile
        </button>
        {user.role === "donor" && (
  <button style={styles.profileButton} onClick={() => navigate("/requests")}>View Requests</button>
)}
      </div>

      {/* Donor Dashboard */}
      {user.role === "donor" && (
        <>
          <div style={styles.actionBar}>
            <button style={styles.availabilityButton} onClick={toggleAvailability}>
              {availability === "yes" ? "Set Not Available" : "Set Available"}
            </button>
            <p>Current Status : {availability === "yes" ?  "✅ Available" : "❌ Not Available"}</p>

            <div style={styles.filters}>
              <input
                placeholder="Filter by city"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                style={styles.input}
              />
              <select
                value={bloodFilter}
                onChange={(e) => setBloodFilter(e.target.value)}
                style={styles.input}
              >
                <option value="">All Blood Groups</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
              <button style={styles.filterButton} onClick={applyFilters}>
                Apply Filters
              </button>
            </div>
          </div>

          {/* <h2>🧾 Pending Requests</h2>
          {filteredRequests.length === 0 && <p>No requests found.</p>}
          {filteredRequests.map((r) => (
            <div key={r._id} style={styles.card}>
              <p><strong>Patient:</strong> {r.patientName}</p>
              <p><strong>Blood Group:</strong> {r.bloodGroup}</p>
              <p><strong>City:</strong> {r.city}</p>
              <p><strong>Hospital:</strong> {r.hospitalName}</p>
              <p><strong>Contact:</strong> {r.contactNumber}</p>
              <p><strong>Urgency:</strong> {r.urgency}</p>
              <p><strong>Units Needed:</strong> {r.unitsRequired}</p>
            </div>
          ))} */}


          <h2>🩸 All Recipients Who Need Blood</h2>
{filteredRequests.length === 0 && <p>No recipients found.</p>}
{filteredRequests.map((r) => (
  <div key={r._id} style={styles.card}>
    <p><strong>Patient:</strong> {r.patientName}</p>
    <p><strong>Blood Group:</strong> {r.bloodGroup}</p>
    <p><strong>City:</strong> {r.city}</p>
    <p><strong>Hospital:</strong> {r.hospitalName}</p>
    <p><strong>Contact:</strong> {r.contactNumber}</p>
    <p><strong>Urgency:</strong> {r.urgency}</p>
    <p><strong>Units Needed:</strong> {r.unitsRequired}</p>
  </div>
))}
        </>
      )}

      {/* Recipient Dashboard */}
      {user.role === "recipient" && (
        <>
          <div style={styles.actionBar}>
            <div style={styles.filters}>
              <input
                placeholder="Filter by city"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                style={styles.input}
              />
              <select
                value={bloodFilter}
                onChange={(e) => setBloodFilter(e.target.value)}
                style={styles.input}
              >
                <option value="">All Blood Groups</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
              <button style={styles.filterButton} onClick={applyFilters}>
                Apply Filters
              </button>
            </div>
          </div>

          {message && <p style={{ color: "green" }}>{message}</p>}

          <h2>🩸 Available Donors</h2>
          {filteredDonors.length === 0 && <p>No donors available.</p>}
          {filteredDonors.map((d) => (
            <div key={d._id} style={styles.card}>
              <p><strong>Name:</strong> {d.userId?.name || d.name}</p>
              <p><strong>Blood Group:</strong> {d.bloodGroup}</p>
              <p><strong>City:</strong> {d.city}</p>
              <p><strong>Contact:</strong> {d.contactNumber}</p>
              <p><strong>Available:</strong> {d.availability}</p>
              {/* <button style={styles.requestButton} onClick={() => sendRequest(d._id)}>
                Send Request
              </button> */}
                           
              <div style={{ display: "flex", gap: "10px" }}>
              <button
                style={{
                  ...styles.requestButton,
                  backgroundColor: d.requestSent ? "#2a9d8f" : "#e63946",
                }}
                onClick={() => sendRequest(d._id, d.requestSent)}
              >
                {d.requestSent ? "Cancel Request" : "Send Request"}
              </button>

              <button
                style={styles.callButton}
                onClick={() => handleCall(d.contactNumber)}
              >
                📞 Call
              </button>
            </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

const styles = {
  container: { padding: "20px", fontFamily: "Arial, sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  profileButton: {
    padding: "8px 12px",
    backgroundColor: "#1d3557",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  actionBar: { margin: "20px 0" },
  filters: { display: "flex", gap: "10px", alignItems: "center" },
  input: { padding: "8px", borderRadius: "6px", border: "1px solid #ccc" },
  filterButton: {
    padding: "8px 12px",
    backgroundColor: "#457b9d",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  availabilityButton: {
     padding: "8px 12px",
    backgroundColor: "#2a9d8f",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    marginRight: "10px",
  },
  card: {
    border: "1px solid #ccc",
    padding: "15px",
    borderRadius: "10px",
    marginBottom: "15px",
    backgroundColor: "#f1faee",
    boxShadow: "0 2px 5px rgba(45, 34, 34, 0.1)",
  },
  requestButton: {
    padding: "8px 12px",
    backgroundColor: "#e63946",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    marginTop: "10px",
  },

callButton: {
  padding: "8px 12px",
  backgroundColor:"#72c188ff",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  marginTop: "10px",
},
};

export default Dashboard;