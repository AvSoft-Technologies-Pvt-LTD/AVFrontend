//Discharge
//discharge modal
import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  User,
  Calendar,
  FileText,
  Printer,
  ArrowLeft,
  CheckCircle,
  Stethoscope,
  Heart,
  Pill,
  ClipboardList,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AVLogo from "../../../../assets/AV.png";

const DischargeModal = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const patient = location.state?.patient || {};
  const printWindowRef = useRef(null);

  const [formData, setFormData] = useState({
    patientName: "",
    patientId: "",
    ward: "",
    admissionDate: "",
    dischargeDate: "",
    dischargeTime: "",
    actualLeaveDate: "",
    actualLeaveTime: "",
    doctorIncharge: "",
    sisterIncharge: "",
    diagnosis: "",
    treatmentSummary: "",
    doctorNotes: "",
    followUpInstructions: "",
    medications: "",
    nextAppointment: "",
    dischargeCondition: "Stable",
    dischargeType: "Home",
  });

  const getWardString = (p) => {
    const isIPD =
      p?.type?.toLowerCase() === "ipd" || !!p?.admissionDate || !!p?.wardType;
    if (isIPD && p?.wardType && p?.wardNo && p?.bedNo) {
      return `${p.wardType}-${p.wardNo}-${p.bedNo}`;
    }
    if (
      isIPD &&
      typeof p?.wardType === "string" &&
      p.wardType.match(/-/) &&
      !p.wardNo &&
      !p.bedNo
    ) {
      return p.wardType;
    }
    if (isIPD && p?.wardType) {
      return p.wardType;
    }
    return p?.ward || "";
  };

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      patientName: patient?.name || patient?.firstName || "",
      patientId: patient?.id || patient?.patientId || "",
      ward: getWardString(patient),
      admissionDate: patient?.admissionDate || patient?.doa || "",
      diagnosis: patient?.diagnosis || "",
      dischargeDate: new Date().toISOString().split("T")[0],
      dischargeTime: new Date().toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));
  }, [patient]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !formData.dischargeDate ||
      !formData.doctorIncharge ||
      !formData.diagnosis
    ) {
      toast.error("Please fill in all required fields");
      return;
    }
    toast.success("Discharge form completed successfully!");
  };

  const handlePrint = () => {
    // Close any existing print window to prevent multiple windows
    if (printWindowRef.current && !printWindowRef.current.closed) {
      printWindowRef.current.close();
    }

    const dischargeHTML = `
      <html>
        <head>
          <title>Discharge Summary - ${formData.patientName}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Arial', sans-serif; 
              background: white;
              padding: 0;
              margin: 0;
              line-height: 1.5;
              color: #333;
            }
            .print-container {
              width: 100vw;
              height: 100vh;
              display: flex;
              justify-content: center;
              align-items: flex-start;
              background: #f5f5f5;
              padding: 20px;
              overflow-y: auto;
            }
            .discharge-document {
              max-width: 800px;
              margin: 0 auto;
              border: 3px solid #0E1630;
              background: white;
              box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #0E1630 0%, #01D48C 100%);
              color: white;
              padding: 25px;
              text-align: center;
            }
            .header h1 {
              margin: 0 0 5px 0;
              font-size: 28px;
              font-weight: bold;
            }
            .header p {
              margin: 0;
              font-size: 16px;
              opacity: 0.9;
            }
            .logo {
              width: 70px;
              height: 70px;
              border-radius: 10px;
              background: white;
              padding: 8px;
              margin: 0 auto 15px;
              display: block;
            }
            .content {
              padding: 35px;
            }
            .section {
              margin-bottom: 30px;
              border-bottom: 2px solid #f0f0f0;
              padding-bottom: 20px;
            }
            .section:last-child {
              border-bottom: none;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              color: #0E1630;
              margin-bottom: 20px;
              padding-bottom: 8px;
              border-bottom: 3px solid #01D48C;
              display: flex;
              align-items: center;
              gap: 10px;
            }
            .field-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 20px;
            }
            .field-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 12px;
              align-items: center;
              padding: 8px 0;
            }
            .field-label {
              font-weight: 600;
              color: #0E1630;
              min-width: 150px;
              font-size: 14px;
            }
            .field-value {
              color: #444;
              flex: 1;
              font-size: 14px;
              border-bottom: 1px dotted #ccc;
              padding-bottom: 3px;
              margin-left: 20px;
              font-weight: 500;
            }
            .textarea-content {
              width: 100%;
              min-height: 100px;
              border: 2px solid #e9ecef;
              padding: 15px;
              border-radius: 8px;
              font-size: 14px;
              background: #f8f9fa;
              margin-top: 10px;
              line-height: 1.6;
            }
            .signature-section {
              margin-top: 50px;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              padding: 30px 0;
              border-top: 2px solid #0E1630;
            }
            .signature-box {
              text-align: center;
              width: 180px;
            }
            .signature-line {
              border-bottom: 2px solid #333;
              width: 100%;
              height: 70px;
              margin-bottom: 8px;
            }
            .signature-text {
              font-size: 12px;
              color: #666;
              font-weight: 600;
            }
            .signature-name {
              font-size: 14px;
              color: #0E1630;
              font-weight: bold;
              margin-top: 3px;
            }
            .status-badge {
              display: inline-block;
              padding: 6px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: bold;
              text-transform: uppercase;
            }
            .status-stable {
              background: #d4edda;
              color: #155724;
              border: 1px solid #c3e6cb;
            }
            .status-improved {
              background: #d1ecf1;
              color: #0c5460;
              border: 1px solid #bee5eb;
            }
            .status-critical {
              background: #f8d7da;
              color: #721c24;
              border: 1px solid #f5c6cb;
            }
            .hospital-info {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              color: #666;
              font-size: 12px;
            }
            @media print {
              body { padding: 0; margin: 0; }
              .print-container {
                width: 100%;
                height: auto;
                background: white;
                padding: 10px;
              }
              .discharge-document {
                box-shadow: none;
                border: 3px solid #0E1630;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            <div class="discharge-document">
              <div class="header">
                <img src="${AVLogo}" alt="Hospital Logo" class="logo" />
                <h1>AV Hospital</h1>
                <p>Patient Discharge Summary</p>
              </div>
              
              <div class="content">
                <div class="section">
                  <h2 class="section-title">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                    Patient Information
                  </h2>
                  <div class="field-grid">
                    <div class="field-row">
                      <span class="field-label">Patient Name:</span>
                      <span class="field-value">${
                        formData.patientName || "_______________"
                      }</span>
                    </div>
                    <div class="field-row">
                      <span class="field-label">Patient ID:</span>
                      <span class="field-value">${
                        formData.patientId || "_______________"
                      }</span>
                    </div>
                    <div class="field-row">
                      <span class="field-label">Ward Details:</span>
                      <span class="field-value">${
                        formData.ward || "_______________"
                      }</span>
                    </div>
                    <div class="field-row">
                      <span class="field-label">Discharge Condition:</span>
                      <span class="field-value">
                        <span class="status-badge status-${formData.dischargeCondition.toLowerCase()}">
                          ${formData.dischargeCondition || "_______________"}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                <div class="section">
                  <h2 class="section-title">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                    </svg>
                    Admission & Discharge Details
                  </h2>
                  <div class="field-grid">
                    <div class="field-row">
                      <span class="field-label">Admission Date:</span>
                      <span class="field-value">${
                        formData.admissionDate
                          ? new Date(
                              formData.admissionDate
                            ).toLocaleDateString()
                          : "_______________"
                      }</span>
                    </div>
                    <div class="field-row">
                      <span class="field-label">Discharge Date:</span>
                      <span class="field-value">${
                        formData.dischargeDate
                          ? new Date(
                              formData.dischargeDate
                            ).toLocaleDateString()
                          : "_______________"
                      }</span>
                    </div>
                    <div class="field-row">
                      <span class="field-label">Discharge Time:</span>
                      <span class="field-value">${
                        formData.dischargeTime || "_______________"
                      }</span>
                    </div>
                    <div class="field-row">
                      <span class="field-label">Discharge Type:</span>
                      <span class="field-value">${
                        formData.dischargeType || "_______________"
                      }</span>
                    </div>
                  </div>
                </div>

                <div class="section">
                  <h2 class="section-title">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
                    </svg>
                    Medical Information
                  </h2>
                  <div class="field-grid">
                    <div class="field-row">
                      <span class="field-label">Doctor Incharge:</span>
                      <span class="field-value">${
                        formData.doctorIncharge || "_______________"
                      }</span>
                    </div>
                    <div class="field-row">
                      <span class="field-label">Sister Incharge:</span>
                      <span class="field-value">${
                        formData.sisterIncharge || "_______________"
                      }</span>
                    </div>
                  </div>
                  <div style="margin-top: 20px;">
                    <p class="field-label">Diagnosis & Treatment Summary:</p>
                    <div class="textarea-content">
                      ${
                        formData.treatmentSummary ||
                        formData.diagnosis ||
                        "Treatment summary will appear here..."
                      }
                    </div>
                  </div>
                </div>

                <div class="section">
                  <h2 class="section-title">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    Follow-up Instructions & Medications
                  </h2>
                  <div>
                    <p class="field-label">Follow-up Instructions:</p>
                    <div class="textarea-content">
                      ${
                        formData.followUpInstructions ||
                        "Follow-up instructions will appear here..."
                      }
                    </div>
                  </div>
                  <div style="margin-top: 20px;">
                    <p class="field-label">Medications & Instructions:</p>
                    <div class="textarea-content">
                      ${
                        formData.medications ||
                        "Medication instructions will appear here..."
                      }
                    </div>
                  </div>
                  <div class="field-row" style="margin-top: 20px;">
                    <span class="field-label">Next Appointment:</span>
                    <span class="field-value">${
                      formData.nextAppointment
                        ? new Date(
                            formData.nextAppointment
                          ).toLocaleDateString()
                        : "_______________"
                    }</span>
                  </div>
                </div>

                <div class="signature-section">
                  <div class="signature-box">
                    <div class="signature-line"></div>
                    <p class="signature-text">Doctor's Signature</p>
                    <p class="signature-name">${
                      formData.doctorIncharge || "Doctor Name"
                    }</p>
                  </div>
                  <div class="signature-box">
                    <div class="signature-line"></div>
                    <p class="signature-text">Hospital Authority</p>
                    <p class="signature-name">AV Hospital</p>
                  </div>
                  <div class="signature-box">
                    <div class="signature-line"></div>
                    <p class="signature-text">Date & Time</p>
                    <p class="signature-name">${new Date().toLocaleDateString()}</p>
                  </div>
                </div>

                <div class="hospital-info">
                  <p><strong>AV Hospital</strong> | Dharwad, Karnataka, 580001 | +12-345 678 9012</p>
                  <p>This is an official medical document. Please preserve it for future reference.</p>
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Create new print window that shows only the document
    printWindowRef.current = window.open(
      "",
      "discharge_summary",
      "width=900,height=700,scrollbars=yes,resizable=no,toolbar=no,menubar=no,location=no,status=no"
    );
    if (printWindowRef.current) {
      printWindowRef.current.document.write(dischargeHTML);
      printWindowRef.current.document.close();

      // Auto-trigger print dialog after a short delay
      setTimeout(() => {
        printWindowRef.current.print();
      }, 500);

      toast.success("Discharge summary document ready for printing!");
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 bg-white rounded-xl shadow-sm p-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-3 py-2 text-[var(--primary-color)] hover:bg-gray-100 rounded-lg transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="text-xl font-bold text-[var(--primary-color)]">
            Patient Discharge Summary
          </h1>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg hover:bg-[var(--accent-color)] transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print Summary
          </button>
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 animate-slideIn">
          <h2 className="text-lg font-semibold mb-6 text-[var(--primary-color)] flex items-center gap-2">
            <ClipboardList className="w-5 h-5" />
            Discharge Information Form
          </h2>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div
                className="relative floating-input"
                data-placeholder="Patient Name"
              >
                <input
                  type="text"
                  value={formData.patientName}
                  onChange={(e) =>
                    handleInputChange("patientName", e.target.value)
                  }
                  className="peer input-field"
                  placeholder=" "
                  disabled
                />
              </div>

              <div
                className="relative floating-input"
                data-placeholder="Patient ID"
              >
                <input
                  type="text"
                  value={formData.patientId}
                  onChange={(e) =>
                    handleInputChange("patientId", e.target.value)
                  }
                  className="peer input-field"
                  placeholder=" "
                  disabled
                />
              </div>

              <div
                className="relative floating-input"
                data-placeholder="Ward Details"
              >
                <input
                  type="text"
                  value={formData.ward}
                  className="peer input-field"
                  placeholder=" "
                  disabled
                />
              </div>

              <div
                className="relative floating-input"
                data-placeholder="Admission Date"
              >
                <input
                  type="date"
                  value={formData.admissionDate}
                  onChange={(e) =>
                    handleInputChange("admissionDate", e.target.value)
                  }
                  className="peer input-field"
                  disabled
                />
              </div>

              <div
                className="relative floating-input"
                data-placeholder="Discharge Date"
              >
                <input
                  type="date"
                  value={formData.dischargeDate}
                  onChange={(e) =>
                    handleInputChange("dischargeDate", e.target.value)
                  }
                  className="peer input-field"
                  placeholder=" "
                  required
                />
              </div>

              <div
                className="relative floating-input"
                data-placeholder="Discharge Time"
              >
                <input
                  type="time"
                  value={formData.dischargeTime}
                  onChange={(e) =>
                    handleInputChange("dischargeTime", e.target.value)
                  }
                  className="peer input-field"
                  required
                />
              </div>

              <div
                className="relative floating-input"
                data-placeholder="Doctor Incharge"
              >
                <select
                  value={formData.doctorIncharge}
                  onChange={(e) =>
                    handleInputChange("doctorIncharge", e.target.value)
                  }
                  className="peer input-field"
                  required
                >
                  <option value="">Select Doctor</option>
                  <option value="Dr. John Smith">Dr. John Smith</option>
                  <option value="Dr. Emily Davis">Dr. Emily Davis</option>
                  <option value="Dr. Michael Brown">Dr. Michael Brown</option>
                  <option value="Dr. Sarah Wilson">Dr. Sarah Wilson</option>
                </select>
              </div>

              <div
                className="relative floating-input"
                data-placeholder="Sister Incharge"
              >
                <select
                  value={formData.sisterIncharge}
                  onChange={(e) =>
                    handleInputChange("sisterIncharge", e.target.value)
                  }
                  className="peer input-field"
                >
                  <option value="">Select Sister</option>
                  <option value="Sister Alice Johnson">
                    Sister Alice Johnson
                  </option>
                  <option value="Sister Clara White">Sister Clara White</option>
                  <option value="Sister Sophia Lee">Sister Sophia Lee</option>
                  <option value="Sister Olivia Green">
                    Sister Olivia Green
                  </option>
                </select>
              </div>

              <div
                className="relative floating-input"
                data-placeholder="Discharge Condition"
              >
                <select
                  value={formData.dischargeCondition}
                  onChange={(e) =>
                    handleInputChange("dischargeCondition", e.target.value)
                  }
                  className="peer input-field"
                >
                  <option value="Stable">Stable</option>
                  <option value="Improved">Improved</option>
                  <option value="Critical">Critical</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>

              <div
                className="relative floating-input"
                data-placeholder="Discharge Type"
              >
                <select
                  value={formData.dischargeType}
                  onChange={(e) =>
                    handleInputChange("dischargeType", e.target.value)
                  }
                  className="peer input-field"
                >
                  <option value="Home">Home</option>
                  <option value="Transfer">Transfer</option>
                  <option value="LAMA">
                    LAMA (Left Against Medical Advice)
                  </option>
                  <option value="Absconded">Absconded</option>
                </select>
              </div>

              <div
                className="relative floating-input"
                data-placeholder="Next Appointment Date"
              >
                <input
                  type="date"
                  value={formData.nextAppointment}
                  onChange={(e) =>
                    handleInputChange("nextAppointment", e.target.value)
                  }
                  className="peer input-field"
                  placeholder=" "
                />
              </div>
            </div>

            {/* Text Areas */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[var(--primary-color)] mb-2">
                  Diagnosis / Treatment Summary *
                </label>
                <textarea
                  value={formData.treatmentSummary}
                  onChange={(e) =>
                    handleInputChange("treatmentSummary", e.target.value)
                  }
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                  placeholder="Enter detailed diagnosis and treatment summary..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--primary-color)] mb-2">
                  Doctor's Notes
                </label>
                <textarea
                  value={formData.doctorNotes}
                  onChange={(e) =>
                    handleInputChange("doctorNotes", e.target.value)
                  }
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                  placeholder="Enter doctor's notes..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--primary-color)] mb-2">
                  Follow-up Instructions
                </label>
                <textarea
                  value={formData.followUpInstructions}
                  onChange={(e) =>
                    handleInputChange("followUpInstructions", e.target.value)
                  }
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                  placeholder="Enter follow-up instructions for the patient..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--primary-color)] mb-2">
                  Medications & Instructions
                </label>
                <textarea
                  value={formData.medications}
                  onChange={(e) =>
                    handleInputChange("medications", e.target.value)
                  }
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                  placeholder="List medications and detailed instructions..."
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 bg-[var(--primary-color)] text-white py-3 rounded-lg font-semibold hover:bg-[var(--accent-color)] transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Complete Discharge Process
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="px-8 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <Printer className="w-5 h-5" />
                Print Document
              </button>
            </div>
          </form>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default DischargeModal;