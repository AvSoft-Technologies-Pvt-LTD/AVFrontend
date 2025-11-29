import React from "react";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./LabDashboard";
import Settings from "./Settings";
import Patients from "./Patients";
import TestBookings from "./TestBookings";
import LabTechnicians from "./LabTechnicians";
import Inventory from "./Inventory";
import Payments from "./Payments";
import TestCatalogs from "./TestCatalogs";

const LabRoutes = () => (
    <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/test-bookings" element={<TestBookings />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/lab-technicians" element={<LabTechnicians />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/test-catalogs" element={<TestCatalogs />} />
          <Route path="/settings" element={<Settings />} />

        </Routes>
);

export default LabRoutes;
