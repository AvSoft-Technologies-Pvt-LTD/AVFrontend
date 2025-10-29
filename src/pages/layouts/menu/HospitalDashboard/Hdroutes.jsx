import React from "react";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import Departments from "./Departments";
import DoctorsStaffManagement from "./Doctor&StaffManagement";
import PatientManagement from "./PatientManagement";
import Labs from "./Labs";
import Pharmacy from "./Pharmacy";
import BillingPayments from "./BillingPayments";
import Settings from "./Settings";
import Emergency from "./Emergency";
import NotificationPage from "../../../../components/NotificationPage"; // Adjust the import path as needed
import Opd from "./Opd";
import OpdDashboard from "./OpdDashboard";
import Ipd from "./Ipd";
import FormsPage from "./Form";
import BedroomReport from "./BedroomReport";
const HospitalRoutes = () => (
  <Routes>
    <Route index element={<Dashboard />} />
        <Route path="/notifications" element={<NotificationPage />} />
    <Route path="departments" element={<Departments />} />
    <Route path="doctors-staff-management" element={<DoctorsStaffManagement />} />
    <Route path="patient-management" element={<PatientManagement />} />
    <Route path="labs" element={<Labs />} />
    <Route path="opd-list/*" element={<Opd />} />
    <Route path="opd-dashboard/:treatmentId/*" element={<OpdDashboard />}>
    </Route>
    <Route path="ipd" element={<Ipd />} />
    {/* Optional: Direct form route if you want to access /hospitaldashboard/form */}
    <Route path="form" element={<FormsPage />} />
<Route path="bedroom-report" element={<BedroomReport />} />
    <Route path="pharmacy" element={<Pharmacy />} />
    <Route path="billing-payments" element={<BillingPayments />} />
    <Route path="emergency" element={<Emergency />} />
    <Route path="/settings/*" element={<Settings />} />
  </Routes>
);
export default HospitalRoutes;