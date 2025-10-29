import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Loader2, Edit, LayoutDashboard } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import Pagination from "../../../../components/Pagination";
import "react-toastify/dist/ReactToastify.css";
import TeleConsultFlow from "../../../../components/microcomponents/Call";
import DynamicTable from "../../../../components/microcomponents/DynamicTable";
import { FiExternalLink } from "react-icons/fi";

const OPT = {
  OCC: ["Doctor", "Engineer", "Teacher", "Student", "Retired"],
  DEPT: [
    "General Medicine",
    "Surgery",
    "Cardiology",
    "Orthopedics",
    "Pediatrics",
    "Gynecology",
  ],
  INS: ["None", "CGHS", "ESIC", "Private Insurance", "Other"],
  RATE: [
    "General",
    "Semi-Private",
    "Private",
    "Deluxe",
    "ICU",
    "ICCU",
    "Special Wards",
  ],
  STATUS: ["Admitted", "Under Treatment", "Discharged"],
  GENDER: ["Female", "Male", "Other"],
  BLOOD: ["A+", "B+", "O+", "AB+"],
  SURGERY: ["No", "Yes"],
};

const API = {
  FORM: "https://681f2dfb72e59f922ef5774c.mockapi.io/addpatient",
  HD: "https://680cc0c92ea307e081d4edda.mockapi.io/personalHealthDetails",
  FD: "https://6808fb0f942707d722e09f1d.mockapi.io/FamilyData",
  HS: "https://6808fb0f942707d722e09f1d.mockapi.io/health-summary",
};

