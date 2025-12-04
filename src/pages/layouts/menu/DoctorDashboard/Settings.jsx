import React, { useState, useEffect, useRef } from "react";
import {
  Camera, Eye, EyeOff, Edit2, Check, Save, X, User, Lock, MapPin,
  Award, MailCheck, ShieldCheck, PhoneCall
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { updateDoctor } from "../../../../context-api/authSlice";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { getDoctorById, getHospitalDropdown } from "../../../../utils/masterService";

const tabOptions = [
  { value: "basic", label: "Basic Information", icon: User },
  { value: "professional", label: "Professional Details", icon: Award },
  { value: "address", label: "Address", icon: MapPin },
  { value: "password", label: "Change Password", icon: Lock },
];

const getFormFields = (hospitals) => {
  const hospitalOptions = Array.isArray(hospitals)
    ? hospitals.map((h) => ({ value: h.name, label: h.name }))
    : [];

  return {
    basic: [
      { id: "firstName", label: "First Name", type: "text" },
      { id: "lastName", label: "Last Name", type: "text" },
      {
        id: "gender",
        label: "Gender",
        type: "select",
        options: [
          { value: "Male", label: "Male" },
          { value: "Female", label: "Female" },
          { value: "Other", label: "Other" }
        ],
      },
      { id: "dob", label: "Date of Birth", type: "date" },
      { id: "phone", label: "Phone", type: "text", verify: true },
      { id: "email", label: "Email", type: "email", verify: true },
      { id: "aadhaar", label: "Aadhaar Number", type: "text" },
    ],
    professional: [
      { id: "qualification", label: "Qualification", type: "text" },
      { id: "specialization", label: "Specialization", type: "text" },
      {
        id: "associationType",
        label: "Association Type",
        type: "select",
        options: [
          { value: "HOSPITAL", label: "Hospital" },
          { value: "CLINIC", label: "Clinic" }
        ],
      },
      {
        id: "hospitalId",
        label: "Select Hospital",
        type: "select",
        options: hospitalOptions,
        condition: (formData) => formData.associationType === "HOSPITAL",
      },
      {
        id: "clinicName",
        label: "Clinic Name",
        type: "text",
        condition: (formData) => formData.associationType === "CLINIC",
      },
      {
        id: "registrationNumber",
        label: "License/Registration Number",
        type: "text",
      },
    ],
    address: [
      { id: "district", label: "District", type: "text" },
      { id: "city", label: "City", type: "text" },
      { id: "state", label: "State", type: "text" },
      { id: "pincode", label: "Pincode", type: "text" },
    ],
    password: [
      {
        id: "currentPassword",
        label: "Current Password",
        type: "password",
        toggleVisibility: true,
      },
      {
        id: "password",
        label: "New Password",
        type: "password",
        toggleVisibility: true,
      },
      {
        id: "confirmPassword",
        label: "Confirm Password",
        type: "password",
        toggleVisibility: true,
      },
    ],
  };
};

const DoctorSettings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const doctorId = user?.doctorId || user?.id;

  const fileInputRef = useRef(null);
  const [hospitals, setHospitals] = useState([]);
  const formFields = getFormFields(hospitals);

  // States
  const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState({});
  const [profileImage, setProfileImage] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  
  // Handle image selection and convert to base64
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImage(reader.result);
      setHasUnsavedChanges(true);
    };
    reader.readAsDataURL(file);
  };
  
  // Remove selected image
  const handleRemoveImage = () => {
    setProfileImage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setHasUnsavedChanges(true);
  };

  const fetchHospitals = async () => {
    try {
      const response = await getHospitalDropdown();
      setHospitals(response.data || []);
    } catch (error) {
      toast.error("Failed to load hospitals");
    }
  };

  useEffect(() => {
    if (formData.associationType === "HOSPITAL") {
      fetchHospitals();
    }
  }, [formData.associationType]);

  // Fetch Doctor Data
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const response = await getDoctorById(doctorId);
        const doctor = response.data || response;

        const formattedDob = Array.isArray(doctor.dob)
          ? new Date(doctor.dob[0], doctor.dob[1] - 1, doctor.dob[2])
              .toISOString()
              .split("T")[0]
          : doctor.dob || "";

        // Determine association type and set the appropriate values
        const isHospital = doctor.associationType === 'HOSPITAL';
        const associationName = isHospital ? 
          (doctor.hospitalName || doctor.hospital?.name || '') : 
          (doctor.clinicName || '');
        const associationId = isHospital ? (doctor.hospitalId || doctor.hospital?.id) : null;

        const formData = {
          id: doctor.id || "",
          firstName: doctor.firstName || "",
          lastName: doctor.lastName || "",
          gender: doctor.gender || "",
          dob: formattedDob,
          phone: doctor.phone || "",
          email: doctor.email || "",
          aadhaar: doctor.aadhaar || "",
          qualification: doctor.qualification || "",
          specialization: doctor.specialization || "",
          registrationNumber: doctor.registrationNumber || "",
          district: doctor.district || "",
          city: doctor.city || "",
          state: doctor.state || "",
          pincode: doctor.pincode || "",
          associationType: doctor.associationType || "HOSPITAL",
          hospitalId: associationId || "",
          hospitalName: isHospital ? associationName : "",
          clinicName: !isHospital ? associationName : "",
          agreeDeclaration: doctor.agreeDeclaration || false
        };

        setFormData(formData);
        setIsVerified(doctor.active || false);
        if (doctor.photo) {
          setProfileImage(doctor.photo);
        }

        // If it's a hospital, ensure we have the hospital data
        if (isHospital && associationId && !hospitals.length) {
          fetchHospitals();
        }
      } catch (err) {
        console.error("Error fetching doctor data:", err);
        setError("Failed to load doctor data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctor();
  }, [doctorId]);

  // Input Change Handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedForm = new FormData();
      const dataToSave = { 
        ...formData,
        photo: profileImage || '' // Include the base64 image data
      };

      // Clean up the data based on association type
      if (dataToSave.associationType === 'HOSPITAL') {
        delete dataToSave.clinicName;
      } else {
        delete dataToSave.hospitalId;
        delete dataToSave.hospitalName;
      }

      // Add all form data to FormData
      Object.entries(dataToSave).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          updatedForm.append(key, value);
        }
      });

      await dispatch(updateDoctor({ id: doctorId, formData: updatedForm }));
      toast.success("Profile updated successfully!");

      // Reset the file input and update states
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setHasUnsavedChanges(false);
      setIsEditMode(false);
      setSaveSuccess(true);

      // Refresh the doctor data
      const response = await getDoctorById(doctorId);
      const updatedDoctor = response.data || response;
      setFormData(prev => ({
        ...prev,
        ...(updatedDoctor.hospitalName && { hospitalName: updatedDoctor.hospitalName }),
        ...(updatedDoctor.clinicName && { clinicName: updatedDoctor.clinicName }),
        hospitalId: updatedDoctor.hospitalId || ""
      }));

      // Update the profile image with the new photo
      if (updatedDoctor.photo) {
        setProfileImage(updatedDoctor.photo);
      }

      setTimeout(() => setSaveSuccess(false), 3000);

    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const renderField = ({ id, label, type, options, toggleVisibility, verify, condition }) => {
    if (condition && !condition(formData)) return null;

    // Handle hospital name display for hospital association
    if (id === 'hospitalId' && formData.associationType === 'HOSPITAL') {
      return (
        <div key={id} className="w-full space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Hospital</label>
          <div className="relative">
            <select
              name="hospitalId"
              value={formData.hospitalId || ""}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 text-sm font-medium placeholder-gray-500"
              disabled={!isEditMode}
            >
              <option value="">Select Hospital</option>
              {hospitals.map((hospital) => (
                <option key={hospital.id} value={hospital.id}>
                  {hospital.name || hospital.hospitalName}
                </option>
              ))}
            </select>
          </div>
        </div>
      );
    }

    // Handle clinic name display for clinic association
    if (id === 'clinicName' && formData.associationType === 'CLINIC') {
      return (
        <div key={id} className="w-full space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Clinic Name</label>
          <input
            type="text"
            name="clinicName"
            value={formData.clinicName || ""}
            onChange={handleInputChange}
            readOnly={!isEditMode}
            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 text-sm font-medium placeholder-gray-500"
          />
        </div>
      );
    }

    const value = formData[id] || "";
    const baseClass =
      "w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 text-sm font-medium placeholder-gray-500";

    return (
      <div key={id} className="w-full space-y-2">
        <label className="block text-sm font-semibold text-gray-700">{label}</label>

        {type === "select" ? (
          <select
            name={id}
            value={value}
            onChange={handleInputChange}
            className={baseClass}
            disabled={!isEditMode}
          >
            <option value="">Select {label}</option>
            {options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            name={id}
            value={value}
            onChange={handleInputChange}
            readOnly={!isEditMode}
            className={baseClass}
          />
        )}
      </div>
    );
  };

  // UI =====================================
  if (isLoading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="bg-gradient-to-r from-[#01B07A] to-[#1A223F] rounded-2xl p-6 flex items-center gap-6">
            <div className="relative">
              <div className="w-28 h-28 rounded-2xl overflow-hidden ring-4 ring-white shadow-lg">
                {profileImage ? (
                  <img 
                    src={profileImage} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="bg-gray-200 w-full h-full flex items-center justify-center">
                    <User size={24} className="text-gray-400" />
                  </div>
                )}
              </div>

              {isEditMode && (
                <>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-3 -right-3 w-8 h-8 bg-[#01B07A] text-white rounded-full flex items-center justify-center hover:bg-[#019966] transition-colors"
                  >
                    <Camera size={16} />
                  </button>
                  <input 
                    ref={fileInputRef} 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleImageChange}
                  />
                  {profileImage && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                      title="Remove photo"
                    >
                      ×
                    </button>
                  )}
                </>
              )}
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">
              Dr. {formData.firstName} {formData.lastName}
            </h1>
            <p className="text-white/80 text-sm">{formData.specialization}</p>
          </div>

          {!isEditMode ? (
            <button
              onClick={() => setIsEditMode(true)}
              className="px-4 py-2 bg-white/20 text-white rounded-lg"
            >
              <Edit2 size={16} className="inline mr-2" /> Edit
            </button>
          ) : (
            <div className="flex items-center gap-2 text-white">
              <span>Edit Mode</span>
              <div className="w-2 h-2 bg-[#01B07A] rounded-full animate-pulse"></div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border mt-8">
          <div className="border-b flex">
            {tabOptions.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium ${
                    activeTab === tab.value
                      ? "border-b-2 border-[#01B07A] text-[#01B07A]"
                      : "text-gray-500"
                  }`}
                >
                  <Icon size={16} /> {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {Object.entries(formFields).map(([tab, fields]) => (
              <div key={tab} className={`${activeTab === tab ? "block" : "hidden"}`}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {fields.map(renderField)}
                </div>
              </div>
            ))}

            {isEditMode && (
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setIsEditMode(false)}
                  className="px-6 py-2 border-2 border-[#01B07A] text-[#01B07A] rounded-lg"
                >
                  <X size={16} className="inline mr-2" /> Cancel
                </button>

                <button
                  onClick={handleSave}
                  disabled={!hasUnsavedChanges || isSaving}
                  className="px-6 py-2 bg-[#01B07A] text-white rounded-lg disabled:bg-gray-400"
                >
                  {isSaving ? "Saving..." : <><Save size={16} className="inline mr-2" /> Save</>}
                </button>
              </div>
            )}
          </div>
        </div>

        {saveSuccess && (
          <div className="fixed top-4 right-4 bg-[#01B07A] text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <Check size={18} /> Changes saved!
          </div>
        )}

      </div>
    </div>
  );
};

export default DoctorSettings;