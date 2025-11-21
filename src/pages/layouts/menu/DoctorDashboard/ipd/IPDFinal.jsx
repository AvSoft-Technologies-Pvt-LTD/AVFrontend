import React, { useState, useEffect, useMemo } from "react";

import { Bed } from "lucide-react";
import {
  Users,
  Heart,
  AlertTriangle,
  Baby,
  Shield,
  Stethoscope,
  Activity,
} from "lucide-react";
import { getAllSymptoms, getAllSpecializations } from "../../../../../utils/masterService";
import { getAllInsurance } from "../../../../../utils/CrudService";

const WARD_ICONS = {
  "General Ward": Users,
  General: Users,
  "ICU Ward": Heart,
  ICU: Heart,
  ICCU: Activity,
  Emergency: AlertTriangle,
  "Private Room": Shield,
  Private: Shield,
  Maternity: Baby,
  Surgical: Stethoscope,
};

const getWardIcon = (wardType) => {
  if (!wardType) return <Bed className="w-4 h-4 sm:w-5 sm:h-5" />;
  const IconComponent = WARD_ICONS[wardType] || Bed;
  return <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />;
};

// Helper: Generate fields for admission/final step
export const generateAdmissionFields = (masterData, staticData) => {
  return [
    {
      name: "admissionDate",
      label: "Admission Date",
      type: "date",
      required: true,
    },
    {
      name: "admissionTime",
      label: "Admission Time",
      type: "time",
      required: true,
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      options: staticData.status,
    },
    {
      name: "wardType",
      label: "Ward Type",
      type: "text",
      readonly: true,
    },
    {
      name: "wardNumber",
      label: "Ward Number",
      type: "text",
      readonly: true,
    },
    {
      name: "roomNumber",
      label: "Room Number",
      type: "text",
      readonly: true,
    },
    {
      name: "bedNumber",
      label: "Bed Number",
      type: "text",
      readonly: true,
    },
    {
      name: "department",
      label: "Department",
      type: "text",
      readonly: true,
    },
    {
      name: "insuranceType",
      label: "Insurance Type",
      type: "select",
      required: true,
      options: [], // Will be populated from getAllInsurance API
    },
    {
      name: "surgeryRequired",
      label: "Surgery Required",
      type: "select",
      options: staticData.surgery,
    },
    { name: "dischargeDate", label: "Discharge Date", type: "date" },
    {
      name: "symptoms",
      label: "Symptoms",
      type: "multiselect",
      required: true,
      options: [], // Will be populated from getAllSymptoms API
    },
    {
      name: "reasonForAdmission",
      label: "Reason For Admission",
      type: "textarea",
      colSpan: 2,
    },
  ];
};

