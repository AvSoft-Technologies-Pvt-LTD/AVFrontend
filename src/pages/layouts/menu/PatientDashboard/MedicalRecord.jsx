import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  getHospitalDropdown,
  getAllMedicalConditions,
  getAllMedicalStatus,
} from "../../../../utils/masterService";
import DynamicTable from "../../../../components/microcomponents/DynamicTable";
import ReusableModal from "../../../../components/microcomponents/Modal";
import { getOPDRecordsByPatientId, createOPDRecord, getIPDRecordsByPatientId, createIPDRecord, getVirtualRecordsByPatientId, createVirtualRecord,} from "../../../../utils/CrudService";
import { CheckCircle } from "lucide-react";

const MedicalRecords = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const patientId = useSelector((state) => state.auth.patientId);
  const user = useSelector((state) => state.auth.user);
  const [state, setState] = useState({
    activeTab: "OPD",
    showAddModal: false,
    hiddenIds: [],
  });
  const [medicalData, setMedicalData] = useState({
    OPD: [],
    IPD: [],
    Virtual: [],
  });
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [hospitalOptions, setHospitalOptions] = useState([]);
  const [medicalConditions, setMedicalConditions] = useState([]);
  const [statusTypes, setStatusTypes] = useState([]);
  const [apiDataLoading, setApiDataLoading] = useState({
    hospitals: false,
    conditions: false,
    status: false,
  });

  useEffect(() => {
    const collator = new Intl.Collator(undefined, { sensitivity: "base" });
    const byLabelAsc = (a, b) =>
      collator.compare(String(a.label || ""), String(b.label || ""));
    const fetchMasterData = async () => {
      try {
        setApiDataLoading((p) => ({ ...p, hospitals: true }));
        const hospitalsResponse = await getHospitalDropdown();
        const hospitalsList = (hospitalsResponse?.data ?? [])
          .map((h) => ({
            label: h?.name || h?.hospitalName || h?.label || "",
            value: h?.id ?? h?.name,
          }))
          .filter((opt) => opt.label)
          .sort(byLabelAsc);
        setHospitalOptions(hospitalsList);
        setApiDataLoading((p) => ({ ...p, hospitals: false }));
        setApiDataLoading((p) => ({ ...p, conditions: true }));
        const conditionsResponse = await getAllMedicalConditions();
        const conditionsList = (conditionsResponse?.data ?? [])
          .map((c) => ({
            label: c?.name || c?.conditionName || c?.label || "",
            value: c?.id || c?.name || "",
          }))
          .filter((opt) => opt.label)
          .sort(byLabelAsc);
        setMedicalConditions(conditionsList);
        setApiDataLoading((p) => ({ ...p, conditions: false }));
        setApiDataLoading((p) => ({ ...p, status: true }));
        const statusResponse = await getAllMedicalStatus();
        const statusList = (statusResponse?.data ?? [])
          .map((s) => ({
            label: s?.name || s?.statusName || s?.label || "",
            value: s?.id || s?.name || "",
          }))
          .filter((opt) => opt.label)
          .sort(byLabelAsc);
        setStatusTypes(statusList);
        setApiDataLoading((p) => ({ ...p, status: false }));
      } catch (error) {
        console.error("Error fetching master data:", error);
      } finally {
        setApiDataLoading({ hospitals: false, conditions: false, status: false });
      }
    };
    fetchMasterData();
  }, []);

  useEffect(() => {
    const fetchAllRecords = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        const [opdResponse, ipdResponse, virtualResponse] = await Promise.all([
          getOPDRecordsByPatientId(patientId),
          getIPDRecordsByPatientId(patientId),
          getVirtualRecordsByPatientId(patientId),
        ]);
        setMedicalData({
          OPD: opdResponse.data || [],
          IPD: ipdResponse.data || [],
          Virtual: virtualResponse.data || [],
        });
        const hiddenRecords = [
          ...opdResponse.data
            .filter((r) => r.hiddenByPatient)
            .map((r) => r.id),
          ...ipdResponse.data
            .filter((r) => r.hiddenByPatient)
            .map((r) => r.id),
          ...virtualResponse.data
            .filter((r) => r.hiddenByPatient)
            .map((r) => r.id),
        ];
        updateState({ hiddenIds: hiddenRecords });
      } catch (err) {
        console.error("Error fetching medical records:", err);
        setFetchError("Failed to fetch medical records.");
      } finally {
        setLoading(false);
      }
    };
    if (patientId) {
      fetchAllRecords();
    }
  }, [patientId]);

  const updateState = (updates) => setState((prev) => ({ ...prev, ...updates }));

  const handleViewDetails = (record) => {
    const currentPath = location.pathname;
    let targetPath;
    if (currentPath.startsWith("/medical-record")) {
      targetPath = "/medical-record-details";
    } else if (currentPath.startsWith("/patientdashboard/medical-record")) {
      targetPath = "/patientdashboard/medical-record-details";
    } else {
      targetPath = "/medical-record-details";
    }
    navigate(targetPath, { state: { selectedRecord: record } });
  };

  const handleHideRecord = (id) => updateHideStatus(id, true);
  const handleUnhideRecord = (id) => updateHideStatus(id, false);

  const updateHideStatus = (recordId, isHidden) => {
    setMedicalData((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((type) => {
        updated[type] = updated[type].map((record) =>
          record.id === recordId
            ? { ...record, hiddenByPatient: isHidden }
            : record
        );
      });
      return updated;
    });
    if (isHidden) {
      updateState({ hiddenIds: [...state.hiddenIds, recordId] });
    } else {
      updateState({
        hiddenIds: state.hiddenIds.filter((id) => id !== recordId),
      });
    }
  };

