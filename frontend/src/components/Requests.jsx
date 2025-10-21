import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return navigate("/login");
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/donor/requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(res.data);
    } catch (err) {
      console.error("Error fetching requests:", err);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Requests Sent To Me</h2>
      {requests.length === 0 ? (
        <p>No requests found.</p>
      ) : (
        requests.map((r) => (
          <div key={r._id} style={{
            border: "1px solid #ccc",
            padding: 12,
            marginBottom: 12,
            borderRadius: 8,
            background: "#fff"
          }}>
            <p><strong>Name:</strong> {r.recipientName}</p>
            <p><strong>Email:</strong> {r.recipientEmail}</p>
            <p><strong>Status:</strong> {r.status}</p>
            <p><strong>Requested At:</strong> {new Date(r.createdAt).toLocaleString()}</p>
            {/* Optionally add Accept / Reject buttons here */}
          </div>
        ))
      )}
    </div>
  );
};

export default Requests;