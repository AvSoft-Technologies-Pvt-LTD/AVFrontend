import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
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

const DoctorSettings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const doctorId = user?.doctorId || user?.id;
  const fileInputRef = useRef(null);
  const [hospitals, setHospitals] = useState([]);
  const formFields = getFormFields(hospitals);

  const [hospitals, setHospitals] = useState([]);
  const [isLoadingHospitals, setIsLoadingHospitals] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState({
    agreeDeclaration: false,  // Initialize agreeDeclaration with default value
    associationType: 'CLINIC'  // Default to CLINIC
  });
  const [avatar, setAvatar] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  // Memoized form fields
  const formFields = useMemo(() => {
    // Map hospitals to options with proper error handling
    const hospitalOptions = Array.isArray(hospitals) 
      ? hospitals
          .filter(h => h && (h.id || h._id) && h.name) // Filter out invalid entries
          .map(h => ({
            value: h.id || h._id,  // Handle both id and _id
            label: h.name,  // Use hospital name as label
            ...h  // Include all hospital data in the option
          }))
      : [];
    
    console.log('Hospital Options:', hospitalOptions); // Debug log

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
          ]
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
          ]
        },
        {
          id: "hospitalId",
          label: "Select Hospital",
          type: "select",
          options: hospitalOptions,
          placeholder: "Select a hospital...",
          condition: (formData) => formData.associationType === "HOSPITAL",
          noOptionsMessage: () => isLoadingHospitals ? "Loading hospitals..." : "No hospitals available"
        },
        {
          id: "clinicName",
          label: "Clinic Name",
          type: "text",
          condition: (formData) => formData.associationType === "CLINIC"
        },
        {
          id: "registrationNumber",
          label: "License/Registration Number",
          type: "text"
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
          toggleVisibility: true
        },
        {
          id: "password",
          label: "New Password",
          type: "password",
          toggleVisibility: true
        },
        {
          id: "confirmPassword",
          label: "Confirm Password",
          type: "password",
          toggleVisibility: true
        },
      ],
    };
  }, [hospitals, isLoadingHospitals]);

  // Fetch hospitals
