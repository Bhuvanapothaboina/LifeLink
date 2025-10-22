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
  }, [user, token]);


  
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
if(user && user.role=="donor"){
  fetchDonor();
}
}, [user]);
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



// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// const Dashboard = () => {
//   const navigate = useNavigate();
//   const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

//   const token = localStorage.getItem("token");
//   const user = JSON.parse(localStorage.getItem("user") || "null");

//   // Shared state
//   const [donors, setDonors] = useState([]); // available donors (for recipients)
//   const [filteredDonors, setFilteredDonors] = useState([]);
//   const [recipients, setRecipients] = useState([]); // all recipients (for donors)
//   const [donorProfile, setDonorProfile] = useState(null); // logged-in donor profile (object)
//   const [requests, setRequests] = useState([]); // requests (depends on role)
//   const [sentRequestsIds, setSentRequestsIds] = useState([]); // list of donorIds the recipient has already requested
//   const [cityFilter, setCityFilter] = useState("");
//   const [bloodFilter, setBloodFilter] = useState("");
//   const [availability, setAvailability] = useState("yes");
//   const [loading, setLoading] = useState(true);
//   const [message, setMessage] = useState("");

//   // ---------------------------------------------------------
//   // 1) Primary useEffect: run on mount (or when user/token changes)
//   //    - Redirect to login if no user/token
//   //    - For donor: fetch recipients + (we do not fetch donorProfile here)
//   //    - For recipient: fetch available donors + fetch list of sent requests
//   // ---------------------------------------------------------
//   useEffect(() => {
//     if (!user || !token) {
//       navigate("/login");
//       return;
//     }

//     setLoading(true);
//     setMessage("");

//     if (user.role === "donor") {
//       fetchAllRecipients();    // donors see all recipients who made requests
//       fetchDonorRequests();    // donors see requests sent to them (if any)
//       // donorProfile is intentionally fetched in the donor-only effect below
//     } else {
//       fetchAvailableDonors();  // recipients see available donors
//       fetchSentRequests();     // recipients see which donors they already requested
//     }

//     setLoading(false);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [user, token]); // run when user or token changes

//   // ---------------------------------------------------------
//   // 2) Donor-only useEffect: runs when user.role is donor
//   //    - Fetch donor's own profile and set availability
//   //    - Fetch donor-specific requests (again) — useful if donorProfile needed
//   // ---------------------------------------------------------
//   useEffect(() => {
//     if (!user || !token) return;
//     if (user.role !== "donor") return;

//     // fetch donor profile and requests for donor
//     const initDonor = async () => {
//       setLoading(true);
//       await fetchDonorProfile();   // sets donorProfile & availability
//       await fetchDonorRequests();  // sets requests (requests TO this donor)
//       setLoading(false);
//     };

//     initDonor();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [user?.role, token]);

//   // ---------------------------------------------------------
//   // Fetch functions (backend endpoints used below must exist)
//   // ---------------------------------------------------------
//   const fetchAvailableDonors = async () => {
//     try {
//       const res = await axios.get(`${API}/api/donor/available`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       // compute requestSent flag based on donors' requests field (if populated)
//       const data = (res.data || []).map((d) => {
//         const requestSent =
//           Array.isArray(d.requests) &&
//           d.requests.some((r) => {
//             // r.recipient might be an id string or object depending on how you stored it
//             return r.recipient === user.id || r.recipient === user._id || (r.recipient && r.recipient.toString() === user.id);
//           });
//         return { ...d, requestSent };
//       });
//       setDonors(data);
//       setFilteredDonors(data);
//     } catch (err) {
//       console.error("Error fetching available donors:", err);
//       setMessage("Error fetching donors.");
//     }
//   };

//   const fetchSentRequests = async () => {
//     // returns donors that this recipient has requested (endpoint provided earlier: /api/recipient/sent)
//     try {
//       const res = await axios.get(`${API}/api/recipient/sent`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const ids = (res.data || []).map((d) => d.donorId);
//       setSentRequestsIds(ids);
//     } catch (err) {
//       console.error("Error fetching sent requests:", err);
//     }
//   };

//   const fetchAllRecipients = async () => {
//     try {
//       const res = await axios.get(`${API}/api/donor/all-recipients`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setRecipients(res.data || []);
//     } catch (err) {
//       console.error("Error fetching recipients:", err);
//       setMessage("Error fetching recipients.");
//     }
//   };

