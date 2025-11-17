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
      type: "select",
      required: true,
      options: [], // Will be populated from getAllSpecializations API
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
      type: "select",
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
  const [specializations, setSpecializations] = useState([]);
  const [loadingSpecializations, setLoadingSpecializations] = useState(false);
  const [insuranceList, setInsuranceList] = useState([]);
  const [loadingInsurance, setLoadingInsurance] = useState(false);

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

  // Fetch specializations for Department select
  useEffect(() => {
    const fetchSpecializations = async () => {
      try {
        setLoadingSpecializations(true);
        const response = await getAllSpecializations();
        const specs = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
          ? response.data
          : [];
        const formattedSpecs = specs.map((spec, index) => ({
          key: `dept-${index}`,
          value: spec.specializationId || spec.id || spec.value,
          label: spec.name || spec.specializationName || spec.label,
        }));
        setSpecializations(formattedSpecs);
      } catch (error) {
        console.error("Error fetching specializations:", error);
        setSpecializations([]);
      } finally {
        setLoadingSpecializations(false);
      }
    };

    fetchSpecializations();
  }, []);

  // Build a derived field array with API-driven options
  const computedFields = useMemo(
    () =>
      (fields || []).map((field) => {
        if (field.name === "symptoms") {
          return { ...field, options: symptomsList };
        }
        if (field.name === "department") {
          return { ...field, options: specializations };
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
        if (field.name === "status") {
          // Ensure status is a string as per API spec
          return {
            ...field,
            options:
              field.options && field.options.length
                ? field.options
                : [
                    { key: "status-admitted", value: "Admitted", label: "Admitted" },
                    { key: "status-discharged", value: "Discharged", label: "Discharged" },
                  ],
          };
        }
        return field;
      }),
    [fields, symptomsList, specializations, insuranceList]
  );

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
                (field.name === "department" && loadingSpecializations) ||
                (field.name === "insuranceType" && loadingInsurance)
              }
              className={`w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#01B07A] peer pt-4 pb-1 ${
                field.disabled ||
                (field.name === "symptoms" && loadingSymptoms) ||
                (field.name === "department" && loadingSpecializations) ||
                (field.name === "insuranceType" && loadingInsurance)
                  ? "bg-gray-100 cursor-not-allowed"
                  : ""
              }`}
            >
              <option value="">
                {field.name === "symptoms" && loadingSymptoms
                  ? "Loading symptoms..."
                  : field.name === "department" && loadingSpecializations
                  ? "Loading departments..."
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
        ) : field.type === "multiselect" ? (
          <>
            <div className="relative">
              <div className="min-h-[42px] max-h-32 overflow-y-auto border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#01B07A] px-3 py-2">
                {loadingSymptoms ? (
                  <div className="text-xs text-gray-500">Loading symptoms...</div>
                ) : symptomsList.length === 0 ? (
                  <div className="text-xs text-gray-500">No symptoms available</div>
                ) : (
                  <div className="space-y-1">
                    {symptomsList.map((symptom) => (
                      <label key={symptom.key} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={selectedSymptoms.includes(symptom.value)}
                          onChange={() => handleSymptomToggle(symptom.value)}
                          className="w-3 h-3 text-[#01B07A] border-gray-300 rounded focus:ring-[#01B07A]"
                        />
                        <span className="text-xs sm:text-sm">{symptom.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <label className="absolute left-3 -top-2 text-xs text-gray-600 bg-white px-1 transition-all">
                {field.label}
                {field.required && " *"}
              </label>
              {selectedSymptoms.length > 0 && (
                <div className="mt-1 text-xs text-gray-600">
                  {selectedSymptoms.length} symptom{selectedSymptoms.length !== 1 ? 's' : ''} selected
                </div>
              )}
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