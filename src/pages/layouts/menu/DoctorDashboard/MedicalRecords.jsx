import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaNotesMedical } from "react-icons/fa";
import TeleConsultFlow from "../../../../components/microcomponents/Call";
import {
  getAllMedicalRecords,
  createMedicalRecord,
  createIpdMedicalRecord,
} from "../../../../utils/CrudService";
import DynamicTable from "../../../../components/microcomponents/DynamicTable";
import ReusableModal from "../../../../components/microcomponents/Modal";
import ProfileCard from "../../../../components/microcomponents/ProfileCard";
import { Search, Plus, CheckCircle, Share2 } from "lucide-react";
import {
  getHospitalDropdown,
  getAllMedicalConditions,
  getAllMedicalStatus,
  getAllSymptoms,
} from "../../../../utils/masterService";

const DrMedicalRecords = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);

  // --- State ---
  const [activeRecordTab, setActiveRecordTab] = useState("OPD");
  const [medicalData, setMedicalData] = useState({ OPD: [], IPD: [], VIRTUAL: [] });
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [hospitalOptions, setHospitalOptions] = useState([]);
  const [medicalConditions, setMedicalConditions] = useState([]);
  const [statusTypes, setStatusTypes] = useState([]);
  const [symptoms, setSymptoms] = useState([]);
  const [apiDataLoading, setApiDataLoading] = useState({
    hospitals: false,
    conditions: false,
    status: false,
    symptoms: false,
  });
  const [state, setState] = useState({ showAddModal: false });

  // selected patient comes from location.state.patient or location.state
  const selectedPatient = (location.state && (location.state.patient || location.state))
    ? (location.state.patient || location.state)
    : null;

  // --- Helpers ---
  const handleRecordTabChange = (tab) => {
    // defensive: accept either event-like or direct value
    const newTab = tab?.target?.value || tab;
    setActiveRecordTab(String(newTab).toUpperCase());
  };

  const hospitalMap = useMemo(() => {
    const m = {};
    for (const opt of hospitalOptions) {
      const key = opt?.value ?? opt?.label;
      if (key != null) m[String(key)] = opt.label;
    }
    return m;
  }, [hospitalOptions]);

  const resolveHospitalLabel = (val) => {
    if (val == null) return "";
    return hospitalMap[String(val)] || String(val);
  };

  const getInitials = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleformAddRecord = (patient) => navigate("/doctordashboard/form", { state: { patient } });

  const formatDateArray = (dateArray) => {
    if (dateArray == null) return "N/A";
    if (!Array.isArray(dateArray)) {
      if (typeof dateArray === "string") {
        const d = new Date(dateArray);
        if (Number.isNaN(d.getTime())) return dateArray;
        return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
      }
      return String(dateArray);
    }
    const [year, month, day] = dateArray;
    if (!year || !month || !day) return "N/A";
    return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTimeArray = (dateArray) => {
    if (dateArray == null) return "N/A";
    if (!Array.isArray(dateArray)) {
      if (typeof dateArray === "string") {
        const d = new Date(dateArray);
        if (Number.isNaN(d.getTime())) return dateArray;
        return d.toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }
      return String(dateArray);
    }
    const [year, month, day, hour = 0, minute = 0, second = 0] = dateArray;
    return new Date(year, month - 1, day, hour, minute, second).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // --- Data fetching ---
  const fetchAllRecords = async (tab = activeRecordTab) => {
    setLoading(true);
    setFetchError(null);
    try {
      const patientId = selectedPatient?.patientId || selectedPatient?.id;
      if (!patientId) {
        setFetchError("No patient selected");
        setMedicalData({ OPD: [], IPD: [], VIRTUAL: [] });
        return;
      }
      console.debug("Fetching records for", { doctorId: user?.doctorId, patientId, tab });
      const response = await getAllMedicalRecords(user?.doctorId || 1, patientId, (tab || "OPD").toUpperCase());
      const received = response?.data || [];

      const opd = [];
      const ipd = [];
      const virt = [];

      // normalize and push
      for (const rec of received) {
        const ctx = (rec.context || rec.type || rec.recordType || "OPD").toString().toUpperCase();
        if (ctx === "OPD") opd.push(rec);
        else if (ctx === "IPD") ipd.push(rec);
        else if (ctx === "VIRTUAL") virt.push(rec);
        else opd.push(rec); // fallback
      }

      setMedicalData({ OPD: opd, IPD: ipd, VIRTUAL: virt });
    } catch (err) {
      console.error(err);
      setFetchError("Failed to fetch medical records.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecord = async (formData) => {
    const recordType = (formData.type || activeRecordTab || "OPD").toUpperCase();
    const patientIdVal = Number(selectedPatient?.patientId || selectedPatient?.id || 1);

    const sanitizedPayload = {
      patientId: patientIdVal,
      patientName: selectedPatient?.patientName || selectedPatient?.name || "Unknown",
      doctorId: Number(user?.doctorId || 1),
      context: recordType,
      hospitalId: formData.hospitalId ? Number(formData.hospitalId) : null,
      symptomIds: Array.isArray(formData.chiefComplaint) ? formData.chiefComplaint.map((id) => Number(id)) : [],
      medicalConditionIds: Array.isArray(formData.medicalConditionIds)
        ? formData.medicalConditionIds.map((id) => Number(id))
        : [],
      medicalStatusId: formData.medicalStatusId ? Number(formData.medicalStatusId) : null,
      registerPhone: formData.registerPhone ? String(formData.registerPhone).trim() : "",
      uploadedBy: "DOCTOR",
    };

    if (recordType === "OPD" || recordType === "VIRTUAL") {
      sanitizedPayload.dateOfVisit = formData.dateOfVisit || new Date().toISOString().split("T")[0];
    } else if (recordType === "IPD") {
      sanitizedPayload.dateOfAdmission = formData.dateOfAdmission || new Date().toISOString().split("T")[0];
      sanitizedPayload.dateOfDischarge = formData.dateOfDischarge || null;
    }

    try {
      let response;
      if (recordType === "IPD") response = await createIpdMedicalRecord(sanitizedPayload);
      else response = await createMedicalRecord(sanitizedPayload);

      // refresh current tab's data
      await fetchAllRecords(activeRecordTab);
      setState((p) => ({ ...p, showAddModal: false }));
    } catch (error) {
      console.error("Error creating medical record:", error);
      // consider adding toast or modal with error message
    }
  };

  const handleViewDetails = (row) => {
    const data = row?.original || row;
    navigate(`/doctordashboard/medical-record-details`, { state: { record: data } });
  };

  const handleShareRecord = (row) => {
    const data = row?.original || row;
    console.log("Share record:", data);
  };

  const fetchMasterData = async () => {
    try {
      setApiDataLoading((prev) => ({ ...prev, hospitals: true }));
      const hospitalsResponse = await getHospitalDropdown();
      const hospitalsList = (hospitalsResponse?.data ?? [])
        .map((hospital) => ({
          label: hospital?.name || hospital?.hospitalName || hospital?.label || "",
          value: hospital?.id ?? hospital?.name,
        }))
        .filter((opt) => opt.label);
      setHospitalOptions(hospitalsList);
      setApiDataLoading((prev) => ({ ...prev, hospitals: false }));

      setApiDataLoading((prev) => ({ ...prev, conditions: true }));
      const conditionsResponse = await getAllMedicalConditions();
      const conditionsList = (conditionsResponse?.data ?? [])
        .map((condition) => ({
          label: condition?.name || condition?.conditionName || condition?.label || "",
          value: condition?.id ?? condition?.name,
        }))
        .filter((opt) => opt.label);
      setMedicalConditions(conditionsList);
      setApiDataLoading((prev) => ({ ...prev, conditions: false }));

      setApiDataLoading((prev) => ({ ...prev, status: true }));
      const statusResponse = await getAllMedicalStatus();
      const statusList = (statusResponse?.data ?? [])
        .map((status) => ({ label: status?.name || status?.statusName || status?.label || "", value: status?.id }))
        .filter((opt) => opt.label);
      setStatusTypes(statusList);
      setApiDataLoading((prev) => ({ ...prev, status: false }));

      setApiDataLoading((prev) => ({ ...prev, symptoms: true }));
      const symptomsResponse = await getAllSymptoms();
      const symptomsList = (symptomsResponse?.data ?? [])
        .map((symptom) => ({ label: symptom?.name || symptom?.symptomName || "", value: symptom?.symptomId ?? symptom?.id }))
        .filter((opt) => opt.label);
      setSymptoms(symptomsList);
      setApiDataLoading((prev) => ({ ...prev, symptoms: false }));
    } catch (error) {
      console.error("Error fetching master data:", error);
      setApiDataLoading({ hospitals: false, conditions: false, status: false, symptoms: false });
    }
  };

  const createColumns = (type) => {
    const getRowObj = (r) => r?.original || r;

    const baseFields = {
      OPD: ["hospitalName", "chiefComplaint", "dateOfVisit", "medicalStatusName"],
      IPD: ["hospitalName", "chiefComplaint", "dateOfAdmission", "dateOfDischarge", "medicalStatusName"],
      VIRTUAL: ["hospitalName", "chiefComplaint", "dateOfVisit", "medicalStatusName"],
    };
    const fieldLabels = {
      hospitalName: "Hospital",
      chiefComplaint: "Symptoms",
      dateOfVisit: "Date of Visit",
      dateOfAdmission: "Date of Admission",
      dateOfDischarge: "Date of Discharge",
      dateOfConsultation: "Date of Consultation",
      medicalStatusName: "Status",
    };

    return [
      ...((baseFields[type] || baseFields.OPD).map((key) => ({
        header: fieldLabels[key] || key,
        accessor: key,
        cell: (row) => {
          const data = getRowObj(row) || {};
          if (key === "hospitalName") {
            return (
              <div className="flex items-center gap-2">
                {data.uploadedBy === "DOCTOR" && <CheckCircle className="text-green-500" size={16} />}
                <button
                  type="button"
                  className="text-[var(--primary-color)] underline hover:text-[var(--accent-color)] font-semibold"
                  onClick={() => handleViewDetails(data)}
                >
                  {data.hospitalName}
                </button>
              </div>
            );
          }

          if (key === "dateOfAdmission" || key === "dateOfDischarge" || key === "dateOfVisit" || key === "dateOfConsultation") {
            return <span>{data[key] ?? "N/A"}</span>;
          }

          if (key === "medicalStatusName") {
            return (
              <span className="text-sm font-semibold px-2 py-1 rounded-full bg-green-100 text-green-800">
                {data.medicalStatusName || "-"}
              </span>
            );
          }

          return <span>{data[key] ?? "-"}</span>;
        },
      }))),
      {
        header: "Actions",
        accessor: "actions",
        cell: (row) => {
          const data = row?.original || row;
          return (
            <div className="flex gap-2">
              <button
                onClick={() => handleShareRecord(data)}
                className="transition-colors text-blue-600 hover:text-blue-800"
                title="Share Record"
                type="button"
              >
                <Share2 size={16} />
              </button>
            </div>
          );
        },
      },
    ];
  };

  const getCurrentTabData = () =>
    (medicalData[activeRecordTab] || [])
      .map((record) => ({
        ...record,
        hospitalName: resolveHospitalLabel(record.hospitalId ?? record.hospitalName),
        chiefComplaint: record.symptomNames ? record.symptomNames.join(", ") : (record.chiefComplaint || record.diagnosis || ""),
        dateOfVisit: formatDateArray(record.dateOfVisit),
        dateOfAdmission: formatDateArray(record.dateOfAdmission),
        dateOfDischarge: formatDateArray(record.dateOfDischarge),
        dateOfConsultation: formatDateArray(record.dateOfConsultation),
        createdAt: formatDateTimeArray(record.createdAt),
      }))
      .sort((a, b) => {
        // prefer actual timestamps if available
        const parseDate = (x) => {
          if (!x) return 0;
          const d = new Date(x);
          return Number.isNaN(d.getTime()) ? 0 : d.getTime();
        };
        return parseDate(b.createdAt || b.dateOfVisit || b.dateOfAdmission || b.dateOfConsultation) -
          parseDate(a.createdAt || a.dateOfVisit || a.dateOfAdmission || a.dateOfConsultation);
      });

  const getFormFields = (recordType) => [
    {
      name: "hospitalId",
      label: "Hospital Name",
      type: "select",
      options: hospitalOptions,
      loading: apiDataLoading.hospitals,
      required: true,
    },
    {
      name: "chiefComplaint",
      label: "Symptoms",
      type: "multiselect",
      options: symptoms,
      loading: apiDataLoading.symptoms,
      required: true,
    },
    {
      name: "medicalConditionIds",
      label: "Medical Conditions",
      type: "multiselect",
      options: medicalConditions,
      loading: apiDataLoading.conditions,
      required: false,
    },
    {
      name: "medicalStatusId",
      label: "Status",
      type: "select",
      options: statusTypes,
      loading: apiDataLoading.status,
      required: false,
    },
    ...(recordType === "OPD" || recordType === "VIRTUAL"
      ? [{ name: "dateOfVisit", label: "Date of Visit", type: "date", required: true }]
      : recordType === "IPD"
        ? [
            { name: "dateOfAdmission", label: "Date of Admission", type: "date", required: true },
            { name: "dateOfDischarge", label: "Date of Discharge", type: "date", required: false },
          ]
        : []),
    {
      name: "registerPhone",
      label: "Register Phone Number",
      type: "text",
      required: true,
      validate: (value) => {
        const digitsOnly = String(value || "").replace(/\D/g, "");
        if (!digitsOnly) return "Register Phone Number is required";
        if (digitsOnly.length !== 10) return "Phone number must be exactly 10 digits";
        return null;
      },
      hasInlineCheckbox: true,
      inlineCheckbox: {
        name: "phoneConsent",
        label: "Sync with patient number",
      },
    },
  ];

  const tabs = Object.keys(medicalData).map((key) => ({ label: key, value: key }));

  const filters = [
    {
      key: "hospitalName",
      label: "Hospital",
      options: [
        ...new Set(
          Object.values(medicalData)
            .flatMap((records) => records.map((r) => resolveHospitalLabel(r.hospitalId ?? r.hospitalName)))
            .filter(Boolean)
        ),
      ].map((label) => ({ value: label, label }))
    },
    {
      key: "medicalStatusName",
      label: "Status",
      options: statusTypes,
    },
  ];

  const tabActions = [
    {
      label: (
        <div className="flex items-center gap-1">
          <Plus size={16} className="sm:h-4 sm:w-4" />
          <span className="text-xs sm:text-xs">Add Record</span>
        </div>
      ),
      onClick: () => setState((p) => ({ ...p, showAddModal: true })),
      className: "btn btn-primary w-full sm:w-auto py-1 px-2 sm:py-2 sm:px-9 text-xs sm:text-sm",
    },
  ];

  // --- Effects ---
  useEffect(() => {
    if (selectedPatient) {
      fetchAllRecords(activeRecordTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.doctorId, selectedPatient, activeRecordTab]);

  useEffect(() => {
    // fetch master data when patient or doctor changes or when tab changes (if needed)
    fetchMasterData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.doctorId, selectedPatient?.id]);

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {selectedPatient && (
        <ProfileCard
          initials={getInitials(selectedPatient.patientName || selectedPatient.name || "")}
          name={selectedPatient.patientName || selectedPatient.name || "--"}
          fields={[
            { label: "Phone", value: selectedPatient.patientPhone || selectedPatient.phone || "N/A" },
            { label: "Email", value: selectedPatient.patientEmail || selectedPatient.email || "N/A" },
            { label: "Doctor", value: selectedPatient.doctorName || selectedPatient.doctor || "N/A" },
            { label: "Visit Date", value: selectedPatient.scheduledDate || "N/A" },
          ]}
          context={selectedPatient.context || "OPD"}
        >
          <div className="absolute top-3 right-4 flex items-center gap-3">
            <button
              className="bg-white p-2 rounded-full text-blue-600 hover:bg-blue-200 hover:text-blue-700 transition-colors"
              onClick={() => handleformAddRecord(selectedPatient)}
              title="Add Medical Record"
            >
              <FaNotesMedical size={20} />
            </button>
            <div className="bg-white px-2 py-1 rounded-full">
              <TeleConsultFlow
                phone={selectedPatient.patientPhone}
                patientName={
                  selectedPatient.patientName ||
                  `${selectedPatient.firstName || ""} ${selectedPatient.middleName || ""} ${selectedPatient.lastName || ""}`.replace(/\s+/g, " ").trim()
                }
                context={selectedPatient.context || "OPD"}
                patientEmail={selectedPatient.patientEmail}
                hospitalName={selectedPatient.hospitalName || ""}
              />
            </div>
          </div>
        </ProfileCard>
      )}

      <div className="overflow-x-auto ">
        <DynamicTable
          columns={createColumns(activeRecordTab)}
          data={getCurrentTabData()}
          filters={filters}
          tabs={tabs}
          tabActions={tabActions}
          activeTab={activeRecordTab}
          onTabChange={handleRecordTabChange}
          loading={loading}
        />
      </div>

      <ReusableModal
        isOpen={state.showAddModal}
        onClose={() => setState((p) => ({ ...p, showAddModal: false }))}
        mode="add"
        title="Add Medical Record"
        fields={getFormFields(activeRecordTab)}
        data={{}}
        onSave={handleAddRecord}
      />

      {fetchError && (
        <div className="text-sm text-red-600">{fetchError}</div>
      )}
    </div>
  );
};

export default DrMedicalRecords;
