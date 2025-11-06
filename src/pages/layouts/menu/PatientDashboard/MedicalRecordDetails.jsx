import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import DynamicTable from "../../../../components/microcomponents/DynamicTable";
import DocsReader from "../../../../components/DocsReader";
import ProfileCard from "../../../../components/microcomponents/ProfileCard";
import ReusableModal from "../../../../components/microcomponents/Modal";
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
  Receipt,
  Pencil,
} from "lucide-react";
import { createPortal } from "react-dom";
import {
  getPatientVitalById,
  createPatientVital,
  updatePatientVital,
  getClinicalNotes,
  getDoctorPatientPrescriptions,
  getLabScanByPatient,
  getHospitalBilling,
  getLabBilling,
  getPharmacyBilling,
  getPatientMedicalInfo,
} from "../../../../utils/masterService";
import { useMedicalRecords } from "../../../../context-api/MedicalRecordsContext";

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
  const { clickedRecord: selectedRecord, activeTab } = useMedicalRecords();
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
  const gender = selectedRecord?.gender || selectedRecord?.sex || "";
  const dob = selectedRecord?.dob || "";
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

  const displayAge = useMemo(() => calculateAge(dob, visitDate), [dob, visitDate]);
  const displayDob = dob || "N/A";
  const displayEmail = email || "N/A";
  const displayPatientName = patientName || "Guest Patient";
  const displayGender = gender || "N/A";
  const displayPhone = phone || "N/A";
  const displayDiagnosis = diagnosis || "N/A";

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

  const [clinicalNotes, setClinicalNotes] = useState(null);
  const [prescriptionData, setPrescriptionData] = useState([]);
  const [labTestsData] = useState([]);
  const [vitalsData, setVitalsData] = useState(null);
  const [doctorIpdVitals, setDoctorIpdVitals] = useState(null);
  const [loading, setLoading] = useState(false);
  const [, setError] = useState(null);
  const [medicalError, setMedicalError] = useState(null);
  const [clinicalError, setClinicalError] = useState(null);
  const [prescriptionError, setPrescriptionError] = useState(null);
  const [videoRecordings, setVideoRecordings] = useState([]);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideoBlob, setSelectedVideoBlob] = useState(null);
  const [selectedVideoMetadata, setSelectedVideoMetadata] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [vitalsExist, setVitalsExist] = useState(false);
  const [labScansData, setLabScansData] = useState([]);
  const [medicalInfo, setMedicalInfo] = useState(null);

  const validateVitals = (values) => {
    const errors = {};
    const warnings = {};
    if (values.temperature) {
      const tempValue = parseFloat(values.temperature);
      if (!isNaN(tempValue)) {
        if (tempValue < 35.5 || tempValue > 37.9) {
          warnings.temperature = `Abnormal temperature (35.5-37.9°C)`;
        }
      }
    }
    if (values.heartRate) {
      const hrValue = parseInt(values.heartRate);
      if (!isNaN(hrValue)) {
        if (hrValue < 60 || hrValue > 100) {
          warnings.heartRate = `Abnormal heart rate (60-100 bpm)`;
        }
      }
    }
    if (values.spO2) {
      const spo2Value = parseInt(values.spO2);
      if (!isNaN(spo2Value)) {
        if (spo2Value < 95) {
          warnings.spO2 = `Low SpO2 (Normal: >95%)`;
        }
      }
    }
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

  const fetchMedicalInfo = async () => {
    if (!selectedRecord?.patientId) {
      setMedicalError("Patient ID is missing.");
      setMedicalInfo(null);
      return;
    }

    setLoading(true);
    setMedicalError(null);
    try {
      const response = await getPatientMedicalInfo(selectedRecord.patientId);
      console.log("Fetched medical info:", response.data);
      // support both response.data and response.data.data shapes
      const payload = response.data?.data ?? response.data;
      if (payload) {
        setMedicalInfo(payload);
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


  const fetchVitalsData = async () => {
    if (!selectedRecord?.patientId) {
      setVitalsData({ bloodPressure: "--", heartRate: "--", temperature: "--", spO2: "--", respiratoryRate: "--", height: "--", weight: "--" });
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await getPatientVitalById(selectedRecord.patientId || "1");
      const patientVitals = response.data;
      if (patientVitals) {
        setVitalsData({
          bloodPressure: patientVitals.bloodPressure || "--",
          heartRate: patientVitals.heartRate || "--",
          temperature: patientVitals.temperature || "--",
          spO2: patientVitals.spo2 || "--",
          respiratoryRate: patientVitals.respiratoryRate || "--",
          height: patientVitals.height || "--",
          weight: patientVitals.weight || "--",
          id: patientVitals.id,
        });
        setVitalsExist(true);
      } else {
        setVitalsData({ bloodPressure: "--", heartRate: "--", temperature: "--", spO2: "--", respiratoryRate: "--", height: "--", weight: "--" });
        setVitalsExist(false);
      }
    } catch (err) {
      console.error("Failed to fetch vitals:", err);
      setVitalsData({ bloodPressure: "--", heartRate: "--", temperature: "--", spO2: "--", respiratoryRate: "--", height: "--", weight: "--" });
      setVitalsExist(false);
    } finally {
      setLoading(false);
    }
  };

  // Fetch doctor IPD vitals if uploaded by doctor
const fetchDoctorIpdVitals = async () => {


  try {
    const response = await getDoctorIpdVitalsByContext(
      1,
      2,
     "OPD"
    );
    setDoctorIpdVitals(response?.data ?? null);
  } catch (err) {
    setDoctorIpdVitals(null);
  } finally {
    setLoading(false);
  }
};

  const fetchClinicalNotes = async () => {
    if (!selectedRecord?.patientId) {
      setClinicalError("Patient ID is missing.");
      return;
    }
    setLoading(true);
    setClinicalError(null);
    try {
      console.log("Fetching clinical notes for patientId:", selectedRecord.patientId);
      const response = await getClinicalNotes(selectedRecord.patientId, doctorId, ContextTab);
      console.log("Clinical Notes Response:", response.data);
      if (response.data && response.data.length > 0) {
        const sortedNotes = [...response.data].sort((a, b) => b.id - a.id);
        setClinicalNotes(sortedNotes[0]);
      } else {
        setClinicalError("No clinical notes found for this patient and context.");
        setClinicalNotes(null);
      }
    } catch (err) {
      console.error("Failed to fetch clinical notes:", err);
      setClinicalError(err.response?.data?.message || "Failed to fetch clinical notes.");
      setClinicalNotes(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrescriptions = async () => {
    if (!selectedRecord?.patientId) {
      setPrescriptionError("Patient ID is missing.");
      return;
    }
    setLoading(true);
    setPrescriptionError(null);
    try {
      const response = await getDoctorPatientPrescriptions(doctorId, selectedRecord.patientId, activeTab);
      let prescriptions = response.data?.data || response.data;
      if (!Array.isArray(prescriptions)) {
        prescriptions = prescriptions ? [prescriptions] : [];
      }
      if (prescriptions.length > 0) {
        const formattedData = prescriptions.map((prescription) => {
          const medicines = Array.isArray(prescription.medicines) ? prescription.medicines : [prescription.medicines];
          return {
            id: prescription.id || prescription.prescriptionId,
            date: prescription.prescribedAt
              ? new Date(prescription.prescribedAt).toLocaleDateString('en-GB')
              : "N/A",
            doctorName: prescription.doctorName || "Dr. Rajesh Kumar",
            medicines: medicines
              .map((med) => `${med.medicineName} - ${med.dosage} ${med.dosageUnit} for ${med.duration}`)
              .join(", "),
            instructions: medicines
              .map((med) => `Take ${med.intake}.`)
              .join(" "),
          };
        });
        setPrescriptionData(formattedData);
      } else {
        setPrescriptionData([]);
      }
    } catch (err) {
      console.error("Failed to fetch prescriptions:", err);
      setPrescriptionError(err.response?.data?.message || "Failed to fetch prescriptions.");
      setPrescriptionData([]);
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
      const response = await getLabScanByPatient(selectedRecord.patientId);
      if (response.data && response.data.length > 0) {
        const formattedData = response.data.map((scan, index) => ({
          id: index + 1,
          date: scan.date || new Date().toLocaleDateString(),
          scanName: scan.scanName || scan.testName || "N/A",
          result: scan.result || "Pending",
          normalRange: scan.normalRange || "N/A",
          status: scan.status || "Pending",
          fileUrl: scan.fileUrl || null,
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

  const handleSaveVitals = async (formValues) => {
    const { errors } = validateVitals(formValues);
    if (Object.keys(errors).length > 0) {
      return;
    }
    // Build payload to match backend schema expected by createPatientVital/updatePatientVital
    // const payload = {
    //   patientId: selectedRecord?.patientId ? Number(selectedRecord.patientId) : 1,
    //   heartRate: formValues.heartRate ? parseInt(formValues.heartRate, 10) || 0 : 0,
    //   temperature: formValues.temperature ? parseFloat(formValues.temperature) || 0.1 : 0.1,
    //   bloodSugar: formValues.bloodSugar ? parseFloat(formValues.bloodSugar) || 0.1 : 0.1,
    //   bloodPressure: formValues.bloodPressure || "",
    //   respiratoryRate: formValues.respiratoryRate ? parseInt(formValues.respiratoryRate, 10) || 0 : 0,
    //   spo2: formValues.spO2 ? parseInt(formValues.spO2, 10) || 0 : 0,
    //   steps: formValues.steps ? parseInt(formValues.steps, 10) || 0 : 0,
    //   height: formValues.height ? parseFloat(formValues.height) || 0.1 : 0.1,
    //   weight: formValues.weight ? parseFloat(formValues.weight) || 0.1 : 0.1,
    //   consultationType: formValues.consultationType,
    //   ...(vitalsExist ? { id: vitalsData.id } : {}),
    // };



     const payload = {
      patientId: selectedRecord?.patientId ? Number(selectedRecord.patientId) : 1,
      heartRate: formValues.heartRate ? parseInt(formValues.heartRate, 10) || 0 : 0,
      temperature: formValues.temperature ? parseFloat(formValues.temperature) || 0.1 : 0.1,
      bloodSugar: formValues.bloodSugar ? parseFloat(formValues.bloodSugar) || 0.1 : 0.1,
      bloodPressure:  "",
      respiratoryRate: formValues.respiratoryRate ? parseInt(formValues.respiratoryRate, 10) || 0 : 0,
      spo2: formValues.spO2 ? parseInt(formValues.spO2, 10) || 0 : 0,
      steps: formValues.steps ? parseInt(formValues.steps, 10) || 0 : 0,
      height: formValues.height ? parseFloat(formValues.height) || 0.1 : 0.1,
      weight: formValues.weight ? parseFloat(formValues.weight) || 0.1 : 0.1,
      consultationType: formValues.consultationType || "OPD",
     
    };
    try {
      let res;
      if (vitalsExist) {
        res = await updatePatientVital(vitalsData.id, payload);
      } else {
        res = await createPatientVital(payload);
      }
      setVitalsData(res.data || payload);
      setVitalsExist(true);
      setShowUpdateModal(false);
    } catch (err) {
      console.error("Failed to save vitals:", err);
      alert("Unable to save vitals. Please try again.");
    }
  };

  const fetchHospitalBilling = async () => {
    if (!selectedRecord?.patientId) return;
    setBillingLoading(true);
    try {
      const response = await getHospitalBilling(selectedRecord.patientId);
      setHospitalBillingData(response.data || []);
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
      const response = await getLabBilling(selectedRecord.patientId);
      setLabBillingData(response.data || []);
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
      const response = await getPharmacyBilling(selectedRecord.patientId);
      setPharmacyBillingData(response.data || []);
    } catch (err) {
      setBillingError(err.response?.data?.message || "Failed to fetch pharmacy billing.");
    } finally {
      setBillingLoading(false);
    }
  };

  const handleSecondOpinion = () => {
    const recordToPass = {
      ...selectedRecord,
      medicalDetails: clinicalNotes,
      prescriptionsData: prescriptionData,
      labTestsData: labTestsData,
    };
    navigate("/patientdashboard/second-opinion", { state: { selectedRecord: recordToPass } });
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
    // Call only the allowed APIs depending on exact uploader type.
    // If exact PATIENT -> call patient-side APIs for the active tab (medical info + vitals)
    // If exact DOCTOR -> call doctor-side APIs (clinical notes)
    // If unknown -> conservative fallback: call both patient and doctor APIs where appropriate
    console.log("uploadedBy:", uploadedBy, "detailsActiveTab:", state.detailsActiveTab);
    if (state.detailsActiveTab === "medical-records" && selectedRecord?.patientId) {
      if (isExactPatient) {
        fetchMedicalInfo();
        fetchVitalsData();
      } else if (isExactDoctor) {
        fetchClinicalNotes();
        fetchDoctorIpdVitals();
      } else {
        // unknown uploader: attempt both
        fetchMedicalInfo();
        fetchClinicalNotes();
        fetchVitalsData();
      }
    } else {
      // ensure vitals are fetched for non-doctor contexts when appropriate
      if (!isExactDoctor && selectedRecord?.patientId) {
        fetchVitalsData();
      }
    }

    setVideoRecordings(fetchVideoRecordings());
  }, [selectedRecord, hospitalName, displayEmail, activeTab, state.detailsActiveTab, uploadedBy]);

  useEffect(() => {
    if (state.detailsActiveTab === "lab-tests") {
      if (isExactPatient) {
        fetchLabScans();
      } else if (isExactDoctor) {
        // doctor-exact: do not fetch patient lab scans; render will show 'Data not found'
        setLabScansData([]);
      } else {
        // unknown: fetch lab scans
        fetchLabScans();
      }
    }
  }, [selectedRecord, state.detailsActiveTab]);

  useEffect(() => {
    // Prescriptions are doctor-side data. Only fetch when uploader is exact DOCTOR or unknown (fallback).
    if (selectedRecord?.patientId) {
      if (isExactDoctor) {
        fetchPrescriptions();
      } else if (isExactPatient) {
        // patient-exact: do not fetch doctor prescriptions; ensure empty so DocsReader shows
        setPrescriptionData([]);
      } else {
        // unknown: fetch prescriptions (best-effort)
        fetchPrescriptions();
      }
    }
  }, [displayEmail, user.id, selectedRecord?.patientId, uploadedBy]);

  useEffect(() => {
    if (state.detailsActiveTab === "billing") {
      if (isExactPatient) {
        fetchHospitalBilling();
        fetchLabBilling();
        fetchPharmacyBilling();
      } else if (isExactDoctor) {
        // doctor-exact: do not fetch patient billing; clear data so UI shows 'Data not found'
        setHospitalBillingData([]);
        setLabBillingData([]);
        setPharmacyBillingData([]);
      } else {
        // unknown: attempt to fetch billing
        fetchHospitalBilling();
        fetchLabBilling();
        fetchPharmacyBilling();
      }
    }
  }, [state.detailsActiveTab, selectedRecord?.patientId]);

  const renderTabContent = () => {
  const uploadedByUpper = String(uploadedBy || "").toUpperCase();
  const isExactPatient = uploadedByUpper === "PATIENT";
  const isExactDoctor = uploadedByUpper === "DOCTOR";
  const tabContentMap = {
      "medical-records": (() => {
        // If uploader is exactly PATIENT, show patient medical info (or fallback to DocsReader)
        if (isExactPatient) {
          if (loading) return <div className="text-center py-6 md:py-8 text-sm md:text-base">Loading medical info...</div>;
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                  {[
                    { label: "Chief Complaint", value: medicalInfo.chiefComplaint || "N/A" },
                    { label: "Past History", value: medicalInfo.pastHistory || "N/A" },
                    { label: "Advice", value: medicalInfo.advice || "N/A" },
                    { label: "Plan", value: medicalInfo.plan || "N/A" },
                  ].map((item, index) => (
                    <div key={index} className="bg-white p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                      <div className="font-semibold text-xs sm:text-sm md:text-base text-gray-600 mb-1 sm:mb-1.5 md:mb-2">{item.label}</div>
                      <div className="text-gray-800 text-xs sm:text-sm md:text-base">{item.value}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <DocsReader />
          );
        }
        // If uploader is exactly DOCTOR, show clinical notes (or fallback to "Data not found")
        if (isExactDoctor) {
          if (loading) return <div className="text-center py-6 md:py-8 text-sm md:text-base">Loading clinical notes...</div>;
          return clinicalNotes ? (
            <div className="ml-6 mr-6 space-y-4 sm:space-y-5 md:space-y-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-3 sm:mb-4 md:mb-6 gap-2 sm:gap-3">
                <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3">
                  <FileText size={18} className="sm:size-[20px] md:size-[24px] text-[var(--primary-color)]" />
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold">Medical Information</h3>
                </div>
                <button className="px-2 sm:px-3 py-1 sm:py-1.5 bg-[var(--primary-color)] text-white rounded-md sm:rounded-lg hover:opacity-90 transition-opacity text-xs sm:text-sm self-start md:self-auto">View Original</button>
              </div>
              {clinicalError ? (
                <div className="text-center text-gray-600 py-6 md:py-8 text-sm md:text-base">{clinicalError}</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                  {[
                    { label: "Chief Complaint", value: clinicalNotes.chiefComplaint || clinicalNotes.chiefcomplaint || "N/A" },
                    { label: "Past History", value: clinicalNotes.pastHistory || clinicalNotes.history || "N/A" },
                    { label: "Advice", value: clinicalNotes.treatmentAdvice || clinicalNotes.advice || "N/A" },
                    { label: "Plan", value: clinicalNotes.plan || "N/A" },
                  ].map((item, index) => (
                    <div key={index} className="bg-white p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                      <div className="font-semibold text-xs sm:text-sm md:text-base text-gray-600 mb-1 sm:mb-1.5 md:mb-2">{item.label}</div>
                      <div className="text-gray-800 text-xs sm:text-sm md:text-base">{item.value}</div>
                    </div>
                  ))}
                </div>
              )}
              {selectedRecord?.type === "IPD" && (
                <div className="mt-4 sm:mt-5 md:mt-6">
                  <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3 mb-3 sm:mb-4 md:mb-6">
                    <FileText size={18} className="sm:size-[20px] md:size-[24px] text-green-600" />
                    <h3 className="text-base sm:text-lg md:text-xl font-semibold">Discharge Summary</h3>
                  </div>
                  <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl border border-gray-100">
                    <div className="font-semibold text-xs sm:text-sm md:text-base text-gray-600 mb-1 sm:mb-1.5 md:mb-2">Summary</div>
                    <div className="text-gray-800 text-xs sm:text-sm md:text-base">{clinicalNotes?.dischargeSummary || "N/A"}</div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-600 py-6 md:py-8 text-sm md:text-base">Data not found</div>
          );
        }
        // Unknown uploader: prefer patient info, then clinical notes, then DocsReader
        if (loading) return <div className="text-center py-6 md:py-8 text-sm md:text-base">Loading medical info...</div>;
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                {[
                  { label: "Chief Complaint", value: medicalInfo.chiefComplaint || "N/A" },
                  { label: "Past History", value: medicalInfo.pastHistory || "N/A" },
                  { label: "Advice", value: medicalInfo.advice || "N/A" },
                  { label: "Plan", value: medicalInfo.plan || "N/A" },
                ].map((item, index) => (
                  <div key={index} className="bg-white p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="font-semibold text-xs sm:text-sm md:text-base text-gray-600 mb-1 sm:mb-1.5 md:mb-2">{item.label}</div>
                    <div className="text-gray-800 text-xs sm:text-sm md:text-base">{item.value}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : clinicalNotes ? (
          <div className="ml-6 mr-6 space-y-4 sm:space-y-5 md:space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-3 sm:mb-4 md:mb-6 gap-2 sm:gap-3">
              <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3">
                <FileText size={18} className="sm:size-[20px] md:size-[24px] text-[var(--primary-color)]" />
                <h3 className="text-base sm:text-lg md:text-xl font-semibold">Medical Information</h3>
              </div>
              <button className="px-2 sm:px-3 py-1 sm:py-1.5 bg-[var(--primary-color)] text-white rounded-md sm:rounded-lg hover:opacity-90 transition-opacity text-xs sm:text-sm self-start md:self-auto">View Original</button>
            </div>
            {clinicalError ? (
              <div className="text-center text-gray-600 py-6 md:py-8 text-sm md:text-base">{clinicalError}</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                {[
                  { label: "Chief Complaint", value: clinicalNotes.chiefComplaint || clinicalNotes.chiefcomplaint || "N/A" },
                  { label: "Past History", value: clinicalNotes.pastHistory || clinicalNotes.history || "N/A" },
                  { label: "Advice", value: clinicalNotes.treatmentAdvice || clinicalNotes.advice || "N/A" },
                  { label: "Plan", value: clinicalNotes.plan || "N/A" },
                ].map((item, index) => (
                  <div key={index} className="bg-white p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="font-semibold text-xs sm:text-sm md:text-base text-gray-600 mb-1 sm:mb-1.5 md:mb-2">{item.label}</div>
                    <div className="text-gray-800 text-xs sm:text-sm md:text-base">{item.value}</div>
                  </div>
                ))}
              </div>
            )}
            {selectedRecord?.type === "IPD" && (
              <div className="mt-4 sm:mt-5 md:mt-6">
                <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3 mb-3 sm:mb-4 md:mb-6">
                  <FileText size={18} className="sm:size-[20px] md:size-[24px] text-green-600" />
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold">Discharge Summary</h3>
                </div>
                <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl border border-gray-100">
                  <div className="font-semibold text-xs sm:text-sm md:text-base text-gray-600 mb-1 sm:mb-1.5 md:mb-2">Summary</div>
                  <div className="text-gray-800 text-xs sm:text-sm md:text-base">{clinicalNotes?.dischargeSummary || "N/A"}</div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <DocsReader />
        );
      })(),
      "prescriptions": isExactPatient ? (
        prescriptionError ? (
          <div className="text-center text-gray-600 py-6 md:py-8 text-sm md:text-base">{prescriptionError}</div>
        ) : prescriptionData.length > 0 ? (
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
        ) : (
          <DocsReader />
        )
      ) : isExactDoctor ? (
        prescriptionError ? (
          <div className="text-center text-gray-600 py-6 md:py-8 text-sm md:text-base">{prescriptionError}</div>
        ) : prescriptionData.length > 0 ? (
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
        ) : (
          <div className="text-center text-gray-600 py-6 md:py-8 text-sm md:text-base">
            Data not found
          </div>
        )
      ) : null,
      "lab-tests": isExactPatient ? (
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
            <div className="overflow-x-auto mx-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
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
                          <span className={`text-xs md:text-sm font-semibold px-2 py-1 rounded-full ${row.paymentStatus === "Paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
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
                          <span className={`text-xs md:text-sm font-semibold px-2 py-1 rounded-full ${row.status === "Paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                            {row.status}
                          </span>
                        ),
                      },
                      { header: "Bill Date", accessor: "billDate" },
                    ],
                  };
                  return columnMaps[state.billingActiveTab];
                })()}
                data={(() => {
                  const dataMaps = {
                    pharmacy: pharmacyBillingData,
                    labs: labBillingData,
                    hospital: hospitalBillingData,
                  };
                  return dataMaps[state.billingActiveTab];
                })()}
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
        ) : (
          <DocsReader />
        )
        ) : isExactDoctor ? (
        <div className="text-center text-gray-600 py-6 md:py-8 text-sm md:text-base">
          Data not found
        </div>
      ) : null,
      "video": (
        <div className="space-y-4 md:space-y-6">
          <div className="ml-6 mr-6 space-y-4 md:space-y-6">
            <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
              <Video size={16} className="md:size-[20px] text-red-600" />
              <h4 className="text-lg md:text-xl font-semibold">Consultation Recordings</h4>
            </div>
            {videoRecordings.length > 0 ? (
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <DynamicTable
                  columns={[
                    { header: "Date", accessor: "date" },
                    { header: "Type", accessor: "type" },
                    { header: "Doctor Name", accessor: "doctorName" },
                    {
                      header: "Actions",
                      accessor: "actions",
                      Cell: ({ row }) => (
                        <button
                          onClick={() => {
                            setSelectedVideoBlob(row.original.videoBlob);
                            setSelectedVideoMetadata(row.original.metadata);
                            setShowVideoModal(true);
                          }}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          Play
                        </button>
                      ),
                    },
                  ]}
                  showSearchBar={true}
                  data={videoRecordings}
                />
              </div>
            ) : (
              <div className="text-center text-gray-600 py-6 md:py-8 text-sm md:text-base">
                No video recordings found.
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
    { id: "video", label: "Video", icon: Video },
  ];

  const updateState = (updates) => setState((prev) => ({ ...prev, ...updates }));

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
        <ProfileCard
          initials={getInitials(displayPatientName)}
          name={displayPatientName}
          fields={[
            { label: "Age", value: displayAge },
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
        <div className="space-y-4 md:space-y-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
            <div className="flex items-center gap-2">
              <Activity size={20} className="text-green-600" />
              <h3 className="text-lg md:text-xl font-semibold">Vitals Summary</h3>
            </div>
            {!isDoctorUploaded && (
              <button
                onClick={() => setShowUpdateModal(true)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm md:text-base rounded-lg shadow-sm transition duration-200 flex items-center gap-2 self-start md:self-auto"
                aria-label={vitalsExist ? "Update vitals" : "Add vitals"}
              >
                <Pencil size={16} />
                {vitalsExist ? "Update Vitals" : "Add Vitals"}
              </button>
            )}
            {/* Show IPD vitals if uploaded by doctor */}
            {isExactDoctor && doctorIpdVitals && (
              <div className="w-full mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Heart size={18} className="text-blue-600" />
                  <span className="font-semibold text-base text-blue-700">Doctor IPD Vitals</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {["bloodPressure", "heartRate", "temperature", "spO2", "respiratoryRate", "height", "weight"].map((key) => (
                    <div key={key} className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-lg shadow-sm">
                      <div className="font-semibold text-xs text-blue-700 mb-1">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</div>
                      <div className="text-blue-800 text-sm font-semibold">{doctorIpdVitals[key] ?? "--"}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
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
      <div className="animate-slide-fade-in overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {renderTabContent()}
      </div>
      <VideoPlaybackModal
        show={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        videoBlob={selectedVideoBlob}
        metadata={selectedVideoMetadata}
      />
      <ReusableModal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        title={vitalsExist ? "Update Vitals" : "Add Vitals"}
        mode="edit"
        saveLabel={vitalsExist ? "Update Vitals" : "Add Vitals"}
        fields={vitalsFields}
        data={{
          bloodPressure: vitalsData?.bloodPressure !== "--" ? String(vitalsData?.bloodPressure || "") : "",
          heartRate: vitalsData?.heartRate !== "--" ? String(vitalsData?.heartRate || "") : "",
          temperature: vitalsData?.temperature !== "--" ? String(vitalsData?.temperature || "") : "",
          respiratoryRate: vitalsData?.respiratoryRate !== "--" ? String(vitalsData?.respiratoryRate || "") : "",
          spO2: vitalsData?.spO2 !== "--" ? String(vitalsData?.spO2 || "") : "",
          height: vitalsData?.height !== "--" ? String(vitalsData?.height || "") : "",
          weight: vitalsData?.weight !== "--" ? String(vitalsData?.weight || "") : "",
          notes: vitalsData?.notes || "",
        }}
        onSave={handleSaveVitals}
        shouldValidate={true}
      />
    </ErrorBoundary>
  );
};

export default PatientMedicalRecordDetails;