const IPDFinal = ({ data, selectedWard, selectedRoom, selectedBed, fields, onChange }) => {
  const [symptomsList, setSymptomsList] = useState([]);
  const [loadingSymptoms, setLoadingSymptoms] = useState(false);
  const [insuranceList, setInsuranceList] = useState([]);
  const [loadingInsurance, setLoadingInsurance] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [symptomsOpen, setSymptomsOpen] = useState(false);
  const [symptomsSearch, setSymptomsSearch] = useState("");

  // Fetch symptoms from API
  useEffect(() => {
    const fetchSymptoms = async () => {
      try {
        setLoadingSymptoms(true);
        const response = await getAllSymptoms();
        const raw = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
          ? response.data
          : [];
        // API example: [{"symptomId":1,"name":"headache","description":"string"}]
        const formattedSymptoms = raw.map((symptom, index) => ({
          key: `symptom-${index}`,
          value: symptom.symptomId || symptom.id || symptom.value || symptom._id,
          label: symptom.name || symptom.label || symptom.symptomName,
        }));
        setSymptomsList(formattedSymptoms);
      } catch (error) {
        console.error('Error fetching symptoms:', error);
        // Set empty array if API fails - no fallback symptoms
        setSymptomsList([]);
      } finally {
        setLoadingSymptoms(false);
      }
    };

    fetchSymptoms();
  }, []);

  // Fetch insurance list for Insurance Type select
  useEffect(() => {
    const fetchInsurance = async () => {
      try {
        setLoadingInsurance(true);
        const response = await getAllInsurance();
        const list = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
          ? response.data
          : [];
        // API example: [{ id, mobileNumber, insuranceProvider, policyNumber, coverageType, status }]
        const formatted = list.map((ins, index) => ({
          key: `ins-${index}`,
          value: ins.id,
          label: ins.insuranceProvider,
        }));
        setInsuranceList(formatted);
      } catch (error) {
        console.error("Error fetching insurance list:", error);
        setInsuranceList([]);
      } finally {
        setLoadingInsurance(false);
      }
    };

    fetchInsurance();
  }, []);

  // Keep selectedSymptoms in sync with data.symptoms (supports single value or array)
  useEffect(() => {
    const value = data?.symptoms;
    if (Array.isArray(value)) {
      setSelectedSymptoms(value);
    } else if (value != null && value !== "") {
      setSelectedSymptoms([value]);
    } else {
      setSelectedSymptoms([]);
    }
  }, [data?.symptoms]);

  // Build a derived field array with API-driven options
  const computedFields = useMemo(
    () =>
      (fields || []).map((field) => {
        if (field.name === "symptoms") {
          return { ...field, options: symptomsList };
        }
        if (field.name === "insuranceType") {
          return { ...field, options: insuranceList };
        }
        if (field.name === "surgeryRequired") {
          // Map human labels to boolean values expected as surgeryReq
          return {
            ...field,
            options: [
              { key: "surg-no", value: false, label: "No" },
              { key: "surg-yes", value: true, label: "Yes" },
            ],
          };
        }
        return field;
      }),
    [fields, symptomsList, insuranceList]
  );

  const handleSymptomsChange = (values) => {
    setSelectedSymptoms(values);
    // Propagate to parent wizard state
    onChange("symptoms", values);
  };

  const renderField = (field) => (
    <div
      key={field.name}
      className={`col-span-1 ${
        field.colSpan === 1.5
          ? "sm:col-span-1"
          : field.colSpan === 2
          ? "sm:col-span-2"
          : field.colSpan === 3
          ? "sm:col-span-3"
          : "sm:col-span-1"
      }`}
    >
      <div className="relative">
        {field.type === "select" ? (
          <>
            <select
              value={data[field.name] || ""}
              onChange={(e) => onChange(field.name, e.target.value)}
              disabled={
                field.disabled ||
                (field.name === "symptoms" && loadingSymptoms) ||
                (field.name === "insuranceType" && loadingInsurance)
              }
              className={`w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#01B07A] peer pt-4 pb-1 ${
                field.disabled ||
                (field.name === "symptoms" && loadingSymptoms) ||
                (field.name === "insuranceType" && loadingInsurance)
                  ? "bg-gray-100 cursor-not-allowed"
                  : ""
              }`}
            >
              <option value="">
                {field.name === "symptoms" && loadingSymptoms
                  ? "Loading symptoms..."
                  : field.name === "insuranceType" && loadingInsurance
                  ? "Loading insurance..."
                  : `Select ${field.label}`
                }
              </option>
              {field.options?.map((opt) => (
                <option key={opt.key || opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <label className="absolute left-3 -top-2 text-xs text-gray-600 bg-white px-1 transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-sm peer-focus:-top-2 peer-focus:text-xs peer-focus:text-[#01B07A]">
              {field.label}
              {field.required && " *"}
            </label>
          </>
        ) : field.type === "multiselect" && field.name === "symptoms" ? (
          <>
            <div className="floating-input relative" data-placeholder={field.label}>
              <div className="relative">
                {symptomsOpen ? (
                  <input
                    type="text"
                    placeholder={
                      Array.isArray(selectedSymptoms) && selectedSymptoms.length > 0
                        ? `${selectedSymptoms
                            .map((value) => {
                              const opt = symptomsList.find((o) => String(o.value) === String(value));
                              return opt?.label || value;
                            })
                            .join(", ")} • Search Symptoms...`
                        : "Search Symptoms..."
                    }
                    value={symptomsSearch}
                    onChange={(e) => setSymptomsSearch(e.target.value)}
                    className="input-field peer w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-md text-left bg-white focus:outline-none focus:ring-2 pr-8 sm:pr-10"
                    autoFocus
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setSymptomsOpen(true)}
                    className="input-field peer w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-md text-left bg-white focus:outline-none focus:ring-2 flex justify-between items-center"
                  >
                    <span className="truncate text-xs sm:text-sm">
                      {Array.isArray(selectedSymptoms) && selectedSymptoms.length > 0
                        ? selectedSymptoms
                            .map((value) => {
                              const opt = symptomsList.find((o) => String(o.value) === String(value));
                              return opt?.label || value;
                            })
                            .join(", ")
                        : `Select ${field.label}`}
                    </span>
                  </button>
                )}
                {symptomsOpen && (
                  <div className="absolute z-[1000] mt-1 w-full max-h-40 sm:max-h-60 overflow-auto rounded-md bg-white shadow-lg border border-gray-200">
                    <div className="max-h-40 sm:max-h-60 overflow-auto">
                      {symptomsList
                        .filter((opt) =>
                          (opt.label || "")
                            .toLowerCase()
                            .includes(symptomsSearch.toLowerCase())
                        ).length > 0 ? (
                        symptomsList
                          .filter((opt) =>
                            (opt.label || "")
                              .toLowerCase()
                              .includes(symptomsSearch.toLowerCase())
                          )
                          .map((opt) => (
                            <label
                              key={opt.key || opt.value}
                              className="flex items-center px-3 sm:px-4 py-1.5 sm:py-2 hover:bg-gray-100 cursor-pointer text-xs sm:text-sm transition-colors duration-150"
                            >
                              <input
                                type="checkbox"
                                className="mr-2 sm:mr-3 h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                checked={
                                  Array.isArray(selectedSymptoms) &&
                                  selectedSymptoms.includes(opt.value)
                                }
                                onChange={(e) => {
                                  const prev = Array.isArray(selectedSymptoms)
                                    ? selectedSymptoms
                                    : [];
                                  const next = e.target.checked
                                    ? [...prev, opt.value]
                                    : prev.filter((v) => v !== opt.value);
                                  handleSymptomsChange(next);
                                  setSymptomsOpen(false);
                                }}
                              />
                              <span className="flex-1">{opt.label}</span>
                            </label>
                          ))
                      ) : (
                        <div className="px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-500 text-center">
                          No options found
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <label className="absolute left-3 -top-2 text-xs text-gray-600 bg-white px-1 transition-all">
                {field.label}
                {field.required && " *"}
              </label>
            </div>
          </>
        ) : field.type === "textarea" ? (
          <>
            <textarea
              name={field.name}
              value={data[field.name] || ""}
              onChange={(e) => onChange(field.name, e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#01B07A] peer pt-4 pb-1"
            />
            <label className="absolute left-3 -top-2 text-xs text-gray-600 bg-white px-1 transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-sm peer-focus:-top-2 peer-focus:text-xs peer-focus:text-[#01B07A]">
              {field.label}
              {field.required && " *"}
            </label>
          </>
        ) : (
          <>
            <input
              type={field.type || "text"}
              name={field.name}
              value={data[field.name] || ""}
              onChange={(e) => onChange(field.name, e.target.value)}
              readOnly={field.readonly}
              className={`w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#01B07A] peer pt-4 pb-1 ${
                field.readonly ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
              placeholder=" "
            />
            <label className="absolute left-3 -top-2 text-xs text-gray-600 bg-white px-1 transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-sm peer-focus:-top-2 peer-focus:text-xs peer-focus:text-[#01B07A]">
              {field.label}
              {field.required && " *"}
            </label>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
        IPD Admission Details
      </h3>
      <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg border">
        <h4 className="font-semibold mb-2 text-xs sm:text-sm flex items-center gap-2">
          {getWardIcon(data.wardType)}Ward Assignment
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
          <div>
            <span className="text-gray-600">Department:</span>
            <div className="font-medium">{data.department || "N/A"}</div>
          </div>
          <div>
            <span className="text-gray-600">Ward Type:</span>
            <div className="font-medium">{data.wardType || "N/A"}</div>
          </div>
          <div>
            <span className="text-gray-600">Ward Number:</span>
            <div className="font-medium">{data.wardNumber || "N/A"}</div>
          </div>
          <div>
            <span className="text-gray-600">Room Number:</span>
            <div className="font-medium">{selectedRoom || "N/A"}</div>
          </div>
          <div>
            <span className="text-gray-600">Bed Number:</span>
            <div className="font-medium">{data.bedNumber || "N/A"}</div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {computedFields.map(renderField)}
      </div>
    </div>
  );
};

export default IPDFinal;