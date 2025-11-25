import React, { useState } from "react";
import { Eye, EyeOff, Camera, User, Calendar, Phone, Mail, Stethoscope, Clock } from "lucide-react";
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

const DetailItem = ({ icon: Icon, label, value, className = "" }) => (
  <div className={`flex items-start gap-3 ${className}`}>
    <div className="mt-0.5">
      <Icon className="w-4 h-4 text-gray-400" />
    </div>
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-900">
        {value || <span className="text-gray-400">Not specified</span>}
      </p>
    </div>
  </div>
);

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
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
              <h4 className="text-xs sm:text-sm font-semibold text-blue-800 flex items-center gap-2">
                <User className="w-4 h-4" />
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
                onKeyPress={(e) => e.key === 'Enter' && onFetchPatient()}
                className="flex-1 px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                placeholder="Enter OPD Patient ID or Appointment ID"
              />
              <button
                onClick={onFetchPatient}
                disabled={!patientIdInput.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-xs sm:text-sm font-medium transition-colors"
              >
                Search
              </button>
            </div>
          </div>

          {transferPreview && (
            <div className="mb-6 bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 flex items-center">
                  <User className="mr-2 w-4 h-4" />
                  Patient Details (Transfer from OPD)
                </h4>
              </div>
              
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-3">
                    <DetailItem 
                      icon={User} 
                      label="Patient ID" 
                      value={transferPreview.patientId} 
                    />
                    <DetailItem 
                      icon={Stethoscope} 
                      label="Appointment ID" 
                      value={transferPreview.appointmentUid} 
                    />
                    <DetailItem 
                      icon={User} 
                      label="Patient Name" 
                      value={transferPreview.patientName} 
                    />
                    <DetailItem 
                      icon={Calendar} 
                      label="Age" 
                      value={transferPreview.age ? `${transferPreview.age} years` : null} 
                    />
                    <DetailItem 
                      icon={User} 
                      label="Gender" 
                      value={transferPreview.gender} 
                    />
                  </div>
                  <div className="space-y-3">
                    <DetailItem 
                      icon={Phone} 
                      label="Phone" 
                      value={transferPreview.patientPhoneNumber} 
                    />
                    <DetailItem 
                      icon={Mail} 
                      label="Email" 
                      value={transferPreview.patientEmailId} 
                    />
                    <DetailItem 
                      icon={Calendar} 
                      label="Appointment Date" 
                      value={transferPreview.appointmentDate ? 
                        new Date(transferPreview.appointmentDate).toLocaleDateString() : null} 
                    />
                    <DetailItem 
                      icon={Clock} 
                      label="Time Slot" 
                      value={transferPreview.slotTime} 
                    />
                    <DetailItem 
                      icon={User} 
                      label="Doctor" 
                      value={transferPreview.doctorName} 
                    />
                  </div>
                </div>

                {transferPreview.symptomNames?.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <Stethoscope className="w-4 h-4 mr-2" />
                      Reported Symptoms
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {transferPreview.symptomNames.map((symptom, idx) => (
                        <span 
                          key={idx} 
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {symptom}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {transferPreview.notes && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Doctor's Notes</h5>
                    <div className="bg-gray-50 p-3 rounded text-sm text-gray-700 whitespace-pre-line">
                      {transferPreview.notes}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
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