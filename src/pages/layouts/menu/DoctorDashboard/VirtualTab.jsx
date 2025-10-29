import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useSelector } from 'react-redux';
import { FaNotesMedical } from "react-icons/fa";
import { FiExternalLink } from "react-icons/fi";
import DynamicTable from "../../../../components/microcomponents/DynamicTable";
import ReusableModal from "../../../../components/microcomponents/Modal";
import TeleConsultFlow from "../../../../components/microcomponents/Call";
import {
  getAllVirtualAppointments,
  getVitalsById,
  getFamilyMembersByPatient,
  getPersonalHealthByPatientId,
  createVirtualAppointment,
  updateVirtualAppointment,
} from "../../../../utils/CrudService";
import { getConsultationTypes } from "../../../../utils/masterService";
import { usePatientContext } from "../../../../context-api/PatientContext";


// Utility to get current date and time arrays
const getCurrentDateArray = () => {
  const d = new Date();
  return [d.getFullYear(), d.getMonth() + 1, d.getDate()];
};
const getCurrentTimeArray = () => {
  const d = new Date();
  return [d.getHours(), d.getMinutes()];
};

// --- Patient View Sections ---
const PatientViewSections = ({ data, personalHealthDetails, familyHistory, vitalSigns, loading }) => (
  <div className="space-y-4">
    {[{
      title: "Basic Information",
      data: {
        Name: data.name,
        Email: data.email,
        Phone: data.phone,
        Gender: data.gender,
        "Blood Group": data.bloodGroup,
        DOB: data.dob,
      },
    }, {
      title: "Virtual Consultation Details",
      data: {
        "Scheduled Date": data.scheduledDate?.join("-"),
        "Scheduled Time": data.scheduledTime?.join(":"),
        "Consultation Type": data.consultationType,
        Duration: data.duration ? `${data.duration} minutes` : "Not specified",
        Status: data.consultationStatus,
        Notes: data.notes || "No notes",
      },
    }, {
      title: "Personal Health Details",
      data: personalHealthDetails || null,
    }, {
      title: "Family History",
      isArray: true,
      data: familyHistory,
    }, {
      title: "Vital Signs",
      data: vitalSigns ? {
        "Blood Pressure": vitalSigns.bloodPressure,
        "Heart Rate": vitalSigns.heartRate,
        Temperature: vitalSigns.temperature,
        "Blood Sugar": vitalSigns.bloodSugar,
        "Oxygen Saturation": vitalSigns.oxygenSaturation,
        "Respiratory Rate": vitalSigns.respiratoryRate,
      } : null,
    }].map(section => (
      <div key={section.title} className="border rounded-lg p-4">
        <h3 className="font-semibold mb-2">{section.title}</h3>
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">Loading...</span>
          </div>
        ) : section.isArray ? (
          section.data?.length > 0 ? section.data.map((member, i) => (
            <div key={i} className="p-2 bg-gray-50 rounded text-sm mb-2">
              <p><strong>{member.memberName || member.name}</strong> ({member.relationName || member.relation})</p>
              <p><strong>Phone:</strong> {member.phoneNumber || member.phone || "Not provided"}</p>
              <p><strong>Health Conditions:</strong> {member.healthConditions?.length > 0 ? member.healthConditions.map(c => c.healthConditionName || c.name).join(", ") : "None reported"}</p>
            </div>
          )) : <p className="text-gray-500 text-sm">No data available</p>
        ) : section.data ? (
          <div className="grid grid-cols-2 gap-2 text-sm">
            {Object.entries(section.data).map(([key, value]) => (
              <p key={key}><strong>{key}:</strong> {value || "N/A"}</p>
            ))}
          </div>
        ) : <p className="text-gray-500 text-sm">No data available</p>}
      </div>
    ))}
  </div>
);