//   const fetchDonorProfile = async () => {
//     try {
//       const res = await axios.get(`${API}/api/donor/me`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setDonorProfile(res.data);
//       setAvailability(res.data?.availability || "yes");
//     } catch (err) {
//       console.error("Error fetching donor profile:", err);
//     }
//   };

//   // requests that were sent to this donor (donor sees these)
//   const fetchDonorRequests = async () => {
//     try {
//       const res = await axios.get(`${API}/api/donor/requests`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setRequests(res.data || []);
//     } catch (err) {
//       console.error("Error fetching donor requests:", err);
//     }
//   };

//   // recipient's own requests (if you have such endpoint)
//   const fetchRecipientRequests = async () => {
//     try {
//       const res = await axios.get(`${API}/api/recipient/mine`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setRequests(res.data || []);
//     } catch (err) {
//       console.error("Error fetching recipient requests:", err);
//     }
//   };

//   // ---------------------------------------------------------
//   // Toggle availability (donor)
//   // ---------------------------------------------------------
//   const toggleAvailability = async () => {
//     try {
//       const newStatus = availability === "yes" ? "no" : "yes";
//       await axios.put(
//         `${API}/api/donor/availability`,
//         { availability: newStatus },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setAvailability(newStatus);
//       // refresh available donors for recipients (optional)
//       // fetchAvailableDonors();
//       alert(`Availability updated to ${newStatus}`);
//     } catch (err) {
//       console.error("Error updating availability:", err);
//       alert("Failed to update availability.");
//     }
//   };

//   // ---------------------------------------------------------
//   // Send / Cancel request (recipient)
//   // send-request toggles to cancel-request endpoints you have
//   // ---------------------------------------------------------
//   const sendOrCancelRequest = async (donorId, alreadyRequested) => {
//     if (alreadyRequested) {
//       // cancel
//       if (!window.confirm("Cancel this request?")) return;
//       try {
//         // using POST cancel endpoint (your route uses POST or DELETE — adapt if needed)
//         await axios.post(
//           `${API}/api/recipient/cancel-request`,
//           { donorId },
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//         // update state locally
//         setDonors((prev) => prev.map((d) => (d._id === donorId ? { ...d, requestSent: false } : d)));
//         setSentRequestsIds((prev) => prev.filter((id) => id !== donorId));
//       } catch (err) {
//         console.error("Cancel request error:", err);
//         alert("Failed to cancel request.");
//       }
//     } else {
//       // send
//       if (!window.confirm("Send request to this donor?")) return;
//       try {
//         await axios.post(
//           `${API}/api/recipient/send-request`,
//           { donorId },
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//         // update local state
//         setDonors((prev) => prev.map((d) => (d._id === donorId ? { ...d, requestSent: true } : d)));
//         setSentRequestsIds((prev) => Array.from(new Set([...prev, donorId])));
//         alert("Request sent successfully.");
//       } catch (err) {
//         console.error("Send request error:", err);
//         alert("Failed to send request.");
//       }
//     }
//   };

//   // ---------------------------------------------------------
//   // Filter apply function (same UI for both roles)
//   // ---------------------------------------------------------
//   const applyFilters = () => {
//     if (user.role === "donor") {
//       // filter recipients list by city or blood (if you want)
//       let f = recipients;
//       if (cityFilter) f = f.filter((r) => r.city?.toLowerCase().includes(cityFilter.toLowerCase()));
//       if (bloodFilter) f = f.filter((r) => r.bloodGroup === bloodFilter);
//       setRecipients(f);
//     } else {
//       let f = donors;
//       if (cityFilter) f = f.filter((d) => d.city?.toLowerCase().includes(cityFilter.toLowerCase()));
//       if (bloodFilter) f = f.filter((d) => d.bloodGroup === bloodFilter);
//       setFilteredDonors(f);
//     }
//   };

//   // ---------------------------------------------------------
//   // Call button: open dialer on mobile, alert on desktop
//   // ---------------------------------------------------------
//   const handleCall = (phone) => {
//     const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
//     if (!phone) {
//       alert("No phone number available");
//       return;
//     }
//     if (isMobile) {
//       window.location.href = `tel:${phone}`;
//     } else {
//       alert(`Call not available on laptop. Please call: ${phone}`);
//     }
//   };

//   // ---------------------------------------------------------
//   // RENDER
//   // ---------------------------------------------------------
//   if (!user) return <p>Redirecting to login...</p>;

