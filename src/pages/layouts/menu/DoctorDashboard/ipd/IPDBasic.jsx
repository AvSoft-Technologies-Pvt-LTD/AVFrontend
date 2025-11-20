import React, { useState } from "react";
import { Eye, EyeOff, Camera } from "lucide-react";
import PatientRegistration from "../../../../../form/PatientRegistration";


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
  return [];
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
  transferPreview,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [activeSection, setActiveSection] = useState("transfer");

  // Placeholder handlers; replace with real ones if available in parent
  const fetchPatientByAadhar = async () => {};
  const fetchPatientByPhone = async () => {};
  const sendOtp = async () => {};
  const handleConfirm = () => {
    if (typeof onNext === "function") {
      onNext();
    }
    setActiveSection("transfer");
  };
  const handleCancel = () => setActiveSection("transfer");

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
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base sm:text-lg font-semibold">
          Basic Patient Details
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveSection("transfer")}
            className={`relative cursor-pointer flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm font-medium ${
              activeSection === "transfer"
                ? "text-[var(--primary-color)] after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:bg-[var(--primary-color)]"
                : "text-gray-500 hover:text-[var(--accent-color)]"
            }`}
          >
            Transfer Patient
          </button>
          <button
            onClick={() => setActiveSection("add")}
            className={`relative cursor-pointer flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm font-medium ${
              activeSection === "add"
                ? "text-[var(--primary-color)] after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:bg-[var(--primary-color)]"
                : "text-gray-500 hover:text-[var(--accent-color)]"
            }`}
          >
            Add Patient
          </button>
        </div>
      </div>

      {activeSection === "transfer" ? (
        <>
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 rounded-md border border-blue-200">
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

          {transferPreview && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-white rounded-md border border-blue-200 shadow-sm text-xs sm:text-sm">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-semibold text-gray-800">OPD Appointment Preview</h5>
                <span className="text-[10px] sm:text-xs text-gray-500">
                  Read-only preview from OPD
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <span className="font-medium text-gray-600">Appointment ID: </span>
                  <span className="text-gray-900">{transferPreview.appointmentUid || "-"}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Patient Name: </span>
                  <span className="text-gray-900">{transferPreview.patientName || "-"}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Phone: </span>
                  <span className="text-gray-900">{transferPreview.patientPhoneNumber || "-"}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Email: </span>
                  <span className="text-gray-900">{transferPreview.patientEmailId || "-"}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Doctor: </span>
                  <span className="text-gray-900">{transferPreview.doctorName || "-"}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Date: </span>
                  <span className="text-gray-900">{transferPreview.appointmentDate || "-"}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Time: </span>
                  <span className="text-gray-900">{transferPreview.slotTime || "-"}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Symptoms: </span>
                  <span className="text-gray-900">
                    {Array.isArray(transferPreview.symptomNames) && transferPreview.symptomNames.length
                      ? transferPreview.symptomNames.join(", ")
                      : "-"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Fields removed intentionally */}
        </>
      ) : (
        <div className="mt-2">
          <PatientRegistration
            fetchPatientByAadhar={fetchPatientByAadhar}
            fetchPatientByPhone={fetchPatientByPhone}
            sendOtp={sendOtp}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
            otpLength={4}
          />
        </div>
      )}
    </div>
  );
};
export default IPDBasic;