import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaNotesMedical } from "react-icons/fa";
import { FiExternalLink } from "react-icons/fi";
import DynamicTable from "../../../../components/microcomponents/DynamicTable";
import ReusableModal from "../../../../components/microcomponents/Modal";
import TeleConsultFlow from "../../../../components/microcomponents/Call";
import {
  getAllVirtualAppointments,
  createVirtualAppointment,
  updateVirtualAppointment,
} from "../../../../utils/CrudService";
import { getConsultationTypes } from "../../../../utils/masterService";
import { usePatientContext } from "../../../../context-api/PatientContext";

const getCurrentDateArray = () => {
  const d = new Date();
  return [d.getFullYear(), d.getMonth() + 1, d.getDate()];
};

const getCurrentTimeArray = () => {
  const d = new Date();
  return [d.getHours(), d.getMinutes()];
};

// Fields for viewing appointment info
const APPOINTMENT_VIEW_FIELDS = [
  { key: "appointmentId", label: "Appointment ID" },
  { key: "name", label: "Patient Name", titleKey: true, initialsKey: true },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "scheduledDate", label: "Scheduled Date" },
  { key: "scheduledTime", label: "Scheduled Time" },
  { key: "consultationType", label: "Consultation Type" },
  { key: "duration", label: "Duration (minutes)" },
  { key: "consultationNotes", label: "Consultation Notes" },
];