//   return (
//     <div style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
//       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//         <h1>Welcome, {user.name} ({user.role})</h1>
//         <div>
//           <button onClick={() => navigate("/profile")} style={{ marginRight: 8 }}>View Profile</button>
//           {user.role === "donor" && <button onClick={() => navigate("/requests")}>View Requests</button>}
//         </div>
//       </div>

//       <div style={{ margin: "16px 0" }}>
//         <input placeholder="Filter by city" value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} />
//         <select value={bloodFilter} onChange={(e) => setBloodFilter(e.target.value)} style={{ marginLeft: 8 }}>
//           <option value="">All Blood Groups</option>
//           <option value="A+">A+</option><option value="A-">A-</option>
//           <option value="B+">B+</option><option value="B-">B-</option>
//           <option value="O+">O+</option><option value="O-">O-</option>
//           <option value="AB+">AB+</option><option value="AB-">AB-</option>
//         </select>
//         <button onClick={applyFilters} style={{ marginLeft: 8 }}>Apply Filters</button>
//       </div>

//       {message && <p style={{ color: "red" }}>{message}</p>}

//       {user.role === "donor" ? (
//         <>
//           <div style={{ marginBottom: 12 }}>
//             <button onClick={toggleAvailability}>
//               {availability === "yes" ? "Set Not Available" : "Set Available"}
//             </button>
//             <span style={{ marginLeft: 12 }}>Status: {availability === "yes" ? "✅ Available" : "❌ Not Available"}</span>
//           </div>

//           <h2>All Recipients Who Need Blood</h2>
//           {recipients.length === 0 ? <p>No recipients found.</p> : recipients.map((r) => (
//             <div key={r._id} style={{ border: "1px solid #ccc", padding: 12, marginBottom: 10, borderRadius: 8 }}>
//               <p><strong>Patient:</strong> {r.patientName}</p>
//               <p><strong>Blood Group:</strong> {r.bloodGroup}</p>
//               <p><strong>City:</strong> {r.city}</p>
//               <p><strong>Hospital:</strong> {r.hospitalName}</p>
//               <p><strong>Contact:</strong> {r.contactNumber}</p>
//               <p><strong>Urgency:</strong> {r.urgency}</p>
//               <p><strong>Units Needed:</strong> {r.unitsRequired}</p>
//             </div>
//           ))}

//           <h2>Your Requests (sent to you)</h2>
//           {requests.length === 0 ? <p>No requests yet.</p> : requests.map((rq) => (
//             <div key={rq._id} style={{ border: "1px solid #ddd", padding: 10, marginBottom: 8 }}>
//               <p><strong>From:</strong> {rq.recipientName || rq.recipientEmail || "Unknown"}</p>
//               <p><strong>Status:</strong> {rq.status}</p>
//               <p><small>{new Date(rq.createdAt).toLocaleString()}</small></p>
//             </div>
//           ))}
//         </>
//       ) : (
//         <>
//           <h2>Available Donors</h2>
//           {filteredDonors.length === 0 ? <p>No donors available.</p> : filteredDonors.map((d) => (
//             <div key={d._id} style={{ border: "1px solid #ccc", padding: 12, marginBottom: 10, borderRadius: 8 }}>
//               <p><strong>Name:</strong> {d.userId?.name || d.name}</p>
//               <p><strong>Blood Group:</strong> {d.bloodGroup}</p>
//               <p><strong>City:</strong> {d.city}</p>
//               <p><strong>Contact:</strong> {d.contactNumber}</p>
//               <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
//                 <button
//                   onClick={() => sendOrCancelRequest(d._id, Boolean(d.requestSent || sentRequestsIds.includes(d._id)))}
//                   style={{ background: d.requestSent || sentRequestsIds.includes(d._id) ? "#2a9d8f" : "#e63946", color: "#fff", padding: "8px 12px", border: "none", borderRadius: 6 }}
//                 >
//                   {d.requestSent || sentRequestsIds.includes(d._id) ? "Cancel Request" : "Send Request"}
//                 </button>

//                 <button onClick={() => handleCall(d.contactNumber)} style={{ padding: "8px 12px", borderRadius: 6 }}>
//                   Call
//                 </button>
//               </div>
//             </div>
//           ))}

//           <h2>Your Sent Requests</h2>
//           {sentRequestsIds.length === 0 ? <p>You haven't sent any requests.</p> : (
//             <ul>
//               {sentRequestsIds.map((id) => <li key={id}>{id}</li>)}
//             </ul>
//           )}
//         </>
//       )}
//     </div>
//   );
// };

// export default Dashboard;