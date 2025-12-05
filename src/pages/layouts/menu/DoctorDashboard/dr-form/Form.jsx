import React, { useState, useEffect, useRef, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { usePatientContext } from "../../../../../context-api/PatientContext";
import { getSignatureActionsByContextId } from "../../../../../utils/masterService";
import { toast } from "react-toastify";
import { getDoctorById } from "../../../../../utils/masterService";
import DefaultLogo from "../../../../../assets/logo.png";
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

import { useSelector } from 'react-redux';

const getStyledPrescriptionHTML = (doctor = {}, patient = {}, signature = null, logoUrl = null, formContent = "") => {
  const patientName = patient?.firstName || patient?.name || "N/A";
  const patientGender = patient?.patientGender || patient?.gender || "N/A";
  const patientContact = patient?.patientPhoneNumber || patient?.phone || "N/A";
  const patientDOB = patient?.patientDateOfBirth || patient?.dateOfBirth || patient?.dob || "N/A";

  const formatAddress = (doc) => {
    if (!doc) return '';
    const parts = [
      doc.city && doc.city.trim() ? doc.city.trim() : null,
      doc.district && doc.district.trim() ? doc.district.trim() : null,
      doc.state && doc.state.trim() ? doc.state.trim() : null,
      doc.pincode && doc.pincode.trim() ? doc.pincode.trim() : null
    ].filter(Boolean);
    return parts.join(', ');
  };

  const doctorAddress = formatAddress(doctor);

  const calculateAge = (dob) => {
    if (!dob) return "N/A";
    try {
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age > 0 ? `${age} years` : "N/A";
    } catch (e) {
      return "N/A";
    }
  };

  const patientAge = patient?.age ? `${patient.age} years` : calculateAge(patientDOB);

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
      .logo { width:150px; height:150px; object-fit:contain; border-radius:6px; }
      .patient-box { margin-top:18px; padding:12px 16px; background:linear-gradient(to right,#f9f9f9,#f1f1f1); border-radius:6px; display:flex; justify-content:space-between; gap:12px; font-size:14px; color:#0e1630; }
      table { width:100%; border-collapse:collapse; margin-top:12px; font-size:13px; }
      th, td { border:1px solid #ddd; padding:8px; text-align:left; vertical-align:top; }
      th { background:#f8f9fa; font-weight:600; }
      .footer { margin-top:28px; display:flex; justify-content:space-between; align-items:center; gap:20px; padding:14px; background:linear-gradient(to right,#f9f9f9,#f1f1f1); border-top:3px solid #0e1630; }
      .footer .left { display:flex; align-items:center; gap:16px; }
      .footer .left .logo-small { width:120px; height:120px; object-fit:contain; border-radius:4px; }
      .signature { text-align:right; }
      .signature img { height:44px; display:block; margin:0 0 6px auto; }
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
          <div style="display: flex; align-items: center; margin-left: 10px;">
            <img src="${DefaultLogo}" class="logo" alt="logo" style="max-width: 100%; height: auto;" />
          </div>
        </div>
        <div class="patient-box" style="margin-top:18px;">
          <div>
            <span style="margin-right: 20px;"><strong>Name:</strong> ${patientName}</span>
            <span style="margin-right: 20px;"><strong>Age:</strong> ${patientAge}</span>
            <span style="margin-right: 20px;"><strong>Gender:</strong> ${patientGender}</span>
            <span><strong>Contact:</strong> ${patientContact}</span>
          </div>
        </div>
        <div class="content" style="margin-top:18px;">
          ${formContent || '<p>No content available</p>'}
        </div>
        <div class="footer">
          <div class="left" style="display: flex; align-items: center; gap: 16px;">
            <img src="${DefaultLogo}" class="logo-small" alt="logo" style="align-self: flex-start;" />
            <div style="font-size:14px;color:#0e1630;line-height:1.3; margin-top: 8px;">
              ${doctorAddress ? `<div>${doctorAddress}</div>` : ''}
              ${doctor.phone ? `<div>${doctor.phone}</div>` : ''}
              ${doctor.qualification ? `<div>${doctor.qualification}</div>` : ''}
            </div>
          </div>
          <div class="signature" style="display: flex; flex-direction: column; align-items: flex-end;">
            ${signature ? `
              <div style="margin-bottom: 4px; text-align: right;">
                <img
                  src="${signature}"
                  alt="Doctor's Signature"
                  style="height: 60px; width: auto; margin-right:40px"
                  onerror="console.error('Error loading signature image'); this.style.display='none';"
                />
              </div>
            ` : '<div style="height: 48px; color: #999; display: flex; align-items: center; justify-content: flex-end;">No signature available</div>'}
            <div style="border-top: 2px solid #0e1630; padding-top: 6px; width: 160px; text-align: center; font-size: 16px; color: #444;">Doctor's Signature</div>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>`;
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
  const { patient ,activeTab} = usePatientContext();

  const doctorId = JSON.parse(localStorage.getItem("user"))?.id;
  const [annotatedImages, setAnnotatedImages] = useState(location.state?.annotatedImages || []);
  const [activeForm, setActiveForm] = useState("all");
  const [formsData, setFormsData] = useState({});
  const [doctorSignature, setDoctorSignature] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isChartOpen, setIsChartOpen] = useState(false);
  const [chartVital, setChartVital] = useState({ name: "", unit: "" });
  const signaturePadRef = useRef();
  const printWindowRef = useRef(null);
  const isIPDPatient = (patient?.type || "").toLowerCase() === "ipd";
  const { user } = useSelector((state) => state.auth);
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [showPatientDetails, setShowPatientDetails] = useState(true);

  useEffect(() => {
    const fetchDoctorInfo = async () => {
      if (user?.doctorId) {
        try {
          const response = await getDoctorById(user.doctorId);
          if (response.data) {
            setDoctorInfo({
              ...response.data,
              firstName: response.data.firstName,
              lastName: response.data.lastName,
              specialization: response.data.specialization,
              qualification: response.data.qualification,
              phone: response.data.phone,
              city: response.data.city,
              district: response.data.district,
              state: response.data.state,
              pincode: response.data.pincode,
              registrationNumber: response.data.registrationNumber
            });
          }
        } catch (error) {
          console.error("Error fetching doctor info:", error);
        }
      }
    };
    fetchDoctorInfo();
  }, [user?.id]);

  useEffect(() => {
    if (!location.state?.formData) return;
    setFormsData(location.state.formData);
  }, [location.state]);

useEffect(() => {
  const fetchSignature = async () => {
    try {
      const response = await getSignatureActionsByContextId(
        patient?.patientId ,
        user?.doctorId,
         activeTab.toUpperCase(),
        patient?.id 
      );

      console.log("API RESPONSE:", JSON.stringify(response.data));

      const rawSig =
        response?.data?.digitalSignature ||
        response?.digitalSignature ||
        response?.data?.data?.digitalSignature ||
        (Array.isArray(response?.data) && response.data[0]?.digitalSignature) ||
        null;

      if (!rawSig) {
        console.log("No digital signature found");
        return;
      }

      const isBase64 = (str) =>
        /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(str);

      if (!isBase64(rawSig)) {
        console.error("API returned invalid Base64!");
        return;
      }

      let signatureUrl = rawSig.startsWith("data:")
        ? rawSig
        : `data:image/png;base64,${rawSig}`;

      const testImg = new Image();
      testImg.onload = () => {
        console.log("Signature image is valid");
        setDoctorSignature(signatureUrl);
      };
      testImg.onerror = () => {
        console.error("Base64 is NOT a valid image!");
      };
      testImg.src = signatureUrl;
    } catch (error) {
      console.error("Error fetching doctor signature:", error);
    }
  };

  fetchSignature();
}, [patient?.id, doctorId]);


  const calculateAge = (dob) => {
    if (!dob) return "N/A";
    try {
      const today = new Date();
      const birthDate = new Date(dob);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    } catch {
      return "N/A";
    }
  };

  const getPatientName = () => {
    if (!patient) return "Unknown Patient";
    return (
      patient.name ||
      `${patient.firstName || ""} ${patient.middleName || ""} ${patient.lastName || ""}`.trim() ||
      "Unknown Patient"
    );
  };

const getPatientAge = () => {
  if (!patient) return "N/A";
  return (patient.age && patient.age !== "N/A") ? patient.age : calculateAge(patient.dob);
};
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

  const handleFormTypeClick = (formType) => {
    setActiveForm(formType);
  };

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

  const handleSaveForm = (formType, data) => {
    setFormsData(prev => ({
      ...prev,
      [formType]: data
    }));
  };

  const handleSaveSignature = () => {
    if (signaturePadRef.current) {
      const signatureData = signaturePadRef.current.toDataURL();
      setDoctorSignature(signatureData);
    }
  };

  const handlePrintForm = async (formType, overrideData) => {
    const data = overrideData || formsData[formType];
    if (!data) return;
    
    let currentSignature = doctorSignature;
    
    // If there's a signature pad with a signature, save it first
    if (signaturePadRef.current && !signaturePadRef.current.isEmpty()) {
      const signatureData = signaturePadRef.current.toDataURL();
      setDoctorSignature(signatureData);
      currentSignature = signatureData;
    } else {
      // Get the most up-to-date signature from the server if no new signature was just added
      try {
        const response = await getSignatureActionsByContextId(
          patient?.patientId,
          user?.doctorId,
          activeTab.toUpperCase(),
          patient?.id 
        );
        
        // Process the signature response
        const rawSig = response?.data?.digitalSignature || 
                      (Array.isArray(response?.data) && response.data[0]?.digitalSignature);
        
        if (rawSig) {
          currentSignature = rawSig.startsWith("data:") ? rawSig : `data:image/png;base64,${rawSig}`;
          setDoctorSignature(currentSignature);
        }
      } catch (error) {
        console.error("Error fetching signature:", error);
      }
    }
      
      const doctor = {
      name: doctorInfo ? `Dr. ${doctorInfo.firstName} ${doctorInfo.lastName}` : 'Doctor',
      specialization: doctorInfo?.specialization || '',
      regNo: doctorInfo?.registrationNumber || '',
      qualifications: doctorInfo?.qualification || '',
      phone: doctorInfo?.phone || '',
      city: doctorInfo?.city || '',
      district: doctorInfo?.district || '',
      state: doctorInfo?.state || '',
      pincode: doctorInfo?.pincode || ''
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
    
    const logoUrl = doctorInfo?.photo ? makeAbsoluteUrl(doctorInfo.photo) : null;
    
    // Create a new image element to ensure the signature is loaded
    const loadSignature = (signature) => {
      return new Promise((resolve) => {
        if (!signature) return resolve('');
        
        const img = new Image();
        img.onload = () => resolve(signature);
        img.onerror = () => {
          console.error("Error loading signature image");
          resolve('');
        };
        img.src = signature;
      });
    };
    
    try {
      // Wait for the signature to be loaded
      const signatureToUse = await loadSignature(currentSignature);
      
      // Generate the HTML with the signature
      const html = getStyledPrescriptionHTML(doctor, patient, signatureToUse, logoUrl, formContent);
      
      if (printWindowRef.current && !printWindowRef.current.closed) printWindowRef.current.close();
      printWindowRef.current = window.open("", "_blank", "width=900,height=700,scrollbars=yes");
      if (!printWindowRef.current) return;
      
      printWindowRef.current.document.open();
      printWindowRef.current.document.write(html);
      printWindowRef.current.document.close();
      printWindowRef.current.focus();
      
      // Add a small delay to ensure the content is fully loaded before printing
      setTimeout(() => {
        try {
          printWindowRef.current.print();
        } catch (e) {
          console.error("Print error:", e);
          toast.error("Error while printing. Please try again.");
        }
      }, 1000);
    } catch (e) {
      console.error("Error preparing print content:", e);
      toast.error("Error preparing document for printing");
    }
  };

  const printForm = async (formContent) => {
    const logoUrl = doctorInfo?.photo ? makeAbsoluteUrl(doctorInfo.photo) : null;
    let currentSignature = doctorSignature;
    
    // If we don't have a signature in state, try to get it from the server
    if (!currentSignature) {
      try {
        const response = await getSignatureActionsByContextId(
          patient?.patientId,
          user?.doctorId,
          activeTab.toUpperCase(),
          patient?.id
        );
        
        const rawSig = response?.data?.digitalSignature || 
                      (Array.isArray(response?.data) && response.data[0]?.digitalSignature);
        
        if (rawSig) {
          currentSignature = rawSig.startsWith("data:") ? rawSig : `data:image/png;base64,${rawSig}`;
          setDoctorSignature(currentSignature);
        }
      } catch (error) {
        console.error("Error fetching signature:", error);
      }
    }
    
    const html = getStyledPrescriptionHTML(doctorInfo, patient, currentSignature, logoUrl, formContent);
    
    if (printWindowRef.current && !printWindowRef.current.closed) printWindowRef.current.close();
    printWindowRef.current = window.open("", "_blank", "width=900,height=700,scrollbars=yes");
    if (!printWindowRef.current) return;
    
    try {
      printWindowRef.current.document.open();
      printWindowRef.current.document.write(html);
      printWindowRef.current.document.close();
      printWindowRef.current.focus();
      
      // Add a small delay to ensure the content is fully loaded before printing
      setTimeout(() => {
        try {
          printWindowRef.current.print();
        } catch (e) {
          console.error("Print error:", e);
        }
      }, 1000); // Increased timeout to ensure content is loaded
    } catch (e) {
      console.error("Print popup write error", e);
    }
  };

  const printAllForms = () => {
    // Get the most up-to-date signature from state
    const currentSignature = doctorSignature;
    
    const doctor = {
      name: doctorInfo ? `Dr. ${doctorInfo.firstName} ${doctorInfo.lastName}` : 'Doctor',
      specialization: doctorInfo?.specialization || '',
      regNo: doctorInfo?.registrationNumber || '',
      qualifications: doctorInfo?.qualification || '',
      phone: doctorInfo?.phone || '',
      city: doctorInfo?.city || '',
      district: doctorInfo?.district || '',
      state: doctorInfo?.state || '',
      pincode: doctorInfo?.pincode || ''
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
    
    const logoUrl = doctorInfo?.photo ? makeAbsoluteUrl(doctorInfo.photo) : null;
    
    // Use currentSignature instead of doctorSignature
    const html = getStyledPrescriptionHTML(doctor, patient, currentSignature, logoUrl, formsHtml);
    
    if (printWindowRef.current && !printWindowRef.current.closed) printWindowRef.current.close();
    printWindowRef.current = window.open("", "_blank", "width=1000,height=800,scrollbars=yes");
    if (!printWindowRef.current) return;
    
    try {
      printWindowRef.current.document.open();
      printWindowRef.current.document.write(html);
      printWindowRef.current.document.close();
      printWindowRef.current.focus();
      
      // Add a small delay to ensure the content is fully loaded before printing
      setTimeout(() => {
        try {
          printWindowRef.current.print();
        } catch (e) {
          console.error("Print error:", e);
        }
      }, 1000); // Increased timeout to ensure content is loaded
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
    if (!patient) return <div>No patient data available</div>;
    
    const patientEmail = patient?.email || '';
    const patientDiagnosis = patient?.diagnosis || 'N/A';
    const patientType = patient?.type || 'N/A';
    
    if (activeForm === "all") {
      return (
        <div className="space-y-8 animate-slideIn">
          <VitalsForm data={formsData.vitals} {...commonProps} hospitalName="AV Hospital" ptemail={patientEmail} />
          <PrescriptionForm data={formsData.prescription} {...commonProps} setShowShareModal={setShowShareModal} doctorName="Dr. Kavya Patil" />
          <ClinicalNotesForm 
            data={formsData.clinical} 
            {...commonProps} 
            ptemail={patientEmail} 
            hospitalname="AV Hospital" 
            drEmail="dr.sheetal@example.com" 
            drname="Dr. Sheetal S. Shelke" 
            patientname={getPatientName()} 
            diagnosis={patientDiagnosis} 
            type={patientType} 
          />
          <LabTestsForm data={formsData.lab} {...commonProps} hospitalName="AV Hospital" ptemail={patientEmail} />
          <EyeTestForm data={formsData.eye} {...commonProps} />
          <DentalForm data={formsData.dental} {...commonProps} />
        </div>
      );
    }
    return (
      <div className="space-y-8 animate-slideIn">
        {{
          vitals: <VitalsForm data={formsData.vitals} {...commonProps} hospitalName="AV Hospital" ptemail={patientEmail} />,
          prescription: <PrescriptionForm data={formsData.prescription} {...commonProps} setShowShareModal={setShowShareModal} doctorName="Dr. Kavya Patil" />,
          clinical: <ClinicalNotesForm 
            data={formsData.clinical} 
            {...commonProps} 
            ptemail={patientEmail} 
            hospitalname="AV Hospital" 
            drEmail="dr.sheetal@example.com" 
            drname="Dr. Sheetal S. Shelke" 
            patientname={getPatientName()} 
            diagnosis={patientDiagnosis} 
            type={patientType} 
          />,
          lab: <LabTestsForm data={formsData.lab} {...commonProps} hospitalName="AV Hospital" ptemail={patientEmail} />,
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