const VirtualTab = forwardRef(
  ({ doctorName, location, setTabActions, tabActions = [], tabs = [], activeTab, onTabChange }, ref) => {
    const navigate = useNavigate();
    const { patientId, doctorId } = useSelector((s) => s.auth);
    const [virtualPatients, setVirtualPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newPatientId, setNewPatientId] = useState(null);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [modals, setModals] = useState({
      scheduleConsultation: false,
      viewPatient: false,
      editPatient: false,
    });
    const [consultationFormData, setConsultationFormData] = useState({
      scheduledDate: getCurrentDateArray(),
      scheduledTime: getCurrentTimeArray(),
      duration: 30,
    });
    const [consultationTypes, setConsultationTypes] = useState([]);
    const { setPatients } = usePatientContext();

    useImperativeHandle(ref, () => ({
      openScheduleConsultationModal: () => openModal("scheduleConsultation"),
    }));

    // ✅ Fetch consultation types
    const fetchConsultationTypes = async () => {
      try {
        const r = await getConsultationTypes();
        setConsultationTypes(Array.isArray(r.data) ? r.data : r.data ? [r.data] : []);
      } catch {
        setConsultationTypes([]);
      }
    };

    // ✅ Fetch all virtual consultations
    const fetchAllPatients = async () => {
      setLoading(true);
      try {
        const r = await getAllVirtualAppointments();
        const all = r.data || [];
        const formatted = all.map((p) => {
          const d = p.scheduledDate ? new Date(p.scheduledDate) : null;
          const date = d && !isNaN(d) ? d.toISOString().split("T")[0] : "N/A";
          let time = d && !isNaN(d) ? d.toISOString().split("T")[1]?.slice(0, 5) : "N/A";
          if (p.scheduledTime?.includes(":")) time = p.scheduledTime;
          return {
            ...p,
            name: p.patientName,
            phone: p.patientPhone,
            consultationType: p.consultationTypeName,
            appointmentId: p.appointmentId,
            scheduledDate: date,
            scheduledTime: time,
          };
        });
        setVirtualPatients(formatted.reverse());
        setPatients(formatted);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    const openModal = (n) => setModals((p) => ({ ...p, [n]: true }));
    const closeModal = (n) => {
      setModals((p) => ({ ...p, [n]: false }));
      if (n === "scheduleConsultation")
        setConsultationFormData({
          scheduledDate: getCurrentDateArray(),
          scheduledTime: getCurrentTimeArray(),
          duration: 30,
        });
      setSelectedPatient(null);
    };

    // ✅ View appointment details
  const handleViewPatient = (p) => {
  // Keep full record so id is preserved
  setSelectedPatient(p);

  const formatted = {
    appointmentId: p.appointmentId || "N/A",
    name: p.patientName || "N/A",
    email: p.patientEmail || p.userEmail || "N/A",
    phone: p.patientPhone || p.userPhone || "N/A",
    scheduledDate: p.scheduledDate || "N/A",
    scheduledTime: p.scheduledTime || "N/A",
    consultationType: p.consultationTypeName || "N/A",
    duration: p.duration || "N/A",
    consultationNotes: p.consultationNotes || "N/A",
  };

  openModal("viewPatient");
  // pass only the formatted view data to modal
  setConsultationFormData(formatted);
};


const handleEditPatient = (p) => {
  if (!p) return;

  // ✅ Preserve the full object with id for PUT
  setSelectedPatient(p);

  setConsultationFormData({
    firstName: p.patientName?.split(" ")[0] || "",
    lastName: p.patientName?.split(" ")[1] || "",
    email: p.patientEmail || p.userEmail || "",
    phone: p.patientPhone || p.userPhone || "",
    consultationTypeId: p.consultationTypeId || "",
    scheduledDate: p.scheduledDate ? p.scheduledDate.split("T")[0] : "",
    scheduledTime: p.scheduledTime || "",
    duration: p.duration || 30,
    notes: p.consultationNotes || "",
  });

  closeModal("viewPatient");
  openModal("editPatient");
};



    // ✅ Schedule new consultation
    const handleScheduleConsultation = async (f) => {
      try {
        const payload = {
          ...f,
          name: `${f.firstName} ${f.lastName}`.trim(),
          type: "virtual",
          patientEmail: f.email,
           phoneNumber: f.phone, // <-- Use phoneNumber instead of patientPhone
           consultationNotes: f.notes, // <-- Use notes instead of consultationNotes
          consultationStatus: "Scheduled",
          doctorName,
          doctorId,
          patientId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const r = await createVirtualAppointment(payload);
        if (r?.data) {
          closeModal("scheduleConsultation");
          await new Promise((r) => setTimeout(r, 500));
          fetchAllPatients();
        }
      } catch (e) {
        console.error(e);
      }
    };

    // ✅ Update consultation
const handleUpdateConsultation = async (formData) => {
  try {
    const id = selectedPatient?.id || selectedPatient?.appointmentId;
    if (!id) {
      console.error("No appointment ID found for update");
      return;
    }
    const payload = {
      doctorId,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phoneNumber: formData.phone, // Use phoneNumber instead of phone
      consultationTypeId: Number(formData.consultationTypeId),
      scheduledDate: formData.scheduledDate,
      scheduledTime: formData.scheduledTime,
      duration: formData.duration,
      consultationNotes: formData.notes, // Use consultationNotes
    };
    console.log("Payload:", payload); // Debug log
    const res = await updateVirtualAppointment(id, payload);
    if (res?.data) {
      closeModal("editPatient");
      await new Promise((r) => setTimeout(r, 500));
      fetchAllPatients();
    }
  } catch (error) {
    console.error("Error updating consultation:", error);
  }
};


    // ✅ Table columns
    const columns = [
      {
        header: "Appointment ID",
        accessor: "appointmentId",
        cell: (r) => (
          <button
            className="cursor-pointer text-[var(--primary-color)] hover:text-[var(--accent-color)]"
            onClick={() => handleViewPatient(r)}
          >
            {r.appointmentId}
          </button>
        ),
      },
      {
        header: "Name",
        accessor: "name",
        cell: (r) => (
          <button
            className="cursor-pointer text-[var(--primary-color)] hover:text-[var(--accent-color)]"
            onClick={() => handleViewPatient(r)}
          >
            {r.name}
          </button>
        ),
      },
      { header: "Date", accessor: "scheduledDate" },
      { header: "Time", accessor: "scheduledTime" },
      { header: "Type", accessor: "consultationType" },
      { header: "Duration", accessor: "duration" },
      {
        header: "Actions",
        cell: (r) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                navigate("/doctordashboard/form", { state: { patient: r } })
              }
              className="text-base p-1"
            >
              <FaNotesMedical />
            </button>
            <TeleConsultFlow
              phone={r.phone}
              patientName={r.name}
              context="Virtual"
              patientEmail={r.email}
              hospitalName={r.hospitalName || "AV Hospital"}
            />
            <button
              title="View Medical Record"
              onClick={() =>
                navigate("/doctordashboard/medical-record", { state: { patient: r } })
              }
              className="p-1 text-base text-[var(--primary-color)]"
            >
              <FiExternalLink />
            </button>
          </div>
        ),
      },
    ];

    // ✅ Table filters
    const filters = [
      {
        key: "consultationStatus",
        label: "Status",
        options: ["Scheduled", "Completed", "Cancelled"].map((s) => ({
          value: s,
          label: s,
        })),
      },
      {
        key: "consultationType",
        label: "Type",
        options: consultationTypes.map((t) => ({ value: t.name, label: t.name })),
      },
    ];

    useEffect(() => {
      fetchConsultationTypes();
    }, []);

    useEffect(() => {
      fetchAllPatients();
    }, [doctorId, patientId, consultationTypes]);

    useEffect(() => {
      const id = location.state?.highlightId;
      if (id) setNewPatientId(id);
    }, [location.state]);

    return (
      <>
        <DynamicTable
          columns={columns}
          data={virtualPatients}
          filters={filters}
          loading={loading}
          newRowIds={[newPatientId].filter(Boolean)}
          tabs={tabs}
          tabActions={tabActions}
          activeTab={activeTab}
          onTabChange={onTabChange}
          rowClassName={(r) =>
            r.appointmentId === newPatientId ? "font-bold bg-yellow-100" : ""
          }
        />

        <ReusableModal
          isOpen={modals.viewPatient}
          onClose={() => closeModal("viewPatient")}
          mode="viewProfile"
          title="Patient Appointment Info"
          data={consultationFormData || selectedPatient || {}}
          viewFields={APPOINTMENT_VIEW_FIELDS}
          extraContent={
            <div className="flex justify-end mt-4">
              <button onClick={() => handleEditPatient(selectedPatient)} className="view-btn">
                Edit Consultation
              </button>
            </div>
          }
        />

        <ReusableModal
          isOpen={modals.scheduleConsultation}
          onClose={() => closeModal("scheduleConsultation")}
          mode="add"
          title="Schedule Virtual Consultation"
          fields={CONSULTATION_FIELDS(consultationTypes)}
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
          fields={CONSULTATION_FIELDS(consultationTypes)}
          data={consultationFormData}
          onSave={handleUpdateConsultation}
          onChange={setConsultationFormData}
          saveLabel="Update"
          cancelLabel="Cancel"
          size="lg"
        />
      </>
    );
  }
);

// ✅ Consultation modal form fields
const CONSULTATION_FIELDS = (types) => [
  { name: "firstName", label: "First Name*", type: "text", required: true },
  { name: "lastName", label: "Last Name*", type: "text", required: true },
  {
    name: "email",
    label: "Email Address*",
    type: "email",
    required: true,
  },
  {
    name: "phone",
    label: "Phone Number*",
    type: "text",
    required: true,
    placeholder: "10 digits only",
  },
  {
    name: "consultationTypeId",
    label: "Consultation Type*",
    type: "select",
    required: true,
    options: types.map((t) => ({ value: t.id, label: t.name })),
  },
  { name: "scheduledDate", label: "Scheduled Date*", type: "date", required: true },
  { name: "scheduledTime", label: "Scheduled Time*", type: "time", required: true },
  {
    name: "duration",
    label: "Duration (minutes)*",
    type: "number",
    required: true,
  },
  { name: "notes", label: "Consultation Notes", type: "textarea", colSpan: 2 },
];

export default VirtualTab;
