import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import VitalsForm from "./VitalsForm";
import ClinicalNotesForm from "./ClinicalNotesForm";
import LabResultsForm from "./LabResultsForm";
import PrescriptionForm from "./PrescriptionForm";
import DentalForm from "./DentalForm";
import EyeTestForm from "./EyeTestForm";
import QuickLinksPanel from "./QuickLinksPanel";
import SignatureCanvas from "react-signature-canvas";
import { ToastContainer } from "react-toastify";

const FormPage = () => {
  const location = useLocation();
  const patient = location.state?.patient || { /* default patient data */ };
  const [activeForm, setActiveForm] = useState("all");
  const [formsData, setFormsData] = useState({ /* form data */ });
  const [doctorSignature, setDoctorSignature] = useState(null);
  const signaturePadRef = useRef();

  const handleSignatureUpload = (e) => {
    // Handle signature upload...
  };

  const handleSaveForm = (formType, data) => {
    // Save form data...
  };

  const renderActiveForm = () => {
    const commonProps = { data: formsData[activeForm], onSave: handleSaveForm };
    if (activeForm === "all") {
      return (
        <>
          <VitalsForm {...commonProps} />
          <ClinicalNotesForm {...commonProps} />
          <LabResultsForm {...commonProps} />
          <PrescriptionForm {...commonProps} />
          <DentalForm {...commonProps} />
          <EyeTestForm {...commonProps} />
        </>
      );
    }
    switch (activeForm) {
      case "vitals":
        return <VitalsForm {...commonProps} />;
      case "clinical":
        return <ClinicalNotesForm {...commonProps} />;
      case "lab":
        return <LabResultsForm {...commonProps} />;
      case "prescription":
        return <PrescriptionForm {...commonProps} />;
      case "dental":
        return <DentalForm {...commonProps} />;
      case "eye":
        return <EyeTestForm {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header and other components */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {renderActiveForm()}
      </div>
      <ToastContainer />
    </div>
  );
};

export default FormPage;
