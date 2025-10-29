
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import DynamicTable from "../../../../components/microcomponents/DynamicTable";
import DocsReader from "../../../../components/DocsReader";
import CameraCapture from "./CameraCapture";
import PreviewModal from "./PreviewModal";
import ProfileCard from "../../../../components/microcomponents/ProfileCard";
import {
  ArrowLeft,
  FileText,
  Pill,
  TestTube,
  CreditCard,
  Activity,
  Heart,
  Thermometer,
  CheckCircle,
  AlertTriangle,
  Printer,
  Stethoscope,
  Upload,
  FileCheck,
  X,
  Camera,
  Phone,
  AtSign,
  Video,
  Receipt,
} from "lucide-react";

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
            className="mt-2 px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="relative bg-white p-6 rounded-xl w-[90%] max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Consultation Recording</h3>
              <p className="text-sm text-gray-600">
                Recorded on: {metadata?.timestamp ? new Date(metadata.timestamp).toLocaleString() : "N/A"}
              </p>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="bg-black rounded-lg overflow-hidden mb-4">
              {!videoBlob ? (
                <div className="w-full h-96 flex items-center justify-center text-white">
                  <p>No video recording available.</p>
                </div>
              ) : (
                <video
                  controls
                  className="w-full h-96 object-contain"
                  src={URL.createObjectURL(videoBlob)}
                  onError={(e) => {
                    console.error("Video playback error:", e);
                    e.target.error = null;
                    e.target.src = "";
                  }}
                >
                  <p className="text-center text-white p-8">Unable to load video recording.</p>
                </video>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

const MedicalRecordDetails = () => {
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
      bloodPressure: "0/80 mmHg",
      heartRate: "0 bpm",
      temperature: "0°F",
      spO2: "0%",
      respiratoryRate: "0 bpm",
      height: "0 cm",
      weight: "0 kg",
    },
    videoConsultationData: [
      {
        id: 1,
        date: "05/07/2025",
        time: "10:30 AM",
        duration: "45 minutes",
        doctorName: "Dr. Rajesh Kumar",
        consultationType: "Follow-up",
        recordingAvailable: true,
        notes: "Patient discussed symptoms and treatment progress. Advised continued medication.",
      },
      {
        id: 2,
        date: "03/07/2025",
        time: "02:15 PM",
        duration: "30 minutes",
        doctorName: "Dr. Priya Sharma",
        consultationType: "Initial Consultation",
        recordingAvailable: false,
        notes: "Initial assessment completed. Prescribed medication and lifestyle changes.",
      },
    ],
  };

  const navigate = useNavigate();
  const location = useLocation();
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
  const ptemail = selectedRecord?.ptemail || "";

  const [state, setState] = useState({
    detailsActiveTab: "medical-records",
    billingActiveTab: "pharmacy",
  });
  const [uploadedFiles, setUploadedFiles] = useState({
    knownCaseFiles: [],
    vitalsFiles: [],
    dischargeSummaryFiles: [],
    prescriptionFiles: [],
    labTestFiles: [],
    pharmacyBillingFiles: [],
    labBillingFiles: [],
    hospitalBillingFiles: [],
    videoFiles: [],
  });
  const [showCamera, setShowCamera] = useState(false);
  const [currentSection, setCurrentSection] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isSending, setIsSending] = useState({ whatsapp: false, email: false });
  const [clinicalNotes, setClinicalNotes] = useState(mockData.medicalDetails);
  const [prescriptionData, setPrescriptionData] = useState([]);
  const [labTestsData, setLabTestsData] = useState([]);
  const [vitalsData, setVitalsData] = useState(mockData.vitalsData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [videoRecordings, setVideoRecordings] = useState([]);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideoBlob, setSelectedVideoBlob] = useState(null);
  const [selectedVideoMetadata, setSelectedVideoMetadata] = useState(null);

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

  const calculatedAge = displayAge || calculateAge(displayDob, selectedRecord?.dateOfVisit || selectedRecord?.dateOfAdmission || selectedRecord?.dateOfConsultation);

  const updateState = (updates) => setState((prev) => ({ ...prev, ...updates }));

  const getInitials = (name) => {
    if (!name) return "NA";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
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
        doctorName: "Dr. Kavya Patil",
        videoBlob: video.blob,
        metadata: video.metadata,
      }))
      .sort((a, b) => b.metadata.timestamp - a.metadata.timestamp);
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

  useEffect(() => {
    fetchClinicalNotes();
    fetchLabTests();
    fetchVitalsData();
    setVideoRecordings(fetchVideoRecordings());
  }, [hospitalName, displayEmail, refreshTrigger]);

  useEffect(() => {
    fetchPrescriptions();
  }, [displayEmail]);

  const handleSecondOpinion = () => {
    const recordToPass = {
      ...selectedRecord,
      medicalDetails: mockData.medicalDetails,
      prescriptionsData: prescriptionData.length > 0 ? prescriptionData : mockData.prescriptionsData,
      labTestsData: labTestsData.length > 0 ? labTestsData : mockData.billingData.labs,
      patientName: displayPatientName,
      age: calculatedAge,
      sex: displayGender,
      hospitalName: hospitalName,
      diagnosis: displayDiagnosis || clinicalNotes?.diagnosis || mockData.medicalDetails.diagnosis,
      dateOfVisit: selectedRecord.dateOfVisit || selectedRecord.dateOfAdmission || selectedRecord.dateOfConsultation || "N/A",
      "K/C/O": selectedRecord["K/C/O"] ?? "--",
      vitals: vitalsData || {},
    };
    navigate("/doctordashboard/second-opinion", { state: { selectedRecord: recordToPass } });
  };

  const handleBack = () => {
    navigate("/doctordashboard/medical-record", {
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

  const handleFileUpload = (event, section) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'video/mp4', 'video/quicktime'];
      return validTypes.includes(file.type);
    });
    if (validFiles.length !== files.length) {
      alert('Some files were not uploaded. Only .jpg, .png, .pdf, .docx, .txt, .mp4, and .mov files are allowed.');
    }
    setUploadedFiles(prev => ({
      ...prev,
      [section]: [...prev[section], ...validFiles]
    }));
  };

  const handleRemoveFile = (section, fileIndex) => {
    setUploadedFiles(prev => ({
      ...prev,
      [section]: prev[section].filter((_, index) => index !== fileIndex)
    }));
  };

  const handleCameraClick = (section) => {
    setCurrentSection(section);
    setShowCamera(true);
  };

  const handleCameraCapture = (file) => {
    if (currentSection) {
      setUploadedFiles(prev => ({
        ...prev,
        [currentSection]: [...prev[currentSection], file]
      }));
      const imageUrl = URL.createObjectURL(file);
      setCapturedImage(imageUrl);
      setShowPreviewModal(true);
    }
    setShowCamera(false);
  };

  const handleSendWhatsApp = async (phoneNumber, imageUrl) => {
    setIsSending(prev => ({ ...prev, whatsapp: true }));
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert(`Document sent to WhatsApp: ${phoneNumber}`);
      setShowPreviewModal(false);
    } catch (error) {
      alert('Failed to send WhatsApp message');
    } finally {
      setIsSending(prev => ({ ...prev, whatsapp: false }));
    }
  };

  const handleSendEmail = async (emailAddress, imageUrl) => {
    setIsSending(prev => ({ ...prev, email: true }));
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert(`Document sent to email: ${emailAddress}`);
      setShowPreviewModal(false);
    } catch (error) {
      alert('Failed to send email');
    } finally {
      setIsSending(prev => ({ ...prev, email: false }));
    }
  };

  const handlePrintDocument = (imageUrl) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head><title>Print Document</title></head>
        <body style="margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh;">
          <img src="${imageUrl}" style="max-width: 100%; max-height: 100%; object-fit: contain;" />
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
    setShowPreviewModal(false);
  };

  const renderUploadSection = (sectionKey, title) => {
    if (!selectedRecord?.isNewlyAdded) return null;
    const files = uploadedFiles[sectionKey] || [];
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex justify-end mb-3">
          <button
            onClick={() => handleCameraClick(sectionKey)}
            className="flex items-center justify-center bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
            title="Take Photo"
          >
            <Camera size={20} />
          </button>
        </div>
        <h4 className="font-semibold text-blue-800 mb-2">{title}</h4>
        <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 text-center">
          <DocsReader onFileUpload={(event) => handleFileUpload(event, sectionKey)} />
        </div>
        {files.length > 0 && (
          <div className="mt-2 space-y-1">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-white rounded-lg border border-blue-200 p-2">
                <span className="text-sm font-medium text-blue-800 truncate">{file.name}</span>
                <button
                  onClick={() => handleRemoveFile(sectionKey, index)}
                  className="text-red-600 hover:text-red-800"
                  title="Remove"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderTabContent = () => {
    if (selectedRecord?.isNewlyAdded) {
      switch (state.detailsActiveTab) {
        case "medical-records":
          return (
            <div>
              {renderUploadSection("vitalsFiles", "Upload Vital Signs Records")}
              {renderUploadSection("knownCaseFiles", "Upload Medical Information")}
              {selectedRecord.type === "IPD" && renderUploadSection("dischargeSummaryFiles", "Upload Discharge Summary")}
            </div>
          );
        case "prescriptions":
          return renderUploadSection("prescriptionFiles", "Upload Prescription");
        case "lab-tests":
          return renderUploadSection("labTestFiles", "Upload Lab Test Report");
        case "billing":
          const uploadInfo = getBillingUploadSection();
          return renderUploadSection(uploadInfo.key, uploadInfo.title);
        case "video":
          return renderUploadSection("videoFiles", "Upload Video Consultation Records");
        default:
          return null;
      }
    }
   const tabContentMap = {
  "medical-records": (
    <div className="space-y-6">
      {/* Header */}
   <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 md:mb-6 gap-3">
  {/* Left Section */}
  <div className="flex items-center gap-2 md:gap-3">
    <FileText
      size={18}
      className="md:size-[24px] text-[var(--primary-color)]"
    />
    <h3 className="text-base sm:text-lg md:text-xl font-semibold">
      Medical Information
    </h3>
  </div>

  {/* Button Section */}
  <button className="px-3 py-1 bg-[var(--primary-color)] text-white rounded-lg hover:opacity-90 transition-opacity text-sm self-start md:self-auto">
    View Original
  </button>
</div>




      {/* Loading / Error / Content */}
      {loading ? (
        <div className="text-center py-8">Loading clinical notes...</div>
      ) : error ? (
        <div className="text-center text-gray-600 py-8">{error}</div>
      ) : clinicalNotes ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          {[
            { label: "Chief Complaint", value: clinicalNotes.chiefComplaint || clinicalNotes.chiefcomplaint || "N/A" },
            { label: "Past History", value: clinicalNotes.pastHistory || clinicalNotes.History || "N/A" },
            { label: "Advice", value: clinicalNotes.treatmentAdvice || clinicalNotes.Advice || "N/A" },
            { label: "Plan", value: clinicalNotes.Plan || "N/A" },
          ].map((item, index) => (
            <div
              key={index}
              className="bg-white p-4 sm:p-6 rounded-xl border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="font-bold text-sm text-gray-600 mb-2">{item.label}</div>
              <div className="text-gray-800 text-sm break-words">{item.value}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-600 py-8">
          No clinical notes found for this patient and hospital.
        </div>
      )}

      {/* Discharge Summary (only for IPD) */}
      {selectedRecord?.type === "IPD" && (
        <div className="mt-6">
          <div className="flex items-center gap-3 mb-4">
            <FileCheck size={24} className="text-green-600" />
            <h3 className="h3-heading">Discharge Summary</h3>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-100">
            <div className="font-bold text-sm text-gray-600 mb-2">Summary</div>
            <div className="text-gray-800 text-sm break-words">
              {clinicalNotes?.dischargeSummary || "N/A"}
            </div>
          </div>
        </div>
      )}
    </div>
  ),

  "prescriptions": (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Pill size={20} className="text-purple-600" />
        <h4 className="h4-heading">Prescribed Medications</h4>
      </div>
      {loading ? (
        <div className="text-center py-8">Loading prescriptions...</div>
      ) : prescriptionData.length > 0 ? (
        <div className="overflow-x-auto">
          <DynamicTable
            columns={[
              { header: "Date", accessor: "date" },
              { header: "Doctor Name", accessor: "doctorName" },
              { header: "Medicines", accessor: "medicines" },
              { header: "Instructions", accessor: "instructions" },
            ]}
            data={prescriptionData}
          />
        </div>
      ) : (
        <div className="text-center text-gray-600 py-8">
          No prescriptions found for this patient.
        </div>
      )}
    </div>
  ),

  "lab-tests": (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <TestTube size={24} className="text-orange-600" />
        <h4 className="h4-heading">Test Results History</h4>
      </div>
      {loading ? (
        <div className="text-center py-8">Loading lab tests...</div>
      ) : error ? (
        <div className="text-center text-gray-600 py-8">{error}</div>
      ) : labTestsData.length > 0 ? (
        <div className="overflow-x-auto">
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
                  <span
                    className={`text-sm font-semibold px-2 py-1 rounded-full ${
                      row.status === "Normal"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {row.status === "Normal" ? (
                      <CheckCircle size={12} className="inline mr-1" />
                    ) : (
                      <AlertTriangle size={12} className="inline mr-1" />
                    )}
                    {row.status}
                  </span>
                ),
              },
              {
                header: "Print",
                accessor: "print",
                cell: (row) => (
                  <button
                    className="edit-btn flex items-center gap-1"
                    onClick={() => printLabTest(row)}
                  >
                    <Printer size={14} /> Print
                  </button>
                ),
              },
            ]}
            data={labTestsData}
          />
        </div>
      ) : (
        <div className="text-center text-gray-600 py-8">No lab tests found.</div>
      )}
    </div>
  ),

  "billing": (
    <div className="space-y-6">
      <div className="overflow-x-auto">
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
                    <span
                      className={`text-sm font-semibold px-2 py-1 rounded-full ${
                        row.paymentStatus === "Paid"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
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
                    <span
                      className={`text-sm font-semibold px-2 py-1 rounded-full ${
                        row.status === "Paid"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
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
          onTabChange={(tab) => updateState({ billingActiveTab: tab })}
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
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Video size={24} className="text-indigo-600" />
        <h4 className="h4-heading">Video Consultation History</h4>
      </div>
      {videoRecordings.length > 0 ? (
        <div className="overflow-x-auto">
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
                    className="edit-btn flex items-center gap-1"
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
                    <Video size={14} /> View Recording
                  </button>
                ),
              },
            ]}
            data={videoRecordings}
          />
        </div>
      ) : (
        <div className="text-center text-gray-600 py-8">
          No video recordings found.
        </div>
      )}
    </div>
  ),
};

    return tabContentMap[state.detailsActiveTab] || null;
  };

  const getBillingUploadSection = () => {
    switch (state.billingActiveTab) {
      case "pharmacy":
        return { key: "pharmacyBillingFiles", title: "Upload Pharmacy Bills" };
      case "labs":
        return { key: "labBillingFiles", title: "Upload Lab Bills" };
      case "hospital":
        return { key: "hospitalBillingFiles", title: "Upload Hospital Bills" };
      default:
        return { key: "pharmacyBillingFiles", title: "Upload Pharmacy Bills" };
    }
  };

  if (!selectedRecord) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">
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

// create a new array including the refer tab
const allTabs = [
  ...detailsTabs,
  { id: "refer", label: "Refer to Doctor", icon: Stethoscope },
];
  return (
    <ErrorBoundary>
      <div className="p-6 space-y-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 hover:text-[var(--accent-color)] transition-colors text-gray-600"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back to Medical Records</span>
        </button>
        {selectedRecord?.isNewlyAdded && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-blue-800">
              <Upload size={20} />
              <span className="font-medium">New Hospital Record</span>
            </div>
            <p className="text-sm text-blue-700 mt-1">
              This is a newly added hospital record. You can upload files in the relevant sections below.
            </p>
          </div>
        )}

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
       <div className="space-y-6">
  <div className="flex justify-between items-center">
    <div className="flex items-center gap-2">
      <Activity size={20} className="text-green-600" />
      <h3 className="h4-heading">Vitals Summary</h3>
    </div>
  </div>

  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
    {[
      { key: "bloodPressure", icon: Heart, label: "Blood Pressure", value: vitalsData.bloodPressure, classes: "bg-red-50 border-red-500 text-red-700" },
      { key: "heartRate", icon: Activity, label: "Heart Rate", value: vitalsData.heartRate, classes: "bg-blue-50 border-blue-500 text-blue-700" },
      { key: "temperature", icon: Thermometer, label: "Temperature", value: vitalsData.temperature, classes: "bg-orange-50 border-orange-500 text-orange-700" },
      { key: "spO2", icon: null, label: "SpO₂", value: vitalsData.spo2, classes: "bg-emerald-50 border-emerald-500 text-emerald-700" },
      { key: "respiratoryRate", icon: null, label: "Respiratory Rate", value: vitalsData.respiratoryRate, classes: "bg-violet-50 border-violet-500 text-violet-700" },
      { key: "height", icon: null, label: "Height", value: vitalsData.height, classes: "bg-cyan-50 border-cyan-500 text-cyan-700" },
      { key: "weight", icon: null, label: "Weight", value: vitalsData.weight, classes: "bg-amber-50 border-amber-500 text-amber-700" },
    ].map(({ key, icon: Icon, label, value, classes }) => (
      <div
        key={key}
        className={`p-3 rounded-lg shadow-md border-l-4 ${classes}`}
      >
        <div className="flex items-center gap-1 mb-1">
          {Icon && <Icon size={16} className={classes.split(" ")[2]} />}
          <span className="text-xs font-medium">{label}</span>
        </div>
        <div className="text-base font-semibold">
          {value || "--"}
        </div>
      </div>
    ))}
  </div>
</div>

{/* Desktop View: Tabs + Right-aligned "Refer to Doctor" button */}
<div className="hidden sm:flex mb-3 sm:mb-4 overflow-x-auto custom-scrollbar justify-between">
  <div className="flex">
    {detailsTabs.map((tab) => {
      const IconComponent = tab.icon;
      return (
        <button
          key={tab.id}
          onClick={() => updateState({ detailsActiveTab: tab.id })}
          className={`flex-shrink-0 flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-2 font-medium transition-colors duration-300 whitespace-nowrap ${
            state.detailsActiveTab === tab.id
              ? "border-b-2 text-[var(--primary-color)] border-[var(--primary-color)]"
              : "text-gray-500 hover:text-[var(--accent-color)]"
          }`}
        >
          <IconComponent size={14} />
          <span className="text-xs sm:text-sm">{tab.label}</span>
        </button>
      );
    })}
  </div>
  {selectedRecord?.type && !selectedRecord?.isNewlyAdded && (
    <div className="flex-shrink-0">
      <button
        onClick={handleSecondOpinion}
        className="btn btn-primary text-white px-2 sm:px-4 py-1 sm:py-2 text-xs flex items-center gap-1 hover:opacity-90 transition-opacity"
      >
        <Stethoscope size={14} />
        <span className="text-xs sm:text-sm">Refer to Doctor</span>
      </button>
    </div>
  )}
</div>

{/* Mobile View: Tabs + Inline "Refer to Doctor" button */}
<div className="flex sm:hidden mb-3 sm:mb-4 overflow-x-auto custom-scrollbar">
  {detailsTabs.map((tab) => {
    const IconComponent = tab.icon;
    return (
      <button
        key={tab.id}
        onClick={() => updateState({ detailsActiveTab: tab.id })}
        className={`flex-shrink-0 flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-2 font-medium transition-colors duration-300 whitespace-nowrap ${
          state.detailsActiveTab === tab.id
            ? "border-b-2 text-[var(--primary-color)] border-[var(--primary-color)]"
            : "text-gray-500 hover:text-[var(--accent-color)]"
        }`}
      >
        <IconComponent size={14} />
        <span className="text-xs sm:text-sm">{tab.label}</span>
      </button>
    );
  })}
  {selectedRecord?.type && !selectedRecord?.isNewlyAdded && (
    <div className="flex-shrink-0 flex justify-end ml-2">
      <button
        onClick={handleSecondOpinion}
        className="btn btn-primary text-white px-2 sm:px-4 py-1 sm:py-2 text-xs flex items-center gap-1 hover:opacity-90 transition-opacity"
      >
        <Stethoscope size={14} />
        <span className="text-xs sm:text-sm">Refer to Doctor</span>
      </button>
    </div>
  )}
</div>





        <div className="animate-slide-fade-in">{renderTabContent()}</div>
        {showCamera && (
          <CameraCapture
            onCapture={handleCameraCapture}
            onClose={() => setShowCamera(false)}
          />
        )}
        <PreviewModal
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          capturedImage={capturedImage}
          onSendWhatsApp={handleSendWhatsApp}
          onSendEmail={handleSendEmail}
          onPrint={handlePrintDocument}
          isSending={isSending}
        />
        <VideoPlaybackModal
          show={showVideoModal}
          onClose={() => setShowVideoModal(false)}
          videoBlob={selectedVideoBlob}
          metadata={selectedVideoMetadata}
        />
      </div>
    </ErrorBoundary>
  );
};

export default MedicalRecordDetails;
