import React from "react";
import { FileText, Camera } from "lucide-react";

const NeatFileUpload = ({ name, accept, multiple = false, files, onFileChange, label, icon: Icon = FileText }) => {
  return (
    <div className="relative floating-input" data-placeholder={label}>
      <label className="block cursor-pointer">
        <div className="input-field flex items-center gap-2 peer">
          <Icon size={16} />
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
  allowOther = false,
  otherValue = "",
  onOtherChange = () => {},
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
            {allowOther && (
              <div className="border-t border-gray-200 p-3">
                <label className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    checked={selected.includes("Other")}
                    onChange={(e) =>
                      handleCheckboxChange("Other", e.target.checked)
                    }
                    className="mr-3 rounded border-gray-300 text-[var(--accent-color)] focus:ring-[var(--accent-color)]"
                  />
                  <span className="text-sm text-gray-700">Other</span>
                </label>
                {selected.includes("Other") && (
                  <input
                    type="text"
                    placeholder="Specify other..."
                    value={otherValue}
                    onChange={(e) => onOtherChange(e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-[var(--accent-color)]"
                  />
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const HospitalRegistration = ({
  formData,
  setFormData,
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
        {renderInput("hospitalName", "text", "Hospital Name", true)}
        {renderInput("headCeoName", "text", "Head/CEO Name", true)}
        {renderInput("registrationNumber", "text", "Registration Number", true)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {renderInput("phone", "text", "Phone Number", true)}
        {renderInput("email", "email", "Email", true)}
        {renderInput("gstNumber", "text", "GST Number", true)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CompactDropdownCheckbox
          label="Hospital Type"
          required
          placeholder={
            apiData.loading.hospitalTypes
              ? "Loading hospital types..."
              : "Select Hospital Type"
          }
          options={apiData.hospitalTypes}
          selected={formData.hospitalType}
          onChange={(selected) =>
            setFormData((prev) => ({ ...prev, hospitalType: selected }))
          }
          allowOther
          otherValue={formData.otherHospitalType}
          onOtherChange={(value) =>
            setFormData((prev) => ({ ...prev, otherHospitalType: value }))
          }
          loading={apiData.loading.hospitalTypes}
        />
        <PhotoUpload
          photoPreview={formData.photoPreview}
          onPhotoChange={handleFileChange}
          onPreviewClick={() => {}}
        />
        <NeatFileUpload
          name="nabhCertificate"
          accept=".pdf,.jpg,.jpeg,.png"
          files={formData.nabhCertificate || []}
          onFileChange={handleFileChange}
          label="NABH Certificate"
          icon={FileText}
        />
      </div>
      {errors.hospitalType && (
        <p className="error-text">{errors.hospitalType}</p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            In-House Lab *
          </label>
          <div className="flex items-center space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="inHouseLab"
                value="yes"
                checked={formData.inHouseLab === "yes"}
                onChange={handleInputChange}
                className="form-radio text-[var(--accent-color)]"
              />
              <span className="ml-2">Yes</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="inHouseLab"
                value="no"
                checked={formData.inHouseLab === "no"}
                onChange={handleInputChange}
                className="form-radio text-[var(--accent-color)]"
              />
              <span className="ml-2">No</span>
            </label>
          </div>
          {formData.inHouseLab === "yes" && (
            <div className="mt-2">
              {renderInput("labLicenseNo", "text", "Lab License Number", true)}
            </div>
          )}
          {errors.inHouseLab && (
            <p className="error-text">{errors.inHouseLab}</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            In-House Pharmacy *
          </label>
          <div className="flex items-center space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="inHousePharmacy"
                value="yes"
                checked={formData.inHousePharmacy === "yes"}
                onChange={handleInputChange}
                className="form-radio text-[var(--accent-color)]"
              />
              <span className="ml-2">Yes</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="inHousePharmacy"
                value="no"
                checked={formData.inHousePharmacy === "no"}
                onChange={handleInputChange}
                className="form-radio text-[var(--accent-color)]"
              />
              <span className="ml-2">No</span>
            </label>
          </div>
          {formData.inHousePharmacy === "yes" && (
            <div className="mt-2">
              {renderInput(
                "pharmacyLicenseNo",
                "text",
                "Pharmacy License Number",
                true
              )}
            </div>
          )}
          {errors.inHousePharmacy && (
            <p className="error-text">{errors.inHousePharmacy}</p>
          )}
        </div>
      </div>
    </>
  );
};

export default HospitalRegistration;