// --- Patient View Modal ---
const PatientViewModal = ({ isOpen, onClose, patient, personalHealthDetails, familyHistory, vitalSigns, loading, onEdit }) => {
  if (!isOpen) return null;
  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-2 sm:p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="flex flex-col relative w-full max-w-4xl max-h-[95vh] rounded-xl bg-white shadow-xl overflow-hidden" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="sticky top-0 z-20 bg-gradient-to-r from-[#01B07A] to-[#1A223F] rounded-t-xl p-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="relative mr-4 flex h-16 w-16 items-center justify-center rounded-full bg-white text-[#01B07A] text-xl font-bold uppercase shadow-inner">
              {(patient?.name || "NA").substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">{patient?.name || "-"}</h2>
              <p className="text-white text-lg">Virtual #{patient?.sequentialId || "-"}</p>
            </div>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full border border-white text-white hover:bg-white hover:text-[#01B07A] transition-all duration-200">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          <PatientViewSections data={patient || {}} personalHealthDetails={personalHealthDetails} familyHistory={familyHistory} vitalSigns={vitalSigns} loading={loading} />
        </div>
        <div className="bg-white border-t p-4 flex justify-end">
          <button onClick={() => onEdit(patient)} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Edit Consultation
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- VirtualTab Component ---
const VirtualTab = forwardRef(({ doctorName, masterData, location, setTabActions, tabActions = [], tabs = [], activeTab, onTabChange }, ref) => {
  const navigate = useNavigate();
  const { patientId, doctorId } = useSelector((state) => state.auth);
  const [virtualPatients, setVirtualPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPatientId, setNewPatientId] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [modals, setModals] = useState({ scheduleConsultation: false, viewPatient: false, editPatient: false });
  const [consultationFormData, setConsultationFormData] = useState({ scheduledDate: getCurrentDateArray(), scheduledTime: getCurrentTimeArray(), duration: 30 });
  const [personalHealthDetails, setPersonalHealthDetails] = useState(null);
  const [familyHistory, setFamilyHistory] = useState([]);
  const [vitalSigns, setVitalSigns] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [consultationTypes, setConsultationTypes] = useState([]);
  const [errors, setErrors] = useState({});
  const { setPatients, setActiveTab: setContextActiveTab } = usePatientContext();

  useImperativeHandle(ref, () => ({
    openScheduleConsultationModal: () => openModal("scheduleConsultation"),
  }));

  // --- Validation Functions ---
  const validatePhone = (phone) => {
    const regex = /^[0-9]{10}$/;
    return regex.test(phone);
  };

  // --- Fetch consultation types ---
  const fetchConsultationTypes = async () => {
    try {
      const res = await getConsultationTypes();
      if (Array.isArray(res.data)) setConsultationTypes(res.data);
      else if (res.data) setConsultationTypes([res.data]);
      else setConsultationTypes([]);
    } catch (error) {
      console.error("Error fetching consultation types:", error);
      setConsultationTypes([]);
    }
  };

  // --- Fetch all patients ---
  const fetchAllPatients = async () => {
    setLoading(true);
    try {
      const res = await getAllVirtualAppointments();
      const allPatients = res.data || [];
      const filteredPatients = allPatients
        .map((p, i) => ({
          ...p,
          name: p.patientName,
          phone: p.userPhone,
          consultationType: p.consultationTypeName,
          sequentialId: i + 1,
          scheduledDate: p.scheduledDate,
          scheduledTime: p.scheduledTime,
        }));
      setVirtualPatients(filteredPatients.reverse());
      setPatients(filteredPatients);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Fetch patient details ---
  const fetchPatientDetails = async (patientId) => {
    if (!patientId) return;
    setDetailsLoading(true);
    try {
      const [personalRes, familyRes, vitalRes] = await Promise.all([
        getPersonalHealthByPatientId(patientId).catch(() => ({ data: null })),
        getFamilyMembersByPatient(patientId).catch(() => ({ data: [] })),
        getVitalsById(patientId).catch(() => ({ data: null })),
      ]);
      setPersonalHealthDetails(personalRes.data || null);
      setFamilyHistory(familyRes.data || []);
      setVitalSigns(vitalRes.data || null);
    } catch (error) {
      console.error(error);
      setPersonalHealthDetails(null);
      setFamilyHistory([]);
      setVitalSigns(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  // --- Modal handling ---
  const openModal = (name) => setModals(prev => ({ ...prev, [name]: true }));
  const closeModal = (name) => {
    setModals(prev => ({ ...prev, [name]: false }));
    if (name === "scheduleConsultation") setConsultationFormData({ scheduledDate: getCurrentDateArray(), scheduledTime: getCurrentTimeArray(), duration: 30 });
    if (name === "viewPatient" || name === "editPatient") {
      setSelectedPatient(null);
      setPersonalHealthDetails(null);
      setFamilyHistory([]);
      setVitalSigns(null);
      setDetailsLoading(false);
    }
    setErrors({});
  };

  // --- View / Edit Patient ---
  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    openModal("viewPatient");
    fetchPatientDetails(patient.id || patient.patientId);
  };

  const handleEditPatient = (patient) => {
    setSelectedPatient(patient);
    setConsultationFormData({
      ...patient,
      scheduledDate: patient.scheduledDate || getCurrentDateArray(),
      scheduledTime: patient.scheduledTime || getCurrentTimeArray(),
      duration: patient.duration || 30,
    });
    closeModal("viewPatient");
    openModal("editPatient");
  };

  // --- Schedule & Update consultation ---
  const handleScheduleConsultation = async (formData) => {
   
    try {
      const payload = {
        ...formData,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        type: "virtual",
        scheduledDate: formData.scheduledDate,
        scheduledTime: formData.scheduledTime,
        consultationStatus: "Scheduled",
        doctorName,
        doctorId,
        patientId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const response = await createVirtualAppointment(payload);
      if (response?.data) {
    
        closeModal("scheduleConsultation");
        await new Promise((r) => setTimeout(r, 500));
        fetchAllPatients();
      }
    } catch (error) {
      console.error("Error scheduling consultation:", error);
  
    }
  };

  const handleUpdateConsultation = async (formData) => {
   
    try {
      const payload = {
        ...formData,
        id: selectedPatient.id,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        type: "virtual",
        scheduledDate: formData.scheduledDate,
        scheduledTime: formData.scheduledTime,
        consultationStatus: "Scheduled",
        doctorName,
        doctorId,
        patientId,
        updatedAt: new Date().toISOString(),
      };
      const response = await updateVirtualAppointment(selectedPatient.id, payload);
      if (response?.data) {
        closeModal("editPatient");
        await new Promise((r) => setTimeout(r, 500));
        fetchAllPatients();
      }
    } catch (error) {
      console.error("Error updating consultation:", error);
    }
  };

  // --- Columns ---
  const columns = [
    { header: "ID", accessor: "sequentialId" },
    { header: "Name", accessor: "name", clickable: true, cell: row => (
      <button className="cursor-pointer text-[var(--primary-color)] hover:text-[var(--accent-color)]" onClick={() => handleViewPatient(row)}>
        {row.name}
      </button>
    )},
    { header: "Date", accessor: row => row.scheduledDate?.join("-") },
    { header: "Time", accessor: row => row.scheduledTime?.join(":") },
    { header: "Type", accessor: "consultationType" },
    { header: "Duration", accessor: "duration" },
    { header: "Actions", cell: row => (
      <div className="flex items-center gap-2">
        <button onClick={() => navigate("/doctordashboard/form", { state: { patient: row } })} className="text-base p-1"><FaNotesMedical /></button>
        <TeleConsultFlow phone={row.phone} patientName={row.name} context="Virtual" patientEmail={row.email} hospitalName={row.hospitalName || "AV Hospital"} />
        <button title="View Medical Record" onClick={() => navigate("/doctordashboard/medical-record", { state: { patient: row } })} className="p-1 text-base text-[var(--primary-color)]"><FiExternalLink /></button>
      </div>
    )},
  ];

  // --- Filters ---
  const filters = [
    { key: "consultationStatus", label: "Status", options: ["Scheduled", "Completed", "Cancelled"].map(s => ({ value: s, label: s })) },
    { key: "consultationType", label: "Type", options: consultationTypes.map(t => ({ value: t.name, label: t.name })) },
  ];

  // --- Effects ---
  useEffect(() => { fetchConsultationTypes(); }, []);
  useEffect(() => { fetchAllPatients(); }, [doctorId, patientId, consultationTypes]);
  useEffect(() => { const highlightId = location.state?.highlightId; if (highlightId) setNewPatientId(highlightId); }, [location.state]);

  return (
    <>
      <DynamicTable columns={columns} data={virtualPatients} filters={filters} loading={loading} newRowIds={[newPatientId].filter(Boolean)} tabs={tabs} tabActions={tabActions} activeTab={activeTab} onTabChange={onTabChange} rowClassName={row => row.sequentialId === newPatientId ? "font-bold bg-yellow-100" : ""} />
      <PatientViewModal isOpen={modals.viewPatient} onClose={() => closeModal("viewPatient")} patient={selectedPatient} personalHealthDetails={personalHealthDetails} familyHistory={familyHistory} vitalSigns={vitalSigns} loading={detailsLoading} onEdit={handleEditPatient} />
      <ReusableModal
        isOpen={modals.scheduleConsultation}
        onClose={() => closeModal("scheduleConsultation")}
        mode="add"
        title="Schedule Virtual Consultation"
        fields={CONSULTATION_FIELDS(consultationTypes, errors)}
        data={consultationFormData}
        onSave={handleScheduleConsultation}
        onChange={setConsultationFormData}
        saveLabel="Schedule"
        cancelLabel="Cancel"
        size="lg"
      />
      <ReusableModal
        isOpen={modals.editPatient}
        onClose={() => closeModal("editPatient")}
        mode="edit"
        title="Edit Virtual Consultation"
        fields={CONSULTATION_FIELDS(consultationTypes, errors)}
        data={consultationFormData}
        onSave={handleUpdateConsultation}
        onChange={setConsultationFormData}
        saveLabel="Update"
        cancelLabel="Cancel"
        size="lg"
      />
    </>
  );
});

// --- Form Fields Function ---
const CONSULTATION_FIELDS = (consultationTypes) => [
  { name: "firstName",label: "First Name*",type: "text",required: true,validate: (v) => (!v ? "First name is required" : ""),},
  {name: "lastName",label: "Last Name*",type: "text",required: true,validate: (v) => (!v ? "Last name is required" : ""),},
  { name: "email",label: "Email Address*",type: "email",required: true,validate: (v) =>!v? "Email is required": !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)? "Invalid email format" : "",},
  {name: "phone",label: "Phone Number*",type: "text",required: true, placeholder: "10 digits only", validate: (v) =>!v? "Phone number is required": !/^[0-9]{10}$/.test(v)? "Phone must be exactly 10 digits" : "",},
  {name: "consultationTypeId",label: "Consultation Type*",type: "select",required: true,options: consultationTypes.map((t) => ({value: t.id,label: t.name,})),validate: (v) => (!v ? "Consultation type is required" : ""),},
  {name: "scheduledDate",label: "Scheduled Date*",type: "date",required: true,validate: (v) => (!v ? "Date is required" : ""),},
  {name: "scheduledTime",label: "Scheduled Time*",type: "time",required: true,validate: (v) => (!v ? "Time is required" : ""),},
  {name: "duration",label: "Duration (minutes)*",type: "number",required: true,validate: (v) =>!v ? "Duration is required" : v <= 0 ? "Must be greater than 0" : "",},
  {name: "notes",label: "Consultation Notes",type: "textarea",colSpan: 2,},
];


export default VirtualTab;