const getDate = () => new Date().toISOString().slice(0, 10);
const getTime = () => new Date().toTimeString().slice(0, 5);
const to24Hour = (t) => {
  if (!t.includes("AM") && !t.includes("PM")) return t;
  let [time, mod] = t.trim().split(" ");
  let [h, m] = time.split(":").map(Number);
  if (mod === "PM" && h !== 12) h += 12;
  if (mod === "AM" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

const FIELDS = [
  ["firstName", "First Name*", "text", 1],
  ["middleName", "Middle Name", "text"],
  ["lastName", "Last Name*", "text", 1],
  ["phone", "Phone Number*", "text", 1],
  ["email", "Email Address*", "text", 1],
  ["gender", "Gender*", "select", 1, OPT.GENDER],
  ["dob", "Date of Birth*", "date", 1],
  ["bloodGroup", "Blood Group", "select", 0, OPT.BLOOD],
  ["addressPerm", "Permanent Address*", "textarea", 1],
  ["addressTemp", "Temporary Address*", "textarea", 1],
  ["password", "Create Password*", "password", 1],
  ["confirmPassword", "Confirm Password*", "password", 1],
  ["occupation", "Occupation*", "suggest", 1, OPT.OCC],
];

const IPD = [
  ["admissionDate", "Admission Date*", "date", 1],
  ["admissionTime", "Admission Time*", "time", 1],
  ["status", "Status*", "select", 1, OPT.STATUS],
  ["wardType", "Ward Type*", "select", 1, OPT.RATE],
  ["department", "Department*", "select", 1, OPT.DEPT],
  ["insuranceType", "Insurance Type*", "select", 1, OPT.INS],
  ["doctorInCharge", "Doctor In Charge", "text"],
  ["doctorSpecialization", "Doctor Specialization", "text"],
  ["treatmentPlan", "Treatment Plan", "text"],
  ["surgeryRequired", "Surgery Required", "select", 0, OPT.SURGERY],
  ["dischargeDate", "Discharge Date", "date"],
  ["diagnosis", "Diagnosis", "text"],
  ["reasonForAdmission", "Reason For Admission", "text"],
];

const defaultForm = Object.fromEntries(FIELDS.map((f) => [f[0], ""]));
const defaultIPD = Object.fromEntries(
  IPD.map((f) => [
    f[0],
    f[0] === "admissionDate"
      ? getDate()
      : f[0] === "admissionTime"
      ? to24Hour(getTime())
      : "",
  ])
);

const WARD_TYPES = [
  "General",
  "Semi-Private",
  "Private",
  "Deluxe",
  "ICU",
  "ICCU",
  "Special Wards",
];
const WARD_NUMBERS = ["A", "B", "C", "D", "E"];
const BED_NUMBERS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

function Field({ f, v, onC, err, occList, setOccList, showWardModal }) {
  const [k, l, t, , o] = f;

  if (k === "wardType") {
    return (
      <div className="flex items-center gap-2">
        <input
          type="text"
          className={`input-field peer w-full text-xs font-normal ${
            err ? "border-red-500" : ""
          }`}
          value={v ?? ""}
          placeholder=""
          readOnly
        />
        <button
          type="button"
          onClick={showWardModal}
          className="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    );
  }

  if (t === "select")
    return (
      <select
        className={`input-field peer w-full text-xs font-normal ${
          err ? "border-red-500" : ""
        }`}
        value={v ?? ""}
        onChange={onC}
      >
        <option value="" disabled hidden>
          {l}
        </option>
        {o?.map((x) => (
          <option key={x}>{x}</option>
        ))}
      </select>
    );
  if (t === "textarea")
    return (
      <textarea
        className={`input-field peer w-full text-xs font-normal min-h-[60px] ${
          err ? "border-red-500" : ""
        }`}
        value={v ?? ""}
        onChange={onC}
      />
    );
  if (t === "time")
    return (
      <input
        type="time"
        className={`input-field peer w-full text-xs font-normal ${
          err ? "border-red-500" : ""
        }`}
        value={v ? to24Hour(v) : ""}
        onChange={onC}
      />
    );
  if (t === "suggest")
    return (
      <div className="floating-input relative" data-placeholder={l}>
        <input
          className="input-field peer text-xs px-3 py-2"
          value={v}
          placeholder=" "
          onChange={(e) => {
            onC({ target: { value: e.target.value } });
            setOccList(
              o.filter((x) =>
                x.toLowerCase().includes(e.target.value.toLowerCase())
              )
            );
          }}
          autoComplete="off"
        />
        {occList.length > 0 && (
          <ul className="absolute z-10 bg-white border w-full rounded shadow mt-1 max-h-40 overflow-y-auto text-xs">
            {occList.map((item, i) => (
              <li
                key={i}
                onClick={() => {
                  onC({ target: { value: item } });
                  setOccList([]);
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
  return (
    <input
      type={t}
      className={`input-field peer w-full text-xs font-normal ${
        err ? "border-red-500" : ""
      }`}
      value={v ?? ""}
      onChange={onC}
    />
  );
}

export default function Ipd() {
  const navigate = useNavigate();

  const [ipdState, setIpdState] = useState({
    ipdPatients: [],
    filteredIPD: [],
    loading: true,
    search: "",
    searching: false,
    modalOpen: false,
    showIpdForm: false,
    editModalOpen: false,
    formData: defaultForm,
    ipdData: defaultIPD,
    occList: [],
    aadhaarId: "",
    readonlyFields: false,
    selectedPatient: null,
    personalDetails: null,
    family: [],
    vitals: null,
    saving: false,
  });
  const [ipdErrors, setIpdErrors] = useState({});
  const [recentPatientId, setRecentPatientId] = useState(null);
  const ipdSearchTimeout = useRef();

  const [wardModal, setWardModal] = useState(false);
  const [wardSelection, setWardSelection] = useState({
    wardType: "",
    wardNumber: "",
    bedNumber: "",
  });

  const S = (k, v) => setIpdState((s) => ({ ...s, [k]: v }));
  const F = (k, v) =>
    setIpdState((s) => ({ ...s, formData: { ...s.formData, [k]: v } }));
  const I = (k, v) =>
    setIpdState((s) => ({ ...s, ipdData: { ...s.ipdData, [k]: v } }));
  const validateIPD = (fields, data) => {
    let errs = {};
    fields.forEach((f) => {
      if (f[3] && !data[f[0]]) errs[f[0]] = `${f[1]} is required`;
    });
    setIpdErrors(errs);
    return Object.keys(errs).length === 0;
  };

  useEffect(() => {
    S("loading", true);
    (async () => {
      try {
        const d = await (await fetch(API.FORM)).json();
        const mapped = d.reverse().map((p) => ({
          ...p,
          name:
            p.name ||
            [p.firstName, p.middleName, p.lastName]
              .filter(Boolean)
              .join(" ")
              .trim(),
        }));
        S("ipdPatients", mapped);
        S("filteredIPD", mapped);
      } catch {
        toast.error("Failed to fetch patients");
      }
      S("loading", false);
    })();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    S("searching", true);
    if (ipdSearchTimeout.current) clearTimeout(ipdSearchTimeout.current);
    ipdSearchTimeout.current = setTimeout(() => {
      const val = ipdState.search.trim().toLowerCase();
      S(
        "filteredIPD",
        ipdState.ipdPatients.filter(
          (p) =>
            (p.id || "").toString().toLowerCase().includes(val) ||
            (p.name || "").toLowerCase().includes(val)
        )
      );
      S("searching", false);
    }, 400);
    return () => clearTimeout(ipdSearchTimeout.current);
    // eslint-disable-next-line
  }, [ipdState.search, ipdState.ipdPatients]);

  useEffect(() => {
    if (ipdState.modalOpen || wardModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [ipdState.modalOpen, wardModal]);

  const [ipdPage, setIpdPage] = useState(1);
  const ipdPageSize = 6;
  const ipdTotalPages = Math.ceil(
    ipdState.filteredIPD.filter((p) => (p.type || "").toLowerCase() === "ipd")
      .length / ipdPageSize
  );
  const paginatedIPD = ipdState.filteredIPD
    .filter((p) => (p.type || "").toLowerCase() === "ipd")
    .slice((ipdPage - 1) * ipdPageSize, ipdPage * ipdPageSize);

  useEffect(() => {
    setIpdPage(1);
  }, [ipdState.filteredIPD]);

  const fetchPatient = async () => {
    try {
      const data = await (await fetch(API.FORM)).json();
      const found = data.find(
        (p) => (p.id || "").toString() === ipdState.aadhaarId.trim()
      );
      if (found) {
        const name = `${found.firstName || ""} ${found.middleName || ""} ${
          found.lastName || ""
        }`
          .replace(/\s+/g, " ")
          .trim();
        S("formData", {
          ...defaultForm,
          ...found,
          name,
          addressPerm: found.permanentAddress || "",
          addressTemp: found.temporaryAddress || "",
          email: found.email || "",
          dob: found.dob || "",
          occupation: found.occupation || "",
          bloodGroup: found.bloodGroup || "",
          password: found.password || "",
          confirmPassword: found.confirmPassword || "",
        });
        S("readonlyFields", true);
        S("photoUrl", found.photoUrl || "");
        toast.success(`${found.type || "Patient"} details loaded!`);
      } else toast.info("No patient found with this ID.");
    } catch {
      toast.error("Failed to fetch patient");
    }
  };

  const savePatient = async () => {
    if (!validateIPD(IPD, ipdState.ipdData)) return;
    S("saving", true);
    try {
      const patientData = {
        ...ipdState.formData,
        ...ipdState.ipdData,
        type: "ipd",
        name: `${ipdState.formData.firstName} ${
          ipdState.formData.middleName || ""
        } ${ipdState.formData.lastName}`.trim(),
        admissionTime: to24Hour(ipdState.ipdData.admissionTime),
        admissionDate: ipdState.ipdData.admissionDate,
        occupation: ipdState.formData.occupation,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const url =
        ipdState.editModalOpen && ipdState.formData.id
          ? `${API.FORM}/${ipdState.formData.id}`
          : API.FORM;
      const method =
        ipdState.editModalOpen && ipdState.formData.id ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patientData),
      });
      if (response.ok) {
        toast.success(
          ipdState.editModalOpen
            ? "Patient updated successfully!"
            : "Patient added successfully!"
        );
        resetForm();
        handleCloseIpdModal();
        const updatedData = await (await fetch(API.FORM)).json();
        let newPatient = null;
        if (!ipdState.editModalOpen) {
          newPatient = updatedData.find(
            (p) => p.createdAt === patientData.createdAt
          );
          const newId = newPatient
            ? newPatient.id
            : updatedData[updatedData.length - 1]?.id;
          S("ipdPatients", [
            newPatient || patientData,
            ...updatedData.filter((p) =>
              newPatient ? p.id !== newPatient.id : true
            ),
          ]);
          S("filteredIPD", [
            newPatient || patientData,
            ...updatedData.filter((p) =>
              newPatient ? p.id !== newPatient.id : true
            ),
          ]);
          setRecentPatientId(newId);
        } else {
          S("ipdPatients", updatedData.reverse());
          S("filteredIPD", updatedData.reverse());
          setRecentPatientId(null);
        }
      } else throw new Error("Failed to save patient");
    } catch {
      toast.error("Failed to save patient");
    } finally {
      S("saving", false);
    }
  };

  const resetForm = () => {
    S("formData", defaultForm);
    S("ipdData", defaultIPD);
    S("occList", []);
    S("aadhaarId", "");
    S("readonlyFields", false);
    setIpdErrors({});
  };

  const viewIpdPatientDetails = async (a) => {
    S("selectedPatient", a);
    S("personalDetails", null);
    S("family", []);
    S("vitals", null);
    setRecentPatientId(null);
    try {
      const [pd, fd, vs] = await Promise.all([
        fetch(API.HD).then((r) => r.json()),
        fetch(API.FD).then((r) => r.json()),
        fetch(API.HS).then((r) => r.json()),
      ]);
      const email = (a.email || "").trim().toLowerCase();
      S(
        "personalDetails",
        pd.find((x) => (x.email || "").trim().toLowerCase() === email)
      );
      S(
        "family",
        fd.filter((f) => (f.email || "").trim().toLowerCase() === email)
      );
      S(
        "vitals",
        vs.find((x) => (x.email || "").trim().toLowerCase() === email) || null
      );
    } catch {}
  };

  const handleEdit = () => {
    S("editModalOpen", true);
    S("modalOpen", true);
    S("showIpdForm", true);
    S("formData", {
      ...defaultForm,
      ...ipdState.selectedPatient,
      id: ipdState.selectedPatient.id,
      addressPerm: ipdState.selectedPatient.permanentAddress || "",
      addressTemp: ipdState.selectedPatient.temporaryAddress || "",
      email: ipdState.selectedPatient.email || "",
      dob: ipdState.selectedPatient.dob || "",
      occupation: ipdState.selectedPatient.occupation || "",
      bloodGroup: ipdState.selectedPatient.bloodGroup || "",
      password: ipdState.selectedPatient.password || "",
      confirmPassword: ipdState.selectedPatient.confirmPassword || "",
    });
    S("ipdData", { ...defaultIPD, ...ipdState.selectedPatient });
    S("photoUrl", ipdState.selectedPatient.photoUrl || "");
    S("selectedPatient", null);
  };

  const handleCloseIpdModal = () => {
    S("modalOpen", false);
    S("showIpdForm", false);
    S("editModalOpen", false);
    S("selectedPatient", null);
    resetForm();
  };

  const handlePatientFormSubmit = (e) => {
    e.preventDefault();
    if (validateIPD(FIELDS, ipdState.formData)) S("showIpdForm", true);
  };

  const handleIPDFormSubmit = (e) => {
    e.preventDefault();
    savePatient();
  };

  const handleWardModalOpen = () => setWardModal(true);
  const handleWardModalClose = () => {
    setWardModal(false);
    setWardSelection({ wardType: "", wardNumber: "", bedNumber: "" });
  };
  const handleWardSelectionConfirm = () => {
    const { wardType, wardNumber, bedNumber } = wardSelection;
    if (wardType && wardNumber && bedNumber) {
      const wardString = `${wardType}-${wardNumber}-${bedNumber}`;
      I("wardType", wardString);
      setWardModal(false);
      setWardSelection({ wardType: "", wardNumber: "", bedNumber: "" });
    }
  };

  const renderFields = (
    fields,
    values,
    onChange,
    errors = {},
    occList,
    setOccList
  ) =>
    fields.map((f) => (
      <div
        key={f[0]}
        className="floating-input relative"
        data-placeholder={f[1]}
      >
        <Field
          f={f}
          v={values[f[0]]}
          onC={(e) => onChange(f[0], e.target.value)}
          err={errors[f[0]]}
          occList={occList}
          setOccList={setOccList}
          showWardModal={f[0] === "wardType" ? handleWardModalOpen : undefined}
        />
        {errors[f[0]] && (
          <span className="text-red-500 text-xs">{errors[f[0]]}</span>
        )}
      </div>
    ));

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
      <div className="mb-4">
        <h2 className="text-xl font-semibold">IPD Patients</h2>
      </div>
      <div className="flex justify-between items-center mb-6 w-full">
        <div className="flex flex-row items-center gap-2"></div>
        <div className="flex flex-row items-center gap-2">
          <button
            onClick={() => S("modalOpen", true)}
            className="btn btn-primary whitespace-nowrap px-4 py-3 text-xs flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Patient
          </button>
        </div>
      </div>

      <div className="px-4 min-h-screen ">
        <div className="bg-white  overflow-hidden animate-fadeIn">
          <div className="overflow-x-auto">
            <DynamicTable
              columns={[
                { header: "ID", accessor: "id" },
                {
                  header: "Name",
                  accessor: "name",
                  clickable: true,
                  cell: (row) =>
                    row.name ||
                    [row.firstName, row.middleName, row.lastName]
                      .filter(Boolean)
                      .join(" "),
                },
                { header: "Admission", accessor: "admissionDate" },
                {
                  header: "Status",
                  accessor: "status",
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
                {
                  header: "Ward",
                  accessor: "wardType",
                  cell: (row) =>
                    [row.wardType, row.wardNo, row.bedNo]
                      .filter(Boolean)
                      .join("-"),
                },
                {
                  header: "Discharge",
                  accessor: "dischargeDate",
                  cell: (row) => row.dischargeDate || "-",
                },
                {
                  header: "Actions",
                  accessor: "actions",
                  cell: (row) => (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          navigate("/hospitaldashboard/form", {
                            state: { patient: row },
                          })
                        }
                        className="edit-btn"
                      >
                        Visit Pad
                      </button>
                      <TeleConsultFlow phone={row.phone} />
<button
  title="Go to Dashboard"
  onClick={() =>
    navigate(
      `/hospitaldashboard/opd-dashboard/${row.id}`,
      {
        state: {
          patientName:
            row.name ||
            [row.firstName, row.middleName, row.lastName]
              .filter(Boolean)
              .join(" "),
          age: row.age,
          gender: row.gender,
          phone: row.phone,
          address: row.addressPerm || row.permanentAddress,
          doctor: row.doctorInCharge,
          treatmentID: row.id,
          hospitalUID: row.hospitalUID,
          admissionDate: row.admissionDate,
          bed: row.wardType,
          dischargeDate: row.dischargeDate,
        },
      }
    )
  }
  className="p-2 rounded-full bg-gray-100 hover:bg-blue-100"
>
 <FiExternalLink className="text-blue-600 hover:text-blue-800" /></button>
                    </div>
                  ),
                },
              ]}
              data={paginatedIPD}
              onCellClick={(row, col) => {
                if (col.accessor === "name") viewIpdPatientDetails(row);
              }}
              filters={[
                {
                  key: "status",
                  label: "Status",
                  options: [
                    { value: "Admitted", label: "Admitted" },
                    { value: "Under Treatment", label: "Under Treatment" },
                    { value: "Discharged", label: "Discharged" },
                  ],
                },
                {
                  key: "wardType",
                  label: "Ward Type",
                  options: WARD_TYPES.map((w) => ({ value: w, label: w })),
                },
              ]}
            />
            <div className="w-full flex justify-end mt-4">
              <Pagination
                page={ipdPage}
                totalPages={ipdTotalPages}
                onPageChange={setIpdPage}
              />
            </div>
          </div>
        </div>
      </div>
      {/* ...rest of your modal/detail code remains unchanged...
      {/* --- IPD Modals --- */}
      {/* Modal for Add Patient */}
      {ipdState.modalOpen && !ipdState.showIpdForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-[rgba(14,22,48,0.18)] backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-[var(--accent-color)] p-8 w-full max-w-2xl animate-slideUp">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add New Patient</h3>
              <button
                onClick={() => S("modalOpen", false)}
                className="text-gray-500 hover:text-red-600 text-xl"
              >
                &times;
              </button>
            </div>
            <form className="space-y-6" onSubmit={handlePatientFormSubmit}>
              <div className="flex flex-col md:flex-row gap-4">
                <div
                  className="floating-input relative flex-1"
                  data-placeholder="Enter PatientId Number"
                >
                  <input
                    className={`input-field peer ${
                      ipdErrors.aadhaarId ? "border-red-500" : ""
                    }`}
                    value={ipdState.aadhaarId}
                    maxLength={12}
                    onChange={(e) =>
                      S("aadhaarId", e.target.value.replace(/\D/g, ""))
                    }
                    placeholder=" "
                    autoComplete="off"
                  />
                  {ipdErrors.aadhaarId && (
                    <span className="text-red-500 text-xs">
                      {ipdErrors.aadhaarId}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={fetchPatient}
                  className="animate-pulse-save text-white px-4 text-sm py-2 rounded self-end md:self-auto"
                  style={{ backgroundColor: "var(--primary-color)" }}
                >
                  Get Patient Details
                </button>
              </div>
              {/* Name fields */}
              <div className="grid md:grid-cols-3 gap-x-4 gap-y-4">
                {renderFields(
                  FIELDS.slice(0, 2),
                  ipdState.formData,
                  F,
                  ipdErrors,
                  ipdState.occList,
                  (v) => S("occList", v)
                )}
                {renderFields(
                  FIELDS.slice(2, 3),
                  ipdState.formData,
                  F,
                  ipdErrors,
                  ipdState.occList,
                  (v) => S("occList", v)
                )}
              </div>
              {/* Phone, Email, Gender */}
              <div className="grid md:grid-cols-3 gap-x-4 gap-y-4">
                {renderFields(
                  FIELDS.slice(3, 6),
                  ipdState.formData,
                  F,
                  ipdErrors,
                  ipdState.occList,
                  (v) => S("occList", v)
                )}
              </div>
              {/* DOB, Blood Group, Occupation */}
              <div className="grid md:grid-cols-3 gap-x-4 gap-y-4">
                {renderFields(
                  FIELDS.slice(6, 7),
                  ipdState.formData,
                  F,
                  ipdErrors,
                  ipdState.occList,
                  (v) => S("occList", v)
                )}
                {renderFields(
                  FIELDS.slice(7, 8),
                  ipdState.formData,
                  F,
                  ipdErrors,
                  ipdState.occList,
                  (v) => S("occList", v)
                )}
                {renderFields(
                  FIELDS.slice(12, 13),
                  ipdState.formData,
                  F,
                  ipdErrors,
                  ipdState.occList,
                  (v) => S("occList", v)
                )}
              </div>
              {/* Permanent and Temporary Address */}
              <div className="grid md:grid-cols-2 gap-x-4 gap-y-4">
                {renderFields(
                  FIELDS.slice(8, 10),
                  ipdState.formData,
                  F,
                  ipdErrors,
                  ipdState.occList,
                  (v) => S("occList", v)
                )}
              </div>
              {/* Password and Confirm Password */}
              <div className="grid md:grid-cols-2 gap-x-4 gap-y-4">
                {renderFields(
                  FIELDS.slice(10, 12),
                  ipdState.formData,
                  F,
                  ipdErrors,
                  ipdState.occList,
                  (v) => S("occList", v)
                )}
              </div>
              <div>
                <label className="font-medium block mb-1">Upload Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  className="input-field w-full"
                />
              </div>
              <div className="flex flex-col md:flex-row justify-end gap-4 pt-2">
                <button
                  type="submit"
                  className="btn btn-primary animate-pulse-save px-6 py-2 shadow-md hover:scale-105 transition-all duration-300"
                >
                  Next
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for IPD Details */}
      {ipdState.modalOpen && ipdState.showIpdForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-[rgba(14,22,48,0.18)] backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-[var(--primary-color)] p-8 w-full max-w-xl animate-slideUp">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">IPD Details</h3>
              <button
                onClick={handleCloseIpdModal}
                className="text-gray-500 hover:text-red-600 text-xl"
              >
                &times;
              </button>
            </div>
            <form className="space-y-6" onSubmit={handleIPDFormSubmit}>
              <div className="space-y-3">
                <div className="grid md:grid-cols-3 gap-x-4 gap-y-4">
                  {renderFields(IPD, ipdState.ipdData, I, ipdErrors)}
                </div>
              </div>
              <div className="flex flex-col md:flex-row justify-end gap-4 pt-2">
                <button
                  type="button"
                  className="bg-gray-400 text-white px-6 py-2 rounded shadow hover:bg-gray-500 animated-cancel-btn"
                  onClick={handleCloseIpdModal}
                >
                  {ipdState.editModalOpen ? "Cancel" : "Back"}
                </button>
                <button
                  type="submit"
                  disabled={ipdState.saving}
                  className="btn btn-primary animate-pulse-save flex items-center gap-2 disabled:opacity-50 px-6 py-2 shadow-md hover:scale-105 transition-all duration-300"
                >
                  {ipdState.saving && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  {ipdState.editModalOpen ? "Save" : "Add Patient to IPD"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ward Selection Modal */}
      {wardModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Select Ward Details</h3>
              <button
                onClick={handleWardModalClose}
                className="text-gray-500 hover:text-red-600 text-xl"
              >
                &times;
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <select
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={wardSelection.wardType}
                  onChange={(e) =>
                    setWardSelection({
                      ...wardSelection,
                      wardType: e.target.value,
                    })
                  }
                >
                  <option value="">Select Ward Type</option>
                  {WARD_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Ward Number
                </label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={wardSelection.wardNumber}
                  onChange={(e) =>
                    setWardSelection({
                      ...wardSelection,
                      wardNumber: e.target.value,
                    })
                  }
                >
                  <option value="">Select Ward Number</option>
                  {WARD_NUMBERS.map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Bed Number
                </label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={wardSelection.bedNumber}
                  onChange={(e) =>
                    setWardSelection({
                      ...wardSelection,
                      bedNumber: e.target.value,
                    })
                  }
                >
                  <option value="">Select Bed Number</option>
                  {BED_NUMBERS.map((bed) => (
                    <option key={bed} value={bed}>
                      {bed}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleWardModalClose}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleWardSelectionConfirm}
                disabled={
                  !wardSelection.wardType ||
                  !wardSelection.wardNumber ||
                  !wardSelection.bedNumber
                }
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Patient Details */}
      {ipdState.selectedPatient && !ipdState.editModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-[rgba(14,22,48,0.18)] backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-[var(--primary-color)] p-6 w-full max-w-xl relative overflow-y-auto max-h-[90vh] animate-slideUp">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-lg font-bold text-[#0E1630]">
                Patient Details
              </h4>
              <div className="flex gap-2 items-center">
                <button
                  onClick={handleEdit}
                  className="btn btn-primary px-6 py-2 shadow-md hover:scale-105 transition-all duration-300 gap-2 flex items-center"
                  title="Edit"
                  type="button"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => S("selectedPatient", null)}
                  className="modal-close-btn text-xl text-gray-400 hover:text-red-500"
                  type="button"
                  title="Close"
                >
                  &times;
                </button>
              </div>
            </div>
            <div className="border p-2 rounded mb-2">
              <h4 className="font-bold mb-1 border-b pb-1 text-xs">
                Basic Info
              </h4>
              <div className="text-xs">
                {ipdState.selectedPatient.name} | Admission:{" "}
                {ipdState.selectedPatient.admissionDate}{" "}
                {ipdState.selectedPatient.admissionTime} | Status:{" "}
                {ipdState.selectedPatient.status}
              </div>
              <div className="text-xs">
                Reason: {ipdState.selectedPatient.reasonForAdmission}
              </div>
            </div>
            <div className="space-y-2">
              <div className="border p-2 rounded">
                <h4 className="font-bold mb-1 border-b pb-1 text-xs">Health</h4>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {["height", "weight", "bloodGroup"].map((k, i) => (
                    <div key={i}>
                      {k.charAt(0).toUpperCase() + k.slice(1)}:{" "}
                      {ipdState.personalDetails?.[k] ||
                        ipdState.selectedPatient[k] ||
                        (k === "bloodGroup" ? "Not recorded" : "—")}
                      {k === "height" && " cm"}
                      {k === "weight" && " kg"}
                    </div>
                  ))}
                </div>
              </div>
              <div className="border p-2 rounded">
                <h4 className="font-bold mb-1 border-b pb-1 text-xs">
                  Treatment
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    ["Dept", "department"],
                    ["Doctor", "doctorInCharge"],
                    ["Treatment", "treatmentPlan"],
                    ["Surgery", "surgeryRequired"],
                  ].map(([label, key], i) => (
                    <div key={i}>
                      {label}: {ipdState.selectedPatient[key] || "—"}
                    </div>
                  ))}
                </div>
              </div>
              <div className="border p-2 rounded">
                <h4 className="font-bold mb-1 border-b pb-1 text-xs">
                  Contact & Address
                </h4>
                <div className="text-xs">
                  <div>
                    Permanent Address:{" "}
                    {ipdState.selectedPatient.permanentAddress || "—"}
                  </div>
                  <div>
                    Temporary Address:{" "}
                    {ipdState.selectedPatient.temporaryAddress || "—"}
                  </div>
                  <div>Email: {ipdState.selectedPatient.email || "—"}</div>
                  <div>DOB: {ipdState.selectedPatient.dob || "—"}</div>
                  <div>
                    Occupation: {ipdState.selectedPatient.occupation || "—"}
                  </div>
                  <div>
                    Blood Group: {ipdState.selectedPatient.bloodGroup || "—"}
                  </div>
                  <div>
                    Password:{" "}
                    {ipdState.selectedPatient.password ? "******" : "—"}
                  </div>
                  <div>
                    Confirm Password:{" "}
                    {ipdState.selectedPatient.confirmPassword ? "******" : "—"}
                  </div>
                </div>
              </div>
               <div className="border p-2 rounded">
                <h4 className="font-bold mb-1 border-b pb-1 text-xs">Vitals</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    ["BP", "bloodPressure"],
                    ["HR", "heartRate"],
                    ["Temp", "temperature"],
                    ["Sugar", "bloodSugar"],
                  ].map(([label, key], i) => (
                    <div key={i}>
                      {label}:{" "}
                      {ipdState.vitals?.[key] ||
                        ipdState.selectedPatient.vitals?.[key] ||
                        "—"}
                    </div>
                  ))}
                </div>
              </div>
              {ipdState.family && ipdState.family.length > 0 && (
                <div className="border p-2 rounded">
                  <h4 className="font-bold mb-1 border-b pb-1 text-xs">
                    Family
                  </h4>
                  <ul className="text-xs list-disc pl-4">
                    {ipdState.family.map((f, i) => (
                      <li key={i}>
                        {f.name} ({f.relation})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}