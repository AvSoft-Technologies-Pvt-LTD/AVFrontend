import React, { useState, useEffect, forwardRef, useImperativeHandle, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { FiExternalLink } from "react-icons/fi";
import DynamicTable from "../../../../components/microcomponents/DynamicTable";
import ReusableModal from "../../../../components/microcomponents/Modal";
import AadharVerificationFlow from "../../../../components/AadharVerification/Profile";
import { getVirtualAppointmentById, createVirtualAppointment, updateVirtualAppointment } from "../../../../utils/CrudService";
import { getAllSymptoms, getDoctorAvailabilityByDate } from "../../../../utils/masterService";
import { usePatientContext } from "../../../../context-api/PatientContext";

const getCurrentDateArray = () => {
  const d = new Date();
  return [d.getFullYear(), d.getMonth() + 1, d.getDate()];
};

const APPOINTMENT_VIEW_FIELDS = [
  { key: "appointmentId", label: "Appointment ID", subtitleKey: true },
  { key: "doctorName", label: "Doctor Name" },
  { key: "name", label: "Patient Name", titleKey: true, initialsKey: true },
  { key: "phone", label: "Phone" },
  { key: "email", label: "Email" },
  { key: "gender", label: "Gender" },
  { key: "symptomNames", label: "Symptoms" },
  { key: "scheduledDate", label: "Scheduled Date" },
  { key: "scheduledTime", label: "Scheduled Time" },
  { key: "duration", label: "Duration (minutes)" },
  { key: "consultationNotes", label: "Consultation Notes" },
];

const VirtualTab = forwardRef(
  (
    { location, setTabActions, tabActions = [], tabs = [], activeTab, onTabChange },
    ref
  ) => {
    const navigate = useNavigate();
    const { patientId, doctorId } = useSelector((s) => s.auth);
    const [virtualPatients, setVirtualPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newPatientId, setNewPatientId] = useState(null);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [symptoms, setSymptoms] = useState([]);
    const [modals, setModals] = useState({
      scheduleConsultation: false,
      viewPatient: false,
      editPatient: false,
      verifyPatient: false,
    });
    const [availableSlots, setAvailableSlots] = useState([]);
    const [verifiedPatient, setVerifiedPatient] = useState(null);
    const { setPatient } = usePatientContext();
    const [consultationFormData, setConsultationFormData] = useState({
  scheduledDate: new Date().toISOString().split("T")[0], // "yyyy-MM-dd"
  scheduledTime: null,
  duration: 30,
  symptoms: [],
  notes: "",
});

    useImperativeHandle(ref, () => ({
      openScheduleConsultationModal: () => openModal("verifyPatient"),
    }));

    useEffect(() => {
      const fetchSymptoms = async () => {
        try {
          const response = await getAllSymptoms();
          if (response?.data) {
            const formattedSymptoms = response.data.map((symptom) => ({
              value: String(symptom.symptomId ?? symptom.id ?? ""),
              label: symptom.name ?? symptom.label ?? "Unknown",
            }));
            setSymptoms(formattedSymptoms);
          }
        } catch (error) {}
      };
      fetchSymptoms();
    }, []);

const fetchAvailability = async (dateArrayOrString) => {
  try {
    if (!doctorId) {
      setAvailableSlots([]);
      return;
    }
    let dateStr;
    if (Array.isArray(dateArrayOrString) && dateArrayOrString.length === 3) {
      dateStr = `${dateArrayOrString[0]}-${String(dateArrayOrString[1]).padStart(2, "0")}-${String(dateArrayOrString[2]).padStart(2, "0")}`;
    } else if (typeof dateArrayOrString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateArrayOrString)) {
      dateStr = dateArrayOrString; // Already in "yyyy-MM-dd" format
    } else {
      setAvailableSlots([]);
      return;
    }
    const res = await getDoctorAvailabilityByDate(doctorId, dateStr);
    const data = res?.data || {};
    formatSlots(data.availability || [], data.bookedSlots || []);
  } catch (err) {
    setAvailableSlots([]);
  }
};

    const formatSlots = (availability = [], booked = []) => {
      if (!availability.length) {
        setAvailableSlots([]);
        return;
      }
      const day = availability[0];
      const times = day.times || [];
      const bookedIds = (booked || []).map((b) => Number(b));
      const slots = times.map((t) => ({
        label: t.time,
        value: Number(t.slotId) || 0,
        disabled: bookedIds.includes(Number(t.slotId)),
      }));
      setAvailableSlots(slots);
    };

    const fetchAllPatients = async () => {
      setLoading(true);
      try {
        const r = await getVirtualAppointmentById(doctorId);
        const raw = r?.data;
        const all = Array.isArray(raw) ? raw : raw ? [raw] : [];
        const formatted = all.map((p) => {
          let date = "N/A";
          if (Array.isArray(p.scheduledDate) && p.scheduledDate.length === 3) {
            const [year, month, day] = p.scheduledDate;
            date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          } else if (p.scheduledDate) {
            date = p.scheduledDate;
          }
          const symptomNames = Array.isArray(p.symptomNames) ? p.symptomNames.join(", ") : p.symptomNames || "N/A";
          return {
            id: p.id,
            appointmentId: p.appointmentId || "N/A",
            doctorId: p.doctorId,
            doctorName: p.doctorName || "N/A",
            patientId: p.patientId,
            name: p.patientName || "N/A",
            phone: p.patientPhone || "N/A",
            email: p.patientEmail || "N/A",
            gender: p.patientGender || "N/A",
            symptomIds: p.symptomIds || [],
            symptomNames: symptomNames,
            scheduledDate: date,
            slotId: p.slotId || 0,
            scheduledTime: p.slotTime || "N/A",
            duration: p.duration || 0,
            consultationNotes: p.consultationNotes || "N/A",
          };
        });
        setVirtualPatients(formatted.reverse());
        setPatient(formatted);
      } catch (e) {
        setVirtualPatients([]);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      if (!doctorId) return;
      if (!modals.scheduleConsultation && !modals.editPatient) return;
      fetchAvailability(consultationFormData.scheduledDate);
    }, [doctorId, consultationFormData.scheduledDate, modals.scheduleConsultation, modals.editPatient]);

    useEffect(() => {
      if (doctorId) {
        fetchAllPatients();
      }
    }, [doctorId]);

    useEffect(() => {
      const id = location?.state?.highlightId;
      if (id) setNewPatientId(id);
    }, [location?.state]);

    const openModal = (n) => setModals((p) => ({ ...p, [n]: true }));

    const closeModal = (n) => {
      setModals((p) => ({ ...p, [n]: false }));
      if (n === "scheduleConsultation") {
        setConsultationFormData({
          scheduledDate: getCurrentDateArray(),
          scheduledTime: null,
          duration: 30,
          symptoms: [],
          notes: "",
        });
        setAvailableSlots([]);
      }
      if (n === "verifyPatient") setVerifiedPatient(null);
      if (n === "viewPatient" || n === "editPatient") setSelectedPatient(null);
    };

    const handleViewPatient = (p) => {
      setSelectedPatient(p);
      openModal("viewPatient");
    };

 const handleEditPatient = (p) => {
  if (!p) return;
  setSelectedPatient(p);
  let dateStr = new Date().toISOString().split("T")[0];
  if (p.scheduledDate && p.scheduledDate !== "N/A") {
    dateStr = p.scheduledDate; // Already in "yyyy-MM-dd" format
  }
  setConsultationFormData({
    scheduledDate: dateStr,
    scheduledTime: p.slotId ? Number(p.slotId) : null,
    duration: p.duration || 30,
    symptoms: [],
    notes: p.consultationNotes || "",
  });
  closeModal("viewPatient");
  openModal("editPatient");
};


  const handleScheduleConsultation = async () => {
  try {
    const selectedSlot = consultationFormData.scheduledTime;
    if (!selectedSlot) return;
    const patientIdToUse = verifiedPatient?.id || patientId || 1;
    const scheduledDateArray = typeof consultationFormData.scheduledDate === 'string'
      ? consultationFormData.scheduledDate.split('-').map(Number)
      : consultationFormData.scheduledDate;
    const payload = {
      doctorId,
      patientId: patientIdToUse,
      scheduledDate: scheduledDateArray,
      slotId: Number(selectedSlot),
      duration: Number(consultationFormData.duration) || 30,
      symptomIds: (consultationFormData.symptoms || [])
        .map((s) => Number(s.value))
        .filter(Boolean),
      consultationNotes: consultationFormData.notes || "",
    };
    await createVirtualAppointment(payload);
    closeModal("scheduleConsultation");
    await fetchAllPatients();
  } catch (error) {}
};

const handleUpdateConsultation = async (formDataParam) => {
  try {
    if (!selectedPatient?.id) return;
    const formData = formDataParam || consultationFormData;
    const selectedSlot = formData.scheduledTime ?? consultationFormData.scheduledTime;
    if (selectedSlot === null || selectedSlot === undefined) return;
    let scheduledDateArray;
    if (typeof formData.scheduledDate === 'string') {
      scheduledDateArray = formData.scheduledDate.split('-').map(Number);
    } else if (Array.isArray(formData.scheduledDate)) {
      scheduledDateArray = formData.scheduledDate;
    } else {
      return;
    }
    const payload = {
      doctorId,
      patientId: selectedPatient.patientId || patientId || 1,
      scheduledDate: scheduledDateArray,
      slotId: Number(selectedSlot),
      duration: Number(formData.duration) || 30,
      symptomIds: (formData.symptoms || []).map(s => {
        if (typeof s === 'object' && s !== null) {
          return Number(s.value || s.id || s);
        }
        return Number(s);
      }).filter(Boolean),
      consultationNotes: formData.notes || "",
    };
    await updateVirtualAppointment(selectedPatient.id, payload);
    closeModal("editPatient");
    await fetchAllPatients();
  } catch (error) {}
};

const handleVerifyPatient = (patient) => {
  setVerifiedPatient(patient);
  closeModal("verifyPatient");
  const date = new Date().toISOString().split("T")[0]; // "yyyy-MM-dd"
  const newForm = {
    scheduledDate: date,
    scheduledTime: null,
    duration: 30,
    symptoms: [],
    notes: "",
  };
  setConsultationFormData(newForm);
  fetchAvailability(date);
  openModal("scheduleConsultation");
};

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
      { header: "Duration", accessor: "duration" },
      {
        header: "Actions",
        cell: (r) => (
          <div className="flex items-center gap-2">
            <button
              title="View Medical Record"
              onClick={() => {
                setPatient(r);
                navigate("/doctordashboard/medical-record", { state: { patient: r } });
              }}
              className="p-1 text-base text-[var(--primary-color)]"
            >
              <FiExternalLink />
            </button>
          </div>
        ),
      },
    ];

    const filters = [
      {
        key: "consultationStatus",
        label: "Status",
        options: ["Scheduled", "Completed", "Cancelled"].map((s) => ({
          value: s,
          label: s,
        })),
      },
    ];

    const CONSULTATION_FIELDS = useMemo(
      () => [
        {
          name: "scheduledDate",
          label: "Scheduled Date*",
          type: "date",
          required: true,
        },
        {
          name: "duration",
          label: "Duration (minutes)*",
          type: "number",
          required: true,
          min: 5,
          max: 120,
        },
        {
          name: "symptoms",
          label: "Symptoms",
          type: "multiselect",
          required: true,
          options: symptoms,
        },
        {
          name: "notes",
          label: "Consultation Notes",
          type: "textarea",
          required: false,
          placeholder: "Enter any additional notes...",
        },
      ],
      [symptoms]
    );

    return (
      <>
        <DynamicTable
          columns={columns}
          data={virtualPatients}
          filters={filters}
          loading={loading}
          newrIds={[newPatientId].filter(Boolean)}
          tabs={tabs}
          tabActions={tabActions}
          activeTab={activeTab}
          onTabChange={onTabChange}
          rClassName={(r) => (r.appointmentId === newPatientId ? "font-bold bg-yellow-100" : "")}
        />
        <ReusableModal
          isOpen={modals.viewPatient}
          onClose={() => closeModal("viewPatient")}
          mode="viewProfile"
          title="Patient Appointment Info"
          data={selectedPatient || {}}
          viewFields={APPOINTMENT_VIEW_FIELDS}
          extraContent={
            <div className="flex justify-end mt-4">
              <button
                onClick={() => handleEditPatient(selectedPatient)}
                className="px-4 py-2 bg-[var(--primary-color)] text-white rounded hover:bg-[var(--accent-color)]"
              >
                Edit Consultation
              </button>
            </div>
          }
        />
        {modals.verifyPatient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-4xl bg-white rounded-lg shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-[#01B07A] to-[#004f3d] px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">Verify Patient</h2>
                <button
                  onClick={() => closeModal("verifyPatient")}
                  className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6 max-h-[80vh] overflow-y-auto">
                <AadharVerificationFlow
                  onComplete={handleVerifyPatient}
                  onCancel={() => closeModal("verifyPatient")}
                />
              </div>
            </div>
          </div>
        )}
        <ReusableModal
          isOpen={modals.scheduleConsultation}
          onClose={() => closeModal("scheduleConsultation")}
          mode="add"
          title="Schedule Virtual Consultation"
          fields={CONSULTATION_FIELDS}
          data={consultationFormData}
          onSave={handleScheduleConsultation}
          onChange={setConsultationFormData}
          saveLabel="Schedule"
          cancelLabel="Cancel"
          size="lg"
          extraContent={
            <div>
              <label className="font-semibold mb-2 block">Select Time Slot*</label>
              {availableSlots.length === 0 ? (
                <p className="text-gray-500 text-sm">No available slots for this date</p>
              ) : (
                <div className="grid grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.value}
                      disabled={slot.disabled}
                      onClick={() => {
                        setConsultationFormData((p) => ({
                          ...p,
                          scheduledTime: Number(slot.value),
                        }));
                      }}
                      className={`p-2 rounded-md border text-sm transition-colors ${
                        consultationFormData.scheduledTime === slot.value
                          ? "bg-green-600 text-white border-green-600"
                          : "bg-white border-gray-300 hover:border-green-400"
                      } ${slot.disabled ? "opacity-50 cursor-not-allowed bg-gray-100" : ""}`}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          }
        />
        <ReusableModal
          isOpen={modals.editPatient}
          onClose={() => closeModal("editPatient")}
          mode="edit"
          title="Edit Virtual Consultation"
          fields={CONSULTATION_FIELDS}
          data={consultationFormData}
          onSave={handleUpdateConsultation}
          onChange={setConsultationFormData}
          saveLabel="Update"
          cancelLabel="Cancel"
          size="lg"
          extraContent={
            <div>
              <label className="font-semibold mb-2 block">Select Time Slot*</label>
              {availableSlots.length === 0 ? (
                <p className="text-gray-500 text-sm">No available slots for this date</p>
              ) : (
                <div className="grid grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.value}
                      disabled={slot.disabled}
                      onClick={() => {
                        setConsultationFormData((p) => ({
                          ...p,
                          scheduledTime: Number(slot.value),
                        }));
                      }}
                      className={`p-2 rounded-md border text-sm transition-colors ${
                        consultationFormData.scheduledTime === slot.value
                          ? "bg-green-600 text-white border-green-600"
                          : "bg-white border-gray-300 hover:border-green-400"
                      } ${slot.disabled ? "opacity-50 cursor-not-allowed bg-gray-100" : ""}`}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          }
        />
      </>
    );
  }
);

VirtualTab.displayName = "VirtualTab";
export default VirtualTab;
