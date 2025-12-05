import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { FiExternalLink } from "react-icons/fi";
import DynamicTable from "../../../../components/microcomponents/DynamicTable";
import ReusableModal from "../../../../components/microcomponents/Modal";
import { useDispatch, useSelector } from "react-redux";
import { updatePatient, getGenders, getAllSymptoms, getVisitReasons, getDoctorAvailabilityByDate, createOpdAppointment, getOpdAppointmentsByDoctor, updateOpdAppointmentById } from "../../../../utils/masterService";
import AadharVerificationFlow from "../../../../components/AadharVerification/Profile";
import { usePatientContext } from "../../../../context-api/PatientContext";
import { FaRupeeSign } from "react-icons/fa";
import { MdCurrencyRupee } from "react-icons/md";

const getCurrentDate = () => new Date().toISOString().slice(0, 10);
const getCurrentTime = () => new Date().toTimeString().slice(0, 5);

const OPD_APPOINTMENT_VIEW_FIELDS = [
  { key: "appointmentId", label: "Appointment ID"  },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "name", label: "Patient Name", titleKey: true, initialsKey: true },
  { key: "consultationType", label: "Consultation Type" },
  { key: "date", label: "Date" },
  { key: "time", label: "Time" },
  { key: "diagnosis", label: "Symptoms" },
  { key: "reasonOfVisit", label: "Reason of Visit" },
];

