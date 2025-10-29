import React from "react";
import { Routes, Route } from "react-router-dom";
// Import Components
import Dashboard from "./Dashboard";
import ManageDoctors from "./ManageDoctors";
import DoctorManagement from "./AvDoctor";
import ManageHospital from "./ManageHospital";
import ManageLabs from "./ManageLabs";
import ManagePharmcies from "./ManagePharmcies";
import PatientManage from "./PatientManage";
import Settings from "./Settings";
  import Report from "./Report";
import Roles from "./Roles";
import Payments from "./Payments";
const AdminRoute = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="managepatients" element={<PatientManage />} />
      <Route path="manage-hospitals" element={<ManageHospital />} />
      <Route path="manage-labs" element={<ManageLabs />} />
      <Route path="manage-pharmacies" element={<ManagePharmcies />} />
      <Route path="manage-reports" element={<Report />} />
      <Route path="manage-roles" element={<Roles />} />
       <Route path="payments" element={<Payments />} />
      <Route path="settings" element={<Settings />} />
      {/* Nested Routes for Doctors */}
      <Route path="manage-doctors">
        <Route index element={<ManageDoctors />} />
        <Route path="avswasthya" element={<DoctorManagement />} />
      </Route>
    </Routes>
  );
};
export default AdminRoute;