const handleAddRecord = async (formData) => {
  try {
    const payload = {
      patientId,
      hospitalId: formData.hospitalName, // ✅ already ID
      chiefComplaint: formData.chiefComplaint,
      medicalConditionId: formData.conditions[0],
      medicalStatusId: formData.status,
      ...(state.activeTab === "OPD" && { dateOfVisit: formData.dateOfVisit }),
      ...(state.activeTab === "IPD" && {
        dateOfAdmission: formData.dateOfAdmission,
        dateOfDischarge: formData.dateOfDischarge,
      }),
      ...(state.activeTab === "Virtual" && { dateOfConsultation: formData.dateOfConsultation }),
    };

    let response;
    if (state.activeTab === "OPD") response = await createOPDRecord(payload);
    else if (state.activeTab === "IPD") response = await createIPDRecord(payload);
    else response = await createVirtualRecord(payload);

    const mappedResponse = {
      id: response.data.recordId,
      patientId: response.data.patientId,
      hospitalName: hospitalOptions.find(opt => opt.value === response.data.hospitalId)?.label,
      chiefComplaint: response.data.chiefComplaint,
      medicalConditionName: medicalConditions.find(opt => opt.value === response.data.medicalConditionId)?.label,
      medicalStatusName: statusTypes.find(opt => opt.value === response.data.medicalStatusId)?.label,
      ...(state.activeTab === "OPD" && { dateOfVisit: response.data.dateOfVisit }),
      ...(state.activeTab === "IPD" && {
        dateOfAdmission: response.data.dateOfAdmission,
        dateOfDischarge: response.data.dateOfDischarge,
      }),
      ...(state.activeTab === "Virtual" && { dateOfConsultation: response.data.dateOfConsultation }),
    };

    setMedicalData((prev) => ({
      ...prev,
      [state.activeTab]: [...prev[state.activeTab], mappedResponse],
    }));

    updateState({ showAddModal: false });
  } catch (error) {
    console.error("Error adding record:", error);
  }
};

  const createColumns = (type) => {
    const baseFields = {
      OPD: ["hospitalName",  "chiefComplaint", "dateOfVisit", "medicalStatusName"],
      IPD: [
        "hospitalName",
        "chiefComplaint",
        "dateOfAdmission",
        "dateOfDischarge",
        "medicalStatusName",
      ],
      Virtual: [
        "hospitalName",
        "chiefComplaint",
        "dateOfConsultation",
        "medicalStatusName",
      ],
    };
    const fieldLabels = {
      hospitalName: "Hospital",
      chiefComplaint: "Chief Complaint",
      dateOfVisit: "Date of Visit",
      dateOfAdmission: "Date of Admission",
      dateOfDischarge: "Date of Discharge",
      dateOfConsultation: "Date of Consultation",
      medicalStatusName: "Status",
    };
    return [
      ...baseFields[type].map((key) => ({
        header: fieldLabels[key],
        accessor: key,
        cell: (row) => {
          const hiddenClass = row.isHidden ? "blur-sm opacity-30" : "";
          if (key === "hospitalName") {
            return (
              <div className={`flex items-center gap-1 ${hiddenClass}`}>
                {(row.isVerified ||
                  row.hasDischargeSummary ||
                  row.createdBy === "doctor" ||
                  row.uploadedBy === "Doctor") && (
                  <CheckCircle size={14} className="text-green-600" />
                )}
                <button
                  type="button"
                  className="text-[var(--primary-color)] underline hover:text-[var(--accent-color)] font-semibold text-xs"
                  onClick={() => handleViewDetails(row)}
                >
                  {row.hospitalName}
                </button>
              </div>
            );
          }
         const value = row[key];
const formattedValue = key.toLowerCase().includes("date")
  ? new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  : value;

return <span className={hiddenClass}>{formattedValue}</span>;
        },
      })),
      {
        header: "Actions",
        accessor: "actions",
        cell: (row) => (
          <div className="flex items-center gap-2">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={!row.isHidden}
                onChange={() =>
                  row.isHidden
                    ? handleUnhideRecord(row.id)
                    : handleHideRecord(row.id)
                }
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-gray-200 rounded-full peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
            </label>

          </div>
        ),
      },
    ];
  };

  const getCurrentTabData = () => {
    const records = medicalData[state.activeTab] || [];
    const seen = new Set();
    const uniqueRecords = [];
    records.forEach((record) => {
      const key = `${record.hospitalName}-${record.dateOfVisit || record.dateOfConsultation}-${record.chiefComplaint}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueRecords.push({
          ...record,
          isHidden: state.hiddenIds.includes(record.id),
        });
      }
    });
    return uniqueRecords;
  };

const getFormFields = (recordType) => [
  {
    name: "hospitalName",
    label: "Hospital Name",
    type: "select",
    options: hospitalOptions, // ✅ Keep ID as value
    loading: apiDataLoading.hospitals,
  },
  { name: "chiefComplaint", label: "Chief Complaint", type: "text" },
  {
    name: "conditions",
    label: "Medical Conditions",
    type: "multiselect",
    options: medicalConditions, // ✅ Keep ID as value
    loading: apiDataLoading.conditions,
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: statusTypes, // ✅ Keep ID as value
    loading: apiDataLoading.status,
  },
  ...({
    OPD: [{ name: "dateOfVisit", label: "Date of Visit", type: "date" }],
    IPD: [
      { name: "dateOfAdmission", label: "Date of Admission", type: "date" },
      { name: "dateOfDischarge", label: "Date of Discharge", type: "date" },
    ],
    Virtual: [
      { name: "dateOfConsultation", label: "Date of Consultation", type: "date" },
    ],
  }[recordType] || []),
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
            .flatMap((records) => records.map((r) => r.hospitalName))
            .filter(Boolean)
        ),
      ].map((h) => ({ value: h, label: h })),
    },
    { key: "medicalStatusName", label: "Status", options: statusTypes },
  ];

  if (loading)
    return (
      <div className="text-center py-8">
        <div className="flex items-center justify-center gap-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--primary-color)]"></div>
          Loading medical records...
        </div>
      </div>
    );

  if (fetchError)
    return (
      <div className="text-center text-red-600 py-8">
        <p>{fetchError}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
        >
          Retry
        </button>
      </div>
    );

  return (
    <div className="p-4">
      <DynamicTable
        columns={createColumns(state.activeTab)}
        data={getCurrentTabData()}
        filters={filters}
        tabs={tabs}
        activeTab={state.activeTab}
        onTabChange={(tab) => updateState({ activeTab: tab })}
        tabActions={[
          {
            label: "Add Record",
            onClick: () => updateState({ showAddModal: true }),
            className: "edit-btn",
          },
        ]}
      />
      <ReusableModal
        isOpen={state.showAddModal}
        onClose={() => updateState({ showAddModal: false })}
        mode="add"
        title="Add Medical Record"
        fields={getFormFields(state.activeTab)}
        data={{}}
        onSave={handleAddRecord}
      />
    </div>
  );
};

export default MedicalRecords;
