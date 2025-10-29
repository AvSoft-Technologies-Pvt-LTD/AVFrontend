import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import DynamicTable from "../../../../components/microcomponents/DynamicTable";
import DocsReader from "../../../../components/DocsReader";
import ProfileCard from "../../../../components/microcomponents/ProfileCard";
import ReusableModal from "../../../../components/microcomponents/Modal";
import { ArrowLeft,FileText,Pill,TestTube,CreditCard,Activity,Heart,Thermometer,CheckCircle,AlertTriangle,Printer,Stethoscope,Video,Receipt,Pencil,} from "lucide-react";
import { createPortal } from "react-dom";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">
          <h3 className="font-bold">Something went wrong.</h3>
          <p>{this.state.error?.message}</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200 text-xs md:text-sm"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const loadRecordingFromLocalStorage = (key) => {
  const dataUrl = localStorage.getItem(key);
  const metadataStr = localStorage.getItem(`${key}_metadata`);
  if (!dataUrl) {
    return { blob: null, context: null, metadata: null };
  }
  try {
    if (!dataUrl.startsWith("data:")) {
      console.error("Invalid data URL format in localStorage:", dataUrl);
      return { blob: null, context: null, metadata: null };
    }
    const byteString = atob(dataUrl.split(",")[1]);
    const mimeString = dataUrl.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return {
      blob: new Blob([ab], { type: mimeString }),
      context: null,
      metadata: metadataStr ? JSON.parse(metadataStr) : null,
    };
  } catch (error) {
    console.error("Failed to decode data URL from localStorage:", error);
    return { blob: null, context: null, metadata: null };
  }
};

