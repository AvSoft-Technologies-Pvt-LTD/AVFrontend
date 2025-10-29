//settings.jsx doctor dashboard
import { Camera, Eye, EyeOff, Edit2, Check, Save, X, User, Lock, MapPin, Award, Mail, Phone, Stethoscope } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useSelector } from 'react-redux';

const tabOptions = [
  { value: "basic", label: "Basic Information", icon: User },
  { value: "professional", label: "Professional Details", icon: Award },
  { value: "address", label: "Address", icon: MapPin },
  { value: "password", label: "Change Password", icon: Lock }
];

const DoctorSettings = () => {
  const user = useSelector((state) => state.auth.user);
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", username: "", roles: [], accountStatus: "", storageUsed: 0,
    qualification: "", specialization: "", experience: "", licenseNo: "", address: "", city: "", state: "", pincode: "",
    currentPassword: "", newPassword: "", confirmPassword: "",
  });
  const [avatar, setAvatar] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState({ currentPassword: false, newPassword: false, confirmPassword: false });
  const [userId, setUserId] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`https://6801242781c7e9fbcc41aacf.mockapi.io/api/AV1/users?email=${encodeURIComponent(user?.email)}`);
        const users = response.data;
        if (users.length === 0) throw new Error("User not found");
        const userData = users[0];
        setUserId(userData.id);
        setFormData({
          firstName: userData.firstName, lastName: userData.lastName, email: userData.email, username: userData.email.split('@')[0],
          roles: userData.userType ? [userData.userType.charAt(0).toUpperCase() + userData.userType.slice(1)] : [],
          accountStatus: userData.isVerified ? "active" : "inactive", storageUsed: 0,
          qualification: userData.roleSpecificData?.qualification || "", specialization: userData.roleSpecificData?.specialization || "",
          experience: userData.roleSpecificData?.experience || "", licenseNo: userData.roleSpecificData?.registrationNumber || "",
          address: userData.permanentAddress || "", city: userData.city || "", state: userData.state || "", pincode: userData.pincode || "",
          currentPassword: "", newPassword: "", confirmPassword: "",
        });
        if (userData.photo) setAvatar(userData.photo);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load user data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    if (user?.email) fetchUserData();
  }, [user?.email]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setHasUnsavedChanges(true);
    if (saveSuccess) setSaveSuccess(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setAvatar(reader.result); setHasUnsavedChanges(true); if (saveSuccess) setSaveSuccess(false); };
      reader.readAsDataURL(file);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        firstName: formData.firstName, lastName: formData.lastName, email: formData.email, username: formData.username,
        userType: formData.roles[0]?.toLowerCase(), isVerified: formData.accountStatus === "active",
        roleSpecificData: { qualification: formData.qualification, specialization: formData.specialization, experience: formData.experience, registrationNumber: formData.licenseNo },
        permanentAddress: formData.address, city: formData.city, state: formData.state, pincode: formData.pincode, photo: avatar,
      };
      if (activeTab === "password") {
        if (formData.newPassword !== formData.confirmPassword) { setError("New password and confirm password do not match."); return; }
        payload.password = formData.newPassword;
      }
      await axios.put(`https://6801242781c7e9fbcc41aacf.mockapi.io/api/AV1/users/${userId}`, payload);
      setIsEditMode(false); setHasUnsavedChanges(false); setSaveSuccess(true); setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Error updating user data:", err);
      setError("Failed to update user data. Please try again later.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (user) {
      setFormData({
        firstName: user.firstName, lastName: user.lastName, email: user.email, username: user.email.split('@')[0],
        roles: user.userType ? [user.userType.charAt(0).toUpperCase() + user.userType.slice(1)] : [],
        accountStatus: user.isVerified ? "active" : "inactive", storageUsed: 0,
        qualification: user.roleSpecificData?.qualification || "", specialization: user.roleSpecificData?.specialization || "",
        experience: user.roleSpecificData?.experience || "", licenseNo: user.roleSpecificData?.registrationNumber || "",
        address: user.permanentAddress || "", city: user.city || "", state: user.state || "", pincode: user.pincode || "",
        currentPassword: "", newPassword: "", confirmPassword: "",
      });
      setAvatar(user.photo || null);
    }
    setIsEditMode(false); setHasUnsavedChanges(false);
  };

  const handleTabClick = (tabValue) => { setActiveTab(tabValue); };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-[#01B07A] rounded-full mb-4"></div>
        <div className="h-3 sm:h-4 bg-gray-300 rounded w-32 sm:w-48 mb-2"></div>
        <div className="h-2 sm:h-3 bg-gray-200 rounded w-24 sm:w-32"></div>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md max-w-md w-full">
        <h2 className="text-lg sm:text-xl font-bold mb-4">Error</h2>
        <p className="text-gray-600 mb-4 text-sm sm:text-base">{error}</p>
        <button onClick={() => window.location.reload()} className="w-full px-4 py-2 bg-[#01B07A] text-white rounded-lg hover:bg-[#01B07A]/90 transition-colors text-sm sm:text-base">Reload Page</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-[#01B07A] to-[#1A223F] rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6 sm:mb-8">
          {/* Mobile Layout */}
          <div className="block lg:hidden p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-lg sm:text-xl font-bold text-white">Doctor Profile Settings</h1>
              {!isEditMode ? (
                <button onClick={() => setIsEditMode(true)} className="flex items-center gap-2 px-3 py-1.5 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all duration-200 backdrop-blur-sm border border-white/30 text-sm">
                  <Edit2 size={16} /><span className="font-medium">Edit</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 text-white rounded-lg border border-white/30 text-sm">
                  <span className="font-medium">Edit Mode</span>
                  <div className="w-2 h-2 bg-[#01B07A] rounded-full animate-pulse"></div>
                </div>
              )}
            </div>
            <div className="flex items-start gap-4">
              <div className="relative flex-shrink-0">
                <div className="relative group">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden ring-2 ring-white shadow-lg">
                    {avatar ? <img src={avatar} alt="Profile" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-200 flex items-center justify-center"><Camera size={16} className="text-gray-400" /></div>}
                  </div>
                  {isEditMode && (
                    <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#01B07A] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#01B07A]/80 transition-colors shadow-lg">
                      <Camera size={12} className="text-white" />
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-bold text-white truncate">{formData.firstName} {formData.lastName}</h2>
                <div className="space-y-1 text-xs sm:text-sm text-white/90">
                  <div className="flex items-center gap-1"><Stethoscope size={12} /><span>{formData.specialization || "Doctor"}</span></div>
                  <div className="flex items-center gap-1"><Mail size={12} /><span className="truncate">{formData.email}</span></div>
                  <div className="flex items-center gap-1"><Award size={12} /><span>{formData.experience} years experience</span></div>
                </div>
              </div>
            </div>
          </div>
          {/* Desktop Layout */}
          <div className="hidden lg:flex items-center gap-6 p-4 sm:p-6">
            <div className="relative flex-shrink-0">
              <div className="relative group">
                <div className="w-24 h-24 xl:w-28 xl:h-28 rounded-2xl overflow-hidden ring-4 ring-white shadow-lg">
                  {avatar ? <img src={avatar} alt="Profile" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-200 flex items-center justify-center"><Camera size={20} className="text-gray-400" /></div>}
                </div>
                {isEditMode && (
                  <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#01B07A] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#01B07A]/80 transition-colors shadow-lg">
                    <Camera size={14} className="text-white" />
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </button>
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="mb-4">
                <h1 className="text-2xl xl:text-3xl font-bold text-white mb-1">Doctor Profile Settings</h1>
              </div>
              <div>
                <h2 className="text-xl xl:text-2xl font-bold text-white mb-1">{formData.firstName} {formData.lastName}</h2>
                <div className="flex flex-wrap items-center gap-6 text-sm text-white/90 mb-3">
                  <div className="flex items-center gap-1"><Stethoscope size={16} /><span>{formData.specialization || "Cardiology"}</span></div>
                  <div className="flex items-center gap-1"><Mail size={16} /><span>{formData.email}</span></div>
                  <div className="flex items-center gap-1"><Award size={16} /><span>{formData.experience} years experience</span></div>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0">
              {!isEditMode ? (
                <button onClick={() => setIsEditMode(true)} className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all duration-200 backdrop-blur-sm border border-white/30">
                  <Edit2 size={18} /><span className="font-medium">Edit Profile</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg border border-white/30">
                  <span className="font-medium">Edit Mode</span>
                  <div className="w-2 h-2 bg-[#01B07A] rounded-full animate-pulse"></div>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Tabs and Content */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Tab Navigation - Only for Desktop */}
          <div className="border-b border-gray-200 hidden sm:block">
            <div className="flex overflow-x-auto scrollbar-hide">
              {tabOptions.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button key={tab.value} onClick={() => handleTabClick(tab.value)} className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-200 ${activeTab === tab.value ? "border-[#01B07A] text-[#01B07A] bg-[#01B07A]/5" : "border-transparent text-gray-500 hover:text-[#01B07A] hover:border-gray-300"}`}>
                    <Icon size={16} className="sm:w-[18px] sm:h-[18px]" /><span className="hidden sm:inline">{tab.label}</span><span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>
          {/* Tab Content - Stacked on Mobile/Tablet, Tabbed on Desktop */}
          <div className="p-4 sm:p-6">
            {/* Basic Information - Always Visible on Mobile/Tablet */}
            <div className="sm:hidden mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Basic Information</h3>
              <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-1"><label className="block text-sm font-medium text-gray-700">First Name</label><input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} readOnly={!isEditMode} className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B07A] focus:border-transparent text-sm sm:text-base ${!isEditMode ? "bg-gray-50 cursor-not-allowed" : "bg-white"}`} /></div>
                  <div className="space-y-1"><label className="block text-sm font-medium text-gray-700">Last Name</label><input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} readOnly={!isEditMode} className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B07A] focus:border-transparent text-sm sm:text-base ${!isEditMode ? "bg-gray-50 cursor-not-allowed" : "bg-white"}`} /></div>
                  <div className="space-y-1"><label className="block text-sm font-medium text-gray-700">Email Address</label><input type="email" name="email" value={formData.email} onChange={handleInputChange} readOnly={!isEditMode} className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B07A] focus:border-transparent text-sm sm:text-base ${!isEditMode ? "bg-gray-50 cursor-not-allowed" : "bg-white"}`} /></div>
                  <div className="space-y-1"><label className="block text-sm font-medium text-gray-700">Username</label><input type="text" name="username" value={formData.username} onChange={handleInputChange} readOnly={!isEditMode} className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B07A] focus:border-transparent text-sm sm:text-base ${!isEditMode ? "bg-gray-50 cursor-not-allowed" : "bg-white"}`} /></div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-3"><label className="block text-sm font-medium text-gray-700">Account Roles</label><div className="flex flex-wrap gap-2 sm:gap-3">{["Admin", "User", "Doctor"].map((role) => <label key={role} className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-50 rounded-lg"><input type="checkbox" checked={formData.roles.includes(role)} readOnly className="rounded border-gray-300 text-[#01B07A] focus:ring-[#01B07A]" disabled /><span className="text-xs sm:text-sm font-medium text-gray-700">{role}</span></label>)}</div></div>
                  <div className="space-y-1"><label className="block text-sm font-medium text-gray-700">Account Status</label><select name="accountStatus" value={formData.accountStatus} onChange={handleInputChange} disabled={!isEditMode} className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B07A] focus:border-transparent text-sm sm:text-base ${!isEditMode ? "bg-gray-50 cursor-not-allowed" : "bg-white"}`}><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
                </div>
              </div>
            </div>
            {/* Professional Details - Always Visible on Mobile/Tablet */}
            <div className="sm:hidden mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Professional Details</h3>
              <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-1"><label className="block text-sm font-medium text-gray-700">Qualification</label><input type="text" name="qualification" value={formData.qualification} onChange={handleInputChange} readOnly={!isEditMode} className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B07A] focus:border-transparent text-sm sm:text-base ${!isEditMode ? "bg-gray-50 cursor-not-allowed" : "bg-white"}`} /></div>
                  <div className="space-y-1"><label className="block text-sm font-medium text-gray-700">Specialization</label><input type="text" name="specialization" value={formData.specialization} onChange={handleInputChange} readOnly={!isEditMode} className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B07A] focus:border-transparent text-sm sm:text-base ${!isEditMode ? "bg-gray-50 cursor-not-allowed" : "bg-white"}`} /></div>
                  <div className="space-y-1"><label className="block text-sm font-medium text-gray-700">Experience (in years)</label><input type="text" name="experience" value={formData.experience} onChange={handleInputChange} readOnly={!isEditMode} className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B07A] focus:border-transparent text-sm sm:text-base ${!isEditMode ? "bg-gray-50 cursor-not-allowed" : "bg-white"}`} /></div>
                  <div className="space-y-1"><label className="block text-sm font-medium text-gray-700">License Number</label><input type="text" name="licenseNo" value={formData.licenseNo} onChange={handleInputChange} readOnly={!isEditMode} className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B07A] focus:border-transparent text-sm sm:text-base ${!isEditMode ? "bg-gray-50 cursor-not-allowed" : "bg-white"}`} /></div>
                </div>
              </div>
            </div>
            {/* Address - Always Visible on Mobile/Tablet */}
            <div className="sm:hidden mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Address</h3>
              <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:gap-6">
                  <div className="space-y-1"><label className="block text-sm font-medium text-gray-700">Address</label><textarea name="address" value={formData.address} onChange={handleInputChange} readOnly={!isEditMode} rows={3} className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B07A] focus:border-transparent resize-none text-sm sm:text-base ${!isEditMode ? "bg-gray-50 cursor-not-allowed" : "bg-white"}`} /></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div className="space-y-1"><label className="block text-sm font-medium text-gray-700">City</label><input type="text" name="city" value={formData.city} onChange={handleInputChange} readOnly={!isEditMode} className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B07A] focus:border-transparent text-sm sm:text-base ${!isEditMode ? "bg-gray-50 cursor-not-allowed" : "bg-white"}`} /></div>
                    <div className="space-y-1"><label className="block text-sm font-medium text-gray-700">State</label><input type="text" name="state" value={formData.state} onChange={handleInputChange} readOnly={!isEditMode} className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B07A] focus:border-transparent text-sm sm:text-base ${!isEditMode ? "bg-gray-50 cursor-not-allowed" : "bg-white"}`} /></div>
                    <div className="space-y-1 sm:col-span-2 lg:col-span-1"><label className="block text-sm font-medium text-gray-700">Pincode</label><input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} readOnly={!isEditMode} className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B07A] focus:border-transparent text-sm sm:text-base ${!isEditMode ? "bg-gray-50 cursor-not-allowed" : "bg-white"}`} /></div>
                  </div>
                </div>
              </div>
            </div>
            {/* Change Password - Always Visible on Mobile/Tablet */}
            <div className="sm:hidden mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Change Password</h3>
              <div className="space-y-4 sm:space-y-6 max-w-4xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-1"><label className="block text-sm font-medium text-gray-700">Current Password</label><div className="relative"><input type={showPassword.currentPassword ? "text" : "password"} name="currentPassword" value={formData.currentPassword || ""} onChange={handleInputChange} className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B07A] focus:border-transparent text-sm sm:text-base" autoComplete="off" /><button type="button" onClick={() => togglePasswordVisibility("currentPassword")} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">{showPassword.currentPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
                  <div className="space-y-1"><label className="block text-sm font-medium text-gray-700">New Password</label><div className="relative"><input type={showPassword.newPassword ? "text" : "password"} name="newPassword" value={formData.newPassword || ""} onChange={handleInputChange} className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B07A] focus:border-transparent text-sm sm:text-base" autoComplete="off" /><button type="button" onClick={() => togglePasswordVisibility("newPassword")} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">{showPassword.newPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
                </div>
                <div className="max-w-md">
                  <div className="space-y-1"><label className="block text-sm font-medium text-gray-700">Confirm Password</label><div className="relative"><input type={showPassword.confirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword || ""} onChange={handleInputChange} className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B07A] focus:border-transparent text-sm sm:text-base" autoComplete="off" /><button type="button" onClick={() => togglePasswordVisibility("confirmPassword")} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">{showPassword.confirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
                </div>
              </div>
            </div>
            {/* Tabbed Content for Desktop */}
            {activeTab === "basic" && (
              <div className="hidden sm:block space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-1"><label className="block text-sm font-medium text-gray-700">First Name</label><input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} readOnly={!isEditMode} className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B07A] focus:border-transparent text-sm sm:text-base ${!isEditMode ? "bg-gray-50 cursor-not-allowed" : "bg-white"}`} /></div>
                  <div className="space-y-1"><label className="block text-sm font-medium text-gray-700">Last Name</label><input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} readOnly={!isEditMode} className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B07A] focus:border-transparent text-sm sm:text-base ${!isEditMode ? "bg-gray-50 cursor-not-allowed" : "bg-white"}`} /></div>
                  <div className="space-y-1"><label className="block text-sm font-medium text-gray-700">Email Address</label><input type="email" name="email" value={formData.email} onChange={handleInputChange} readOnly={!isEditMode} className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B07A] focus:border-transparent text-sm sm:text-base ${!isEditMode ? "bg-gray-50 cursor-not-allowed" : "bg-white"}`} /></div>
                  <div className="space-y-1"><label className="block text-sm font-medium text-gray-700">Username</label><input type="text" name="username" value={formData.username} onChange={handleInputChange} readOnly={!isEditMode} className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B07A] focus:border-transparent text-sm sm:text-base ${!isEditMode ? "bg-gray-50 cursor-not-allowed" : "bg-white"}`} /></div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-3"><label className="block text-sm font-medium text-gray-700">Account Roles</label><div className="flex flex-wrap gap-2 sm:gap-3">{["Admin", "User", "Doctor"].map((role) => <label key={role} className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-50 rounded-lg"><input type="checkbox" checked={formData.roles.includes(role)} readOnly className="rounded border-gray-300 text-[#01B07A] focus:ring-[#01B07A]" disabled /><span className="text-xs sm:text-sm font-medium text-gray-700">{role}</span></label>)}</div></div>
                  <div className="space-y-1"><label className="block text-sm font-medium text-gray-700">Account Status</label><select name="accountStatus" value={formData.accountStatus} onChange={handleInputChange} disabled={!isEditMode} className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B07A] focus:border-transparent text-sm sm:text-base ${!isEditMode ? "bg-gray-50 cursor-not-allowed" : "bg-white"}`}><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
                </div>
              </div>
            )}
            {activeTab === "professional" && (
              <div className="hidden sm:block space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-1"><label className="block text-sm font-medium text-gray-700">Qualification</label><input type="text" name="qualification" value={formData.qualification} onChange={handleInputChange} readOnly={!isEditMode} className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B07A] focus:border-transparent text-sm sm:text-base ${!isEditMode ? "bg-gray-50 cursor-not-allowed" : "bg-white"}`} /></div>
                  <div className="space-y-1"><label className="block text-sm font-medium text-gray-700">Specialization</label><input type="text" name="specialization" value={formData.specialization} onChange={handleInputChange} readOnly={!isEditMode} className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B07A] focus:border-transparent text-sm sm:text-base ${!isEditMode ? "bg-gray-50 cursor-not-allowed" : "bg-white"}`} /></div>
                  <div className="space-y-1"><label className="block text-sm font-medium text-gray-700">Experience (in years)</label><input type="text" name="experience" value={formData.experience} onChange={handleInputChange} readOnly={!isEditMode} className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B07A] focus:border-transparent text-sm sm:text-base ${!isEditMode ? "bg-gray-50 cursor-not-allowed" : "bg-white"}`} /></div>
                  <div className="space-y-1"><label className="block text-sm font-medium text-gray-700">License Number</label><input type="text" name="licenseNo" value={formData.licenseNo} onChange={handleInputChange} readOnly={!isEditMode} className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B07A] focus:border-transparent text-sm sm:text-base ${!isEditMode ? "bg-gray-50 cursor-not-allowed" : "bg-white"}`} /></div>
                </div>
              </div>
            )}
            {activeTab === "address" && (
              <div className="hidden sm:block space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:gap-6">
                  <div className="space-y-1"><label className="block text-sm font-medium text-gray-700">Address</label><textarea name="address" value={formData.address} onChange={handleInputChange} readOnly={!isEditMode} rows={3} className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B07A] focus:border-transparent resize-none text-sm sm:text-base ${!isEditMode ? "bg-gray-50 cursor-not-allowed" : "bg-white"}`} /></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div className="space-y-1"><label className="block text-sm font-medium text-gray-700">City</label><input type="text" name="city" value={formData.city} onChange={handleInputChange} readOnly={!isEditMode} className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B07A] focus:border-transparent text-sm sm:text-base ${!isEditMode ? "bg-gray-50 cursor-not-allowed" : "bg-white"}`} /></div>
                    <div className="space-y-1"><label className="block text-sm font-medium text-gray-700">State</label><input type="text" name="state" value={formData.state} onChange={handleInputChange} readOnly={!isEditMode} className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B07A] focus:border-transparent text-sm sm:text-base ${!isEditMode ? "bg-gray-50 cursor-not-allowed" : "bg-white"}`} /></div>
                    <div className="space-y-1 sm:col-span-2 lg:col-span-1"><label className="block text-sm font-medium text-gray-700">Pincode</label><input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} readOnly={!isEditMode} className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B07A] focus:border-transparent text-sm sm:text-base ${!isEditMode ? "bg-gray-50 cursor-not-allowed" : "bg-white"}`} /></div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === "password" && (
              <div className="hidden sm:block space-y-4 sm:space-y-6 max-w-4xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-1"><label className="block text-sm font-medium text-gray-700">Current Password</label><div className="relative"><input type={showPassword.currentPassword ? "text" : "password"} name="currentPassword" value={formData.currentPassword || ""} onChange={handleInputChange} className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B07A] focus:border-transparent text-sm sm:text-base" autoComplete="off" /><button type="button" onClick={() => togglePasswordVisibility("currentPassword")} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">{showPassword.currentPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
                  <div className="space-y-1"><label className="block text-sm font-medium text-gray-700">New Password</label><div className="relative"><input type={showPassword.newPassword ? "text" : "password"} name="newPassword" value={formData.newPassword || ""} onChange={handleInputChange} className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B07A] focus:border-transparent text-sm sm:text-base" autoComplete="off" /><button type="button" onClick={() => togglePasswordVisibility("newPassword")} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">{showPassword.newPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
                </div>
                <div className="max-w-md">
                  <div className="space-y-1"><label className="block text-sm font-medium text-gray-700">Confirm Password</label><div className="relative"><input type={showPassword.confirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword || ""} onChange={handleInputChange} className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B07A] focus:border-transparent text-sm sm:text-base" autoComplete="off" /><button type="button" onClick={() => togglePasswordVisibility("confirmPassword")} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">{showPassword.confirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
                </div>
              </div>
            )}
          </div>
          {/* Action Buttons */}
          {isEditMode && (
            <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3">
              <button type="button" onClick={handleCancelEdit} className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 border-2 border-[#01B07A] text-[#01B07A] rounded-lg hover:bg-[#01B07A] hover:text-white transition-all duration-200 font-medium text-sm sm:text-base"><X size={16} className="sm:w-[18px] sm:h-[18px]" />Cancel</button>
              <button type="button" onClick={handleSave} disabled={!hasUnsavedChanges || isSaving} className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 bg-[#01B07A] text-white rounded-lg hover:bg-[#01B07A]/90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-sm sm:text-base">
                {isSaving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={16} className="sm:w-[18px] sm:h-[18px]" />}
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Success Toast */}
      {saveSuccess && (
        <div className="fixed top-4 right-4 left-4 sm:left-auto bg-[#01B07A] text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg shadow-lg flex items-center gap-3 animate-fade-in-up z-50 max-w-sm sm:max-w-none mx-auto sm:mx-0">
          <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-white/20 rounded-full flex items-center justify-center"><Check size={14} className="sm:w-4 sm:h-4" /></div>
          <span className="font-medium text-sm sm:text-base">Changes saved successfully!</span>
        </div>
      )}
    </div>
  );
};

export default DoctorSettings;