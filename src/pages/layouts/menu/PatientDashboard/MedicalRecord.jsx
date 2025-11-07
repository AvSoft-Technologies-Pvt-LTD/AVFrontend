import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useMedicalRecords } from "../../../../context-api/MedicalRecordsContext";
import { useSelector } from "react-redux";
import {
  getHospitalDropdown,
  getAllMedicalConditions,
  getAllMedicalStatus,
  getAllSymptoms,
} from "../../../../utils/masterService";
import DynamicTable from "../../../../components/microcomponents/DynamicTable";
import ReusableModal from "../../../../components/microcomponents/Modal";
import {
  getOPDRecordsByPatientId,
  createOPDRecord,
  getIPDRecordsByPatientId,
  createIPDRecord,
  getVirtualRecordsByPatientId,
  createVirtualRecord,
} from "../../../../utils/CrudService";
import { CheckCircle } from "lucide-react";
const MedicalRecords = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { activeTab, setActiveTab, setClickedRecord } = useMedicalRecords();

  const patientId = useSelector((state) => state.auth.patientId);
  const [state, setState] = useState({
    activeTab: "OPD",
    showAddModal: false,
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
  const [symptoms, setSymptoms] = useState([]);

  // Fetch master dropdowns
  useEffect(() => {
    const collator = new Intl.Collator(undefined, { sensitivity: "base" });
    const byLabelAsc = (a, b) =>
      collator.compare(String(a.label || ""), String(b.label || ""));
    const fetchMasterData = async () => {
      try {
        const hospitalsResponse = await getHospitalDropdown();
        const hospitalsList = (hospitalsResponse?.data ?? [])
          .map((h) => ({
            label: h?.name || h?.hospitalName || h?.label || "",
            value: h?.id ?? h?.name,
          }))
          .filter((opt) => opt.label)
          .sort(byLabelAsc);
        setHospitalOptions(hospitalsList);
        const conditionsResponse = await getAllMedicalConditions();
        const conditionsList = (conditionsResponse?.data ?? [])
          .map((c) => ({
            label: c?.name || c?.conditionName || c?.label || "",
            value: c?.id || c?.name || "",
          }))
          .filter((opt) => opt.label)
          .sort(byLabelAsc);
        setMedicalConditions(conditionsList);
        const statusResponse = await getAllMedicalStatus();
        const statusList = (statusResponse?.data ?? [])
          .map((s) => ({
            label: s?.name || s?.statusName || s?.label || "",
            value: s?.id || s?.name || "",
          }))
          .filter((opt) => opt.label)
          .sort(byLabelAsc);
        setStatusTypes(statusList);
        const symptomsResponse = await getAllSymptoms();
        const symptomsList = (symptomsResponse?.data ?? [])
          .map((s) => ({
            label: s?.name || s?.symptomName || s?.label || "",
            value: s?.id || s?.name || "",
          }))
          .filter((opt) => opt.label)
          .sort(byLabelAsc);
        setSymptoms(symptomsList);
      } catch (error) {
        console.error("Error fetching master data:", error);
      }
    };
    fetchMasterData();
  }, []);

  // Fetch all records
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
        const newData = {
          OPD: opdResponse.data || [],
          IPD: ipdResponse.data || [],
          Virtual: virtualResponse.data || [],
        };
        // Merge with localStorage states
        const localData = JSON.parse(localStorage.getItem("recordActiveState"));
        if (localData) {
          Object.keys(newData).forEach((tab) => {
            newData[tab] = newData[tab].map((record) => {
              const found = localData[tab]?.find(
                (r) => r.recordId === record.recordId
              );
              return found ? { ...record, isActive: found.isActive } : record;
            });
          });
        }
        setMedicalData(newData);
      } catch (err) {
        console.error("Error fetching medical records:", err);
        setFetchError("Failed to fetch medical records.");
      } finally {
        setLoading(false);
      }
    };
    if (patientId) fetchAllRecords();
  }, [patientId]);
  // ✅ ADDED normalizeTab
  const normalizeTab = (tab) => {
    if (!tab) return "OPD";
    const formatted = tab.toLowerCase();
    if (formatted === "opd") return "OPD";
    if (formatted === "ipd") return "IPD";
    if (formatted === "virtual") return "Virtual";
    return "OPD";
  };
  // ✅ READ ACTIVE TAB FROM STORAGE (initial load)
  useEffect(() => {
    const storedTab = localStorage.getItem("activeMedicalTab");
    if (storedTab) {
      setActiveTab(normalizeTab(storedTab));
    }
  }, [setActiveTab]);

  // Save active states to localStorage on toggle
  const handleToggleActive = (recordId, type) => {
    setMedicalData((prev) => {
      const updated = { ...prev };
      updated[type] = updated[type].map((record) =>
        record.recordId === recordId
          ? { ...record, isActive: !record.isActive }
          : record
      );
      // Save only active state map
      const activeStateMap = {};
      Object.keys(updated).forEach((tab) => {
        activeStateMap[tab] = updated[tab].map((r) => ({
          recordId: r.recordId,
          isActive: r.isActive,
        }));
      });
      localStorage.setItem("recordActiveState", JSON.stringify(activeStateMap));
      return updated;
    });
  };

  const getLabelById = (options, value) => {
    const option = options.find((opt) => String(opt.value) === String(value));
    return option ? option.label : value;
  };

  const getLabelsByIds = (options, values) => {
    if (!values || !Array.isArray(values)) return "";
    return values
      .map((v) => {
        const option = options.find((opt) => String(opt.value) === String(v));
        return option ? option.label : v;
      })
      .join(", ");
  };

  const handleViewDetails = (record) => {
  localStorage.setItem("clickedHospitalRecord", JSON.stringify(record));
  setClickedRecord(record);
  navigate("/patientdashboard/medical-record-details", { state: { selectedRecord: record } });
};

  const handleAddRecord = async (formData) => {
    try {
      const payload = {
        patientId,
        hospitalId: formData.hospitalName,
        symptoms: formData.symptoms,
          medicalConditionIds: [formData.conditions[0]],
        medicalStatusId: formData.status,
        uploadedBy: "PATIENT", 
        ...(state.activeTab === "OPD" && { dateOfVisit: formData.dateOfVisit }),
        ...(state.activeTab === "IPD" && {
          dateOfAdmission: formData.dateOfAdmission,
          dateOfDischarge: formData.dateOfDischarge,
        }),
        ...(state.activeTab === "Virtual" && {
          dateOfConsultation: formData.dateOfConsultation,
        }),
      };
      let response;
      if (state.activeTab === "OPD") response = await createOPDRecord(payload);
      else if (state.activeTab === "IPD")
        response = await createIPDRecord(payload);
      else response = await createVirtualRecord(payload);
      const mappedResponse = {
        recordId: response.data.recordId,
        patientId: response.data.patientId,
        hospitalId: response.data.hospitalId,
        hospitalName: getLabelById(hospitalOptions, response.data.hospitalId),
        symptoms: response.data.symptoms,
        medicalConditionId: response.data.medicalConditionId,
        medicalConditionName: getLabelById(
          medicalConditions,
          response.data.medicalConditionId
        ),
        medicalStatusId: response.data.medicalStatusId,
        medicalStatusName: getLabelById(
          statusTypes,
          response.data.medicalStatusId
        ),
        uploadedBy: response.data.uploadedBy || "patient",
        ...(state.activeTab === "OPD" && {
          dateOfVisit: response.data.dateOfVisit,
        }),
        ...(state.activeTab === "IPD" && {
          dateOfAdmission: response.data.dateOfAdmission,
          dateOfDischarge: response.data.dateOfDischarge,
        }),
        ...(state.activeTab === "Virtual" && {
          dateOfConsultation: response.data.dateOfConsultation,
        }),
        isActive: true,
      };
      setMedicalData((prev) => ({
        ...prev,
        [state.activeTab]: [...prev[state.activeTab], mappedResponse],
      }));
      setState((prev) => ({ ...prev, showAddModal: false }));
    } catch (error) {
      console.error("Error adding record:", error);
    }
  };

  const createColumns = (type) => {
    const baseFields = {
      OPD: [
        "hospitalName",
        "symptoms",
        "dateOfVisit",
        "medicalStatusName",
      ],
      IPD: [
        "hospitalName",
        "symptoms",
        "dateOfAdmission",
        "dateOfDischarge",
        "medicalStatusName",
      ],
      Virtual: [
        "hospitalName",
        "symptoms",
        "dateOfConsultation",
        "medicalStatusName",
      ],
    };
    const fieldLabels = {
      hospitalName: "Hospital",
      symptoms: "Symptoms",
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
          const hiddenClass = !row.isActive ? "blur-sm opacity-40" : "";
          if (key === "hospitalName") {
            return (
              <div className={`flex items-center gap-1 ${hiddenClass}`}>
                {row.uploadedBy === "DOCTOR" && (
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
            : Array.isArray(value)
            ? getLabelsByIds(symptoms, value)
            : value;
          return <span className={hiddenClass}>{formattedValue}</span>;
        },
      })),
      {
        header: "Active",
        accessor: "active",
        cell: (row) => (
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={row.isActive}
              onChange={() => handleToggleActive(row.recordId, type)}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-gray-300 rounded-full peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
          </label>
        ),
      },
    ];
  };

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
        data={medicalData[state.activeTab] || []}
        filters={filters}
        tabs={tabs}
         activeTab={normalizeTab(activeTab)}
        onTabChange={(tab) => setState((prev) => ({ ...prev, activeTab: tab }))}
        tabActions={[
          {
            label: "Add Record",
            onClick: () => setState((prev) => ({ ...prev, showAddModal: true })),
            className: "edit-btn",
          },
        ]}
      />
      <ReusableModal
        isOpen={state.showAddModal}
        onClose={() => setState((prev) => ({ ...prev, showAddModal: false }))}
        mode="add"
        title="Add Medical Record"
        fields={[
          {
            name: "hospitalName",
            label: "Hospital Name",
            type: "select",
            options: hospitalOptions,
            required: true,
          },
          {
            name: "symptoms",
            label: "Symptoms",
            type: "multiselect",
            options: symptoms,
            required: true,
          },
          {
            name: "conditions",
            label: "Medical Conditions",
            type: "multiselect",
            options: medicalConditions,
            required: true,
          },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: statusTypes,
            required: true,
          },
          ...(state.activeTab === "OPD"
            ? [
                {
                  name: "dateOfVisit",
                  label: "Date of Visit",
                  type: "date",
                  required: true,
                },
              ]
            : state.activeTab === "IPD"
            ? [
                {
                  name: "dateOfAdmission",
                  label: "Date of Admission",
                  type: "date",
                  required: true,
                },
                {
                  name: "dateOfDischarge",
                  label: "Date of Discharge",
                  type: "date",
                  required: true,
                },
              ]
            : [
                {
                  name: "dateOfConsultation",
                  label: "Date of Consultation",
                  type: "date",
                  required: true,
                },
              ]),
        ]}
        data={{}}
        onSave={handleAddRecord}
      />
    </div>
  );
};

export default MedicalRecords;