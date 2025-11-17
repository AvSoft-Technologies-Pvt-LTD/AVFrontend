import React, { useState, useEffect, useRef } from "react";
import {
  Camera, Eye, EyeOff, Edit2, Check, Save, X, User, Lock, MapPin,
  Award, MailCheck, ShieldCheck, PhoneCall
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { updateDoctor } from "../../../../context-api/authSlice";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { getDoctorById, getDoctorPhoto } from "../../../../utils/masterService";

const tabOptions = [
  { value: "basic", label: "Basic Information", icon: User },
  { value: "professional", label: "Professional Details", icon: Award },
  { value: "address", label: "Address", icon: MapPin },
  { value: "password", label: "Change Password", icon: Lock },
];

const formFields = {
  basic: [
    { id: "firstName", label: "First Name", type: "text" },
    { id: "lastName", label: "Last Name", type: "text" },
    { id: "gender", label: "Gender", type: "select", options: ["Male", "Female", "Other"] },
    { id: "dob", label: "Date of Birth", type: "date" },
    { id: "phone", label: "Phone", type: "text", verify: true },
    { id: "email", label: "Email", type: "email", verify: true },
    { id: "aadhaar", label: "Aadhaar Number", type: "text" },
  ],
  professional: [
    { id: "qualification", label: "Qualification", type: "text" },
    { id: "specialization", label: "Specialization", type: "text" },
    { id: "practiceType", label: "Practice Type", type: "text" },
    { id: "experience", label: "Experience (Years)", type: "text" },
    { id: "registrationNumber", label: "License/Registration Number", type: "text" },
  ],
  address: [
    { id: "district", label: "District", type: "text" },
    { id: "city", label: "City", type: "text" },
    { id: "state", label: "State", type: "text" },
    { id: "pincode", label: "Pincode", type: "text" },
  ],
  password: [
    { id: "currentPassword", label: "Current Password", type: "password", toggleVisibility: true },
    { id: "password", label: "New Password", type: "password", toggleVisibility: true },
    { id: "confirmPassword", label: "Confirm Password", type: "password", toggleVisibility: true },
  ],
};

const DoctorSettings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const doctorId = user?.doctorId || user?.id;

  const fileInputRef = useRef(null);

  // Hooks (always run)
  const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState({});
  const [avatar, setAvatar] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  // Load doctor info
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        if (!doctorId) throw new Error("Doctor ID not found.");

        const response = await getDoctorById(doctorId);
        const doctor = response.data || response;

        if (doctor.photo) {
          try {
            const photoRes = await getDoctorPhoto(doctor.photo);
            const blob = photoRes.data;
            setAvatar(URL.createObjectURL(blob));
          } catch {
            console.warn("Doctor photo not found.");
          }
        }

        const formattedDob = Array.isArray(doctor.dob)
          ? new Date(doctor.dob[0], doctor.dob[1] - 1, doctor.dob[2])
              .toISOString()
              .split("T")[0]
          : doctor.dob || "";

        setFormData({
          id: doctor.id || "",
          firstName: doctor.firstName || "",
          middleName: doctor.middleName || "",
          lastName: doctor.lastName || "",
          gender: doctor.gender || "",
          dob: formattedDob,
          phone: doctor.phone || "",
          email: doctor.email || "",
          aadhaar: doctor.aadhaar || "",
          qualification: doctor.qualification || "",
          specialization: doctor.specialization || "",
          registrationNumber: doctor.registrationNumber || "",
          practiceTypeId: doctor.practiceTypeId || "",
          specializationId: doctor.specializationId || "",
          district: doctor.district || "",
          city: doctor.city || "",
          state: doctor.state || "",
          pincode: doctor.pincode || "",
          currentPassword: "",
          password: "",
          confirmPassword: "",
        });

        setIsVerified(doctor.active || false);
      } catch (err) {
        setError(err.message || "Failed to load doctor data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDoctor();
  }, [doctorId]);

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setHasUnsavedChanges(true);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatar(reader.result);
      reader.readAsDataURL(file);
      setHasUnsavedChanges(true);
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

    setIsSaving(true);
    try {
      const updatedForm = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (!["currentPassword", "confirmPassword"].includes(key)) {
          updatedForm.append(key, value);
        }
      });

      if (fileInputRef.current?.files[0]) {
        updatedForm.append("photo", fileInputRef.current.files[0]);
      }

      if (formData.password) {
        if (formData.password !== formData.confirmPassword) {
          toast.error("Passwords do not match.");
          setIsSaving(false);
          return;
        }
        updatedForm.append("password", formData.password);
      }