const PatientVerificationModal = ({ isOpen, onClose, onConfirm }) => {
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
              <div className="relative mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#01B07A] text-lg font-bold uppercase shadow-inner">
                PV
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Verify Patient</h2>
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
        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          <AadharVerificationFlow
            onComplete={onConfirm}
            onCancel={onClose}
          />
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
    const { doctorId: authDoctorId, name: authDoctorName } = useSelector((state) => state.auth || {});
    const effectiveDoctorId = authDoctorId;
    const effectiveDoctorName = doctorName || authDoctorName;
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState({});
    const [newPatientId, setNewPatientId] = useState(null);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [modals, setModals] = useState({ addPatient: false, appointment: false, viewPatient: false, editPatient: false });
    const [appointmentFormData, setAppointmentFormData] = useState({ date: getCurrentDate(), time: getCurrentTime() });
    const [editAppointmentFormData, setEditAppointmentFormData] = useState({ date: getCurrentDate(), time: "" });
    const [genderOptions, setGenderOptions] = useState([]);
    const [symptomsOptions, setSymptomsOptions] = useState([]);
    const [visitReasonsOptions, setVisitReasonsOptions] = useState([]);
    const [appointmentStep, setAppointmentStep] = useState(1);
    const [editStep, setEditStep] = useState(1);
    const [timeSlotOptions, setTimeSlotOptions] = useState([]);
    const { setPatient } = usePatientContext();

    const handleSelected = (r) => {
      try {
        localStorage.setItem("selectedThisPatient", JSON.stringify(r));
        setPatient(r);
        navigate("/doctordashboard/medical-record", { state: { patient: r } });
      } catch (error) {
        console.error("[OPD] Error saving patient:", error);
      }
    };

    const handleBilling = (r) => {
      try {
        localStorage.setItem("selectedThisPatient", JSON.stringify(r));
        setPatient(r);
        navigate("/doctordashboard/main-billing", { state: { patient: r } });
      } catch (error) {
        console.error("[OPD] Error saving patient for billing:", error);
      }
    };

    const handleEditAppointmentSave = async () => {
      try {
        if (!selectedPatient) {
          toast.error("No appointment selected");
          return;
        }
        const id = selectedPatient?.id;
        if (!id) {
          toast.error("Missing id");
          return;
        }
        const visitReasonId =
          editAppointmentFormData?.reason && typeof editAppointmentFormData.reason === "object"
            ? editAppointmentFormData.reason.value
            : editAppointmentFormData?.reason;
        const selectedSlot = timeSlotOptions.find((o) => o.value === editAppointmentFormData.time);
        const slotId = selectedSlot?.slotId;
        const currentSlotId = selectedPatient?.slotId || selectedPatient?.timeSlotId || selectedPatient?.scheduleSlotId;
        const rawTime = editAppointmentFormData?.time || selectedSlot?.value || selectedSlot?.label;
        let time24 = rawTime;
        if (typeof rawTime === "string") {
          const ampm = rawTime.match(/^(\d{1,2}):(\d{2})\s*([AP]M)$/i);
          if (ampm) {
            let h = parseInt(ampm[1], 10);
            const m = ampm[2];
            const ap = ampm[3].toUpperCase();
            if (ap === "PM" && h < 12) h += 12;
            if (ap === "AM" && h === 12) h = 0;
            time24 = `${String(h).padStart(2, "0")}:${m}`;
          } else if (rawTime.length > 5) {
            time24 = rawTime.slice(0, 5);
          }
        }
        const time24WithSeconds = typeof time24 === "string" && time24.length === 5 ? `${time24}:00` : time24;
        const symptomIds = Array.isArray(editAppointmentFormData.symptoms)
          ? editAppointmentFormData.symptoms
              .map((s) => (typeof s === "object" ? s.value : s))
              .map((v) => (typeof v === "string" ? parseInt(v, 10) : v))
              .filter((v) => Number.isFinite(v))
          : [];
        if (!effectiveDoctorId) {
          toast.error("Missing doctorId");
          return;
        }
        if (!visitReasonId) {
          toast.error("Please select a reason for visit");
          return;
        }
        if (!slotId) {
          toast.error("Please select a valid time slot");
          return;
        }
        const sameDate = toYMD(editAppointmentFormData?.date) === toYMD(selectedPatient?.appointmentDate || selectedPatient?.date);
        if (slotId && currentSlotId && slotId === currentSlotId && sameDate) {
          toast.info("No changes to update");
          closeModal("editPatient");
          return;
        }
        if (!editAppointmentFormData?.date) {
          toast.error("Please select a date");
          return;
        }
        const body = {
          patientId: selectedPatient?.paId,
          doctorId: effectiveDoctorId,
          visitReasonId,
          appointmentDate: toYMD(editAppointmentFormData.date),
          slotId,
          symptomIds,
        };
        const res = await updateOpdAppointmentById(id, body);
        toast.success("Appointment updated successfully!");
        closeModal("editPatient");
        fetchAllPatients();
      } catch (error) {
        const serverMsg = error?.response?.data?.message || error?.message;
        toast.error(serverMsg || "Failed to update appointment.");
      }
    };

    useEffect(() => {
      const fetchGenders = async () => {
        try {
          const response = await getGenders();
          const genders = response.data.map((gender) => ({
            value: gender.id,
            label: gender.name,
          }));
          setGenderOptions(genders);
        } catch (error) {
          toast.error("Failed to fetch genders");
        }
      };
      fetchGenders();
    }, []);

    useEffect(() => {
      const fetchSymptoms = async () => {
        try {
          const response = await getAllSymptoms();
          const symptoms = (response.data || [])
            .map((symptom) => {
              const rawId = symptom?.id ?? symptom?.symptomId ?? symptom?.symptomID;
              const idNum = typeof rawId === "string" ? parseInt(rawId, 10) : rawId;
              const label = symptom?.name ?? symptom?.symptom ?? String(rawId ?? "");
              if (!Number.isFinite(idNum)) return null;
              return { value: idNum, label };
            })
            .filter(Boolean);
          setSymptomsOptions(symptoms);
        } catch (error) {
          toast.error("Failed to fetch symptoms");
        }
      };
      fetchSymptoms();
    }, []);

    useEffect(() => {
      const fetchVisitReasons = async () => {
        try {
          const response = await getVisitReasons();
          const reasons = (response.data || []).map((r) => ({
            value: r.id,
            label: r.reasonName,
          }));
          setVisitReasonsOptions(reasons);
        } catch (error) {
          toast.error("Failed to fetch visit reasons");
        }
      };
      fetchVisitReasons();
    }, []);

    useImperativeHandle(ref, () => ({
      openAddPatientModal: () => {
        openModal("addPatient");
      },
      openScheduleConsultationModal: () => {
        openModal("appointment");
      },
    }));

    const fetchAllPatients = async () => {
      setLoading(true);
      try {
        const { data } = await getOpdAppointmentsByDoctor(effectiveDoctorId);
        const rows = (data || []).map((a) => ({
          id: a.id,
          sequentialId: a.appointmentUid,
          paId: a.patientId,
          name:
            a.patientName ||
            `${a.firstName || ""} ${a.middleName || ""} ${a.lastName || ""}`
              .replace(/\s+/g, " ")
              .trim(),
          appointmentDate: a.appointmentDate,
          appointmentTime: a.slotTime,
          diagnosis: Array.isArray(a.symptomNames) ? a.symptomNames.join(", ") : a.symptomNames || "-",
          email: a.patientEmailId,
          phone: a.patientPhoneNumbe,
          gender: a.gender,
          dob: a.dob,
          bloodGroup: a.bloodGroup,
          ...a,
        }));
        setPatients(rows.slice().reverse());
      } catch (error) {
        toast.error("Failed to load OPD appointments");
        setPatients([]);
      } finally {
        setLoading(false);
      }
    };

    const openModal = (modalName) => {
      setModals((prev) => ({ ...prev, [modalName]: true }));
    };

    const closeModal = (modalName) => {
      setModals((prev) => ({ ...prev, [modalName]: false }));
      if (modalName === "appointment") {
        setAppointmentFormData({ date: getCurrentDate(), time: "" });
        setAppointmentStep(1);
        setTimeSlotOptions([]);
      }
      if (modalName === "editPatient") {
        setSelectedPatient(null);
        setEditAppointmentFormData({ date: getCurrentDate(), time: "" });
        setEditStep(1);
      }
    };

    const toTimeLabel = (timeStr) => {
      if (!timeStr) return "";
      const parts = timeStr.split(":");
      const hh = parseInt(parts[0], 10);
      const mm = parts[1] || "00";
      const ampm = hh >= 12 ? "PM" : "AM";
      const h12 = hh % 12 === 0 ? 12 : hh % 12;
      return `${String(h12).padStart(2, "0")}:${mm} ${ampm}`;
    };

    const toYMD = (d) => {
      if (!d) return "";
      if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
      const dmY = d.match(/^(\d{2})[-\/](\d{2})[-\/](\d{4})$/);
      if (dmY) {
        const dd = dmY[1];
        const mm = dmY[2];
        const yyyy = dmY[3];
        return `${yyyy}-${mm}-${dd}`;
      }
      const dt = new Date(d);
      if (isNaN(dt)) return d;
      const y = dt.getFullYear();
      const m = String(dt.getMonth() + 1).padStart(2, "0");
      const day = String(dt.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };

    const fetchAvailabilitySlots = async (dateStr) => {
      try {
        const apiDate = toYMD(dateStr);
        const res = await getDoctorAvailabilityByDate(effectiveDoctorId, apiDate);
        const data = res?.data;
        console.log("[OPD] Availability response", { apiDate, raw: res, data });
        const gen = Array.isArray(data?.generatedSlots)
          ? data.generatedSlots
          : Array.isArray(data?.data?.generatedSlots)
          ? data.data.generatedSlots
          : null;
        if (Array.isArray(gen)) {
          const normalize = (d) => {
            if (Array.isArray(d) && d.length >= 3) {
              const y = String(d[0]);
              const m = String(d[1]).padStart(2, "0");
              const day = String(d[2]).padStart(2, "0");
              return `${y}-${m}-${day}`;
            }
            return typeof d === "string" ? toYMD(d) : "";
          };
          const exactGen = gen.find((g) => normalize(g?.date) === apiDate);
          const dayGen = exactGen || gen[0] || null;
          const slots = Array.isArray(dayGen?.slots) ? dayGen.slots : [];
          const options = slots
            .map((s, i) => {
              if (typeof s === "string") {
                const value = s.length === 5 ? s : s.slice(0, 5);
                return { value, label: toTimeLabel(value), slotId: i + 1 };
              }
              if (s && typeof s === "object") {
                const raw = s.value || s.time || s.startTime || "";
                const value = typeof raw === "string" ? (raw.length === 5 ? raw : raw.slice(0, 5)) : "";
                return value ? { value, label: toTimeLabel(value), slotId: s.slotId ?? s.id ?? i + 1 } : null;
              }
              return null;
            })
            .filter(Boolean);
          setTimeSlotOptions(options);
          return;
        }
        const availability = Array.isArray(data?.availability)
          ? data.availability
          : Array.isArray(data?.data?.availability)
          ? data.data.availability
          : null;
        if (Array.isArray(availability)) {
          const exact = availability.find((a) => a?.date === apiDate);
          const day = exact || availability[0] || null;
          const times = Array.isArray(day?.times) ? day.times : [];
          const options = times.map((t, i) => ({ value: String(t.time || ""), label: String(t.time || ""), slotId: t.slotId ?? t.id ?? i + 1 }));
          setTimeSlotOptions(options);
          return;
        }
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.slots)
          ? data.slots
          : Array.isArray(data?.data?.slots)
          ? data.data.slots
          : [];
        const options = list
          .map((s, i) => {
            if (typeof s === "string") {
              const value = s.length === 5 ? s : s.slice(0, 5);
              return { value, label: toTimeLabel(value), slotId: i + 1 };
            }
            if (s && typeof s === "object") {
              const raw = s.value || s.time || s.startTime || "";
              const value = typeof raw === "string" ? (raw.length === 5 ? raw : raw.slice(0, 5)) : "";
              return value ? { value, label: toTimeLabel(value), slotId: s.slotId ?? s.id ?? i + 1 } : null;
            }
            return null;
          })
          .filter(Boolean);
        setTimeSlotOptions(options);
      } catch (e) {
        setTimeSlotOptions([]);
      }
    };

    useEffect(() => {
      if (!effectiveDoctorId) return;
      fetchAllPatients();
    }, [effectiveDoctorId]);

    useEffect(() => {
      const date = appointmentFormData?.date;
      if (!effectiveDoctorId || !date) return;
      fetchAvailabilitySlots(date);
      setAppointmentFormData((prev) => ({ ...prev, time: "" }));
    }, [effectiveDoctorId, appointmentFormData?.date]);

    useEffect(() => {
      if (modals.appointment && appointmentStep === 2) {
        const date = toYMD(appointmentFormData?.date);
        if (date) fetchAvailabilitySlots(date);
      }
    }, [modals.appointment, appointmentStep]);

    useEffect(() => {
      const date = editAppointmentFormData?.date;
      if (date) {
        fetchAvailabilitySlots(date);
        setEditAppointmentFormData((prev) => ({ ...prev, time: "" }));
      }
    }, [editAppointmentFormData?.date]);

    useEffect(() => {
      if (modals.editPatient && editStep === 2) {
        const date = toYMD(editAppointmentFormData?.date);
        if (date) fetchAvailabilitySlots(date);
      }
    }, [modals.editPatient, editStep]);

    useEffect(() => {
      if (!modals.editPatient || !selectedPatient) return;
      const ymd = toYMD(selectedPatient.appointmentDate || selectedPatient.date || getCurrentDate());
      const time = selectedPatient.appointmentTime || selectedPatient.time || "";
      let reasonOption = visitReasonsOptions.find((o) => String(o.value) === String(selectedPatient.reasonId || selectedPatient.visitReasonId));
      if (!reasonOption) {
        const reasonName = selectedPatient.visitReasonName || selectedPatient.reasonName || selectedPatient.reason;
        if (reasonName) {
          reasonOption = visitReasonsOptions.find((o) => String(o.label).toLowerCase() === String(reasonName).toLowerCase());
        }
      }
      let symptomIds = [];
      if (Array.isArray(selectedPatient.symptomIds)) {
        symptomIds = selectedPatient.symptomIds;
      } else if (Array.isArray(selectedPatient.symptoms)) {
        symptomIds = selectedPatient.symptoms
          .map((s) => (typeof s === "object" ? s.value : s))
          .map((v) => (typeof v === "string" ? parseInt(v, 10) : v))
          .filter((v) => Number.isFinite(v));
      } else if (typeof selectedPatient.symptomNames === "string" && symptomsOptions.length) {
        const names = selectedPatient.symptomNames.split(",").map((n) => n.trim()).filter(Boolean);
        const mapped = symptomsOptions.filter((opt) => names.some((nm) => nm.toLowerCase() === String(opt.label).toLowerCase()));
        symptomIds = mapped.map((m) => m.value);
      }
      const symptomOptions = symptomsOptions.filter((opt) => symptomIds.some((id) => String(id) === String(opt.value)));
      setEditAppointmentFormData((prev) => ({
        ...prev,
        date: ymd,
        time,
        reason: reasonOption?.value ?? selectedPatient.reasonId ?? "",
        symptoms: symptomOptions.length ? symptomOptions.map((o) => o.value) : Array.isArray(prev.symptoms) ? prev.symptoms.map((s) => (typeof s === "object" ? s.value : s)) : [],
      }));
    }, [modals.editPatient, selectedPatient, symptomsOptions, visitReasonsOptions]);

    const handleAppointmentNext = async () => {
      const selDate = appointmentFormData?.date;
      if (selDate) await fetchAvailabilitySlots(selDate);
      setAppointmentStep(2);
    };

    const handleAppointmentSchedule = async () => {
      if (!appointmentFormData?.time) {
        toast.error("Please select a time slot");
        return;
      }
      try {
        const patientId = 1;
        const visitReasonId =
          appointmentFormData?.reason && typeof appointmentFormData.reason === "object"
            ? appointmentFormData.reason.value
            : appointmentFormData?.reason;
        const selectedSlot = timeSlotOptions.find((o) => o.value === appointmentFormData.time);
        const slotId = selectedSlot?.slotId;
        const rawTime = appointmentFormData?.time || selectedSlot?.value || selectedSlot?.label;
        let time24 = rawTime;
        if (typeof rawTime === "string") {
          const ampm = rawTime.match(/^(\d{1,2}):(\d{2})\s*([AP]M)$/i);
          if (ampm) {
            let h = parseInt(ampm[1], 10);
            const m = ampm[2];
            const ap = ampm[3].toUpperCase();
            if (ap === "PM" && h < 12) h += 12;
            if (ap === "AM" && h === 12) h = 0;
            time24 = `${String(h).padStart(2, "0")}:${m}`;
          } else if (rawTime.length > 5) {
            time24 = rawTime.slice(0, 5);
          }
        }
        const time24WithSeconds = typeof time24 === "string" && time24.length === 5 ? `${time24}:00` : time24;
        const symptomIds = Array.isArray(appointmentFormData.symptoms)
          ? appointmentFormData.symptoms
              .map((s) => (typeof s === "object" ? s.value : s))
              .map((v) => (typeof v === "string" ? parseInt(v, 10) : v))
              .filter((v) => Number.isFinite(v))
          : [];
        const body = {
          patientId,
          doctorId: effectiveDoctorId,
          visitReasonId,
          appointmentDate: appointmentFormData.date,
          slotId,
          symptomIds,
          appointmentTime: time24WithSeconds,
          time: time24WithSeconds,
        };
        if (!effectiveDoctorId) {
          toast.error("Missing doctorId");
          return;
        }
        if (!visitReasonId) {
          toast.error("Please select a reason for visit");
          return;
        }
        if (!slotId) {
          toast.error("Please select a valid time slot");
          return;
        }
        if (!symptomIds.length) {
          toast.error("Please select at least one symptom");
          return;
        }
        const res = await createOpdAppointment(body);
        setNewPatientId(patientId);
        toast.success("Appointment scheduled successfully!");
        closeModal("appointment");
        fetchAllPatients();
      } catch (error) {
        const serverMsg = error?.response?.data?.message || error?.message;
        toast.error(serverMsg || "Failed to schedule appointment.");
      }
    };

    const handleViewPatient = (patient) => {
      setSelectedPatient(patient);
      openModal("viewPatient");
    };

    const handleEditPatient = (patient) => {
      setSelectedPatient(patient);
      closeModal("viewPatient");
      openModal("editPatient");
    };

    const handlePatientVerificationConfirm = (patientData) => {
      toast.success(`Patient verified: ${patientData.fullName}`);
      closeModal("addPatient");
      openModal("appointment");
    };

    const columns = [
      {
        header: "Appointment ID",
        accessor: "sequentialId",
        clickable: true,
        cell: (row) => (
          <button className="cursor-pointer text-[var(--primary-color)] hover:text-[var(--accent-color)]" onClick={() => handleViewPatient(row)}>
            {row.appointmentUid}
          </button>
        ),
      },
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
       {
    header: "Actions",
    cell: (row) => (
      <div className="flex items-center gap-2">
        <button
          title="View Medical Record"
          onClick={() => handleSelected(row)}
          className="p-1 text-base text-[var(--primary-color)]"
          style={{ display: "flex", alignItems: "center" }}
        >
          <FiExternalLink />
        </button>
        <button
          title="Billing/Payment"
          onClick={() => handleBilling(row)}
          className="p-1 text-base text-[var(--primary-color)]"
          style={{ display: "flex", alignItems: "center" }}
        >
      <MdCurrencyRupee size={18}/>
        </button>
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
      if ((effectiveDoctorId || doctorName) && !masterData.loading) fetchAllPatients();
    }, [effectiveDoctorId, doctorName, masterData.loading]);

    useEffect(() => {
      const highlightIdFromState = location.state?.highlightId;
      if (highlightIdFromState) setNewPatientId(highlightIdFromState);
    }, [location.state]);

    const tabActionsToUse = tabActions.length ? tabActions : childTabActions;
    const mapOpdViewData = (p) => ({
      appointmentId: p.appointmentId || p.sequentialId || p.id || "N/A",
      name:
        p.name ||
        `${p.firstName || ""} ${p.middleName || ""} ${p.lastName || ""}`
          .replace(/\s+/g, " ")
          .trim() ||
        "N/A",
      email: p.email || p.patientEmail || "N/A",
      phone: p.phone || p.mobileNo || p.patientPhoneNumber || "N/A",
      consultationType: p.consultationType || p.consultationTypeName || "OPD",
      date: p.appointmentDate || p.date || p.scheduledDate || "N/A",
      time: p.appointmentTime || p.time || p.scheduledTime || "N/A",
      diagnosis: p.diagnosis || p.chiefComplaint || "N/A",
      reasonOfVisit: p.reasonOfVisit || p.visitReasonName || (p.visitReason && p.visitReason.name) || p.reason || "N/A",
    });

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
          rowClassName={(row) =>
            row.paId === newPatientId || row.sequentialId === location.state?.highlightId
              ? "font-semibold bg-yellow-100 hover:bg-yellow-200 transition-colors duration-150"
              : ""
          }
        />
        <ReusableModal
          isOpen={modals.viewPatient}
          onClose={() => closeModal("viewPatient")}
          mode="viewProfile"
          title="Patient Appointment Info"
          data={selectedPatient ? mapOpdViewData(selectedPatient) : {}}
          viewFields={OPD_APPOINTMENT_VIEW_FIELDS}
          size="md"
          extraContent={
            selectedPatient ? (
              <div className="space-y-6">
                <div className="flex justify-end">
                  <button onClick={() => handleEditPatient(selectedPatient)} className="view-btn">
                    Edit
                  </button>
                </div>
              </div>
            ) : null
          }
        />
        <PatientVerificationModal
          isOpen={modals.addPatient}
          onClose={() => closeModal("addPatient")}
          onConfirm={handlePatientVerificationConfirm}
        />
        <ReusableModal
          isOpen={modals.appointment}
          onClose={() => closeModal("appointment")}
          onSave={appointmentStep === 1 ? handleAppointmentNext : handleAppointmentSchedule}
          onCancel={appointmentStep === 1 ? () => closeModal("appointment") : () => setAppointmentStep(1)}
          mode="add"
          title="Schedule Appointment"
          preventCloseOnSave={appointmentStep === 1}
          showSuccessToast={false}
          fields={
            appointmentStep === 1
              ? [
                  { name: "date", label: "Appointment Date", type: "date", required: true },
                  { name: "symptoms", label: "Symptoms", type: "multiselect", required: true, options: symptomsOptions },
                  { name: "reason", label: "Reason for Visit", type: "select", required: true, options: visitReasonsOptions },
                ]
              : []
          }
          data={appointmentFormData}
          onChange={setAppointmentFormData}
          saveLabel={appointmentStep === 1 ? "Next" : "Schedule"}
          cancelLabel={appointmentStep === 1 ? "Cancel" : "Back"}
          size="md"
          extraContent={
            <div className="space-y-4 mb-4">
              {appointmentStep === 2 && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                      <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      Available Time Slots
                    </div>
                  </div>
                  {timeSlotOptions.length === 0 ? (
                    <p className="text-sm text-gray-600">No available slots for this date</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {timeSlotOptions.map((opt) => {
                        const selected = appointmentFormData?.time === opt.value;
                        return (
                          <button
                            type="button"
                            key={opt.value}
                            onClick={() => setAppointmentFormData((p) => ({ ...p, time: opt.value }))}
                            className={
                              `px-3 py-2 text-sm rounded-lg border transition ` +
                              (selected
                                ? "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm"
                                : "bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200")
                            }
                          >
                            <span className="inline-flex items-center gap-2">
                              <span>{opt.label}</span>
                              {selected && <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          }
        />
        <ReusableModal
          isOpen={modals.editPatient}
          onClose={() => closeModal("editPatient")}
          mode="edit"
          title={editStep === 1 ? "Edit Appointment" : "Select Time Slot"}
          preventCloseOnSave={editStep === 1}
          fields={
            editStep === 1
              ? [
                  { name: "date", label: "Appointment Date", type: "date", required: true },
                  { name: "symptoms", label: "Symptoms", type: "multiselect", required: true, options: symptomsOptions },
                  { name: "reason", label: "Reason for Visit", type: "select", required: true, options: visitReasonsOptions },
                ]
              : []
          }
          data={editAppointmentFormData}
          onSave={() => {
            if (editStep === 1) {
              const selDate = editAppointmentFormData?.date;
              if (selDate) {
                fetchAvailabilitySlots(selDate);
              }
              setEditStep(2);
            } else {
              handleEditAppointmentSave();
            }
          }}
          onCancel={editStep === 1 ? () => closeModal("editPatient") : () => setEditStep(1)}
          onChange={(d) => {
            const normalized = { ...d };
            if (normalized.reason && typeof normalized.reason === "object") {
              normalized.reason = normalized.reason.value;
            }
            if (Array.isArray(normalized.symptoms)) {
              normalized.symptoms = normalized.symptoms.map((s) => (typeof s === "object" ? s.value : s));
            }
            setEditAppointmentFormData(normalized);
          }}
          saveLabel={editStep === 1 ? "Next" : "Save"}
          cancelLabel={editStep === 1 ? "Cancel" : "Back"}
          size="md"
          extraContent={
            editStep === 2 ? (
              <div className="space-y-4 mb-4">
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                      <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      Available Time Slots
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {timeSlotOptions.map((opt) => {
                      const selected = editAppointmentFormData?.time === opt.value;
                      return (
                        <button
                          type="button"
                          key={opt.value}
                          onClick={() => setEditAppointmentFormData((p) => ({ ...p, time: opt.value }))}
                          className={
                            `px-3 py-2 text-sm rounded-lg border transition ` +
                            (selected
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm"
                              : "bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200")
                          }
                        >
                          <span className="inline-flex items-center gap-2">
                            <span>{opt.label}</span>
                            {selected && <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : null
          }
        />
      </>
    );
  }
);

export default OpdTab;
