import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { FaNotesMedical, FaVideo } from "react-icons/fa";
import { FiExternalLink } from "react-icons/fi";
import DynamicTable from "../../../../../components/microcomponents/DynamicTable";
import TeleConsultFlow from "../../../../../components/microcomponents/Call";
import {
  getFamilyMembersByPatient,
  getPersonalHealthByPatientId,
  getSpecializationsWardsSummaryForIpdAdmission,
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

const API = {
  FORM: "https://681f2dfb72e59f922ef5774c.mockapi.io/addpatient",
  VITAL_SIGNS: "https://6808fb0f942707d722e09f1d.mockapi.io/health-summary",
};

const STATIC_DATA = {
  insurance: ["None", "CGHS", "ESIC", "Private Insurance", "Other"].map(
    (v, i) => ({ value: v, label: v, key: `insurance-${i}` })
  ),
  status: ["Admitted", "Discharged"].map((v, i) => ({
    value: v,
    label: v,
    key: `status-${i}`,
  })),
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

const PatientViewSections = ({
  data = {},
  personalHealthDetails,
  familyHistory,
  vitalSigns,
  loading,
}) => {
  const sections = useMemo(
    () => [
      {
        title: "Basic Information",
        data: {
          Name: data.name || "-",
          Email: data.email || "-",
          Phone: data.phone || "-",
          Gender: data.gender || "-",
          "Blood Group": data.bloodGroup || "-",
          DOB: data.dob || "-",
        },
      },
      {
        title: "IPD Admission Details",
        data: {
          "Admission Date": data.admissionDate || "-",
          Status: data.status || "-",
          Ward: data.ward || "-",
          "Ward Type": data.wardType || "-",
          "Ward Number": data.wardNo || "-",
          "Room Number": data.roomNumber || data.roomNo || "N/A",
          "Bed Number": data.bedNo || "-",
          Department: data.department || "-",
          "Insurance Type": data.insuranceType || "-",
          "Discharge Date": data.dischargeDate || "Not discharged",
          Diagnosis: data.diagnosis || "-",
        },
      },
      {
        title: "Personal Health Details",
        data: personalHealthDetails
          ? {
              Height: `${personalHealthDetails.height || "N/A"} cm`,
              Weight: `${personalHealthDetails.weight || "N/A"} kg`,
              "Blood Group":
                personalHealthDetails.bloodGroupName ||
                personalHealthDetails.bloodGroup ||
                "N/A",
              Allergies: personalHealthDetails.allergies || "None",
              Surgeries: personalHealthDetails.surgeries || "None",
              Smoking: personalHealthDetails.isSmoker ? "Yes" : "No",
              "Years Smoking": personalHealthDetails.isSmoker
                ? personalHealthDetails.yearsSmoking || "Not specified"
                : "N/A",
              Alcohol: personalHealthDetails.isAlcoholic ? "Yes" : "No",
              "Years Alcohol": personalHealthDetails.isAlcoholic
                ? personalHealthDetails.yearsAlcoholic || "Not specified"
                : "N/A",
              Tobacco: personalHealthDetails.isTobacco ? "Yes" : "No",
              "Years Tobacco": personalHealthDetails.isTobacco
                ? personalHealthDetails.yearsTobacco || "Not specified"
                : "N/A",
            }
          : null,
      },
      { title: "Family History", isArray: true, data: familyHistory || [] },
      {
        title: "Vital Signs",
        data: vitalSigns
          ? {
              "Blood Pressure": vitalSigns.bloodPressure || "-",
              "Heart Rate": vitalSigns.heartRate || "-",
              Temperature: vitalSigns.temperature || "-",
              "Blood Sugar": vitalSigns.bloodSugar || "-",
              "Oxygen Saturation": vitalSigns.oxygenSaturation || "-",
              "Respiratory Rate": vitalSigns.respiratoryRate || "-",
            }
          : null,
      },
    ],
    [data, personalHealthDetails, familyHistory, vitalSigns]
  );

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <div key={section.title} className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">{section.title}</h3>
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-600">Loading...</span>
            </div>
          ) : section.isArray ? (
            section.data?.length > 0 ? (
              section.data.map((member, i) => (
                <div key={i} className="p-2 bg-gray-50 rounded text-sm mb-2">
                  <p>
                    <strong>{member.memberName || member.name}</strong> (
                    {member.relationName || member.relation})
                  </p>
                  <p>
                    <strong>Phone:</strong>{" "}
                    {member.phoneNumber || member.phone || "Not provided"}
                  </p>
                  <p>
                    <strong>Health Conditions:</strong>{" "}
                    {member.healthConditions?.length > 0
                      ? member.healthConditions
                          .map(
                            (condition) =>
                              condition.healthConditionName || condition.name
                          )
                          .join(", ")
                      : "None reported"}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No data available</p>
            )
          ) : section.data ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              {Object.entries(section.data).map(([key, value]) => (
                <p key={key}>
                  <strong>{key}:</strong> {value ?? "N/A"}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No data available</p>
          )}
        </div>
      ))}
    </div>
  );
};

