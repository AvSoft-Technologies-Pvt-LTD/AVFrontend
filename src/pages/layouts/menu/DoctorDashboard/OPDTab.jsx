import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { FaNotesMedical, FaUpload } from "react-icons/fa";
import { FiExternalLink } from "react-icons/fi";
import DynamicTable from "../../../../components/microcomponents/DynamicTable";
import ReusableModal from "../../../../components/microcomponents/Modal";
import TeleConsultFlow from "../../../../components/microcomponents/Call";
import { getFamilyMembersByPatient, getPersonalHealthByPatientId } from "../../../../utils/CrudService";
import { useDispatch, useSelector } from "react-redux";
import { registerUser} from "../../../../context-api/authSlice";
import {  getPatientById, updatePatient,getGenders  } from "../../../../utils/masterService";
import axiosInstance from "../../../../utils/axiosInstance";
const getCurrentDate = () => new Date().toISOString().slice(0, 10);
const getCurrentTime = () => new Date().toTimeString().slice(0, 5);

const PatientViewSections = ({ data, personalHealthDetails, familyHistory, vitalSigns, loading }) => (
  <div className="space-y-4">
    {[
      {
        title: "Basic Information",
        data: {
          Name: data.name,
          Email: data.email,
          Phone: data.phone,
          Gender: data.gender,
          "Blood Group": data.bloodGroup,
          DOB: data.dob,
        },
      },
      {
        title: "Personal Health Details",
        data: personalHealthDetails
          ? {
              Height: `${personalHealthDetails.height || "N/A"} cm`,
              Weight: `${personalHealthDetails.weight || "N/A"} kg`,
              "Blood Group": personalHealthDetails.bloodGroupName || personalHealthDetails.bloodGroup || "N/A",
              Allergies: personalHealthDetails.allergies || "None",
              Surgeries: personalHealthDetails.surgeries || "None",
              Smoking: personalHealthDetails.isSmoker ? "Yes" : "No",
              "Years Smoking": personalHealthDetails.isSmoker ? personalHealthDetails.yearsSmoking || "Not specified" : "N/A",
              Alcohol: personalHealthDetails.isAlcoholic ? "Yes" : "No",
              "Years Alcohol": personalHealthDetails.isAlcoholic ? personalHealthDetails.yearsAlcoholic || "Not specified" : "N/A",
              Tobacco: personalHealthDetails.isTobacco ? "Yes" : "No",
              "Years Tobacco": personalHealthDetails.isTobacco ? personalHealthDetails.yearsTobacco || "Not specified" : "N/A",
            }
          : null,
      },
      {
        title: "Family History",
        isArray: true,
        data: familyHistory,
      },
      {
        title: "Vital Signs",
        data: vitalSigns
          ? {
              "Blood Pressure": vitalSigns.bloodPressure,
              "Heart Rate": vitalSigns.heartRate,
              Temperature: vitalSigns.temperature,
              "Blood Sugar": vitalSigns.bloodSugar,
              "Oxygen Saturation": vitalSigns.oxygenSaturation,
              "Respiratory Rate": vitalSigns.respiratoryRate,
            }
          : null,
      },
    ].map((section) => (
      <div key={section.title} className="border rounded-lg p-4">
        <h3 className="font-semibold mb-2">{section.title}</h3>
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">Loading...</span>
          </div>
        ) : section.isArray ? (
          section.data?.length > 0 ? (
            section.data.map((member) => (
              <div key={`${member.memberName || member.name}-${member.relationName || member.relation}`} className="p-2 bg-gray-50 rounded text-sm mb-2">
                <p><strong>{member.memberName || member.name}</strong> ({member.relationName || member.relation})</p>
                <p><strong>Phone:</strong> {member.phoneNumber || member.phone || "Not provided"}</p>
                <p><strong>Health Conditions:</strong> {member.healthConditions?.length > 0 ? member.healthConditions.map((c) => c.healthConditionName || c.name).join(", ") : "None reported"}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No data available</p>
          )
        ) : section.data ? (
          <div className="grid grid-cols-2 gap-2 text-sm">
            {Object.entries(section.data).map(([key, value]) => (
              <p key={`${section.title}-${key}`}><strong>{key}:</strong> {value || "N/A"}</p>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No data available</p>
        )}
      </div>
    ))}
  </div>
);

const PatientViewModal = ({ isOpen, onClose, patient, personalHealthDetails, familyHistory, vitalSigns, loading, onEdit }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };
  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to upload.");
      return;
    }
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("patientId", patient.id);
    try {
      const response = await axiosInstance.post("/upload", formData);
      if (!response.data.success) throw new Error("Failed to upload file.");
      toast.success("File uploaded successfully!");
      setSelectedFile(null);
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file.");
    }
  };
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
        <div className="sticky top-0 z-20 bg-gradient-to-r from-[#01B07A] to-[#1A223F] rounded-t-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="relative mr-4 flex h-16 w-16 items-center justify-center rounded-full bg-white text-[#01B07A] text-xl font-bold uppercase shadow-inner">
                {(patient?.name || "NA").substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">{patient?.name || "-"}</h2>
                <p className="text-white text-lg">OPD #{patient?.sequentialId || "-"}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white text-white hover:bg-white hover:text-[#01B07A] transition-all duration-200"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          <PatientViewSections
            data={patient || {}}
            personalHealthDetails={personalHealthDetails}
            familyHistory={familyHistory}
            vitalSigns={vitalSigns}
            loading={loading}
          />
          <div className="mt-4 p-4 border rounded-lg bg-white">
            <h4 className="font-semibold mb-2">Upload Documents</h4>
            <div className="flex items-center gap-2">
              <input
                type="file"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              <button
                onClick={handleUpload}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
              >
                <FaUpload /> Upload
              </button>
            </div>
          </div>
        </div>
        <div className="bg-white border-t p-4 flex justify-end">
          <button
            onClick={() => onEdit(patient)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Edit Patient
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const OpdTab = forwardRef(
  (
    {
      doctorName,
      masterData,
      location,
      setTabActions,
      tabActions = [],
      tabs = [],
      activeTab,
      onTabChange,
    },
    ref
  ) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState({});
    const [newPatientId, setNewPatientId] = useState(null);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [modals, setModals] = useState({ addPatient: false, appointment: false, viewPatient: false, editPatient: false });
    const [formData, setFormData] = useState({ cityOptions: [] });
    const [appointmentFormData, setAppointmentFormData] = useState({ date: getCurrentDate(), time: getCurrentTime() });
    const [personalHealthDetails, setPersonalHealthDetails] = useState(null);
    const [familyHistory, setFamilyHistory] = useState([]);
    const [vitalSigns, setVitalSigns] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [genderOptions, setGenderOptions] = useState([]);

    // Fetch genders on component mount
   useEffect(() => {
  const fetchGenders = async () => {
    try {
      const response = await getGenders();
      const genders = response.data.map((gender) => ({
        value: gender.id,
        label: gender.name, // ✅ Updated to match API field
      }));
      setGenderOptions(genders);
    } catch (error) {
      console.error("Error fetching genders:", error);
      toast.error("Failed to fetch genders");
    }
  };

  fetchGenders();
}, []);
    useImperativeHandle(ref, () => ({
      openAddPatientModal: () => {
        openModal("addPatient");
      },
      openScheduleConsultationModal: () => {
        openModal("appointment");
      },
    }));

    const hasRecording = useCallback((patientEmail, hospitalName) => {
      const videoKeys = Object.keys(localStorage).filter((key) => key.startsWith("consultationVideo_"));
      return videoKeys.some((key) => {
        const metadataStr = localStorage.getItem(`${key}_metadata`);
        if (!metadataStr) return false;
        try {
          const metadata = JSON.parse(metadataStr);
          return metadata.patientEmail === patientEmail && metadata.hospitalName === hospitalName;
        } catch { return false; }
      });
    }, []);

    const fetchAllPatients = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get("/auth/patient");
        const allPatients = response.data;
        const processedPatients = allPatients
          .map((p) => ({
            ...p,
            name: p.name || [p.firstName, p.middleName, p.lastName].filter(Boolean).join(" "),
            fullName: [p.firstName, p.middleName, p.lastName].filter(Boolean).join(" "),
          }))
          .reverse();
        setPatients(
          processedPatients
            .filter((p) => (!p.type || p.type.toLowerCase() === "opd") && p.doctorName === doctorName)
            .map((p, i) => ({
              ...p,
              sequentialId: i + 1,
              datetime: p.appointmentDate && p.appointmentTime ? `${p.appointmentDate} ${p.appointmentTime}` : "Not scheduled",
              temporaryAddress: p.temporaryAddress || p.addressTemp || p.address || "",
              address: p.address || p.temporaryAddress || p.addressTemp || "",
              addressTemp: p.addressTemp || p.temporaryAddress || p.address || "",
              diagnosis: p.diagnosis || "Not specified",
              reason: p.reason || "General consultation",
            }))
        );
      } catch (error) {
        console.error("Error fetching patients:", error);
        toast.error("Failed to fetch patients");
      } finally {
        setLoading(false);
      }
    };

    const fetchPatientDetails = async (patientId) => {
      if (!patientId) return;
      setDetailsLoading(true);
      try {
        const [personalRes, familyRes, vitalRes] = await Promise.all([
          getPersonalHealthByPatientId(patientId).catch(() => ({ data: null })),
          getFamilyMembersByPatient(patientId).catch(() => ({ data: [] })),
          axiosInstance.get("/vital-signs").then((res) => res.data).catch(() => []),
        ]);
        setPersonalHealthDetails(personalRes.data || null);
        setFamilyHistory(Array.isArray(familyRes.data) ? familyRes.data : []);
        const patientEmail = selectedPatient?.email?.toLowerCase().trim();
        setVitalSigns(Array.isArray(vitalRes) ? vitalRes.find((v) => v.email?.toLowerCase().trim() === patientEmail) || null : null);
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
    };

    const openModal = (modalName) => {
      setModals((prev) => ({ ...prev, [modalName]: true }));
      if (modalName === "addPatient") {
        setFormData({
          cityOptions: [],
        });
      }
    };

    const closeModal = (modalName) => {
      setModals((prev) => ({ ...prev, [modalName]: false }));
      if (modalName === "addPatient") setFormData({ cityOptions: [] });
      if (modalName === "appointment") setAppointmentFormData({ date: getCurrentDate(), time: getCurrentTime() });
      if (modalName === "viewPatient" || modalName === "editPatient") {
        setSelectedPatient(null);
        setPersonalHealthDetails(null);
        setFamilyHistory([]);
        setVitalSigns(null);
        setDetailsLoading(false);
      }
    };

    const fetchAddressFromPincode = async (pincode) => {
      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        const data = await response.json();
        if (data[0].Status === "Success") {
          const postOffices = data[0].PostOffice;
          const cities = [...new Set(postOffices.map((office) => office.Name))];
          const cityOptions = cities.map((city) => ({ value: city, label: city }));
          const firstPostOffice = postOffices[0];
          return {
            city: firstPostOffice.Name,
            state: firstPostOffice.State,
            district: firstPostOffice.District,
            cityOptions,
          };
        } else {
          toast.error("Invalid PIN code");
          return { city: "", state: "", district: "", cityOptions: [] };
        }
      } catch (error) {
        console.error("Error fetching address:", error);
        toast.error("Failed to fetch address details");
        return { city: "", state: "", district: "", cityOptions: [] };
      }
    };

  const handleFormChange = async (data) => {
  // Clear errors for the field being edited
  const newErrors = { ...errors };
  Object.keys(data).forEach((key) => {
    if (newErrors[key]) delete newErrors[key];
  });
  setErrors(newErrors);

  // Rest of your existing logic
  if (data.sameAsPermAddress && data.addressPerm) {
    data.addressTemp = data.addressPerm;
  }
  if (data.pincode && data.pincode.length === 6) {
    const address = await fetchAddressFromPincode(data.pincode);
    data = {
      ...data,
      city: address.city,
      state: address.state,
      district: address.district,
      cityOptions: address.cityOptions,
    };
  } else if (!data.pincode || data.pincode.length !== 6) {
    data = {
      ...data,
      city: "",
      state: "",
      district: "",
      cityOptions: [],
    };
  }
  setFormData(data);
};


    const handleViewPatient = (patient) => {
      setSelectedPatient(patient);
      openModal("viewPatient");
      const patientId = patient.id || patient.patientId;
      if (patientId) fetchPatientDetails(patientId);
      else toast.error("Unable to load patient details: Missing patient ID");
    };

    const handleEditPatient = (patient) => {
      setSelectedPatient(patient);
      setFormData({
        ...patient,
        addressPerm: patient.permanentAddress || patient.addressPerm || "",
        addressTemp: patient.temporaryAddress || patient.addressTemp || "",
        cityOptions: patient.city ? [{ value: patient.city, label: patient.city }] : [],
      });
      closeModal("viewPatient");
      openModal("editPatient");
    };

   const handleUpdatePatient = async (formData) => {
  try {
    const payload = {
      ...formData,
      name: `${formData.firstName || ""} ${formData.middleName || ""} ${formData.lastName || ""}`.trim(),
      permanentAddress: formData.addressPerm,
      temporaryAddress: formData.addressTemp,
      updatedAt: new Date().toISOString(),
    };

    const response = await dispatch(updatePatient({ id: selectedPatient.id, data: payload }));
    if (response.error) {
      const errorMessage = response.payload;
      if (typeof errorMessage === "object") {
        Object.entries(errorMessage).forEach(([field, message]) => {
          toast.error(`${field}: ${message}`);
        });
      } else {
        toast.error(errorMessage || "Failed to update patient");
      }
      return;
    }

    toast.success("Patient updated successfully!");
    closeModal("editPatient");
    fetchAllPatients();
  } catch (error) {
    console.error("Error updating patient:", error);
    toast.error("Failed to update patient");
  }
};

const handleSavePatient = async (formData) => {
  try {
    const payload = new FormData();

    // Append all fields to FormData
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "dob" && Array.isArray(value)) {
        payload.append(key, value.join("-"));
      } else if (key === "photo" && value instanceof File) {
        payload.append(key, value);
      } else if (value !== undefined && value !== null) {
        payload.append(key, value);
      }
    });
    // Append genderId as a top-level field
    if (formData.gender?.value) {
      payload.append("genderId", formData.gender.value); // Send as genderId, not gender
    }

    // Append other required fields
    if (formData.pincode) {
      payload.append("pinCode", formData.pincode);
    }

    payload.append("userType", "patient");

    // Log FormData for debugging
    for (let [key, value] of payload.entries()) {
      console.log(key, value);
    }

    const response = await dispatch(registerUser(payload));
    if (response.error) {
      const errorMessage = response.payload;
      if (typeof errorMessage === "object") {
        Object.entries(errorMessage).forEach(([field, message]) => {
          toast.error(`${field}: ${message}`);
        });
      } else {
        toast.error(errorMessage || "Failed to save patient");
      }
      return;
    }

    setNewPatientId(response.payload.patientId);
    toast.success("Patient details saved!");
    closeModal("addPatient");
    openModal("appointment");
    toast.success("Please schedule appointment.");
    fetchAllPatients();
  } catch (error) {
    console.error("Error saving patient:", error);
    toast.error("Failed to save patient details");
  }
};
    const handleScheduleAppointment = async (formData) => {
      try {
        const payload = {
          ...formData,
          appointmentDate: formData.date,
          appointmentTime: formData.time,
          diagnosis: formData.diagnosis,
          reason: formData.reason,
          doctorName,
          type: "OPD",
          updatedAt: new Date().toISOString(),
        };
        const response = await axiosInstance.put(`/auth/patient/${newPatientId}`, payload);
        if (!response.data.success) throw new Error("Failed to schedule appointment");
        toast.success("Appointment scheduled successfully!");
        closeModal("appointment");
        fetchAllPatients();
      } catch (error) {
        console.error("Error scheduling appointment:", error);
        toast.error("Failed to schedule appointment.");
      }
    };

    const handleAddRecord = (patient) => navigate("/doctordashboard/form", { state: { patient } });

    const generatePatientBasicFields = () => [
      { name: "firstName", label: "First Name*", type: "text", required: true },
      { name: "middleName", label: "Middle Name*", type: "text" },
      { name: "lastName", label: "Last Name*", type: "text", required: true },
      { name: "phone", label: "Phone Number*", type: "text", required: true },
      { name: "aadhaar", label: "Aadhaar Number*", type: "text", required: true },
      { name: "email", label: "Email Address*", type: "email", required: true },
      { name: "gender", label: "Gender*", type: "select", required: true, options: genderOptions },
      { name: "dob", label: "Date of Birth*", type: "date", required: true },
      { name: "occupation", label: "Occupation*", type: "text", required: true },
      { name: "pincode", label: "PIN Code*", type: "text", required: true, placeholder: "Enter 6-digit PIN code" },
      { name: "city", label: "City/Locality*", type: "select", required: true, options: formData.cityOptions || [] },
      { name: "state", label: "State*", type: "text", required: true, disabled: true },
      { name: "district", label: "District*", type: "text", required: true, disabled: true },
      {
        name: "photo",
        label: "Upload Profile Image*",
        type: "file",
        accept: "image/*",
        required: false,
        colSpan: 1,
        description: "Upload a profile picture or medical image (JPEG, PNG, etc.)",
      },
      { name: "password", label: "Create Password*", type: "password", required: true },
      { name: "confirmPassword", label: "Confirm Password*", type: "password", required: true },
    ];

    const APPOINTMENT_FIELDS = [
      { name: "date", label: "Appointment Date", type: "date", required: true },
      { name: "time", label: "Appointment Time", type: "time", required: true },
      { name: "diagnosis", label: "Diagnosis", type: "text", required: true },
      { name: "reason", label: "Reason for Visit", type: "select", required: true, options: ["Consultation", "Follow-up", "Test", "Other"].map((r) => ({ value: r, label: r })) },
    ];

    const columns = [
      { header: "ID", accessor: "sequentialId" },
      {
        header: "Name",
        accessor: "name",
        clickable: true,
        cell: (row) => (
          <button className="cursor-pointer text-[var(--primary-color)] hover:text-[var(--accent-color)]" onClick={() => handleViewPatient(row)}>
            {row.name || `${row.firstName || ""} ${row.middleName || ""} ${row.lastName || ""}`.replace(/\s+/g, " ").trim()}
          </button>
        ),
      },
      { header: "Date", accessor: "appointmentDate" },
      { header: "Time", accessor: "appointmentTime" },
      { header: "Diagnosis", accessor: "diagnosis" },
      {
        header: "Actions",
        cell: (row) => (
          <div className="flex items-center gap-2">
            <button onClick={() => handleAddRecord(row)} className="text-base p-1"><FaNotesMedical /></button>
            <TeleConsultFlow phone={row.phone} patientName={row.name || `${row.firstName || ""} ${row.middleName || ""} ${row.lastName || ""}`.replace(/\s+/g, " ").trim()} context="OPD" patientEmail={row.email} hospitalName={row.hospitalName || "AV Hospital"} />
            <button title="View Medical Record" onClick={() => {
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
                  temporaryAddress: row.temporaryAddress || row.addressTemp || row.address || "",
                  address: row.address || row.temporaryAddress || row.addressTemp || "",
                  addressTemp: row.addressTemp || row.temporaryAddress || row.address || "",
                  dob: row.dob || "",
                  age: age,
                  bloodType: row.bloodGroup || row.bloodType || "",
                  regNo: row.regNo || "2025/072/0032722",
                  mobileNo: row.mobileNo || row.phone || "",
                  department: row.department || "Ophthalmology",
                },
              });
            }} className="p-1 text-base text-[var(--primary-color)]" style={{ display: "flex", alignItems: "center" }}><FiExternalLink /></button>
          </div>
        ),
      },
    ];

    const childTabActions = [];
    const filters = [
      { key: "status", label: "Status", options: ["Scheduled", "Completed", "Cancelled"].map((status) => ({ value: status, label: status })) },
      { key: "department", label: "Department", options: masterData.departments },
    ];

    useEffect(() => {
      if (typeof setTabActions === "function") {
        setTabActions(childTabActions);
      }
    }, []);

    useEffect(() => {
      if (doctorName && !masterData.loading) fetchAllPatients();
    }, [doctorName, masterData.loading]);

    useEffect(() => {
      const highlightIdFromState = location.state?.highlightId;
      if (highlightIdFromState) setNewPatientId(highlightIdFromState);
    }, [location.state]);

    const tabActionsToUse = tabActions.length ? tabActions : childTabActions;

    return (
      <>
        <DynamicTable
          columns={columns}
          data={patients}
          filters={filters}
          loading={loading}
          onViewPatient={handleViewPatient}
          newRowIds={[newPatientId].filter(Boolean)}
          tabs={tabs}
          tabActions={tabActionsToUse}
          activeTab={activeTab}
          onTabChange={onTabChange}
          rowClassName={(row) => row.sequentialId === newPatientId || row.sequentialId === location.state?.highlightId ? "font-bold bg-yellow-100 hover:bg-yellow-200 transition-colors duration-150" : ""}
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
        <ReusableModal
          isOpen={modals.addPatient}
          onClose={() => closeModal("addPatient")}
          mode="add"
          title="Add OPD Patient"
          fields={generatePatientBasicFields()}
          data={formData}
          onSave={handleSavePatient}
          onChange={handleFormChange}
          saveLabel="Next"
          cancelLabel="Cancel"
          size="lg"
          errors={errors}
        />
        <ReusableModal
          isOpen={modals.appointment}
          onClose={() => closeModal("appointment")}
          mode="add"
          title="Schedule Appointment"
          fields={APPOINTMENT_FIELDS}
          data={appointmentFormData}
          onSave={handleScheduleAppointment}
          onChange={setAppointmentFormData}
          saveLabel="Schedule"
          cancelLabel="Back"
          size="md"
          extraContent={
            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">Patient Information</h4>
              <p className="text-sm text-blue-700">{formData.firstName} {formData.middleName} {formData.lastName}</p>
              <p className="text-xs text-blue-600">{formData.email}</p>
            </div>
          }
        />
        <ReusableModal
          isOpen={modals.editPatient}
          onClose={() => closeModal("editPatient")}
          mode="edit"
          title="Edit OPD Patient"
          fields={generatePatientBasicFields()}
          data={formData}
          onSave={handleUpdatePatient}
          onChange={handleFormChange}
          saveLabel="Update"
          cancelLabel="Cancel"
          size="lg"
        />
      </>
    );
  }
);

export default OpdTab;
