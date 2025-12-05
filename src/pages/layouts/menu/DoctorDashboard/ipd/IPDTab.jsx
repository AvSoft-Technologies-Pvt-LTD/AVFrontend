import React, { useState, useEffect, useCallback, useMemo, forwardRef, useImperativeHandle } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { FaVideo } from "react-icons/fa";
import { FiExternalLink, FiLink } from "react-icons/fi";
import QuickLinksPanel from "../../DoctorDashboard/QuickLinksPanel";
import DynamicTable from "../../../../../components/microcomponents/DynamicTable";
import ReusableModal from "../../../../../components/microcomponents/Modal";
import { usePatientContext } from "../../../../../context-api/PatientContext";
import {
  getSpecializationsWardsSummaryForIpdAdmission,
  addIPDAdmission,
  fetchIPDAdmissions,
  fetchIPDAdmission,
  getOpdAppointmentById,
  editIPDAdmission
} from "../../../../../utils/CrudService";
import IPDBasic, { fileToBase64, handlePincodeLookup, generateBasicFields } from "./IPDBasic";
import IPDWard from "./IPDWard";
import IPDRoom from "./IPDRoom";
import IPDBed from "./IPDBed";
import IPDFinal, { generateAdmissionFields } from "./IPDFinal";

const STATIC_DATA = {
  insurance: ["None", "CGHS", "ESIC", "Private Insurance", "Other"].map((v, i) => ({
    value: v,
    label: v,
    key: `insurance-${i}`
  })),
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

const stepTitles = ["Patient Details", "Ward Selection", "Room Selection", "Bed Selection", "Admission"];
const stepDescriptions = ["Basic Information", "Choose Ward", "Choose Room", "Choose Bed", "Finalize Details"];
const shortTitles = ["Details", "Ward", "Room", "Bed", "Final"];
const WIZARD_STEPS = stepTitles.map((title, index) => ({
  id: index + 1,
  title,
  description: stepDescriptions[index],
  shortTitle: shortTitles[index]
}));

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
  { key: "symptoms", label: "Symptoms" },
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
          `${(mod === "PM" && h !== "12" ? +h + 12 : mod === "AM" && h === "12" ? 0 : +h)
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

    // State
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
    const [selectedWardName, setSelectedWardName] = useState("");
    const [selectedRoomNumber, setSelectedRoomNumber] = useState("");
    const [selectedBedNumber, setSelectedBedNumber] = useState("");
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
    const { setPatient } = usePatientContext();
// const [selectedWard, setSelectedWard] = useState(null);
// const [selectedRoom, setSelectedRoom] = useState(null);
// const [selectedBed, setSelectedBed] = useState(null);

    // Refs
    useImperativeHandle(ref, () => ({
      openAddPatientModal: () => {
        setModals((prev) => ({ ...prev, ipdWizard: true }));
        setIpdWizardStep(1);
      },
    }));

    // Helpers
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

    // Data Loading
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
          wardName: item.wardName,
          type: item.wardName,
          department: item.specializationName,
          totalBeds: item.totalBeds,
          availableBeds,
          occupiedBeds,
          rooms: item.rooms || [], // Ensure rooms array is included
          roomNumbers: item.roomNumbers,
          beds: item.rooms?.flatMap((r) => r.beds || []),
          wardTypeId: item.wardTypeId,
          specializationId: item.specializationId,
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

    // Patient Data Handling
    const handleFetchPatientDetails = useCallback(async (appointmentId) => {
      if (appointmentId && appointmentId.nativeEvent) {
        appointmentId.preventDefault();
        const idFromButton = appointmentId.currentTarget?.dataset?.id || appointmentId.target?.dataset?.id;
        if (idFromButton) {
          appointmentId = idFromButton;
        } else {
          appointmentId = patientIdInput;
        }
      }
      let rawId;
      if (appointmentId && typeof appointmentId === 'object') {
        rawId = appointmentId.id || appointmentId.appointmentId || '';
      } else {
        rawId = appointmentId || patientIdInput || "";
      }
      const id = String(rawId).trim();
      if (!id) {
        console.error('No valid ID found. Raw values:', { appointmentId, patientIdInput });
        toast.error("Please enter a valid OPD appointment ID");
        return;
      }
      try {
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

    // IPD Patients Fetching
    const fetchAllPatients = useCallback(async () => {
      setLoading(true);
      try {
        const response = await fetchIPDAdmissions();
        const allAdmissions = Array.isArray(response?.data) ? response.data : [];
        const doctorFiltered = doctorId
          ? allAdmissions.filter((a) => String(a.doctorId) === String(doctorId))
          : allAdmissions;
        const ipdPatientsData = doctorFiltered.map((a, i) => {
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
          let symptomsDisplay = "Under evaluation";
          if (Array.isArray(a.symptomNames) && a.symptomNames.length > 0) {
            symptomsDisplay = a.symptomNames.join(", ");
          } else if (typeof a.symptomNames === "string" && a.symptomNames.trim()) {
            symptomsDisplay = a.symptomNames;
          } else if (typeof a.diagnosis === "string" && a.diagnosis.trim()) {
            symptomsDisplay = a.diagnosis;
          }
          const wardDisplay = [
            a.wardTypeName || a.wardType,
            a.roomNumber,
            a.bedNumber,
          ]
            .filter(Boolean)
            .join("-");
          return {
            ...a,
            id: a.id,
            sequentialId: a.appointmentUid || a.id || a.admissionId || i + 1,
            name:
              a.patientName ||
              a.name ||
              [a.firstName, a.middleName, a.lastName].filter(Boolean).join(" "),
            ward: wardDisplay || a.ward || a.wardName || a.wardTypeName || "",
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

    // Patient Selection
    const handleSelected = (r) => {
      try {
        localStorage.setItem("selectedThisPatient", JSON.stringify(r));
        setPatient(r);
        navigate("/doctordashboard/medical-record", { state: { patient: r } });
      } catch (error) {
        console.error("[OPD] Error saving patient:", error);
      }
    };
const handleLink = (r) => {
      try {
        localStorage.setItem("selectedThisPatient", JSON.stringify(r));
        setPatient(r);
        setQuickLinksPatient(r);
        setQuickLinksOpen(true);
      } catch (error) {
        console.error("[OPD] Error saving patient:", error);
      }
    };
    // Modal Management
    const openModal = useCallback((modalName) => {
      setModals((prev) => ({ ...prev, [modalName]: true }));
      if (modalName === "ipdWizard") {
        setIpdWizardStep(1);
        setBedScrollIndex(0);
        setIpdWizardData({
          admissionDate: getCurrentDate(),
          admissionTime: getCurrentTime(),
        });
        setSelectedWardName("");
        setSelectedRoomNumber("");
        setSelectedBedNumber("");
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
    }, []);

    // Photo Handling
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

    // Pincode Handling
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

    // Ward Selection
const handleWardSelection = useCallback((ward) => {
  if (!ward) return;
  setSelectedWardName(ward.wardName);
  setSelectedRoomNumber("");
  setSelectedBedNumber("");
  setIpdWizardData((prev) => ({
    ...prev,
    wardId: ward.id, // Update wardId
    wardType: ward.wardName || ward.type,
    wardNumber: ward.wardNumber || ward.number,
    department: ward.specializationName || ward.department,
    wardTypeId: ward.wardTypeId,
    specializationId: ward.specializationId,
  }));
}, []);


const handleRoomSelection = useCallback((roomNumber, roomId) => {
  if (!roomNumber) return;

  const selectedWard = wardData.find(ward => ward.wardName === selectedWardName);
  const selectedRoom = selectedWard?.rooms?.find(room => room.roomNumber === roomNumber);

  setSelectedRoomNumber(roomNumber);


  // Update the form data with the selected room details
   setIpdWizardData((prev) => ({
    ...prev,
    wardId: selectedWard?.id || 0,
    wardTypeId: selectedWard?.wardTypeId || 0,
    specializationId: selectedWard?.specializationId || 0,
    roomId: selectedRoom?.id || 0,
    roomNumber: roomNumber,
    // Reset bed selection when room changes
    bedId: 0,
    bedNumber: "",
  }));
}, [selectedWardName, wardData]);

    // Bed Selection
 const handleBedSelection = useCallback(
  (bedNumber) => {
    if (!bedNumber) return;

    // Find the selected ward
    const selectedWard = wardData.find(ward => ward.wardName === selectedWardName);
  const selectedRoom = selectedWard?.rooms?.find(room => room.roomNumber === selectedRoomNumber);
  const selectedBed = selectedRoom?.beds?.find(bed => bed.bedNumber === bedNumber);


    const wardType = selectedWard?.type || "";
    const wardNum = selectedWard?.number || selectedWard?.wardNumber || "";
    const wardKey = `${wardType}-${wardNum}-${selectedRoomNumber}-${bedNumber}`;

    const isOccupied = ipdPatients.some(
      (p) =>
        (p.status || "").toLowerCase() === "admitted" &&
        (p.ward || "").toString() === wardKey
    );

    if (isOccupied) {
      toast.error("This bed is currently occupied by another patient");
      return;
    }

    setSelectedBedNumber(bedNumber);

    // Update the form data with the selected bed details
    setIpdWizardData((prev) => ({
    ...prev,
    wardId: selectedWard?.id || 0,
    wardTypeId: selectedWard?.wardTypeId || 0,
    specializationId: selectedWard?.specializationId || 0,
    roomId: selectedRoom?.id || 0,
    roomNumber: selectedRoomNumber,
    bedId: selectedBed?.id || 0,
    bedNumber: bedNumber,
    admissionDate: getCurrentDate(),
    admissionTime: incrementTime(prev.admissionTime),
  }));
}, [selectedWardName, selectedRoomNumber, ipdPatients, wardData]);


    // Bed Scrolling
    const scrollBeds = useCallback(
      (direction) => {
        const bedsPerPage =
          window.innerWidth < 640 ? 4 : window.innerWidth < 768 ? 6 : 12;
        const newIndex =
          direction === "left"
            ? Math.max(0, bedScrollIndex - bedsPerPage)
            : Math.min(
                Math.max(0, (wardData.find(w => w.wardName === selectedWardName)?.totalBeds || 0) - bedsPerPage),
                bedScrollIndex + bedsPerPage
              );
        setBedScrollIndex(newIndex);
      },
      [selectedWardName, bedScrollIndex, wardData]
    );

    // Patient View
    const handleViewPatient = useCallback(
      (patient) => {
        setSelectedPatient(patient);
        openModal("viewPatient");
        const patientId = patient?.id || patient?.patientId;
        if (!patientId) toast.error("Unable to load patient details: Missing patient ID");
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

    // Edit Patient
   const handleEditPatient = useCallback(
  (patient) => {
    const updatedPatient = {
      ...patient,
      id: patient.id,
      admissionId: patient.admissionId || patient.id,
    };

    // Set selected values based on API data
    setSelectedWardName(patient.wardType || patient.wardName || "");
    setSelectedRoomNumber(patient.roomNo || patient.roomNumber || "");
    setSelectedBedNumber(patient.bedNo || patient.bedNumber || "");
        setIpdWizardData(prev => ({
          ...prev,
          patientId: patient.patientId,
          name: patient.name || [patient.firstName, patient.middleName, patient.lastName].filter(Boolean).join(" ") || "",
          firstName: patient.firstName || "",
          middleName: patient.middleName || "",
          lastName: patient.lastName || "",
          phone: patient.phone || patient.phoneNumber || patient.mobileNo || "",
          email: patient.email || patient.patientEmail || "",
          gender: patient.gender || patient.sex || "",
          age: patient.age || "",
          bloodGroup: patient.bloodGroup || patient.bloodType || "",
          dob: patient.dob || "",
          address: patient.address || patient.temporaryAddress || patient.addressTemp || "",
          city: patient.city || "",
          state: patient.state || "",
          pincode: patient.pincode || "",
          admissionDate: patient.admissionDate || getCurrentDate(),
          admissionTime: patient.admissionTime || getCurrentTime(),
          status: patient.status || "Admitted",
          symptoms: patient.symptoms || patient.symptomNames || [],
          diagnosis: patient.diagnosis || "",
          insuranceType: patient.insuranceType || "None",
          surgeryRequired: patient.surgeryRequired || "No",
          reasonForAdmission: patient.reasonForAdmission || "",
          doctorId: patient.doctorId || doctorId,
          wardId: patient.wardId || "",
          wardType: patient.wardType || patient.wardName || "",
          wardNumber: patient.wardNo || patient.wardNumber || "",
          roomId: patient.roomId || "",
          roomNumber: patient.roomNo || patient.roomNumber || "",
          bedId: patient.bedId || "",
          bedNumber: patient.bedNo || patient.bedNumber || "",
          specializationId: patient.specializationId || "",
        }));

        if (patient.photo) {
          setPhotoPreview(patient.photo);
        }

        closeModal("viewPatient");
        setModals(prev => ({ ...prev, ipdWizard: true }));
        setIpdWizardStep(2);
        setSelectedPatient(updatedPatient);
      },
      [closeModal, doctorId]
    );

    // Edit Admission
const handleEditAdmission = useCallback(async (id) => {
  try {
    setLoading(true);
    const { data } = await fetchIPDAdmission(id);

    // Set the selected ward, room, and bed based on API data
    setSelectedWardName(data.wardName); // Use the exact ward name from API
    setSelectedRoomNumber(data.roomNumber); // Use the exact room number from API
    setSelectedBedNumber(data.bedNumber); // Use the exact bed number from API

    // Update the form data
    handleEditPatient(data);
  } catch (err) {
    toast.error("Failed to load admission details");
    console.error("Error:", err);
  } finally {
    setLoading(false);
  }
}, [handleEditPatient]);


    // Wizard Data Handling
    const handleIpdWizardChange = useCallback((field, value) => {
  // Handle bulk update case (from IPDFinal)
 if (typeof field === 'object') {
    setIpdWizardData(prev => {
      // Only update if the values have actually changed
      const hasChanges = Object.keys(field).some(key => 
        JSON.stringify(prev[key]) !== JSON.stringify(field[key])
      );
      return hasChanges ? { ...prev, ...field } : prev;
    });
    return;
  }

  setIpdWizardData(prev => {
    // Only update if the value has actually changed
    if (JSON.stringify(prev[field]) === JSON.stringify(value)) {
      return prev;
    }

    // Create a new state object
    const updated = { ...prev };

    // Special handling for specific fields
    switch (field) {
      case "status":
        updated[field] = Number(value);
        break;
      case "phone":
        updated.phone = (value || "").replace(/\D/g, "").slice(0, 10);
        break;
      case "aadhaar":
        updated.aadhaar = (value || "")
          .replace(/\D/g, "")
          .slice(0, 12)
          .replace(/(\d{4})(\d{4})(\d{0,4})/, (_, g1, g2, g3) =>
            [g1, g2, g3].filter(Boolean).join("-")
          );
        break;
      case "sameAsPermAddress":
        updated[field] = value;
        if (value && prev.permanentAddress) {
          updated.temporaryAddress = prev.permanentAddress;
        }
        break;
      default:
        updated[field] = value;
    }

    return updated;
  });
}, [handlePincodeChange]); // Make sure to include all dependencies

const handleIpdWizardNext = useCallback(() => {
  // Validate current step before proceeding
  let canProceed = true;
  
  switch (ipdWizardStep) {
    case 1: // Patient Details
      // Removed validation for patient details as we're using hardcoded patient ID
      break;
    case 2: // Ward Selection
      if (!selectedWardName) {
        toast.error("Please select a ward");
        canProceed = false;
      }
      break;
    case 3: // Room Selection
      if (!selectedRoomNumber) {
        toast.error("Please select a room");
        canProceed = false;
      }
      break;
    case 4: // Bed Selection
      if (!selectedBedNumber) {
        toast.error("Please select a bed");
        canProceed = false;
      }
      break;
  }

  if (canProceed) {
    setIpdWizardStep(prev => Math.min(prev + 1, 5)); // Don't go past step 5
  }
}, [ipdWizardStep, ipdWizardData, selectedWardName, selectedRoomNumber, selectedBedNumber]);
    // Wizard Finish
  const handleIpdWizardFinish = useCallback(async () => {
  if (isSubmitting) return;
  try {
    setIsSubmitting(true);
    if (!doctorId) {
      toast.error("Doctor ID not found. Please log in again.");
      return;
    }
    const rawPatientId = ipdWizardData.patientId;
    const parsedPatientId = rawPatientId ? parseInt(rawPatientId, 10) : NaN;
    const patientId = !Number.isNaN(parsedPatientId) && parsedPatientId > 0 ? parsedPatientId : 1;

    // Find ward, room, bed by name/number
    const selectedWard = wardData.find(w => w.wardName === selectedWardName);
    const selectedRoom = selectedWard?.rooms?.find(r => r.roomNumber === selectedRoomNumber);
    const selectedBed = selectedRoom?.beds?.find(b => b.bedNumber === selectedBedNumber);

    // Debug logs to check the values
    console.log('Selected Ward:', selectedWard);
    console.log('Selected Room:', selectedRoom);
    console.log('Selected Bed:', selectedBed);
    console.log('Wizard Data:', ipdWizardData);

    // Get the IDs with fallbacks
    const wardId = selectedWard?.id || ipdWizardData.wardId || 0;
    const wardTypeId = selectedWard?.wardTypeId || ipdWizardData.wardTypeId || 0;
    const specializationId = selectedWard?.specializationId || ipdWizardData.specializationId || 0;
    const roomId = selectedRoom?.id || ipdWizardData.roomId || 0;
    const bedId = selectedBed?.id || ipdWizardData.bedId || 0;
    
    // Log the final IDs being used
    console.log('Final IDs:', { wardId, roomId, bedId, insuranceId: ipdWizardData.insuranceId });

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

    const admissionDate = ipdWizardData.admissionDate || getCurrentDate();
    const admissionTime24 = to24Hour(ipdWizardData.admissionTime);
    const surgeryReq = ipdWizardData.surgeryRequired === true || ipdWizardData.surgeryRequired === "Yes";
    const statusId = ipdWizardData.status && typeof ipdWizardData.status === 'number' ? ipdWizardData.status : 1;
    const opdAppointmentId = transferPreview?.appointmentUid || transferPreview?.opdAppointmentId || ipdWizardData.opdAppointmentId;

    // Create the API payload with all required fields
    const apiPayload = {
      admissionDate,
      admissionTime: admissionTime24,
      statusId,
      wardTypeId,
      wardId: Number(wardId) || 0,
      roomId: Number(roomId) || 0,
      bedId: Number(bedId) || 0,
      insuranceId: Number(ipdWizardData.insuranceId) || 0,
      surgeryReq,
      ...(statusId === 2 && { dischargeDate: ipdWizardData.dischargeDate || getCurrentDate() }),
      symptomIds: symptomIds.length > 0 ? symptomIds : [0],
      reasonForAdmission: ipdWizardData.reasonForAdmission || "Admission for treatment",
      patientId,
      doctorId,
      opdAppointmentId: opdAppointmentId || "",
      specializationId,
    };

    if (selectedPatient && selectedPatient.id) {
      const admissionId = selectedPatient.id;
      await editIPDAdmission(admissionId, apiPayload);
      toast.success("IPD admission updated successfully");
    } else {
      await addIPDAdmission(apiPayload);
      toast.success("Patient transferred to IPD successfully");
    }

    setIpdWizardStep(1);
    setIpdWizardData({});
    setSelectedWardName("");
    setSelectedRoomNumber("");
    setSelectedBedNumber("");
    setPatientIdInput("");
    setTransferPreview(null);
    setSelectedPatient(null);
    closeModal('ipdWizard');
    await fetchAllPatients();
    await new Promise(resolve => setTimeout(resolve, 100));
    navigate('/doctordashboard/patients');
  } catch (error) {
    console.error("Error in handleIpdWizardFinish:", error);
    const errorMsg = error.response?.data?.message || error.message || "Failed to process IPD admission";
    toast.error(errorMsg);
  } finally {
    setIsSubmitting(false);
  }
}, [
  isSubmitting,
  doctorId,
  ipdWizardData,
  selectedWardName,
  selectedRoomNumber,
  selectedBedNumber,
  wardData,
  transferPreview,
  selectedPatient,
  getCurrentDate,
  to24Hour,
  editIPDAdmission,
  addIPDAdmission,
  fetchAllPatients,
  closeModal,
  navigate
]);


    // Rendering
const renderWizardStep = useCallback(() => {
  console.log('Rendering step:', ipdWizardStep); // Add this for debugging
  
  switch(ipdWizardStep) {
    case 1:
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
      
    case 2:
      return (
        <IPDWard
          wardData={wardData}
          selectedWardName={selectedWardName}
          onSelectWard={handleWardSelection}
        />
      );
      
    case 3:
      return (
        <IPDRoom
          wardData={wardData}
          selectedWardName={selectedWardName}
          selectedRoomNumber={selectedRoomNumber}
          onSelectRoom={handleRoomSelection}
        />
      );
      
    case 4:
      return (
        <IPDBed
          wardData={wardData}
          selectedWardName={selectedWardName}
          selectedRoomNumber={selectedRoomNumber}
          selectedBedNumber={selectedBedNumber}
          onSelectBed={handleBedSelection}
          ipdPatients={ipdPatients}
          bedScrollIndex={bedScrollIndex}
          onScrollBeds={scrollBeds}
        />
      );
      
    case 5:
      const admissionFields = generateAdmissionFields(masterData || {}, STATIC_DATA);
      return (
        <IPDFinal
          data={ipdWizardData}
          wardData={wardData}
          selectedWardName={selectedWardName}
          selectedRoomNumber={selectedRoomNumber}
          selectedBedNumber={selectedBedNumber}
          fields={admissionFields}
          onChange={handleIpdWizardChange}
        />
      );
      
    default:
      return <div>Invalid step</div>;
  }
}, [
  ipdWizardStep, 
  ipdWizardData, 
  masterData, 
  availableCities, 
  isLoadingCities, 
  patientIdInput, 
  photoPreview, 
  transferPreview,
  wardData,
  selectedWardName,
  selectedRoomNumber,
  selectedBedNumber,
  ipdPatients,
  bedScrollIndex,
  scrollBeds,
  handleIpdWizardChange,
  handleIpdWizardNext,
  handleFetchPatientDetails,
  handleWardSelection,
  handleRoomSelection,
  handleBedSelection
]);

    // Table Columns
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
          {hasRecording(row.email, row.hospitalName || "AV Hospital") && (
            <button className="text-base p-1 text-green-600" title="View Recording">
              <FaVideo />
            </button>
          )}
         <button
                title="Quick Links"
                className="p-0.5 text-base text-[var(--primary-color)]"
                style={{ display: "flex", alignItems: "center" }}
                onClick={() => handleLink(row)}
              >
                <FiLink />
              </button>
          <button
            title="View Medical Record"
            onClick={() => handleSelected(row)}
            className="p-1 text-base text-[var(--primary-color)]"
            style={{ display: "flex", alignItems: "center" }}
          >
            <FiExternalLink />
          </button>
        </div>
      ),
    },
  ],
  [handleViewPatient, hasRecording, navigate]
);


    // Filters
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

    // Wizard Render
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
  onClick={(e) => {
    e.preventDefault();
    if (ipdWizardStep === 5) {
      handleIpdWizardFinish(); // Call finish handler on last step
    } else {
      handleIpdWizardNext(); // Call next handler for other steps
    }
  }}
  className="px-4 sm:px-6 py-2 bg-[#01B07A] text-white rounded-lg hover:bg-[#018A65] transition-all duration-200 text-xs sm:text-sm"
>
  {ipdWizardStep === 5 ? (selectedPatient ? "Update Admission" : "Save Admission") : "Next"}
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

    // Effects
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

    useEffect(() => {
      const path = routerLocation?.pathname || "";
      const state = routerLocation?.state || {};
      if (state?.transferFromOPD && state?.opdAppointmentId) {
        const appointmentId = typeof state.opdAppointmentId === 'object'
          ? state.opdAppointmentId.id || state.opdAppointmentId
          : state.opdAppointmentId;
        setPatientIdInput(String(appointmentId).trim());
        handleFetchPatientDetails(String(appointmentId).trim());
        setModals(prev => ({ ...prev, ipdWizard: true }));
      } else if (path.includes("/doctordashboard/patients/basic")) {
        setModals(prev => ({ ...prev, ipdWizard: true }));
        setIpdWizardStep(1);
      } else {
        setModals(prev => prev.ipdWizard ? { ...prev, ipdWizard: false } : prev);
      }
    }, [routerLocation, handleFetchPatientDetails]);

    // Tab Actions
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
      <button
        onClick={() => handleEditAdmission(selectedPatient?.id || ipdViewData?.id)}
        className="text-blue-600 hover:underline p-1"
        title="Edit Admission"
      >
        Edit
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
