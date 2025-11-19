import React, { useState, useEffect, useRef } from "react";
import {
  Camera,
  Eye,
  EyeOff,
  Edit2,
  Check,
  Save,
  X,
  User,
  Lock,
  ShieldCheck,
  MailCheck,
  PhoneCall,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { updatePatient } from "../../../../context-api/authSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getPatientById, getPatientPhoto } from "../../../../utils/masterService";

const formFields = {
  personal: [
    { id: "firstName", label: "First Name", type: "text", readOnly: true },
    { id: "middleName", label: "Middle Name", type: "text" },
    { id: "lastName", label: "Last Name", type: "text", readOnly: true },
    { id: "aadhaar", label: "Aadhaar Number", type: "text", readOnly: true },
    { id: "dob", label: "Date of Birth", type: "date" },
    { id: "gender", label: "Gender", type: "text", readOnly: true },
    { id: "email", label: "Email", type: "email", verify: true },
    { id: "phone", label: "Phone Number", type: "tel", verified: true, verify: true },
    { id: "alternatePhone", label: "Alternate Phone Number", type: "tel" },
    { id: "occupation", label: "Occupation", type: "text", readOnly: true },
    { id: "permanentAddress", label: "Permanent Address", type: "textarea", readOnly: true },
    { id: "temporaryAddress", label: "Temporary Address", type: "textarea" },
  ],
  password: [
    { id: "currentPassword", label: "Current Password", type: "password", toggleVisibility: true },
    { id: "newPassword", label: "New Password", type: "password", toggleVisibility: true },
    { id: "confirmPassword", label: "Confirm Password", type: "password", toggleVisibility: true },
  ],
};

const Settings = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const patientId = user?.patientId || user?.id;
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [profileImage, setProfileImage] = useState("");
  const [passwordVisibility, setPasswordVisibility] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [isVerified, setIsVerified] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);

  useEffect(() => {
    const loadPatientData = async () => {
      if (!patientId) return;
      try {
        const response = await getPatientById(patientId);
        const patient = response.data;
        if (patient.photo) {
          try {
            const photoRes = await getPatientPhoto(patient.photo);
            const blob = photoRes.data;
            const imageUrl = URL.createObjectURL(blob);
            setProfileImage(imageUrl);
          } catch (e) {
            console.warn("Failed to load patient photo");
          }
        }
        const formattedDob = Array.isArray(patient.dob)
          ? new Date(patient.dob[0], patient.dob[1] - 1, patient.dob[2]).toISOString().split("T")[0]
          : "";
        const permanentAddress = `${patient.pinCode || ""}, ${patient.city || ""}, ${patient.district || ""
          }, ${patient.state || ""}`.trim();
        setFormData({
          ...patient,
          dob: formattedDob,
          permanentAddress,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } catch (err) {
        console.error("Failed to load patient profile:", err);
      }
    };
    loadPatientData();
  }, [patientId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setHasUnsavedChanges(true);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setProfileImage(reader.result);
    reader.readAsDataURL(file);
    setHasUnsavedChanges(true);
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const updatedFormData = new FormData();
      updatedFormData.append("firstName", formData.firstName || "");
      updatedFormData.append("middleName", formData.middleName || "");
      updatedFormData.append("lastName", formData.lastName || "");
      updatedFormData.append("phone", formData.phone || "");
      updatedFormData.append("email", formData.email || "");
      updatedFormData.append("genderId", formData.genderId || "");
      updatedFormData.append("currentPassword", formData.currentPassword || "");
      updatedFormData.append("Password", formData.newPassword || "");
      updatedFormData.append("confirmPassword", formData.confirmPassword || "");
      updatedFormData.append("aadhaar", formData.aadhaar || "");
      updatedFormData.append("dob", formData.dob || "");
      updatedFormData.append("occupation", formData.occupation || "");
      updatedFormData.append("pinCode", formData.pinCode || "");
      updatedFormData.append("city", formData.city || "");
      updatedFormData.append("district", formData.district || "");
      updatedFormData.append("state", formData.state || "");
      if (fileInputRef.current?.files?.[0]) {
        updatedFormData.append("photo", fileInputRef.current.files[0]);
      }
      await dispatch(updatePatient({ id: patientId, formData: updatedFormData })).unwrap();
      toast.success("Patient updated successfully!");
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
      setIsEditMode(false);
      setHasUnsavedChanges(false);
      const response = await getPatientById(patientId);
      const patient = response.data;
      if (patient.photo) {
        try {
          const photoRes = await getPatientPhoto(patient.photo);
          const blob = photoRes.data;
          const imageUrl = URL.createObjectURL(blob);
          setProfileImage(imageUrl);
        } catch (e) {
          console.warn("Failed to load patient photo");
        }
      }
      const formattedDob = Array.isArray(patient.dob)
        ? new Date(patient.dob[0], patient.dob[1] - 1, patient.dob[2]).toISOString().split("T")[0]
        : "";
      const permanentAddress = `${patient.pinCode || ""}, ${patient.city || ""}, ${patient.district || ""
        }, ${patient.state || ""}`.trim();
      setFormData({
        ...patient,
        dob: formattedDob,
        permanentAddress,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Failed to save patient:", error);
      toast.error(error.message || "Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setHasUnsavedChanges(false);
  };

  const handleVerifyEmail = () => {
    navigate("/verification", {
      state: {
        userType: "patient",       // Because user is patient
        phone: formData.phone,     // Send phone number
        email: formData.email,     // Send email
        registrationData: formData // You can send full user data
      }
    });
  };

  const renderField = ({ id, label, type, readOnly, options, toggleVisibility, verify, verified }) => {
    const value = formData[id] || "";
    const baseInputClasses = `
      w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl
      text-gray-900 text-sm font-medium placeholder-gray-500
      transition-all duration-200 ease-in-out
      focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50
      disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60
      ${readOnly || !isEditMode ? "bg-gray-50 cursor-not-allowed" : "hover:border-gray-300"}
    `;
    return (
      <div key={id} className="w-full space-y-2">
        <label className="block text-sm font-semibold text-gray-700">{label}</label>
        {type === "textarea" ? (
          <textarea
            name={id}
            value={value}
            onChange={handleInputChange}
            className={`${baseInputClasses} min-h-[100px] resize-none`}
            rows={4}
            readOnly={readOnly || !isEditMode}
            placeholder={isEditMode ? `Enter your ${label.toLowerCase()}` : ""}
          />
        ) : type === "select" ? (
          <select
            name={id}
            value={value}
            onChange={handleInputChange}
            className={baseInputClasses}
            disabled={readOnly || !isEditMode}
          >
            <option value="">Select {label}</option>
            {(options || []).map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : type === "password" ? (
          isEditMode ? (
            <div className="relative">
              <input
                type={passwordVisibility[id] ? "text" : "password"}
                name={id}
                value={value}
                onChange={handleInputChange}
                className={`${baseInputClasses} pr-12`}
                autoComplete="new-password"
                placeholder={`Enter your ${label.toLowerCase()}`}
              />
              {toggleVisibility && (
                <button
                  type="button"
                  onClick={() => setPasswordVisibility((prev) => ({ ...prev, [id]: !prev[id] }))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[var(--accent-color)] transition-colors duration-200 focus:outline-none focus:text-[var(--accent-color)]"
                >
                  {passwordVisibility[id] ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              )}
            </div>
          ) : null
        ) : (
          <div className="relative">
            <input
              type={type}
              name={id}
              value={value}
              onChange={handleInputChange}
              className={baseInputClasses}
              readOnly={readOnly || !isEditMode}
              placeholder={isEditMode ? `Enter your ${label.toLowerCase()}` : ""}
            />
            {verify && isEditMode && (
              <button
                type="button"
                onClick={() =>
                  navigate("/verification", {
                    state: {
                      userType: "patient",
                      phone: formData.phone,
                      email: formData.email,
                      registrationData: formData
                    },
                  })
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--accent-color)] hover:text-[var(--accent-color)] transition-colors duration-200 focus:outline-none"
                title={`Verify ${id}`}
              >
                {id === "email" ? <MailCheck size={18} /> : <PhoneCall size={18} />}
              </button>
            )}
            {id === "email" && isVerified && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--accent-color)]">
                <ShieldCheck size={18} />
              </div>
            )}
            {id === "phone" && isPhoneVerified && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--accent-color)]">
                <ShieldCheck size={18} />
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const getTabIcon = (tab) => {
    switch (tab) {
      case "personal":
        return <User size={20} />;
      case "password":
        return <Lock size={20} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-50">
      <div className="p-2 sm:p-6 max-w-full mx-auto">
        <div className="relative bg-gradient-to-br from-[var(--primary-color)] to-[var(--accent-color)] border-b rounded-xl text-white">
          <div className="px-4 sm:px-6 lg:px-8 pt-8 pb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="w-full sm:w-auto text-center sm:text-left">
                <h1 className="text-xl sm:text-3xl font-bold">Profile Settings</h1>
                <p className="text-slate-300 m-2">Manage your account information and preferences</p>
              </div>
            </div>
          </div>
          {/* Top Right Corner Edit Button */}
          <div className="absolute top-4 right-4 z-10">
            {!isEditMode ? (
              <button
                onClick={() => setIsEditMode(true)}
                className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-white/30"
              >
                <Edit2 size={16} />
                <span className="hidden sm:inline">Edit</span>
                <span className="sm:hidden">Edit</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-2 rounded-lg">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Edit Mode</span>
              </div>
            )}
          </div>
        </div>
        <div className="relative -mt-16 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-2xl overflow-hidden bg-white shadow-xl ring-4 ring-white">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <User size={32} className="text-gray-400" />
                  </div>
                )}
              </div>
              {isEditMode && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 w-10 h-10 bg-[var(--accent-color)] hover:bg-[var(--accent-color)] text-white rounded-xl shadow-lg transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 flex items-center justify-center"
                >
                  <Camera size={18} />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </button>
              )}
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {formData.firstName} {formData.lastName}
            </h2>
            <div className="flex items-center justify-center gap-2 mt-2">
              <p className="text-gray-600">{formData.email}</p>
              {isVerified && <ShieldCheck size={16} className="text-[var(--accent-color)]" />}
            </div>
          </div>
        </div>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="inline-flex bg-white rounded-2xl p-1 shadow-lg">
              {["personal", "password"].map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`inline-flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${isActive
                        ? "bg-[var(--primary-color)] text-white shadow-lg"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    disabled={!isEditMode && tab === "password"}
                  >
                    {getTabIcon(tab)}
                    <span className="capitalize">{tab}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="px-4 sm:px-6 lg:px-8 pb-8">
          <form onSubmit={handleSaveChanges}>
            {["personal", "password"].map((tab) => (
              <div
                key={tab}
                className={`transition-all duration-300 ${activeTab === tab ? "opacity-100 block" : "opacity-0 hidden"
                  }`}
              >
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-3">
                      {getTabIcon(tab)}
                      <span>{tab.charAt(0).toUpperCase() + tab.slice(1)} Information</span>
                      {isEditMode && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          Editing
                        </span>
                      )}
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {formFields[tab]
                        .filter((field) => !(field.type === "password" && !isEditMode))
                        .map(renderField)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {isEditMode && (
              <div className="px-4 sm:px-6 lg:px-8 pb-8">
                <div className="flex justify-center gap-4">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="flex items-center delete-btn mt-4 gap-1justify-center"
                  >
                    <X size={18} />
                    <span>Cancel</span>
                  </button>
                  <button
                    type="submit"
                    disabled={!hasUnsavedChanges || isSaving}
                    className="flex item-center justify-center view-btn gap-1 mt-4"
                  >
                    <Save size={18} />
                    <span>{isSaving ? "Saving..." : "Save Changes"}</span>
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
      {isEditMode && <div className="h-24 lg:hidden"></div>}
    </div>
  );
};

export default Settings;
