import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useMedicalRecords } from "../../context-api/MedicalRecordsContext";
import {
  getHospitalDropdown,
  getAllMedicalConditions,
  getAllMedicalStatus,
  getAllSymptoms,
} from "../../utils/masterService";
import {
  getOPDRecordsByPatientId,
  getIPDRecordsByPatientId,
  getVirtualRecordsByPatientId,
} from "../../utils/CrudService";
import DynamicTable from "../../components/microcomponents/DynamicTable";
import { CheckCircle } from "lucide-react";
import Navbar from "../../components/Navbar";

const MedicalRecordHC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const patientId = useSelector((state) => state.auth.patientId);
  const user = useSelector((state) => state.auth.user);
  const { recordTab, setRecordTab, setClickedRecord } = useMedicalRecords();

  const [state, setState] = useState({
    activeTab: recordTab || "OPD",
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
  const [apiDataLoading, setApiDataLoading] = useState({
    hospitals: false,
    conditions: false,
    status: false,
    symptoms: false,
  });
 useEffect(() => {
    if (recordTab && recordTab !== state.activeTab) {
      setState(prev => ({ ...prev, activeTab: recordTab }));
    }
  }, [recordTab]);
  // Fetch master data
  useEffect(() => {
    const collator = new Intl.Collator(undefined, { sensitivity: "base" });
    const byLabelAsc = (a, b) => collator.compare(String(a.label || ""), String(b.label || ""));

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

        setApiDataLoading((p) => ({ ...p, symptoms: true }));
        const symptomsResponse = await getAllSymptoms();
        const symptomsList = (symptomsResponse?.data ?? [])
          .map((s) => ({
            label: s?.name ?? "",
            value: Number(s?.symptomId),
          }))
          .filter((opt) => opt.label)
          .sort(byLabelAsc);
        setSymptoms(symptomsList);
        setApiDataLoading((p) => ({ ...p, symptoms: false }));
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

        const normalizeRecord = (r) => ({
          ...r,
          isActive: r.isActive !== false, // Default to true if not specified
          symptomNames: r.symptomIds ? getLabelsByIds(symptoms, r.symptomIds) : "",
        });

        setMedicalData({
          OPD: (opdResponse.data || []).map(normalizeRecord),
          IPD: (ipdResponse.data || []).map(normalizeRecord),
          Virtual: (virtualResponse.data || []).map(normalizeRecord),
        });
      } catch (err) {
        console.error("Error fetching medical records:", err);
        setFetchError("Failed to fetch medical records.");
      } finally {
        setLoading(false);
      }
    };

    if (patientId) fetchAllRecords();
  }, [patientId, symptoms]);

  // Helper: Get labels by IDs
  const getLabelsByIds = (options, values) => {
    if (!values || !Array.isArray(values)) return "";
    return values
      .map((v) => {
        const option = options.find((opt) => String(opt.value) === String(v));
        return option ? option.label : v;
      })
      .join(", ");
  };

  // View details
const handleViewDetails = (record) => {
  setClickedRecord(record); // Update context with clicked record
  navigate("/healthcard-medicalrecord-Details", { 
    state: { selectedRecord: record } 
  });
};

  // Create columns for DynamicTable
  const createColumns = (type) => {
    const baseFields = {
      OPD: ["hospitalName", "symptomNames", "dateOfVisit", "medicalStatusName"],
      IPD: [
        "hospitalName",
        "symptomNames",
        "dateOfAdmission",
        "dateOfDischarge",
        "medicalStatusName",
      ],
      Virtual: [
        "hospitalName",
        "symptomNames",
        "dateOfConsultation",
        "medicalStatusName",
      ],
    };

    const fieldLabels = {
      hospitalName: "Hospital",
      symptomNames: "Symptoms",
      dateOfVisit: "Date of Visit",
      dateOfAdmission: "Date of Admission",
      dateOfDischarge: "Date of Discharge",
      dateOfConsultation: "Date of Consultation",
      medicalStatusName: "Status",
    };

    return baseFields[type].map((key) => ({
      header: fieldLabels[key],
      accessor: key,
      cell: (row) => {
        if (key === "hospitalName") {
          return (
            <div className="flex items-center gap-1">
              {/* Show CheckCircle if uploadedBy is "DOCTOR" */}
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
        const formattedValue =
          key.toLowerCase().includes("date")
            ? new Date(value).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : value;

        return <span>{formattedValue}</span>;
      },
    }));
  };

  const getCurrentTabData = () => {
    return medicalData[state.activeTab]?.filter((record) => record.isActive) || [];
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
    {
      key: "medicalStatusName",
      label: "Status",
      options: statusTypes,
    },
  ];

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="flex items-center justify-center gap-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--primary-color)]"></div>
          Loading medical records...
        </div>
      </div>
    );
  }

  if (fetchError) {
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
  }

  return (
    <>
      <Navbar />
      <div className="p-4">
        <DynamicTable
  columns={createColumns(state.activeTab)}
  data={getCurrentTabData()}
  filters={filters}
  tabs={tabs}
  activeTab={state.activeTab}
  onTabChange={(tab) => {
    setRecordTab(tab); // Update context
    setState(prev => ({ ...prev, activeTab: tab })); // Update local state
  }}
  tabActions={[
    {
      label: "Login",
      onClick: () => navigate("/login"),
      className: "edit-btn",
    },
  ]}
/>
      </div>
    </>
  );
};

export default MedicalRecordHC;
