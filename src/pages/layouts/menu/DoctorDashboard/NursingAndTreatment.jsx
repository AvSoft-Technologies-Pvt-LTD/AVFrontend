
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, Building, User, Calendar, FileText, Activity, Heart, Search, Plus, Clock, CheckCircle, X, BarChart3 } from "lucide-react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";
import {
  getFrequencies,
  getIntakes,
  getDosageUnits,
  getNurseDashboard,
  getIpdVitals,
  getIpdNursingByPatient
} from "../../../../utils/masterService";
import { createIpdNursingRecord, updateIpdNursing, deleteIpdNursingRecord } from "../../../../utils/CrudService";
import VitalsForm from "./dr-form/VitalsForm";
import ReusableModal from "../../../../components/microcomponents/Modal";
import DynamicTable from "../../../../components/microcomponents/DynamicTable";
import VitalsChart from "./dr-form/VitalsChart";
import { ChartModal } from "./dr-form/VitalsChart";
import { usePatientContext } from "../../../../context-api/PatientContext";
import ProfileCard from "../../../../components/microcomponents/ProfileCard";
import { useSelector } from "react-redux";

const NursingAndTreatment = () => {
  const navigate = useNavigate();
  const { patient, setPatient } = usePatientContext();
  const [activeSection, setActiveSection] = useState("records");
  const [showPatientDetails, setShowPatientDetails] = useState(true);
  const [showAddRecordModal, setShowAddRecordModal] = useState(false);
  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [showVitalsChart, setShowVitalsChart] = useState(false);
  const [chartVital, setChartVital] = useState("heartRate");
  const chartType = "bar";
  const [vitalsRecords, setVitalsRecords] = useState([]);
  const [isLoadingVitals, setIsLoadingVitals] = useState(false);
  const doctorId = useSelector((state) => state.auth.doctorId);

  useEffect(() => {
    if (!patient) {
      const savedPatient = localStorage.getItem("selectedThisPatient");
      if (savedPatient) {
        try {
          const parsedPatient = JSON.parse(savedPatient);
          setPatient(parsedPatient);
        } catch (error) {
          console.error("Error parsing patient data:", error);
        }
      }
    }
  }, [patient, setPatient]);

  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchNursingRecords = async () => {
      setIsLoading(true);
      try {
        const response = await getIpdNursingByPatient(patient?.patientId);
        if (response.data) {
          setRecords(response.data);
        }
      } catch (error) {
        console.error("Error fetching nursing records:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNursingRecords();
  }, [patient?.patientId]);

  const [editingRecord, setEditingRecord] = useState(null);
  const [nurses, setNurses] = useState([]);
  const [formData, setFormData] = useState({
    assignedNurse: "",
    assignedDate: new Date().toISOString().split("T")[0],
    drugName: "",
    dosage: "",
    dosageUnit: "",
    frequency: "",
    intake: "",
    duration: "",
    status: "pending",
    remarks: ""
  });

  const [apiData, setApiData] = useState({
    frequencies: [],
    intakes: [],
    dosageUnits: [],
    nurses: []
  });

  useEffect(() => {
    const fetchNurses = async () => {
      try {
        const response = await getNurseDashboard();
        if (response.data) {
          const nurseOptions = response.data.map(nurse => ({
            value: nurse.id,
            label: `${nurse.fullName} - ${nurse.roleName}`
          }));
          setNurses(nurseOptions);
        }
      } catch (error) {
        console.error("Error fetching nurses:", error);
        toast.error("Failed to load nurse list");
      }
    };
    fetchNurses();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const frequenciesRes = await getFrequencies();
        const intakesRes = await getIntakes();
        const dosageUnitsRes = await getDosageUnits();
        setApiData({
          frequencies: Array.isArray(frequenciesRes?.data) ? frequenciesRes.data : [],
          intakes: Array.isArray(intakesRes?.data) ? intakesRes.data : [],
          dosageUnits: Array.isArray(dosageUnitsRes?.data) ? dosageUnitsRes.data : []
        });
      } catch (error) {
        console.error('Error fetching form data:', error);
        toast.error('Failed to load form options');
      }
    };
    fetchData();
  }, []);

  const localDrugList = [
    { id: 1, name: "Dolo 650", strength: "650mg", form: "Tablet" },
    { id: 2, name: "Paracetamol", strength: "500mg", form: "Tablet" },
    { id: 3, name: "Ibuprofen", strength: "400mg", form: "Tablet" },
    { id: 4, name: "Aspirin", strength: "325mg", form: "Tablet" },
    { id: 5, name: "Amoxicillin", strength: "250mg", form: "Capsule" },
    { id: 6, name: "Crocin", strength: "650mg", form: "Tablet" },
    { id: 7, name: "Combiflam", strength: "325mg", form: "Tablet" },
    { id: 8, name: "Azithromycin", strength: "500mg", form: "Tablet" },
    { id: 9, name: "Ciprofloxacin", strength: "500mg", form: "Tablet" },
    { id: 10, name: "Omeprazole", strength: "20mg", form: "Capsule" },
    { id: 11, name: "Domperidone", strength: "10mg", form: "Tablet" },
    { id: 12, name: "Pantoprazole", strength: "40mg", form: "Tablet" }
  ];

  const getOptionLabel = (options, id) => {
    if (!options || !id) return id;
    const option = options.find(opt => String(opt.id) === String(id));
    return option ? option.name : id;
  };

  const frequencyOptions = apiData.frequencies.map(freq => ({
    value: freq.id,
    label: freq.name
  }));

  const intakeOptions = apiData.intakes.map(intake => ({
    value: intake.id,
    label: intake.name
  }));

  const dosageUnitOptions = apiData.dosageUnits.map(unit => ({
    value: unit.id,
    label: unit.name
  }));

  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "completed", label: "Completed" }
  ];

  const isIPDPatient = patient?.type?.toLowerCase() === "ipd";

  const calculateAge = (dob) => {
    if (!dob) return "N/A";
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const getPatientName = () => patient?.name || `${patient?.firstName || ""} ${patient?.middleName || ""} ${patient?.lastName || ""}`.trim() || "Unknown Patient";

  const getPatientAge = () => patient?.age && patient?.age !== "N/A" ? patient.age : calculateAge(patient?.dob);

  const handleBack = () => navigate(-1);

  const handleShowNurseRecords = () => setActiveSection("records");

  const handleAddRecord = () => {
    setEditingRecord(null);
    setFormData({
      assignedNurse: "",
      assignedDate: new Date().toISOString().split("T")[0],
      drugName: "",
      dosage: "",
      dosageUnit: "",
      frequency: "",
      intake: "",
      duration: "",
      status: "pending",
      remarks: ""
    });
    setShowAddRecordModal(true);
  };

  const fetchDrugSuggestions = async (query) => {
    if (query.length < 2) return [];
    try {
      const response = await axios.get("https://mocki.io/v1/efc542df-dc4c-4b06-9e5b-32567facef11");
      const drugs = response.data.length ? response.data : localDrugList;
      return drugs.filter((drug) => drug.name.toLowerCase().includes(query.toLowerCase()));
    } catch (error) {
      return localDrugList.filter((drug) => drug.name.toLowerCase().includes(query.toLowerCase()));
    }
  };

  const handleDrugSelection = (drug) => setFormData((prev) => ({
    ...prev,
    drugName: drug.name,
    dosageUnit: drug.form?.toLowerCase() === "tablet" ? "tablet" : drug.form?.toLowerCase() === "capsule" ? "capsule" : "mg"
  }));

  const handleSaveRecord = async (recordData) => {
    const selectedNurse = nurses.find(n => n.value === recordData.assignedNurse);
    const nurseName = selectedNurse ? selectedNurse.label.split(' - ')[0] : 'Unknown Nurse';
    if (!recordData.assignedNurse || !recordData.drugName) {
      toast.error("Please fill in required fields (Nurse and Medicine)");
      return;
    }
    try {
      const payload = {
        ipdrowaid: patient?.id,
        nurseId: Number(recordData.assignedNurse),
        assignedDate: recordData.assignedDate,
        drugName: recordData.drugName,
        dosage: Number(recordData.dosage),
        dosageUnit: Number(recordData.dosageUnit),
        frequency: Number(recordData.frequency),
        intake: Number(recordData.intake),
        duration: recordData.duration,
        status: recordData.status.toUpperCase(),
        remarks: recordData.remarks || ""
      };
      if (editingRecord) {
        await updateIpdNursing(editingRecord.nurseRecordId, payload);
        setRecords((prev) => prev.map((record) =>
          record.nurseRecordId === editingRecord.nurseRecordId ? { ...record, ...recordData } : record
        ));
        toast.success("Record updated successfully!");
      } else {
        const response = await createIpdNursingRecord(payload);
        const newRecord = {
          id: response.data?.id || Date.now(),
          nurseRecordId: response.data?.nurseRecordId || Date.now(),
          ...recordData
        };
        setRecords((prev) => [newRecord, ...prev]);
        toast.success("Record added successfully!");
      }
    } catch (error) {
      console.error("Error saving nursing record:", error);
      toast.error(error.response?.data?.message || "Failed to save nursing record");
    } finally {
      setShowAddRecordModal(false);
      setEditingRecord(null);
    }
  };

  const handleEditRecord = (record) => {
    setEditingRecord(record);
    setFormData({
      assignedNurse: record.assignedNurseId || record.assignedNurse,
      assignedDate: record.assignedDate,
      drugName: record.drugName,
      dosage: record.dosage,
      dosageUnit: record.dosageUnit,
      frequency: record.frequency,
      intake: record.intake,
      duration: record.duration,
      status: record.status || "pending",
      remarks: record.remarks
    });
    setShowAddRecordModal(true);
  };

  const handleDeleteRecord = async (nurseRecordId) => {
   
      try {
        await deleteIpdNursingRecord(nurseRecordId);
        setRecords((prev) => prev.filter((record) => record.nurseRecordId !== nurseRecordId));
        toast.success("Record deleted successfully!");
      } catch (error) {
        console.error("Error deleting nursing record:", error);
        toast.error(error.response?.data?.message || "Failed to delete nursing record");
      }
    
  };

  const handleStatusToggle = (nurseRecordId) => {
    setRecords((prev) => prev.map((record) =>
      record.nurseRecordId === nurseRecordId
        ? { ...record, status: record.status === "pending" ? "completed" : "pending" }
        : record
    ));
    toast.success("Status updated successfully!");
  };

  const getCombinedWardInfo = (patient) => {
    const wardType = patient?.wardType || "N/A";
    const wardNo = patient?.wardNo || patient?.wardNumber || "N/A";
    const bedNo = patient?.bedNo || patient?.bedNumber || "N/A";
    return `${wardType}-${wardNo}-${bedNo}`;
  };

  if (isLoading || apiData.frequencies.length === 0 || apiData.intakes.length === 0) {
    return <div>Loading...</div>;
  }

  const tableColumns = [
    {
      header: "Nurse Name",
      accessor: "nurseId",
      cell: (row) => {
        const nurse = nurses.find(n => String(n.value) === String(row.assignedNurseId || row.assignedNurse));
        return nurse ? nurse.label.split(' - ')[0] : row.assignedNurse || 'N/A';
      }
    },
    {
      header: "Date",
      accessor: "assignedDate",
      cell: (row) => new Date(row.assignedDate).toLocaleDateString()
    },
    {
      header: "Medicine",
      accessor: "drugName"
    },
    {
      header: "Dosage",
      accessor: "dosage",
      cell: (row) => `${row.dosage} ${getOptionLabel(apiData.dosageUnits, row.dosageUnit)}`
    },
    {
      header: "Frequency",
      accessor: "frequency",
      cell: (row) => getOptionLabel(apiData.frequencies, row.frequency) || row.frequency,
    },
    {
      header: "Intake",
      accessor: "intake",
      cell: (row) => getOptionLabel(apiData.intakes, row.intake) || row.intake,
    },
    {
      header: "Duration",
      accessor: "duration",
      cell: (row) => `${row.duration} days`
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleStatusToggle(row.nurseRecordId)}
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all ${
              row.status === "completed"
                ? "bg-green-100 text-green-800 hover:bg-green-200"
                : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
            }`}
            title={`Click to mark as ${row.status === "pending" ? "completed" : "pending"}`}
          >
            {row.status === "completed" ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
            {row.status === "completed" ? "Completed" : "Pending"}
          </button>
        </div>
      )
    },
    {
      header: "Actions",
      accessor: "actions",
      cell: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEditRecord(row)}
            className="edit-btn flex items-center justify-center hover:bg-blue-100 rounded p-1 transition hover:animate-bounce"
            title="Edit Record"
          >
            <FaEdit size={16} />
          </button>
          <button
            onClick={() => handleDeleteRecord(row.nurseRecordId)}
            className="delete-btn flex items-center justify-center hover:bg-red-100 rounded p-1 transition hover:animate-bounce"
            title="Delete Record"
          >
            <FaTrash size={16} />
          </button>
        </div>
      )
    }
  ];

  const DrugInputComponent = ({ value, onChange, onFocus, placeholder }) => {
    const inputRef = useRef(null);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const handleInputChange = async (e) => {
      const inputValue = e.target.value;
      onChange(inputValue);
      const filteredSuggestions = await fetchDrugSuggestions(inputValue);
      setSuggestions(filteredSuggestions);
      setShowSuggestions(inputValue.length > 0);
    };
    const handleInputFocus = async () => {
      if (value && value.length > 0) {
        const filteredSuggestions = await fetchDrugSuggestions(value);
        setSuggestions(filteredSuggestions);
        setShowSuggestions(true);
      }
      if (onFocus) onFocus();
    };
    const handleSuggestionClick = (suggestion) => {
      handleDrugSelection(suggestion);
      setShowSuggestions(false);
      onChange(suggestion.name);
    };
    return (
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
            {suggestions.map((drug) => (
              <div
                key={drug.id}
                onClick={() => handleSuggestionClick(drug)}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
              >
                <div className="font-medium text-gray-900">{drug.name}</div>
                <div className="text-xs text-gray-500">{drug.strength}, {drug.form}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const modalFields = [
    { name: "assignedNurse", label: "Assigned Nurse", type: "select", required: true, options: nurses, colSpan: 2 },
    { name: "assignedDate", label: "Assigned Date", type: "date", required: true, colSpan: 1 },
    { name: "drugName", label: "Medicine", type: "text", required: true, suggestions: localDrugList.map((drug) => drug.name), placeholder: "Search medicine...", colSpan: 2 },
    { name: "dosage", label: "Dosage", type: "number", placeholder: "Enter dosage", colSpan: 1 },
    { name: "dosageUnit", label: "Unit", type: "select", options: dosageUnitOptions, colSpan: 1 },
    { name: "frequency", label: "Frequency", type: "select", options: frequencyOptions, colSpan: 1 },
    { name: "intake", label: "Intake", type: "select", options: intakeOptions, colSpan: 1 },
    { name: "duration", label: "Duration (days)", type: "number", placeholder: "Enter duration", colSpan: 1 },
    { name: "status", label: "Status", type: "select", options: statusOptions, colSpan: 1 },
    { name: "remarks", label: "Remarks", type: "textarea", placeholder: "Enter any additional remarks", colSpan: 2 }
  ];

  return (
    <div className="min-h-screen">
      <header>
        <div className="max-w-7xl mx-auto px-6 py-4">
          {showPatientDetails && (
            <ProfileCard
              initials={getPatientName()?.split(" ").map(n => n[0]).join("").substring(0, 2) || "NA"}
              name={getPatientName()}
              fields={[
                { label: "Contact", value: patient?.phone || "N/A" },
                { label: "Age", value: getPatientAge() },
                { label: "Gender", value: patient?.gender || "N/A" },
                { label: "Symptoms", value: patient?.symptoms || "N/A" }
              ]}
            />
          )}
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-2">
        <DynamicTable
          columns={tableColumns}
          data={records}
          showSearchBar={true}
          showPagination={true}
          noDataMessage="No nursing records found."
          tabActions={[
            {
              label: "Add Record",
              onClick: handleAddRecord,
              icon: <Plus className="w-4 h-4" />,
              className: "px-4 py-2 bg-[var(--primary-color)] hover:bg-[var(--accent-color)] text-white rounded-lg transition-all flex items-center gap-2",
            },
            {
              label: "Show Vitals",
              onClick: () => setShowVitalsModal(true),
              icon: <Heart className="w-4 h-4" />,
              className: "px-4 py-2 bg-[var(--primary-color)] hover:bg-[var(--accent-color)] text-white rounded-lg transition-all flex items-center gap-2",
            },
          ]}
        />
      </main>
      <ReusableModal
        isOpen={showVitalsModal}
        onClose={() => setShowVitalsModal(false)}
        title="Patient Vitals"
        size="lg"
        extraContent={
          <VitalsForm
            data={{}}
            onSave={(formType, data) => {
              console.log("Vitals saved:", data);
              toast.success("Vitals saved successfully!");
              setShowVitalsModal(false);
            }}
            onPrint={(formType) => {
              console.log("Printing vitals form");
              toast.info("Printing vitals form...");
            }}
            patient={patient}
            setIsChartOpen={setShowVitalsChart}
            setChartVital={setChartVital}
          />
        }
        extraContentPosition="top"
      />
      <ReusableModal
        isOpen={showAddRecordModal}
        onClose={() => {
          setShowAddRecordModal(false);
          setEditingRecord(null);
        }}
        mode={editingRecord ? "edit" : "add"}
        title={editingRecord ? "Edit Nursing Record" : "Add New Nursing Record"}
        data={formData}
        fields={modalFields}
        size="lg"
        onSave={handleSaveRecord}
        saveLabel={editingRecord ? "Update Record" : "Save Record"}
        cancelLabel="Cancel"
      />
      <ChartModal
        isOpen={showVitalsChart}
        onClose={() => setShowVitalsChart(false)}
        vital={chartVital}
        records={vitalsRecords}
        selectedIdx={null}
      />
    </div>
  );
};

export default NursingAndTreatment;
