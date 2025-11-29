import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { createPortal } from "react-dom";
import DynamicTable from "../../../../components/microcomponents/DynamicTable";
import DocsReader from "../../../../components/DocsReader";
import ProfileCard from "../../../../components/microcomponents/ProfileCard";
import ReusableModal from "../../../../components/microcomponents/Modal";
import {
  FileText,
  Pill,
  TestTube,
  CreditCard,
  Stethoscope,
  Video,
  X,
} from "lucide-react";

import { useMedicalRecords } from "../../../../context-api/MedicalRecordsContext";
import medicalRecordImage from "../../../../assets/geminiIN1.png";
import prescriptionImage from "../../../../assets/prescriptionq.jpg";
import labReportImage from "../../../../assets/lab1.jpg";
import billingImage from "../../../../assets/PB4.jpeg";
import videoImage from "../../../../assets/videocalling.avif";
import Profile from "./MedicalRecordDetails/tabs/Profile";

import MedicalRecordTab from "./MedicalRecordDetails/tabs/MedicalRecordsTab";
import PrescriptionTab from "./MedicalRecordDetails/tabs/PrescriptionTab";
import LabTab from "./MedicalRecordDetails/tabs/LabTestsTab";
import BillingTab from "./MedicalRecordDetails/tabs/BillingTab";
import VideoTab from "./MedicalRecordDetails/tabs/VideoTab";
import VitalsTab from "./MedicalRecordDetails/tabs/VitalsTab";

// Generate initials from a name
export const getInitials = (name) => {
  if (!name) return "GP";
  const names = name.split(" ");
  let initials = names[0].substring(0, 1).toUpperCase();
  if (names.length > 1) {
    initials += names[names.length - 1].substring(0, 1).toUpperCase();
  }
  return initials;
};

// Format date to a readable string
const formatDisplayDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? "Invalid Date"
      : date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
};

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

