

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaEye,
  FaEyeSlash,
  FaHeartbeat,
  FaNotesMedical,
  FaFlask,
  FaPills,
} from "react-icons/fa";
import { FiExternalLink } from "react-icons/fi";
import axios from "axios";
import TeleConsultFlow from "../../../../components/microcomponents/Call";
import DynamicTable from "../../../../components/microcomponents/DynamicTable";

const RECORD_TYPES = [
  { id: "vitals", label: "Vitals", icon: FaHeartbeat },
  { id: "clinical-notes", label: "Clinical Notes", icon: FaNotesMedical },
  { id: "lab-tests", label: "Lab Tests", icon: FaFlask },
  { id: "medications", label: "Medications", icon: FaPills },
];

function getCurrentDate() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}
function getCurrentTime() {
  const d = new Date();
  return d.toTimeString().slice(0, 5);
}

const OPT = {
  OCC: ["Doctor", "Engineer", "Teacher", "Student", "Retired"],
  GENDER: ["Female", "Male", "Other"],
  BLOOD: ["A+", "B+", "O+", "AB+"],
};

const DEPARTMENT_LIST = [
  "Cardiology",
  "Orthopaedics",
  "Gynaecology",
  "Paediatrics",
  "Dermatology",
  "ENT",
  "General Medicine",
  "General Surgery",
  "Ophthalmology",
  "Psychiatry",
  "Radiology",
  "Urology",
  "Neurology",
  "Oncology",
  "Other",
];

const DOCTOR_LIST = [
  "Dr.Sheetal S. Shelke",
  "Dr. Ajay Kumar",
  "Dr. Priya Singh",
  "Dr. Ramesh Patel",
  "Dr. Anjali Mehta",
  "Dr. John Doe",
];

const defaultForm = {
  firstName: "",
  middleName: "",
  lastName: "",
  phone: "",
  email: "",
  gender: "",
  dob: "",
  bloodGroup: "",
  addressPerm: "",
  addressTemp: "",
  password: "",
  confirmPassword: "",
  department: "",
};

const DEFAULT_DOCTOR_NAME = "Dr.Sheetal S. Shelke";

