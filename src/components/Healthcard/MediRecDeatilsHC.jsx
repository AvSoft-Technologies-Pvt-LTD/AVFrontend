import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { createPortal } from "react-dom";
import DynamicTable from "../../components/microcomponents/DynamicTable";
import DocsReader from "../../components/DocsReader";
import ProfileCard from "../../components/microcomponents/ProfileCard";
// import ReusableModal from "../../../../components/microcomponents/Modal";
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
  Video,
  X,
  Receipt,
} from "lucide-react";
import {
  getPatientVitalById,
  getLabScanByPatient,
  getHospitalBilling,
  getLabBilling,
  getPharmacyBilling,
  getPatientMedicalInfo,
  getPatientPrescriptionsData,
  getPatientById,
  getVideoConsultationByPatient,
} from "../../utils/masterService";
import { useMedicalRecords } from "../../context-api/MedicalRecordsContext";
import medicalRecordImage from '../../assets/geminiIN1.png';
import prescriptionImage from '../../assets/prescriptionq.jpg';
import labReportImage from '../../assets/lab1.jpg';
import billingImage from '../../assets/PB4.jpeg';
import videoImage from '../../assets/videocalling.avif';

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

const VideoPlaybackModal = ({ show, onClose, videoUrl, metadata }) => {
  if (!show) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-2 md:p-4">
      <div className="relative bg-white p-3 md:p-6 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg md:text-xl font-semibold">Consultation Recording</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
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
          <p>Recorded on: {metadata?.timestamp || 'N/A'}</p>
          <p>Doctor: {metadata?.doctorName || 'N/A'}</p>
          <p>Type: {metadata?.type || 'N/A'}</p>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="relative bg-white rounded-xl w-auto max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-4">
          <img
            src={imageUrl}
            alt={title}
            className="w-auto me-5 max-w-full h-auto max-h-[70vh] object-contain"
            style={{ width: 'auto', minWidth: '600px' }}
          />
        </div>
      </div>
    </div>,
    document.body
  );
};