const PatientViewModal = ({
  isOpen,
  onClose,
  patient,
  personalHealthDetails,
  familyHistory,
  vitalSigns,
  loading,
  onEdit,
}) => {
  if (!isOpen) return null;
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-2 sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="flex flex-col relative w-full max-w-4xl max-h-[95vh] rounded-xl bg-white shadow-xl overflow-hidden"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="sticky top-0 z-20 bg-gradient-to-r from-[#01B07A] to-[#1A223F] rounded-t-xl p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="relative mr-3 sm:mr-4 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-white text-[#01B07A] text-lg sm:text-xl font-bold uppercase shadow-inner">
                {(patient?.name || "NA").substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-white">
                  {patient?.name || "-"}
                </h2>
                <p className="text-white text-sm sm:text-lg">
                  IPD #{patient?.sequentialId || "-"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white text-white hover:bg-white hover:text-[#01B07A] transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-3 sm:p-6 bg-gray-50">
          <PatientViewSections
            data={patient || {}}
            personalHealthDetails={personalHealthDetails}
            familyHistory={familyHistory}
            vitalSigns={vitalSigns}
            loading={loading}
          />
        </div>
        <div className="bg-white border-t p-3 sm:p-4 flex justify-end">
          <button
            onClick={() => onEdit && onEdit(patient)}
            className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
          >
            Edit Patient
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
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
    const [ipdPatients, setIpdPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newPatientId, setNewPatientId] = useState(null);
    const [selectedPatient, setSelectedPatient] = useState(null);
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
    const [personalHealthDetails, setPersonalHealthDetails] = useState(null);
    const [familyHistory, setFamilyHistory] = useState([]);
    const [vitalSigns, setVitalSigns] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
    const [availableCities, setAvailableCities] = useState([]);
    const [isLoadingCities, setIsLoadingCities] = useState(false);
    const [wardData, setWardData] = useState([]);
    const [bedFacilities, setBedFacilities] = useState({});

    useImperativeHandle(ref, () => ({
      openAddPatientModal: () => {
        openModal("ipdWizard");
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
      } catch (err) {
        console.error("[DEBUG] Error loading ward data:", err);
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
        const res = await fetch(API.FORM);
        const allPatients = await res.json();
        const processedPatients = (Array.isArray(allPatients) ? allPatients : [])
          .map((p) => ({
            ...p,
            name:
              p.name ||
              [p.firstName, p.middleName, p.lastName]
                .filter(Boolean)
                .join(" "),
            fullName: [p.firstName, p.middleName, p.lastName]
              .filter(Boolean)
              .join(" "),
          }))
          .reverse();
        const ipdPatientsData = processedPatients
          .filter(
            (p) =>
              (p.type && p.type.toLowerCase() === "ipd") && p.doctorName === doctorName
          )
          .map((p, i) => ({
            ...p,
            sequentialId: i + 1,
            wardNo: p.wardNumber || p.wardNo,
            roomNo: p.roomNumber || p.roomNo,
            bedNo: p.bedNumber || p.bedNo,
            ward: `${p.wardType || "N/A"}-${p.wardNumber || p.wardNo || "N/A"}${p.roomNumber || p.roomNo ? `-${p.roomNumber || p.roomNo}` : ""}-${p.bedNumber || p.bedNo || "N/A"}`,
            temporaryAddress:
              p.temporaryAddress || p.addressTemp || p.address || "",
            address: p.address || p.temporaryAddress || p.addressTemp || "",
            addressTemp:
              p.addressTemp || p.temporaryAddress || p.address || "",
            status: p.status || "Admitted",
            diagnosis: p.diagnosis || "Under evaluation",
            admissionDate: p.admissionDate || "Not specified",
            department: p.department || "General Medicine",
          }));
        setIpdPatients(ipdPatientsData);
        try {
          localStorage.setItem("ipdPatients", JSON.stringify(ipdPatientsData));
        } catch (e) {
        }
      } catch (error) {
        console.error("Error fetching patients:", error);
        toast.error("Failed to fetch patients");
      } finally {
        setLoading(false);
      }
    }, [doctorName]);

    const fetchPatientDetails = useCallback(
      async (patientId) => {
        if (!patientId) return;
        setDetailsLoading(true);
        try {
          const [personalRes, familyRes, vitalRes] = await Promise.all([
            getPersonalHealthByPatientId(patientId).catch(() => ({ data: null })),
            getFamilyMembersByPatient(patientId).catch(() => ({ data: [] })),
            fetch(API.VITAL_SIGNS)
              .then((res) => res.json())
              .then((data) => ({ data }))
              .catch(() => ({ data: [] })),
          ]);
          setPersonalHealthDetails(personalRes?.data ?? null);
          setFamilyHistory(Array.isArray(familyRes?.data) ? familyRes.data : []);
          const patientEmail = (selectedPatient?.email || "").toLowerCase().trim();
          if (patientEmail && Array.isArray(vitalRes?.data)) {
            const matchingVitalSigns = vitalRes.data.find(
              (v) => (v.email || "").toLowerCase().trim() === patientEmail
            );
            setVitalSigns(matchingVitalSigns || null);
          } else {
            setVitalSigns(null);
          }
          toast.success("Patient details loaded successfully!");
        } catch (error) {
          console.error("Error fetching patient details:", error);
          toast.error("Failed to fetch some patient details");
          setPersonalHealthDetails(null);
          setFamilyHistory([]);
          setVitalSigns(null);
        } finally {
          setDetailsLoading(false);
        }
      },
      [selectedPatient]
    );

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
        setPersonalHealthDetails(null);
        setFamilyHistory([]);
        setVitalSigns(null);
        setDetailsLoading(false);
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
      try {
        const response = await fetch(API.FORM);
        const data = await response.json();
        const found = (Array.isArray(data) ? data : [])
          .filter((p) => !p.type || p.type.toLowerCase() === "opd")
          .find((p) => (p.id || "").toString() === patientIdInput.trim());
        if (found) {
          const nameParts = (found.name || "").split(" ");
          const firstName = found.firstName || nameParts[0] || "";
          const middleName = found.middleName || nameParts[1] || "";
          const lastName = found.lastName || nameParts[nameParts.length - 1] || "";
          setIpdWizardData((prev) => ({
            ...prev,
            ...found,
            firstName,
            middleName,
            lastName,
            name: found.name || `${firstName} ${middleName} ${lastName}`.trim(),
            permanentAddress: found.permanentAddress || found.addressPerm || "",
            temporaryAddress: found.temporaryAddress || found.addressTemp || "",
            admissionDate: getCurrentDate(),
            admissionTime: getCurrentTime(),
          }));
          toast.success("OPD Patient details loaded for IPD transfer!");
        } else {
          toast.info(
            "No OPD patient found with this ID. Only OPD patients can be transferred to IPD."
          );
        }
      } catch (error) {
        console.error("Error fetching patient:", error);
        toast.error("Failed to fetch patient");
      }
    }, [patientIdInput]);

    const handleViewPatient = useCallback(
      (patient) => {
        setSelectedPatient(patient);
        openModal("viewPatient");
        const patientId = patient?.id || patient?.patientId;
        if (patientId) fetchPatientDetails(patientId);
        else toast.error("Unable to load patient details: Missing patient ID");
      },
      [openModal, fetchPatientDetails]
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
        try {
          const isExistingPatient = ipdWizardData?.id && patientIdInput.trim();
          const payload = {
            firstName: ipdWizardData.firstName,
            middleName: ipdWizardData.middleName,
            lastName: ipdWizardData.lastName,
            phone: ipdWizardData.phone,
            email: ipdWizardData.email,
            aadhaar: ipdWizardData.aadhaar,
            gender: ipdWizardData.gender,
            dob: ipdWizardData.dob,
            occupation: ipdWizardData.occupation,
            pincode: ipdWizardData.pincode,
            city: ipdWizardData.city,
            district: ipdWizardData.district,
            state: ipdWizardData.state,
            permanentAddress: ipdWizardData.permanentAddress,
            temporaryAddress: ipdWizardData.temporaryAddress,
            photo: ipdWizardData.photo,
            password: ipdWizardData.password,
            name: `${ipdWizardData.firstName || ""} ${ipdWizardData.middleName || ""} ${ipdWizardData.lastName || ""}`.trim(),
            type: "ipd",
            doctorName,
            updatedAt: new Date().toISOString(),
          };
          let response;
          if (isExistingPatient) {
            response = await fetch(`${API.FORM}/${ipdWizardData.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
            if (!response.ok) throw new Error("Failed to update patient");
            setNewPatientId(ipdWizardData.id);
            toast.success("Existing OPD patient converted to IPD!");
          } else {
            payload.createdAt = new Date().toISOString();
            response = await fetch(API.FORM, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
            if (!response.ok) throw new Error("Failed to create patient");
            const responseData = await response.json();
            setNewPatientId(responseData.id);
            toast.success("New IPD patient created!");
          }
          setIpdWizardStep(2);
        } catch (error) {
          console.error("Error saving patient:", error);
          toast.error("Failed to save patient details");
        }
      } else if (ipdWizardStep === 2) {
        if (!selectedWard) {
          toast.error("Please select a ward");
          return;
        }
        setIpdWizardData((prev) => ({
          ...prev,
          wardType: selectedWard.type,
          wardNumber: selectedWard.number,
          department: selectedWard.department,
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
        const payload = {
          ...ipdWizardData,
          name: `${ipdWizardData.firstName || ""} ${ipdWizardData.middleName || ""} ${ipdWizardData.lastName || ""}`.trim(),
          admissionTime: to24Hour(ipdWizardData.admissionTime),
          wardNo: ipdWizardData.wardNumber,
          roomNo: ipdWizardData.roomNumber || ipdWizardData.roomNo,
          bedNo: ipdWizardData.bedNumber,
          type: "ipd",
          doctorName,
          updatedAt: new Date().toISOString(),
        };
        if (!newPatientId) {
          toast.error("Missing patient ID. Please restart admission.");
          return;
        }
        const response = await fetch(`${API.FORM}/${newPatientId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error("Failed to finalize IPD admission");
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
      setSelectedWard(ward);
      setIpdWizardData((prev) => ({
        ...prev,
        wardType: ward?.type,
        wardNumber: ward?.number,
        department: ward?.department,
      }));
      setIpdWizardStep(3);
    }, []);

    const handleRoomSelection = useCallback((roomNumber) => {
      setSelectedRoom(roomNumber);
      setIpdWizardData((prev) => ({
        ...prev,
        roomNumber: roomNumber != null ? roomNumber.toString() : prev.roomNumber,
      }));
    }, []);

    const handleBedSelection = useCallback(
      (bedNumber) => {
        if (!selectedWard) return;
        const wardFormat = `${selectedWard.type}-${selectedWard.number}-${bedNumber}`;
        const isOccupied = ipdPatients.some(
          (patient) =>
            patient.status === "Admitted" && (patient.ward || "").toString() === wardFormat
        );
        if (isOccupied) {
          toast.error("This bed is currently occupied by another patient");
          return;
        }
        const isUnderMaintenance = Math.random() < 0.05;
        if (isUnderMaintenance) {
          toast.error("This bed is under maintenance");
          return;
        }
        setSelectedBed(bedNumber);
        setIpdWizardData((prev) => ({
          ...prev,
          bedNumber: bedNumber.toString(),
          admissionDate: getCurrentDate(),
          admissionTime: incrementTime(prev.admissionTime),
        }));
      },
      [selectedWard, ipdPatients]
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
        { header: "ID", accessor: "sequentialId" },
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
            <div className="flex items-center gap-2">
              <button onClick={() => handleAddRecord(row)} className="text-base p-1">
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
              </div>
              {hasRecording(row.email, row.hospitalName || "AV Hospital") && (
                <button className="text-base p-1 text-green-600" title="View Recording">
                  <FaVideo />
                </button>
              )}
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
                className="p-1 text-base text-[var(--primary-color)]"
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-1 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="flex flex-col relative w-full max-w-6xl h-[95vh] sm:h-[90vh] rounded-xl bg-white shadow-xl overflow-hidden"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex-shrink-0 bg-gradient-to-r from-[#01B07A] to-[#004f3d] rounded-t-xl px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
              <h2 className="text-sm sm:text-lg font-bold text-white">IPD Patient Admission</h2>
              <button
                onClick={() => closeModal("ipdWizard")}
                className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full border border-white text-white hover:bg-white hover:text-[#01B07A] transition-all duration-200"
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
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

    return (
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
        <PatientViewModal
          isOpen={modals.viewPatient}
          onClose={() => closeModal("viewPatient")}
          patient={selectedPatient}
          personalHealthDetails={personalHealthDetails}
          familyHistory={familyHistory}
          vitalSigns={vitalSigns}
          loading={detailsLoading}
          onEdit={handleEditPatient}
        />
        {modals.ipdWizard && renderIpdWizardContent()}
      </>
    );
  }
);

IPDTab.displayName = "IPDTab";
export default IPDTab;