const VideoPlaybackModal = ({ show, onClose, videoBlob, metadata }) =>
  show
    ? createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-2 md:p-4">
          <div className="relative bg-white p-3 md:p-6 rounded-xl w-full max-w-md md:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <div className="flex justify-between items-center mb-2 md:mb-4">
              <h3 className="text-lg md:text-xl font-semibold">Consultation Recording</h3>
              <p className="text-xs md:text-sm text-gray-600">
                Recorded on: {metadata?.timestamp ? new Date(metadata.timestamp).toLocaleString() : "N/A"}
              </p>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-xl md:text-2xl"
              >
                ×
              </button>
            </div>
            <div className="bg-black rounded-lg overflow-hidden mb-2 md:mb-4">
              {!videoBlob ? (
                <div className="w-full h-48 md:h-64 lg:h-96 flex items-center justify-center text-white text-sm md:text-base">
                  <p>No video recording available.</p>
                </div>
              ) : (
                <video
                  controls
                  className="w-full h-48 md:h-64 lg:h-96 object-contain"
                  src={URL.createObjectURL(videoBlob)}
                  onError={(e) => {
                    console.error("Video playback error:", e);
                    e.target.error = null;
                    e.target.src = "";
                  }}
                >
                  <p className="text-center text-white p-4">Unable to load video recording.</p>
                </video>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={onClose}
                className="px-3 py-1.5 md:px-4 md:py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-xs md:text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

const PatientMedicalRecordDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);
  const selectedRecord = location.state?.selectedRecord;
  const patientName = location.state?.patientName || selectedRecord?.patientName || selectedRecord?.name || "";
  const email = location.state?.email || selectedRecord?.email || "";
  const phone = location.state?.phone || selectedRecord?.phone || "";
  const gender = location.state?.gender || selectedRecord?.gender || selectedRecord?.sex || "";
  const dob = location.state?.dob || selectedRecord?.dob || "";
  const diagnosis = location.state?.diagnosis || selectedRecord?.diagnosis || selectedRecord?.chiefComplaint || "";
  const firstName = location.state?.firstName || "";
  const lastName = location.state?.lastName || "";
  const patientDetails = location.state?.patientDetails || null;
  const opdPatientData = location.state?.opdPatientData || {};
  const displayPatientName = opdPatientData?.name || patientName || "Guest Patient";
  const displayEmail = opdPatientData?.email || email || selectedRecord?.ptemail || "";
  const displayPhone = opdPatientData?.phone || phone || "";
  const displayGender = opdPatientData?.gender || gender || "";
  const displayDob = opdPatientData?.dob || dob || "";
  const displayDiagnosis = opdPatientData?.diagnosis || diagnosis || "";
  const displayAge = opdPatientData?.age || "";
  const hospitalName = selectedRecord?.hospitalname || selectedRecord?.hospitalName || "AV Hospital";
  const ptemail = selectedRecord?.ptemail || displayEmail;
  const [state, setState] = useState({
    detailsActiveTab: "medical-records",
    billingActiveTab: "pharmacy",
  });
  // Add this constant here
const isDoctorUploaded = Boolean(
  selectedRecord?.isVerified ||
  selectedRecord?.hasDischargeSummary ||
  (selectedRecord?.createdBy && String(selectedRecord.createdBy).toLowerCase() === "doctor") ||
  (selectedRecord?.uploadedBy && String(selectedRecord.uploadedBy).toLowerCase().includes("doctor"))
);

  const [clinicalNotes, setClinicalNotes] = useState(null);
  const [prescriptionData, setPrescriptionData] = useState([]);
  const [labTestsData, setLabTestsData] = useState([]);
  const [vitalsData, setVitalsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [videoRecordings, setVideoRecordings] = useState([]);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideoBlob, setSelectedVideoBlob] = useState(null);
  const [selectedVideoMetadata, setSelectedVideoMetadata] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const mockData = {
    medicalDetails: {
      chiefComplaint: "High fever with chills, body ache, and headache for 3 days",
      pastHistory: "No significant past medical or surgical history. No known allergies.",
      diagnosis: "Dengue Fever (Confirmed by NS1 Antigen and IgM positive)",
      treatmentGiven: "IV fluids, Paracetamol for fever, complete bed rest, platelet monitoring",
      doctorsNotes: "Patient responded well to treatment. Platelet count stabilized.",
      initialAssessment: "Patient appears weak, febrile, and dehydrated.",
      systematicExamination: "Mild hepatomegaly, no signs of rash or bleeding.",
      investigations: "CBC, Dengue NS1 Antigen, Dengue IgM/IgG, Platelet Count.",
      treatmentAdvice: "Maintain hydration, avoid NSAIDs, and monitor platelet count daily.",
      dischargeSummary: "Patient admitted with dengue fever, treated with supportive care. Patient is stable and ready for discharge.",
    },
    prescriptionsData: [],
    billingData: {
      pharmacy: [
        {
          id: 1,
          medicineName: "Paracetamol 500mg",
          quantity: 15,
          unitPrice: 2.5,
          totalPrice: 37.5,
          date: "02/07/2025",
        },
      ],
      labs: [
        {
          id: 1,
          testName: "Complete Blood Count (CBC)",
          cost: 350.0,
          date: "01/07/2025",
          paymentStatus: "Paid",
        },
      ],
      hospital: [
        {
          id: 1,
          billType: "Room Charges (5 days)",
          amount: 2500.0,
          paymentMode: "Insurance",
          status: "Paid",
          billDate: "06/07/2025",
        },
      ],
    },
    vitalsData: {
      bloodPressure: "120/80 mmHg",
      heartRate: "80 bpm",
      temperature: "98.6°F",
      spO2: "98%",
      respiratoryRate: "16 bpm",
      height: "170 cm",
      weight: "65 kg",
    },
    videoConsultationData: [],
  };

  const calculateAge = (dob, appointmentDate) => {
    if (!dob || !appointmentDate) return "N/A";
    const dobDate = new Date(dob);
    const appointmentDateObj = new Date(appointmentDate);
    let age = appointmentDateObj.getFullYear() - dobDate.getFullYear();
    const monthDiff = appointmentDateObj.getMonth() - dobDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && appointmentDateObj.getDate() < dobDate.getDate())) {
      age--;
    }
    return `${age} years`;
  };

  const handleSecondOpinion = () => {
    const recordToPass = {
      ...selectedRecord,
      medicalDetails: mockData.medicalDetails,
      prescriptionsData: mockData.prescriptionsData,
      labTestsData: mockData.labTestsData,
    };
    navigate("/patientdashboard/second-opinion", { state: { selectedRecord: recordToPass } });
  };

  const calculatedAge = displayAge || calculateAge(displayDob, selectedRecord?.dateOfVisit || selectedRecord?.dateOfAdmission || selectedRecord?.dateOfConsultation);
  const getInitials = (name) => {
    if (!name) return "NA";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const validateVitals = (values) => {
    const errors = {};
    const warnings = {};

    // Temperature validation (in Celsius)
    if (values.temperature) {
      const tempValue = parseFloat(values.temperature);
      if (!isNaN(tempValue)) {
        if (tempValue < 35.5 || tempValue > 37.9) {
          warnings.temperature = `Abnormal temperature (35.5-37.9°C)`;
        }
      }
    }

    // Heart Rate validation
    if (values.heartRate) {
      const hrValue = parseInt(values.heartRate);
      if (!isNaN(hrValue)) {
        if (hrValue < 60 || hrValue > 100) {
          warnings.heartRate = `Abnormal heart rate (60-100 bpm)`;
        }
      }
    }

    // SpO2 validation
    if (values.spO2) {
      const spo2Value = parseInt(values.spO2);
      if (!isNaN(spo2Value)) {
        if (spo2Value < 95) {
          warnings.spO2 = `Low SpO2 (Normal: >95%)`;
        }
      }
    }

    // Blood Pressure validation
    if (values.bloodPressure) {
      const bpParts = values.bloodPressure.split('/');
      if (bpParts.length === 2) {
        const systolic = parseInt(bpParts[0]);
        const diastolic = parseInt(bpParts[1]);
        if (!isNaN(systolic) && !isNaN(diastolic)) {
          if (systolic < 90 || systolic > 120 || diastolic < 60 || diastolic > 80) {
            warnings.bloodPressure = `Abnormal blood pressure (Normal: 90-120/60-80 mmHg)`;
          }
        }
      }
    }

    // Respiratory Rate validation
    if (values.respiratoryRate) {
      const rrValue = parseInt(values.respiratoryRate);
      if (!isNaN(rrValue)) {
        if (rrValue < 12 || rrValue > 20) {
          warnings.respiratoryRate = `Abnormal respiratory rate (12-20 bpm)`;
        }
      }
    }

    return { errors, warnings };
  };

  const handleSaveVitals = async (formValues) => {
    const { errors, warnings } = validateVitals(formValues);

    if (Object.keys(errors).length > 0) {
      // Handle errors if any
      return;
    }

    const payload = {
      ...formValues,
      ptemail,
      hospitalName,
      timestamp: Date.now(),
      warnings: Object.keys(warnings).length > 0 ? warnings : null
    };

    try {
      const res = await axios.post(
        "https://689887d3ddf05523e55f1e6c.mockapi.io/vitals",
        payload
      );
      setVitalsData(res.data || payload);
      setShowUpdateModal(false);
    } catch (err) {
      console.error("Failed to save vitals:", err);
      alert("Unable to save vitals. Please try again.");
      throw err;
    }
  };

  const fetchClinicalNotes = async () => {
    if (!hospitalName || !ptemail) {
      setClinicalNotes(mockData.medicalDetails);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `https://68abfd0c7a0bbe92cbb8d633.mockapi.io/clinicalnote?hospitalName=${encodeURIComponent(
          hospitalName
        )}&ptemail=${encodeURIComponent(ptemail)}`
      );
      if (response.data.length > 0) {
        const sortedNotes = [...response.data].sort((a, b) => b.id - a.id);
        setClinicalNotes(sortedNotes[0]);
      } else {
        setError("No clinical notes found for this patient and hospital.");
        setClinicalNotes(mockData.medicalDetails);
      }
    } catch (err) {
      setError("Failed to fetch clinical notes.");
      setClinicalNotes(mockData.medicalDetails);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrescriptions = async () => {
    if (!displayEmail) {
      setPrescriptionData([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `https://68abfd0c7a0bbe92cbb8d633.mockapi.io/prescription?patientEmail=${encodeURIComponent(displayEmail)}`
      );
      if (response.data.length > 0) {
        const formattedData = response.data.map((prescription) => ({
          id: prescription.id,
          date: prescription.date,
          doctorName: prescription.doctorName || "Dr. Rajesh Kumar",
          medicines: prescription.prescriptions
            .map((med) => `${med.drugName} ${med.strength} - ${med.dosage} ${med.dosageUnit} ${med.frequency} for ${med.duration} days`)
            .join(", "),
          instructions: prescription.prescriptions
            .map((med) => `Take ${med.intake}.`)
            .join(" "),
        }));
        setPrescriptionData(formattedData);
      } else {
        setPrescriptionData([]);
      }
    } catch (err) {
      setPrescriptionData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLabTests = async () => {
    if (!hospitalName || !ptemail) {
      setLabTestsData([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `https://689887d3ddf05523e55f1e6c.mockapi.io/labtestdr?hospitalName=${encodeURIComponent(
          hospitalName
        )}&ptemail=${encodeURIComponent(ptemail)}`
      );
      if (response.data.length > 0) {
        const formattedData = response.data.map((labTest, index) => ({
          id: index + 1,
          date: new Date().toLocaleDateString(),
          testName: labTest.selectedTests.map((test) => test.name).join(", "),
          result: labTest.result || "Pending",
          normalRange: labTest.normalRange || "N/A",
          status: labTest.status || "Pending",
        }));
        setLabTestsData(formattedData);
      } else {
        setLabTestsData([]);
      }
    } catch (err) {
      setLabTestsData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchVitalsData = async () => {
    if (!ptemail || !hospitalName) {
      setVitalsData(mockData.vitalsData);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `https://689887d3ddf05523e55f1e6c.mockapi.io/vitals?ptemail=${encodeURIComponent(
          ptemail
        )}&hospitalName=${encodeURIComponent(hospitalName)}`
      );
      if (response.data.length > 0) {
        const sortedVitals = [...response.data].sort((a, b) => b.timestamp - a.timestamp);
        setVitalsData(sortedVitals[0]);
      } else {
        setVitalsData(mockData.vitalsData);
      }
    } catch (err) {
      setVitalsData(mockData.vitalsData);
    } finally {
      setLoading(false);
    }
  };

  const fetchVideoRecordings = () => {
    const videoKeys = Object.keys(localStorage).filter((key) =>
      key.startsWith(`consultationVideo_${displayEmail}_${hospitalName}`)
    );
    const videos = videoKeys.map((key) => {
      const result = loadRecordingFromLocalStorage(key);
      return {
        key,
        blob: result.blob,
        metadata: result.metadata,
      };
    });
    return videos
      .filter((video) => video.blob !== null && video.metadata)
      .map((video, index) => ({
        id: index + 1,
        date: new Date(video.metadata.timestamp).toLocaleString(),
        type: video.metadata.type || "N/A",
        doctorName: video.metadata.doctorName || "Dr. Kavya Patil",
        videoBlob: video.blob,
        metadata: video.metadata,
      }))
      .sort((a, b) => b.metadata.timestamp - a.metadata.timestamp);
  };

  useEffect(() => {
    fetchClinicalNotes();
    fetchLabTests();
    fetchVitalsData();
    setVideoRecordings(fetchVideoRecordings());
  }, [hospitalName, displayEmail]);

  useEffect(() => {
    fetchPrescriptions();
  }, [displayEmail]);

  const handleBack = () => {
    navigate("/patientdashboard/medical-records", {
      state: {
        selectedRecord: selectedRecord,
        patientName: displayPatientName,
        email: displayEmail,
        phone: displayPhone,
        gender: displayGender,
        dob: displayDob,
        diagnosis: displayDiagnosis,
        patientDetails: patientDetails,
        opdPatientData: location.state?.opdPatientData || {},
      },
    });
  };

  const printLabTest = (labTest) => {
    const printContents = `
      <div>
        <h3>Lab Test Report</h3>
        <p><strong>Date:</strong> ${labTest.date}</p>
        <p><strong>Test Name:</strong> ${labTest.testName}</p>
        <p><strong>Result:</strong> ${labTest.result}</p>
        <p><strong>Normal Range:</strong> ${labTest.normalRange}</p>
        <p><strong>Status:</strong> ${labTest.status}</p>
      </div>
    `;
    const WinPrint = window.open("", "", "width=900,height=650");
    WinPrint.document.write(`
      <html>
        <head><title>Lab Test Print</title></head>
        <body>${printContents}</body>
      </html>
    `);
    WinPrint.document.close();
    WinPrint.print();
    WinPrint.close();
  };

  const renderTabContent = () => {
    const tabContentMap = {
      "medical-records": (
        <div className="ml-6 mr-6 space-y-4 sm:space-y-5 md:space-y-6">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-3 sm:mb-4 md:mb-6 gap-2 sm:gap-3">
            {/* Left Section */}
            <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3">
              <FileText
                size={18}
                className="sm:size-[20px] md:size-[24px] text-[var(--primary-color)]"
              />
              <h3 className="text-base sm:text-lg md:text-xl font-semibold">
                Medical Information
              </h3>
            </div>
            {/* Button Section */}
            <button className="px-2 sm:px-3 py-1 sm:py-1.5 bg-[var(--primary-color)] text-white rounded-md sm:rounded-lg hover:opacity-90 transition-opacity text-xs sm:text-sm self-start md:self-auto">
              View Original
            </button>
          </div>
          {/* Content */}
          {loading ? (
            <div className="text-center py-6 md:py-8 text-sm md:text-base">
              Loading clinical notes...
            </div>
          ) : error ? (
            <div className="text-center text-gray-600 py-6 md:py-8 text-sm md:text-base">
              {error}
            </div>
          ) : clinicalNotes ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              {[
                {
                  label: "Chief Complaint",
                  value:
                    clinicalNotes.chiefComplaint ||
                    clinicalNotes.chiefcomplaint ||
                    "N/A",
                },
                {
                  label: "Past History",
                  value: clinicalNotes.pastHistory || clinicalNotes.History || "N/A",
                },
                {
                  label: "Advice",
                  value: clinicalNotes.treatmentAdvice || clinicalNotes.Advice || "N/A",
                },
                { label: "Plan", value: clinicalNotes.Plan || "N/A" },
              ].map((item, index) => (
                <div
                  key={index}
                  className="bg-white p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="font-semibold text-xs sm:text-sm md:text-base text-gray-600 mb-1 sm:mb-1.5 md:mb-2">
                    {item.label}
                  </div>
                  <div className="text-gray-800 text-xs sm:text-sm md:text-base">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-600 py-6 md:py-8 text-sm md:text-base">
              No clinical notes found for this patient and hospital.
            </div>
          )}
          {/* Discharge Summary */}
          {selectedRecord?.type === "IPD" && (
            <div className="mt-4 sm:mt-5 md:mt-6">
              <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3 mb-3 sm:mb-4 md:mb-6">
                <FileText
                  size={18}
                  className="sm:size-[20px] md:size-[24px] text-green-600"
                />
                <h3 className="text-base sm:text-lg md:text-xl font-semibold">
                  Discharge Summary
                </h3>
              </div>
              <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl border border-gray-100">
                <div className="font-semibold text-xs sm:text-sm md:text-base text-gray-600 mb-1 sm:mb-1.5 md:mb-2">
                  Summary
                </div>
                <div className="text-gray-800 text-xs sm:text-sm md:text-base">
                  {clinicalNotes?.dischargeSummary || "N/A"}
                </div>
              </div>
            </div>
          )}
        </div>
      ),
      "prescriptions": (
        <div className="ml-6 mr-6 space-y-4 md:space-y-6">
          <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
            <Pill size={16} className="md:size-[20px] text-purple-600" />
            <h4 className="text-lg md:text-xl font-semibold">Prescribed Medications</h4>
          </div>
          {loading ? (
            <div className="text-center py-6 md:py-8 text-sm md:text-base">Loading prescriptions...</div>
          ) : prescriptionData.length > 0 ? (
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <DynamicTable
                columns={[
                  { header: "Date", accessor: "date" },
                  { header: "Doctor Name", accessor: "doctorName" },
                  { header: "Medicines", accessor: "medicines" },
                  { header: "Instructions", accessor: "instructions" },
                ]}
                showSearchBar={true}
                data={prescriptionData}
              />
            </div>
          ) : (
            <div className="text-center text-gray-600 py-6 md:py-8 text-sm md:text-base">
              No prescriptions found for this patient.
            </div>
          )}
        </div>
      ),
      "lab-tests": (
        <div className="space-y-4 md:space-y-6">
          <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
            <TestTube size={18} className="md:size-[24px] text-orange-600" />
            <h4 className="text-lg md:text-xl font-semibold">Test Results History</h4>
          </div>
          {loading ? (
            <div className="text-center py-6 md:py-8 text-sm md:text-base">Loading lab tests...</div>
          ) : error ? (
            <div className="text-center text-gray-600 py-6 md:py-8 text-sm md:text-base">{error}</div>
          ) : labTestsData.length > 0 ? (
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <DynamicTable
                columns={[
                  { header: "Date", accessor: "date" },
                  { header: "Test Name", accessor: "testName" },
                  { header: "Result", accessor: "result" },
                  { header: "Normal Range", accessor: "normalRange" },
                  {
                    header: "Status",
                    accessor: "status",
                    cell: (row) => (
                      <span className={`text-xs md:text-sm font-semibold px-2 py-1 rounded-full ${row.status === "Normal" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}>
                        {row.status === "Normal" ? <CheckCircle size={12} className="inline mr-1" /> : <AlertTriangle size={12} className="inline mr-1" />}
                        {row.status}
                      </span>
                    ),
                  },
                  {
                    header: "Print",
                    accessor: "print",
                    cell: (row) => (
                      <button className="px-2 py-1 bg-[var(--primary-color)] text-white rounded-lg hover:opacity-90 transition-opacity text-xs flex items-center gap-1" onClick={() => printLabTest(row)}>
                        <Printer size={12} /> Print
                      </button>
                    ),
                  },
                ]}
                data={labTestsData}
              />
            </div>
          ) : (
            <div className="text-center text-gray-600 py-6 md:py-8 text-sm md:text-base">No lab tests found.</div>
          )}
        </div>
      ),
      "billing": (
        <div className="space-y-4 md:space-y-6">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <DynamicTable
              columns={(() => {
                const columnMaps = {
                  pharmacy: [
                    { header: "Medicine Name", accessor: "medicineName" },
                    { header: "Quantity", accessor: "quantity" },
                    { header: "Unit Price (₹)", accessor: "unitPrice" },
                    { header: "Total Price (₹)", accessor: "totalPrice" },
                    { header: "Date", accessor: "date" },
                  ],
                  labs: [
                    { header: "Test Name", accessor: "testName" },
                    { header: "Cost (₹)", accessor: "cost" },
                    { header: "Date", accessor: "date" },
                    {
                      header: "Payment Status",
                      accessor: "paymentStatus",
                      cell: (row) => (
                        <span className={`text-xs md:text-sm font-semibold px-2 py-1 rounded-full ${row.paymentStatus === "Paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          }`}>
                          {row.paymentStatus}
                        </span>
                      ),
                    },
                  ],
                  hospital: [
                    { header: "Bill Type", accessor: "billType" },
                    { header: "Amount (₹)", accessor: "amount" },
                    { header: "Payment Mode", accessor: "paymentMode" },
                    {
                      header: "Status",
                      accessor: "status",
                      cell: (row) => (
                        <span className={`text-xs md:text-sm font-semibold px-2 py-1 rounded-full ${row.status === "Paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          }`}>
                          {row.status}
                        </span>
                      ),
                    },
                    { header: "Bill Date", accessor: "billDate" },
                  ],
                };
                return columnMaps[state.billingActiveTab];
              })()}
              data={mockData.billingData[state.billingActiveTab]}
              tabs={[
                { value: "pharmacy", label: "Pharmacy" },
                { value: "labs", label: "Labs" },
                { value: "hospital", label: "Hospital Bills" },
              ]}
              activeTab={state.billingActiveTab}
              onTabChange={(tab) => setState((prev) => ({ ...prev, billingActiveTab: tab }))}
              filters={[
                {
                  key: "paymentStatus",
                  label: "Payment Status",
                  options: [
                    { value: "Paid", label: "Paid" },
                    { value: "Unpaid", label: "Unpaid" },
                  ],
                },
              ]}
            />
          </div>
        </div>
      ),
      "video": (
        <div className="space-y-4 md:space-y-6">
          <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
            <Video size={18} className="md:size-[24px] text-indigo-600" />
            <h4 className="text-lg md:text-xl font-semibold">Video Consultation History</h4>
          </div>
          {videoRecordings.length > 0 ? (
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <DynamicTable
                columns={[
                  { header: "ID", accessor: "id" },
                  { header: "Date", accessor: "date" },
                  { header: "Type", accessor: "type" },
                  { header: "Doctor Name", accessor: "doctorName" },
                  {
                    header: "Actions",
                    accessor: "actions",
                    cell: (row) => (
                      <button
                        className="px-2 py-1 bg-[var(--primary-color)] text-white rounded-lg hover:opacity-90 transition-opacity text-xs flex items-center gap-1"
                        onClick={() => {
                          if (row.videoBlob) {
                            setSelectedVideoBlob(row.videoBlob);
                            setSelectedVideoMetadata(row.metadata);
                            setShowVideoModal(true);
                          } else {
                            alert("Video recording is not available.");
                          }
                        }}
                      >
                        <Video size={12} /> View Recording
                      </button>
                    ),
                  },
                ]}
                data={videoRecordings}
              />
            </div>
          ) : (
            <div className="text-center text-gray-600 py-6 md:py-8 text-sm md:text-base">No video recordings found.</div>
          )}
        </div>
      ),
    };
    return tabContentMap[state.detailsActiveTab] || null;
  };

  if (!selectedRecord) {
    return (
      <div className="p-4 md:p-6">
        <div className="text-center text-gray-500 text-sm md:text-base">
          No record selected. Please go back and select a record.
        </div>
      </div>
    );
  }

  const detailsTabs = [
    { id: "medical-records", label: "Medical Records", icon: FileText },
    { id: "prescriptions", label: "Prescriptions", icon: Pill },
    { id: "lab-tests", label: "Lab/Scan", icon: TestTube },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "video", label: "Video", icon: Video },
  ];

  const updateState = (updates) => setState((prev) => ({ ...prev, ...updates }));

  // Fields configuration for ReusableModal
  const vitalsFields = [
    {
      name: "bloodPressure",
      label: "Blood Pressure",
      type: "text",
      placeholder: "e.g. 120/80",
      unit: "mmHg",
      normalRange: "90-120/60-80 mmHg",
      colSpan: 1,
    },
    {
      name: "heartRate",
      label: "Heart Rate",
      type: "number",
      placeholder: "e.g. 72",
      unit: "bpm",
      normalRange: "60-100 bpm",
      colSpan: 1,
    },
    {
      name: "temperature",
      label: "Temperature",
      type: "number",
      placeholder: "e.g. 36.5",
      unit: "°C",
      normalRange: "35.5-37.9°C",
      colSpan: 1,
    },
    {
      name: "respiratoryRate",
      label: "Respiratory Rate",
      type: "number",
      placeholder: "e.g. 16",
      unit: "bpm",
      normalRange: "12-20 bpm",
      colSpan: 1,
    },
    {
      name: "spO2",
      label: "SpO2",
      type: "number",
      placeholder: "e.g. 98",
      unit: "%",
      normalRange: ">95%",
      colSpan: 1,
    },
    {
      name: "height",
      label: "Height",
      type: "number",
      placeholder: "e.g. 170",
      unit: "cm",
      colSpan: 1,
    },
    {
      name: "weight",
      label: "Weight",
      type: "number",
      placeholder: "e.g. 65",
      unit: "kg",
      colSpan: 1,
    },
    
  ];

  return (
    <ErrorBoundary>
      <div className="p-3 md:p-6 space-y-4 md:space-y-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 md:gap-2 hover:text-[var(--accent-color)] transition-colors text-gray-600 text-xs md:text-sm"
        >
          <ArrowLeft size={16} className="md:size-[20px]" />
          <span className="font-medium">Back to Medical Records</span>
        </button>

        {/* Patient Header: Responsive for all devices */}
        <ProfileCard
          initials={getInitials(displayPatientName)}
          name={displayPatientName}
          fields={[
            { label: "Age", value: calculatedAge },
            { label: "Gender", value: displayGender },
            { label: "Hospital", value: hospitalName },
            {
              label: "Visit Date",
              value: selectedRecord.dateOfVisit || selectedRecord.dateOfAdmission || selectedRecord.dateOfConsultation || "N/A",
            },
            { label: "Diagnosis", value: displayDiagnosis },
            { label: "K/C/O", value: selectedRecord["K/C/O"] ?? "--" },
          ]}
        />

        {/* Vitals Summary: Responsive Grid */}
    <div className="space-y-4 md:space-y-6">
  {/* Header Section */}
  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
    <div className="flex items-center gap-2">
      <Activity size={20} className="text-green-600" />
      <h3 className="text-lg md:text-xl font-semibold">Vitals Summary</h3>
    </div>

    {/* Update Vitals Button: only show when NOT doctor-uploaded */}
    {!isDoctorUploaded && (
      <button
        onClick={() => setShowUpdateModal(true)}
        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm md:text-base rounded-lg shadow-sm transition duration-200 flex items-center gap-2 self-start md:self-auto"
        aria-label="Update vitals"
      >
        <Pencil size={16} />
        Update Vitals
      </button>
    )}
  </div>

  {/* Vitals Grid */}
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3 p-2">
    {[
      { key: "bloodPressure", icon: Heart, color: "red", label: "Blood Pressure", value: vitalsData?.bloodPressure || "--" },
      { key: "heartRate", icon: Activity, color: "blue", label: "Heart Rate", value: vitalsData?.heartRate || "--" },
      { key: "temperature", icon: Thermometer, color: "orange", label: "Temperature", value: vitalsData?.temperature || "--" },
      { key: "spO2", icon: Activity, color: "emerald", label: "SpO2", value: vitalsData?.spO2 || "--" },
      { key: "respiratoryRate", icon: Activity, color: "violet", label: "Respiratory Rate", value: vitalsData?.respiratoryRate || "--" },
      { key: "height", icon: Activity, color: "cyan", label: "Height", value: vitalsData?.height || "--" },
      { key: "weight", icon: Activity, color: "amber", label: "Weight", value: vitalsData?.weight || "--" },
    ].map(({ key, icon: Icon, color, label, value }) => {
      const colorMap = {
        red: "red",
        blue: "blue",
        orange: "orange",
        emerald: "emerald",
        violet: "violet",
        cyan: "cyan",
        amber: "amber",
      };
      const c = colorMap[color];

      // Check for warnings
      let warning = null;
      if (vitalsData?.warnings?.[key]) {
        warning = vitalsData.warnings[key];
      }

      return (
        <div
          key={key}
          className={`bg-${c}-50 border-l-4 border-${c}-500 p-3 rounded-lg shadow-sm flex flex-col justify-between hover:shadow-md transition relative`}
          title={warning || ""}
          aria-label={`${label}: ${value}${warning ? ` — ${warning}` : ""}`}
        >
          <div className="flex items-center gap-2 mb-1">
            {Icon && <Icon size={16} className={`text-${c}-500`} />}
            <span className={`text-xs md:text-sm font-medium text-${c}-700 truncate`}>
              {label}
            </span>
          </div>
          <div className={`text-sm md:text-base font-semibold text-${c}-800 truncate`}>
            {value}
          </div>
        </div>
      );
    })}
  </div>
</div>

        {/* Tabs: Responsive */}
        <div className="w-full border-b border-gray-200">
          <div
            className="
              flex
              overflow-x-auto
              sm:overflow-visible
              scrollbar-thin
              scrollbar-thumb-gray-300
              scrollbar-track-gray-100
              gap-2 sm:gap-4
              px-2 sm:px-0
            "
          >
            {detailsTabs.map((tab) => {
              const IconComponent = tab.icon;
              const isActive = state.detailsActiveTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => updateState({ detailsActiveTab: tab.id })}
                  className={`
                    flex items-center gap-2
                    px-3 py-2 rounded-md
                    text-sm sm:text-base font-medium
                    transition-all duration-300
                    whitespace-nowrap
                    ${isActive
                      ? "bg-[var(--primary-color)] text-white shadow-sm"
                      : "text-gray-600 hover:text-[var(--primary-color)] hover:bg-gray-100"
                    }
                  `}
                >
                  <IconComponent size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
            {selectedRecord?.type && !selectedRecord?.isNewlyAdded && (
              <div className="flex-1 mb-3 flex justify-end">
                <button
                  onClick={handleSecondOpinion}
                  className="btn btn-primary text-white px-2 sm:px-4 py-1 sm:py-2 text-xs flex items-center gap-1 hover:opacity-90 transition-opacity"
                >
                  <Stethoscope size={14} />
                  <span className="text-xs sm:text-sm xs:text-xs">Second Opinion</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="animate-slide-fade-in overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {selectedRecord.createdBy === "patient" ? (
          <DocsReader />
        ) : (
          <>
            {renderTabContent()}
          </>
        )}
      </div>

      {/* Video Modal */}
      <VideoPlaybackModal
        show={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        videoBlob={selectedVideoBlob}
        metadata={selectedVideoMetadata}
      />

      {/* Update Vitals Modal using ReusableModal */}
      <ReusableModal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        title="Update Vitals"
        mode="edit"
        saveLabel="Save Vitals"
        fields={vitalsFields}
        data={{
          bloodPressure: vitalsData?.bloodPressure?.replace(" mmHg", "") || "",
          heartRate: vitalsData?.heartRate?.replace(" bpm", "") || "",
          temperature: vitalsData?.temperature?.replace("°C", "") || "",
          respiratoryRate: vitalsData?.respiratoryRate?.replace(" bpm", "") || "",
          spO2: vitalsData?.spO2?.replace("%", "") || "",
          height: vitalsData?.height?.replace(" cm", "") || "",
          weight: vitalsData?.weight?.replace(" kg", "") || "",
          notes: vitalsData?.notes || "",
        }}
        onSave={handleSaveVitals}
        shouldValidate={true}
      />
    </ErrorBoundary>
  );
};

export default PatientMedicalRecordDetails;