const MediRecDeatilsHC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);
  const [imageModal, setImageModal] = useState({
    isOpen: false,
    imageUrl: "",
    title: "",
  });
  const [videoModal, setVideoModal] = useState({
    isOpen: false,
    videoUrl: null,
    metadata: null
  });
  const { clickedRecord: selectedRecord, recordTab } = useMedicalRecords();
  const activeTab = recordTab;
  const recordId = selectedRecord?.recordId || selectedRecord?.id || selectedRecord?.recordID;
  const [hospitalBillingData, setHospitalBillingData] = useState([]);
  const [labBillingData, setLabBillingData] = useState([]);
  const [pharmacyBillingData, setPharmacyBillingData] = useState([]);
  const [, setBillingLoading] = useState(false);
  const [, setBillingError] = useState(null);
  const ContextTab = activeTab;
  const hospitalName = selectedRecord?.hospitalname || selectedRecord?.hospitalName || "AV Hospital";
  const visitDate = selectedRecord?.dateOfVisit || selectedRecord?.dateOfAdmission || selectedRecord?.dateOfConsultation || "N/A";
  const diagnosis = selectedRecord?.diagnosis || selectedRecord?.chiefComplaint || "";
  const doctorId = selectedRecord?.doctorId || "Not available";
  const patientName = selectedRecord?.patientName || selectedRecord?.name || "Guest Patient";
  const email = selectedRecord?.email || selectedRecord?.ptemail || "";
  const phone = selectedRecord?.phone || "";
  const rawGender = selectedRecord?.gender || selectedRecord?.sex || "";
  const rawDob = selectedRecord?.dob || "";
  const uploadedBy = selectedRecord?.uploadedBy;
  const uploadedByUpper = String(uploadedBy || "").toUpperCase();
  const isExactPatient = uploadedByUpper === "PATIENT";
  const isExactDoctor = uploadedByUpper === "DOCTOR";

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

  const [patientBasics, setPatientBasics] = useState({ dob: null, gender: null, age: null });

  useEffect(() => {
    const pid = selectedRecord?.patientId;
    if (!pid) return;
    let mounted = true;
    (async () => {
      try {
        const res = await getPatientById(pid);
        const data = res?.data?.data || res?.data || {};
        const fetchedDob = data.dob || data.dateOfBirth || null;
        const fetchedGender = data.gender || data.sex || null;
        const computedAge = fetchedDob && visitDate ? calculateAge(fetchedDob, visitDate) : null;
        if (mounted) {
          setPatientBasics({ dob: fetchedDob, gender: fetchedGender, age: computedAge });
        }
      } catch (err) {
        console.error("Failed to fetch patient basics:", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [selectedRecord?.patientId, visitDate]);

  const formatDisplayDate = (value) => {
    if (!value) return "N/A";
    if (typeof value === "string" && /^\d{8}$/.test(value)) {
      const year = value.slice(0, 4);
      const month = value.slice(4, 6);
      const day = value.slice(6, 8);
      return `${day}/${month}/${year}`;
    }
    const d = new Date(value);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString("en-GB");
    }
    return String(value);
  };

  const ScrollHintBox = ({ children, className = "" }) => {
    const ref = useRef(null);
    const [showHint, setShowHint] = useState(false);
    useEffect(() => {
      const el = ref.current;
      if (!el) return;
      const updateHint = () => {
        const hasOverflow = el.scrollHeight > el.clientHeight + 1;
        if (!hasOverflow) {
          setShowHint(false);
          return;
        }
        const atTop = el.scrollTop <= 1;
        setShowHint(atTop);
      };
      updateHint();
      const ro = new ResizeObserver(updateHint);
      ro.observe(el);
      window.addEventListener("resize", updateHint);
      el.addEventListener("scroll", updateHint);
      return () => {
        ro.disconnect();
        window.removeEventListener("resize", updateHint);
        el.removeEventListener("scroll", updateHint);
      };
    }, [children]);
    return (
      <div ref={ref} className={`${className} relative`}>
        {children}
        {showHint && (
          <div className="pointer-events-none absolute bottom-1 right-2 text-gray-500 text-sm select-none">…</div>
        )}
        {showHint && (
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white/90 to-transparent"></div>
        )}
      </div>
    );
  };

  const renderMedicalGrid = (fields = []) => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6 ml-6 mr-6">
        {fields.map((item, index) => (
          <div
            key={index}
            className="bg-white p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl border border-gray-100 hover:shadow-md transition-shadow h-37"
          >
            <div className="font-semibold text-xs sm:text-sm md:text-base text-gray-600 mb-1 sm:mb-1.5 md:mb-2">
              {item.label}
            </div>
            {["Chief Complaint", "Past History", "Advice", "Plan"].includes(item.label) ? (
              <ScrollHintBox className="max-h-16 cc-scroll-wrapper cc-scrollbar pr-1">
                <div className="text-gray-500 text-xs sm:text-sm md:text-sm">
                  {item.value}
                </div>
              </ScrollHintBox>
            ) : (
              <div className="text-gray-500 text-xs sm:text-sm md:text-sm">
                {item.value}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const effectiveDob = patientBasics.dob || rawDob;
  const effectiveGender = patientBasics.gender || rawGender;
  const displayAge = useMemo(
    () => patientBasics.age || calculateAge(effectiveDob, visitDate),
    [patientBasics.age, effectiveDob, visitDate]
  );
  const displayDob = effectiveDob || "N/A";
  const displayEmail = email || "N/A";
  const displayPatientName = patientName || "Guest Patient";
  const displayGender = effectiveGender || "N/A";
  const displayPhone = phone || "N/A";
  const symptomsFromRecord = Array.isArray(selectedRecord?.symptomNames)
    ? selectedRecord.symptomNames.filter(Boolean).join(", ")
    : "";
  const displayDiagnosis = symptomsFromRecord || diagnosis || "N/A";
  const [state, setState] = useState({
    detailsActiveTab: "medical-records",
    billingActiveTab: "pharmacy",
  });
  const isDoctorUploaded = Boolean(
    selectedRecord?.isVerified ||
    selectedRecord?.hasDischargeSummary ||
    (selectedRecord?.createdBy && String(selectedRecord.createdBy).toLowerCase() === "doctor") ||
    (selectedRecord?.uploadedBy && String(selectedRecord.uploadedBy).toLowerCase().includes("doctor"))
  );
  const [prescriptionData, setPrescriptionData] = useState([]);
  const [labTestsData] = useState([]);
  const [vitalsData, setVitalsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [, setError] = useState(null);
  const [medicalError, setMedicalError] = useState(null);
  const [prescriptionError, setPrescriptionError] = useState(null);
  const [videoRecordings, setVideoRecordings] = useState([]);
  const [labScansData, setLabScansData] = useState([]);
  const [medicalInfo, setMedicalInfo] = useState(null);

  const recordQueryParams = useMemo(() => {
    if (!recordId) return undefined;
    const tab = String(activeTab || "").toUpperCase();
    if (tab === "OPD") return { opdRecordId: recordId };
    if (tab === "IPD") return { ipdRecordId: recordId };
    if (tab === "VIRTUAL") return { virtualRecordId: recordId };
    return undefined;
  }, [recordId, activeTab]);

  const fetchMedicalInfo = async () => {
    if (!selectedRecord?.patientId) {
      setMedicalError("Patient ID is missing.");
      setMedicalInfo(null);
      return;
    }
    setLoading(true);
    setMedicalError(null);
    try {
      const response = await getPatientMedicalInfo(selectedRecord.patientId, recordQueryParams);
      const payload = response.data?.data ?? response.data;
      let normalized = null;
      if (Array.isArray(payload)) {
        normalized =
          payload.find((item) => {
            const itemId = item.id || item.recordId || item.recordID;
            const itemOpd = item.opdRecordId || item.opdId;
            const itemIpd = item.ipdRecordId || item.ipdId;
            const currentOpd = selectedRecord?.opdRecordId || selectedRecord?.opdId;
            const currentIpd = selectedRecord?.ipdRecordId || selectedRecord?.ipdId;
            return (
              (recordId && itemId && String(itemId) === String(recordId)) ||
              (currentOpd && itemOpd && String(itemOpd) === String(currentOpd)) ||
              (currentIpd && itemIpd && String(itemIpd) === String(currentIpd))
            );
          }) || payload[0];
      } else {
        normalized = payload;
      }
      if (normalized) {
        setMedicalInfo(normalized);
      } else {
        setMedicalInfo(null);
        setMedicalError("No medical info found.");
      }
    } catch (err) {
      console.error("Failed to fetch medical info:", err);
      setMedicalError(err.response?.data?.message || "Failed to fetch medical info.");
      setMedicalInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientPrescriptions = async () => {
    try {
      const response = await getPatientPrescriptionsData(
        selectedRecord.patientId,
        recordQueryParams
      );
      let prescriptions = response.data?.data || response.data;
      if (!Array.isArray(prescriptions)) {
        prescriptions = prescriptions ? [prescriptions] : [];
      }

      if (prescriptions.length > 0) {
        const formattedData = prescriptions.map((prescription) => {
          let medicinesText = '';
          let instructionsText = '';
          if (Array.isArray(prescription.medicines)) {
            medicinesText = prescription.medicines
              .filter(Boolean)
              .map(med => {
                if (typeof med === 'string') return med;
                return `${med.medicineName || ''} - ${med.dosage || ''} ${med.dosageUnit || ''} for ${med.duration || ''}`.trim();
              })
              .filter(Boolean)
              .join(', ');
            instructionsText = prescription.medicines
              .filter(Boolean)
              .map(med => {
                if (med.intake) return `Take ${med.intake}.`;
                if (med.instructions) return med.instructions;
                return null;
              })
              .filter(Boolean)
              .join(' ');
          } else if (typeof prescription.medicines === 'string') {
            medicinesText = prescription.medicines;
            instructionsText = prescription.instructions || '';
          }
          return {
            id: prescription.id,
            date: prescription.date ? new Date(prescription.date).toLocaleDateString() : 'N/A',
            doctorName: prescription.doctorName || 'N/A',
            medicines: medicinesText || 'N/A',
            instructions: instructionsText || 'N/A',
            patientId: prescription.patientId,
            opdRecordId: prescription.opdRecordId,
            ipdRecordId: prescription.ipdRecordId,
            virtualRecordId: prescription.virtualRecordId,
            documentUrl: prescription.documentUrl
          };
        });
        setPrescriptionData(formattedData);
      } else {
        setPrescriptionData([]);
      }
    } catch (err) {
      console.error("Failed to fetch patient prescriptions:", err);
      setPrescriptionError(
        err.response?.data?.message || "Failed to fetch prescriptions."
      );
      setPrescriptionData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchVitalsData = async () => {
    if (!selectedRecord?.patientId) {
      setVitalsData({
        bloodPressure: "--",
        heartRate: "--",
        temperature: "--",
        spO2: "--",
        respiratoryRate: "--",
        height: "--",
        weight: "--",
      });
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const vitalsParams = {
        ...(recordQueryParams || {}),
        consultationType: activeTab,
      };
      const response = await getPatientVitalById(selectedRecord.patientId, vitalsParams);
      const payload = response.data?.data ?? response.data;
      const patientVitals = Array.isArray(payload) ? payload[0] ?? null : payload;
      if (patientVitals) {
        const vitalsToSet = {
          bloodPressure: patientVitals.bloodPressure || patientVitals.blood_pressure || "--",
          heartRate: patientVitals.heartRate || patientVitals.heart_rate || "--",
          temperature: patientVitals.temperature || patientVitals.temp || "--",
          spO2: patientVitals.spO2 || patientVitals.spo2 || "--",
          respiratoryRate: patientVitals.respiratoryRate || patientVitals.respiratory_rate || "--",
          height: patientVitals.height || "--",
          weight: patientVitals.weight || "--",
          id: patientVitals.id,
        };
        setVitalsData(vitalsToSet);
      } else {
        setVitalsData({
          bloodPressure: "--",
          heartRate: "--",
          temperature: "--",
          spO2: "--",
          respiratoryRate: "--",
          height: "--",
          weight: "--",
        });
      }
    } catch (err) {
      console.error("Failed to fetch vitals:", err);
      setVitalsData({
        bloodPressure: "--",
        heartRate: "--",
        temperature: "--",
        spO2: "--",
        respiratoryRate: "--",
        height: "--",
        weight: "--",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchLabScans = async () => {
    if (!selectedRecord?.patientId) {
      setError("Patient ID is missing.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await getLabScanByPatient(selectedRecord.patientId, recordQueryParams);
      let scans = response.data;
      if (!Array.isArray(scans)) {
        scans = scans ? [scans] : [];
      }
      if (scans.length > 0) {
        const formattedData = scans.map((scan, index) => ({
          id: scan.id ?? index + 1,
          date: scan.date || new Date().toLocaleDateString(),
          scanName: scan.scanName || scan.testName || "N/A",
          result: scan.result || "Pending",
          normalRange: scan.normalRange || "N/A",
          status: scan.status || "Pending",
          fileUrl: scan.fileUrl || scan.documentUrl || null,
        }));
        setLabScansData(formattedData);
      } else {
        setLabScansData([]);
      }
    } catch (err) {
      console.error("Failed to fetch lab scans:", err);
      setError(err.response?.data?.message || "Failed to fetch lab scans.");
      setLabScansData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchVideoConsultations = async () => {
    if (!selectedRecord?.patientId) return;
    try {
      const response = await getVideoConsultationByPatient(
        selectedRecord.patientId,
        selectedRecord.recordId
      );
      if (response.data) {
        const recordings = Array.isArray(response.data) ? response.data : [response.data];
        const formattedRecordings = recordings.map(recording => ({
          id: recording.id,
          date: recording.visitDate ? new Date(recording.visitDate).toLocaleDateString() : 'N/A',
          type: recording.type || 'Virtual Consultation',
          doctorName: recording.doctorName || 'Doctor not specified',
          videoUrl: recording.actions,
          patientId: recording.patientId,
          virtualRecordId: recording.virtualRecordId
        }));
        setVideoRecordings(formattedRecordings);
      } else {
        setVideoRecordings([]);
      }
    } catch (error) {
      console.error('Error fetching video consultations:', error);
      setVideoRecordings([]);
    }
  };

  const fetchHospitalBilling = async () => {
    if (!selectedRecord?.patientId) return;
    setBillingLoading(true);
    try {
      const response = await getHospitalBilling(selectedRecord.patientId, recordQueryParams);
      let data = response.data?.data ?? response.data;
      if (!Array.isArray(data)) {
        data = data ? [data] : [];
      }
      setHospitalBillingData(data);
    } catch (err) {
      setBillingError(err.response?.data?.message || "Failed to fetch hospital billing.");
    } finally {
      setBillingLoading(false);
    }
  };

  const fetchLabBilling = async () => {
    if (!selectedRecord?.patientId) return;
    setBillingLoading(true);
    try {
      const response = await getLabBilling(selectedRecord.patientId, recordQueryParams);
      let data = response.data?.data ?? response.data;
      if (!Array.isArray(data)) {
        data = data ? [data] : [];
      }
      setLabBillingData(data);
    } catch (err) {
      setBillingError(err.response?.data?.message || "Failed to fetch lab billing.");
    } finally {
      setBillingLoading(false);
    }
  };

  const fetchPharmacyBilling = async () => {
    if (!selectedRecord?.patientId) return;
    setBillingLoading(true);
    try {
      const response = await getPharmacyBilling(selectedRecord.patientId, recordQueryParams);
      let data = response.data?.data ?? response.data;
      if (!Array.isArray(data)) {
        data = data ? [data] : [];
      }
      setPharmacyBillingData(data);
    } catch (err) {
      setBillingError(err.response?.data?.message || "Failed to fetch pharmacy billing.");
    } finally {
      setBillingLoading(false);
    }
  };

  const handleSecondOpinion = () => {
    const recordToPass = {
      ...selectedRecord,
      medicalDetails: medicalInfo,
      prescriptionsData: prescriptionData,
      labTestsData: labScansData,
    };
    navigate("/healthcard-second-opinion", { state: { selectedRecord: recordToPass } });
  };

  const getInitials = (name) => {
    if (!name) return "NA";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

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
        opdPatientData: location.state?.opdPatientData || {},
      },
    });
  };

  useEffect(() => {
    if (selectedRecord?.patientId) {
      if (state.detailsActiveTab === "medical-records") {
        fetchMedicalInfo();
        fetchVitalsData();
      }
      if (state.detailsActiveTab !== "medical-records") {
        fetchVitalsData();
      }
    }
  }, [
    selectedRecord,
    hospitalName,
    displayEmail,
    activeTab,
    state.detailsActiveTab,
    uploadedBy,
  ]);

  useEffect(() => {
    if (state.detailsActiveTab === "lab-tests") {
      if (isExactPatient) {
        fetchLabScans();
      } else if (isExactDoctor) {
        setLabScansData([]);
      } else {
        fetchLabScans();
      }
    }
  }, [selectedRecord, state.detailsActiveTab]);

  useEffect(() => {
    if (!selectedRecord?.patientId) return;
    if (state.detailsActiveTab !== "prescriptions") return;
    fetchPatientPrescriptions();
  }, [
    displayEmail,
    user.id,
    selectedRecord?.patientId,
    uploadedBy,
    state.detailsActiveTab,
    recordQueryParams,
  ]);

  useEffect(() => {
    if (state.detailsActiveTab === "billing") {
      if (isExactPatient) {
        fetchHospitalBilling();
        fetchLabBilling();
        fetchPharmacyBilling();
      } else if (isExactDoctor) {
        setHospitalBillingData([]);
        setLabBillingData([]);
        setPharmacyBillingData([]);
      } else {
        fetchHospitalBilling();
        fetchLabBilling();
        fetchPharmacyBilling();
      }
    }
  }, [state.detailsActiveTab, selectedRecord?.patientId]);

  useEffect(() => {
    if (state.detailsActiveTab === "video" && String(activeTab).toUpperCase() === "VIRTUAL") {
      fetchVideoConsultations();
    }
  }, [state.detailsActiveTab, activeTab, selectedRecord?.patientId, selectedRecord?.id]);

  useEffect(() => {
    const handleViewOriginalClick = (e) => {
      try {
        const btn = e.target.closest && e.target.closest('button');
        if (!btn) return;
        if (btn.innerText && btn.innerText.trim() === 'View Original') {
          e.preventDefault();
          const tab = state.detailsActiveTab;
          let imageUrl = medicalRecordImage;
          let title = 'Original Document';
          switch (tab) {
            case 'medical-records':
              imageUrl = medicalRecordImage;
              title = 'Original Medical Record';
              break;
            case 'prescriptions':
              imageUrl = prescriptionImage;
              title = 'Original Prescription';
              break;
            case 'lab-tests':
              imageUrl = labReportImage;
              title = 'Original Lab Report';
              break;
            case 'billing':
              imageUrl = billingImage;
              title = 'Original Bill';
              break;
            case 'video':
              imageUrl = videoImage;
              title = 'Original Video Snapshot';
              break;
            default:
              break;
          }
          setImageModal({ isOpen: true, imageUrl, title });
        }
      } catch (err) {
        console.error('View Original click handler error:', err);
      }
    };
    document.addEventListener('click', handleViewOriginalClick);
    return () => document.removeEventListener('click', handleViewOriginalClick);
  }, [state.detailsActiveTab]);

  const renderTabContent = () => {
    const tabContentMap = {
      "medical-records": (() => {
        if (isExactPatient) {
          if (loading)
            return (
              <div className="text-center py-6 md:py-8 text-sm md:text-base">
                Loading medical info...
              </div>
            );
          return medicalInfo ? (
            <div className="ml-6 mr-6 space-y-4 sm:space-y-5 md:space-y-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-3 sm:mb-4 md:mb-6 gap-2 sm:gap-3">
                <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3">
                  <FileText size={18} className="sm:size-[20px] md:size-[24px] text-[var(--primary-color)]" />
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold">Medical Information</h3>
                </div>
                <button className="px-2 sm:px-3 py-1 sm:py-1.5 bg-[var(--primary-color)] text-white rounded-md sm:rounded-lg hover:opacity-90 transition-opacity text-xs sm:text-sm self-start md:self-auto">View Original</button>
              </div>
              {medicalError ? (
                <div className="text-center text-gray-600 py-6 md:py-8 text-sm md:text-base">{medicalError}</div>
              ) : (
                renderMedicalGrid([
                  { label: "Chief Complaint", value: medicalInfo.chiefComplaint || "N/A" },
                  { label: "Past History", value: medicalInfo.pastHistory || "N/A" },
                  { label: "Advice", value: medicalInfo.advice || "N/A" },
                  { label: "Plan", value: medicalInfo.plan || "N/A" },
                  ...(String(activeTab || "").toUpperCase() === "IPD"
                    ? [{ label: "Discharge Summary", value: medicalInfo.dischargeSummary || "N/A" }]
                    : []),
                ])
              )}
            </div>
          ) : (
            <DocsReader />
          );
        }
        if (isExactDoctor) {
          if (loading)
            return (
              <div className="text-center py-6 md:py-8 text-sm md:text-base">
                Loading medical info...
              </div>
            );
          return medicalInfo ? (
            <div className="ml-6 mr-6 space-y-4 sm:space-y-5 md:space-y-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-3 sm:mb-4 md:mb-6 gap-2 sm:gap-3">
                <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3">
                  <FileText size={18} className="sm:size-[20px] md:size-[24px] text-[var(--primary-color)]" />
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold">Medical Information</h3>
                </div>
              </div>
              {medicalError ? (
                <div className="text-center text-gray-600 py-6 md:py-8 text-sm md:text-base">{medicalError}</div>
              ) : (
                renderMedicalGrid([
                  { label: "Chief Complaint", value: medicalInfo.chiefComplaint || "N/A" },
                  { label: "Past History", value: medicalInfo.pastHistory || "N/A" },
                  { label: "Advice", value: medicalInfo.advice || "N/A" },
                  { label: "Plan", value: medicalInfo.plan || "N/A" },
                  ...(String(activeTab || "").toUpperCase() === "IPD"
                    ? [{ label: "Discharge Summary", value: medicalInfo.dischargeSummary || "N/A" }]
                    : []),
                ])
              )}
            </div>
          ) : (
            <div className="text-center text-gray-600 py-6 md:py-8 text-sm md:text-base">Data not found</div>
          );
        }
        if (loading)
          return (
            <div className="text-center py-6 md:py-8 text-sm md:text-base">
              Loading medical info...
            </div>
          );
        return medicalInfo ? (
          <div className="ml-6 mr-6 space-y-4 sm:space-y-5 md:space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-3 sm:mb-4 md:mb-6 gap-2 sm:gap-3">
              <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3">
                <FileText size={18} className="sm:size-[20px] md:size-[24px] text-[var(--primary-color)]" />
                <h3 className="text-base sm:text-lg md:text-xl font-semibold">Medical Information</h3>
              </div>
              <button
                onClick={() =>
                  setImageModal({
                    isOpen: true,
                    imageUrl: "https://placehold.co/800x1000/png?text=Medical+Record+Sample",
                    title: "Original Medical Record",
                  })
                }
                className="px-2 sm:px-3 py-1 sm:py-1.5 bg-[var(--primary-color)] text-white rounded-md sm:rounded-lg hover:opacity-90 transition-opacity text-xs sm:text-sm self-start md:self-auto"
              >
                View Original
              </button>
            </div>
            {medicalError ? (
              <div className="text-center text-gray-600 py-6 md:py-8 text-sm md:text-base">{medicalError}</div>
            ) : (
              renderMedicalGrid([
                { label: "Chief Complaint", value: medicalInfo.chiefComplaint || "N/A" },
                { label: "Past History", value: medicalInfo.pastHistory || "N/A" },
                { label: "Advice", value: medicalInfo.advice || "N/A" },
                { label: "Plan", value: medicalInfo.plan || "N/A" },
                ...(String(activeTab || "").toUpperCase() === "IPD"
                  ? [{ label: "Discharge Summary", value: medicalInfo.dischargeSummary || "N/A" }]
                  : []),
              ])
            )}
          </div>
        ) : (
          <DocsReader />
        );
      })(),
      "prescriptions": isExactPatient ? (
        prescriptionData.length > 0 ? (
          <div className="ml-6 mr-6 space-y-4 md:space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-3 sm:mb-4 md:mb-6 gap-2 sm:gap-3">
              <div className="flex items-center gap-2 md:gap-3">
                <Pill size={16} className="md:size-[20px] text-purple-600" />
                <h4 className="text-lg md:text-xl font-semibold">Prescribed Medications</h4>
              </div>
              <button className="px-2 sm:px-3 py-1 sm:py-1.5 bg-[var(--primary-color)] text-white rounded-md sm:rounded-lg hover:opacity-90 transition-opacity text-xs sm:text-sm self-start md:self-auto">View Original</button>
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
              <DocsReader />
            )}
          </div>
        ) : (
          <DocsReader />
        )
      ) : isExactDoctor ? (
        prescriptionError ? (
          <div className="text-center text-gray-600 py-6 md:py-8 text-sm md:text-base">{prescriptionError}</div>
        ) : prescriptionData.length > 0 ? (
          <div className="ml-6 mr-6 space-y-4 md:space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-3 sm:mb-4 md:mb-6 gap-2 sm:gap-3">
              <div className="flex items-center gap-2 md:gap-3">
                <Pill size={16} className="md:size-[20px] text-purple-600" />
                <h4 className="text-lg md:text-xl font-semibold">Prescribed Medications</h4>
              </div>
              <button className="px-2 sm:px-3 py-1 sm:py-1.5 bg-[var(--primary-color)] text-white rounded-md sm:rounded-lg hover:opacity-90 transition-opacity text-xs sm:text-sm self-start md:self-auto">View Original</button>
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
        ) : (
          <div className="text-center text-gray-600 py-6 md:py-8 text-sm md:text-base">
            Data not found
          </div>
        )
      ) : null,
      "lab-tests": isExactPatient ? (
        labScansData.length > 0 ? (
          <div className="ml-6 mr-6 space-y-4 md:space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-3 sm:mb-4 md:mb-6 gap-2 sm:gap-3">
              <div className="flex items-center gap-2 md:gap-3">
                <TestTube size={16} className="md:size-[20px] text-blue-600" />
                <h4 className="text-lg md:text-xl font-semibold">Lab/Scan Reports</h4>
              </div>
              {labScansData.length > 0 && (
                <button
                  onClick={() => setImageModal({
                    isOpen: true,
                    imageUrl: "https://placehold.co/800x1000/png?text=Lab+Report+Sample",
                    title: "Original Lab Report"
                  })}
                  className="px-2 sm:px-3 py-1 sm:py-1.5 bg-[var(--primary-color)] text-white rounded-md sm:rounded-lg hover:opacity-90 transition-opacity text-xs sm:text-sm self-start md:self-auto"
                >
                  View Original
                </button>
              )}
            </div>
            {loading ? (
              <div className="text-center py-6 md:py-8 text-sm md:text-base">Loading lab scans...</div>
            ) : labScansData.length > 0 ? (
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <DynamicTable
                  columns={[
                    { header: "Date", accessor: "date" },
                    { header: "Scan Name", accessor: "scanName" },
                    { header: "Result", accessor: "result" },
                    { header: "Normal Range", accessor: "normalRange" },
                    { header: "Status", accessor: "status" },
                    {
                      header: "Actions",
                      accessor: "actions",
                      Cell: ({ row }) => (
                        <button
                          onClick={() => window.open(row.original.fileUrl, "_blank")}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          View
                        </button>
                      ),
                    },
                  ]}
                  showSearchBar={true}
                  data={labScansData}
                />
              </div>
            ) : (
              <div className="text-center text-gray-600 py-6 md:py-8 text-sm md:text-base">
                No lab scans found for this patient.
              </div>
            )}
          </div>
        ) : (
          <DocsReader />
        )
      ) : isExactDoctor ? (
        labScansData.length > 0 ? (
          <div className="ml-6 mr-6 space-y-4 md:space-y-6">
            <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
              <TestTube size={16} className="md:size-[20px] text-blue-600" />
              <h4 className="text-lg md:text-xl font-semibold">Lab/Scan Reports</h4>
            </div>
            {loading ? (
              <div className="text-center py-6 md:py-8 text-sm md:text-base">Loading lab scans...</div>
            ) : labScansData.length > 0 ? (
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <DynamicTable
                  columns={[
                    { header: "Date", accessor: "date" },
                    { header: "Scan Name", accessor: "scanName" },
                    { header: "Result", accessor: "result" },
                    { header: "Normal Range", accessor: "normalRange" },
                    { header: "Status", accessor: "status" },
                    {
                      header: "Actions",
                      accessor: "actions",
                      Cell: ({ row }) => (
                        <button
                          onClick={() => window.open(row.original.fileUrl, "_blank")}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          View
                        </button>
                      ),
                    },
                  ]}
                  showSearchBar={true}
                  data={labScansData}
                />
              </div>
            ) : (
              <div className="text-center text-gray-600 py-6 md:py-8 text-sm md:text-base">
                No lab scans found for this patient.
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-600 py-6 md:py-8 text-sm md:text-base">
            Data not found
          </div>
        )
      ) : null,
      "billing": isExactPatient ? (
        hospitalBillingData.length > 0 ||
          labBillingData.length > 0 ||
          pharmacyBillingData.length > 0 ? (
          <div className="space-y-4 md:space-y-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-3 sm:mb-4 md:mb-6 gap-2 sm:gap-3 mx-6">
              <div className="flex items-center gap-2 md:gap-3">
                <CreditCard size={16} className="md:size-[20px] text-gray-600" />
                <h4 className="text-lg md:text-xl font-semibold">Billing Information</h4>
              </div>
              {(hospitalBillingData.length > 0 || labBillingData.length > 0 || pharmacyBillingData.length > 0) && (
                <button
                  onClick={() =>
                    setImageModal({
                      isOpen: true,
                      imageUrl: "https://placehold.co/800x1000/png?text=Billing+Sample",
                      title: "Original Bill",
                    })
                  }
                  className="px-2 sm:px-3 py-1 sm:py-1.5 bg-[var(--primary-color)] text-white rounded-md sm:rounded-lg hover:opacity-90 transition-opacity text-xs sm:text-sm self-start md:self-auto"
                >
                  View Original
                </button>
              )}
            </div>
            <div className="overflow-x-auto mx-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {(() => {
                const dataMaps = {
                  pharmacy: pharmacyBillingData,
                  labs: labBillingData,
                  hospital: hospitalBillingData,
                };
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
                          className={`text-xs md:text-sm font-semibold px-2 py-1 rounded-full ${
                            row.paymentStatus === "Paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
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
                          className={`text-xs md:text-sm font-semibold px-2 py-1 rounded-full ${
                            row.status === "Paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {row.status}
                        </span>
                      ),
                    },
                    { header: "Bill Date", accessor: "billDate" },
                  ],
                };
                const activeBillingTab = state.billingActiveTab;
                const activeData = dataMaps[activeBillingTab] || [];
                if (!Array.isArray(activeData) || activeData.length === 0) {
                  return (
                    <DocsReader
                      askBillingTypeOnUpload={state.detailsActiveTab === "billing"}
                      activeTab={state.detailsActiveTab}
                    />
                  );
                }
                return (
                  <DynamicTable
                    columns={columnMaps[activeBillingTab]}
                    data={activeData}
                    tabs={[
                      { value: "pharmacy", label: "Pharmacy" },
                      { value: "labs", label: "Labs" },
                      { value: "hospital", label: "Hospital Bills" },
                    ]}
                    activeTab={state.billingActiveTab}
                    onTabChange={(tab) =>
                      setState((prev) => ({ ...prev, billingActiveTab: tab }))
                    }
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
                );
              })()}
            </div>
          </div>
        ) : (
          <DocsReader
            askBillingTypeOnUpload={state.detailsActiveTab === "billing"}
            activeTab={state.detailsActiveTab}
          />
        )
      ) : isExactDoctor ? (
        <div className="text-center text-gray-600 py-6 md:py-8 text-sm md:text-base">
          Data not found
        </div>
      ) : null,
      "video": (
        <div className="space-y-4 md:space-y-6">
          <div className="ml-6 mr-6 space-y-4 md:space-y-6">
            {videoRecordings.length > 0 && (
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-3 sm:mb-4 md:mb-6 gap-2 sm:gap-3">
                <div className="flex items-center gap-2 md:gap-3">
                  <Video size={16} className="md:size-[20px] text-red-600" />
                  <h4 className="text-lg md:text-xl font-semibold text-start">
                    Consultation Recordings
                  </h4>
                </div>
                <button className="px-2 sm:px-3 py-1 sm:py-1.5 bg-[var(--primary-color)] text-white rounded-md sm:rounded-lg hover:opacity-90 transition-opacity text-xs sm:text-sm self-start md:self-auto">
                  View Original
                </button>
              </div>
            )}
            {videoRecordings.length > 0 ? (
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <DynamicTable
                  columns={[
                    {
                      header: "Record ID",
                      accessor: "virtualRecordId",
                      sortable: true,
                      className: "min-w-[100px]"
                    },
                    {
                      header: "Visit Date",
                      accessor: "date",
                      sortable: true,
                      className: "min-w-[120px]"
                    },
                    {
                      header: "Consultation Type",
                      accessor: "type",
                      sortable: true,
                      className: "min-w-[150px]"
                    },
                    {
                      header: "Doctor",
                      accessor: "doctorName",
                      sortable: true,
                      className: "min-w-[200px]"
                    },
                    {
                      header: "Actions",
                      accessor: "actions",
                      className: "min-w-[120px] text-center",
                      cell: (row) => (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setVideoModal({
                              isOpen: true,
                              videoUrl: row.videoUrl,
                              metadata: {
                                timestamp: row.date,
                                doctorName: row.doctorName,
                                type: row.type
                              }
                            });
                          }}
                          className="px-3 py-1 btn-primary text-white rounded  text-sm"
                        >
                          View Video
                        </button>
                      )
                    }
                  ]}
                  showSearchBar={true}
                  data={videoRecordings}
                  searchFields={['date', 'type', 'doctorName', 'virtualRecordId']}
                  defaultSortField="date"
                  defaultSortOrder="desc"
                />
              </div>
            ) : (
              <div className="text-center text-gray-600 py-6 md:py-8 text-sm md:text-base">
                <DocsReader/>
              </div>
            )}
          </div>
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
    ...(String(activeTab).toUpperCase() === "VIRTUAL" ? [{ id: "video", label: "Video", icon: Video }] : []),
  ];

  const updateState = (updates) => setState((prev) => ({ ...prev, ...updates }));

  const hasDataForActiveTab = () => {
    const tab = state.detailsActiveTab;
    if (!selectedRecord?.patientId) return false;
    switch (tab) {
      case "medical-records":
        if (isExactPatient) return !!medicalInfo;
        if (isExactDoctor) return !!medicalInfo;
        return !!medicalInfo;
      case "prescriptions":
        return Array.isArray(prescriptionData) && prescriptionData.length > 0;
      case "lab-tests":
        return Array.isArray(labScansData) && labScansData.length > 0;
      case "billing":
        return (
          (Array.isArray(hospitalBillingData) && hospitalBillingData.length > 0) ||
          (Array.isArray(labBillingData) && labBillingData.length > 0) ||
          (Array.isArray(pharmacyBillingData) && pharmacyBillingData.length > 0)
        );
      case "video":
        return Array.isArray(videoRecordings) && videoRecordings.length > 0;
      default:
        return false;
    }
  };

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

  return (
    <ErrorBoundary>
      <div className="p-3 md:p-6 space-y-4 md:space-y-6">
        <VideoPlaybackModal
          show={videoModal.isOpen}
          onClose={() => setVideoModal({ isOpen: false, videoUrl: null, metadata: null })}
          videoUrl={videoModal.videoUrl}
          metadata={videoModal.metadata}
        />
        <ProfileCard
          initials={getInitials(displayPatientName)}
          name={displayPatientName}
          fields={profileFields}
        />
        <div className="space-y-4 md:space-y-6">
          <div className="flex flex-row justify-between items-center gap-3 w-full">
            <div className="flex items-center gap-2">
              <Activity size={20} className="text-green-600" />
              <h3 className="text-base md:text-lg lg:text-xl font-semibold">Vitals Summary</h3>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3 p-2">
            {[
              { key: "bloodPressure", icon: Heart, color: "red", label: "Blood Pressure", value: vitalsData?.bloodPressure ?? "--" },
              { key: "heartRate", icon: Activity, color: "blue", label: "Heart Rate", value: vitalsData?.heartRate ?? "--" },
              { key: "temperature", icon: Thermometer, color: "orange", label: "Temperature", value: vitalsData?.temperature ?? "--" },
              { key: "spO2", icon: Activity, color: "emerald", label: "SpO2", value: vitalsData?.spO2 ?? "--" },
              { key: "respiratoryRate", icon: Activity, color: "violet", label: "Respiratory Rate", value: vitalsData?.respiratoryRate ?? "--" },
              { key: "height", icon: Activity, color: "cyan", label: "Height", value: vitalsData?.height ?? "--" },
              { key: "weight", icon: Activity, color: "amber", label: "Weight", value: vitalsData?.weight ?? "--" },
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
              return (
                <div
                  key={key}
                  className={`bg-${c}-50 border-l-4 border-${c}-500 p-3 rounded-lg shadow-sm flex flex-col justify-between hover:shadow-md transition relative`}
                  title=""
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
        <div className="w-full border-b border-gray-200">
          <div
            className="flex items-center justify-between overflow-x-auto custom-scrollbar px-2 sm:px-0"
          >
            <div className="flex gap-2 sm:gap-4">
              {detailsTabs.map((tab) => {
                const IconComponent = tab.icon;
                const isActive = state.detailsActiveTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => updateState({ detailsActiveTab: tab.id })}
                    className={
                      `flex items-center gap-2
                      px-3 py-2 rounded-md
                      text-sm sm:text-base font-medium
                      transition-all duration-300
                      whitespace-nowrap
                      ${
                        isActive
                          ? "bg-[var(--primary-color)] text-white shadow-sm"
                          : "text-gray-600 hover:text-[var(--primary-color)] hover:bg-gray-100"
                      }`
                    }
                  >
                    <IconComponent size={16} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
            {(() => {
              const uploadedByUpper = String(selectedRecord?.uploadedBy || "").toUpperCase();
              const isExactPatient = uploadedByUpper === "PATIENT";
              const hasAnyData = (
                (Array.isArray(pharmacyBillingData) && pharmacyBillingData.length > 0) ||
                (Array.isArray(labBillingData) && labBillingData.length > 0) ||
                (Array.isArray(hospitalBillingData) && hospitalBillingData.length > 0) ||
                (Array.isArray(labScansData) && labScansData.length > 0) ||
                (Array.isArray(prescriptionData) && prescriptionData.length > 0) ||
                (medicalInfo != null)
              );
              if (!isExactPatient || hasAnyData) {
                return (
                  <button
                    onClick={handleSecondOpinion}
                    className="px-4 py-2 bg-[var(--primary-color)] text-white rounded-full flex items-center gap-2 shadow-sm hover:bg-[var(--primary-color)] transition-all text-sm font-semibold"
                    style={{ minWidth: 'fit-content' }}
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
      <div className="animate-slide-fade-in overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {renderTabContent()}
      </div>
      <ImageViewModal
        isOpen={imageModal.isOpen}
        onClose={() => setImageModal({ ...imageModal, isOpen: false })}
        imageUrl={imageModal.imageUrl}
        title={imageModal.title}
      />
    </ErrorBoundary>
  );
};

export default MediRecDeatilsHC;
