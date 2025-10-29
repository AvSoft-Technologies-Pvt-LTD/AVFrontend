import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Heart, FileText, FlaskRound as Flask, Pill, Stethoscope, Eye, Save, Printer, User, Phone, Mail, Calendar, Menu, X, ChevronLeft,
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import VitalsForm from './VitalsForm';
import ClinicalNotesForm from './ClinicalNotesForm';
import LabTestsForm from './LabResultsForm';
import EyeTestForm from './EyeTestForm';
import DentalForm from './DentalForm';
import PrescriptionForm from './PrescriptionForm';
import QuickLinksPanel from './QuickLinksPanel';
import SignatureCanvas from "react-signature-canvas";
import AVLogo from "../../../../assets/AV.png";
import VitalsChart from './VitalsChart';

const formTypes = {
  all: { id: 'all', name: 'All', icon: null, color: 'from-[var(--primary-color)] to-[var(--accent-color)]', description: 'Show all forms together' },
  vitals: { id: 'vitals', name: 'Vital Signs', icon: Heart, color: 'from-[var(--primary-color)] to-[var(--accent-color)]', description: 'Heart rate, temperature, blood pressure' },
  prescription: { id: 'prescription', name: 'Prescription', icon: Pill, color: 'from-[var(--primary-color)] to-[var(--accent-color)]', description: 'Medications and dosage instructions' },
  clinical: { id: 'clinical', name: 'Clinical Notes', icon: FileText, color: 'from-[var(--primary-color)] to-[var(--accent-color)]', description: 'Chief complaint, history, advice' },
  lab: { id: 'lab', name: 'Lab Tests', icon: Flask, color: 'from-[var(--primary-color)] to-[var(--accent-color)]', description: 'Laboratory test orders and results' },
  dental: { id: 'dental', name: 'Dental Exam', icon: Stethoscope, color: 'from-[var(--primary-color)] to-[var(--accent-color)]', description: 'Dental examination and treatment' },
  eye: { id: 'eye', name: 'Eye Test', icon: Eye, color: 'from-[var(--primary-color)] to-[var(--accent-color)]', description: 'Vision and eye health advice' },
};

const thStyle = 'border:1px solid #ddd;padding:10px;background:#f8f9fa;text-align:left;font-weight:bold;';
const tdStyle = 'border:1px solid #ddd;padding:10px;background:#fff;';
const tableStyle = 'width:100%;border-collapse:collapse;margin-top:10px;';

