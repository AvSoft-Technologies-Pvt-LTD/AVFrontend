import React from "react";
import { Routes, Route } from "react-router-dom";

// Import FrontDesk pages
import FrontDeskDashboard from "../frontdeskdashboard/frontdeskdashboard";
import PatientsList from "./PatientsList";
import PatientRegistration from "./PatientRegistration";
import TokenManagement from "./TokenManagement";

import Settings from "./Settings";
import AppointmentList from "./AppointmentList";

const FrontRoutes = () => {
  return (
    <Routes>
      {/* Dashboard */}
      <Route path="dashboard" element={<FrontDeskDashboard/>} />
      
      {/* Appointments */}
      <Route path="appointments" element={<AppointmentList />} />
      
      {/* Patients */}
      <Route path="patients" element={<PatientsList />} />
      <Route path="new-patient" element={<PatientRegistration />} />
      
      {/* Token Management */}
      <Route path="tokens" element={<TokenManagement />} />
      
      {/* Reports */}
      {/* <Route path="reports/login" element={<LoginReport />} /> */}
      
      {/* Settings */}
      <Route path="settings" element={<Settings />} />
      
      {/* Default redirect to dashboard */}
      <Route path="/" element={<FrontDeskDashboard />} />
    </Routes>
  );
};

export default FrontRoutes;