import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { FaNotesMedical, FaUpload } from "react-icons/fa";
import { FiExternalLink } from "react-icons/fi";
import DynamicTable from "../../../../components/microcomponents/DynamicTable";
import ReusableModal from "../../../../components/microcomponents/Modal";
import TeleConsultFlow from "../../../../components/microcomponents/Call";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../../../../context-api/authSlice";
import { getPatientById, updatePatient, getGenders, getAllSymptoms, getVisitReasons, getDoctorAvailabilityByDate, createOpdAppointment, getOpdAppointmentsByDoctor, updateOpdAppointmentById } from "../../../../utils/masterService";
import axiosInstance from "../../../../utils/axiosInstance";
import PatientVerificationSteps from "../../../../components/Profile"; // Import the new component
import { usePatientContext } from "../../../../context-api/PatientContext";

const getCurrentDate = () => new Date().toISOString().slice(0, 10);
const getCurrentTime = () => new Date().toTimeString().slice(0, 5);
const OPD_APPOINTMENT_VIEW_FIELDS = [
  { key: "appointmentId", label: "Appointment ID" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
 { key: "name", label: "Patient Name", titleKey: true, initialsKey: true },
  { key: "consultationType", label: "Consultation Type" },
  { key: "date", label: "Date" },
  { key: "time", label: "Time" },
  { key: "diagnosis", label: "Diagnosis" },
  { key: "reasonOfVisit", label: "Reason of Visit" },
];

// Fields for viewing appointment info (OPD)

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
          <PatientVerificationSteps
            onConfirm={onConfirm}
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
   console.log("Doctor ID:", authDoctorId);
    const effectiveDoctorName = doctorName || authDoctorName;
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState({});
    const [newPatientId, setNewPatientId] = useState(null);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [modals, setModals] = useState({ addPatient: false, appointment: false, viewPatient: false, editPatient: false });
    const [formData, setFormData] = useState({ cityOptions: [] });
    const [appointmentFormData, setAppointmentFormData] = useState({ date: getCurrentDate(), time: getCurrentTime() });
    const [editAppointmentFormData, setEditAppointmentFormData] = useState({ date: getCurrentDate(), time: "" });
    const [personalHealthDetails, setPersonalHealthDetails] = useState(null);
    const [familyHistory, setFamilyHistory] = useState([]);
    const [vitalSigns, setVitalSigns] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [genderOptions, setGenderOptions] = useState([]);
    const [symptomsOptions, setSymptomsOptions] = useState([]);
    const [visitReasonsOptions, setVisitReasonsOptions] = useState([]);
    const [appointmentStep, setAppointmentStep] = useState(1);
    const [editStep, setEditStep] = useState(1);
    const [timeSlotOptions, setTimeSlotOptions] = useState([]);
    const { setPatient } = usePatientContext();

    const handleSelected = (r) => {
      try {
        console.log("[OPD] navigating with patient", { state: { patient: r } });
        localStorage.setItem("selectedThisPatient", JSON.stringify(r));
        setPatient(r);
        navigate("/doctordashboard/medical-record", { state: { patient: r } });
      } catch (error) {
        console.error("[OPD] Error saving patient:", error);
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
        // No-op if nothing changed
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
        console.log("[Edit Appointment] API request:", body);
        const res = await updateOpdAppointmentById(id, body);
        console.log("[Edit Appointment] API response:", res?.status, res?.data);
        toast.success("Appointment updated successfully!");
        closeModal("editPatient");
        fetchAllPatients();
      } catch (error) {
        const serverMsg = error?.response?.data?.message || error?.message;
        console.error("[Edit Appointment] Error updating:", serverMsg, error?.response?.data);
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
          console.error("Error fetching genders:", error);
          toast.error("Failed to fetch genders");
        }
      };
      fetchGenders();
    }, []);
// Log on mount and whenever it changes
useEffect(() => {
  console.log("OPDTab mounted/doctorId changed -> doctorId:", authDoctorId);
  console.log("Auth name:", authDoctorName);
}, [authDoctorId, authDoctorName]);