const ChartModal = ({ isOpen, onClose, vital, records, selectedIdx }) => {
  const [chartType, setChartType] = React.useState('bar');
  const vitalRanges = {
    heartRate: { min: 60, max: 100, label: "bpm", name: "Heart Rate", optimal: 70 },
    temperature: { min: 36.1, max: 37.2, label: "°C", name: "Temperature", optimal: 36.5 },
    bloodSugar: { min: 70, max: 140, label: "mg/dL", name: "Blood Sugar", optimal: 90 },
    bloodPressure: { min: 90, max: 120, label: "mmHg", name: "Blood Pressure", optimal: 110 },
    height: { min: 100, max: 220, label: "cm", name: "Height", optimal: 170 },
    weight: { min: 30, max: 200, label: "kg", name: "Weight", optimal: 70 },
  };
  const chartTypes = [
    { id: 'bar', name: 'Bar Chart', icon: '📊' },
    { id: 'line', name: 'Line Chart', icon: '📈' },
    { id: 'area', name: 'Area Chart', icon: '🌄' },
    { id: 'pie', name: 'Pie Chart', icon: '🥧' },
    { id: 'radar', name: 'Radar Chart', icon: '🕸️' }
  ];
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40  animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-3xl relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
        >
          <X className="w-5 h-5" />
        </button>
        <h3 className="h4-heading mb-4">
          {vital
            ? `${vital.replace(/([A-Z])/g, " $1").replace(/^./, c => c.toUpperCase())} Chart (7 Days)`
            : "Vitals Chart & Records (7 Days)"}
        </h3>
        {/* Chart Type Selector */}
        <div className="flex flex-wrap gap-2 mb-4 border-b border-gray-200 pb-3">
          {chartTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setChartType(type.id)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                chartType === type.id
                  ? 'bg-[var(--primary-color)] text-white'
                  : 'bg-gray-100 text-[var(--primary-color)] hover:bg-gray-200'
              }`}
            >
              <span>{type.icon}</span>
              <span>{type.name}</span>
            </button>
          ))}
        </div>
        <div className="h-96 flex flex-col w-full">
          <VitalsChart
            vital={vital}
            records={records}
            selectedIdx={selectedIdx}
            range={vitalRanges[vital]}
            chartType={chartType}
          />
        </div>
      </div>
    </div>
  );
};

function App() {
  const location = useLocation();
  const patient = location.state?.patient || { name: "Unknown Patient", email: "unknown@example.com", phone: "N/A", age: "N/A", gender: "N/A", diagnosis: "N/A" };
  const [activeForm, setActiveForm] = useState('all');
  const [formsData, setFormsData] = useState({});
  const [doctorSignature, setDoctorSignature] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showPatientDetails, setShowPatientDetails] = useState(true);
  const [isChartOpen, setIsChartOpen] = useState(false);
  const [chartVital, setChartVital] = useState(null);
  const signaturePadRef = useRef();

  useEffect(() => { const storedSignature = localStorage.getItem('doctorSignature'); if (storedSignature) setDoctorSignature(storedSignature); }, []);

  const calculateAge = dob => { if (!dob) return "N/A"; const today = new Date(); const birthDate = new Date(dob); let age = today.getFullYear() - birthDate.getFullYear(); const monthDiff = today.getMonth() - birthDate.getMonth(); if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--; return age; };
  const getPatientName = () => patient.name || `${patient.firstName || ""} ${patient.middleName || ""} ${patient.lastName || ""}`.trim() || "Unknown Patient";
  const getPatientAge = () => (patient.age && patient.age !== "N/A" ? patient.age : calculateAge(patient.dob));
  const handleSignatureUpload = e => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onload = ({ target }) => { if (target?.result) { setDoctorSignature(target.result); localStorage.setItem('doctorSignature', target.result); } }; reader.readAsDataURL(file); } };
  const handleClearSignature = () => { if (signaturePadRef.current) signaturePadRef.current.clear(); setDoctorSignature(null); };
  const getStyledPrescriptionHTML = (doctor, patient, signature, logoUrl, formContent) => {
    return `
      <div style="width:800px;font-family:'Poppins',sans-serif;padding:40px;box-sizing:border-box;border:2px solid #0e1630;background:#fff;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div>
            <h1 style="margin:0;font-size:24px;border-bottom:3px solid #01D48C;color:#0e1630;">${doctor.name}</h1>
            <p style="margin:2px 0;font-size:14px;color:#0e1630;">${doctor.qualifications}</p>
            <p style="margin:2px 0;font-size:14px;color:#0e1630;">${doctor.specialization}</p>
          </div>
          <div style="width:80px;height:80px;border-radius:8px;display:flex;align-items:center;justify-content:center;">
            <img src="${AVLogo}" alt="AV Logo" style="width:100%; height:100%; border-radius:8px; object-fit:cover;" />
          </div>
        </div>
        <div style="margin-top:20px;padding:16px 24px;border-radius:8px;background:linear-gradient(to right,#f9f9f9,#f1f1f1);">
          <div style="display:flex;flex-direction:row;justify-content:space-between;align-items:center;font-size:16px;color:#0e1630;gap:32px;">
            <div style="display:flex;flex-direction:row;gap:32px;width:100%;justify-content:space-between;">
              <div><strong style="border-bottom:1px solid #01D48C;">Name:</strong> ${patient?.firstName || patient?.lastName ? `${patient?.firstName || ""} ${patient?.middleName || ""} ${patient?.lastName || ""}`.trim() : patient?.name || "N/A"}</div>
              <div><strong style="border-bottom:1px solid #01D48C;">Age:</strong> ${patient?.age && patient?.age !== "N/A" ? patient.age : patient?.dob ? (() => { const today = new Date(); const birthDate = new Date(patient.dob); let age = today.getFullYear() - birthDate.getFullYear(); const m = today.getMonth() - birthDate.getMonth(); if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) { age--; } return age; })() : "N/A"}</div>
              <div><strong style="border-bottom:1px solid #01D48C;">Gender:</strong> ${patient?.gender || "N/A"}</div>
              <div><strong style="border-bottom:1px solid #01D48C;">Contact:</strong> ${patient?.phone || "N/A"}</div>
            </div>
          </div>
        </div>
        <div style="position:relative;margin:20px 0;">
          <div style="position:relative;z-index:1;">${formContent || "<p>No content available.</p>"}</div>
        </div>
        <div style="margin-top:40px;width:100%;height:100px;background:linear-gradient(to right,#f9f9f9,#f1f1f1);border-top:3px solid #0e1630;display:flex;align-items:center;justify-content:space-between;padding:0 40px;box-sizing:border-box;box-shadow:0 -2px 6px rgba(0,0,0,0.05);">
          <div style="display:flex;align-items:center;">
            <div style="width:80px;height:80px;border-radius:8px;display:flex;align-items:center;justify-content:center;margin-right:30px;">
              <img src="${AVLogo}" alt="AV Logo" style="width:100%; height:100%; border-radius:8px; object-fit:cover; " />
            </div>
            <div style="color:#1696c9;font-size:14px;line-height:1.5;">
              <div style="display:inline"><span style="display:inline-flex;align-items:center;gap:6px;color:#0e1630;font-size:16px;"><svg width="18" height="18" fill="#01D48C" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg> Dharwad, Karnataka, 580001</span><br/><span style="display:inline-flex;align-items:center;gap:6px;color:#0e1630;font-size:16px;"><svg width="18" height="18" fill="#01D48C" viewBox="0 0 24 24"><path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.21c1.21.49 2.53.76 3.88.76a1 1 0 011 1V20a1 1 0 01-1 1C10.07 21 3 13.93 3 5a1 1 0 011-1h3.5a1 1 0 011 1c0 1.35.27 2.67.76 3.88a1 1 0 01-.21 1.11l-2.2 2.2z"/></svg> +12-345 678 9012</span></div>
            </div>
          </div>
          <div style="text-align:right;">
            ${signature ? `<img src="${signature}" alt="Signature" style="height:48px;margin-bottom:2px;" />` : '<div style="height:48px;"></div>'}
            <div style="width:160px;margin-left:auto;font-size:16px;color:#444;padding-top:4px;border-top:2px solid #0e1630;">Doctor's Signature</div>
          </div>
        </div>
      </div>
    `;
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

    const header = getStyledPrescriptionHTML(
      doctor,
      patient,
      doctorSignature,
      AVLogo,
      formContent
    );
    const win = window.open("", "", "width=900,height=700");
    win.document.write(`
      <html>
        <head>
          <title>Print Form</title> 
          <style>body { font-family: 'Poppins', sans-serif; }</style>
        </head>
        <body>${header}</body>
      </html>
    `);
    win.document.close();
    win.focus();
  };
  const printAllForms = () => {
    const doctor = {
      name: "Dr. Sheetal S. Shelke",
      specialization: "Neurologist",
      regNo: "MH123456",
      qualifications: "MBBS, MD",
    };

    const formsHtml = Object.keys(formsData)
      .filter(
        (formType) =>
          formsData[formType] && Object.keys(formsData[formType]).length > 0
      )
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
      .join('<div class="page-break"></div>');

    if (!formsHtml) {
      return toast.error("No forms with data to print.");
    }

    const header = getStyledPrescriptionHTML(
      doctor,
      patient,
      doctorSignature,
      "",
      formsHtml
    );
    const win = window.open("", "", "width=900,height=700");
    win.document.write(`
      <html>
        <head>
          <title>Print All Forms</title>
          <style>
            body { font-family: 'Poppins', sans-serif; }
            .page-break { page-break-after: always; }
          </style>
        </head>
        <body>${header}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    toast.success("✅ All forms printed successfully!", {
      position: "top-right",
      autoClose: 2000,
    });
  };
  const handleSaveForm = (formType, data) => {
    setFormsData(prev => ({
      ...prev,
      [formType]: data,
    }));
    localStorage.setItem(
      "medicalForms",
      JSON.stringify({
        ...formsData,
        [formType]: data,
      })
    );
  };
  const commonProps = { onSave: handleSaveForm, onPrint: handlePrintForm, patient, setIsChartOpen, setChartVital };
  const renderActiveForm = () => activeForm === 'all' ? (
    <div className="space-y-8 animate-slideIn">
      <VitalsForm data={formsData.vitals} {...commonProps} />
      <PrescriptionForm data={formsData.prescription} {...commonProps} />
      <ClinicalNotesForm data={formsData.clinical} {...commonProps} />
      <LabTestsForm data={formsData.lab} {...commonProps} />
      <EyeTestForm data={formsData.eye} {...commonProps} />
      <DentalForm data={formsData.dental} {...commonProps} />
    </div>
  ) : ({
    vitals: <VitalsForm data={formsData.vitals} {...commonProps} />,
    prescription: <PrescriptionForm data={formsData.prescription} {...commonProps} />,
    clinical: <ClinicalNotesForm data={formsData.clinical} {...commonProps} />,
    lab: <LabTestsForm data={formsData.lab} {...commonProps} />,
    eye: <EyeTestForm data={formsData.eye} {...commonProps} />,
    dental: <DentalForm data={formsData.dental} {...commonProps} />,
  }[activeForm] || null);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          {/* --- PATIENT DETAILS SECTION START --- */}
{showPatientDetails && (
  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100 mb-4 animate-fadeIn">
    
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 w-full">
      
      {/* LEFT: Avatar + Info Section */}
      <div className="flex items-center gap-6 flex-wrap w-full lg:w-auto">
        
        {/* Avatar */}
        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-[var(--primary-color)] to-[var(--accent-color)] text-white text-sm font-bold shadow-lg">
          {getPatientName()?.split(' ').map(n => n[0]).join('') || 'N/A'}
        </div>

        {/* Name + Email + Details */}
        <div className="flex flex-col gap-1 min-w-0">
          {/* Name + Email */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 truncate">{getPatientName()}</h2>
            <div className="flex items-center gap-2 text-sm text-[var(--accent-color)] truncate">
              <Mail className="w-4 h-4" />
              <span className="truncate">{patient?.email || 'N/A'}</span>
            </div>
          </div>

          {/* Contact + Age + Gender + Diagnosis (inline row) */}
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm pt-1">
            <div className="flex items-center gap-1">
              <Phone className="w-4 h-4 text-[var(--accent-color)]" />
              <span><strong>Contact:</strong> {patient?.phone || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="w-4 h-4 text-[var(--accent-color)]" />
              <span><strong>Age:</strong> {getPatientAge()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-[var(--accent-color)]" />
              <span><strong>Gender:</strong> {patient?.gender || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-1">
              <FileText className="w-4 h-4 text-[var(--accent-color)]" />
              <span><strong>Diagnosis:</strong> {patient?.diagnosis || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: Quick Links Panel */}
      <div className="w-full lg:w-auto mt-4 lg:mt-0">
        <QuickLinksPanel
          patientId={patient?.id}
          setActiveForm={setActiveForm}
          patient={patient}
        />
      </div>
    </div>
  </div>
)}


          {/* --- PATIENT DETAILS SECTION END --- */}
          {!showPatientDetails && (
            <div className="mb-4">
             
            </div>
          )}
         <div className="flex flex-wrap gap-2 mt-4 items-center justify-between md:justify-start">
  <div className="flex flex-wrap gap-2">
    {Object.values(formTypes).map(formType => {
      const Icon = formType.icon;
      const isActive = activeForm === formType.id;
      return (
        <button
          key={formType.id}
          onClick={() => setActiveForm(formType.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 
            ${isActive
              ? 'bg-[var(--primary-color)] text-white shadow'
              : 'bg-white text-[var(--primary-color)] border border-gray-300 hover:bg-gray-50'
            }`}
        >
         {Icon && <Icon className="w-4 h-4" />}
          {formType.name}
        </button>
      );
    })}
  </div>
  <button
    className="flex items-center gap-2 px-5 py-2 rounded-md bg-[var(--primary-color)] text-white text-sm font-semibold hover:shadow-lg border border-[var(--accent-color)]"
    onClick={printAllForms}
  >
    <Printer className="w-4 h-4" />
    Print All
  </button>
</div>

          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 animate-slideIn">
              <div className="grid grid-cols-2 gap-2">
              {Object.values(formTypes).map(formType => {
  const Icon = formType.icon;
  const isActive = activeForm === formType.id;
  return (
    <button
      key={formType.id}
      onClick={() => setActiveForm(formType.id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 
        ${isActive
          ? 'bg-[var(--primary-color)] text-white shadow'
          : 'bg-white text-[var(--primary-color)] border border-gray-300 hover:bg-gray-50'
        }`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {formType.name}
    </button>
  );
})}

              </div>
            </div>
          )}
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">{renderActiveForm()}</div>
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 animate-fadeIn">
          <h3 className="h3-heading mb-6">Digital Signature</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--primary-color)] mb-2">Upload Signature:</label>
                <input type="file" accept="image/*" onChange={handleSignatureUpload} className="input-field" />
              </div>
              {doctorSignature && (
                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-sm font-medium text-blue-800">Preview:</span>
                  <img src={doctorSignature} alt="Doctor's Signature" className="h-12 border border-blue-300 rounded shadow-sm" />
                </div>
              )}
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-[var(--primary-color)]">Or Draw Signature:</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <SignatureCanvas ref={signaturePadRef} canvasProps={{ width: 400, height: 100, className: "border border-gray-300 rounded-lg shadow-sm w-full bg-white" }} />
              </div>
              <div className="flex gap-3">
                <button className="btn btn-primary"><Save className="w-4 h-4" />Save</button>
                <button onClick={handleClearSignature} className="btn-secondary"><X className="w-4 h-4" />Clear</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Modal */}
      <ChartModal
        isOpen={isChartOpen}
        onClose={() => setIsChartOpen(false)}
        vital={chartVital}
        records={formsData.vitals?.vitalsRecords || []}
        selectedIdx={null}
      />

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
    </div>
    
  );
}

