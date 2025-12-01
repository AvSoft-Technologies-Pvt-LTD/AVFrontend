//nursing
import React, { useState, useRef, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, Building, User, Calendar, FileText, Activity, Heart, Search, Plus, Clock, CheckCircle } from "lucide-react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";
import { getFrequencies, getIntakes, getDosageUnits, getNurseDashboard } from "../../../../utils/masterService";
import { createIpdNursingRecord } from "../../../../utils/CrudService";
import VitalsForm from "./dr-form/VitalsForm";
import ReusableModal from "../../../../components/microcomponents/Modal";
import DynamicTable from "../../../../components/microcomponents/DynamicTable";
import VitalsChart from "./dr-form/VitalsChart";
import { usePatientContext } from "../../../../context-api/PatientContext";

const NursingAndTreatment = () => {
  const navigate = useNavigate();
  const { patient, setPatient } = usePatientContext();
  const [activeSection, setActiveSection] = useState("records");
  const [showPatientDetails, setShowPatientDetails] = useState(true);
  const [showAddRecordModal, setShowAddRecordModal] = useState(false);
  const [showVitalsChart, setShowVitalsChart] = useState(false);
  const [chartVital, setChartVital] = useState(null);
  const [chartType, setChartType] = useState("bar");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchInputRef = useRef(null);
  
  // Initialize patient data if not available
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
  const [records, setRecords] = useState([
    {
      id: 1,
      nurseId: "NUR123",
      assignedNurse: "Jane Doe",
      assignedDate: "2025-01-15",
      drugName: "Paracetamol",
      dosage: "500",
      dosageUnit: "mg",
      frequency: "twice a day",
      intake: "After Food",
      duration: "5",
      status: "pending",
      remarks: "Take with water"
    },
    {
      id: 2,
      nurseId: "NUR456",
      assignedNurse: "Mary Smith",
      assignedDate: "2025-01-14",
      drugName: "Ibuprofen",
      dosage: "400",
      dosageUnit: "mg",
      frequency: "once a day",
      intake: "Before Food",
      duration: "3",
      status: "completed",
      remarks: "Take before breakfast"
    }
  ]);
  const [editingRecord, setEditingRecord] = useState(null);
  const [nurses, setNurses] = useState([]);
  const [formData, setFormData] = useState({
    assignedNurse: "",
    assignedDate: "",
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

  // Fetch nurses for dropdown
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

        if (frequenciesRes?.data?.length > 0) {
          setFormData(prev => ({ ...prev, frequency: frequenciesRes.data[0].id }));
        }
        if (intakesRes?.data?.length > 0) {
          setFormData(prev => ({ ...prev, intake: intakesRes.data[0].id }));
        }
        if (dosageUnitsRes?.data?.length > 0) {
          setFormData(prev => ({ ...prev, dosageUnit: dosageUnitsRes.data[0].id }));
        }
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

  // Using the nurses state for the dropdown

  const getOptionLabel = (options, id) => {
    const option = options.find(opt => opt.id === id);
    return option ? option.name : '';
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
  const handleShowVitalSigns = () => setActiveSection("vitals");
  const handleShowNurseRecords = () => setActiveSection("records");

  const handleSearchToggle = () => {
    setIsSearchExpanded(!isSearchExpanded);
    if (!isSearchExpanded) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      setSearchQuery("");
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredRecords = records.filter((record) => {
    if (!searchQuery) return true;

    const searchLower = searchQuery.toLowerCase();
    return (
      record.nurseId.toLowerCase().includes(searchLower) ||
      record.assignedNurse.toLowerCase().includes(searchLower) ||
      record.drugName.toLowerCase().includes(searchLower) ||
      record.frequency.toLowerCase().includes(searchLower) ||
      record.intake.toLowerCase().includes(searchLower) ||
      record.status.toLowerCase().includes(searchLower) ||
      record.remarks.toLowerCase().includes(searchLower) ||
      `${record.dosage} ${record.dosageUnit}`.toLowerCase().includes(searchLower) ||
      new Date(record.assignedDate).toLocaleDateString().toLowerCase().includes(searchLower)
    );
  });

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
    console.log("calling the api  fetchDrugSuggestions ")
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
    // Find the selected nurse's name
    const selectedNurse = nurses.find(n => n.value === recordData.assignedNurse);
    const nurseName = selectedNurse ? selectedNurse.label.split(' - ')[0] : 'Unknown Nurse';
    
    if (!recordData.assignedNurse || !recordData.drugName) {
      toast.error("Please fill in required fields (Nurse and Medicine)");
      return;
    }

    try {
      const payload = {
        ipdrowaid: patient?.id, // Get IPD ID from patient context
        nurseId: recordData.assignedNurse,
        assignedDate: recordData.assignedDate,
        drugName: recordData.drugName,
        dosage: recordData.dosage,
        dosageUnit: recordData.dosageUnit,
        frequency: recordData.frequency,
        intake: recordData.intake,
        duration: recordData.duration,
        status: recordData.status || "pending",
        remarks: recordData.remarks || ""
      };

      if (editingRecord) {
        // Update existing record
        // Note: You might want to implement an update endpoint
        setRecords((prev) => prev.map((record) => 
          record.id === editingRecord.id ? { ...record, ...recordData, nurseId: record.nurseId } : record
        ));
        toast.success("Record updated successfully!");
      } else {
        // Create new record
        const response = await createIpdNursingRecord(payload);
        const newRecord = { 
          id: response.data?.id || Date.now(),
          nurseId: `NUR${Math.floor(Math.random() * 1000)}`, 
          ...recordData 
        };
        setRecords((prev) => [...prev, newRecord]);
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

  const handleDeleteRecord = (recordId) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      setRecords((prev) => prev.filter((record) => record.id !== recordId));
      toast.success("Record deleted successfully!");
    }
  };

  const handleStatusToggle = (recordId) => {
    setRecords((prev) => prev.map((record) => record.id === recordId ? { ...record, status: record.status === "pending" ? "completed" : "pending" } : record));
    toast.success("Status updated successfully!");
  };

  const getCombinedWardInfo = (patient) => {
    const wardType = patient?.wardType || "N/A";
    const wardNo = patient?.wardNo || patient?.wardNumber || "N/A";
    const bedNo = patient?.bedNo || patient?.bedNumber || "N/A";
    return `${wardType}-${wardNo}-${bedNo}`;
  };

  const tableColumns = [
    { header: "Nurse ID", accessor: "nurseId" },
    { header: "Assigned Nurse", accessor: "assignedNurse" },
    { header: "Date", accessor: "assignedDate", cell: (row) => new Date(row.assignedDate).toLocaleDateString() },
    { header: "Medicine", accessor: "drugName" },
    { header: "Dosage", accessor: "dosage", cell: (row) => `${row.dosage} ${row.dosageUnit}` },
    { header: "Frequency", accessor: "frequency" },
    { header: "Intake", accessor: "intake" },
    { header: "Duration", accessor: "duration", cell: (row) => `${row.duration} days` },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleStatusToggle(row.id)}
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
            onClick={() => handleDeleteRecord(row.id)}
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
    <div className="min-h-screen ">
      <header>
        <div className="max-w-7xl mx-auto px-6 py-4">
  <div className="flex items-center gap-4 -ml-4">
 
</div>


{showPatientDetails && (
  <div className="bg-gradient-to-r from-[#01B07A] to-[#1A223F] rounded-xl p-4 border border-[#01B07A]/40 mb-4 shadow-md animate-fadeIn text-white">
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 w-full">
      <div className="flex items-center gap-6 flex-wrap w-full lg:w-auto">
        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white text-[#01B07A] text-sm font-bold shadow-lg uppercase">
          {getPatientName()?.split(" ").map((n) => n[0]).join("") || "N/A"}
        </div>
        <div className="flex flex-col gap-1 min-w-0">
          <div>
            <h2 className="text-lg font-semibold text-white truncate">
              {getPatientName()}
            </h2>
            {/* <div className="flex items-center gap-2 text-sm text-gray-200 truncate">
              <Mail className="w-4 h-4 text-white/80" />
              <span className="truncate">{patient?.email || "N/A"}</span>
            </div> */}
          </div>
          <div className="flex flex-wrap gap-x-12 gap-y-3 text-sm pt-1">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <Phone className="w-4 h-4 text-white/80" />
                <span><strong>Contact:</strong> {patient?.phone || "N/A"}</span>
              </div>
              {isIPDPatient && (
                <div className="flex items-center gap-1">
                  <Building className="w-4 h-4 text-white/80" />
                  <span><strong>Ward:</strong> {getCombinedWardInfo(patient)}</span>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4 text-white/80" />
                <span><strong>Age:</strong> {getPatientAge()}</span>
              </div>
              {isIPDPatient && (
                <div className="flex items-center gap-1">
                  <Activity className="w-4 h-4 text-white/80" />
                  <span>
                    <strong>Status:</strong>
                    <span
                      className={`ml-1 px-2 py-1 rounded-full text-xs font-semibold ${
                        patient?.status?.toUpperCase() === "ADMITTED"
                          ? "bg-green-200 text-green-900"
                          : patient?.status === "Under Treatment"
                          ? "bg-yellow-200 text-yellow-900"
                          : patient?.status?.toUpperCase() === "DISCHARGED"
                          ? "bg-gray-200 text-gray-900"
                          : "bg-blue-200 text-blue-900"
                      }`}
                    >
                      {patient?.status?.toUpperCase() || "N/A"}
                    </span>
                  </span>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-white/80" />
                <span><strong>Gender:</strong> {patient?.gender || "N/A"}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <FileText className="w-4 h-4 text-white/80" />
                <span><strong>Diagnosis:</strong> {patient?.diagnosis || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)}


          <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
            <div className="flex flex-wrap gap-2">
              <button
                className={`px-4 py-2 rounded-md text-sm font-semibold hover:shadow-lg transition-all flex items-center gap-2 ${
                  activeSection === "records"
                    ? "bg-[var(--accent-color)] text-white border-[var(--accent-color)]"
                    : "bg-[var(--primary-color)] text-white border-[var(--primary-color)] hover:bg-[var(--accent-color)]"
                }`}
                onClick={handleShowNurseRecords}
              >
                <FileText className="w-4 h-4" /> Nurse Records
              </button>
              <button
                className={`px-4 py-2 rounded-md text-sm font-semibold hover:shadow-lg transition-all flex items-center gap-2 ${
                  activeSection === "vitals"
                    ? "bg-[var(--accent-color)] text-white border-[var(--accent-color)]"
                    : "bg-[var(--primary-color)] text-white border-[var(--primary-color)] hover:bg-[var(--accent-color)]"
                }`}
                onClick={handleShowVitalSigns}
              >
                <Heart className="w-4 h-4" /> Show Vital Signs
              </button>
            </div>

            {activeSection === "records" && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSearchToggle}
                    className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300 ${
                      isSearchExpanded
                        ? "bg-[var(--accent-color)] text-white"
                        : "bg-gray-100 text-[var(--primary-color)] hover:bg-gray-200"
                    }`}
                    title="Search Records"
                  >
                    <Search className="w-4 h-4" />
                  </button>

                  <div className={`transition-all duration-300 ease-in-out ${
                    isSearchExpanded ? "w-64 opacity-100" : "w-0 opacity-0"
                  } overflow-hidden`}>
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      placeholder="Search records..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] text-sm"
                    />
                  </div>
                </div>
                <button
                  onClick={handleAddRecord}
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--primary-color)] hover:bg-[var(--accent-color)] text-white rounded-lg transition-all"
                >
                  <Plus className="w-4 h-4" /> Add Record
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-2">
        {activeSection === "vitals" && (
          <div className="mb-8 animate-slideIn">
            <VitalsForm
              data={{}}
              onSave={(formType, data) => {
                console.log("Vitals saved:", data);
                toast.success("Vitals saved successfully!");
              }}
              onPrint={(formType) => {
                console.log("Printing vitals form");
                toast.info("Printing vitals form...");
              }}
              patient={patient}
              setIsChartOpen={setShowVitalsChart}
              setChartVital={setChartVital}
            />
          </div>
        )}

        {activeSection === "records" && (
          <div className="animate-fadeIn">
            {searchQuery && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  Showing {filteredRecords.length} of {records.length} records for "{searchQuery}"
                  {filteredRecords.length !== records.length && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setIsSearchExpanded(false);
                      }}
                      className="ml-2 text-blue-600 hover:text-blue-800 underline"
                    >
                      Clear search
                    </button>
                  )}
                </p>
              </div>
            )}
            {filteredRecords.length > 0 ? (
              <DynamicTable
                columns={tableColumns}
                data={filteredRecords}
                showSearchBar={false}
              />
            ) : searchQuery ? (
              <div className="text-center py-8">
                <Search className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">No records found for "{searchQuery}"</p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setIsSearchExpanded(false);
                  }}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Clear search to see all records
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">No nursing records found</p>
                <button
                  onClick={handleAddRecord}
                  className="btn btn-primary"
                >
                  <Plus className="w-4 h-4" /> Add First Record
                </button>
              </div>
            )}
          </div>
        )}
      </main>
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
      {showVitalsChart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setShowVitalsChart(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500 z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-semibold text-[var(--primary-color)] mb-4 flex items-center gap-2">
              <BarChart3 className="w-6 h-6" />
              {chartVital
                ? `${chartVital.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase())} Chart & Analytics`
                : "Vitals Chart & Analytics"
              }
            </h3>
            <div className="flex flex-wrap gap-2 mb-4 border-b border-gray-200 pb-3">
              {[
                { id: "bar", name: "Bar Chart", icon: "📊" },
                { id: "line", name: "Line Chart", icon: "📈" },
                { id: "area", name: "Area Chart", icon: "🌄" },
                { id: "pie", name: "Pie Chart", icon: "🥧" },
                { id: "radar", name: "Radar Chart", icon: "🕸️" }
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => setChartType(type.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    chartType === type.id
                      ? "bg-[var(--primary-color)] text-white"
                      : "bg-gray-100 text-[var(--primary-color)] hover:bg-gray-200"
                  }`}
                >
                  <span>{type.icon}</span>
                  <span>{type.name}</span>
                </button>
              ))}
            </div>
            <div className="h-96 flex flex-col w-full">
              <VitalsChart
                vital={chartVital}
                records={[]}
                selectedIdx={null}
                range={{
                  heartRate: { min: 60, max: 100, label: "bpm", name: "Heart Rate", optimal: 70 },
                  temperature: { min: 36.1, max: 37.2, label: "°C", name: "Temperature", optimal: 36.5 },
                  bloodSugar: { min: 70, max: 140, label: "mg/dL", name: "Blood Sugar", optimal: 90 },
                  bloodPressure: { min: 90, max: 120, label: "mmHg", name: "Blood Pressure", optimal: 110 },
                  height: { min: 100, max: 220, label: "cm", name: "Height", optimal: 170 },
                  weight: { min: 30, max: 200, label: "kg", name: "Weight", optimal: 70 }
                }[chartVital]}
                chartType={chartType}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NursingAndTreatment;





