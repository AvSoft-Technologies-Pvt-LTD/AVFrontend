import React, { useState } from "react";
import { Eye, EyeOff, Camera } from "lucide-react";

// Helper: Convert file to base64
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        base64: reader.result,
        name: file.name,
        type: file.type,
        size: file.size,
      });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

// Helper: Handle pincode lookup
export const handlePincodeLookup = async (pincode) => {
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    const data = await res.json();
    if (
      data[0].Status === "Success" &&
      data[0].PostOffice &&
      data[0].PostOffice.length > 0
    ) {
      const cities = [
        ...new Set(data[0].PostOffice.map((office) => office.Name)),
      ];
      return {
        cities,
        district: data[0].PostOffice[0].District,
        state: data[0].PostOffice[0].State,
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching pincode data:", error);
    return null;
  }
};

// Helper: Generate basic fields for step 1
export const generateBasicFields = (masterData, availableCities, isLoadingCities) => {
  return [
    {
      name: "firstName",
      label: "First Name",
      type: "text",
      required: true,
    },
    { name: "middleName", label: "Middle Name", type: "text" },
    {
      name: "lastName",
      label: "Last Name",
      type: "text",
      required: true,
    },
    {
      name: "phone",
      label: "Phone Number",
      type: "text",
      required: true,
    },
    {
      name: "email",
      label: "Email Address",
      type: "email",
      required: true,
    },
    {
      name: "aadhaar",
      label: "Aadhaar Number",
      type: "text",
      required: true,
    },
    {
      name: "gender",
      label: "Gender",
      type: "select",
      required: true,
      options: masterData.genders.map((g, i) => ({
        ...g,
        key: `gender-${i}`,
      })),
    },
    {
      name: "dob",
      label: "Date of Birth",
      type: "date",
      required: true,
    },
    {
      name: "occupation",
      label: "Occupation",
      type: "text",
      required: true,
    },
    {
      name: "pincode",
      label: "Pincode",
      type: "text",
      required: true,
      maxLength: 6,
    },
    {
      name: "city",
      label: "City",
      type: "select",
      required: true,
      options: availableCities.map((city, i) => ({
        value: city,
        label: city,
        key: `city-${i}`,
      })),
      disabled: isLoadingCities || availableCities.length === 0,
    },
    {
      name: "district",
      label: "District",
      type: "text",
      readonly: true,
    },
    { name: "state", label: "State", type: "text", readonly: true },
    {
      name: "photo",
      label: "Upload Photo",
      type: "custom",
    },
    {
      name: "password",
      label: "Create Password",
      type: "password",
      required: true,
    },
    {
      name: "confirmPassword",
      label: "Confirm Password",
      type: "password",
      required: true,
    },
    {
      name: "agreeDeclaration",
      label: "I agree to the declaration / Privacy Policy",
      type: "checkbox",
      required: true,
      colSpan: 3,
    },
  ];
};

const PhotoUpload = ({ photoPreview, onPhotoChange, onPreviewClick }) => (
  <div className="relative w-full">
    <label className="block relative cursor-pointer">
      <div className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-[#01B07A] focus-within:border-[#01B07A] min-h-[2.5rem]">
        <Camera size={16} className="text-gray-500" />
        <span className="truncate text-gray-700">
          {photoPreview ? "Photo Uploaded" : "Upload Photo *"}
        </span>
      </div>
      <input
        type="file"
        name="photo"
        accept="image/*"
        onChange={onPhotoChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
    </label>
    {photoPreview && (
      <div className="mt-2 flex items-center gap-2">
        <span className="text-xs text-green-600 font-medium">✓ Photo Uploaded</span>
        <button
          type="button"
          onClick={onPreviewClick}
          className="text-blue-500 hover:text-blue-700 p-1"
        >
          <Eye size={16} />
        </button>
      </div>
    )}
  </div>
);

const IPDBasic = ({
  data,
  onChange,
  onNext,
  patientIdInput,
  setPatientIdInput,
  onFetchPatient,
  fields,
  photoPreview,
  onPhotoChange,
  onPreviewClick,
  isLoadingCities,
  availableCities,
}) => {
  const [showPassword, setShowPassword] = useState(false);

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
      {field.type === "custom" ? (
        <PhotoUpload
          photoPreview={photoPreview}
          onPhotoChange={onPhotoChange}
          onPreviewClick={onPreviewClick}
        />
      ) : field.type === "checkbox" ? (
        <label className="inline-flex items-start gap-2 text-xs sm:text-sm mt-2">
          <input
            type="checkbox"
            name={field.name}
            checked={!!data[field.name]}
            onChange={(e) => onChange(field.name, e.target.checked)}
            className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0"
          />
          <span className="leading-4">{field.label}</span>
          {field.required && <span className="text-red-500">*</span>}
        </label>
      ) : (
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
                <option value="">
                  {field.disabled && isLoadingCities
                    ? "Loading cities..."
                    : field.disabled && availableCities.length === 0
                    ? "Enter pincode first"
                    : `Select ${field.label}`}
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
          ) : field.type === "password" ? (
            <>
              <input
                type={showPassword ? "text" : "password"}
                name={field.name}
                value={data[field.name] || ""}
                onChange={(e) => onChange(field.name, e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#01B07A] peer pt-4 pb-1 pr-10"
                placeholder=" "
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-3 right-3 cursor-pointer text-gray-700"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </span>
              <label className="absolute left-3 -top-2 text-xs text-gray-600 bg-white px-1 transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-sm peer-focus:-top-2 peer-focus:text-xs peer-focus:text-[#01B07A]">
                {field.label}
                {field.required && " *"}
              </label>
              {field.name === "password" && data.password && (
                <p className="text-xs text-gray-600 mt-1">
                  Include Capital Letters, Numbers, and Special Characters
                </p>
              )}
            </>
          ) : (
            <>
              <input
                type={field.type || "text"}
                name={field.name}
                value={data[field.name] || ""}
                onChange={(e) => onChange(field.name, e.target.value)}
                readOnly={field.readonly}
                maxLength={field.maxLength}
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
      )}
    </div>
  );

  return (
    <div>
      <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
        Basic Patient Details
      </h3>
      <div className="mb-4 sm:mb-6">
        <div className="p-3 sm:p-4 bg-blue-50 rounded-md border border-blue-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
            <h4 className="text-xs sm:text-sm font-semibold text-blue-800 flex items-center gap-2">
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              Transfer OPD Patient to IPD
            </h4>
            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
              Optional
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <input
              type="text"
              value={patientIdInput}
              onChange={(e) => setPatientIdInput(e.target.value)}
              className="flex-1 px-3 py-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
              placeholder="Enter OPD Patient ID"
            />
            <button
              onClick={onFetchPatient}
              disabled={!patientIdInput.trim()}
              className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-xs sm:text-sm font-medium w-full sm:w-auto"
            >
              Search
            </button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {fields.map((field) => renderField(field))}
      </div>
    </div>
  );
};

export default IPDBasic;