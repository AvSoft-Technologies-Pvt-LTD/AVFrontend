import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaNotesMedical } from "react-icons/fa";
import TeleConsultFlow from "../../../../components/microcomponents/Call";
import { usePatientContext } from "../../../../context-api/PatientContext";
import {
  getAllMedicalRecords,
  createMedicalRecord,
  createIpdMedicalRecord
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
  const contextPatient = usePatientContext().patient;
  const user = useSelector((state) => state.auth.user);
  const { activeTab, handleTabChange } = usePatientContext();
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
  const selectedPatient = (location.state && location.state.patient && location.state.patient.patientId)
    ? location.state.patient
    : contextPatient;

  const hospitalMap = useMemo(() => {
    const m = {};
    for (const opt of hospitalOptions) {
      m[String(opt.value)] = opt.label;
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
    if (!dateArray) return "N/A";
    if (!Array.isArray(dateArray)) {
      if (typeof dateArray === "string") {
        return new Date(dateArray).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      }
      return dateArray;
    }
    const [year, month, day] = dateArray;
    return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTimeArray = (dateArray) => {
    if (!Array.isArray(dateArray)) return dateArray;
    const [year, month, day, hour = 0, minute = 0, second = 0] = dateArray;
    return new Date(year, month - 1, day, hour, minute, second).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const fetchAllRecords = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const patientId = selectedPatient?.patientId || selectedPatient?.id;
      if (!patientId) {
        throw new Error("No patient ID found");
      }
      console.log("Fetching records for patientId:", patientId);
      const response = await getAllMedicalRecords(
        user?.doctorId || 1,
        patientId,
        activeTab.toUpperCase(),
        selectedPatient?.patientPhone
      );
      console.log("API Response:", response.data);
      const opd = [];
      const ipd = [];
      const VIRTUAL = [];
      response.data.forEach((rec) => {
        if (rec.context === "OPD") opd.push(rec);
        else if (rec.context === "IPD") ipd.push(rec);
        else if (rec.context === "VIRTUAL") VIRTUAL.push(rec);
      });
      setMedicalData({ OPD: opd, IPD: ipd, VIRTUAL: VIRTUAL });
    } catch (err) {
      setFetchError("Failed to fetch medical records.");
      console.error("Error fetching records:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecord = async (formData) => {
    const recordType = formData.type || activeTab;
    const sanitizedPayload = {
      patientId: Number(selectedPatient?.patientId || selectedPatient?.id || 1),
      doctorId: Number(user?.doctorId || 1),
      hospitalId: Number(formData.hospitalId),
      context: recordType.toUpperCase(),
      symptomIds: Array.isArray(formData.symptomIds)
        ? formData.symptomIds
            .map((item) => item?.value || item)
            .filter((v) => v !== null && v !== undefined)
            .map(Number)
        : [],
      medicalConditionIds: Array.isArray(formData.medicalConditionIds)
        ? formData.medicalConditionIds
            .map((mc) => mc?.value || mc)
            .filter((v) => v !== null && v !== undefined)
            .map(Number)
        : [],
      medicalStatusId: formData.medicalStatusId
        ? Number(formData.medicalStatusId?.value || formData.medicalStatusId)
        : null,
      registerPhone: formData.registerPhone ? String(formData.registerPhone).trim() : "",
      uploadedBy: "DOCTOR",
    };
    if (recordType.toUpperCase() === "OPD" || recordType.toUpperCase() === "VIRTUAL") {
      sanitizedPayload.dateOfVisit = formData.dateOfVisit || formData.dateOfConsultation || new Date().toISOString().split("T")[0];
    }
    if (recordType.toUpperCase() === "IPD") {
      sanitizedPayload.dateOfAdmission = formData.dateOfAdmission || new Date().toISOString().split("T")[0];
      sanitizedPayload.dateOfDischarge = formData.dateOfDischarge || new Date().toISOString().split("T")[0];
    }
    console.log("Payload sent:", sanitizedPayload);
    try {
      if (recordType.toUpperCase() === "IPD") {
        await createIpdMedicalRecord(sanitizedPayload);
      } else {
        await createMedicalRecord(sanitizedPayload);
      }
      await fetchAllRecords();
      setState({ showAddModal: false });
    } catch (error) {
      console.error("Error creating medical record:", error);
    }
  };

  const handleViewDetails = (row) => {
    navigate(`/doctordashboard/medical-record-details`, { state: { record: row } });
  };

  const handleShareRecord = (row) => {
    console.log("Share record:", row);
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
          value: condition?.id || condition?.name,
        }))
        .filter((opt) => opt.label);
      setMedicalConditions(conditionsList);
      setApiDataLoading((prev) => ({ ...prev, conditions: false }));
      setApiDataLoading((prev) => ({ ...prev, status: true }));
      const statusResponse = await getAllMedicalStatus();
      const statusList = (statusResponse?.data ?? []).map((status) => ({
        label: status?.name || status?.statusName || status?.label || "",
        value: status?.id,
      }));
      setStatusTypes(statusList);
      setApiDataLoading((prev) => ({ ...prev, status: false }));
      setApiDataLoading((prev) => ({ ...prev, symptoms: true }));
      const symptomsResponse = await getAllSymptoms();
      const symptomsList = (symptomsResponse?.data ?? []).map((symptom) => ({
        label: symptom.name,
        value: symptom.symptomId,
      }))
        .filter((opt) => opt.label);
      setSymptoms(symptomsList);
      setApiDataLoading((prev) => ({ ...prev, symptoms: false }));
    } catch (error) {
      console.error("Error fetching master data:", error);
    }
  };

  const createColumns = (type) => {
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
    const typeColors = { OPD: "purple", IPD: "blue", VIRTUAL: "indigo" };
    return [
      ...baseFields[type].map((key) => ({
        header: fieldLabels[key],
        accessor: key,
        cell: (row) => {
          if (key === "hospitalName") {
            return (
              <div className="flex items-center gap-2">
                {row.uploadedBy === "DOCTOR" && (
                  <CheckCircle className="text-green-500" size={16} />
                )}
                <button
                  type="button"
                  className="text-[var(--primary-color)] underline hover:text-[var(--accent-color)] font-semibold"
                  onClick={() => handleViewDetails(row)}
                >
                  {row.hospitalName}
                </button>
              </div>
            );
          }
          if (key === "dateOfAdmission" || key === "dateOfDischarge" || key === "dateOfVisit") {
            return <span>{row[key]}</span>;
          }
          if (key === "medicalStatusName") {
            return (
              <span className="text-sm font-semibold px-2 py-1 rounded-full bg-green-100 text-green-800">
                {row.medicalStatusName}
              </span>
            );
          }
          return <span>{row[key]}</span>;
        },
      })),
      {
        header: "Actions",
        accessor: "actions",
        cell: (row) => (
          <div className="flex gap-2">
            <button
              onClick={() => handleShareRecord(row)}
              className="transition-colors text-blue-600 hover:text-blue-800"
              title="Share Record"
              type="button"
            >
              <Share2 size={16} />
            </button>
          </div>
        ),
      },
    ];
  };

  const getCurrentTabData = () =>
    (medicalData[activeTab] || [])
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
        const dateA = new Date(a.dateOfVisit || a.dateOfAdmission || a.dateOfConsultation || "1970-01-01");
        const dateB = new Date(b.dateOfVisit || b.dateOfAdmission || b.dateOfConsultation || "1970-01-01");
        return dateB - dateA;
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
      name: "symptomIds",
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
      required: true,
    },
    {
      name: "medicalStatusId",
      label: "Status",
      type: "select",
      options: statusTypes,
      loading: apiDataLoading.status,
      required: true,
    },
    ...(recordType === "OPD"
      ? [{ name: "dateOfVisit", label: "Date of Visit", type: "date", required: true, }]
      : recordType === "IPD"
        ? [
          { name: "dateOfAdmission", label: "Date of Admission", type: "date", required: true, },
          { name: "dateOfDischarge", label: "Date of Discharge", type: "date", required: true, },
        ]
        : [{ name: "dateOfConsultation", label: "Date of Consultation", type: "date", required: true, }]),
    {
      name: "registerPhone",
      label: "Register Phone Number",
      type: "text",
      required: true,
      hasInlineCheckbox: true,
      inlineCheckbox: {
        name: "phoneConsent",
        label: "Sync with patient number",
      },
    },
  ];

  const tabs = Object.keys(medicalData).map((key) => ({
    label: key,
    value: key,
  }));

  const filters = [
    {
      key: "hospitalName",
      label: "Hospital",
      options: [
        ...new Set(
          Object.values(medicalData)
            .flatMap((records) =>
              records.map((r) => resolveHospitalLabel(r.hospitalId ?? r.hospitalName))
            )
            .filter(Boolean)
        ),
      ].map((label) => ({ value: label, label })),
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
      onClick: () => setState({ showAddModal: true }),
      className: "btn btn-primary w-full sm:w-auto py-1 px-2 sm:py-2 sm:px-9 text-xs sm:text-sm",
    },
  ];

  useEffect(() => {
    fetchAllRecords();
    fetchMasterData();
  }, [user?.doctorId, selectedPatient?.id, activeTab]);

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {selectedPatient && (
        <ProfileCard
          initials={getInitials(selectedPatient.patientName || selectedPatient.name || "")}
          name={selectedPatient.patientName || selectedPatient.name || "--"}
          fields={[
            { label: "Phone", value: selectedPatient.patientPhone || "N/A" },
            { label: "Email", value: selectedPatient.patientEmail || "N/A" },
            { label: "Doctor", value: selectedPatient.doctorName || "N/A" },
            { label: "Visit Date", value: selectedPatient.scheduledDate || "N/A" },
            { label: "Consultation Type", value: selectedPatient.consultationTypeName || "N/A" },
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
                  `${selectedPatient.firstName || ""} ${selectedPatient.middleName || ""} ${selectedPatient.lastName || ""}`
                    .replace(/\s+/g, " ")
                    .trim()
                }
                context={selectedPatient.context || "OPD"}
                patientEmail={selectedPatient.patientEmail}
                hospitalName={selectedPatient.hospitalName || ""}
              />
            </div>
          </div>
        </ProfileCard>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <Search
            size={20}
            className="text-[var(--primary-color)] sm:h-6 sm:w-6"
          />
          <h2 className="text-lg sm:text-xl font-semibold">
            Medical Records History
          </h2>
        </div>
      </div>
      <div className="overflow-x-auto">
        <DynamicTable
          columns={createColumns(activeTab)}
          data={getCurrentTabData()}
          filters={filters}
          tabs={tabs}
          tabActions={tabActions}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </div>
      <ReusableModal
        isOpen={state.showAddModal}
        onClose={() => setState({ showAddModal: false })}
        mode="add"
        title="Add Medical Record"
        fields={getFormFields(activeTab)}
        data={{}}
        onSave={handleAddRecord}
      />
    </div>
  );
};

export default DrMedicalRecords;
