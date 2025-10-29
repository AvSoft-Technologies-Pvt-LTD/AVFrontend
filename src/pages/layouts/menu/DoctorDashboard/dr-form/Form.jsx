// File: Form.jsx
import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Printer } from "lucide-react";
import VitalsForm from "./VitalsForm";
import ClinicalNotesForm from "./ClinicalNotesForm";
import LabTestsForm from "./LabResultsForm";
import EyeTestForm from "./EyeTestForm";
import DentalForm from "./DentalForm";
import PrescriptionForm from "./PrescriptionForm";
import SignatureArea from "./SignatureArea";
import ShareModalContent from "./ShareModalContent";
import { ChartModal } from "./VitalsChart";
import Header from "./Header";
import {
  getVitalsTemplate,
  getClinicalNotesTemplate,
  getLabResultsTemplate,
  getDentalTemplate,
  getEyeTestTemplate,
  getPrescriptionTemplate,
} from "./templates";
import AVLogo from "../../../../../assets/AV.png";

const getStyledPrescriptionHTML = (doctor = {}, patient = {}, signature = null, logoUrl = "", formContent = "") => {
  const safeLogo = logoUrl || "";
  const patientName = patient?.firstName || patient?.name || "N/A";
  const patientAge = patient?.age || "N/A";
  const patientGender = patient?.gender || "N/A";
  const patientContact = patient?.phone || "N/A";
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Print - ${doctor.name || "Doctor"}</title>
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap" rel="stylesheet">
    <style>
      html,body { margin:0; padding:0; background:#fff; -webkit-print-color-adjust:exact; color:#222; }
      body { font-family: 'Poppins', sans-serif; padding: 20px; box-sizing: border-box; }
      .container { width:800px; margin:0 auto; box-sizing:border-box; }
      .card { padding: 28px; border: 2px solid #0e1630; background: #fff; border-radius: 6px; box-sizing:border-box; }
      .header { display:flex; justify-content:space-between; align-items:center; gap:20px; }
      .doc-info h1 { margin:0; font-size:24px; color:#0e1630; border-bottom:3px solid #01D48C; padding-bottom:4px; }
      .doc-info p { margin:3px 0; font-size:13px; color:#0e1630; }
      .logo { width:80px; height:80px; object-fit:cover; border-radius:8px; }
      .patient-box { margin-top:18px; padding:12px 16px; background:linear-gradient(to right,#f9f9f9,#f1f1f1); border-radius:6px; display:flex; justify-content:space-between; gap:12px; font-size:14px; color:#0e1630; }
      table { width:100%; border-collapse:collapse; margin-top:12px; font-size:13px; }
      th, td { border:1px solid #ddd; padding:8px; text-align:left; vertical-align:top; }
      th { background:#f8f9fa; font-weight:600; }
      .footer { margin-top:28px; display:flex; justify-content:space-between; align-items:center; gap:20px; padding:14px; background:linear-gradient(to right,#f9f9f9,#f1f1f1); border-top:3px solid #0e1630; }
      .footer .left { display:flex; align-items:center; gap:16px; }
      .footer .left .logo-small { width:80px; height:80px; border-radius:8px; object-fit:cover; }
      .signature { text-align:right; }
      .signature img { height:48px; display:block; margin:0 0 6px auto; }
      .section-title { font-size:16px; color:#0E1630; margin:8px 0; font-weight:600; }
      @media print {
        body { padding:0; }
        .container { width:100%; }
        .card { border:none; padding:10px; }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="card">
        <div class="header">
          <div class="doc-info">
            <h1>${doctor.name || ""}</h1>
            <p>${doctor.qualifications || ""}</p>
            <p>${doctor.specialization || ""}</p>
          </div>
          <div>
            ${safeLogo ? `<img src="${safeLogo}" class="logo" alt="logo" />` : ''}
          </div>
        </div>
        <div class="patient-box" style="margin-top:18px;">
          <div><strong>Name:</strong> ${patientName}</div>
          <div><strong>Age:</strong> ${patientAge}</div>
          <div><strong>Gender:</strong> ${patientGender}</div>
          <div><strong>Contact:</strong> ${patientContact}</div>
        </div>
        <div class="content" style="margin-top:18px;">
          ${formContent || '<p>No content available</p>'}
        </div>
        <div class="footer">
          <div class="left">
            ${safeLogo ? `<img src="${safeLogo}" class="logo-small" alt="logo" />` : ''}
            <div style="font-size:14px;color:#0e1630;line-height:1.3;">
              <div>Dharwad, Karnataka, 580001</div>
              <div>+12-345 678 9012</div>
            </div>
          </div>
          <div class="signature">
            ${signature ? `<img src="${signature}" alt="signature" />` : '<div style="height:48px;"></div>'}
            <div style="margin-top:6px;border-top:2px solid #0e1630;padding-top:6px;width:160px;margin-left:auto;font-size:16px;color:#444;">Doctor's Signature</div>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>
`;
};

const makeAbsoluteUrl = (p) => {
  if (!p) return "";
  if (typeof p !== "string") return "";
  if (p.startsWith("http") || p.startsWith("data:")) return p;
  try {
    const origin = typeof window !== "undefined" && window.location ? window.location.origin : "";
    return p.startsWith("/") ? `${origin}${p}` : `${origin}/${p}`;
  } catch {
    return p;
  }
};

const formTypes = {
  all: { id: "all", name: "All" },
  template: { id: "template", name: "Case" },
  vitals: { id: "vitals", name: "Vital Signs" },
  prescription: { id: "prescription", name: "Prescription" },
  clinical: { id: "clinical", name: "Clinical Notes" },
  lab: { id: "lab", name: "Lab Tests" },
  dental: { id: "dental", name: "Dental Exam" },
  eye: { id: "eye", name: "Eye Test" },
};

const Form = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const patient = location.state?.patient || {
    name: "Unknown Patient",
    email: "unknown@example.com",
    phone: "N/A",
    age: "N/A",
    gender: "N/A",
    diagnosis: "N/A",
    wardType: "N/A",
  };
  const [annotatedImages, setAnnotatedImages] = useState(location.state?.annotatedImages || []);
  const [activeForm, setActiveForm] = useState("all");
  const [formsData, setFormsData] = useState({});
  const [doctorSignature, setDoctorSignature] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showPatientDetails, setShowPatientDetails] = useState(true);
  const [isChartOpen, setIsChartOpen] = useState(false);
  const [chartVital, setChartVital] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showMoreForms, setShowMoreForms] = useState(false);
  const signaturePadRef = useRef();
  const printWindowRef = useRef(null);
  const isIPDPatient = (patient?.type || "").toLowerCase() === "ipd";

  const calculateAge = (dob) => {
    if (!dob) return "N/A";
    try {
      const today = new Date();
      const birthDate = new Date(dob);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
      return age;
    } catch {
      return "N/A";
    }
  };

  const getPatientName = () =>
    patient.name ||
    `${patient.firstName || ""} ${patient.middleName || ""} ${patient.lastName || ""}`.trim() ||
    "Unknown Patient";

  const getPatientAge = () => (patient.age && patient.age !== "N/A" ? patient.age : calculateAge(patient.dob));

  const getCombinedWardInfo = () => {
    if (!isIPDPatient) return "N/A";
    const wardType = patient?.wardType || "";
    const wardNo = patient?.wardNo || patient?.wardNumber || "";
    const bedNo = patient?.bedNo || patient?.bedNumber || "";
    if (wardType && wardNo && bedNo) return `${wardType}-${wardNo}-${bedNo}`;
    if (wardType) return wardType;
    return "N/A";
  };

  const handleBackToPatients = () => navigate("/doctordashboard/patients");

  const handleSignatureUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ({ target }) => {
      if (target?.result) {
        setDoctorSignature(target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleClearSignature = () => {
    if (signaturePadRef.current) signaturePadRef.current.clear();
    setDoctorSignature(null);
  };

  const handleSaveSignature = () => {
    if (signaturePadRef.current) {
      const signatureData = signaturePadRef.current.toDataURL();
      setDoctorSignature(signatureData);
    }
  };

  const handleSaveForm = (formType, data) => {
    setFormsData((prev) => ({ ...prev, [formType]: data }));
  };

  const handleFormTypeClick = (formType) => {
    if (formType === "template") {
      navigate("/doctordashboard/template", { state: { patient, annotatedImages, from: "form" } });
    } else {
      setActiveForm(formType);
    }
  };

  const handlePrintForm = (formType) => {
    const data = formsData[formType];
    if (!data) return;
    const doctor = {
      name: "Dr. Sheetal S. Shelke",
      specialization: "Neurologist",
      regNo: "MH123456",
      qualifications: "MBBS, MD",
    };
    let formContent = "";
    switch (formType) {
      case "vitals":
        formContent = getVitalsTemplate(data);
        break;
      case "clinical":
        formContent = getClinicalNotesTemplate(data);
        break;
      case "lab":
        formContent = getLabResultsTemplate(data);
        break;
      case "prescription":
        formContent = getPrescriptionTemplate(data.prescriptions || []);
        break;
      case "dental":
        formContent = getDentalTemplate(data);
        break;
      case "eye":
        formContent = getEyeTestTemplate(data);
        break;
      default:
        formContent = "<p>No content available for this form.</p>";
    }
    const logoUrl = makeAbsoluteUrl(AVLogo);
    const html = getStyledPrescriptionHTML(doctor, patient, doctorSignature, logoUrl, formContent);
    if (printWindowRef.current && !printWindowRef.current.closed) printWindowRef.current.close();
    printWindowRef.current = window.open("", "_blank", "width=900,height=700,scrollbars=yes");
    if (!printWindowRef.current) return;
    try {
      printWindowRef.current.document.open();
      printWindowRef.current.document.write(html);
      printWindowRef.current.document.close();
      printWindowRef.current.focus();
      setTimeout(() => {
        try {
          printWindowRef.current.print();
        } catch {}
      }, 500);
    } catch (e) {
      console.error("Print popup write error", e);
    }
  };

  const printAllForms = () => {
    const doctor = {
      name: "Dr. Sheetal S. Shelke",
      specialization: "Neurologist",
      regNo: "MH123456",
      qualifications: "MBBS, MD",
    };
    const formsHtml = Object.keys(formsData || {})
      .filter((formType) => formsData[formType] && Object.keys(formsData[formType]).length > 0)
      .map((formType) => {
        const data = formsData[formType];
        switch (formType) {
          case "vitals":
            return getVitalsTemplate(data);
          case "clinical":
            return getClinicalNotesTemplate(data);
          case "lab":
            return getLabResultsTemplate(data);
          case "dental":
            return getDentalTemplate(data);
          case "eye":
            return getEyeTestTemplate(data);
          case "prescription":
            return getPrescriptionTemplate(data.prescriptions || []);
          default:
            return "";
        }
      })
      .join("<div style='page-break-after: always;'></div>");
    if (!formsHtml) return;
    const logoUrl = makeAbsoluteUrl(AVLogo);
    const html = getStyledPrescriptionHTML(doctor, patient, doctorSignature, logoUrl, formsHtml);
    if (printWindowRef.current && !printWindowRef.current.closed) printWindowRef.current.close();
    printWindowRef.current = window.open("", "_blank", "width=1000,height=800,scrollbars=yes");
    if (!printWindowRef.current) return;
    try {
      printWindowRef.current.document.open();
      printWindowRef.current.document.write(html);
      printWindowRef.current.document.close();
      printWindowRef.current.focus();
      setTimeout(() => {
        try {
          printWindowRef.current.print();
        } catch {}
      }, 600);
    } catch (e) {
      console.error("Print all popup error", e);
    }
  };

  const commonProps = {
    onSave: handleSaveForm,
    onPrint: handlePrintForm,
    patient,
    setIsChartOpen,
    setChartVital,
  };

  const renderActiveForm = () => {
    if (activeForm === "all") {
      return (
        <div className="space-y-8 animate-slideIn">
          <VitalsForm data={formsData.vitals} {...commonProps} hospitalName="AV Hospital" ptemail={patient.email} />
          <PrescriptionForm data={formsData.prescription} {...commonProps} setShowShareModal={setShowShareModal} doctorName="Dr. Kavya Patil" />
          <ClinicalNotesForm data={formsData.clinical} {...commonProps} ptemail={patient.email} hospitalname="AV Hospital" drEmail="dr.sheetal@example.com" drname="Dr. Sheetal S. Shelke" patientname={getPatientName()} diagnosis={patient.diagnosis} type={patient.type} />
          <LabTestsForm data={formsData.lab} {...commonProps} hospitalName="AV Hospital" ptemail={patient.email} />
          <EyeTestForm data={formsData.eye} {...commonProps} />
          <DentalForm data={formsData.dental} {...commonProps} />
        </div>
      );
    }
    return (
      <div className="space-y-8 animate-slideIn">
        {{
          vitals: <VitalsForm data={formsData.vitals} {...commonProps} hospitalName="AV Hospital" ptemail={patient.email} />,
          prescription: <PrescriptionForm data={formsData.prescription} {...commonProps} setShowShareModal={setShowShareModal} doctorName="Dr. Kavya Patil" />,
          clinical: <ClinicalNotesForm data={formsData.clinical} {...commonProps} ptemail={patient.email} hospitalname="AV Hospital" drEmail="dr.sheetal@example.com" drname="Dr. Sheetal S. Shelke" patientname={getPatientName()} diagnosis={patient.diagnosis} type={patient.type} />,
          lab: <LabTestsForm data={formsData.lab} {...commonProps} hospitalName="AV Hospital" ptemail={patient.email} />,
          eye: <EyeTestForm data={formsData.eye} {...commonProps} />,
          dental: <DentalForm data={formsData.dental} {...commonProps} />,
        }[activeForm] || null}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 flex flex-col">
        <Header
          patient={patient}
          activeForm={activeForm}
          setActiveForm={handleFormTypeClick}
          printAllForms={printAllForms}
          getPatientName={() => getPatientName()}
          getPatientAge={() => getPatientAge()}
          getCombinedWardInfo={() => getCombinedWardInfo()}
          isIPDPatient={isIPDPatient}
          showPatientDetails={showPatientDetails}
          setShowPatientDetails={setShowPatientDetails}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          onBack={handleBackToPatients}
        />
        <div className="flex-1 min-w-0 max-w-7xl mx-auto px-4 sm:px-6 pt-16 sm:py-8 w-full">
          <div className="mb-6 sm:mb-8">{renderActiveForm()}</div>
          <SignatureArea
            signaturePadRef={signaturePadRef}
            doctorSignature={doctorSignature}
            setDoctorSignature={setDoctorSignature}
            onSaveSignature={handleSaveSignature}
            onClearSignature={handleClearSignature}
            onUploadSignature={handleSignatureUpload}
          />
        </div>
      </div>
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <ShareModalContent onClose={() => setShowShareModal(false)} prescriptions={formsData.prescription?.prescriptions || []} patient={patient} />
        </div>
      )}
      <ChartModal isOpen={isChartOpen} onClose={() => setIsChartOpen(false)} vital={chartVital} records={formsData.vitals?.vitalsRecords || []} selectedIdx={null} />
    </div>
  );
};

export default Form;