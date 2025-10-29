import React from "react";
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
      options: masterData.departments.map((d, i) => ({
        ...d,
        key: `dept-${i}`,
      })),
    },
    {
      name: "insuranceType",
      label: "Insurance Type",
      type: "select",
      required: true,
      options: staticData.insurance,
    },
    {
      name: "surgeryRequired",
      label: "Surgery Required",
      type: "select",
      options: staticData.surgery,
    },
    { name: "dischargeDate", label: "Discharge Date", type: "date" },
    { name: "diagnosis", label: "Diagnosis", type: "text" },
    {
      name: "reasonForAdmission",
      label: "Reason For Admission",
      type: "textarea",
      colSpan: 2,
    },
  ];
};

const IPDFinal = ({ data, selectedWard, selectedRoom, selectedBed, fields, onChange }) => {
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
              disabled={field.disabled}
              className={`w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#01B07A] peer pt-4 pb-1 ${
                field.disabled ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
            >
              <option value="">Select {field.label}</option>
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
        {fields.map(renderField)}
      </div>
    </div>
  );
};

export default IPDFinal;