// Fetch hospitals
const fetchHospitals = useCallback(async () => {
  try {
    setIsLoadingHospitals(true);
    const response = await getHospitalDropdown();
    console.log('Hospitals API response:', response);
    
    // Handle both array and object responses
    const hospitalsData = Array.isArray(response) ? response : (response?.data || []);
    
    // Process hospital data
    const options = hospitalsData
      .filter(h => h && (h.id || h._id) && (h.name || h.hospitalName))
      .map(h => ({
        id: h.id || h._id,
        name: h.name || h.hospitalName,
        label: h.name || h.hospitalName,
        value: h.id || h._id,
        ...h  // Include all hospital data
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    setHospitals(options);
    return options;
  } catch (error) {
    console.error('Error fetching hospitals:', error);
    toast.error('Failed to load hospitals');
    setHospitals([]);
    return [];
  } finally {
    setIsLoadingHospitals(false);
  }
}, []);

  // Load doctor info
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        if (!doctorId) throw new Error("Doctor ID not found.");
        const response = await getDoctorById(doctorId);
        const doctor = response.data || response;
        
        console.log('Fetched doctor data:', doctor); // Debug log
        
        // If doctor has hospital data, fetch hospitals first
        if (doctor.hospitalId || doctor.associationType === 'HOSPITAL') {
          const hospitalsData = await fetchHospitals();
          // Set the selected hospital if it exists in the fetched hospitals
          if (doctor.hospitalId && hospitalsData) {
            const selectedHospital = hospitalsData.find(h => 
              (h.id === doctor.hospitalId) || (h._id === doctor.hospitalId)
            );
            if (selectedHospital) {
              doctor.hospitalId = selectedHospital.id || selectedHospital._id;
            }
          }
        }
        if (doctor.photo) {
          try {
            if (typeof doctor.photo === 'string' && doctor.photo.startsWith('data:image')) {
              setAvatar(doctor.photo);
            }
          } catch (err) {
            console.warn("Error processing doctor photo:", err);
          }
        }
        const formattedDob = Array.isArray(doctor.dob)
          ? new Date(doctor.dob[0], doctor.dob[1] - 1, doctor.dob[2])
              .toISOString()
              .split("T")[0]
          : doctor.dob || "";
          
        // Ensure associationType is valid (HOSPITAL or CLINIC)
        const validAssociationType = doctor.associationType === 'HOSPITAL' ? 'HOSPITAL' : 'CLINIC';
        
        setFormData(prev => ({
          ...prev, // Keep existing form data
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
          associationType: validAssociationType,
          hospitalId: validAssociationType === 'HOSPITAL' ? (doctor.hospitalId || "") : "",
          clinicName: validAssociationType === 'CLINIC' ? (doctor.clinicName || "") : "",
          currentPassword: "",
          password: "",
          confirmPassword: "",
        }));
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

  // Fetch hospitals when association type changes to HOSPITAL
  useEffect(() => {
    const loadHospitals = async () => {
      if (formData.associationType === "HOSPITAL") {
        await fetchHospitals();
      }
      // Don't clear hospitals when type is not HOSPITAL to keep the selected value
    };
    
    // Only load hospitals if in edit mode
    if (isEditMode) {
      loadHospitals();
    }
  }, [formData.associationType, isEditMode]);

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      if (name === 'associationType') {
        newData.hospitalId = '';
        newData.experience = '';
      }
      return newData;
    });
    setHasUnsavedChanges(true);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
        setHasUnsavedChanges(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSave = async () => {
    if (!doctorId) {
      toast.error("Doctor ID missing. Please log in again.");
      return;
    }

    // Validate associationType
    if (!formData.associationType || !['HOSPITAL', 'CLINIC'].includes(formData.associationType)) {
      toast.error("Please select a valid association type (Hospital or Clinic)");
      return;
    }

    // Validate hospital selection if association type is HOSPITAL
    if (formData.associationType === "HOSPITAL" && !formData.hospitalId) {
      toast.error("Please select a hospital");
      return;
    }

    // Validate clinic name if association type is CLINIC
    if (formData.associationType === "CLINIC" && !formData.clinicName?.trim()) {
      toast.error("Please enter clinic name");
      return;
    }

    setIsSaving(true);
    try {
      const updatedForm = new FormData();
      
      // Prepare form data to send
      const formDataToSend = {
        ...formData,
        agreeDeclaration: Boolean(formData.agreeDeclaration),
        // Ensure associationType is always set and valid
        associationType: formData.associationType || 'CLINIC'
      };
      
      // Only include relevant fields based on association type
      Object.entries(formDataToSend).forEach(([key, value]) => {
        // Skip these fields
        if (["currentPassword", "confirmPassword", "photo"].includes(key)) return;
        
        // Skip hospitalId if not HOSPITAL type
        if (key === "hospitalId" && formData.associationType !== "HOSPITAL") return;
        
        // Skip clinicName if not CLINIC type
        if (key === "clinicName" && formData.associationType !== "CLINIC") return;
        
        // Only append if value is not null or undefined
        if (value !== null && value !== undefined) {
          updatedForm.append(key, value);
        }
      });
      
      // Add photo if selected
      if (fileInputRef.current?.files[0]) {
        updatedForm.append("photo", fileInputRef.current.files[0]);
      }
      
      // Handle password change if needed
      if (formData.password) {
        if (formData.password !== formData.confirmPassword) {
          toast.error("Passwords do not match.");
          setIsSaving(false);
          return;
        }
        updatedForm.append("password", formData.password);
      }
      
      // Log the data being sent for debugging
      console.log('Submitting form data:', Object.fromEntries(updatedForm.entries()));
      
      // Dispatch the update action
      const result = await dispatch(updateDoctor({ id: doctorId, formData: updatedForm }));
      
      if (updateDoctor.fulfilled.match(result)) {
        toast.success("Profile updated successfully!");
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        setIsEditMode(false);
        setHasUnsavedChanges(false);
      } else {
        throw new Error(result.error?.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Update error:", err);
      toast.error(err.message || "Failed to update doctor profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setHasUnsavedChanges(false);
  };

  const handleVerifyEmail = () => navigate("/verify-otp");

  const renderField = ({ id, label, type, options, toggleVisibility, verify, condition }) => {
    if (condition && !condition(formData)) return null;
    const value = formData[id] || "";
    const baseClass =
      "w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 text-sm font-medium placeholder-gray-500 transition-all duration-200 focus:bg-white focus:border-[#01B07A] focus:ring-4 focus:ring-[#01B07A]/20 disabled:bg-gray-100 disabled:cursor-not-allowed";
    
    // Debug log for hospital dropdown
    if (id === 'hospitalId') {
      console.log('Rendering hospital dropdown with:', { 
        value, 
        options, 
        isLoadingHospitals,
        associationType: formData.associationType 
      });
    }
    return (
      <div key={id} className="w-full space-y-2">
        <label className="block text-sm font-semibold text-gray-700">{label}</label>
        {type === "checkbox" ? (
          <div className="flex items-center">
            <input
              type="checkbox"
              id={id}
              name={id}
              checked={!!value}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                [id]: e.target.checked
              }))}
              className={baseClass}
              disabled={!isEditMode}
            />
            <label htmlFor={id} className="ml-2 block text-sm text-gray-700">
              {label}
            </label>
          </div>
        ) : type === "select" ? (
          <select
            name={id}
            value={value}
            onChange={handleInputChange}
            className={baseClass}
            disabled={!isEditMode || isLoadingHospitals}
          >
            <option value="">{options?.placeholder || `Select ${label}`}</option>
            {isLoadingHospitals && formData.associationType === "HOSPITAL" ? (
              <option value="" disabled>Loading hospitals...</option>
            ) : (
              Array.isArray(options) && options.length > 0 ? (
                options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  {options?.noOptionsMessage ? options.noOptionsMessage() : 'No options available'}
                </option>
              )
            )}
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

  // Render
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-center">
          <div className="w-24 h-24 bg-[#01B07A] rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Loading Doctor Profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="bg-gradient-to-r from-[#01B07A] to-[#1A223F] rounded-2xl shadow-sm mb-8 p-6 flex items-center gap-6">
          <div className="relative">
            <div className="w-28 h-28 rounded-2xl overflow-hidden ring-4 ring-white shadow-lg">
              {avatar ? (
                <img src={avatar} alt="Doctor" className="w-full h-full object-cover" />
              ) : (
                <div className="bg-gray-200 w-full h-full flex items-center justify-center">
                  <Camera size={24} className="text-gray-400" />
                </div>
              )}
            </div>
            {isEditMode && (
              <>
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="absolute -bottom-3 -right-3 w-8 h-8 bg-[#01B07A] text-white rounded-full flex items-center justify-center"
                >
                  <Camera size={16} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
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
