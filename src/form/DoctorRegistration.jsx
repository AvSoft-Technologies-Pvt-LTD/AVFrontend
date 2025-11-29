import React from "react";

const PhotoUpload = ({ photoPreview, onPhotoChange, onPreviewClick }) => (
  <div className="relative floating-input" data-placeholder="Upload Photo *">
    <label className="block relative cursor-pointer">
      <div className="input-field flex items-center gap-2 peer">
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

const DoctorRegistration = ({
  formData,
  errors,
  handleInputChange,
  handleFileChange,
  apiData,
  photoPreview,
  onPreviewClick,
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
        {renderInput("firstName", "text", "First Name", true)}
        {renderInput("middleName", "text", "Middle Name")}
        {renderInput("lastName", "text", "Last Name", true)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderInput("phone", "text", "Phone Number", true)}
        {renderInput("email", "email", "Email", true)}
       
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         {renderInput("aadhaar", "text", "Aadhaar Number", true)}
        <div className="floating-input relative w-full" data-placeholder="Gender *">
          <select
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            disabled={apiData.loading.genders || !apiData.genders.length}
            className={`input-field peer ${errors.gender ? "input-error" : ""} ${
              apiData.loading.genders || !apiData.genders.length
                ? "bg-gray-100 cursor-not-allowed"
                : ""
            }`}
            required
          >
            <option value="">
              {apiData.loading.genders
                ? "Loading genders..."
                : !apiData.genders.length
                ? "No genders available"
                : "Select Gender"}
            </option>
            {apiData.genders.map((gender, index) => (
              <option key={`${gender}-${index}`} value={gender}>
                {gender}
              </option>
            ))}
          </select>
          {errors.gender && <p className="error-text">{errors.gender}</p>}
        </div>
        {renderInput("dob", "date", "Date of Birth", true)}
         </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className="floating-input relative w-full"
            data-placeholder="Qualification *"
          >
            <input
              type="text"
              name="roleSpecificData.qualification"
              placeholder=" "
              value={formData.roleSpecificData.qualification}
              onChange={handleInputChange}
              className={`input-field peer ${
                errors.qualification ? "input-error" : ""
              }`}
              required
            />
            {errors.qualification && (
              <p className="error-text">{errors.qualification}</p>
            )}
          </div>
          <PhotoUpload
            photoPreview={photoPreview}
            onPhotoChange={handleFileChange}
            onPreviewClick={onPreviewClick}
          />
        </div>
     
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className="floating-input relative w-full"
          data-placeholder="Registration Number *"
        >
          <input
            type="text"
            name="roleSpecificData.registrationNumber"
            placeholder=" "
            value={formData.roleSpecificData.registrationNumber}
            onChange={handleInputChange}
            className={`input-field peer ${
              errors.registrationNumber ? "input-error" : ""
            }`}
            required
          />
          {errors.registrationNumber && (
            <p className="error-text">{errors.registrationNumber}</p>
          )}
        </div>
        <div
          className="floating-input relative w-full"
          data-placeholder="Practice Type *"
        >
          <select
            name="roleSpecificData.practiceType"
            value={formData.roleSpecificData.practiceType}
            onChange={handleInputChange}
            className={`input-field peer ${
              errors.practiceType ? "input-error" : ""
            }`}
            required
            disabled={apiData.loading.practiceTypes}
          >
            <option value="">
              {apiData.loading.practiceTypes
                ? "Loading practice types..."
                : "Select Practice Type"}
            </option>
            {apiData.practiceTypes.map((practiceType, index) => (
              <option key={`${practiceType}-${index}`} value={practiceType}>
                {practiceType}
              </option>
            ))}
          </select>
          {errors.practiceType && (
            <p className="error-text">{errors.practiceType}</p>
          )}
        </div>
        <div
          className="floating-input relative w-full"
          data-placeholder="Specialization *"
        >
          <select
            name="roleSpecificData.specialization"
            value={formData.roleSpecificData.specialization}
            onChange={handleInputChange}
            disabled={
              !formData.roleSpecificData.practiceType ||
              apiData.loading.specializations
            }
            className={`input-field peer ${
              errors.specialization ? "input-error" : ""
            }`}
            required
          >
            <option value="">
              {!formData.roleSpecificData.practiceType
                ? "Select a practice type first"
                : apiData.loading.specializations
                ? "Loading specializations..."
                : "Select Specialization"}
            </option>
            {apiData.specializations.map((specialization, index) => (
              <option key={`${specialization}-${index}`} value={specialization}>
                {specialization}
              </option>
            ))}
          </select>
          {errors.specialization && (
            <p className="error-text">{errors.specialization}</p>
          )}
        </div>
      </div>
      {/* Association with Clinic/Hospital */}
      <div>
        <label className="paragraph">
          Are you associated with any clinic or hospital?
        </label>
        <div className="grid grid-cols-2 gap-4 items-center">
          {/* Left column - Radio buttons centered */}
          <div className="flex ">
            <div className="flex space-x-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="isAssociatedWithClinicHospital"
                  value="clinic"
                  checked={formData.isAssociatedWithClinicHospital === 'clinic'}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="paragraph">Clinic</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="isAssociatedWithClinicHospital"
                  value="hospital"
                  checked={formData.isAssociatedWithClinicHospital === 'hospital'}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="paragraph">Hospital</span>
              </label>
            </div>
          </div>

          {/* Right column - Conditional fields */}
          {formData.isAssociatedWithClinicHospital === 'clinic' && (
            <div className="floating-input relative w-full" data-placeholder="Clinic Name *">
              <input
                type="text"
                name="clinicName"
                placeholder=" "
                value={formData.clinicName}
                onChange={handleInputChange}
                className={`input-field peer ${errors.clinicName ? "input-error" : ""}`}
                required
              />
              {errors.clinicName && (
                <p className="error-text">{errors.clinicName}</p>
              )}
            </div>
          )}

          {formData.isAssociatedWithClinicHospital === 'hospital' && (
            <div className="floating-input relative w-full" data-placeholder="Hospital *">
              <select
                name="associatedHospital"
                value={formData.associatedHospital}
                onChange={handleInputChange}
                disabled={apiData.loading.hospitals}
                className={`input-field peer ${errors.associatedHospital ? "input-error" : ""} ${
                  apiData.loading.hospitals ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                required
              >
                <option value="">
                  {apiData.loading.hospitals ? "Loading hospitals..." : "Select Hospital"}
                </option>
                {apiData.hospitals.map((hospital, index) => (
                  <option key={`${hospital}-${index}`} value={hospital}>
                    {hospital}
                  </option>
                ))}
              </select>
              {errors.associatedHospital && (
                <p className="error-text">{errors.associatedHospital}</p>
              )}
            </div>
          )}
        </div>
        {errors.associationType && (
          <p className="error-text">{errors.associationType}</p>
        )}
      </div>
    </>
  );
};

export default DoctorRegistration;
