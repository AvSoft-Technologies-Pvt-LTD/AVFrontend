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

    useEffect(() => {
      const path = routerLocation?.pathname || "";
      if (path.includes("/doctordashboard/patients/basic")) {
        setModals((prev) => ({ ...prev, ipdWizard: true }));
        setIpdWizardStep(1);
      } else {
        setModals((prev) =>
          prev.ipdWizard ? { ...prev, ipdWizard: false } : prev
        );
      }
    }, [routerLocation?.pathname]);

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

        // Backend currently does not return doctorName/doctorId with admissions,
        // so show all admissions in the table instead of filtering by doctor.
        const ipdPatientsData = allAdmissions.map((a, i) => ({
          ...a,
          sequentialId: a.id ?? a.admissionId ?? i + 1,
          name:
            a.patientName ||
            a.name ||
            [a.firstName, a.middleName, a.lastName].filter(Boolean).join(" "),
          ward: a.ward || a.wardName || "",
          diagnosis: a.symptomNames || a.diagnosis || "Under evaluation",
          admissionDate: a.admissionDate || "Not specified",
        }));

        setIpdPatients(ipdPatientsData);
      } catch (error) {
        console.error("Error fetching IPD admissions:", error);
        toast.error("Failed to fetch IPD admissions");
      } finally {
        setLoading(false);
      }
    }, []);

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
      }
    }, []);

    const handleFetchPatientDetails = useCallback(async () => {
      if (!patientIdInput.trim()) {
        toast.error("Please enter a Patient ID");
        return;
      }
      // NOTE: LocalStorage-based lookup removed. Wire this to a real OPD patient API when available.
      toast.error("OPD transfer lookup is not connected to backend yet.");
    }, [patientIdInput]);

    const handleViewPatient = useCallback(
      (patient) => {
        setSelectedPatient(patient);
        openModal("viewPatient");
        const patientId = patient?.id || patient?.patientId;
        if (!patientId) toast.error("Unable to load patient details: Missing patient ID");
        // Prepare flattened data for ReusableModal
        const view = {
          name: patient?.name || [patient?.firstName, patient?.middleName, patient?.lastName].filter(Boolean).join(" ") || "-",
          sequentialId: patient?.sequentialId || patient?.admissionId || "-",
          email: patient?.email || patient?.patientEmail || "-",
          phone: patient?.phone || patient?.phoneNumber || patient?.mobileNo || "-",
          gender: patient?.gender || patient?.sex || "-",
          bloodGroup: patient?.bloodGroup || patient?.bloodType || "-",
          dob: patient?.dob || "-",
          admissionDate: patient?.admissionDate || "-",
          status: patient?.status || "-",
          department: patient?.department || "-",
          wardType: patient?.wardType || "-",
          wardNo: patient?.wardNo || patient?.wardNumber || "-",
          roomNo: patient?.roomNo || patient?.roomNumber || "-",
          bedNo: patient?.bedNo || patient?.bedNumber || "-",
          ward: patient?.ward || "-",
          insuranceType: patient?.insuranceType || "-",
          dischargeDate: typeof patient?.dischargeDate === "number" ? "-" : (patient?.dischargeDate || "-"),
          diagnosis: patient?.diagnosis || "-",
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

    const handleIpdWizardNext = useCallback(async () => {
      if (ipdWizardStep === 1) {
        // Step 1 now only validates / normalizes data in-memory and moves to ward selection.
        const fullName = `${ipdWizardData.firstName || ""} ${
          ipdWizardData.middleName || ""
        } ${ipdWizardData.lastName || ""}`
          .replace(/\s+/g, " ")
          .trim();
        setIpdWizardData((prev) => ({
          ...prev,
          name: fullName,
        }));
        setIpdWizardStep(2);
    } else if (ipdWizardStep === 2) {
  if (!selectedWard) {
    toast.error("Please select a ward");
    return;
  }
  const rawType = (selectedWard?.type || "").toString();
  const m = rawType.match(/^(.+?)\s+(\d+)\s*$/);
  const parsedType = m ? m[1] : selectedWard?.type || "";
  const parsedNum  = m ? m[2] : (selectedWard?.number ?? selectedWard?.wardNumber ?? "");

  setIpdWizardData((prev) => ({
    ...prev,
    wardType: parsedType,
    wardNumber: parsedNum,
    department: selectedWard?.department,
  }));
  setIpdWizardStep(3);

      } else if (ipdWizardStep === 3) {
        if (!selectedRoom) {
          toast.error("Please select a room");
          return;
        }
        setIpdWizardStep(4);
      } else if (ipdWizardStep === 4) {
        if (!selectedBed) {
          toast.error("Please select a bed");
          return;
        }
        setIpdWizardData((prev) => ({
          ...prev,
          bedNumber: selectedBed.toString(),
          admissionDate: getCurrentDate(),
          admissionTime: incrementTime(prev.admissionTime),
        }));
        setIpdWizardStep(5);
      }
    }, [
      ipdWizardStep,
      ipdWizardData,
      patientIdInput,
      selectedWard,
      selectedRoom,
      selectedBed,
      doctorName,
    ]);

    const handleIpdWizardFinish = useCallback(async () => {
      try {
        // TODO: Replace hardcoded patientId with real patient id from backend
        const patientId = 1;

        const wardId = selectedWard?.id ?? null;
        const wardTypeId = selectedWard?.wardTypeId ?? 0;

        const roomId = ipdWizardData.roomId || ipdWizardData.roomNo || ipdWizardData.roomNumber;
        const bedId = ipdWizardData.bedId || ipdWizardData.bedNo || ipdWizardData.bedNumber;

        // Backend: 1 = Admitted, 2 = Discharged
        const statusId = ipdWizardData.status
          ? parseInt(ipdWizardData.status, 10)
          : 1; // default Admitted

        const departmentId = ipdWizardData.department
          ? parseInt(ipdWizardData.department, 10)
          : undefined;
        const insuranceId = ipdWizardData.insuranceType
          ? parseInt(ipdWizardData.insuranceType, 10)
          : undefined;

        const symptomId = ipdWizardData.symptoms
          ? parseInt(ipdWizardData.symptoms, 10)
          : undefined;
        const symptomIds = symptomId && !Number.isNaN(symptomId) ? [symptomId] : [];

        const surgeryReq =
          ipdWizardData.surgeryRequired === true ||
          ipdWizardData.surgeryRequired === "Yes";

        const admissionDate = ipdWizardData.admissionDate || getCurrentDate();
        const dischargeDate = ipdWizardData.dischargeDate || admissionDate;
        const admissionTime24 = to24Hour(ipdWizardData.admissionTime);

        const apiPayload = {
          admissionDate,
          admissionTime: admissionTime24,
          statusId, // numeric status id expected by backend
          wardTypeId: wardTypeId,
          wardId: wardId || 0,
          roomId: roomId ? parseInt(roomId, 10) : 0,
          bedId: bedId ? parseInt(bedId, 10) : 0,
          departmentId: departmentId || 0,
          insuranceId: insuranceId || 0,
          surgeryReq,
          dischargeDate,
          symptomIds,
          reasonForAdmission: ipdWizardData.reasonForAdmission || "",
          patientId,
        };

        try {
          const res = await addIPDAdmission(apiPayload);
          console.log("[IPD] addIPDAdmission response", res?.status, res?.data);
        } catch (apiError) {
          console.error("Error calling addIPDAdmission:", apiError);
          const msg = apiError?.response?.data?.message || apiError?.message;
          toast.error(msg || "Failed to submit IPD admission");
          return;
        }

        const payload = {
          ...ipdWizardData,
          name: `${ipdWizardData.firstName || ""} ${ipdWizardData.middleName || ""} ${ipdWizardData.lastName || ""}`.trim(),
          admissionTime: admissionTime24,
          // For local tables / UI we still store a readable status string
          status: statusId === 2 ? "Discharged" : "Admitted",
          wardNo: ipdWizardData.wardNumber,
          roomNo: ipdWizardData.roomNumber || ipdWizardData.roomNo,
          bedNo: ipdWizardData.bedNumber,

          type: "ipd",
          doctorName,
          updatedAt: new Date().toISOString(),
        };
        try {
          const savedData = localStorage.getItem("bedMasterData");
          if (savedData) {
            const bedMasterData = JSON.parse(savedData);
            const updatedData = (Array.isArray(bedMasterData) ? bedMasterData : []).map((item) => {
              if (
                item.ward === selectedWard?.type &&
                item.department === selectedWard?.department
              ) {
                return {
                  ...item,
                  occupied: (item.occupied || 0) + 1,
                  available: Math.max(0, (item.available || 0) - 1),
                };
              }
              return item;
            });
            try {
              localStorage.setItem("bedMasterData", JSON.stringify(updatedData));
              window.dispatchEvent(new StorageEvent("storage", {
                key: "bedMasterData",
                newValue: JSON.stringify(updatedData),
                url: window.location.href,
              }));
            } catch (err) {
              console.warn("Could not persist bedMasterData to localStorage");
            }
          }
        } catch (err) {
          console.warn("Error updating bed master data:", err);
        }
        toast.success("IPD admission completed successfully!");
        closeModal("ipdWizard");
        fetchAllPatients();
      } catch (error) {
        console.error("Error finalizing IPD admission:", error);
        toast.error("Failed to finalize IPD admission");
      }
    }, [
      ipdWizardData,
      newPatientId,
      selectedWard,
      doctorName,
      closeModal,
      fetchAllPatients,
    ]);

  const handleWardSelection = useCallback((ward) => {
  // Derive number from names like "ICU 1"
  const rawType = (ward?.type || "").toString();
  const m = rawType.match(/^(.+?)\s+(\d+)\s*$/);
  const parsedType = m ? m[1] : ward?.type || "";
  const parsedNum  = m ? m[2] : (ward?.number ?? ward?.wardNumber ?? "");

  setSelectedWard(ward);
  setIpdWizardData((prev) => ({
    ...prev,
    wardType: parsedType,
    wardNumber: parsedNum,
    department: ward?.department,
  }));
  setIpdWizardStep(3);
}, []);

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
        { header: "Diagnosis", accessor: "diagnosis" },
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
                  let age = "";
                  if (row.dob) {
                    const dobDate = new Date(row.dob);
                    const today = new Date();
                    age = today.getFullYear() - dobDate.getFullYear();
                    const m = today.getMonth() - dobDate.getMonth();
                    if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) age--;
                  }
                  navigate("/doctordashboard/medical-record", {
                    state: {
                      patientName: row.name,
                      email: row.email || "",
                      phone: row.phone || "",
                      gender: row.gender || row.sex || "",
                      temporaryAddress:
                        row.temporaryAddress || row.addressTemp || row.address || "",
                      address: row.address || row.temporaryAddress || row.addressTemp || "",
                      addressTemp: row.addressTemp || row.temporaryAddress || row.address || "",
                      dob: row.dob || "",
                      age: age,
                      bloodType: row.bloodGroup || row.bloodType || "",
                      regNo: row.regNo || "2025/072/0032722",
                      mobileNo: row.mobileNo || row.phone || "",
                      department: row.department || "Ophthalmology",
                      wardType: row.wardType,
                      wardNo: row.wardNo,
                      bedNo: row.bedNo,
                    },
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
          />
        );
      }
      if (ipdWizardStep === 2)
        return (
          <IPDWard
            wardData={wardData}
            selectedWard={selectedWard}
            onSelectWard={handleWardSelection}
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
      handleWardSelection,
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
                onClick={ipdWizardStep === 1 ? () => closeModal("ipdWizard") : () => setIpdWizardStep((s) => Math.max(1, s - 1))}
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