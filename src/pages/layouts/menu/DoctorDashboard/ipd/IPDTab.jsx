import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { FaVideo } from "react-icons/fa";
import { FiExternalLink, FiLink } from "react-icons/fi";
import QuickLinksPanel from "../../DoctorDashboard/QuickLinksPanel";
import DynamicTable from "../../../../../components/microcomponents/DynamicTable";
import ReusableModal from "../../../../../components/microcomponents/Modal";
import {
  getSpecializationsWardsSummaryForIpdAdmission,
  addIPDAdmission,
  fetchIPDAdmissions,
  getOpdAppointmentById,
} from "../../../../../utils/CrudService";

import IPDBasic, {
  fileToBase64,
  handlePincodeLookup,
  generateBasicFields,
} from "./IPDBasic";
import IPDWard from "./IPDWard";
import IPDRoom from "./IPDRoom";
import IPDBed from "./IPDBed";
import IPDFinal, { generateAdmissionFields } from "./IPDFinal";

const STATIC_DATA = {
  insurance: ["None", "CGHS", "ESIC", "Private Insurance", "Other"].map(
    (v, i) => ({ value: v, label: v, key: `insurance-${i}` })
  ),
  // Backend: 1 = Admitted, 2 = Discharged
  status: [
    { value: 1, label: "Admitted", key: "status-1" },
    { value: 2, label: "Discharged", key: "status-2" },
  ],
  surgery: ["No", "Yes"].map((v, i) => ({
    value: v,
    label: v,
    key: `surgery-${i}`,
  })),
};

const WIZARD_STEPS = [
  {
    id: 1,
    title: "Patient Details",
    description: "Basic Information",
    shortTitle: "Details",
  },
  {
    id: 2,
    title: "Ward Selection",
    description: "Choose Ward",
    shortTitle: "Ward",
  },
  {
    id: 3,
    title: "Room Selection",
    description: "Choose Room",
    shortTitle: "Room",
  },
  {
    id: 4,
    title: "Bed Selection",
    description: "Choose Bed",
    shortTitle: "Bed",
  },
  {
    id: 5,
    title: "Admission",
    description: "Finalize Details",
    shortTitle: "Final",
  },
];

// Fields for viewing IPD patient info in ReusableModal
const IPD_VIEW_FIELDS = [
  { key: "name", label: "Patient Name", titleKey: true, initialsKey: true },
  { key: "sequentialId", label: "Admission ID" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "gender", label: "Gender" },
  { key: "bloodGroup", label: "Blood Group" },
  { key: "dob", label: "DOB" },
  { key: "admissionDate", label: "Admission Date" },
  { key: "status", label: "Status" },
  { key: "department", label: "Department" },
  { key: "wardType", label: "Ward Type" },
  { key: "wardNo", label: "Ward Number" },
  { key: "roomNo", label: "Room Number" },
  { key: "bedNo", label: "Bed Number" },
  { key: "ward", label: "Ward" },
  { key: "insuranceType", label: "Insurance Type" },
  { key: "dischargeDate", label: "Discharge Date" },
  { key: "diagnosis", label: "Diagnosis" },
  { key: "address", label: "Address" },
];

const getCurrentDate = () => new Date().toISOString().slice(0, 10);
const getCurrentTime = () => new Date().toTimeString().slice(0, 5);
const to24Hour = (t) =>
  t && (t.includes("AM") || t.includes("PM"))
    ? t.replace(
        /(\d+):(\d+)\s*(AM|PM)/,
        (_, h, m, mod) =>
          `${(mod === "PM" && h !== "12"
            ? +h + 12
            : mod === "AM" && h === "12"
            ? 0
            : +h
          )
            .toString()
            .padStart(2, "0")}:${m}`
      )
    : t || "";
const incrementTime = (time = "00:00") => {
  const [h, m] = time.split(":").map(Number);
  const totalMinutes = h * 60 + m + 30;
  const nh = Math.floor((totalMinutes / 60) % 24);
  const nm = totalMinutes % 60;
  return `${nh.toString().padStart(2, "0")}:${nm.toString().padStart(2, "0")}`;
};

// Removed PatientViewSections; ReusableModal handles view UI

// Removed local PatientViewModal in favor of shared ReusableModal