const getVitalsTemplate = (d) => `
  <h4 style="color:#16a085;">Vitals Report</h4>
  <table style="${tableStyle}">
    <thead><tr>
      <th style="${thStyle}">Heart Rate</th><th style="${thStyle}">Temperature</th><th style="${thStyle}">Blood Sugar</th>
      <th style="${thStyle}">Blood Pressure</th><th style="${thStyle}">Height</th><th style="${thStyle}">Weight</th>
    </tr></thead>
    <tbody><tr>
      <td style="${tdStyle}">${d.heartRate||'-'}</td><td style="${tdStyle}">${d.temperature||'-'}</td>
      <td style="${tdStyle}">${d.bloodSugar||'-'}</td><td style="${tdStyle}">${d.bloodPressure||'-'}</td>
      <td style="${tdStyle}">${d.height||'-'}</td><td style="${tdStyle}">${d.weight||'-'}</td>
    </tr></tbody>
  </table>`;


const getClinicalNotesTemplate = (d) => `
  <h4 style="color:#2980b9;">Clinical Notes</h4>
  <table style="${tableStyle}">
    <thead><tr>
      <th style="${thStyle}">Chief Complaint</th><th style="${thStyle}">History</th>
      <th style="${thStyle}">Advice</th><th style="${thStyle}">Plan</th>
    </tr></thead>
    <tbody><tr>
      <td style="${tdStyle}">${d.chiefComplaint||'-'}</td><td style="${tdStyle}">${d.history||'-'}</td>
      <td style="${tdStyle}">${d.advice||'-'}</td><td style="${tdStyle}">${d.plan||'-'}</td>
    </tr></tbody>
  </table>`;


