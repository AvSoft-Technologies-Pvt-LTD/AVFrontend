import React, { useState, useEffect, useRef } from "react";
import { Camera, Eye, EyeOff, Edit2, Check, Save, X, User, Lock, ShieldCheck, MailCheck, PhoneCall } from "lucide-react";
import { useSelector } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const formFields = {
  personal: [
    { id: "firstName", label: "First Name", type: "text", readOnly: true },
    { id: "middleName", label: "Middle Name", type: "text" },
    { id: "lastName", label: "Last Name", type: "text", readOnly: true },
    { id: "aadhaar", label: "Aadhaar Number", type: "text", readOnly: true },
    { id: "dob", label: "Date of Birth", type: "date" },
    { id: "gender", label: "Gender", type: "text", readOnly: true },
    { id: "email", label: "Email", type: "email", verify: true },
    { id: "phone", label: "Phone Number", type: "tel", verified: true },
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
  const user = useSelector((state) => state.auth.user);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [profileImage, setProfileImage] = useState("");
  const [passwordVisibility, setPasswordVisibility] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("personal");
  const [isVerified, setIsVerified] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true);
        const latestUser = await fetchUpdatedUserData(user.email);
        if (latestUser) {
          const { pincode, city, district, state, ...rest } = latestUser;
          const permanentAddress = `${pincode || ''}, ${city || ''}, ${district || ''}, ${state || ''}`.replace(/,\s*,/g, ',').replace(/^,|,$/g, '');
          setFormData({
            ...rest,
            permanentAddress,
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
          setProfileImage(latestUser.photo || "");
          setIsVerified(latestUser.isVerified || false);
          setIsPhoneVerified(latestUser.isPhoneVerified || true);
        }
      } catch (err) {
        setError("Failed to fetch profile data.");
      } finally {
        setIsLoading(false);
      }
    };
    if (user?.email) loadUserData();
  }, [user?.email]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setHasUnsavedChanges(true);
    if (saveSuccess) setSaveSuccess(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setProfileImage(base64String);
        setHasUnsavedChanges(true);
        if (saveSuccess) setSaveSuccess(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProfileData = async (userId, updatedData) => {
    try {
      const response = await axios.put(`https://6801242781c7e9fbcc41aacf.mockapi.io/api/AV1/users/${userId}`, updatedData);
      return response.data;
    } catch (error) {
      console.error("Error saving profile data:", error.response ? error.response.data : error.message);
      throw error;
    }
  };

  const fetchUpdatedUserData = async (email) => {
    try {
      const response = await axios.get('https://6801242781c7e9fbcc41aacf.mockapi.io/api/AV1/users', { params: { email } });
      return response.data[0] || null;
    } catch (error) {
      console.error('Error fetching updated user data:', error.response?.data || error.message);
      throw error;
    }
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updatedData = { ...formData, photo: profileImage };
      if (!formData.newPassword || !formData.confirmPassword) {
        delete updatedData.currentPassword;
        delete updatedData.newPassword;
        delete updatedData.confirmPassword;
      }
      await saveProfileData(user.id, updatedData);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const updatedUserData = await fetchUpdatedUserData(user.email);
      setFormData({
        ...updatedUserData,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setProfileImage(updatedUserData.photo || "");
      setSaveSuccess(true);
      setIsEditMode(false);
      setHasUnsavedChanges(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      setError("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (!user) return;
    setFormData({ ...user, currentPassword: "", newPassword: "", confirmPassword: "" });
    setProfileImage(user.photo || "");
    setIsEditMode(false);
    setHasUnsavedChanges(false);
  };

  const handleVerifyEmail = () => {
    navigate("/verify-otp");
  };

  const renderField = ({ id, label, type, readOnly, options, toggleVisibility, verify, verified }) => {
    const value = formData[id] || "";
    let field;

    const baseInputClasses = `
      w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl
      text-gray-900 text-sm font-medium placeholder-gray-500
      transition-all duration-200 ease-in-out
      focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50
      disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60
      ${readOnly || !isEditMode ? 'bg-gray-50 cursor-not-allowed' : 'hover:border-gray-300'}
    `;

    if (type === "textarea") {
      field = (
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">{label}</label>
          <textarea
            name={id}
            value={value}
            onChange={handleInputChange}
            className={`${baseInputClasses} min-h-[100px] resize-none`}
            rows={4}
            readOnly={readOnly || !isEditMode}
            placeholder={isEditMode ? `Enter your ${label.toLowerCase()}` : ''}
          />
        </div>
      );
    } else if (type === "select") {
      field = (
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">{label}</label>
          <select
            name={id}
            value={value}
            onChange={handleInputChange}
            className={baseInputClasses}
            disabled={readOnly || !isEditMode}
          >
            <option value="">Select {label}</option>
            {(options || []).map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      );
    } else if (type === "password") {
      field = isEditMode ? (
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">{label}</label>
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
        </div>
      ) : null;
    } else {
      field = (
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">{label}</label>
          <div className="relative">
            <input
              type={type}
              name={id}
              value={value}
              onChange={handleInputChange}
              className={baseInputClasses}
              readOnly={readOnly || !isEditMode}
              placeholder={isEditMode ? `Enter your ${label.toLowerCase()}` : ''}
            />
            {verify && isEditMode && (
              <button
                type="button"
                onClick={handleVerifyEmail}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--accent-color)] hover:text-[var(--accent-color)] transition-colors duration-200 focus:outline-none"
                title="Verify email"
              >
                <MailCheck size={18} />
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
        </div>
      );
    }

    if (type === "password" && !isEditMode) return null;

    return (
      <div key={id} className="w-full">
        {isEditMode ? (
          field
        ) : (
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">{label}</label>
            <div className={`${baseInputClasses} flex items-center justify-between`}>
              <span className={`${value ? 'text-gray-900' : 'text-gray-400 italic'}`}>
                {value || 'Not provided'}
              </span>
              <div className="flex items-center gap-2">
                {id === "email" && isVerified && (
                  <ShieldCheck size={16} className="text-[var(--accent-color)]" />
                )}
                {id === "phone" && isPhoneVerified && (
                  <ShieldCheck size={16} className="text-[var(--accent-color)]" />
                )}
              </div>
            </div>
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

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full mx-4">
        <div className="animate-pulse">
          <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-6"></div>
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-4">
            <div className="h-12 bg-gray-200 rounded-lg"></div>
            <div className="h-12 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <X size={32} className="text-red-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h3>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="w-full bg-[var(--accent-color)] hover:bg-[var(--accent-color)] text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
        >
          Reload Page
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="relative bg-gradient-to-br from-[var(--primary-color)] to-[var(--accent-color)] border-b rounded-xl text-white">
          <div className="px-4 sm:px-6 lg:px-8 pt-8 pb-8 ">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="w-full sm:w-auto text-center sm:text-left">
                <h1 className="text-xl sm:text-3xl font-bold">Profile Settings</h1>
                <p className="text-slate-300 mt-1">Manage your account information and preferences</p>
              </div>
              {!isEditMode ? (
                <button
                  onClick={() => setIsEditMode(true)}
                  className="inline-flex items-center gap-2 bg-[var(--primary-color)] text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 w-full sm:w-auto justify-center"
                >
                  <Edit2 size={18} />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-xl w-full sm:w-auto justify-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Edit Mode</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Image Section */}
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

          {/* User Info */}
          <div className="text-center ">
            <h2 className="text-2xl font-bold text-gray-900">
              {formData.firstName} {formData.lastName}
            </h2>
            <div className="flex items-center justify-center gap-2 mt-2">
              <p className="text-gray-600">{formData.email}</p>
              {isVerified && <ShieldCheck size={16} className="text-[var(--accent-color)]" />}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 sm:px-6 lg:px-8 ">
          <div className="flex justify-center">
            <div className="inline-flex bg-white rounded-2xl p-1 shadow-lg">
              {["personal", ...(isEditMode ? ["password"] : [])].map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`inline-flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${isActive
                        ? "bg-[var(--primary-color)] text-white shadow-lg"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                  >
                    {getTabIcon(tab)}
                    <span className="capitalize">{tab}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="px-4 sm:px-6 lg:px-8 pb-8">
          <form onSubmit={handleSaveChanges}>
            {["personal", ...(isEditMode ? ["password"] : [])].map((tab) => (
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
                      {formFields[tab].map(renderField)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </form>
        </div>

        {/* Action Buttons - Fixed for mobile, inline for desktop */}
        {isEditMode && (
          <>
            {/* Mobile Fixed Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-2xl lg:hidden">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors duration-200"
                >
                  <X size={18} />
                  <span>Cancel</span>
                </button>

                <button
                  type="submit"
                  onClick={handleSaveChanges}
                  disabled={!hasUnsavedChanges || isSaving}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[var(--accent-color)] hover:bg-[var(--accent-color)] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors duration-200"
                >
                  {isSaving ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}
                  <span>{isSaving ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </div>

            {/* Desktop Inline Buttons */}
            <div className="hidden lg:block px-4 sm:px-6 lg:px-8 pb-8">
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex items-center gap-2 px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors duration-200"
                >
                  <X size={18} />
                  <span>Cancel</span>
                </button>

                <button
                  type="submit"
                  onClick={handleSaveChanges}
                  disabled={!hasUnsavedChanges || isSaving}
                  className="flex items-center gap-2 px-8 py-3 bg-[var(--accent-color)] hover:bg-[var(--accent-color)] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors duration-200"
                >
                  {isSaving ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}
                  <span>{isSaving ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Success Toast */}
        {saveSuccess && (
          <div className="fixed top-6 right-6 bg-[var(--accent-color)] text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in z-50 max-w-sm">
            <div className="flex-shrink-0 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
              <Check size={16} />
            </div>
            <div>
              <p className="font-semibold">Success!</p>
              <p className="text-sm text-emerald-100">Your changes have been saved</p>
            </div>
          </div>
        )}
      </div>

      {/* Mobile spacing for fixed buttons */}
      {isEditMode && <div className="h-20 lg:hidden"></div>}
    </div>
  );
};

export default Settings;