console.log("Calling API!");
      const data = dispatch(updateDoctor({ id: doctorId, formData: formData }));
      console.log("Called API!",data);
      toast.success("Profile updated successfully!");
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      setIsEditMode(false);
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update doctor profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setHasUnsavedChanges(false);
  };

  const handleVerifyEmail = () => navigate("/verify-otp");

  const renderField = ({ id, label, type, options, toggleVisibility, verify }) => {
    const value = formData[id] || "";
    const baseClass =
      "w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 text-sm font-medium placeholder-gray-500 transition-all duration-200 focus:bg-white focus:border-[#01B07A] focus:ring-4 focus:ring-[#01B07A]/20 disabled:bg-gray-100 disabled:cursor-not-allowed";

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
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : type === "password" ? (
          <div className="relative">
            <input
              type={showPassword[id] ? "text" : "password"}
              name={id}
              value={value}
              onChange={handleInputChange}
              className={`${baseClass} pr-10`}
              readOnly={!isEditMode}
            />
            {toggleVisibility && isEditMode && (
              <button
                type="button"
                onClick={() => togglePasswordVisibility(id)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword[id] ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            )}
          </div>
        ) : (
          <div className="relative">
            <input
              type={type}
              name={id}
              value={value}
              onChange={handleInputChange}
              className={baseClass}
              readOnly={!isEditMode}
            />
            {verify && isEditMode && (
              <button
                type="button"
                onClick={handleVerifyEmail}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#01B07A]"
              >
                {id === "email" ? <MailCheck size={18} /> : <PhoneCall size={18} />}
              </button>
            )}
            {id === "email" && isVerified && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#01B07A]">
                <ShieldCheck size={18} />
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // ✅ Hooks always run above, conditional rendering below only returns UI
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
            <h1 className="text-2xl font-bold text-white mb-2">
              Dr. {formData.firstName} {formData.lastName}
            </h1>
            <p className="text-white/90 text-sm">
              {formData.specialization || "General Practitioner"}
            </p>
            <p className="text-white/80 text-sm mt-1">{formData.email}</p>
          </div>

          {!isEditMode ? (
            <button
              onClick={() => setIsEditMode(true)}
              className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition"
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
        <div className="bg-white rounded-2xl shadow-sm border">
          <div className="border-b flex overflow-x-auto scrollbar-hide">
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
                  <Icon size={16} />
                  {tab.label}
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
                  onClick={handleCancel}
                  className="px-6 py-2 border-2 border-[#01B07A] text-[#01B07A] rounded-lg hover:bg-[#01B07A] hover:text-white transition"
                >
                  <X size={16} className="inline mr-2" /> Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving || !hasUnsavedChanges}
                  className="px-6 py-2 bg-[#01B07A] text-white rounded-lg hover:bg-[#01B07A]/90 transition disabled:bg-gray-400"
                >
                  {isSaving ? "Saving..." : (<><Save size={16} className="inline mr-2" /> Save</>)}
                </button>
              </div>
            )}
          </div>
        </div>

        {saveSuccess && (
          <div className="fixed top-4 right-4 bg-[#01B07A] text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
            <Check size={18} /> Changes saved successfully!
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorSettings;