export default function PatientList() {
  const occOpt = OPT.OCC;
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const [aadhaarId, setAadhaarId] = useState("");
  const [occ, setOcc] = useState("");
  const [occList, setOccList] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [appointmentModal, setAppointmentModal] = useState(false);
  const [formData, setFormData] = useState({ ...defaultForm });
  const [appointment, setAppointment] = useState({
    date: getCurrentDate(),
    time: getCurrentTime(),
    reason: "",
    diagnosis: "",
  });
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [formErrors, setFormErrors] = useState({});
  const [appointmentErrors, setAppointmentErrors] = useState({});
  const [formTouched, setFormTouched] = useState({});
  const [clickedIds, setClickedIds] = useState([]);
  const [patients, setPatients] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterDoctor, setFilterDoctor] = useState("");

  // For patient details modal
  const [personalDetails, setPersonalDetails] = useState(null);
  const [family, setFamily] = useState([]);
  const [vitals, setVitals] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [highlightId, setHighlightId] = useState([]);
  const rowRefs = useRef({});

  // Fetch departments from API
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(
          "https://681f2dfb72e59f922ef5774c.mockapi.io/departments"
        );
        setDepartments(res.data || []);
      } catch (e) {
        setDepartments([]);
      }
    })();
  }, []);

  useEffect(() => {
    // Simulate some patients with different departments and doctors
    (async () => {
      try {
        const res = await axios.get(
          "https://681f2dfb72e59f922ef5774c.mockapi.io/addpatient"
        );
        // Add some variety for demonstration
        const demoPatients = [
          {
            id: "101",
            name: "Ravi Kumar",
            diagnosis: "Chest Pain",
            reason: "Consultation",
            datetime: "2025-07-15 10:00",
            bloodGroup: "A+",
            family: [],
            vitals: {},
            height: "170",
            weight: "70",
            email: "ravi.kumar@example.com",
            phone: "9876543210",
            department: "Cardiology",
            doctorName: "Dr. Ajay Kumar",
            status: "OPD",
            treatmentID: "T101",
          },
          {
            id: "102",
            name: "Priya Sharma",
            diagnosis: "Fracture",
            reason: "Follow-up",
            datetime: "2025-07-15 11:00",
            bloodGroup: "B+",
            family: [],
            vitals: {},
            height: "160",
            weight: "55",
            email: "priya.sharma@example.com",
            phone: "9123456789",
            department: "Orthopaedics",
            doctorName: "Dr. Ramesh Patel",
            status: "OPD",
            treatmentID: "T102",
          },
          {
            id: "103",
            name: "Anjali Mehta",
            diagnosis: "Diabetes",
            reason: "Test",
            datetime: "2025-07-15 12:00",
            bloodGroup: "O+",
            family: [],
            vitals: {},
            height: "155",
            weight: "60",
            email: "anjali.mehta@example.com",
            phone: "9988776655",
            department: "General Medicine",
            doctorName: "Dr. Anjali Mehta",
            status: "OPD",
            treatmentID: "T103",
          },
        ];
        const filteredPatients = [
          ...demoPatients,
          ...res.data
            .filter((p) => p.doctorName === DEFAULT_DOCTOR_NAME)
            .map((p, idx) => ({
              id: p.id || `200${idx}`,
              name: [p.firstName, p.middleName, p.lastName]
                .filter(Boolean)
                .join(" "),
              diagnosis: p.diagnosis,
              reason: p.reason,
              datetime: `${p.appointmentDate} ${p.appointmentTime}`,
              bloodGroup: p.bloodGroup || "",
              family: p.family || [],
              vitals: p.vitals || {},
              height: p.height,
              weight: p.weight,
              email: p.email,
              phone: p.phone,
              department: p.department || "Cardiology",
              doctorName: p.doctorName || DEFAULT_DOCTOR_NAME,
              status: "OPD",
              treatmentID: p.treatmentID || `T${p.id || idx}`,
            })),
        ].reverse();
        setPatients(filteredPatients);
      } catch (e) {
        setPatients([]);
      }
    })();
  }, []);

  useEffect(() => {
    const highlightIds = JSON.parse(
      localStorage.getItem("highlightOPDIds") || "[]"
    );
    const clicked = JSON.parse(localStorage.getItem("clickedOPDIds") || "[]");
    setHighlightId(highlightIds);
    setClickedIds(clicked);
    setTimeout(() => {
      highlightIds.forEach((id) => {
        if (!clicked.includes(id)) {
          const el = rowRefs.current[id];
          if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });
    }, 500);
  }, []);

  useEffect(() => {
    localStorage.setItem("opdPatients", JSON.stringify(patients));
  }, [patients]);

  // Filtering logic for DynamicTable
  const filteredPatients = patients.filter((p) => {
    const matchesDept =
      !filterDepartment || p.department === filterDepartment;
    const matchesDoctor =
      !filterDoctor || p.doctorName === filterDoctor;
    return matchesDept && matchesDoctor;
  });

  // DynamicTable columns
  const columns = [
    { header: "ID", accessor: "id" },
    {
      header: "Name",
      accessor: "name",
      clickable: true,
      cell: (row) => (
        <button
          className="cursor-pointer text-[var(--primary-color)] hover:text-[var(--accent-color)]"
          onClick={() => viewPatientDetails(row)}
        >
          {row.name}
        </button>
      ),
    },
    { header: "Diagnosis", accessor: "diagnosis" },
    { header: "Date & Time", accessor: "datetime" },
    { header: "Department", accessor: "department" },
    { header: "Dr Name", accessor: "doctorName" },
    {
      header: "Actions",
      accessor: "actions",
      cell: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleAddRecord(row)}
            className="edit-btn text-sm"
          >
            Visit Pad
          </button>
          <TeleConsultFlow phone={row.phone} />
          <button
        onClick={() =>
          navigate(
            `/hospitaldashboard/opd-dashboard/${row.treatmentID}`,
            {
              state: {
                ...row,
                patientName: row.name,
                phone: row.phone,
                gender: row.gender,
                address: row.addressPerm || row.address || "-",
                doctorName: row.doctorName,
                age: row.age || "-", // If available
                treatmentID: row.treatmentID,
                hospitalUID: row.hospitalUID || "",
                admissionDate: row.admissionDate || "",
                bed: row.bed || "",
                dischargeDate: row.dischargeDate || "",
              }
            }
          )
        }
        title="Go to Dashboard"
      >
        <FiExternalLink className="text-blue-600 hover:text-blue-800" />
      </button>
        </div>
      ),
    },
  ];

  // DynamicTable filters
  const filters = [
    {
      key: "department",
      label: "Department",
      options: [
        { value: "", label: "All Departments" },
        ...DEPARTMENT_LIST.map((dept) => ({
          value: dept,
          label: dept,
        })),
      ],
    },
    {
      key: "doctorName",
      label: "Doctor",
      options: [
        { value: "", label: "All Doctors" },
        ...DOCTOR_LIST.map((doc) => ({
          value: doc,
          label: doc,
        })),
      ],
    },
  ];

  // DynamicTable tab (optional, for OPD/IPD etc)
  const tabs = [
    // { label: "OPD", value: "OPD" },
    // Add more tabs if needed
  ];

  const handleAddRecord = (patient) => {
    navigate("/hospitaldashboard/form", { state: { patient } });
  };

  const SuggestInput = ({ val, setVal, list, setList, data, placeholder }) => (
    <div className="floating-input relative" data-placeholder={placeholder}>
      <input
        className="input-field peer"
        value={val}
        placeholder=" "
        onChange={(e) => {
          const v = e.target.value;
          setVal(v);
          setList(
            data.filter((o) => o.toLowerCase().includes(v.toLowerCase()))
          );
        }}
        autoComplete="off"
      />
      {list.length > 0 && (
        <ul className="absolute z-10 bg-white border w-full rounded shadow mt-1 max-h-40 overflow-y-auto">
          {list.map((item, i) => (
            <li
              key={i}
              onClick={() => {
                setVal(item);
                setList([]);
              }}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  const validateAppointment = () => {
    const errors = {};
    if (!appointment.date) errors.date = "Date is required";
    if (!appointment.time) errors.time = "Time is required";
    if (!appointment.diagnosis) errors.diagnosis = "Diagnosis is required";
    if (!appointment.reason) errors.reason = "Reason is required";
    setAppointmentErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleScheduleAppointment = async () => {
    if (!validateAppointment()) return;
    try {
      const payload = {
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        name: [formData.firstName, formData.middleName, formData.lastName]
          .filter(Boolean)
          .join(" "),
        email: formData.email,
        phone: formData.phone,
        permanentAddress: formData.addressPerm,
        temporaryAddress: formData.addressTemp,
        dob: formData.dob,
        occupation: formData.occupation,
        aadhaarId,
        appointmentDate: appointment.date,
        appointmentTime: appointment.time,
        diagnosis: appointment.diagnosis,
        reason: appointment.reason,
        doctorName: DEFAULT_DOCTOR_NAME,
        department: formData.department,
        type: "OPD",
      };
      await axios.post(
        "https://681f2dfb72e59f922ef5774c.mockapi.io/addpatient",
        payload
      );
      alert("Appointment scheduled successfully!");
      setAppointmentModal(false);
      setModalOpen(false);
      setSelectedPatient(null);
    } catch (error) {
      alert("Failed to schedule appointment.");
    }
  };

  // --- Add Patient Validation & Handlers ---
  const validateForm = (showAll = false) => {
    const errors = {};
    if (
      (showAll || formTouched.aadhaarId) &&
      (!aadhaarId || aadhaarId.length !== 12 || !/^[0-9]+$/.test(aadhaarId))
    )
      errors.aadhaarId = "Aadhaar must be 12 digits";
    if (
      (showAll || formTouched.firstName) &&
      (!formData.firstName || !/^[A-Za-z\s]+$/.test(formData.firstName))
    )
      errors.firstName = "First name is required and only letters";
    if (
      (showAll || formTouched.middleName) &&
      formData.middleName &&
      !/^[A-Za-z\s]+$/.test(formData.middleName)
    )
      errors.middleName = "Middle name must be only letters";
    if (
      (showAll || formTouched.lastName) &&
      (!formData.lastName || !/^[A-Za-z\s]+$/.test(formData.lastName))
    )
      errors.lastName = "Last name is required and only letters";
    if (
      (showAll || formTouched.phone) &&
      (!formData.phone || !/^\d{10}$/.test(formData.phone))
    )
      errors.phone = "Phone must be 10 digits";
    if (
      (showAll || formTouched.email) &&
      (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
    )
      errors.email = "Valid email is required";
    if (
      (showAll || formTouched.gender) &&
      (!formData.gender || formData.gender === "Select Gender")
    )
      errors.gender = "Gender is required";
    if ((showAll || formTouched.dob) && !formData.dob)
      errors.dob = "Date of birth is required";
    if ((showAll || formTouched.addressPerm) && !formData.addressPerm)
      errors.addressPerm = "Permanent address is required";
    if ((showAll || formTouched.addressTemp) && !formData.addressTemp)
      errors.addressTemp = "Temporary address is required";
    if (
      (showAll || formTouched.password) &&
      (!formData.password ||
        !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(
          formData.password
        ))
    )
      errors.password =
        "Password must be at least 8 characters, include uppercase, lowercase, number, and special character";
    if (
      (showAll || formTouched.confirmPassword) &&
      formData.password !== formData.confirmPassword
    )
      errors.confirmPassword = "Passwords do not match";
    if (
      (showAll || formTouched.department) &&
      (!formData.department || formData.department === "Select Department")
    )
      errors.department = "Department is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateAppointment = async (formData, aadhaarId, occ) => {
    if (!validateForm(true)) {
      setFormTouched({
        aadhaarId: true,
        firstName: true,
        middleName: true,
        lastName: true,
        phone: true,
        email: true,
        gender: true,
        dob: true,
        addressPerm: true,
        addressTemp: true,
        password: true,
        confirmPassword: true,
        department: true,
      });
      toast.dismiss();
      toast.error("Please fill all required fields correctly.", {
        position: "top-right",
      });
      return;
    }
    try {
      const payload = { ...formData, aadhaarId, occupation: occ };
      await axios.post(
        "https://6801242781c7e9fbcc41aacf.mockapi.io/api/AV1/users",
        payload
      );
      toast.dismiss();
      toast.success("Patient added successfully!", { position: "top-right" });
      setAppointment({
        date: getCurrentDate(),
        time: getCurrentTime(),
        reason: "",
        diagnosis: "",
      });
      setAppointmentModal(true);
      setModalOpen(false);
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to create appointment. Please try again.", {
        position: "top-right",
      });
    }
  };

  const viewPatientDetails = async (a) => {
    setSelectedPatient(a);
    setPersonalDetails(null);
    setFamily([]);
    setVitals(null);
    setLoadingDetails(true);
    try {
      const { data: personalData } = await axios.get(
        "https://680cc0c92ea307e081d4edda.mockapi.io/personalHealthDetails"
      );
      const p = personalData.find(
        (p) =>
          (p.email || "").trim().toLowerCase() ===
          (a.email || "").trim().toLowerCase()
      );
      if (p) {
        setPersonalDetails({
          height: p.height,
          weight: p.weight,
          bloodGroup: p.bloodGroup,
          surgeries: p.surgeries,
          allergies: p.allergies,
          isSmoker: p.isSmoker,
          isAlcoholic: p.isAlcoholic,
        });
      }
      try {
        const { data: familyData } = await axios.get(
          "https://6808fb0f942707d722e09f1d.mockapi.io/FamilyData"
        );
        setFamily(
          familyData.filter(
            (f) =>
              (f.email || "").trim().toLowerCase() ===
              (a.email || "").trim().toLowerCase()
          )
        );
      } catch {
        setFamily([]);
      }
      try {
        const { data: vitalsData } = await axios.get(
          "https://6808fb0f942707d722e09f1d.mockapi.io/health-summary"
        );
        const v = vitalsData.find(
          (v) =>
            (v.email || "").trim().toLowerCase() ===
            (a.email || "").trim().toLowerCase()
        );
        setVitals(
          v
            ? {
                bloodPressure: v.bloodPressure || "Not recorded",
                heartRate: v.heartRate || "Not recorded",
                temperature: v.temperature || "Not recorded",
                bloodSugar: v.bloodSugar || "Not recorded",
              }
            : null
        );
      } catch {
        setVitals(null);
      }
    } catch {}
    setLoadingDetails(false);
  };

  // --- Render ---
  return (
    <div className="p-4">
      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="flex justify-between items-center mb-3 w-full">
        {/* Tabs left side */}
        <div className="flex gap-4">
          {/* <button
            className="px-6 py-2 rounded-full font-semibold transition-all duration-300 ease-in-out border bg-[#0E1630] text-white border-[#0E1630] shadow-lg"
            disabled
          >
            OPD
          </button> */}
        </div>
        {/* Add Patient button right side */}
        <div className="flex gap-2 items-start">
          <button
            onClick={() => setModalOpen(true)}
            className="btn btn-primary  "
            disabled={appointmentModal}
          >
            <Plus className="" /> Add Patient
          </button>
        </div>
      </div>

      {/* DynamicTable for patient list */}
      <DynamicTable
        columns={columns}
        data={filteredPatients}
        filters={filters}
        tabs={tabs}
        onCellClick={(row, col) => {
          if (col.accessor === "name") viewPatientDetails(row);
        }}
      />

      {/* ...rest of your modals unchanged... */}
      {appointmentModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-6 max-w-lg w-full rounded shadow space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                Schedule OPD Appointment
              </h3>
              <button
                onClick={() => setAppointmentModal(false)}
                className="text-gray-500 hover:text-red-600 text-xl"
              >
                &times;
              </button>
            </div>
            <div className="font-semibold">
              Book an appointment for{" "}
              <span className="text-blue-700">
                {formData.firstName || "Patient"}
              </span>
            </div>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleScheduleAppointment();
              }}
            >
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="date"
                  className="input-field"
                  value={appointment.date}
                  onChange={(e) =>
                    setAppointment({ ...appointment, date: e.target.value })
                  }
                />
                <input
                  type="time"
                  className="input-field"
                  value={appointment.time}
                  onChange={(e) =>
                    setAppointment({ ...appointment, time: e.target.value })
                  }
                />
              </div>
              {appointmentErrors.date && (
                <span className="text-red-500 text-xs">
                  {appointmentErrors.date}
                </span>
              )}
              {appointmentErrors.time && (
                <span className="text-red-500 text-xs">
                  {appointmentErrors.time}
                </span>
              )}
              <input
                type="text"
                className="input-field"
                placeholder="Enter Diagnosis"
                value={appointment.diagnosis}
                onChange={(e) =>
                  setAppointment({ ...appointment, diagnosis: e.target.value })
                }
                required
              />
              {appointmentErrors.diagnosis && (
                <span className="text-red-500 text-xs">
                  {appointmentErrors.diagnosis}
                </span>
              )}
              <select
                className="input-field"
                value={appointment.reason}
                onChange={(e) =>
                  setAppointment({ ...appointment, reason: e.target.value })
                }
              >
                <option value="">Select Reason for Visit</option>
                <option>Consultation</option>
                <option>Follow-up</option>
                <option>Test</option>
                <option>Other</option>
              </select>
              {appointmentErrors.reason && (
                <span className="text-red-500 text-xs">
                  {appointmentErrors.reason}
                </span>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  className="px-6 py-2 rounded-full border border-gray-400 transition-colors duration-200 hover:bg-[var(--color-overlay)] hover:text-white hover:border-[var(--color-overlay)]"
                  onClick={() => setAppointmentModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="border-2 border-[var(--accent-color)] bg-transparent text-[var(--accent-color)] px-6 py-2 rounded-full shadow transition-colors duration-300 hover:bg-[var(--accent-color)] hover:text-white disabled:opacity-60"
                  disabled={!appointment.diagnosis || !appointment.reason}
                >
                  Schedule Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-4 max-w-2xl w-full rounded shadow overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Add New Patient</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-500 hover:text-red-600 text-xl"
              >
                &times;
              </button>
            </div>
            <form
              className="space-y-2"
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateAppointment(formData, aadhaarId, occ);
              }}
            >
              <div className="grid md:grid-cols-3 gap-2 mb-7">
                {["firstName", "middleName", "lastName"].map((field, i) => (
                  <div
                    key={i}
                    className="floating-input relative mb-3"
                    data-placeholder={`${field
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (s) => s.toUpperCase())}${
                      field !== "middleName" ? "*" : ""
                    }`}
                  >
                    <input
                      className={`input-field peer w-full ${
                        formErrors[field] ? "border-red-500" : ""
                      }`}
                      value={formData[field]}
                      onChange={(e) => {
                        setFormData({ ...formData, [field]: e.target.value });
                        setFormTouched((t) => ({ ...t, [field]: true }));
                        validateForm();
                      }}
                      placeholder=" "
                      autoComplete="off"
                    />
                    <span className="text-red-500 text-xs absolute left-0 -bottom-8">
                      {formTouched[field] && formErrors[field]
                        ? formErrors[field]
                        : ""}
                    </span>
                  </div>
                ))}
              </div>
              <div className="grid md:grid-cols-3 gap-2">
                <div
                  className="floating-input relative mb-6"
                  data-placeholder="Phone Number*"
                >
                  <input
                    className={`input-field peer w-full ${
                      formErrors.phone ? "border-red-500" : ""
                    }`}
                    value={formData.phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setFormData({ ...formData, phone: val });
                      setFormTouched((t) => ({ ...t, phone: true }));
                      validateForm();
                    }}
                    maxLength={10}
                    placeholder=" "
                    autoComplete="off"
                  />
                  <span className="text-red-500 text-xs absolute left-0 -bottom-5">
                    {formTouched.phone && formErrors.phone
                      ? formErrors.phone
                      : ""}
                  </span>
                </div>
                <div
                  className="floating-input relative mb-1"
                  data-placeholder="Email Address*"
                >
                  <input
                    className={`input-field peer w-full ${
                      formErrors.email ? "border-red-500" : ""
                    }`}
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      setFormTouched((t) => ({ ...t, email: true }));
                      validateForm();
                    }}
                    placeholder=" "
                    autoComplete="off"
                  />
                  <span className="text-red-500 text-xs absolute left-0 -bottom-1">
                    {formTouched.email && formErrors.email
                      ? formErrors.email
                      : ""}
                  </span>
                </div>
                <div
                  className="floating-input relative mb-8"
                  data-placeholder="Aadhaar Number*"
                >
                  <input
                    className={`input-field peer w-full ${
                      formErrors.aadhaarId ? "border-red-500" : ""
                    }`}
                    value={aadhaarId}
                    maxLength={12}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setAadhaarId(val);
                      setFormTouched((t) => ({ ...t, aadhaarId: true }));
                      validateForm();
                    }}
                    placeholder=" "
                    autoComplete="off"
                  />
                  <span className="text-red-500 text-xs absolute left-0 -bottom-5">
                    {formTouched.aadhaarId && formErrors.aadhaarId
                      ? formErrors.aadhaarId
                      : ""}
                  </span>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-2 mb-1">
                {/* Gender */}
                <div className="floating-input relative mb-1">
                  <select
                    className={`input-field w-full ${
                      formErrors.gender ? "border-red-500" : ""
                    }`}
                    value={formData.gender}
                    onChange={(e) => {
                      setFormData({ ...formData, gender: e.target.value });
                      setFormTouched((t) => ({ ...t, gender: true }));
                      validateForm();
                    }}
                  >
                    <option>Select Gender</option>
                    <option>Female</option>
                    <option>Male</option>
                    <option>Other</option>
                  </select>
                  <span className="text-red-500 text-xs absolute left-0 -bottom-1">
                    {formTouched.gender && formErrors.gender
                      ? formErrors.gender
                      : ""}
                  </span>
                </div>
                {/* DOB */}
                <div
                  className="floating-input relative mb-6"
                  data-placeholder="Date of Birth*"
                >
                  <input
                    type="date"
                    className={`input-field peer w-full ${
                      formErrors.dob ? "border-red-500" : ""
                    }`}
                    value={formData.dob}
                    onChange={(e) => {
                      setFormData({ ...formData, dob: e.target.value });
                      setFormTouched((t) => ({ ...t, dob: true }));
                      validateForm();
                    }}
                    placeholder=" "
                    autoComplete="off"
                  />
                  <span className="text-red-500 text-xs absolute left-0 -bottom-6">
                    {formTouched.dob && formErrors.dob ? formErrors.dob : ""}
                  </span>
                </div>
                {/* Occupation */}
                <div
                  className="floating-input relative mb-1"
                  data-placeholder="Occupation"
                >
                  <SuggestInput
                    val={occ}
                    setVal={setOcc}
                    list={occList}
                    setList={setOccList}
                    data={occOpt}
                    placeholder="Occupation"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-2">
                <div
                  className="floating-input relative mb-3"
                  data-placeholder="Permanent Address*"
                >
                  <textarea
                    placeholder=" "
                    className={`input-field peer w-full ${
                      formErrors.addressPerm ? "border-red-500" : ""
                    }`}
                    value={formData.addressPerm}
                    onChange={(e) => {
                      setFormData({ ...formData, addressPerm: e.target.value });
                      setFormTouched((t) => ({ ...t, addressPerm: true }));
                      validateForm();
                    }}
                    autoComplete="off"
                    rows={1}
                  />
                  <span className="text-red-500 text-xs absolute left-0 -bottom-4">
                    {formTouched.addressPerm && formErrors.addressPerm
                      ? formErrors.addressPerm
                      : ""}
                  </span>
                </div>
                <div
                  className="floating-input relative mb-1"
                  data-placeholder="Temporary Address*"
                >
                  <textarea
                    placeholder=" "
                    className={`input-field peer w-full ${
                      formErrors.addressTemp ? "border-red-500" : ""
                    }`}
                    value={formData.addressTemp}
                    onChange={(e) => {
                      setFormData({ ...formData, addressTemp: e.target.value });
                      setFormTouched((t) => ({ ...t, addressTemp: true }));
                      validateForm();
                    }}
                    autoComplete="off"
                    rows={1}
                  />
                  <span className="text-red-500 text-xs absolute left-0 -bottom-4">
                    {formTouched.addressTemp && formErrors.addressTemp
                      ? formErrors.addressTemp
                      : ""}
                  </span>
                </div>
                <div
                  className="floating-input relative mb-1"
                  data-placeholder="Department*"
                >
                  <select
                    className={`input-field w-full ${
                      formErrors.department ? "border-red-500" : ""
                    }`}
                    value={formData.department}
                    onChange={(e) => {
                      setFormData({ ...formData, department: e.target.value });
                      setFormTouched((t) => ({ ...t, department: true }));
                      validateForm();
                    }}
                  >
                    <option>Select Department</option>
                    {DEPARTMENT_LIST.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                  <span className="text-red-500 text-xs absolute left-0 -bottom-1">
                    {formTouched.department && formErrors.department
                      ? formErrors.department
                      : ""}
                  </span>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-2">
                <div
                  className="floating-input relative mb-1"
                  data-placeholder="Create Password"
                >
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder=" "
                    className={`input-field peer pr-10 w-full mb-5 ${
                      formErrors.password ? "border-red-500" : ""
                    }`}
                    autoComplete="off"
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value });
                      setFormTouched((t) => ({ ...t, password: true }));
                      validateForm();
                    }}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    className="absolute right-3 top-1/3 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                  <span className="text-red-500 text-xs absolute left-0 -bottom-8 block min-h-[1rem]">
                    {formTouched.password && formErrors.password
                      ? formErrors.password
                      : ""}
                  </span>
                </div>
                <div
                  className="floating-input relative mb-1"
                  data-placeholder="Confirm Password"
                >
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder=" "
                    className={`input-field peer pr-10 w-full mb-3 ${
                      formErrors.confirmPassword ? "border-red-500" : ""
                    }`}
                    autoComplete="off"
                    value={formData.confirmPassword}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      });
                      setFormTouched((t) => ({ ...t, confirmPassword: true }));
                      validateForm();
                    }}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    className="absolute right-3 top-1/3 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                    onClick={() => setShowConfirm((v) => !v)}
                  >
                    {showConfirm ? <FaEyeSlash /> : <FaEye />}
                  </button>
                  <span className="text-red-500 text-xs absolute left-0 -bottom-2 block min-h-[1rem]">
                    {formTouched.confirmPassword && formErrors.confirmPassword
                      ? formErrors.confirmPassword
                      : ""}
                  </span>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-2 rounded shadow hover:bg-green-700"
                >
                  {" "}
                  ADD Patient{" "}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedPatient && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-3xl relative overflow-y-auto max-h-[90vh] animate-fadeIn">
            <button
              onClick={() => setSelectedPatient(null)}
              className="absolute top-3 right-4 text-2xl text-gray-400 hover:text-red-500 transition-colors"
            >
              &times;
            </button>
            <h4 className="text-2xl font-bold text-[#0E1630] mb-4">
              Patient Details
            </h4>
            <div className="border p-4 rounded-md shadow-sm hover:shadow-md transition-shadow mb-5">
              <h4 className="font-bold mb-3 border-b pb-2">
                Basic Information
              </h4>
              <h4 className="font-semibold">{selectedPatient.name}</h4>
              <p className="font-semibold">
                Appointment: {selectedPatient.datetime}
              </p>
              <p className="font-semibold">Reason:{selectedPatient.reason}</p>
              <p className="font-semibold">
                Department: {selectedPatient.department || "—"}
              </p>
              <p className="font-semibold">
                Dr Name: {selectedPatient.doctorName || "—"}
              </p>
              <p className="font-semibold">
                Email: {selectedPatient.email || "—"}
              </p>
            </div>
            <div className="space-y-6">
              <div className="border p-4 rounded-md shadow-sm hover:shadow-md transition-shadow">
                <h4 className="font-bold mb-3 border-b pb-2">
                  Personal Health Details
                </h4>
                {loadingDetails ? (
                  <div>Loading...</div>
                ) : personalDetails ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">Height</span>
                      <p className="text-lg font-semibold">
                        {personalDetails.height || "—"} cm
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Weight</span>
                      <p className="text-lg font-semibold">
                        {personalDetails.weight || "—"} kg
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Blood Group</span>
                      <p className="text-lg font-semibold">
                        {personalDetails.bloodGroup || "Not recorded"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No personal health details found.
                  </div>
                )}
              </div>
              <div className="border p-4 rounded-md shadow-sm hover:shadow-md transition-shadow">
                <h4 className="font-bold mb-3 border-b pb-2">Family History</h4>
                {loadingDetails ? (
                  <div>Loading...</div>
                ) : family && family.length > 0 ? (
                  <div className="space-y-3">
                    {family.map((m, i) => (
                      <div key={i} className="p-3 border rounded-md">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <span className="font-semibold">Name</span>
                            <p>{m.name || "—"}</p>
                          </div>
                          <div>
                            <span className="font-semibold">Relation</span>
                            <p>{m.relation || "—"}</p>
                          </div>
                          <div>
                            <span className="font-semibold">Number</span>
                            <p>{m.number || "—"}</p>
                          </div>
                          <div>
                            <span className="font-semibold">Diseases</span>
                            <p>
                              {m.diseases && m.diseases.length
                                ? m.diseases.join(", ")
                                : "No diseases recorded"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No family history recorded for this patient.
                  </div>
                )}
              </div>
              <div className="border p-4 rounded-md shadow-sm hover:shadow-md transition-shadow">
                <h4 className="font-bold mb-3 border-b pb-2">Vital Signs</h4>
                {loadingDetails ? (
                  <div>Loading...</div>
                ) : vitals ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">
                        Blood Pressure
                      </span>
                      <p className="text-lg font-semibold">
                        {vitals.bloodPressure}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Heart Rate</span>
                      <p className="text-lg font-semibold">
                        {vitals.heartRate}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Temperature</span>
                      <p className="text-lg font-semibold">
                        {vitals.temperature}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Blood Sugar</span>
                      <p className="text-lg font-semibold">
                        {vitals.bloodSugar}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                       No vital signs recorded
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}