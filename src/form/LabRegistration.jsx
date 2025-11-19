import React from "react";
import { FileText, Camera } from "lucide-react";

const NeatFileUpload = ({ name, accept, multiple = false, files, onFileChange, label }) => {
  return (
    <div className="relative floating-input" data-placeholder={label}>
      <label className="block cursor-pointer">
        <div className="input-field flex items-center gap-2 peer">
          <FileText size={16} />
          <span className="truncate">{label}</span>
        </div>
        <input
          type="file"
          name={name}
          accept={accept}
          multiple={multiple}
          onChange={onFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer peer"
        />
      </label>
      {files?.length > 0 && (
        <div className="mt-2 space-y-1">
          {files.map((file, i) => (
            <div key={`${file.name}-${i}`} className="flex justify-between items-center p-2 border rounded-md">
              <span className="text-sm text-gray-700">{file.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const PhotoUpload = ({ photoPreview, onPhotoChange, onPreviewClick }) => (
  <div className="relative floating-input" data-placeholder="Upload Photo *">
    <label className="block relative cursor-pointer">
      <div className="input-field flex items-center gap-2 peer">
        <Camera size={16} />
        <span className="truncate">Upload Photo *</span>
      </div>
      <input
        type="file"
        name="photo"
        accept="image/*"
        onChange={onPhotoChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      {photoPreview && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <button
            type="button"
            onClick={onPreviewClick}
            className="text-[var(--accent-color)] hover:text-[var(--accent-color)]"
          >
            View
          </button>
        </div>
      )}
    </label>
  </div>
);

const CompactDropdownCheckbox = ({
  label,
  options,
  selected,
  onChange,
  required = false,
  placeholder = "Select options",
  loading = false,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleCheckboxChange = (option, checked) => {
    if (checked) {
      onChange([...(selected || []), option]);
    } else {
      onChange((selected || []).filter((item) => item !== option));
    }
  };

  const displayText = loading
    ? "Loading..."
    : selected && selected.length > 0
    ? selected.length === 1
      ? selected[0]
      : `${selected.length} selected`
    : placeholder;

  return (
    <div
      className="floating-input relative w-full"
      data-placeholder={label + (required ? " *" : "")}
    >
      <div className="relative">
        <button
          type="button"
          onClick={() => !loading && setIsOpen(!isOpen)}
          disabled={loading}
          className={`input-field peer w-full flex items-center justify-between text-left ${
            loading ? "cursor-not-allowed opacity-50" : ""
          }`}
        >
          <span
            className={
              selected && selected.length > 0 && !loading
                ? "text-gray-900"
                : "text-gray-400"
            }
          >
            {displayText}
          </span>
        </button>
        {isOpen && !loading && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {options.map((option, index) => (
              <label
                key={`${String(option)}-${index}`}
                className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(String(option))}
                  onChange={(e) =>
                    handleCheckboxChange(String(option), e.target.checked)
                  }
                  className="mr-3 rounded border-gray-300 text-[var(--accent-color)] focus:ring-[var(--accent-color)]"
                />
                <span className="text-sm text-gray-700">{String(option)}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const LabRegistration = ({
  formData,
  errors,
  handleInputChange,
  handleFileChange,
  apiData,
}) => {
  const renderInput = (name, type = "text", placeholder = "", required = false) => (
    <div
      className="floating-input relative w-full"
      data-placeholder={`${placeholder}${required ? " *" : ""}`}
    >
      <input
        type={type}
        name={name}
        placeholder=" "
        required={required}
        autoComplete="off"
        value={formData[name] || ""}
        onChange={handleInputChange}
        className={`input-field peer ${errors[name] ? "input-error" : ""}`}
      />
      {errors[name] && <p className="error-text">{errors[name]}</p>}
    </div>
  );

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className="floating-input relative w-full"
          data-placeholder="Center Type *"
        >
          <select
            name="centerType"
            value={formData.centerType}
            onChange={handleInputChange}
            disabled={apiData.loading.centerTypes}
            className={`input-field peer ${
              errors.centerType ? "input-error" : ""
            } ${
              apiData.loading.centerTypes
                ? "bg-gray-100 cursor-not-allowed"
                : ""
            }`}
            required
          >
            <option value="">
              {apiData.loading.centerTypes
                ? "Loading center types..."
                : "Select Center Type"}
            </option>
            {apiData.centerTypes.map((type, index) => (
              <option key={`${type}-${index}`} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.centerType && (
            <p className="error-text">{errors.centerType}</p>
          )}
        </div>
        {renderInput("centerName", "text", "Center Name", true)}
        {renderInput("ownerFullName", "text", "Owner's Full Name", true)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {renderInput("phone", "text", "Phone Number", true)}
        {renderInput("email", "email", "Email", true)}
        {renderInput("registrationNumber", "text", "Registration Number", true)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {renderInput("gstNumber", "text", "GST Number", true)}
        {renderInput("licenseNumber", "text", "License Number", true)}
        <PhotoUpload
          photoPreview={formData.photoPreview}
          onPhotoChange={handleFileChange}
          onPreviewClick={() => {}}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CompactDropdownCheckbox
          label="Available Tests"
          options={apiData.availableTests}
          selected={formData.availableTests}
          onChange={(selected) =>
            handleInputChange({
              target: { name: "availableTests", value: selected },
            })
          }
          required
          placeholder={
            apiData.loading.availableTests
              ? "Loading tests..."
              : "Select Available Tests"
          }
          loading={apiData.loading.availableTests}
        />
        <CompactDropdownCheckbox
          label="Scan Services"
          options={apiData.scanServices}
          selected={formData.scanServices}
          onChange={(selected) =>
            handleInputChange({
              target: { name: "scanServices", value: selected },
            })
          }
          required
          placeholder={
            apiData.loading.scanServices
              ? "Loading scan services..."
              : "Select Scan Services"
          }
          loading={apiData.loading.scanServices}
        />
        <CompactDropdownCheckbox
          label="Special Services"
          options={apiData.specialServices}
          selected={formData.specialServices}
          onChange={(selected) =>
            handleInputChange({
              target: { name: "specialServices", value: selected },
            })
          }
          placeholder={
            apiData.loading.specialServices
              ? "Loading special services..."
              : "Select Special Services"
          }
          loading={apiData.loading.specialServices}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <NeatFileUpload
          name="certificates"
          accept=".pdf,.jpg,.jpeg,.png"
          multiple
          files={formData.certificates || []}
          onFileChange={handleFileChange}
          label="Upload Certificates"
        />
      </div>
      {errors.availableTests && (
        <p className="error-text">{errors.availableTests}</p>
      )}
      {errors.scanServices && (
        <p className="error-text">{errors.scanServices}</p>
      )}
    </>
  );
};

export default LabRegistration;