const IPDTab = forwardRef(
  (
    {
      doctorName,
      masterData = { departments: [] },
      location = {},
      setTabActions,
      tabActions = [],
      tabs = [],
      activeTab,
      onTabChange,
 
    },
    ref
  ) => {
    const navigate = useNavigate();
    const routerLocation = useLocation();
    const { user } = useSelector((state) => state.auth || {});
    const doctorId = user?.doctorId || user?.id;

    const [ipdPatients, setIpdPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newPatientId, setNewPatientId] = useState(null);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [ipdViewData, setIpdViewData] = useState({});
    const [modals, setModals] = useState({
      ipdWizard: false,
      viewPatient: false,
    });
    const [patientIdInput, setPatientIdInput] = useState("");
    const [ipdWizardStep, setIpdWizardStep] = useState(1);
    const [ipdWizardData, setIpdWizardData] = useState({});
    const [selectedWard, setSelectedWard] = useState(null);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [selectedBed, setSelectedBed] = useState(null);
    const [bedScrollIndex, setBedScrollIndex] = useState(0);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
    const [availableCities, setAvailableCities] = useState([]);
    const [isLoadingCities, setIsLoadingCities] = useState(false);
    const [wardData, setWardData] = useState([]);
    const [bedFacilities, setBedFacilities] = useState({});
    const [quickLinksOpen, setQuickLinksOpen] = useState(false);
    const [quickLinksPatient, setQuickLinksPatient] = useState(null);
    const [transferPreview, setTransferPreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useImperativeHandle(ref, () => ({
      openAddPatientModal: () => {
        setModals((prev) => ({ ...prev, ipdWizard: true }));
        setIpdWizardStep(1);
      },
    }));

    const hasRecording = useCallback((patientEmail, hospitalName) => {
      try {
        const videoKeys = Object.keys(localStorage).filter((key) =>
          key.startsWith("consultationVideo_")
        );
        for (const key of videoKeys) {
          const metadataStr = localStorage.getItem(`${key}_metadata`);
          if (metadataStr) {
            try {
              const metadata = JSON.parse(metadataStr);
              if (
                metadata.patientEmail === patientEmail &&
                metadata.hospitalName === hospitalName
              )
                return true;
            } catch (err) {
              console.error("Failed to parse metadata:", err);
            }
          }
        }
      } catch (err) {
        console.error("hasRecording error:", err);
      }
      return false;
    }, []);

    const loadWardData = useCallback(async () => {
      try {
        const response = await getSpecializationsWardsSummaryForIpdAdmission();
        if (response?.data) {
          const formatted = response.data.map((item, index) => {
            const availableGroup = item.bedGroups?.find(
              (g) => g.statusName.toLowerCase() === "available"
            );
            const availableBeds = availableGroup ? availableGroup.count : 0;
            const occupiedBeds = item.totalBeds - availableBeds;
            return {
              id: item.wardId || index,
              type: item.wardName,
              department: item.specializationName,
              totalBeds: item.totalBeds,
              availableBeds,
              occupiedBeds,
              rooms: item.rooms?.length || 0,
              roomNumbers: item.roomNumbers,
              beds: item.rooms?.flatMap((r) => r.beds || []),
            };
          });
          setWardData(formatted);
        }
      } catch (error) {
        console.error("Error fetching ward data:", error);
      }
    }, []);

    useEffect(() => {
      loadWardData();
    }, [loadWardData]);

    useEffect(() => {
      const handleStorageChange = (e) => {
        if (e.key === "bedMasterData") {
          loadWardData();
        }
      };
      window.addEventListener("storage", handleStorageChange);
      return () => window.removeEventListener("storage", handleStorageChange);
    }, [loadWardData]);

const handleFetchPatientDetails = useCallback(async (appointmentId) => {
  // Handle case where event object is passed instead of ID
  if (appointmentId && appointmentId.nativeEvent) {
    appointmentId.preventDefault();
    const idFromButton = appointmentId.currentTarget?.dataset?.id || 
                        appointmentId.target?.dataset?.id;
    if (idFromButton) {
      appointmentId = idFromButton;
    } else {
      appointmentId = patientIdInput;
    }
  }

  console.log('Processing ID:', { appointmentId, patientIdInput });
  
  let rawId;
  if (appointmentId && typeof appointmentId === 'object') {
    rawId = appointmentId.id || appointmentId.appointmentId || '';
  } else {
    rawId = appointmentId || patientIdInput || "";
  }
  
  const id = String(rawId).trim();
  console.log('Final ID after processing:', id);
  
  if (!id) {
    console.error('No valid ID found. Raw values:', { appointmentId, patientIdInput });
    toast.error("Please enter a valid OPD appointment ID");
    return;
  }

  try {
    console.log("Fetching OPD appointment with ID:", id);
    const response = await getOpdAppointmentById(id);
    const appt = response?.data;
    
    if (!appt) {
      setTransferPreview(null);
      toast.error("No OPD appointment found for this ID");
      return;
    }

    const nameParts = (appt.patientName || '').split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    // Set transfer preview and form data
    setTransferPreview(appt);
    setIpdWizardData(prev => ({
      ...prev,
      opdAppointmentId: appt.id,
      patientId: appt.patientId,
      firstName: firstName,
      lastName: lastName,
      phone: appt.patientPhoneNumber || prev.phone,
      email: appt.patientEmailId || prev.email,
      gender: appt.gender || prev.gender,
      age: appt.age || prev.age,
    }));

    // Auto-advance to the next step (Ward Selection)
    setIpdWizardStep(2);
    
    toast.success("Patient details loaded successfully");
    
  } catch (error) {
    console.error("Error fetching OPD appointment:", {
      error: error.response?.data || error.message,
      status: error.response?.status,
      config: error.config
    });
    setTransferPreview(null);
    const errorMsg = error.response?.data?.message || error.message || "Failed to fetch OPD appointment";
    toast.error(errorMsg);
  }
}, [patientIdInput]);

    useEffect(() => {
      const path = routerLocation?.pathname || "";
      const state = routerLocation?.state || {};

      // Handle OPD to IPD transfer
      if (state?.transferFromOPD && state?.opdAppointmentId) {
        // Ensure we're passing just the ID, not the whole state
        const appointmentId = typeof state.opdAppointmentId === 'object' 
          ? state.opdAppointmentId.id || state.opdAppointmentId 
          : state.opdAppointmentId;
        
        setPatientIdInput(String(appointmentId).trim());
        handleFetchPatientDetails(String(appointmentId).trim());
        setModals(prev => ({ ...prev, ipdWizard: true }));
      }
      // Handle regular IPD admission
      else if (path.includes("/doctordashboard/patients/basic")) {
        setModals(prev => ({ ...prev, ipdWizard: true }));
        setIpdWizardStep(1);
      } else {
        setModals(prev =>
          prev.ipdWizard ? { ...prev, ipdWizard: false } : prev
        );
      }
    }, [routerLocation, handleFetchPatientDetails]);

    const handlePhotoChange = async (e) => {
      const file = e?.target?.files?.[0];
      if (file && file.type && file.type.startsWith("image/")) {
        try {
          const base64Data = await fileToBase64(file);
          setPhotoPreview(base64Data.base64);
          setIpdWizardData((prev) => ({ ...prev, photo: base64Data.base64 }));
        } catch (error) {
          console.error("Error converting photo to base64:", error);
          toast.error("Error processing image. Please try again.");
        }
      } else {
        toast.error("Please upload a valid image file.");
      }
    };

    const handlePincodeChange = async (pincode) => {
      const value = (pincode || "").replace(/\D/g, "").slice(0, 6);
      if (value.length === 6) {
        setIsLoadingCities(true);
        try {
          const result = await handlePincodeLookup(value);
          if (result) {
            setAvailableCities(result.cities || []);
            setIpdWizardData((prev) => ({
              ...prev,
              pincode: value,
              city: "",
              district: result.district || "",
              state: result.state || "",
            }));
          } else {
            setAvailableCities([]);
            setIpdWizardData((prev) => ({
              ...prev,
              pincode: value,
              city: "",
              district: "",
              state: "",
            }));
          }
        } catch (error) {
          setAvailableCities([]);
          setIpdWizardData((prev) => ({
            ...prev,
            pincode: value,
            city: "",
            district: "",
            state: "",
          }));
        } finally {
          setIsLoadingCities(false);
        }
      } else {
        setAvailableCities([]);
        setIpdWizardData((prev) => ({
          ...prev,
          pincode: value,
          city: "",
          district: "",
          state: "",
        }));
      }
    };

    const fetchAllPatients = useCallback(async () => {
      setLoading(true);
      try {
        const response = await fetchIPDAdmissions();
        const allAdmissions = Array.isArray(response?.data) ? response.data : [];

        // If backend returns doctorId, filter by logged-in doctor (like Settings)
        const doctorFiltered = doctorId
          ? allAdmissions.filter((a) => String(a.doctorId) === String(doctorId))
          : allAdmissions;

        const ipdPatientsData = doctorFiltered.map((a, i) => {
          // Format admissionDate similar to VirtualTab (YYYY-MM-DD)
          let admissionDate = "Not specified";
          if (Array.isArray(a.admissionDate) && a.admissionDate.length >= 3) {
            const [y, m, d] = a.admissionDate;
            admissionDate = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          } else if (a.admissionDate) {
            try {
              const d = new Date(a.admissionDate);
              if (!Number.isNaN(d.getTime())) {
                admissionDate = d.toISOString().split("T")[0];
              }
            } catch {
              admissionDate = String(a.admissionDate);
            }
          }

          // Format dischargeDate similarly (YYYY-MM-DD) whenever backend sends a real value
          let dischargeDate = "-";
          const rawDischarge = a.dischargeDate;

          if (Array.isArray(rawDischarge) && rawDischarge.length >= 3) {
            const [y, m, d] = rawDischarge;
            dischargeDate = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          } else if (rawDischarge && typeof rawDischarge !== "number") {
            try {
              const d = new Date(rawDischarge);
              if (!Number.isNaN(d.getTime())) {
                dischargeDate = d.toISOString().split("T")[0];
              } else {
                dischargeDate = String(rawDischarge);
              }
            } catch {
              dischargeDate = String(rawDischarge);
            }
          }

          // Normalize symptoms for table: comma-separated if array, fallback to diagnosis/placeholder
          let symptomsDisplay = "Under evaluation";
          if (Array.isArray(a.symptomNames) && a.symptomNames.length > 0) {
            symptomsDisplay = a.symptomNames.join(", ");
          } else if (typeof a.symptomNames === "string" && a.symptomNames.trim()) {
            symptomsDisplay = a.symptomNames;
          } else if (typeof a.diagnosis === "string" && a.diagnosis.trim()) {
            symptomsDisplay = a.diagnosis;
          }

          // Build combined ward display: WardType-RoomNo-BedNo from backend fields
          const wardDisplay = [
            a.wardTypeName || a.wardType,
            a.roomNumber,
            a.bedNumber,
          ]
            .filter(Boolean)
            .join("-");

          return {
            ...a,
            // Prefer human-facing appointmentUid over numeric id
            sequentialId: a.appointmentUid || a.id || a.admissionId || i + 1,
            name:
              a.patientName ||
              a.name ||
              [a.firstName, a.middleName, a.lastName].filter(Boolean).join(" "),
            ward: wardDisplay || a.ward || a.wardName || a.wardTypeName || "",
            symptoms: symptomsDisplay,
            admissionDate,
            dischargeDate,
          };
        });

        setIpdPatients(ipdPatientsData);
      } catch (error) {
        console.error("Error fetching IPD admissions:", error);
        toast.error("Failed to fetch IPD admissions");
      } finally {
        setLoading(false);
      }
    }, [doctorId]);

    // Removed fetchPatientDetails since extended sections are not shown in ReusableModal

    const openModal = useCallback((modalName) => {
      setModals((prev) => ({ ...prev, [modalName]: true }));
      if (modalName === "ipdWizard") {
        setIpdWizardStep(1);
        setBedScrollIndex(0);
        setIpdWizardData({
          admissionDate: getCurrentDate(),
          admissionTime: getCurrentTime(),
        });
        setSelectedWard(null);
        setSelectedRoom(null);
        setSelectedBed(null);
        setPatientIdInput("");
        setPhotoPreview(null);
        setAvailableCities([]);
        setTransferPreview(null);
      }
    }, []);

    const closeModal = useCallback((modalName) => {
      setModals((prev) => ({ ...prev, [modalName]: false }));
      if (modalName === "viewPatient") {
        setSelectedPatient(null);
      }
      if (modalName === "ipdWizard") {
        setIpdWizardStep(1);
        setIpdWizardData({
          admissionDate: getCurrentDate(),
          admissionTime: getCurrentTime(),
        });
        setSelectedWard(null);
        setSelectedRoom(null);
        setSelectedBed(null);
        setPatientIdInput("");
        setBedScrollIndex(0);
        setPhotoPreview(null);
        setAvailableCities([]);
        setTransferPreview(null);
      }
    }, []);

    const handleViewPatient = useCallback(
      (patient) => {
        setSelectedPatient(patient);
        openModal("viewPatient");
        const patientId = patient?.id || patient?.patientId;
        if (!patientId) toast.error("Unable to load patient details: Missing patient ID");
        // Format admissionDate for view modal similar to table and VirtualTab
        let viewAdmissionDate = "-";
        if (Array.isArray(patient?.admissionDate) && patient.admissionDate.length >= 3) {
          const [y, m, d] = patient.admissionDate;
          viewAdmissionDate = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        } else if (patient?.admissionDate) {
          try {
            const d = new Date(patient.admissionDate);
            if (!Number.isNaN(d.getTime())) {
              viewAdmissionDate = d.toISOString().split("T")[0];
            } else {
              viewAdmissionDate = String(patient.admissionDate);
            }
          } catch {
            viewAdmissionDate = String(patient.admissionDate);
          }
        }

        // Format dischargeDate for view modal (YYYY-MM-DD) only if discharged
        let viewDischargeDate = "-";
        const isDischargedView = (patient?.status || "").toUpperCase() === "DISCHARGED";
        if (isDischargedView && Array.isArray(patient?.dischargeDate) && patient.dischargeDate.length >= 3) {
          const [y, m, d] = patient.dischargeDate;
          viewDischargeDate = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        } else if (isDischargedView && patient?.dischargeDate && typeof patient.dischargeDate !== "number") {
          try {
            const d = new Date(patient.dischargeDate);
            if (!Number.isNaN(d.getTime())) {
              viewDischargeDate = d.toISOString().split("T")[0];
            } else {
              viewDischargeDate = String(patient.dischargeDate);
            }
          } catch {
            viewDischargeDate = String(patient.dischargeDate);
          }
        }

        // Prepare flattened data for ReusableModal
        const view = {
          name: patient?.name || [patient?.firstName, patient?.middleName, patient?.lastName].filter(Boolean).join(" ") || "-",
          sequentialId: patient?.sequentialId || patient?.admissionId || "-",
          email: patient?.email || patient?.patientEmail || "-",
          phone: patient?.phone || patient?.phoneNumber || patient?.mobileNo || "-",
          gender: patient?.gender || patient?.sex || "-",
          bloodGroup: patient?.bloodGroup || patient?.bloodType || "-",
          dob: patient?.dob || "-",
          admissionDate: viewAdmissionDate,
          status: patient?.status || "-",
          department: patient?.department || "-",
          wardType: patient?.wardType || "-",
          wardNo: patient?.wardNo || patient?.wardNumber || "-",
          roomNo: patient?.roomNo || patient?.roomNumber || "-",
          bedNo: patient?.bedNo || patient?.bedNumber || "-",
          ward: patient?.ward || "-",
          insuranceType: patient?.insuranceType || "-",
          dischargeDate: viewDischargeDate,
          symptoms: patient?.symptoms || "-",
          address: patient?.address || patient?.temporaryAddress || patient?.addressTemp || "-",
        };

        setIpdViewData(view);
      },
      [openModal]
    );

    const handleEditPatient = useCallback(
      (patient) => {
        setSelectedPatient(patient);
        closeModal("viewPatient");
      },
      [closeModal]
    );

    const handleIpdWizardChange = useCallback((field, value) => {
      setIpdWizardData((prev) => {
        if (field === "pincode") {
          handlePincodeChange(value);
          return prev;
        }
        
        // Convert status to number if it's the status field
        if (field === "status") {
          value = Number(value);
        }
        
        const updated = { ...prev, [field]: value };
        
        if (field === "phone") {
          const formatted = (value || "").replace(/\D/g, "").slice(0, 10);
          updated.phone = formatted;
        }
        if (field === "aadhaar") {
          const formatted = (value || "")
            .replace(/\D/g, "")
            .slice(0, 12)
            .replace(/(\d{4})(\d{4})(\d{0,4})/, (_, g1, g2, g3) =>
              [g1, g2, g3].filter(Boolean).join("-")
            );
          updated.aadhaar = formatted;
        }
        if (field === "sameAsPermAddress" && value && prev.permanentAddress) {
          updated.temporaryAddress = prev.permanentAddress;
        }
        return updated;
      });
    }, []);

const handleIpdWizardNext = useCallback(() => {
  setIpdWizardStep(prev => prev + 1);
}, []);
const handleIpdWizardFinish = useCallback(async () => {
  if (isSubmitting) return;
  
  try {
    setIsSubmitting(true);
    if (!doctorId) {
      toast.error("Doctor ID not found. Please log in again.");
      return;
    }

    // Get patient ID with proper validation
    const rawPatientId = ipdWizardData.patientId;
    const parsedPatientId = rawPatientId ? parseInt(rawPatientId, 10) : NaN;
    const patientId = !Number.isNaN(parsedPatientId) && parsedPatientId > 0
      ? parsedPatientId
      : 1; // Fallback for development

    // Get ward and room details
    const wardId = selectedWard?.id || ipdWizardData.wardId || 0;
    const wardTypeId = selectedWard?.wardTypeId || ipdWizardData.wardTypeId || 0;
    const specializationId = selectedWard?.specializationId || ipdWizardData.specializationId || 0;
    
    // Get room and bed details
    const roomId = selectedRoom?.id || ipdWizardData.roomId || 0;
    const bedId = selectedBed?.id || ipdWizardData.bedId || 0;

    // Process symptoms
    const rawSymptoms = ipdWizardData.symptoms;
    let symptomIds = [];
    if (Array.isArray(rawSymptoms)) {
      symptomIds = rawSymptoms
        .map((v) => parseInt(v, 10))
        .filter((v) => !Number.isNaN(v));
    } else if (rawSymptoms != null && rawSymptoms !== "") {
      const singleId = parseInt(rawSymptoms, 10);
      if (!Number.isNaN(singleId)) {
        symptomIds = [singleId];
      }
    }

    // Prepare admission data
    const admissionDate = ipdWizardData.admissionDate || getCurrentDate();
    const admissionTime24 = to24Hour(ipdWizardData.admissionTime);
    const surgeryReq = ipdWizardData.surgeryRequired === true || 
                      ipdWizardData.surgeryRequired === "Yes";
    
    // Get status from form data, default to 1 (Admitted) if not set
    const statusId = ipdWizardData.status && typeof ipdWizardData.status === 'number' 
      ? ipdWizardData.status 
      : 1;

    // Get the opdAppointmentId in the correct format
    let opdAppointmentId = transferPreview?.appointmentUid || 
                          transferPreview?.opdAppointmentId || 
                          ipdWizardData.opdAppointmentId;

    // Format the ID if needed
    if (opdAppointmentId && typeof opdAppointmentId === 'number') {
      opdAppointmentId = `APPT-${opdAppointmentId.toString().toUpperCase().padStart(8, '0')}`;
    } else if (opdAppointmentId && typeof opdAppointmentId === 'string' && !opdAppointmentId.startsWith('APPT-')) {
      opdAppointmentId = `APPT-${opdAppointmentId.toUpperCase()}`;
    }

    console.log('Final opdAppointmentId:', opdAppointmentId);
    
    // Build the API payload with all required fields
    const apiPayload = {
      admissionDate,
      admissionTime: admissionTime24,
      statusId,
      wardTypeId,
      wardId,
      roomId,
      bedId,
      insuranceId: ipdWizardData.insuranceId || 0,
      surgeryReq,
      ...(statusId === 2 && { dischargeDate: ipdWizardData.dischargeDate || getCurrentDate() }),
      symptomIds: symptomIds.length > 0 ? symptomIds : [0],
      reasonForAdmission: ipdWizardData.reasonForAdmission || "Admission for treatment",
      patientId,
      doctorId,
      opdAppointmentId: opdAppointmentId || "",
      specializationId
    };

    console.log("Submitting IPD Admission:", JSON.stringify(apiPayload, null, 2));

    try {
      const res = await addIPDAdmission(apiPayload);
      console.log("[IPD] addIPDAdmission response", res?.status, res?.data);
    
      if (res.data) {
        toast.success("Patient transferred to IPD successfully");
        
        // Reset the wizard state first
        setIpdWizardStep(1);
        setIpdWizardData({});
        setSelectedWard(null);
        setSelectedRoom(null);
        setSelectedBed(null);
        setPatientIdInput("");
        setTransferPreview(null);
        
        // Close the wizard modal
        closeModal('ipdWizard');
        
        // Add a small delay to ensure modal is fully closed before navigation
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Navigate to IPD dashboard
       navigate('/doctordashboard/patients');
        
        // Refresh the patients list after navigation
        await fetchAllPatients();
      }
    } catch (apiError) {
      console.error("API Error:", {
        error: apiError.response?.data || apiError.message,
        status: apiError.response?.status,
        config: apiError.config
      });
      throw apiError;
    }
  } catch (error) {
    console.error("Error in handleIpdWizardFinish:", {
      error: error.response?.data || error.message,
      status: error.response?.status
    });
    const errorMsg = error.response?.data?.message || error.message || "Failed to complete IPD admission";
    toast.error(errorMsg);
  } finally {
    setIsSubmitting(false);
  }
}, [
  ipdWizardData,
  selectedWard,
  selectedRoom,
  selectedBed,
  doctorId,
  isSubmitting,
  transferPreview,
  closeModal,
  fetchAllPatients,
  getCurrentDate,
  to24Hour,
  navigate
]);
    const handleRoomSelection = useCallback((room) => {
      if (!room) return;
      const roomNumber = room.roomNumber;
      setSelectedRoom(roomNumber);
      setBedScrollIndex(0); // always start from first page of beds for a new room
      setIpdWizardData((prev) => ({
        ...prev,
        roomId: room.roomId,
        roomNumber: roomNumber != null ? roomNumber.toString() : prev.roomNumber,
      }));
    }, []);

    const handleBedSelection = useCallback(
      (bed) => {
        if (!selectedWard || !bed) return;

        const bedNumber = bed.bedNumber;

        // Parse ward name like "ICU 1" -> wardType="ICU", wardNum="1"
        const rawType = (selectedWard.type || "").toString();
        const m = rawType.match(/^(.+?)\s+(\d+)\s*$/);
        const wardType = m ? m[1] : rawType;
        const wardNum  = m ? m[2] : (selectedWard.number ?? selectedWard.wardNumber ?? "");

        // Include ROOM in the key (must match how you build `patient.ward`)
        const wardKey = `${wardType}-${wardNum}-${selectedRoom}-${bedNumber}`;

        const isOccupied = ipdPatients.some(
          (p) =>
            (p.status || "").toLowerCase() === "admitted" &&
            (p.ward || "").toString() === wardKey
        );
        if (isOccupied) {
          toast.error("This bed is currently occupied by another patient");
          return;
        }

        setSelectedBed(bedNumber);
        setIpdWizardData((prev) => ({
          ...prev,
          bedId: bed.bedId,
          bedNumber: bedNumber.toString(),
          admissionDate: getCurrentDate(),
          admissionTime: incrementTime(prev.admissionTime),
        }));
      },
      [selectedWard, selectedRoom, ipdPatients]
    );

    const scrollBeds = useCallback(
      (direction) => {
        if (!selectedWard) return;
        const bedsPerPage =
          window.innerWidth < 640 ? 4 : window.innerWidth < 768 ? 6 : 12;
        const newIndex =
          direction === "left"
            ? Math.max(0, bedScrollIndex - bedsPerPage)
            : Math.min(
                Math.max(0, (selectedWard?.totalBeds || 0) - bedsPerPage),
                bedScrollIndex + bedsPerPage
              );
        setBedScrollIndex(newIndex);
      },
      [selectedWard, bedScrollIndex]
    );

    const handleAddRecord = useCallback(
      (patient) => navigate("/doctordashboard/form", { state: { patient } }),
      [navigate]
    );

    const columns = useMemo(
      () => [
        { header: "Appointment ID", accessor: "sequentialId" },
        {
          header: "Name",
          accessor: "name",
          clickable: true,
          cell: (row) => (
            <button
              className="cursor-pointer text-[var(--primary-color)] hover:text-[var(--accent-color)]"
              onClick={() => handleViewPatient(row)}
            >
              {row.name ||
                `${row.firstName || ""} ${row.middleName || ""} ${row.lastName || ""}`
                  .replace(/\s+/g, " ")
                  .trim()}
            </button>
          ),
        },
        { header: "Admission", accessor: "admissionDate" },
        {
          header: "Status",
          cell: (row) => (
            <span
              className={`status-badge ${
                row.status === "Admitted"
                  ? "status-admitted"
                  : row.status === "Under Treatment"
                  ? "status-pending"
                  : "status-discharged"
              }`}
            >
              {row.status}
            </span>
          ),
        },
        { header: "Symptoms", accessor: "symptoms" },
        { header: "Ward", accessor: "ward", cell: (row) => row.ward || "N/A" },
        {
          header: "Discharge",
          accessor: "dischargeDate",
          cell: (row) => {
            if (!row.dischargeDate || typeof row.dischargeDate === "number")
              return "-";
            return row.dischargeDate;
          },
        },
        {
          header: "Actions",
          cell: (row) => (
            <div className="flex items-center gap-1">
              {/* <button onClick={() => handleAddRecord(row)} className="text-base p-1">
                <FaNotesMedical />
              </button>
              <div className="text-sm">
                <TeleConsultFlow
                  phone={row.phone}
                  patientName={
                    row.name ||
                    `${row.firstName || ""} ${row.middleName || ""} ${row.lastName || ""}` 
                      .replace(/\s+/g, " ")
                      .trim()
                  }
                  context="IPD"
                  patientEmail={row.email}
                  hospitalName={row.hospitalName || "AV Hospital"}
                />
              </div> */}
              {hasRecording(row.email, row.hospitalName || "AV Hospital") && (
                <button className="text-base p-1 text-green-600" title="View Recording">
                  <FaVideo />
                </button>
              )}
              <button
                title="Quick Links"
                className="p-0.5 text-base text-[var(--primary-color)]"
                style={{ display: "flex", alignItems: "center" }}
                onClick={() => {
                  setQuickLinksPatient(row);
                  setQuickLinksOpen(true);
                }}
              >
                <FiLink />
              </button>
              <button
                title="View Medical Record"
                onClick={() => {
                  navigate("/doctordashboard/medical-record", {
                    state: { patient: row },
                  });
                }}
                className="p-0.5 text-base text-[var(--primary-color)]"
                style={{ display: "flex", alignItems: "center" }}
              >
                <FiExternalLink />
              </button>
            </div>
          ),
        },
      ],
      [handleViewPatient, handleAddRecord, hasRecording, navigate]
    );

    const filters = useMemo(
      () => [
        { key: "status", label: "Status", options: STATIC_DATA.status },
        {
          key: "department",
          label: "Department",
          options: (masterData?.departments || []).map((d, i) => ({
            ...d,
            key: `dept-filter-${i}`,
          })),
        },
      ],
      [masterData]
    );

    const renderWizardStep = useCallback(() => {
      if (ipdWizardStep === 1) {
        const basicFields = generateBasicFields(masterData || {}, availableCities, isLoadingCities);
        return (
          <IPDBasic
            data={ipdWizardData}
            onChange={handleIpdWizardChange}
            onNext={handleIpdWizardNext}
            patientIdInput={patientIdInput}
            setPatientIdInput={setPatientIdInput}
            onFetchPatient={handleFetchPatientDetails}
            fields={basicFields}
            photoPreview={photoPreview}
            onPhotoChange={handlePhotoChange}
            onPreviewClick={() => setIsPhotoModalOpen(true)}
            isLoadingCities={isLoadingCities}
            availableCities={availableCities}
            transferPreview={transferPreview}
          />
        );
      }
      if (ipdWizardStep === 2)
        return (
          <IPDWard
            wardData={wardData}
            selectedWard={selectedWard}
            onSelectWard={setSelectedWard}
          />
        );
     if (ipdWizardStep === 3)
  return (
    <IPDRoom
      wardData={wardData}
      selectedWard={selectedWard}
      selectedRoom={selectedRoom}
      onSelectRoom={handleRoomSelection}
    />
  );

      if (ipdWizardStep === 4)
        return (
          <IPDBed
            selectedWard={selectedWard}
            selectedRoom={selectedRoom}
            bedFacilities={bedFacilities}
            selectedBed={selectedBed}
            onSelectBed={handleBedSelection}
            ipdPatients={ipdPatients}
            bedScrollIndex={bedScrollIndex}
            onScrollBeds={scrollBeds}
          />
        );
      const admissionFields = generateAdmissionFields(masterData || {}, STATIC_DATA);
      return (
        <IPDFinal
          data={ipdWizardData}
          selectedWard={selectedWard}
          selectedRoom={selectedRoom}
          selectedBed={selectedBed}
          fields={admissionFields}
          onChange={handleIpdWizardChange}
        />
      );
    }, [
      ipdWizardStep,
      ipdWizardData,
      patientIdInput,
      wardData,
      selectedWard,
      selectedRoom,
      selectedBed,
      bedFacilities,
      ipdPatients,
      bedScrollIndex,
      photoPreview,
      isLoadingCities,
      availableCities,
      masterData,
      handleIpdWizardChange,
      handleIpdWizardNext,
      handleFetchPatientDetails,
      handleRoomSelection,
      handleBedSelection,
      scrollBeds,
    ]);

    const renderIpdWizardContent = useCallback(
      () => (
        <motion.div
          className="w-full max-w-6xl mx-auto p-1 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="flex flex-col relative w-full h-auto rounded-xl bg-white shadow-xl overflow-hidden"
            initial={{ scale: 0.98, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
           
            <div className="flex-1 overflow-y-auto bg-gradient-to-br from-[#E6FBF5] to-[#C1F1E8]">
              <div className="flex-shrink-0 px-2 sm:px-6 py-3 sm:py-4">
                <div className="flex items-center justify-center space-x-2 sm:space-x-4 min-w-max overflow-x-auto pb-2">
                  {WIZARD_STEPS.map((step, index) => (
                    <div key={step.id} className="flex items-center">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-6 h-6 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-300 ${
                            ipdWizardStep >= step.id ? "bg-[#01B07A] text-white" : "bg-gray-300 text-gray-600"
                          }`}
                        >
                          {ipdWizardStep > step.id ? (
                            <svg className="w-3 h-3 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            step.id
                          )}
                        </div>
                        <div className="text-center mt-1 sm:mt-2">
                          <div className={`text-xs sm:text-sm font-medium ${ipdWizardStep >= step.id ? "text-[#01B07A]" : "text-gray-600"}`}>
                            <span className="hidden sm:inline">{step.title}</span>
                            <span className="sm:hidden">{step.shortTitle}</span>
                          </div>
                          <div className="text-xs text-gray-500 hidden sm:block">{step.description}</div>
                        </div>
                      </div>
                      {index < WIZARD_STEPS.length - 1 && (
                        <div className={`w-8 sm:w-16 h-0.5 mx-1 sm:mx-2 transition-all duration-500 ${ipdWizardStep > step.id ? "bg-[#01B07A]" : "bg-gray-300"}`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="px-2 sm:px-6 pb-4">
                <motion.div className="bg-white rounded-xl p-3 sm:p-6 shadow-inner" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} key={ipdWizardStep}>
                  {renderWizardStep()}
                </motion.div>
              </div>
            </div>
            <div className="flex-shrink-0 bg-white border-t p-3 sm:p-4 sticky bottom-0 z-10 flex flex-col-reverse sm:flex-row justify-between gap-2">
           <button
  onClick={() => {
    if (ipdWizardStep === 1) {
      closeModal("ipdWizard");
    } else {
      setIpdWizardStep(prev => prev - 1);
    }
  }}
  className="px-4 sm:px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 text-xs sm:text-sm"
>
  {ipdWizardStep === 1 ? "Cancel" : "Back"}
</button>
              <button
                onClick={ipdWizardStep === 5 ? handleIpdWizardFinish : handleIpdWizardNext}
                className="px-4 sm:px-6 py-2 bg-[#01B07A] text-white rounded-lg hover:bg-[#018A65] transition-all duration-200 text-xs sm:text-sm"
              >
                {ipdWizardStep === 5 ? "Save Admission" : "Next"}
              </button>
            </div>
          </motion.div>
          {isPhotoModalOpen && photoPreview && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-2">
              <div className="bg-white p-2 sm:p-4 rounded shadow-lg relative max-w-2xl max-h-[80vh] overflow-auto">
                <img src={photoPreview} alt="Preview" className="max-h-[60vh] max-w-full object-contain" />
                <button
                  onClick={() => setIsPhotoModalOpen(false)}
                  className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-red-500 text-white rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center hover:bg-red-600 text-xs sm:text-base"
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </motion.div>
      ),
      [
        ipdWizardStep,
        renderWizardStep,
        closeModal,
        handleIpdWizardNext,
        handleIpdWizardFinish,
        isPhotoModalOpen,
        photoPreview,
      ]
    );

    useEffect(() => {
      if (typeof setTabActions === "function") {
        setTabActions([]);
      }
    }, [setTabActions]);

    useEffect(() => {
      if (doctorName && !masterData?.loading) fetchAllPatients();
    }, [doctorName, masterData?.loading, fetchAllPatients]);

    useEffect(() => {
      const highlightIdFromState = location?.state?.highlightId;
      if (highlightIdFromState) setNewPatientId(highlightIdFromState);
    }, [location?.state]);

    const tabActionsToUse = tabActions.length ? tabActions : [];

    return modals.ipdWizard ? (
      renderIpdWizardContent()
    ) : (
      <>
        <DynamicTable
          columns={columns}
          data={ipdPatients}
          filters={filters}
          loading={loading}
          onViewPatient={handleViewPatient}
          newRowIds={[newPatientId].filter(Boolean)}
          tabs={tabs}
          tabActions={tabActionsToUse}
          activeTab={activeTab}
          onTabChange={onTabChange}
          rowClassName={(row) =>
            row.sequentialId === newPatientId || row.sequentialId === location?.state?.highlightId
              ? "font-bold bg-yellow-100 hover:bg-yellow-200 transition-colors duration-150"
              : ""
          }
        />
        <QuickLinksPanel
          isOpen={quickLinksOpen}
          onToggle={(open) => setQuickLinksOpen(Boolean(open))}
          setActiveForm={() => {}}
          patient={quickLinksPatient || {}}
          showTrigger={false}
          usePortal={true}
          nudgeUpPx={28}
        />
        <ReusableModal
          isOpen={modals.viewPatient}
          onClose={() => closeModal("viewPatient")}
          mode="viewProfile"
          title="IPD Patient Info"
          data={ipdViewData || selectedPatient || {}}
          viewFields={IPD_VIEW_FIELDS}
          extraContent={
            <div className="flex justify-end mt-4">
              <button onClick={() => handleEditPatient(selectedPatient)} className="view-btn">
                Edit Patient
              </button>
            </div>
          }
        />
      </>
    );
  }
);

IPDTab.displayName = "IPDTab";
export default IPDTab;