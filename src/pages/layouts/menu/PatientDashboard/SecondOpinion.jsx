import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import html2pdf from "html2pdf.js";
import emailjs from "emailjs-com";
import DynamicTable from "../../../../components/microcomponents/DynamicTable";
import { ArrowLeft, User, Stethoscope, ChevronDown, X, Printer, CheckCircle, FileText, Pill, TestTube, Mail, MessageCircle, Send, Phone, AtSign, Activity, Heart, Thermometer } from "lucide-react";
import { useSelector } from "react-redux";
import ProfileCard from "../../../../components/microcomponents/ProfileCard";
import { useMedicalRecords } from "../../../../context-api/MedicalRecordsContext";
import { getPatientById, getUrgencyLevels, getConsultationModes, getAllDoctors, getPatientMedicalInfo, getPatientPrescriptionsData, getLabScanByPatient, getPatientVitalById } from "../../../../utils/masterService";
 
const calculateAgeFromDob = (dob) => {
  if (!dob) return null;
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

const PrintContent = ({ requestData, selectedRecord, formData, user, symptoms }) => {
  const isIPDRecord =
    !!selectedRecord?.ipdRecordId ||
    !!selectedRecord?.dateOfAdmission ||
    !!selectedRecord?.dateOfDischarge ||
    String(requestData?.consultationType || "").toUpperCase() === "IPD";

  const formatPrintDate = (value) => {
    if (!value) return "--";
    if (typeof value === "string" && /^\d{8}$/.test(value)) {
      const year = value.slice(0, 4);
      const month = value.slice(4, 6);
      const day = value.slice(6, 8);
      return `${day}/${month}/${year}`;
    }
    const d = new Date(value);
    if (!isNaN(d.getTime())) return d.toLocaleDateString("en-GB");
    return String(value);
  };

  const admissionForPrint = selectedRecord?.dateOfAdmission || requestData?.patientInfo?.AdmissionDate;
  const dischargeForPrint = selectedRecord?.dateOfDischarge || requestData?.patientInfo?.DischargeDate;

  return (
  <div style={{ fontFamily: "Arial, sans-serif", maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
    <div className="header" style={{ textAlign: "center", borderBottom: "2px solid #333", paddingBottom: "20px", marginBottom: "30px" }}>
      <h1 className="h4-heading">SECOND OPINION REQUEST</h1>
      <p style={{ fontSize: "16px", color: "#666", margin: "0" }}>Expert Medical Consultation Form</p>
    </div>
    <div className="request-info" style={{ marginBottom: "25px", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
      <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "15px", color: "#333" }}>Request Information</h3>
      <p><strong>Request ID:</strong> {requestData.id}</p>
      <p><strong>Date of Request:</strong> {requestData.requestDate}</p>
      <p><strong>Status:</strong> Pending Review</p>
    </div>
    <div className="medical-records-attached" style={{ marginBottom: "25px", padding: "15px", backgroundColor: "#e8f5e8", borderRadius: "8px", border: "1px solid #4caf50" }}>
      <h4 style={{ fontSize: "16px", fontWeight: "bold", color: "#2e7d32", marginBottom: "10px" }}>✓ Medical Records Attached</h4>
      <p style={{ margin: "0", color: "#2e7d32" }}>Complete patient medical history, vitals, prescriptions, and lab reports are included with this request.</p>
    </div>
    <div className="patient-section" style={{ marginBottom: "25px" }}>
      <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "15px", color: "#333", borderBottom: "1px solid #ddd", paddingBottom: "5px" }}>Patient Information</h3>
      <div className="patient-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0 30px", rowGap: "10px" }}>
        <div>
          <strong style={{ color: "#555" }}>Patient Name:</strong>
          <span style={{ color: "#0E1630", marginLeft: 8 }}>{selectedRecord?.patientName || user?.firstName || "N/A"}</span>
        </div>
        <div>
          <strong style={{ color: "#555" }}>Age:</strong>
          <span style={{ color: "#0E1630", marginLeft: 8 }}>{(selectedRecord.age !== null && selectedRecord.age !== undefined && selectedRecord.age !== "") ? selectedRecord.age : "--"}</span>
        </div>
        <div>
          <strong style={{ color: "#555" }}>Gender:</strong>
          <span style={{ color: "#0E1630", marginLeft: 8 }}>{(selectedRecord.sex && selectedRecord.sex !== "--") ? selectedRecord.sex : "--"}</span>
        </div>
        <div>
          <strong style={{ color: "#555" }}>Hospital:</strong>
          <span style={{ color: "#0E1630", marginLeft: 8 }}>{selectedRecord.hospitalName || "--"}</span>
        </div>
        <div>
          <strong style={{ color: "#555" }}>Symptoms:</strong>
          <span style={{ color: "#0E1630", marginLeft: 8 }}>{symptoms || selectedRecord.diagnosis || "--"}</span>
        </div>
        {isIPDRecord ? (
          <>
            <div>
              <strong style={{ color: "#555" }}>Date of Admission:</strong>
              <span style={{ color: "#0E1630", marginLeft: 8 }}>{formatPrintDate(admissionForPrint)}</span>
            </div>
            <div>
              <strong style={{ color: "#555" }}>Date of Discharge:</strong>
              <span style={{ color: "#0E1630", marginLeft: 8 }}>{formatPrintDate(dischargeForPrint)}</span>
            </div>
          </>
        ) : (
          <div>
            <strong style={{ color: "#555" }}>Visit Date:</strong>
            <span style={{ color: "#0E1630", marginLeft: 8 }}>{requestData.requestDate || "--"}</span>
          </div>
        )}
        <div>
          <strong style={{ color: "#555" }}>K/C/O:</strong>
          <span style={{ color: "#0E1630", marginLeft: 8 }}>{selectedRecord["K/C/O"] ?? "--"}</span>
        </div>
      </div>
    </div>
    <div className="request-details" style={{ marginBottom: "30px" }}>
      <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "15px", color: "#333", borderBottom: "1px solid #ddd", paddingBottom: "5px" }}>Consultation Request Details</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0 30px", rowGap: "10px" }}>
        {Object.entries(formData).filter(([key]) => !["contactEmail", "contactPhone"].includes(key)).map(([key, value]) => (
          <div key={key} style={{ marginBottom: "0" }}>
            <strong style={{ color: "#555" }}>{key.replace(/([A-Z])/g, " $1") + ":"}</strong>
            <span style={{ color: "#01D48C", marginLeft: 8 }}>{value || "Not specified"}</span>
          </div>
        ))}
      </div>
    </div>
    <div style={{ pageBreakBefore: 'always', breakBefore: 'page', marginTop: "40px", fontFamily: "Arial, sans-serif", maxWidth: "900px", marginLeft: "auto", marginRight: "auto" }}>
      <div style={{ padding: "24px", background: "linear-gradient(90deg, #01B07A 0%, #1A223F 100%)", color: "#fff", borderRadius: "18px 18px 0 0" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "8px" }}>Medical Records Preview</h2>
        <p style={{ fontSize: "16px", color: "#e0e0e0", marginBottom: 0 }}>Complete patient medical information</p>
      </div>
      <div style={{ background: "#fff", borderRadius: "0 0 18px 18px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", padding: "32px" }}>
        <div style={{ marginBottom: "24px" }}>
          <h3 style={{ fontSize: "22px", fontWeight: "bold", color: "#1A223F", marginBottom: "12px" }}>{selectedRecord?.patientName || user?.firstName || 'N/A'}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px", fontSize: "15px", color: "#333" }}>
            <div>Age: { (selectedRecord.age !== null && selectedRecord.age !== undefined && selectedRecord.age !== "") ? selectedRecord.age : "--" }</div>
            <div>Gender: { (selectedRecord.sex && selectedRecord.sex !== "--") ? selectedRecord.sex : "--" }</div>
            <div>Hospital: {selectedRecord.hospitalName}</div>
            <div>Symptoms: {symptoms}</div>
            <div>K/C/O: {selectedRecord["K/C/O"] ?? "--"}</div>
          </div>
        </div>
        <div style={{ marginBottom: "24px" }}>
          <h4 style={{ fontSize: "18px", fontWeight: "bold", color: "#0E1630", marginBottom: "10px" }}>Vitals Summary</h4>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {Object.entries(selectedRecord.vitals || {}).map(([key, value], idx) => {
              const colors = ["#FEE2E2", "#DBEAFE", "#FFF7ED", "#DCFCE7", "#ECFEFF", "#F5F3FF", "#FFF7E6"];
              const borderColor = colors[idx % colors.length];
              return (
                <div key={key} style={{ minWidth: 120, padding: "10px 12px", borderRadius: 12, borderLeft: `4px solid ${borderColor}`, background: "#fff", boxShadow: "0 1px 2px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column" }}>
                  <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>{key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#0E1630" }}>{value ?? "--"}</div>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ marginBottom: "24px" }}>
          <h4 style={{ fontSize: "18px", fontWeight: "bold", color: "#0E1630", marginBottom: "10px" }}>Medical Information</h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
            {["chiefComplaint", "pastHistory", "plan", "advice"].map((fieldKey) => {
              const value = (selectedRecord?.medicalDetails || {})[fieldKey];
              if (!value || String(value).trim() === "") return null;
              const label = fieldKey.replace(/([A-Z])/g, " $1");
              return (
                <div key={fieldKey} style={{ background: "#fff", border: "1px solid #f3f4f6", borderRadius: "10px", padding: "16px" }}>
                  <div style={{ fontWeight: "bold", fontSize: "13px", color: "#666", marginBottom: "4px" }}>{label}</div>
                  <div className="cc-scrollbar" style={{ color: "#222", fontSize: "14px" }}>{value}</div>
                </div>
              );
            }).filter(Boolean)}
          </div>
        </div>
        <div style={{ marginBottom: "24px" }}>
          <h4 style={{ fontSize: "18px", fontWeight: "bold", color: "#0E1630", marginBottom: "10px" }}>Prescriptions</h4>
          <DynamicTable
            title=""
            columns={[
              { header: "Date", accessor: "date" },
              { header: "Doctor Name", accessor: "doctorName" },
              { header: "Medicines", accessor: "medicines" },
              { header: "Instructions", accessor: "instructions" }
            ]}
            data={selectedRecord.prescriptionsData || []}
            showSearchBar={false}
            showPagination={false}
            noDataMessage="No prescriptions found."
          />
        </div>
        <div>
          <h4 style={{ fontSize: "18px", fontWeight: "bold", color: "#0E1630", marginBottom: "10px" }}>Lab Tests</h4>
          <DynamicTable
            title=""
            columns={[
              { header: "Date", accessor: "date" },
              { header: "Test Name", accessor: "testName" },
              { header: "Result", accessor: "result" },
              { header: "Normal Range", accessor: "normalRange" },
              { 
                header: "Status", 
                accessor: "status",
                cell: (row) => (
                  <span style={{ 
                    display: "inline-block", 
                    padding: "2px 8px", 
                    borderRadius: "8px", 
                    background: row.status === "Normal" ? "#bbf7d0" : "#fecaca", 
                    color: row.status === "Normal" ? "#166534" : "#991b1b", 
                    fontWeight: 600 
                  }}>
                    {row.status}
                  </span>
                )
              }
            ]}
            data={selectedRecord.labTestsData || []}
            showSearchBar={false}
            showPagination={false}
            noDataMessage="No lab test records found."
          />
        </div>
      </div>
    </div>
  </div>
  );
};

const MedicalRecordsDetailsPreview = ({ selectedRecord, onClose, user, symptoms, recordTab }) => {
  if (!selectedRecord) return null;
  const [detailsActiveTab, setDetailsActiveTab] = useState("medical-records");
  const isIPD = String(recordTab || "").toUpperCase() === "IPD";
  const isIPDRecord = isIPD || !!selectedRecord.ipdRecordId;
  const displayAge = (selectedRecord.age !== null && selectedRecord.age !== undefined && selectedRecord.age !== "") ? String(selectedRecord.age) : "--";
  const displayGender = (selectedRecord.sex && selectedRecord.sex !== "--") ? selectedRecord.sex : "--";
  const rawVisitDate = selectedRecord.dateOfVisit || selectedRecord.dateOfAdmission || selectedRecord.dateOfConsultation;
  const formatVisitDate = (value) => {
    if (!value) return "--";
    if (typeof value === "string" && /^\d{8}$/.test(value)) {
      const year = value.slice(0, 4);
      const month = value.slice(4, 6);
      const day = value.slice(6, 8);
      return `${day}/${month}/${year}`;
    }
    const d = new Date(value);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString("en-GB");
    }
    return String(value);
  };
  const formattedVisitDate = formatVisitDate(rawVisitDate);
  const formattedAdmissionDate = isIPDRecord ? formatVisitDate(selectedRecord.dateOfAdmission) : null;
  const formattedDischargeDate = isIPDRecord ? formatVisitDate(selectedRecord.dateOfDischarge) : null;

  const profileFields = [
    { label: "Age", value: displayAge },
    { label: "Gender", value: displayGender },
    { label: "Hospital", value: selectedRecord.hospitalName },
    { label: "Symptoms", value: symptoms },
    ...(isIPDRecord
      ? [
          { label: "Date of Admission", value: formattedAdmissionDate || "--" },
          { label: "Date of Discharge", value: formattedDischargeDate || "--" },
        ]
      : [
          { label: "Visit Date", value: formattedVisitDate },
        ]),
    // { label: "K/C/O", value: selectedRecord["K/C/O"] ?? "--" },
  ];
  const renderTabContent = () => {
    const tabContentMap = {
      "medical-records": (
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <FileText size={24} className="text-blue-600" />
              <h3 className="text-xl font-semibold">Medical Information</h3>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">View Original</button>
          </div>
          <section className="mb-6">
            <h4 className="text-xl font-semibold text-gray-800 mb-4">Medical Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(selectedRecord?.medicalDetails || {})
                .filter(([key]) => !["id", "doctorId", "context", "patientId", "createdAt", "updatedAt", "createdBy", "updatedBy"].includes(key))
                .map(([label, value]) => {
                  const keyName = String(label).replace(/\s+/g, "").toLowerCase();
                  const isPreviewField = ["chiefcomplaint", "pasthistory", "history", "advice", "plan", "clinicalnotes"].includes(keyName);
                  return (
                    <div key={label} className="bg-white p-6 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                      <div className="font-bold text-sm text-gray-600 mb-2">{label.replace(/([A-Z])/g, " $1")}</div>
                      {isPreviewField ? (
                        <div className="cc-scrollbar text-gray-800 text-sm">{value || "N/A"}</div>
                      ) : (
                        <div className="text-gray-800 text-sm">{value || "N/A"}</div>
                      )}
                    </div>
                  );
                })}
            </div>
          </section>
        </div>
      ),
      prescriptions: (
        <DynamicTable
          columns={[
            { header: "Date", accessor: "date" },
            { header: "Doctor Name", accessor: "doctorName" },
            { header: "Medicines", accessor: "medicines" },
            { header: "Instructions", accessor: "instructions" },
          ]}
          data={selectedRecord.prescriptionsData || []}
        />
      ),
      "lab-tests": (
        <DynamicTable
          columns={[
            { header: "Date", accessor: "date" },
            { header: "Test Name", accessor: "testName" },
            { header: "Result", accessor: "result" },
            { header: "Normal Range", accessor: "normalRange" },
            {
              header: "Status",
              accessor: "status",
              cell: (row) => (
                <span className={`text-sm font-semibold px-2 py-1 rounded-full ${row.status === "Normal" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                  {row.status}
                </span>
              ),
            },
          ]}
          data={selectedRecord.labTestsData || []}
        />
      ),
    };
    return tabContentMap[detailsActiveTab] || null;
  };
  const detailsTabs = [
    { id: "medical-records", label: "Medical Records", icon: FileText },
    { id: "prescriptions", label: "Prescriptions", icon: Pill },
    { id: "lab-tests", label: "Lab Tests", icon: TestTube },
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-auto m-4">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between mb-6 border-b pb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Medical Records Preview</h2>
              <p className="text-gray-600">Complete patient medical information</p>
            </div>
            <button onClick={onClose} className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-gray-100">
              <X size={20} />
              Close
            </button>
          </div>
          <ProfileCard
            initials={(selectedRecord?.patientName && selectedRecord.patientName.charAt(0)) || user?.firstName?.charAt(0) || "N"}
            name={selectedRecord?.patientName || `${user?.firstName || "N/A"} ${user?.lastName || ""}`}
            fields={profileFields}
          />
          <section className="mb-6">
            <h4 className="text-xl font-semibold text-gray-800 mb-4">Vitals Summary</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3 p-2">
              {[
                { key: "Blood Pressure", icon: Heart, color: "red" },
                { key: "Heart Rate", icon: Activity, color: "blue" },
                { key: "Temperature", icon: Thermometer, color: "orange" },
                { key: "SpO2", icon: Activity, color: "emerald" },
                { key: "Respiratory Rate", icon: Activity, color: "violet" },
                { key: "Height", icon: Activity, color: "cyan" },
                { key: "Weight", icon: Activity, color: "amber" },
              ].map(({ key, icon: Icon, color }) => {
                const colorMap = {
                  red: "red",
                  blue: "blue",
                  orange: "orange",
                  emerald: "emerald",
                  violet: "violet",
                  cyan: "cyan",
                  amber: "amber",
                };
                const c = colorMap[color];
                const value = (selectedRecord.vitals || {})[key] ?? "--";
                return (
                  <div
                    key={key}
                    className={`bg-${c}-50 border-l-4 border-${c}-500 p-3 rounded-lg shadow-sm flex flex-col justify-between hover:shadow-md transition`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {Icon && <Icon size={16} className={`text-${c}-500`} />}
                      <span className={`text-xs md:text-sm font-medium text-${c}-700 truncate`}>
                        {key}
                      </span>
                    </div>
                    <div className={`text-sm md:text-base font-semibold text-${c}-800 truncate`}>
                      {value || "--"}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
          <section className="mb-6">
            <h4 className="text-xl font-semibold text-gray-800 mb-4">Medical Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { key: "chiefComplaint", label: "Chief Complaint" },
                { key: "pastHistory", label: "Past History" },
                { key: "plan", label: "Treatment Plan" },
                { key: "advice", label: "Medical Advice" },
                ...(isIPD ? [{ key: "dischargeSummary", label: "Discharge Summary" }] : []),
              ]
                .map((field) => {
                  const value = (selectedRecord?.medicalDetails || {})[field.key];
                  if (!value || String(value).trim() === "") return null;
                  return (
                    <div key={field.key} className="bg-white p-6 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                      <div className="font-bold text-sm text-gray-600 mb-2">{field.label}</div>
                      <div className="cc-scrollbar text-gray-800 text-sm">{value}</div>
                    </div>
                  );
                })
                .filter(Boolean)}
            </div>
          </section>
          <section className="mb-6">
            <h4 className="text-xl font-semibold text-gray-800 mb-4">Prescriptions</h4>
            <DynamicTable
              columns={[
                { header: "Date", accessor: "date" },
                { header: "Doctor Name", accessor: "doctorName" },
                { header: "Medicines", accessor: "medicines" },
                { header: "Instructions", accessor: "instructions" },
              ]}
              data={selectedRecord.prescriptionsData || []}
            />
          </section>
          <section className="mb-6">
            <h4 className="text-xl font-semibold text-gray-800 mb-4">Lab Tests</h4>
            <DynamicTable
              columns={[
                { header: "Date", accessor: "date" },
                { header: "Test Name", accessor: "testName" },
                { header: "Result", accessor: "result" },
                { header: "Normal Range", accessor: "normalRange" },
                {
                  header: "Status",
                  accessor: "status",
                  cell: (row) => (
                    <span className={`text-sm font-semibold px-2 py-1 rounded-full ${row.status === "Normal" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {row.status}
                    </span>
                  ),
                },
              ]}
              data={selectedRecord.labTestsData || []}
            />
          </section>
        </div>
      </div>
    </div>
  );
};

const SecondOpinion = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);
  const { clickedRecord, recordTab } = useMedicalRecords();
  const printContentRef = useRef();
  const selectedRecordBase = location.state?.selectedRecord || {
    // patientName: "Kavya Patil",
    // age: "30",
    // sex: "--",
    // id: "P001",
    // hospitalName: "AV Hospital",
    // diagnosis: "Headache",
    // dateOfVisit: "20251121",
    // "K/C/O": "--",
    // vitals: { bp: "120/80", pulse: "72", temp: "98.6" },
    // medicalDetails: {
    //   chiefComplaint: "Headache since 2 days",
    //   pastHistory: "No significant past history",
    //   examination: "Normal",
    // },
    prescriptionsData: [],
    labTestsData: [],
  };
  const recordId = selectedRecordBase?.recordId || selectedRecordBase?.id || selectedRecordBase?.recordID || clickedRecord?.recordId || clickedRecord?.id || clickedRecord?.recordID;
  const recordQueryParams = useMemo(() => {
    if (!recordId) {
      return undefined;
    }
    const tab = String(recordTab || "").toUpperCase();
    let params;
    if (tab === "OPD") params = { opdRecordId: recordId };
    else if (tab === "IPD") params = { ipdRecordId: recordId };
    else if (tab === "VIRTUAL") params = { virtualRecordId: recordId };
    else params = undefined;
    return params;
  }, [recordId, recordTab]);

  const [prescriptionsData, setPrescriptionsData] = useState([]);
  const [prescriptionError, setPrescriptionError] = useState(null);
  const [labTestsData, setLabTestsData] = useState([]);
  const [labError, setLabError] = useState(null);
  const [vitalsData, setVitalsData] = useState({});
  const [patientBasics, setPatientBasics] = useState({ gender: null, dob: null, age: null });

  useEffect(() => {
    const pid = selectedRecordBase?.patientId || selectedRecordBase?.id || user?.patientId || user?.id;
    if (!pid) {
      return;
    }
    let mounted = true;
    (async () => {
      try {
        const vitalsParams = {
          ...(recordQueryParams || {}),
          consultationType: recordTab,
        };
        const response = await getPatientVitalById(pid, vitalsParams);
        const payload = response?.data?.data ?? response?.data;
        const patientVitals = Array.isArray(payload) ? payload[0] ?? null : payload;
        if (!mounted) return;
        if (patientVitals) {
          const formatted = {
            "Blood Pressure": patientVitals.bloodPressure || patientVitals.blood_pressure || "--",
            "Heart Rate": patientVitals.heartRate || patientVitals.heart_rate || "--",
            "Temperature": patientVitals.temperature || patientVitals.temp || "--",
            "SpO2": patientVitals.spO2 || patientVitals.spo2 || "--",
            "Respiratory Rate": patientVitals.respiratoryRate || patientVitals.respiratory_rate || "--",
            "Height": patientVitals.height || "--",
            "Weight": patientVitals.weight || "--",
          };
          setVitalsData(formatted);
        } else {
          setVitalsData({});
        }
      } catch (err) {
        if (!mounted) return;
        setVitalsData({});
      }
    })();
    return () => {
      mounted = false;
    };
  }, [selectedRecordBase, user, recordQueryParams, recordTab]);

  useEffect(() => {
    const pid = selectedRecordBase?.patientId || selectedRecordBase?.id || user?.patientId || user?.id;
    if (!pid) return;
    let mounted = true;
    (async () => {
      try {
        const res = await getPatientById(pid);
        const data = res?.data?.data || res?.data || {};
        const dob = data.dob || data.dateOfBirth;
        const gender = data.gender || data.sex;
        const age = calculateAgeFromDob(dob);
        if (!mounted) return;
        setPatientBasics({
          gender: gender || "--",
          dob: dob || null,
          age: age ?? (selectedRecordBase?.age || null),
        });
      } catch (e) {
        if (!mounted) return;
        setPatientBasics((prev) => ({
          ...prev,
          age: prev.age ?? (selectedRecordBase?.age || null),
          gender: prev.gender || selectedRecordBase?.sex || selectedRecordBase?.gender || "--",
        }));
      }
    })();
    return () => {
      mounted = false;
    };
  }, [selectedRecordBase, user]);

  useEffect(() => {
    const pid = selectedRecordBase?.patientId || selectedRecordBase?.id || user?.patientId || user?.id;
    if (!pid) return;
    let mounted = true;
    (async () => {
      try {
        const response = await getPatientPrescriptionsData(pid, recordQueryParams);
        let prescriptions = response.data?.data || response.data;
        if (!Array.isArray(prescriptions)) {
          prescriptions = prescriptions ? [prescriptions] : [];
        }
        const formatted = prescriptions.map((prescription) => {
          let medicinesText = "";
          let instructionsText = "";

          if (Array.isArray(prescription.medicines)) {
            const medsArray = prescription.medicines;
            medicinesText = medsArray
              .map((med) => {
                const name = med.medicineName || med.name || "";
                const dosage = med.dosage ? `${med.dosage}` : "";
                const unit = med.dosageUnit || "";
                const duration = med.duration || "";
                const parts = [name, dosage && unit ? `${dosage} ${unit}` : dosage || unit, duration && `for ${duration}`]
                  .filter(Boolean)
                  .join(" ");
                return parts || null;
              })
              .filter(Boolean)
              .join(", ");

            instructionsText = medsArray
              .map((med) => (med.intake ? `Take ${med.intake}.` : null))
              .filter(Boolean)
              .join(" ");
          } else {
            if (typeof prescription.medicines === "string") {
              medicinesText = prescription.medicines;
            }
            if (typeof prescription.instructions === "string") {
              instructionsText = prescription.instructions;
            }
          }

          return {
            id: prescription.id || prescription.prescriptionId,
            date: prescription.prescribedAt
              ? new Date(prescription.prescribedAt).toLocaleDateString("en-GB")
              : prescription.date || "N/A",
            doctorName: prescription.doctorName || "N/A",
            medicines: medicinesText || "N/A",
            instructions: instructionsText || "N/A",
          };
        });
        if (!mounted) return;
        setPrescriptionsData(formatted);
        setPrescriptionError(null);
      } catch (err) {
        if (!mounted) return;
        setPrescriptionError(err.response?.data?.message || "Failed to fetch prescriptions.");
        setPrescriptionsData([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [selectedRecordBase, user, recordQueryParams]);

  useEffect(() => {
    const pid = selectedRecordBase?.patientId || selectedRecordBase?.id || user?.patientId || user?.id;
    if (!pid) return;
    let mounted = true;
    (async () => {
      try {
        const response = await getLabScanByPatient(pid, recordQueryParams);
        let labScans = response.data?.data || response.data;
        if (!Array.isArray(labScans)) {
          labScans = labScans ? [labScans] : [];
        }
        const formatted = labScans.map((labScan) => {
          return {
            id: labScan.id || labScan.labScanId,
            date: labScan.scanDate
              ? new Date(labScan.scanDate).toLocaleDateString("en-GB")
              : "N/A",
            testName: labScan.testName || "N/A",
            result: labScan.result || "N/A",
            normalRange: labScan.normalRange || "N/A",
            status: labScan.status || "N/A",
          };
        });
        if (!mounted) return;
        setLabTestsData(formatted);
        setLabError(null);
      } catch (err) {
        if (!mounted) return;
        setLabError(err.response?.data?.message || "Failed to fetch lab scans.");
        setLabTestsData([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [selectedRecordBase, user, recordQueryParams]);

  const selectedRecord = {
    ...selectedRecordBase,
    age: patientBasics.age ?? selectedRecordBase?.age,
    sex: patientBasics.gender || selectedRecordBase?.sex || selectedRecordBase?.gender || "--",
    prescriptionsData: prescriptionsData.length ? prescriptionsData : (selectedRecordBase?.prescriptionsData || []),
    clinicalNotes: selectedRecordBase?.clinicalNotes || [],
    vitals: Object.keys(vitalsData || {}).length ? vitalsData : (selectedRecordBase.vitals || {}),
    medicalDetails: selectedRecordBase.medicalDetails || {},
    labTestsData: labTestsData.length ? labTestsData : (selectedRecordBase.labTestsData || []),
  };
  const displayAge = (selectedRecord.age !== null && selectedRecord.age !== undefined && selectedRecord.age !== "") ? String(selectedRecord.age) : "--";
  const displayGender = (selectedRecord.sex && selectedRecord.sex !== "--") ? selectedRecord.sex : "--";
  const symptoms = clickedRecord?.symptomNames?.join(", ") || "--";
  const rawVisitDate = selectedRecord.dateOfVisit || selectedRecord.dateOfAdmission || selectedRecord.dateOfConsultation;
  const formatVisitDate = (value) => {
    if (!value) return "--";
    if (typeof value === "string" && /^\d{8}$/.test(value)) {
      const year = value.slice(0, 4);
      const month = value.slice(4, 6);
      const day = value.slice(6, 8);
      return `${day}/${month}/${year}`;
    }
    const d = new Date(value);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString("en-GB");
    }
    return String(value);
  };
  const formattedVisitDate = formatVisitDate(rawVisitDate);
  const isIPD = String(recordTab || "").toUpperCase() === "IPD";
  const isIPDRecord = isIPD || !!selectedRecord.ipdRecordId;
  const admissionSource = selectedRecord.dateOfAdmission || clickedRecord?.dateOfAdmission;
  const dischargeSource = selectedRecord.dateOfDischarge || clickedRecord?.dateOfDischarge;
  const formattedAdmissionDate = isIPDRecord ? formatVisitDate(admissionSource) : null;
  const formattedDischargeDate = isIPDRecord ? formatVisitDate(dischargeSource) : null;

  const profileFields = [
    { label: "Age", value: displayAge },
    { label: "Gender", value: displayGender },
    { label: "Hospital", value: selectedRecord.hospitalName },
    { label: "Symptomes", value: symptoms },
    ...(isIPDRecord
      ? [
          { label: "Date of Admission", value: formattedAdmissionDate || "--" },
          { label: "Date of Discharge", value: formattedDischargeDate || "--" },
        ]
      : [
          { label: "Visit Date", value: formattedVisitDate },
        ]),
    { label: "K/C/O", value: selectedRecord["K/C/O"] ?? "--" },
  ];

  const [formData, setFormData] = useState({
    selectedDoctor: "",
    urgencyLevel: "",
    preferredMode: "",
    additionalNotes: "",
    contactEmail: "",
    contactPhone: "",
  });
  const [showMedicalRecords, setShowMedicalRecords] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSending, setIsSending] = useState({ whatsapp: false, email: false });
  const [doctors, setDoctors] = useState(["Dr. Rajesh Kumar (Cardiologist)", "Dr. Priya Sharma (Physician)", "Dr. Amit Patel (Neurologist)", "Dr. Sunita Reddy (Gastroenterologist)"]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [urgencyLevels, setUrgencyLevels] = useState([
  
  ]);
  const [consultationModes, setConsultationModes] = useState([
   
  ]);
  const [urgencyLoading, setUrgencyLoading] = useState(false);
  const [consultLoading, setConsultLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setDoctorsLoading(true);
      try {
        const res = await getAllDoctors();
        const list = Array.isArray(res?.data) ? res.data.map(d => {
          const nameParts = [d.firstName, d.middleName, d.lastName].filter(Boolean).join(' ');
          const spec = d.specialization || d.specializationName || '';
          const label = `Dr. ${nameParts}${spec ? ` (${spec})` : ''}`;
          return label;
        }) : [];
        if (list.length) setDoctors(list);
      } catch (err) {
        console.debug('Failed to fetch doctors:', err?.message || err);
      } finally {
        if (mounted) setDoctorsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setUrgencyLoading(true);
      setConsultLoading(true);
      try {
        const [uRes, cRes] = await Promise.all([
          getUrgencyLevels().catch(() => ({ data: [] })),
          getConsultationModes().catch(() => ({ data: [] })),
        ]);
        if (!mounted) return;
        const mapToOptions = (arr, labelKeys = ["label", "name", "modeName", "urgencyLevelName", "consultationModeName", "urgencyTiming", "displayName", "title"], valueKeys = ["value", "id", "code"]) => {
          if (!Array.isArray(arr)) return [];
          return arr.map((item) => {
            let label = null;
            for (const k of labelKeys) {
              const v = item?.[k];
              if (typeof v === 'string' || typeof v === 'number') { label = v; break; }
            }
            if (!label) {
              for (const k of Object.keys(item || {})) {
                const v = item[k];
                if (typeof v === 'string' || typeof v === 'number') { label = v; break; }
              }
            }
            if (!label) {
              try { label = JSON.stringify(item); } catch (e) { label = String(item); }
            }
            let value = null;
            for (const k of valueKeys) {
              if (item?.[k] !== undefined) { value = item[k]; break; }
            }
            if (value === null || value === undefined) value = label;
            return { label: String(label), value };
          });
        };
        const uOptions = mapToOptions(uRes.data || []);
        const cOptions = mapToOptions(cRes.data || []);
        if (uOptions.length) setUrgencyLevels(uOptions);
        if (cOptions.length) setConsultationModes(cOptions);
      } catch (err) {
        console.debug('Failed to load urgency/consultation options', err?.message || err);
      } finally {
        if (mounted) {
          setUrgencyLoading(false);
          setConsultLoading(false);
        }
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleInputChange = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));
  const handleDoctorSelect = (doctor) => { setFormData((prev) => ({ ...prev, selectedDoctor: doctor })); setIsDropdownOpen(false); };
  const handleBack = () => navigate(-1);
  const isFormValid = () => {
    return formData.selectedDoctor && formData.urgencyLevel && formData.preferredMode;
  };
  const isWhatsappValid = /^\d{10}$/.test((formData.contactPhone || "").trim());
  const handlePreview = () => {
    if (!isFormValid()) {
      toast.error("Please fill in all required fields (Doctor, Urgency Level, and Preferred Consultation Mode).");
      return;
    }
    setShowPrintPreview(true);
  };
  const generateRequestData = () => ({
    id: `SO-${Date.now()}`,
    requestDate: new Date().toLocaleDateString("en-GB"),
    patientInfo: {
      Name: selectedRecord?.patientName || user?.firstName || 'N/A',
      Age: selectedRecord.age,
      Sex: selectedRecord.sex,
      patientId: selectedRecord.id,
      HospitalName: selectedRecord.hospitalName,
      Diagnosis: selectedRecord.diagnosis,
      VisitDate: formattedVisitDate,
    },
  });
  const generateMessageContent = () => {
    const requestData = generateRequestData();
    return {
      subject: `Second Opinion Request - ${requestData.patientInfo.Name} (${requestData.id})`,
      body: `SECOND OPINION REQUEST\n\nRequest Details:\n• Request ID: ${requestData.id}\n• Date: ${requestData.requestDate}\n• Status: Pending Review\n\nPatient Information:\n• Name: ${requestData.patientInfo.Name}\n• Age: ${requestData.patientInfo.Age}\n• Gender: ${requestData.patientInfo.Sex}\n• Hospital: ${requestData.patientInfo.HospitalName}\n• Diagnosis: ${requestData.patientInfo.Diagnosis}\n• Visit Date: ${requestData.patientInfo.VisitDate}\n• K/C/O: ${selectedRecord["K/C/O"] ?? "--"}\n\nConsultation Request Details:\n• Selected Doctor: ${formData.selectedDoctor || "Not specified"}\n• Urgency Level: ${formData.urgencyLevel || "Not specified"}\n• Preferred Mode: ${formData.preferredMode || "Not specified"}\n• Additional Notes: ${formData.additionalNotes || "Not specified"}\n\nMedical Records: Complete patient medical history, vitals, prescriptions, and lab reports are included with this request.\n\nGenerated on: ${new Date().toLocaleString()}\nFor queries, please contact the medical records department.`
    };
  };
  const generateMedicalRecordsPreviewHTML = () => {
    return `
      <div style="margin-top:40px; font-family: Arial, sans-serif; max-width: 900px; margin-left:auto; margin-right:auto;">
        <div style="padding: 24px; background: linear-gradient(90deg, #01B07A 0%, #1A223F 100%); color: #fff; border-radius: 18px 18px 0 0;">
          <h2 style="font-size: 28px; font-weight: bold; margin-bottom: 8px;">Medical Records Preview</h2>
          <p style="font-size: 16px; color: #e0e0e0; margin-bottom: 0;">Complete patient medical information</p>
        </div>
        <div style="background: #fff; border-radius: 0 0 18px 18px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); padding: 32px;">
          <div style="margin-bottom: 24px;">
            <h3 style="font-size: 22px; font-weight: bold; color: #1A223F; margin-bottom: 12px;">${selectedRecord?.patientName || user?.firstName || 'N/A'}</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; font-size: 15px; color: #333;">
              <div>Age: ${ (selectedRecord.age !== null && selectedRecord.age !== undefined && selectedRecord.age !== "") ? selectedRecord.age : "--" }</div>
              <div>Gender: ${ (selectedRecord.sex && selectedRecord.sex !== "--") ? selectedRecord.sex : "--" }</div>
              <div>Hospital: ${selectedRecord.hospitalName}</div>
              <div>Symptoms: ${symptoms}</div>
              <div>K/C/O: ${selectedRecord["K/C/O"] ?? "--"}</div>
            </div>
          </div>
          <div style="margin-bottom: 24px;">
            <h4 style="font-size: 18px; font-weight: bold; color: #0E1630; margin-bottom: 10px;">Vitals Summary</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 10px;">
              ${Object.entries(selectedRecord.vitals || {}).map(([key, value]) => {
                const getFormattedValue = (key, value) => {
                  if (!value) return "--";
                  switch(key) {
                    case "Blood Pressure": return value + " mmHg";
                    case "Heart Rate": return value + " bpm";
                    case "Temperature": return value + " °F";
                    case "SpO2": return value + " %";
                    case "Respiratory Rate": return value + " /min";
                    default: return value;
                  }
                };
                const colors = {
                  "Blood Pressure": "#fee2e2",
                  "Heart Rate": "#dbeafe",
                  "Temperature": "#fff7ed",
                  "SpO2": "#dcfce7",
                  "Respiratory Rate": "#ecfeff"
                };
                return `
                  <div style='background:#fff; border-radius:8px; padding:12px; border-left:4px solid ${colors[key] || "#f5f3ff"}; box-shadow:0 1px 2px rgba(0,0,0,0.04);'>
                    <div style='font-size:12px; color:#666; margin-bottom:4px;'>${key}</div>
                    <div style='font-size:15px; font-weight:600; color:#222;'>${getFormattedValue(key, value)}</div>
                  </div>
                `;
              }).join("")}
            </div>
          </div>
          <div style="margin-bottom: 24px;">
            <h4 style="font-size: 18px; font-weight: bold; color: #0E1630; margin-bottom: 10px;">Medical Information</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px;">
              ${Object.entries(selectedRecord?.medicalDetails || {})
                .filter(([key]) => !["id", "doctorId", "context", "patientId", "createdAt", "updatedAt", "createdBy", "updatedBy"].includes(key))
                .map(([label, value]) => `
                  <div style='background:#fff; border:1px solid #f3f4f6; border-radius:10px; padding:16px;'>
                    <div style='font-weight:bold; font-size:13px; color:#666; margin-bottom:4px;'>${label.replace(/([A-Z])/g, " $1")}</div>
                    <div style='color:#222; font-size:14px;'>${value || "N/A"}</div>
                  </div>
                `).join("")}
            </div>
          </div>
          <div style="margin-bottom: 24px;">
            <h4 style="font-size: 18px; font-weight: bold; color: #0E1630; margin-bottom: 10px;">Prescriptions</h4>
            <table style='width:100%; border-collapse:collapse; font-size:14px;'>
              <thead>
                <tr style='background:#f1f5f9;'>
                  <th style='padding:8px; border:1px solid #e5e7eb;'>Date</th>
                  <th style='padding:8px; border:1px solid #e5e7eb;'>Doctor Name</th>
                  <th style='padding:8px; border:1px solid #e5e7eb;'>Medicines</th>
                  <th style='padding:8px; border:1px solid #e5e7eb;'>Instructions</th>
                </tr>
              </thead>
              <tbody>
                ${(selectedRecord.prescriptionsData || []).map(row => `
                  <tr>
                    <td style='padding:8px; border:1px solid #e5e7eb;'>${row.date}</td>
                    <td style='padding:8px; border:1px solid #e5e7eb;'>${row.doctorName}</td>
                    <td style='padding:8px; border:1px solid #e5e7eb;'>${row.medicines}</td>
                    <td style='padding:8px; border:1px solid #e5e7eb;'>${row.instructions}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
          <div>
            <h4 style="font-size: 18px; font-weight: bold; color: #0E1630; margin-bottom: 10px;">Lab Tests</h4>
            <table style='width:100%; border-collapse:collapse; font-size:14px;'>
              <thead>
                <tr style='background:#f1f5f9;'>
                  <th style='padding:8px; border:1px solid #e5e7eb;'>Date</th>
                  <th style='padding:8px; border:1px solid #e5e7eb;'>Test Name</th>
                  <th style='padding:8px; border:1px solid #e5e7eb;'>Result</th>
                  <th style='padding:8px; border:1px solid #e5e7eb;'>Normal Range</th>
                  <th style='padding:8px; border:1px solid #e5e7eb;'>Status</th>
                </tr>
              </thead>
              <tbody>
                ${(selectedRecord.labTestsData || []).map(row => `
                  <tr>
                    <td style='padding:8px; border:1px solid #e5e7eb;'>${row.date}</td>
                    <td style='padding:8px; border:1px solid #e5e7eb;'>${row.testName}</td>
                    <td style='padding:8px; border:1px solid #e5e7eb;'>${row.result}</td>
                    <td style='padding:8px; border:1px solid #e5e7eb;'>${row.normalRange}</td>
                    <td style='padding:8px; border:1px solid #e5e7eb;'><span style='display:inline-block; padding:2px 8px; border-radius:8px; background:${row.status === "Normal" ? "#bbf7d0" : "#fecaca"}; color:${row.status === "Normal" ? "#166534" : "#991b1b"}; font-weight:600;'>${row.status}</span></td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  };
  const generatePrintTemplate = () => {
    const requestData = generateRequestData();
    const patientInfoGrid = `
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0 30px; row-gap: 10px;">
        <div><strong>Name:</strong> <span style='color:#0E1630;'>${requestData.patientInfo.Name}</span></div>
        <div><strong>Age:</strong> <span style='color:#0E1630;'>${requestData.patientInfo.Age}</span></div>
        <div><strong>Gender:</strong> <span style='color:#0E1630;'>${requestData.patientInfo.Sex}</span></div>
        <div><strong>Patient ID:</strong> <span style='color:#0E1630;'>${requestData.patientInfo.patientId}</span></div>
        <div><strong>Hospital:</strong> <span style='color:#0E1630;'>${requestData.patientInfo.HospitalName}</span></div>
        <div><strong>Diagnosis:</strong> <span style='color:#0E1630;'>${symptoms}</span></div>
        <div><strong>Visit Date:</strong> <span style='color:#0E1630;'>${requestData.patientInfo.VisitDate}</span></div>
        ${isIPDRecord
          ? `<div><strong>Date of Admission:</strong> <span style='color:#0E1630;'>${formattedAdmissionDate || '--'}</span></div>
             <div><strong>Date of Discharge:</strong> <span style='color:#0E1630;'>${formattedDischargeDate || '--'}</span></div>`
          : ''}

      </div>
    `;
    const consultDetailsGrid = `
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0 30px; row-gap: 10px;">
        <div><strong>Selected Doctor:</strong> <span style='color:#01D48C;'>${formData.selectedDoctor || "Not specified"}</span></div>
        <div><strong>Urgency Level:</strong> <span style='color:#01D48C;'>${formData.urgencyLevel || "Not specified"}</span></div>
        <div><strong>Preferred Mode:</strong> <span style='color:#01D48C;'>${formData.preferredMode || "Not specified"}</span></div>
        <div><strong>Additional Notes:</strong> <span style='color:#01D48C;'>${formData.additionalNotes || "Not specified"}</span></div>
      </div>
    `;
    return `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px;">
          <h1 style="font-size: 24px; font-weight: bold; margin: 0 0 10px 0; text-transform: uppercase;">SECOND OPINION REQUEST</h1>
          <p style="font-size: 16px; color: #666; margin: 0;">Expert Medical Consultation Form</p>
        </div>
        <div style="margin-bottom: 25px; padding: 15px; background-color: #f8f9fa; border-radius: 8px;">
          <h3 style="font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #333;">Request Information</h3>
          <div style="display: flex; flex-wrap: wrap; gap: 30px 40px;">
            <div><strong>Request ID:</strong> <span style='color:#0E1630;'>${requestData.id}</span></div>
            <div><strong>Date of Request:</strong> <span style='color:#0E1630;'>${requestData.requestDate}</span></div>
            <div><strong>Status:</strong> <span style='color:#0E1630;'>Pending Review</span></div>
          </div>
        </div>
        <div style="margin-bottom: 25px; padding: 15px; background-color: #e8f5e8; border-radius: 8px; border: 1px solid #4caf50;">
          <h4 style="font-size: 16px; font-weight: bold; color: #2e7d32; margin-bottom: 10px;">✓ Medical Records Attached</h4>
          <p style="margin: 0; color: #2e7d32;">Complete patient medical history, vitals, prescriptions, and lab reports are included with this request.</p>
        </div>
        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Patient Information</h3>
          ${patientInfoGrid}
        </div>
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Consultation Request Details</h3>
          ${consultDetailsGrid}
        </div>
      </div>
      <div style="page-break-before: always; break-before: page;">
        ${generateMedicalRecordsPreviewHTML()}
      </div>
    `;
  };
  const generatePDF = async () => {
    const element = document.createElement("div");
    element.innerHTML = generatePrintTemplate();
    const opt = {
      margin: 1,
      filename: `second-opinion-${generateRequestData().id}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };
    try {
      const pdfBlob = await html2pdf().set(opt).from(element).outputPdf("blob");
      return pdfBlob;
    } catch (error) {
      console.error("PDF generation error:", error);
      throw error;
    }
  };
  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(",")[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };
  const sendWhatsAppMessage = async () => {
    if (!formData.contactPhone) {
      toast.error("Please enter a WhatsApp number");
      return;
    }
    setIsSending((prev) => ({ ...prev, whatsapp: true }));
    try {
      toast.info("Generating PDF...");
      const pdfBlob = await generatePDF();
      const messageContent = generateMessageContent();
      const whatsappMessage = `${messageContent.subject}\n\n${messageContent.body}\n\nPDF document has been generated and is ready for download.`;
      const response = await axios.get(`https://api.callmebot.com/whatsapp.php`, {
        params: {
          phone: `+91${formData.contactPhone}`,
          text: whatsappMessage,
          apikey: "YOUR_API_KEY",
        },
        timeout: 15000,
      });
      console.log("✅ WhatsApp API Response:", response.data);
      toast.success(`WhatsApp message sent successfully to +91${formData.contactPhone}!`);
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `second-opinion-${generateRequestData().id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("❌ WhatsApp send error:", error);
      try {
        const pdfBlob = await generatePDF();
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `second-opinion-${generateRequestData().id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.warning("WhatsApp service unavailable. PDF downloaded instead. Please share manually to WhatsApp.");
      } catch (pdfError) {
        toast.error("Failed to generate PDF: " + pdfError.message);
      }
    } finally {
      setIsSending((prev) => ({ ...prev, whatsapp: false }));
    }
  };
  const sendEmail = async () => {
    if (!formData.contactEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.contactEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }
    setIsSending((prev) => ({ ...prev, email: true }));
    try {
      toast.info("Generating PDF...");
      const pdfBlob = await generatePDF();
      const pdfBase64 = await blobToBase64(pdfBlob);
      const messageContent = generateMessageContent();
      emailjs.init("YOUR_USER_ID");
      const templateParams = {
        to_email: formData.contactEmail,
        to_name: selectedRecord.patientName,
        subject: messageContent.subject,
        message: messageContent.body,
        pdf_attachment: pdfBase64,
        filename: `second-opinion-${generateRequestData().id}.pdf`,
      };
      const response = await emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", templateParams);
      if (response.status === 200) {
        console.log("✅ Email sent successfully:", response);
        toast.success(`Email with PDF sent successfully to ${formData.contactEmail}!`);
      } else {
        throw new Error("Failed to send email");
      }
    } catch (error) {
      console.error("❌ Email send error:", error);
      try {
        const pdfBlob = await generatePDF();
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `second-opinion-${generateRequestData().id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.warning("Email service unavailable. PDF downloaded instead. Please email manually.");
      } catch (pdfError) {
        toast.error("Failed to generate PDF: " + pdfError.message);
      }
    } finally {
      setIsSending((prev) => ({ ...prev, email: false }));
    }
  };
  const handlePrintOnly = () => {
    const printContent = generatePrintTemplate();
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Second Opinion Request - ${generateRequestData().id}</title>
          <style>
            body { margin: 0; padding: 0; }
            @media print {
              body { print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };
  if (showMedicalRecords) {
    return (
      <MedicalRecordsDetailsPreview
        selectedRecord={selectedRecord}
        onClose={() => setShowMedicalRecords(false)}
        user={user}
        symptoms={symptoms}
        recordTab={recordTab}
      />
    );
  }
  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="text-left mb-8">
        <div className="inline-flex items-center gap-3">
          <Stethoscope size={32} className="primary-color" />
          <h1 className="text-2xl sm:text-3xl font-bold">Second Opinion Request</h1>
        </div>
      </div>
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 sm:p-6 mb-8">
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle size={24} className="text-green-600" />
            <div>
              <h3 className="font-semibold text-green-800">Medical Records Automatically Attached</h3>
              <p className="text-sm text-green-700">Patient information, vitals, and medical history will be included</p>
            </div>
          </div>
          <button onClick={() => setShowMedicalRecords(true)} className="mt-4 sm:mt-0 view-btn px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Preview Medical Records</button>
        </div>
      </div>
      <ProfileCard
        initials={(selectedRecord?.patientName && selectedRecord.patientName.charAt(0)) || user?.firstName?.charAt(0) || "N"}
        name={selectedRecord?.patientName || `${user?.firstName || "N/A"} ${user?.lastName || ""}`}
        fields={profileFields}
      />
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Consulting Doctor <span className="text-red-500">*</span></label>
            <div className="relative">
              <button type="button" onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="w-full p-3 border border-gray-300 rounded-lg bg-white flex items-center justify-between">
                <span className={formData.selectedDoctor ? "text-gray-900" : "text-gray-500"}>{formData.selectedDoctor || "Select a doctor..."}</span>
                <ChevronDown size={18} className={`transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
              </button>
              {isDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {doctorsLoading ? (
                    <div className="px-4 py-3 text-sm text-gray-500">Loading doctors...</div>
                  ) : (
                    doctors.map((doctor) => (
                      <button key={doctor} type="button" onClick={() => handleDoctorSelect(doctor)} className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors">{doctor}</button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Urgency Level <span className="text-red-500">*</span></label>
            <select
              value={formData.urgencyLevel}
              onChange={(e) => handleInputChange("urgencyLevel", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
            >
              {urgencyLoading ? (
                <option value="">Loading...</option>
              ) : (
                <>
                  <option value="">Select urgency level</option>
                  {urgencyLevels.map((level) => (
                    <option key={level.value} value={level.label}>{level.label}</option>
                  ))}
                </>
              )}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Consultation Mode <span className="text-red-500">*</span></label>
            <select
              value={formData.preferredMode}
              onChange={(e) => handleInputChange("preferredMode", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
            >
              {consultLoading ? (
                <option value="">Loading...</option>
              ) : (
                <>
                  <option value="">Select consultation mode</option>
                  {consultationModes.map((mode) => (
                    <option key={mode.value} value={mode.label}>{mode.label}</option>
                  ))}
                </>
              )}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Attach Additional Reports (Optional)</label>
            <div>
              <button type="button" onClick={() => document.getElementById("fileUpload").click()} className="w-full p-3 border border-gray-300 rounded-lg flex items-center justify-center text-gray-500 cursor-pointer text-sm">Attach Document</button>
              <input id="fileUpload" type="file" className="hidden" onChange={(e) => handleInputChange("uploadedFile", e.target.files[0])} />
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Notes (Optional)</label>
          <textarea value={formData.additionalNotes} onChange={(e) => handleInputChange("additionalNotes", e.target.value)} rows={3} className="w-full p-3 border border-gray-300 rounded-lg" placeholder="Any additional information for the consulting doctor..." />
        </div>
      </div>
      <div className="flex justify-center items-center pt-6">
        <div className="flex gap-3">
          <button
            onClick={handlePreview}
            disabled={!isFormValid()}
            className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 text-white rounded-lg transition-colors ${
              isFormValid() ? "bg-gray-600 hover:bg-gray-700" : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            <Printer size={18} />
            Print Preview & Send
          </button>
        </div>
      </div>
      {showPrintPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 sm:p-6 border-b bg-gradient-to-r from-[#01B07A] to-[#1A223F] text-white rounded-t-2xl">
              <h3 className="text-lg sm:text-xl font-semibold">Second Opinion Request Preview</h3>
              <button onClick={() => setShowPrintPreview(false)} className="text-white hover:text-gray-200 transition-colors"><X size={24} /></button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 sm:p-6">
              <div>
                <div className="bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden text-sm" style={{ fontFamily: "Times, serif" }}>
                  <PrintContent requestData={generateRequestData()} selectedRecord={selectedRecord} formData={formData} user={user} symptoms={symptoms} />
                </div>
              </div>
              <div className="space-y-6">
                <h4 className="text-lg sm:text-xl font-semibold text-gray-800">Send PDF Options</h4>
                <div className="border-t pt-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2"><Phone size={16} className="inline mr-2" />WhatsApp Number</label>
                      <input
                        type="tel"
                        value={formData.contactPhone}
                        onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                        className={`w-full p-3 rounded-lg border ${
                          isWhatsappValid ? "border-green-500 focus:border-green-500" : "border-gray-300 focus:border-blue-500"
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2"><AtSign size={16} className="inline mr-2" />Email Address</label>
                      <input type="email" value={formData.contactEmail} onChange={(e) => handleInputChange("contactEmail", e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <button onClick={sendWhatsAppMessage} disabled={!formData.contactPhone || isSending.whatsapp} className={`flex flex-col items-center p-4 rounded-lg border transition-all ${formData.contactPhone && !isSending.whatsapp ? "border-green-300 hover:bg-green-50 hover:scale-105" : "border-gray-300 opacity-50 cursor-not-allowed"}`}>
                    {isSending.whatsapp ? <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div> : <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="w-8 h-8 mb-2" />}
                    <span className="text-xs font-medium text-center">{isSending.whatsapp ? "Sending..." : "WhatsApp"}</span>
                  </button>
                  <button onClick={sendEmail} disabled={!formData.contactEmail || isSending.email} className={`flex flex-col items-center p-4 rounded-lg border transition-all ${formData.contactEmail && !isSending.email ? "border-red-300 hover:bg-red-50 hover:scale-105" : "border-gray-300 opacity-50 cursor-not-allowed"}`}>
                    {isSending.email ? <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div> : <img src="https://img.icons8.com/color/48/gmail--v1.png" alt="Email" className="w-7 h-7 mb-2" />}
                    <span className="text-xs font-medium text-center">{isSending.email ? "Sending..." : "Email"}</span>
                  </button>
                  <button onClick={handlePrintOnly} className="flex flex-col items-center p-4 rounded-lg border border-gray-300 hover:bg-gray-50 hover:scale-105 transition-all">
                    <img src="https://img.icons8.com/ios-filled/50/000000/print.png" alt="Print" className="w-6 h-6 mb-2" />
                    <span className="text-xs font-medium text-center">Print PDF</span>
                  </button>
                </div>
                {!formData.contactPhone && !formData.contactEmail && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800 text-sm"><strong>Note:</strong> Please provide WhatsApp number or email address to send the PDF document.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecondOpinion;