const VideoPlaybackModal = ({ show, onClose, videoUrl, metadata }) => {
  if (!show) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-2 md:p-4">
      <div className="relative bg-white p-3 md:p-6 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg md:text-xl font-semibold">Consultation Recording</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            ×
          </button>
        </div>
        <div className="bg-black rounded-lg overflow-hidden">
          <video
            controls
            autoPlay
            className="w-full h-auto max-h-[70vh]"
            src={videoUrl}
            onError={(e) => {
              console.error("Video playback error:", e);
              e.target.error = null;
              e.target.src = "";
            }}
          >
            Your browser does not support the video tag.
          </video>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p>Recorded on: {metadata?.timestamp || "N/A"}</p>
          <p>Doctor: {metadata?.doctorName || "N/A"}</p>
          <p>Type: {metadata?.type || "N/A"}</p>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const ImageViewModal = ({ isOpen, onClose, imageUrl, title }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-2 sm:p-4">
      <div className="relative bg-white rounded-lg sm:rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-3 sm:p-4 border-b">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 truncate max-w-[80%]">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-1"
            aria-label="Close modal"
          >
            <X size={20} className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-2 sm:p-4">
          <div className="flex items-center justify-center h-full">
            <img
              src={imageUrl}
              alt={title}
              className="max-w-full max-h-[calc(90vh-80px)] sm:max-h-[calc(90vh-96px)] w-auto h-auto object-contain"
              style={{
                maxWidth: '100%',
                maxHeight: 'calc(100vh - 120px)',
                width: 'auto',
                height: 'auto'
              }}
            />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

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

const PatientMedicalRecordDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);
  
  // Image viewer state
  const [imageViewer, setImageViewer] = useState({
    isOpen: false,
    imageUrl: "",
    title: ""
  });

  // Map of tab names to their corresponding images and titles
  const tabImages = {
    'medical-records': {
      image: medicalRecordImage,
      title: 'Medical Record'
    },
    'prescriptions': {
      image: prescriptionImage,
      title: 'Prescription'
    },
    'lab-tests': {
      image: labReportImage,
      title: 'Lab Report'
    },
    'billing': {
      image: billingImage,
      title: 'Billing'
    },
    'video': {
      image: videoImage,
      title: 'Video Consultation'
    }
  };

  // Handle opening the image viewer
  const handleViewImage = (tab) => {
    if (tabImages[tab]) {
      setImageViewer({
        isOpen: true,
        imageUrl: tabImages[tab].image,
        title: tabImages[tab].title
      });
    }
  };

  // Handle closing the image viewer
  const handleCloseImageViewer = () => {
    setImageViewer(prev => ({ ...prev, isOpen: false }));
  };
  const [videoModal, setVideoModal] = useState({
    isOpen: false,
    videoBlob: null,
    metadata: null,
  });
  const { clickedRecord: selectedRecord, recordTab } = useMedicalRecords();
  const activeTab = recordTab;
  const patientId = selectedRecord?.patientId || selectedRecord?.patientID;
  const recordId =
    selectedRecord?.recordId ||
    selectedRecord?.id ||
    selectedRecord?.recordID ||
    selectedRecord?.opdId ||
    selectedRecord?.ipdId ||
    selectedRecord?.virtualId;

  // Debug log
  useEffect(() => {
    console.log("Selected Record:", selectedRecord);
    console.log("Patient ID:", patientId);
    console.log("Record ID:", recordId);
    console.log("Record Type:", recordTab);
  }, [selectedRecord, patientId, recordId, recordTab]);

  // State declarations
  const [labScansData, setLabScansData] = useState([]);
  const [labScansLoading, setLabScansLoading] = useState(false);
  const [labScansError, setLabScansError] = useState(null);

  // Fetch lab scans
  useEffect(() => {
    const fetchLabScans = async () => {
      if (!recordId) {
        console.warn("No recordId available to fetch lab scans");
        setLabScansError("No patient record selected");
        return;
      }
      try {
        setLabScansLoading(true);
        setLabScansError(null);
        console.log("Fetching lab scans for Patient ID:", patientId, "Record ID:", recordId);
        const recordType = recordTab?.toLowerCase() || "";
        const recordIdParam = `${recordType}RecordId`;
        const params = {
          patientId,
          [recordIdParam]: recordId,
        };
        console.log("Lab Scans API Request Params:", params);
        const response = await getLabScanByPatient(patientId, params);
        console.log("Lab Scans API Response:", response);
        if (response?.data) {
          const scans = Array.isArray(response.data) ? response.data : [response.data];
          setLabScansData(scans);
          if (scans.length === 0) {
            setLabScansError("No lab scans found for this patient");
          }
        } else {
          setLabScansError("No lab scan data available");
          setLabScansData([]);
        }
      } catch (error) {
        console.error("Error fetching lab scans:", error);
        setLabScansError(error.response?.data?.message || "Failed to load lab scans");
        setLabScansData([]);
      } finally {
        setLabScansLoading(false);
      }
    };
    fetchLabScans();
  }, [recordId, patientId, recordTab]);

  // Handle second opinion navigation
  const handleSecondOpinion = () => {
    navigate("/second-opinion", {
      state: {
        patientId,
        recordId,
        recordType: recordTab?.toLowerCase(),
        recordData: selectedRecord,
      },
    });
  };

  // Render medical grid with fade and blur effect for long text
const ScrollHintBox = ({ children, className = "" }) => {
  const ref = useRef(null);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const updateHint = () => {
      const hasOverflow = el.scrollHeight > el.clientHeight;
      setShowHint(hasOverflow && el.scrollTop === 0);
    };

    updateHint();
    el.addEventListener('scroll', updateHint);
    window.addEventListener('resize', updateHint);
    
    return () => {
      el.removeEventListener('scroll', updateHint);
      window.removeEventListener('resize', updateHint);
    };
  }, [children]);

  return (
    <div className="relative">
      <div 
        ref={ref} 
        className={`${className} max-h-16 overflow-y-auto`}
        style={{
          WebkitMaskImage: showHint 
            ? 'linear-gradient(to bottom, black 0%, black 70%, transparent 100%)' 
            : 'none',
          maskImage: showHint 
            ? 'linear-gradient(to bottom, black 0%, black 70%, transparent 100%)' 
            : 'none',
          scrollbarWidth: 'thin',
          scrollbarColor: '#cbd5e0 transparent'
        }}
      >
        {children}
      </div>
      {showHint && (
        <div 
          className="absolute bottom-0 left-0 right-0 h-6 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,1) 100%)'
          }}
        />
      )}
    </div>
  );
};

  const renderMedicalGrid = (fields = []) => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6 ml-6 mr-6">
        {fields.map((item, index) => {
          const isLongText = item.value && item.value.length > 100 && 
            ["Chief Complaint", "Past History", "Advice", "Plan", "Treatment Advice"].includes(item.label);
          
          return (
            <div
              key={index}
              className="bg-white p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl border border-gray-100 hover:shadow-md transition-shadow h-37"
            >
              <div className="font-semibold text-xs sm:text-sm md:text-base text-gray-600 mb-1 sm:mb-1.5 md:mb-2">
                {item.label}
              </div>
              <div className="relative h-full">
                {isLongText ? (
                  <ScrollHintBox>
                    <div className="text-gray-500 text-xs sm:text-sm md:text-sm pr-2">
                      {item.value}
                    </div>
                  </ScrollHintBox>
                ) : (
                  <div className="text-gray-500 text-xs sm:text-sm md:text-sm">
                    {item.value}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  // State for tab management
  const [state, setState] = useState({
    detailsActiveTab: "medical-records",
    billingActiveTab: "pharmacy",
  });
  const updateState = (updates) => setState((prev) => ({ ...prev, ...updates }));

  // Render tab content
  const renderTabContent = () => {
    const tabContentMap = {
  "medical-records": (
    <div>
      

       <div className="px-4 sm:px-6"> 




<div className="flex justify-between items-center mb-4 px-6">
  {/* Left Section */}
  <div className="flex items-center gap-2">
    <FileText
      size={18}
      className="sm:size-[20px] md:size-[24px] text-[var(--primary-color)]"
    />
    <h3 className="text-lg font-semibold">Medical Information</h3>
  </div>

  {/* Right Button */}
  <button
    onClick={() => handleViewImage('medical-records')}
    className="px-4 py-2 bg-primary btn-primary text-white rounded  text-sm whitespace-nowrap"
  >
    View Original
  </button>
</div>





</div>
      <MedicalRecordTab
        activeTab={activeTab}
        isExactPatient={isExactPatient}
        isExactDoctor={isExactDoctor}
        patientId={patientId}
        recordId={recordId}
        recordTab={recordTab}
        renderMedicalGrid={renderMedicalGrid}
      />
    </div>
  ),
  "prescriptions": (
    <div>
   



      <div className="flex justify-between items-center mb-4 px-6">
  {/* Left Section */}
  <div className="flex items-center gap-2">
    <Pill size={16} className="md:size-[20px] text-purple-600" />
             <h4 className="text-lg md:text-xl font-semibold">Prescriptions</h4>
  </div>

  {/* Right Button */}
  <button
          onClick={() => handleViewImage('prescriptions')}
          className="px-4 py-2 btn-primary text-white rounded  text-sm whitespace-nowrap"
        >
          View Original
        </button>
</div>
      <PrescriptionTab
        isExactPatient={isExactPatient}
        isExactDoctor={isExactDoctor}
        patientId={patientId}
        recordId={recordId}
        recordTab={recordTab}
      />
    </div>
  ),
  "lab-tests": (
    <div>
   


      
<div className="flex justify-between items-center mb-4 px-6">
  {/* Left Section */}
  <div className="flex items-center gap-2">
    <TestTube size={16} className="md:size-[20px] text-blue-600" />
    <h3 className="text-lg font-semibold" >Lab/Scan Reports</h3>
  </div>

  {/* Right Button */}
  <button
    onClick={() => handleViewImage('medical-records')}
    className="px-4 py-2 btn-primary text-white rounded  text-sm whitespace-nowrap"
  >
    View Original
  </button>
</div>

      <LabTab
        isExactPatient={isExactPatient}
        isExactDoctor={isExactDoctor}
        patientId={patientId}
        recordId={recordId}
        recordTab={recordTab}
      />
    </div>
  ),
  "billing": (
    <div>
     










      <div className="flex justify-between items-center mb-4 px-6">
  {/* Left Section */}
  <div className="flex items-center gap-2">
    <CreditCard size={16} className="md:size-[20px] text-gray-600" />
    <h3 className="text-lg font-semibold">Billing</h3>
  </div>

  {/* Right Button */}
  <button
    onClick={() => handleViewImage('billing')}
    className="px-4 py-2 btn-primary text-white rounded  text-sm whitespace-nowrap"
  >
    View Original
  </button>
</div>
      <BillingTab
        isExactPatient={isExactPatient}
        isExactDoctor={isExactDoctor}
        patientId={patientId}
        recordId={recordId}
        recordTab={recordTab}
        state={state}
        setState={setState}
      />
    </div>
  ),
  "video": (
    <div>


        <div className="flex justify-between items-center mb-4 px-6">
  {/* Left Section */}
  <div className="flex items-center gap-2">
     <Video size={16} className="md:size-[20px] text-red-600" />
    <h3 className="text-lg font-semibold">Video Consultation</h3>
  </div>

  {/* Right Button */}
  <button
    onClick={() => handleViewImage('video')}
    className="px-4 py-2 btn-primary text-white rounded text-sm whitespace-nowrap"
  >
    View Original
  </button>
</div>
      {/* <div className="flex justify-between items-center mb-4 px-6">
        <h3 className="text-lg font-semibold">Video Consultation</h3>
        <button
          onClick={() => handleViewImage('video')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
        >
          View Original
        </button>
      </div> */}
      <VideoTab
        isExactPatient={isExactPatient}
        isExactDoctor={isExactDoctor}
        patientId={patientId}
        recordId={recordId}
        recordTab={recordTab}
        setVideoModal={setVideoModal}
      />
    </div>
  )
};
    return tabContentMap[state.detailsActiveTab] || null;
  };

  // Derived values
  const hospitalName =
    selectedRecord?.hospitalname || selectedRecord?.hospitalName || "AV Hospital";
  const visitDate =
    selectedRecord?.dateOfVisit ||
    selectedRecord?.dateOfAdmission ||
    selectedRecord?.dateOfConsultation ||
    "N/A";
  const diagnosis = selectedRecord?.diagnosis || selectedRecord?.chiefComplaint || "";
  const displayDiagnosis = diagnosis || "No diagnosis available";
  const doctorId = selectedRecord?.doctorId || "Not available";
  const patientName = selectedRecord?.patientName || selectedRecord?.name || "Guest Patient";
  const displayPatientName = patientName || "Guest Patient";
  const email = selectedRecord?.email || selectedRecord?.ptemail || "";
  const phone = selectedRecord?.phone || "";
  const rawGender = selectedRecord?.gender || selectedRecord?.sex || "";
  const rawDob = selectedRecord?.dob || "";
  const uploadedBy = selectedRecord?.uploadedBy;
  const uploadedByUpper = String(uploadedBy || "").toUpperCase();
  const isExactPatient = uploadedByUpper === "PATIENT";
  const isExactDoctor = uploadedByUpper === "DOCTOR";
  const isDoctorUploaded = isExactDoctor;

  // Format gender and age
  const displayGender = rawGender
    ? rawGender.charAt(0).toUpperCase() + rawGender.slice(1).toLowerCase()
    : "";
  const displayAge = rawDob
    ? (() => {
        const birthDate = new Date(rawDob);
        if (isNaN(birthDate.getTime())) return "";
        const diff = Date.now() - birthDate.getTime();
        const ageDate = new Date(diff);
        return Math.abs(ageDate.getUTCFullYear() - 1970) + " years";
      })()
    : "";

  // Profile fields
  const profileFields = [
    { label: "Age", value: displayAge },
    { label: "Gender", value: displayGender },
    { label: "Hospital", value: hospitalName },
    ...(String(activeTab || "").toUpperCase() === "IPD"
      ? [
        {
          label: "Date of Admission",
          value: formatDisplayDate(selectedRecord.dateOfAdmission),
        },
        {
          label: "Date of Discharge",
          value: formatDisplayDate(selectedRecord.dateOfDischarge),
        },
      ]
      : [
          {
            label: "Visit Date",
            value: formatDisplayDate(
              selectedRecord.dateOfVisit ||
                selectedRecord.dateOfAdmission ||
                selectedRecord.dateOfConsultation
            ),
          },
        ]),
    { label: "Diagnosis", value: displayDiagnosis },
    { label: "K/C/O", value: selectedRecord["K/C/O"] ?? "--" },
  ];

  // Details tabs
  const detailsTabs = [
    { id: "medical-records", label: "Medical Records", icon: FileText },
    { id: "prescriptions", label: "Prescriptions", icon: Pill },
    { id: "lab-tests", label: "Lab/Scan", icon: TestTube },
    { id: "billing", label: "Billing", icon: CreditCard },
    ...(String(activeTab).toUpperCase() === "VIRTUAL" ? [{ id: "video", label: "Video", icon: Video }] : []),
  ];

  // Main render
  if (!selectedRecord) {
    return (
      <div className="p-4 md:p-6">
        <div className="text-center text-gray-500 text-sm md:text-base">
          No record selected. Please go back and select a record.
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="p-3 md:p-6 space-y-4 md:space-y-6">
        <VideoPlaybackModal
          show={videoModal.isOpen}
          onClose={() => setVideoModal({ isOpen: false, videoBlob: null, metadata: null })}
          videoUrl={videoModal.videoBlob}
          metadata={videoModal.metadata}
        />
        <Profile
          displayPatientName={displayPatientName}
          profileFields={profileFields}
          getInitials={getInitials}
        />
        <VitalsTab
          isExactPatient={isExactPatient}
          isExactDoctor={isExactDoctor}
          patientId={patientId}
          recordId={recordId}
          recordTab={recordTab}
        />
        <div className="w-full border-b border-gray-200">
          <div className="flex items-center justify-between overflow-x-auto custom-scrollbar px-2 sm:px-0">
            <div className="flex gap-2 sm:gap-4">
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
                      ${
                        isActive
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
            </div>
            {(() => {
              // Data checks are now handled in child components, so we'll always show the second opinion button
              const hasAnyData = true;
              if (!isExactPatient || hasAnyData) {
                return (
                  <button
                    onClick={handleSecondOpinion}
                    className="px-4 py-2 bg-[var(--primary-color)] text-white rounded-full flex items-center gap-2 shadow-sm hover:bg-[var(--primary-color)] transition-all text-sm font-semibold"
                    style={{ minWidth: "fit-content" }}
                  >
                    <Stethoscope size={16} />
                    <span>Second Opinion</span>
                  </button>
                );
              }
              return null;
            })()}
          </div>
        </div>
      </div>
      <div className="animate-slide-fade-in  scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {renderTabContent()}
      </div>
      <VideoPlaybackModal
        show={videoModal.isOpen}
        onClose={() => setVideoModal({ ...videoModal, isOpen: false })}
        videoUrl={videoModal.videoBlob}
        metadata={videoModal.metadata}
      />
      <ImageViewModal
        isOpen={imageViewer.isOpen}
        onClose={handleCloseImageViewer}
        imageUrl={imageViewer.imageUrl}
        title={imageViewer.title}
      />
    </ErrorBoundary>
  );
};

export default PatientMedicalRecordDetails;
