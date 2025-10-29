import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import DynamicTable from "../../../../components/microcomponents/DynamicTable";
import ReusableModal from "../../../../components/microcomponents/Modal";
import ProfileCard from "../../../../components/microcomponents/ProfileCard";
import {
  ArrowLeft,
  Search,
  Plus,
  CheckCircle,
  Heart,
  Activity,
  Thermometer,
  Share2,
} from "lucide-react";
import {
  getHospitalDropdown,
  getAllMedicalConditions,
  getAllMedicalStatus,
} from "../../../../utils/masterService";

const DrMedicalRecords = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);

  // Extract patient data from location.state
  const patientDataFromOPD = location.state?.patientData || location.state || {};
  const patientNameFromOPD = location.state?.patientName || patientDataFromOPD?.name || "";
  const patientEmailFromOPD = location.state?.email || patientDataFromOPD?.email || "";
  const patientPhoneFromOPD = location.state?.phone || patientDataFromOPD?.phone || "";
  const patientGenderFromOPD = location.state?.gender || patientDataFromOPD?.gender || "";
  const patientDobFromOPD = location.state?.dob || patientDataFromOPD?.dob || "";
  const patientAgeFromOPD = location.state?.age || patientDataFromOPD?.age || "";
  const patientDiagnosisFromOPD = location.state?.diagnosis || patientDataFromOPD?.diagnosis || "";
  const patientVisitDateFromOPD = location.state?.dateOfVisit || location.state?.appointmentDate || patientDataFromOPD?.dateOfVisit || patientDataFromOPD?.appointmentDate || "";
  const patientTypeFromOPD = location.state?.type || patientDataFromOPD?.type || "OPD";

  const [state, setState] = useState({
    activeTab: patientTypeFromOPD || "OPD",
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
  const [patientDetailsMap, setPatientDetailsMap] = useState({});
  const [hospitalOptions, setHospitalOptions] = useState([]);
  const [medicalConditions, setMedicalConditions] = useState([]);
  const [statusTypes, setStatusTypes] = useState([]);
  const [apiDataLoading, setApiDataLoading] = useState({
    hospitals: false,
    conditions: false,
    status: false,
  });

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

  const isRecordForSelectedPatient = (record) => {
    const patientEmail = patientEmailFromOPD;
    const patientPhone = patientPhoneFromOPD;
    const recordEmail = record.email || record.patientEmail || record.Email;
    const recordPhone = record.phone || record.phoneNumber || record.Phone;
    return recordEmail === patientEmail || recordPhone === patientPhone;
  };

  useEffect(() => {
    const fetchAllRecords = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        const response = await axios.get(
          "https://6895d385039a1a2b28907a16.mockapi.io/pt-mr/patient-mrec"
        );
        const opd = [];
        const ipd = [];
        const virtual = [];
        response.data.forEach((rec) => {
          if (isRecordForSelectedPatient(rec)) {
            if (rec.type === "OPD") opd.push(rec);
            else if (rec.type === "IPD") ipd.push(rec);
            else if (rec.type === "Virtual") virtual.push(rec);
          }
        });
        setMedicalData({ OPD: opd, IPD: ipd, Virtual: virtual });
        await fetchPatientDetailsForRecords([...opd, ...ipd, ...virtual]);
      } catch (err) {
        setFetchError("Failed to fetch medical records.");
      } finally {
        setLoading(false);
      }
    };
    fetchAllRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPatientDetailsForRecords = async (records) => {
    const patientMap = {};
    for (const record of records) {
      try {
        const phone = record.phone || record.phoneNumber || record.Phone;
        const email = record.email || record.patientEmail || record.Email;
        const patientId = record.patientId || record.id;
        let patientDetails = null;
        if (phone) {
          try {
            const phoneResponse = await axios.get(
              `https://681f2dfb72e59f922ef5774c.mockapi.io/addpatient?phone=${encodeURIComponent(phone)}`
            );
            if (Array.isArray(phoneResponse.data) && phoneResponse.data.length > 0) {
              patientDetails = phoneResponse.data[0];
            } else if (phoneResponse.data) {
              patientDetails = phoneResponse.data;
            }
          } catch (e) {
            console.log("Phone lookup failed for:", phone);
          }
        }
        if (!patientDetails && email) {
          try {
            const emailResponse = await axios.get(
              `https://681f2dfb72e59f922ef5774c.mockapi.io/addpatient?email=${encodeURIComponent(email)}`
            );
            if (Array.isArray(emailResponse.data) && emailResponse.data.length > 0) {
              patientDetails = emailResponse.data[0];
            } else if (emailResponse.data) {
              patientDetails = emailResponse.data;
            }
          } catch (e) {
            console.log("Email lookup failed for:", email);
          }
        }
        if (!patientDetails && patientId) {
          try {
            const idResponse = await axios.get(
              `https://681f2dfb72e59f922ef5774c.mockapi.io/addpatient?id=${patientId}`
            );
            if (Array.isArray(idResponse.data) && idResponse.data.length > 0) {
              patientDetails = idResponse.data[0];
            } else if (idResponse.data) {
              patientDetails = idResponse.data;
            }
          } catch (e) {
            console.log("ID lookup failed for:", patientId);
          }
        }
        if (patientDetails) {
          patientMap[record.id] = {
            ...patientDetails,
            hospitalName: record.hospitalName,
          };
        }
      } catch (error) {
        console.error("Error fetching patient details for record:", record.id, error);
      }
    }
    setPatientDetailsMap(patientMap);
  };

  useEffect(() => {
    const collator = new Intl.Collator(undefined, { sensitivity: "base", numeric: false });
    const byLabelAsc = (a, b) => collator.compare(String(a.label || ""), String(b.label || ""));
    const fetchMasterData = async () => {
      try {
        setApiDataLoading((prev) => ({ ...prev, hospitals: true }));
        const hospitalsResponse = await getHospitalDropdown();
        const hospitalsList = (hospitalsResponse?.data ?? [])
          .map((hospital) => {
            const label = hospital?.name || hospital?.hospitalName || hospital?.label || "";
            const value = hospital?.id ?? label;
            return { label, value };
          })
          .filter((opt) => opt.label)
          .sort(byLabelAsc);
        setHospitalOptions(hospitalsList);
        setApiDataLoading((prev) => ({ ...prev, hospitals: false }));
        setApiDataLoading((prev) => ({ ...prev, conditions: true }));
        const conditionsResponse = await getAllMedicalConditions();
        const conditionsList = (conditionsResponse?.data ?? [])
          .map((condition) => ({
            label: condition?.name || condition?.conditionName || condition?.label || "",
            value: condition?.name || condition?.conditionName || condition?.value || condition?.id || "",
          }))
          .filter((opt) => opt.label)
          .sort(byLabelAsc);
        setMedicalConditions(conditionsList);
        setApiDataLoading((prev) => ({ ...prev, conditions: false }));
        setApiDataLoading((prev) => ({ ...prev, status: true }));
        const statusResponse = await getAllMedicalStatus();
        const statusList = (statusResponse?.data ?? [])
          .map((status) => ({
            label: status?.name || status?.statusName || status?.label || "",
            value: status?.name || status?.statusName || status?.value || status?.id || "",
          }))
          .filter((opt) => opt.label)
          .sort(byLabelAsc);
        setStatusTypes(statusList);
        setApiDataLoading((prev) => ({ ...prev, status: false }));
      } catch (error) {
        console.error("Error fetching master data:", error);
        const fallbackHospitals = [
          { label: "AIIMS Delhi", value: "AIIMS Delhi" },
          { label: "Apollo Hospital, Chennai", value: "Apollo Hospital, Chennai" },
          { label: "Fortis Hospital, Gurgaon", value: "Fortis Hospital, Gurgaon" },
          { label: "Max Super Speciality Hospital, Delhi", value: "Max Super Speciality Hospital, Delhi" },
          { label: "Medanta – The Medicity, Gurgaon", value: "Medanta – The Medicity, Gurgaon" },
        ].sort(byLabelAsc);
        setHospitalOptions(fallbackHospitals);
        const fallbackConditions = [
          { label: "Asthma Disease", value: "Asthma" },
          { label: "BP (Blood Pressure)", value: "BP" },
          { label: "Diabetic Disease", value: "Diabetic" },
          { label: "Heart Disease", value: "Heart" },
        ].sort(byLabelAsc);
        setMedicalConditions(fallbackConditions);
        const fallbackStatus = [
          { label: "Active", value: "Active" },
          { label: "Consulted", value: "Consulted" },
          { label: "Discharged", value: "Discharged" },
          { label: "Recovered", value: "Recovered" },
          { label: "Treated", value: "Treated" },
        ].sort(byLabelAsc);
        setStatusTypes(fallbackStatus);
      } finally {
        setApiDataLoading((prev) => ({ ...prev, hospitals: false, conditions: false, status: false }));
      }
    };
    fetchMasterData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateState = (updates) => setState((prev) => ({ ...prev, ...updates }));

  const handleViewDetails = (record) => {
    const patientDetails = patientDetailsMap[record.id];
    const patientName = patientNameFromOPD || (patientDetails ? `${patientDetails.firstName || ""} ${patientDetails.lastName || ""}`.trim() : record.patientName || record.name || "");
    const email = patientEmailFromOPD || patientDetails?.email || record.email || record.patientEmail || record.Email || "";
    const phone = patientPhoneFromOPD || patientDetails?.phone || record.phone || record.phoneNumber || record.Phone || "";
    const gender = patientGenderFromOPD || patientDetails?.gender || record.gender || record.sex || "";
    const dob = patientDobFromOPD || patientDetails?.dob || record.dob || "";
    const diagnosis = patientDiagnosisFromOPD || patientDetails?.diagnosis || record.diagnosis || record.chiefComplaint || "";
    let firstName, lastName;
    if (patientNameFromOPD) {
      const nameParts = patientNameFromOPD.split(" ");
      firstName = nameParts[0] || "Guest";
      lastName = nameParts.slice(1).join(" ") || "";
    } else if (patientDetails) {
      firstName = patientDetails.firstName || "Guest";
      lastName = patientDetails.lastName || "";
    } else if (record.firstName && record.lastName) {
      firstName = record.firstName;
      lastName = record.lastName;
    } else if (patientName) {
      const nameParts = patientName.split(" ");
      firstName = nameParts[0] || "Guest";
      lastName = nameParts.slice(1).join(" ") || "";
    } else {
      firstName = "Guest";
      lastName = "";
    }
    const patientData = {
      ...record,
      patientName,
      email,
      phone,
      gender,
      id: record.id || record.patientId || "",
      currentDate: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      currentTime: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      firstName,
      lastName,
      patientDetails,
      opdPatientData: patientDataFromOPD,
      dob,
      diagnosis,
      hospitalName: patientDetails?.hospitalName || record.hospitalName || "AV Hospital",
    };
    navigate("/doctordashboard/medical-record-details", {
      state: {
        selectedRecord: {
          ...patientData,
          isVerified: record.isVerified || false,
          hasDischargeSummary: record.hasDischargeSummary || false,
          phoneConsent: record.phoneConsent || false,
          createdBy: record.createdBy || "patient",
        },
        firstName,
        lastName,
        email,
        phone,
        gender,
        dob,
        diagnosis,
        patientName,
        patientDetails,
        patientPhone: phone,
        patientEmail: email,
        patientId: record.id || record.patientId || "",
        recordType: record.type || state.activeTab,
        opdPatientData: patientDataFromOPD,
        hospitalName: patientDetails?.hospitalName || record.hospitalName || "AV Hospital",
      },
    });
  };

  const handleHideRecord = (id) => {
    updateState({ hiddenIds: [...state.hiddenIds, id] });
  };

  const handleUnhideRecord = (id) => {
    updateState({
      hiddenIds: state.hiddenIds.filter((hiddenId) => hiddenId !== id),
    });
  };

  // Share handler: tries Web Share API; falls back to clipboard copy
  const handleShareRecord = async (record) => {
    try {
      const patientDetails = patientDetailsMap[record.id];
      const patientName = patientDetails ? `${patientDetails.firstName || ""} ${patientDetails.lastName || ""}`.trim() : record.patientName || record.name || "";
      const visitDate = record.dateOfVisit || record.dateOfAdmission || record.dateOfConsultation || patientVisitDateFromOPD || "Unknown date";
      const summaryText = `Medical Record for ${patientName}\nType: ${record.type || "N/A"}\nHospital: ${resolveHospitalLabel(record.hospitalId ?? record.hospitalName) || "N/A"}\nChief Complaint / Diagnosis: ${record.chiefComplaint || record.diagnosis || "N/A"}\nVisit Date: ${visitDate}\n\nShared via AV Hospital Portal.`;
      // Construct a shareable URL (adjust path to match your app's shareable route if needed)
      const shareUrl = `${window.location.origin}/doctordashboard/medical-records/${record.id}`;
      const shareData = {
        title: `Medical Record — ${patientName}`,
        text: summaryText,
        url: shareUrl,
      };

      if (navigator.share) {
        // Use native share dialog
        await navigator.share(shareData);
        // Optionally notify user
        // (use your own toast instead of alert in production)
        // alert("Share dialog opened.");
        return;
      }

      // Fallback: copy to clipboard
      const clipboardText = `${shareData.title}\n\n${shareData.text}\n\nLink: ${shareData.url}`;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(clipboardText);
        // alert("Share data copied to clipboard. You can paste it anywhere to share.");
      } else {
        // last resort: prompt with the text for manual copy
        // eslint-disable-next-line no-alert
        window.prompt("Copy the share text below:", clipboardText);
      }
    } catch (err) {
      console.error("Error while sharing record:", err);
      alert("Unable to open share dialog. The share text has been copied to clipboard if available.");
      try {
        const patientDetails = patientDetailsMap[record.id];
        const patientName = patientDetails ? `${patientDetails.firstName || ""} ${patientDetails.lastName || ""}`.trim() : record.patientName || record.name || "";
        const visitDate = record.dateOfVisit || record.dateOfAdmission || record.dateOfConsultation || patientVisitDateFromOPD || "Unknown date";
        const clipboardText = `Medical Record for ${patientName}\nType: ${record.type || "N/A"}\nHospital: ${resolveHospitalLabel(record.hospitalId ?? record.hospitalName) || "N/A"}\nChief Complaint / Diagnosis: ${record.chiefComplaint || record.diagnosis || "N/A"}\nVisit Date: ${visitDate}\n\nLink: ${window.location.origin}/doctordashboard/medical-records/${record.id}`;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(clipboardText);
        }
      } catch (e) {
        // ignore fallback errors
      }
    }
  };

  const handleAddRecord = async (formData) => {
    const recordType = formData.type || state.activeTab;
    const selectedHospital = hospitalOptions.find(
      (o) => String(o.value) === String(formData.hospitalId)
    );
    const userFirstName = user?.firstName || "Guest";
    const userLastName = user?.lastName || "";
    const fullPatientName = `${userFirstName} ${userLastName}`.trim();
    const newRecord = {
      id: Date.now(),
      ...formData,
      hospitalId: selectedHospital?.value ?? formData.hospitalId ?? formData.hospitalName,
      hospitalName: selectedHospital?.label ?? resolveHospitalLabel(formData.hospitalId ?? formData.hospitalName),
      type: recordType,
      patientName: fullPatientName,
      firstName: userFirstName,
      lastName: userLastName,
      age: user?.age ? `${user.age} years` : "N/A",
      sex: user?.gender || "Not specified",
      phone: formData.phoneNumber || user?.phone || "Not provided",
      email: formData.email || user?.email || "Not provided",
      phoneConsent: formData.phoneConsent || false,
      address: user?.address || "Not provided",
      isVerified: true,
      hasDischargeSummary: recordType === "IPD",
      isNewlyAdded: true,
      createdBy: "doctor",
      hiddenByPatient: false,
      vitals: {
        bloodPressure: "N/A",
        heartRate: "N/A",
        temperature: "N/A",
        spO2: "N/A",
        respiratoryRate: "N/A",
        height: "N/A",
        weight: "N/A",
      },
    };
    try {
      const response = await axios.post(
        "https://6895d385039a1a2b28907a16.mockapi.io/pt-mr/patient-mrec",
        newRecord
      );
      setMedicalData((prev) => ({
        ...prev,
        [recordType]: [...(prev[recordType] || []), response.data],
      }));
      try {
        const phone = newRecord.phone || newRecord.phoneNumber;
        const email = newRecord.email;
        let patientDetails = null;
        if (phone) {
          try {
            const phoneResponse = await axios.get(
              `https://681f2dfb72e59f922ef5774c.mockapi.io/addpatient?phone=${encodeURIComponent(phone)}`
            );
            if (Array.isArray(phoneResponse.data) && phoneResponse.data.length > 0) {
              patientDetails = phoneResponse.data[0];
            }
          } catch (e) {
            console.log("Phone lookup failed for new record");
          }
        }
        if (!patientDetails && email) {
          try {
            const emailResponse = await axios.get(
              `https://681f2dfb72e59f922ef5774c.mockapi.io/addpatient?email=${encodeURIComponent(email)}`
            );
            if (Array.isArray(emailResponse.data) && emailResponse.data.length > 0) {
              patientDetails = emailResponse.data[0];
            }
          } catch (e) {
            console.log("Email lookup failed for new record");
          }
        }
        if (patientDetails) {
          setPatientDetailsMap((prev) => ({
            ...prev,
            [response.data.id]: {
              ...patientDetails,
              hospitalName: newRecord.hospitalName,
            },
          }));
        }
      } catch (error) {
        console.error("Error fetching patient details for new record:", error);
      }
      updateState({ showAddModal: false });
      alert("Record added successfully!");
    } catch (error) {
      console.error("Error adding record:", error);
      setMedicalData((prev) => ({
        ...prev,
        [recordType]: [...(prev[recordType] || []), newRecord],
      }));
      updateState({ showAddModal: false });
      alert("Failed to add record. The record has been saved locally.");
    }
  };

  const createColumns = (type) => {
    const baseFields = {
      OPD: ["hospitalName", "type", "chiefComplaint", "dateOfVisit", "status"],
      IPD: ["hospitalName", "type", "chiefComplaint", "dateOfAdmission", "dateOfDischarge", "status"],
      Virtual: ["hospitalName", "type", "chiefComplaint", "dateOfConsultation", "status"],
    };
    const fieldLabels = {
      hospitalName: "Hospital",
      type: "Type",
      chiefComplaint: "Chief Complaint",
      dateOfVisit: "Date of Visit",
      dateOfAdmission: "Date of Admission",
      dateOfDischarge: "Date of Discharge",
      dateOfConsultation: "Date of Consultation",
      status: "Status",
    };
    const typeColors = { OPD: "purple", IPD: "blue", Virtual: "indigo" };
    return [
      ...baseFields[type].map((key) => ({
        header: fieldLabels[key],
        accessor: key,
        cell: (row) => {
          if (key === "hospitalName") {
            return (
              <div className="flex items-center gap-2">
                {(row.isVerified === true || row.hasDischargeSummary === true || row.phoneConsent === true || row.createdBy === "doctor") && (
                  <CheckCircle
                    size={16}
                    className="text-green-600"
                    title={
                      row.isVerified ? "Verified record" :
                      row.hasDischargeSummary ? "Has discharge summary" :
                      row.phoneConsent ? "Phone consent given" :
                      "Doctor created record"
                    }
                  />
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
          if (key === "type") {
            return (
              <span className={`text-sm font-semibold px-2 py-1 rounded-full bg-${typeColors[row.type]}-100 text-${typeColors[row.type]}-800`}>
                {row.type}
              </span>
            );
          }
          if (key === "status") {
            return (
              <span className="text-sm font-semibold px-2 py-1 rounded-full bg-green-100 text-green-800">
                {row.status}
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
    (medicalData[state.activeTab] || [])
      .filter((record) => !record.hiddenByPatient)
      .map((record) => {
        const chiefComplaint = record.chiefComplaint || record.diagnosis || "";
        const displayHospital = resolveHospitalLabel(record.hospitalId ?? record.hospitalName);
        const patientDetails = patientDetailsMap[record.id];
        return {
          ...record,
          hospitalName: displayHospital,
          chiefComplaint,
          displayPatientName: patientDetails ? `${patientDetails.firstName || ""} ${patientDetails.lastName || ""}`.trim() : record.patientName || record.name || "Unknown Patient",
        };
      })
      .sort((a, b) => {
        const dateA = a.dateOfVisit || a.dateOfAdmission || a.dateOfConsultation || "1970-01-01";
        const dateB = b.dateOfVisit || b.dateOfAdmission || b.dateOfConsultation || "1970-01-01";
        return new Date(dateB) - new Date(dateA);
      });

  const getFormFields = (recordType) => [
    {
      name: "hospitalId",
      label: "Hospital Name",
      type: "select",
      options: hospitalOptions,
      loading: apiDataLoading.hospitals,
    },
    { name: "chiefComplaint", label: "Chief Complaint", type: "text" },
    {
      name: "conditions",
      label: "Medical Conditions",
      type: "multiselect",
      options: medicalConditions,
      loading: apiDataLoading.conditions,
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: statusTypes,
      loading: apiDataLoading.status,
    },
    ...(recordType === "OPD" ? [{ name: "dateOfVisit", label: "Date of Visit", type: "date" }] : recordType === "IPD" ? [
      { name: "dateOfAdmission", label: "Date of Admission", type: "date" },
      { name: "dateOfDischarge", label: "Date of Discharge", type: "date" },
    ] : [{ name: "dateOfConsultation", label: "Date of Consultation", type: "date" }]),
    {
      name: "phoneNumber",
      label: "Register Phone Number",
      type: "text",
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
              records.map((r) =>
                resolveHospitalLabel(r.hospitalId ?? r.hospitalName)
              )
            )
            .filter(Boolean)
        ),
      ].map((label) => ({ value: label, label })),
    },
    {
      key: "status",
      label: "Status",
      options: statusTypes,
    },
  ];

  const selectedRecord = location.state?.selectedRecord || location.state || null;

  const tabActions = [
    {
      label: (
        <div className="flex items-center gap-1">
          <Plus size={16} className="sm:h-4 sm:w-4" />
          <span className="text-xs sm:text-xs">Add Record</span>
        </div>
      ),
      onClick: () => updateState({ showAddModal: true }),
      className: "btn btn-primary w-full sm:w-auto py-1 px-2 sm:py-2 sm:px-9 text-xs sm:text-sm",
    },
  ];

  const getConsentStats = () => {
    const allRecords = Object.values(medicalData).flat();
    const visibleToDoctor = allRecords.filter((record) => !record.hiddenByPatient);
    const verifiedRecords = visibleToDoctor.filter(
      (record) => record.isVerified === true || record.hasDischargeSummary === true || record.phoneConsent === true || record.createdBy === "doctor"
    );
    const totalRecords = visibleToDoctor.length;
    return {
      withConsent: verifiedRecords.length,
      visible: visibleToDoctor.length,
      total: totalRecords,
      percentage: totalRecords > 0 ? Math.round((visibleToDoctor.length / totalRecords) * 100) : 0,
    };
  };

  const consentStats = getConsentStats();

  // Helper function to format visit date based on record type
  const getVisitDate = (record) => {
    const type = record?.type || patientTypeFromOPD;
    if (type === "OPD") {
      return record?.dateOfVisit || patientVisitDateFromOPD || "--";
    } else if (type === "IPD") {
      return record?.dateOfAdmission || patientDataFromOPD?.admissionDate || "--";
    } else {
      return record?.dateOfConsultation || patientDataFromOPD?.dateOfConsultation || "--";
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Back Button */}
      <button
        className="mb-4 inline-flex items-center text-sm sm:text-base"
        onClick={() => navigate("/doctordashboard/patients")}
      >
        <ArrowLeft size={18} className="sm:h-5 sm:w-5" />
        <span className="ms-2 font-medium">Back to Patient List</span>
      </button>

       {(selectedRecord || patientDataFromOPD) && (
        <ProfileCard
          initials={getInitials(patientNameFromOPD || selectedRecord?.patientName || selectedRecord?.name || "")}
          name={patientNameFromOPD || selectedRecord?.patientName || selectedRecord?.name || "--"}
          fields={[
            { label: "Age", value: patientAgeFromOPD || selectedRecord?.age || "35 year" },
            { label: "Gender", value: patientGenderFromOPD || selectedRecord?.gender || selectedRecord?.sex || "--" },
            { label: "Hospital", value: selectedRecord?.hospitalName || patientDataFromOPD?.hospitalName || "AV Hospital" },
            { label: "Visit Date", value: getVisitDate(selectedRecord || patientDataFromOPD || "23/10/2025") },
            { label: "Diagnosis", value: patientDiagnosisFromOPD || selectedRecord?.diagnosis || selectedRecord?.chiefComplaint || "Fever" },
            { label: "K/C/O", value: selectedRecord?.["K/C/O"] || "--" },
            ...((selectedRecord?.type === "IPD" || patientTypeFromOPD === "IPD") ? [{ label: "Ward Type", value: selectedRecord?.wardType || patientDataFromOPD?.wardType || "--" }] : []),
          ]}
        />
      )}

      {/* Medical Records Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <Search size={20} className="text-[var(--primary-color)] sm:h-6 sm:w-6" />
          <div>
            <h2 className="text-lg sm:text-xl font-semibold">Medical Records History</h2>
          </div>
        </div>
      </div>

      {/* Dynamic Table */}
      <div className="overflow-x-auto">
        <DynamicTable
          columns={createColumns(state.activeTab)}
          data={getCurrentTabData()}
          filters={filters}
          tabs={tabs}
          tabActions={tabActions}
          activeTab={state.activeTab}
          onTabChange={(tab) => updateState({ activeTab: tab })}
        />
      </div>

      {/* Loading/Error/Empty States */}
      {loading && (
        <div className="text-center py-6 sm:py-8">
          <p className="text-sm sm:text-base">Loading medical records...</p>
        </div>
      )}
      {fetchError && (
        <div className="text-center text-red-600 py-6 sm:py-8">
          <p className="text-sm sm:text-base">{fetchError}</p>
        </div>
      )}
      {getCurrentTabData().length === 0 && !loading && !fetchError && (
        <div className="text-center py-6 sm:py-8 text-gray-600">
          <div className="flex flex-col items-center gap-3 sm:gap-4">
            <CheckCircle size={36} className="text-gray-400 sm:h-10 sm:w-10" />
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">No Accessible Medical Records</h3>
              <p className="text-xs sm:text-sm">No medical records found for this patient in the selected category.</p>
            </div>
          </div>
        </div>
      )}

      {/* Add Record Modal */}
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

export default DrMedicalRecords;
