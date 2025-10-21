import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login";
import DonorForm from "./components/DonorForm";
import RecipientForm from "./components/RecipientForm";
import Dashboard from "./components/Dashboard";
import Profile from "./components/profile";
import Requests from "./components/Requests";
import Home from "./components/Home";

function App() {
  return (
    <Router>
      <Routes>
        {/* <Route path="/" element={<Register />} /> */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
         <Route path="/donor-form" element={<DonorForm />} />
        <Route path="/recipient-form" element={<RecipientForm />} />
        <Route path="/dashboard" element={<Dashboard />} />  
        <Route path="/profile" element={<Profile />} />
        <Route path="/requests" element={<Requests />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;