const getLabResultsTemplate = (d) => `
  <h4 style="color:#8e44ad;">Lab Results</h4>
  <table style="${tableStyle}">
    <thead><tr>
      <th style="${thStyle}">Test Name</th><th style="${thStyle}">Code</th><th style="${thStyle}">Instructions</th>
    </tr></thead>
    <tbody>
      ${(d.selectedTests||[]).map(t=>`
        <tr>
          <td style="${tdStyle}">${t.name||'-'}</td>
          <td style="${tdStyle}">${t.code||'-'}</td>
          <td style="${tdStyle}">${t.instructions||'-'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>`;


const getDentalTemplate = (d) => `
  <h4 style="color:#e67e22;">Dental Problem Action Plan</h4>
  <table style="${tableStyle}">
    <thead><tr>
      <th style="${thStyle}">Teeth Numbers</th><th style="${thStyle}">Problems</th>
      <th style="${thStyle}">Action Plans</th><th style="${thStyle}">Positions</th>
    </tr></thead>
    <tbody>
      ${(d.plans||[]).map(p=>`
        <tr>
          <td style="${tdStyle}">${(p.teeth||[]).join(', ')||'-'}</td>
          <td style="${tdStyle}">${(p.problems||[]).join(', ')||'-'}</td>
          <td style="${tdStyle}">${(p.actions||[]).join(', ')||'-'}</td>
          <td style="${tdStyle}">${(p.positions||[]).join(', ')||'-'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>`;
;

const getEyeTestTemplate = (d) => `
  <h4 style="color:#1976d2;background:#e3f2fd;padding:10px 16px;border-radius:8px;">Eye Test Report</h4>
  <table style="${tableStyle}">
    <thead><tr>
      <th style="${thStyle}">Test Date</th><th style="${thStyle}">Vision Type</th><th style="${thStyle}">Eye</th>
      <th style="${thStyle}">SPH</th><th style="${thStyle}">CYL</th><th style="${thStyle}">V/A</th>
      <th style="${thStyle}">AXIS</th><th style="${thStyle}">Prev.VA</th><th style="${thStyle}">Remarks</th><th style="${thStyle}">Product</th>
    </tr></thead>
    <tbody>
      ${(d.rows||[]).map(r=>`
        <tr>
          <td style="${tdStyle}">${r.testDate||'-'}</td><td style="${tdStyle}">${r.visionType||'-'}</td><td style="${tdStyle}">Right Eye</td>
          <td style="${tdStyle}">${r.od_sph||'-'}</td><td style="${tdStyle}">${r.od_cyl||'-'}</td><td style="${tdStyle}">${r.od_va||'-'}</td>
          <td style="${tdStyle}">${r.od_axis||'-'}</td><td style="${tdStyle}">${r.od_prev_va||'-'}</td>
          <td style="${tdStyle}">${r.remarks||'-'}</td><td style="${tdStyle}">${r.product||'-'}</td>
        </tr>
        <tr>
          <td style="${tdStyle}">${r.testDate||'-'}</td><td style="${tdStyle}">${r.visionType||'-'}</td><td style="${tdStyle}">Left Eye</td>
          <td style="${tdStyle}">${r.os_sph||'-'}</td><td style="${tdStyle}">${r.os_cyl||'-'}</td><td style="${tdStyle}">${r.os_va||'-'}</td>
          <td style="${tdStyle}">${r.os_axis||'-'}</td><td style="${tdStyle}">${r.os_prev_va||'-'}</td>
          <td style="${tdStyle}">${r.remarks||'-'}</td><td style="${tdStyle}">${r.product||'-'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>`;


const getPrescriptionTemplate = (prescriptions=[]) => {
  const rows = prescriptions.map(m=>({...m,eye:/left eye/i.test(m.drugName)?'Left Eye':/right eye/i.test(m.drugName)?'Right Eye':''}));
  return `
    <h4 style="color:#2980b9;">Prescription</h4>
    <table style="${tableStyle}">
      <thead><tr>
        <th style="${thStyle}">Medicine</th><th style="${thStyle}">Dosage</th><th style="${thStyle}">Frequency</th>
        <th style="${thStyle}">Intake</th><th style="${thStyle}">Duration</th>
      </tr></thead>
      <tbody>
        ${rows.map(m=>`
          <tr>
            <td style="${tdStyle}">${m.drugName||'-'}</td><td style="${tdStyle}">${m.dosage||'-'}</td>
            <td style="${tdStyle}">${m.frequency||'-'}</td><td style="${tdStyle}">${m.intake||'-'}</td>
            <td style="${tdStyle}">${m.duration||'-'} day(s)</td>
          </tr>
        `).join('')}
      </tbody>
    </table>`;
};
export default App;