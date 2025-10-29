import React from "react";
import { Route, Routes } from "react-router-dom";
import Appointments from "./Appointments";
import PatientList from "./PatientList";
import Settings from "./Settings";
import Payments from "./Payments";
import Overview from "./Overview";
import FormsPage from "./dr-form/Form";
// import StaffManagement from "./AdminModule";
import QuickLinksPanel from "./QuickLinksPanel";
import NotificationPage from "../../../../components/NotificationPage"; // Adjust the import path as needed
// import MedicalRecordsTemplate from "./MedicalRecordsTemplate";
// import BillingForm from "./BillingForm";
import MedicalRecordDetails from "./MedicalRecordDetails";
import MedicalRecords from "./MedicalRecords";
import SecondOpinion from "./SecondOpinion";
import NursingAndTreatment from "./NursingAndTreatment";
import GatePassModal from "./GatePassModal";
import DischargeModal from "./DischargeModal";


const DrRoutes = () => {
  return (
    <Routes>
      <Route index element={<Overview />} /> {/* renders at /doctordashboard */}
      <Route path="appointments" element={<Appointments />} />
      <Route path="patients" element={<PatientList />} />
        <Route path="/notifications" element={<NotificationPage />} />
       <Route path="form" element={<FormsPage />} />
       <Route path="second-opinion" element={<SecondOpinion/>} />
      <Route path="medical-record" element={<MedicalRecords/>} />
    <Route path="form/Nursing-and-treatment"element={<NursingAndTreatment />} />
      <Route path="form/Gate-pass" element={<GatePassModal />} />
	  <Route path="form/Discharge-modal" element={<DischargeModal />} />    
  


<Route path="medical-record-details" element={<MedicalRecordDetails/>} />
      <Route path="quicklinks" element={<QuickLinksPanel />} />
       {/* <Route path="dr-admin" element={<StaffManagement />} /> */}
     <Route path="billing" element={<Payments />} />
      <Route path="settings" element={<Settings />} />
      {/* <Route path="MedicalRecordsTemplate" element={<MedicalRecordsTemplate/>} /> */}
            {/* <Route path="add-billing" element={<BillingForm/>} /> */}


    </Routes>
  );
};
export default DrRoutes;