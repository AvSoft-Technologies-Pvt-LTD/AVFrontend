import React from "react";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./LabDashboard";
import LabAppointmentPage from "./TestRequests";
import PatientsList from "./PatientsList";
import TestCatalogs from "./TestCatalogs";
import Billing from "./Billing";
import Settings from "./Settings";

const LabRoutes = () => (
  <Routes>
      <Route index element={<Dashboard />} /> {/* /labdashboard */}
      <Route path="requests" element={<LabAppointmentPage />} />
      <Route path="patientlist" element={<PatientsList />} />
      <Route path="testcatalogs" element={<TestCatalogs />} />
      <Route path="billing" element={<Billing />} />
      <Route path="settings" element={<Settings />} />
    </Routes>
);

export default LabRoutes;