// Log once on first mount to confirm component renders
useEffect(() => {
  console.log("OPDTab mounted");
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
          console.error("Error fetching symptoms:", error);
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
          console.error("Error fetching visit reasons:", error);
          toast.error("Failed to fetch visit reasons");
          setVisitReasonsOptions([]);
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
        const { data } = await getOpdAppointmentsByDoctor(effectiveDoctorId);
        console.log("[OPD] Fetched OPD appointments:", data);
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
          diagnosis: a.symptomNames || "-",
          email: a.patientEmailId,
          phone: a.patientPhoneNumbe,
          gender: a.gender,
          dob: a.dob,
          bloodGroup: a.bloodGroup,
          ...a,
        }));
        // Show newest appointments first (API usually returns oldest-first)
        setPatients(rows.slice().reverse());
      } catch (error) {
        console.error("Failed to load OPD appointments:", error);
        toast.error("Failed to load OPD appointments");
        setPatients([]);
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

    const derivePatientId = () => {
      const pid = selectedPatient?.id || selectedPatient?.patientId || newPatientId;
      return typeof pid === "string" ? parseInt(pid, 10) : pid;
    };

    const openModal = (modalName) => {
      setModals((prev) => ({ ...prev, [modalName]: true }));
      if (modalName === "addPatient") {
        setFormData({
          cityOptions: [],
        });
      }
      if (modalName === "appointment") {
        const pid = derivePatientId();
        setAppointmentFormData((p) => ({ ...p, patientId: pid || p?.patientId || "" }));
      }
    };

    const closeModal = (modalName) => {
      setModals((prev) => ({ ...prev, [modalName]: false }));
      if (modalName === "addPatient") setFormData({ cityOptions: [] });
      if (modalName === "appointment") {
        setAppointmentFormData({ date: getCurrentDate(), time: "" });
        setAppointmentStep(1);
        setTimeSlotOptions([]);
      }
      if (modalName === "editPatient") {
        setSelectedPatient(null);
        setPersonalHealthDetails(null);
        setFamilyHistory([]);
        setVitalSigns(null);
        setDetailsLoading(false);
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
      if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d; // already YYYY-MM-DD
      // Handle DD-MM-YYYY or DD/MM/YYYY
      const dmY = d.match(/^(\d{2})[-\/](\d{2})[-\/](\d{4})$/);
      if (dmY) {
        const dd = dmY[1];
        const mm = dmY[2];
        const yyyy = dmY[3];
        return `${yyyy}-${mm}-${dd}`;
      }
      // Fallback: try Date parsing
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
        console.log("this is slots",res.data)
        const data = res?.data;
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
          if (!exactGen && dayGen?.date) {
            const newDate = normalize(dayGen.date);
            if (newDate) setAppointmentFormData((p) => ({ ...p, date: newDate, time: "" }));
          }
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
          if (!exact && day?.date) {
            setAppointmentFormData((p) => ({ ...p, date: day.date, time: "" }));
          }
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
        console.error("Error fetching availability:", e);
        setTimeSlotOptions([]);
      }
    };

    useEffect(() => {
      if (!effectiveDoctorId) return;
      fetchAllPatients();
    }, [effectiveDoctorId]);

    useEffect(() => {
      const date = appointmentFormData?.date;
      fetchAvailabilitySlots(date);
      setAppointmentFormData((prev) => ({ ...prev, time: "" }));
    }, [appointmentFormData?.date]);

    // Ensure slots are fetched when moving to step 2 in Schedule modal
    useEffect(() => {
      if (modals.appointment && appointmentStep === 2) {
        const date = toYMD(appointmentFormData?.date);
        if (date) fetchAvailabilitySlots(date);
      }
    }, [modals.appointment, appointmentStep]);

    // Fetch slots when edit date changes
    useEffect(() => {
      const date = editAppointmentFormData?.date;
      if (date) {
        fetchAvailabilitySlots(date);
        setEditAppointmentFormData((prev) => ({ ...prev, time: "" }));
      }
    }, [editAppointmentFormData?.date]);

    // Ensure slots are fetched when moving to step 2 in Edit modal
    useEffect(() => {
      if (modals.editPatient && editStep === 2) {
        const date = toYMD(editAppointmentFormData?.date);
        if (date) fetchAvailabilitySlots(date);
      }
    }, [modals.editPatient, editStep]);

    // Prefill edit modal values once options and selected patient are available
    useEffect(() => {
      if (!modals.editPatient || !selectedPatient) return;
      const ymd = toYMD(selectedPatient.appointmentDate || selectedPatient.date || getCurrentDate());
      const time = selectedPatient.appointmentTime || selectedPatient.time || "";

      // Reason mapping
      const rawReasonId =
        (typeof selectedPatient.reason === "object" ? selectedPatient.reason?.value : selectedPatient.reason) ||
        selectedPatient.visitReasonId ||
        selectedPatient.reasonId;
      let reasonOption = visitReasonsOptions.find((o) => String(o.value) === String(rawReasonId));
      if (!reasonOption) {
        const reasonName = selectedPatient.visitReasonName || selectedPatient.reasonName || selectedPatient.reason;
        if (reasonName) {
          reasonOption = visitReasonsOptions.find((o) => String(o.label).toLowerCase() === String(reasonName).toLowerCase());
        }
      }

      // Symptoms mapping
      let symptomIds = [];
      if (Array.isArray(selectedPatient.symptomIds)) {
        symptomIds = selectedPatient.symptomIds;
      } else if (Array.isArray(selectedPatient.symptoms)) {
        // could be array of ids or array of names/objects
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
        // store primitive id for reason
        reason: reasonOption?.value ?? rawReasonId ?? "",
        // store array of primitive ids for multiselect
        symptoms: symptomOptions.length ? symptomOptions.map((o) => o.value) : Array.isArray(prev.symptoms) ? prev.symptoms.map((s) => (typeof s === "object" ? s.value : s)) : [],
      }));
    }, [modals.editPatient, selectedPatient, symptomsOptions, visitReasonsOptions]);

    const handleAppointmentNext = async () => {
      console.log("[Appointment] Next clicked", { step: appointmentStep, data: appointmentFormData });
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
        console.log("[Appointment] Proceed to schedule with:", appointmentFormData);
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
        console.log("[Appointment] Using time (HH:mm:ss):", time24WithSeconds, "from", appointmentFormData.time);
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
        console.log("[Appointment] API response:", res?.status, res?.data);
        // Highlight the newly scheduled appointment's patient rows
        setNewPatientId(patientId);
        toast.success("Appointment scheduled successfully!");
        closeModal("appointment");
        fetchAllPatients();
      } catch (error) {
        const serverMsg = error?.response?.data?.message || error?.message;
        console.error("[Appointment] Error scheduling appointment (inline):", serverMsg, error?.response?.data);
        toast.error(serverMsg || "Failed to schedule appointment.");
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
      const newErrors = { ...errors };
      Object.keys(data).forEach((key) => {
        if (newErrors[key]) delete newErrors[key];
      });
      setErrors(newErrors);
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
        Object.entries(formData).forEach(([key, value]) => {
          if (key === "dob" && Array.isArray(value)) {
            payload.append(key, value.join("-"));
          } else if (key === "photo" && value instanceof File) {
            payload.append(key, value);
          } else if (value !== undefined && value !== null) {
            payload.append(key, value);
          }
        });
        if (formData.gender?.value) {
          payload.append("genderId", formData.gender.value);
        }
        if (formData.pincode) {
          payload.append("pinCode", formData.pincode);
        }
        payload.append("userType", "patient");
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
        const createdId = response?.payload?.patientId || response?.payload?.id || response?.payload?.data?.patientId;
        console.log("[Register] Created patientId:", createdId, "payload:", response?.payload);
        if (createdId) setNewPatientId(createdId);
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
        console.log("[Appointment] handleScheduleAppointment called", formData);
        const patientId = selectedPatient?.id || selectedPatient?.patientId || newPatientId || formData?.id || formData?.patientId || appointmentFormData?.patientId;
        if (!patientId) {
          toast.error("Missing patientId");
          return;
        }
        if (!effectiveDoctorId) {
          toast.error("Missing doctorId");
          return;
        }
        const visitReasonId =
          formData?.reason && typeof formData.reason === "object"
            ? formData.reason.value
            : formData?.reason;
        const selectedSlot = timeSlotOptions.find((o) => o.value === formData.time);
        const slotId = selectedSlot?.slotId;
        const symptomIds = Array.isArray(formData.symptoms)
          ? formData.symptoms
              .map((s) => (typeof s === "object" ? s.value : s))
              .map((v) => (typeof v === "string" ? parseInt(v, 10) : v))
              .filter((v) => Number.isFinite(v))
          : [];
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
        const body = {
          patientId,
          doctorId: effectiveDoctorId,
          visitReasonId,
          appointmentDate: formData.date,
          slotId,
          symptomIds,
        };
        console.log("[Appointment] POST body:", body);
        const response = await createOpdAppointment(body);
        console.log("[Appointment] API response::::::::::::::::::::::::::::::", response?.data);
        // Highlight the newly scheduled appointment's patient rows
        setNewPatientId(patientId);
        if (!response?.data?.success) throw new Error("Failed to schedule appointment");
        toast.success("Appointment scheduled successfully!");
        closeModal("appointment");
        fetchAllPatients();
      } catch (error) {
        console.error("[Appointment] Error scheduling appointment:", error);
        toast.error("Failed to schedule appointment.");
      }
    };

    const handleAddRecord = (patient) => navigate("/doctordashboard/form", { state: { patient } });

    const handlePatientVerificationConfirm = (patientData) => {
      // Here, you can pre-fill the form or proceed to the next step
      // For now, just log and close the modal
      console.log("Verified patient:", patientData);
      toast.success(`Patient verified: ${patientData.fullName}`);
      closeModal("addPatient");
      openModal("appointment");
    };

    const columns = [
      { header: "Appointment ID", accessor: "sequentialId",   clickable: true, 
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
      { header: "Diagnosis", accessor: "diagnosis" },
      {
        header: "Actions",
        cell: (row) => (
          <div className="flex items-center gap-2">
           
            <button title="View Medical Record" 
            onClick={() => handleSelected(row)}
             className="p-1 text-base text-[var(--primary-color)]" style={{ display: "flex", alignItems: "center" }}><FiExternalLink /></button>
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
                  <button
                    onClick={() => handleEditPatient(selectedPatient)}
                     className="view-btn"
                  >
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
          onCancel={
            appointmentStep === 1
              ? () => closeModal("appointment")
              : () => setAppointmentStep(1)
          }
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
                </div>
              )}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-sm font-semibold text-blue-800 mb-2">Patient Information</h4>
                <p className="text-sm text-blue-700">{formData.firstName} {formData.middleName} {formData.lastName}</p>
                <p className="text-xs text-blue-600">{formData.email}</p>
              </div>
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
          onSave={() => (editStep === 1 ? setEditStep(2) : handleEditAppointmentSave())}
          onChange={(d) => {
            // normalize reason to id and symptoms to id array
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
