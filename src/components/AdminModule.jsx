import React, { useState, useEffect } from "react";
import {
  FaUserCircle,
  FaEnvelope,
  FaPhone,
  FaSearch,
  FaArrowLeft,
  FaUsers,
  FaUserShield,
  FaClock,
  FaBed,
  FaUserMd,
  FaUserNurse,
  FaUserTie,
  FaUserCog,
  FaFlask,
  FaTrash,
  FaEdit
} from "react-icons/fa";
import { getGenders, getRoles, getAllSpecializations } from "../utils/masterService";
import { getAllStaff, createStaff, updateStaff, deleteStaff } from "../utils/CrudService";

const tabs = ["Details", "Permissions", "Availability", "IPD Permission"];

const emptyForm = {
  fullName: "", 
  emailId: "", 
  phoneNumber: "", 
  roleId: "", 
  genderId: "",
  password: "", 
  specializationId: "", 
  signature: "", 
  photo: "",
  permissions: [],
  availability: {
    slotDuration: "",
    isAvailable: true,
    days: {
      Monday: { from: "", to: "" },
      Tuesday: { from: "", to: "" },
      Wednesday: { from: "", to: "" },
      Thursday: { from: "", to: "" },
      Friday: { from: "", to: "" },
      Saturday: { from: "", to: "" },
      Sunday: { from: "", to: "" },
    },
    holidayDate: "",
    holidayFrom: "",
    holidayTo: "",
    holidays: [],
  },
  ipdPermissions: [],
};

const roleIcons = {
  Doctor: <FaUserMd className="text-[var(--primary-color)]" />,
  Nurse: <FaUserNurse className="text-green-500" />,
  LabTech: <FaFlask className="text-purple-500" />,
  Frontdesk: <FaUserTie className="text-gray-500" />,
  Admin: <FaUserCog className="text-indigo-500" />,
};

const getRoleIcon = (role) => {
  const roleName = typeof role === 'string' ? role : role?.name || role?.roleName;
  return roleIcons[roleName] || <FaUserCog className="text-gray-500" />;
};

const permissionsByRole = {
  Doctor: [
    "View Patient Records",
    "Edit Patient Records", 
    "Add Prescription",
    "View Lab Results",
    "Schedule Appointments",
    "Medical Dashboard Access"
  ],
  Nurse: [
    "View Patient Records",
    "Edit Patient Records",
    "Add Vital Signs",
    "View Lab Results",
    "Schedule Appointments",
    "Ward Management"
  ],
  LabTech: [
    "View Lab Requests",
    "Add Lab Results",
    "Edit Lab Results",
    "Lab Dashboard Access"
  ],
  Frontdesk: [
    "Patient Registration",
    "Schedule Appointments", 
    "Billing Access",
    "Front Desk Dashboard"
  ],
  Admin: [
    "View Patient Records",
    "Edit Patient Records",
    "Staff Management",
    "Billing Access",
    "Reports Access",
    "System Settings",
    "Full Dashboard Access"
  ]
};

export default function StaffManagement({ onBack }) {
  const [staffList, setStaffList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("Details");
  const [formData, setFormData] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [errors, setErrors] = useState({});
  const [genders, setGenders] = useState([]);
  const [roles, setRoles] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [dropdownLoading, setDropdownLoading] = useState(false);
  const [staffLoading, setStaffLoading] = useState(false);

  // Fetch dropdown data on component mount
  useEffect(() => {
    fetchDropdownData();
    fetchStaffData();
  }, []);

  const fetchDropdownData = async () => {
    setDropdownLoading(true);
    try {
      const [gendersRes, rolesRes, specializationsRes] = await Promise.all([
        getGenders(),
        getRoles(),
        getAllSpecializations()
      ]);
      
      setGenders(gendersRes.data || []);
      setRoles(rolesRes.data || []);
      setSpecializations(specializationsRes.data || []);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
      setGenders([]);
      setRoles([]);
      setSpecializations([]);
    } finally {
      setDropdownLoading(false);
    }
  };

  const fetchStaffData = async () => {
    setStaffLoading(true);
    try {
      const staffRes = await getAllStaff();
      setStaffList(staffRes.data || []);
    } catch (error) {
      console.error('Error fetching staff data:', error);
      
      // Log detailed error information
      if (error.response) {
        console.error('Backend Response Error:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
      } else if (error.request) {
        console.error('No Response Received:', error.request);
      } else {
        console.error('Request Setup Error:', error.message);
      }
      
      setStaffList([]);
    } finally {
      setStaffLoading(false);
    }
  };

  const filteredStaff = staffList.filter(staff =>
    (staff.fullName || staff.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (staff.emailId || staff.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (staff.roleName || staff.role?.name || staff.role || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Name is required";
    if (!formData.emailId.trim()) newErrors.emailId = "Email is required";
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = "Phone is required";
    if (!formData.roleId) newErrors.roleId = "Role is required";
    if (!formData.genderId) newErrors.genderId = "Gender is required";
    if (!formData.password && editId === null) newErrors.password = "Password is required";
    if (formData.password && formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Object.keys(errors).forEach(field => {
        const element = document.querySelector(`[name="${field}"]`);
        if (element) {
          element.classList.add('shake-red');
          setTimeout(() => element.classList.remove('shake-red'), 400);
        }
      });
      return;
    }

    setLoading(true);
    try {
      // Prepare the payload with proper structure
      const payload = {
        fullName: formData.fullName,
        emailId: formData.emailId,
        phoneNumber: formData.phoneNumber,
        roleId: parseInt(formData.roleId),
        genderId: parseInt(formData.genderId),
        password: formData.password,
        specializationId: parseInt(formData.specializationId),
        signature: formData.signature,
        photo: formData.photo
      };

      if (editId !== null) {
        // Update existing staff
        await updateStaff(editId, payload);
        await fetchStaffData(); // Refresh the list
      } else {
        // Create new staff
        await createStaff(payload);
        await fetchStaffData(); // Refresh the list
      }
      
      setFormData(emptyForm);
      setEditId(null);
      setShowForm(false);
      setActiveTab("Details");
      setErrors({});
    } catch (error) {
      console.error('Error saving staff:', error);
      
      // Log detailed error information
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Backend Response Error:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        });
        
        // Show user-friendly error messages
        const errorData = error.response.data;
        if (errorData && errorData.error) {
          if (errorData.error.includes('duplicate key') && errorData.error.includes('email')) {
            alert('Error: This email address is already registered. Please use a different email.');
          } else if (errorData.error.includes('duplicate key') && errorData.error.includes('phone')) {
            alert('Error: This phone number is already registered. Please use a different phone number.');
          } else {
            alert('Error: ' + (errorData.message || errorData.error || 'Failed to save staff member.'));
          }
        } else {
          alert('Error: Failed to save staff member. Please try again.');
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No Response Received:', error.request);
        alert('Error: Unable to connect to the server. Please check your connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Request Setup Error:', error.message);
        alert('Error: ' + error.message);
      }
      
      // You could show an error message to the user here
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (staff) => {
    setFormData({
      fullName: staff.fullName || staff.name || "",
      emailId: staff.emailId || staff.email || "",
      phoneNumber: staff.phoneNumber || staff.phone || "",
      roleId: staff.roleId || staff.role?.id || staff.role || "",
      genderId: staff.genderId || staff.gender?.id || staff.gender || "",
      password: "", // Don't populate password for edit
      specializationId: staff.specializationId || staff.specialization?.id || staff.specialization || "",
      signature: staff.signaturePath || staff.signature || "",
      photo: staff.photoPath || staff.photo || "",
      permissions: staff.permissions || [],
      availability: staff.availability || emptyForm.availability,
      ipdPermissions: staff.ipdPermissions || [],
    });
    setEditId(staff.id);
    setShowForm(true);
    setActiveTab("Details");
    setErrors({});
  };

  const togglePermission = (permission) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  const updateAvailabilityDay = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        days: {
          ...prev.availability.days,
          [day]: {
            ...prev.availability.days[day],
            [field]: value
          }
        }
      }
    }));
  };

  const addHoliday = () => {
    const holiday = {
      id: Date.now(),
      date: formData.availability.holidayDate,
      from: formData.availability.holidayFrom,
      to: formData.availability.holidayTo
    };
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        holidays: [...prev.availability.holidays, holiday],
        holidayDate: "",
        holidayFrom: "",
        holidayTo: ""
      }
    }));
  };

  const removeHoliday = (holidayId) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        holidays: prev.availability.holidays.filter(h => h.id !== holidayId)
      }
    }));
  };

  const handleDelete = async (staffId) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        await deleteStaff(staffId);
        await fetchStaffData(); // Refresh the list
      } catch (error) {
        console.error('Error deleting staff:', error);
        // You could show an error message to the user here
      }
    }
  };

  const getRoleDisplayName = (roleId) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : roleId;
  };

  const getGenderDisplayName = (genderId) => {
    const gender = genders.find(g => g.id === genderId);
    return gender ? gender.name : genderId;
  };

  const getSpecializationDisplayName = (specId) => {
    const spec = specializations.find(s => s.id === specId);
    return spec ? spec.specializationName : specId;
  };

  return (
    <div className="min-h-screen bg-gray-50 ">
      <div className="flex flex-col md:flex-row h-[calc(100vh-80px)]">
        {/* Sidebar: Staff List */}
        <aside className="w-full md:w-80 bg-white border-r border-gray-200 overflow-y-autocustom-scrollbar">
          <div className="p-4 border-b border-gray-200">
            <div className="relative mb-4">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search staff..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              className="w-full bg-[var(--primary-color)] hover:bg-[var(--primary-color)] text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2"
              onClick={() => {
                setShowForm(true);
                setFormData(emptyForm);
                setEditId(null);
                setActiveTab("Details");
                setErrors({});
              }}
            >
              <span>+</span> Add Staff
            </button>
          </div>

          <div className="p-2">
            {staffLoading ? (
              <div className="p-4 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-color)]"></div>
              </div>
            ) : filteredStaff.length === 0 ? (
              <div className="p-4 text-center">
                <FaUsers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No staff members found</p>
                <p className="text-sm text-gray-400">Add your first staff member to get started</p>
              </div>
            ) : (
              filteredStaff.map(staff => (
                <div
                  key={staff.id}
                  className="flex items-center p-3 mb-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <div 
                    className="flex-1 cursor-pointer"
                    onClick={() => handleEditClick(staff)}
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <span className="text-[var(--primary-color)] font-semibold">{(staff.fullName || staff.name || "").charAt(0)}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-800">{staff.fullName || staff.name}</h3>
                          <div className="text-xs text-gray-500">{getRoleIcon(staff.roleName || staff.role)}</div>
                        </div>
                        <p className="text-sm text-gray-500">{staff.roleName || getRoleDisplayName(staff.roleId || staff.role?.id || staff.role)}</p>
                        {staff.specializationName && (
                          <p className="text-xs text-green-500">{staff.specializationName}</p>
                        )}
                        <p className="text-xs text-gray-400">{staff.phoneNumber || staff.phone}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(staff);
                      }}
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <FaEdit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(staff.id);
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-white p-6">
          {!showForm ? (
            <div className="flex flex-col items-center justify-center h-full">
              <FaUsers className="w-20 h-20 text-gray-300 mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Select a Staff Member</h3>
              <p className="text-gray-600 text-center max-w-md">
                Choose a staff member from the list to view or edit their details
              </p>
            </div>
          ) : (
            <div className="h-full flex flex-col">
              {/* Form Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {editId ? "Edit Staff Member" : "Add New Staff Member"}
                  </h2>
                  <p className="text-gray-600 text-sm">
                    {editId ? "Update staff information and permissions" : "Fill in the details to add a new staff member"}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setFormData(emptyForm);
                    setEditId(null);
                    setErrors({});
                  }}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
                >
                  <FaArrowLeft />
                </button>
              </div>

              {/* Form Tabs */}
              <div className="border-b border-gray-200 mb-6">
                <div className="flex overflow-x-auto custom-scrollbar pb-1">
                  {tabs.map(tab => {
                    const icons = {
                      "Details": FaUserCircle,
                      "Permissions": FaUserShield,
                      "Availability": FaClock,
                      "IPD Permission": FaBed
                    };
                    const Icon = icons[tab];
                    return (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab
                            ? "border-[var(--primary-color)] text-[var(--primary-color)]"
                            : "border-transparent text-gray-500 hover:text-[var(--primary-color)]"
                          }`}
                      >
                        <Icon className="w-4 h-4" />
                        {tab}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Form Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar mb-6">
                {activeTab === "Details" && (
                  <div className="max-w-3xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold mb-4">Basic Information</h4>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                          <input
                            name="fullName"
                            className={`w-full p-2 border rounded-lg ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}
                            value={formData.fullName}
                            onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                            placeholder="Enter full name"
                          />
                          {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                          <input
                            name="emailId"
                            type="email"
                            className={`w-full p-2 border rounded-lg ${errors.emailId ? 'border-red-500' : 'border-gray-300'}`}
                            value={formData.emailId}
                            onChange={e => setFormData({ ...formData, emailId: e.target.value })}
                            placeholder="Enter email address"
                          />
                          {errors.emailId && <p className="text-red-500 text-xs mt-1">{errors.emailId}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                          <input
                            name="phoneNumber"
                            className={`w-full p-2 border rounded-lg ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'}`}
                            value={formData.phoneNumber}
                            onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                            placeholder="Enter phone number"
                          />
                          {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                          {dropdownLoading ? (
                            <div className="w-full h-10 bg-gray-100 rounded-lg animate-pulse"></div>
                          ) : (
                            <div className="mt-2">
                              <select
                                name="genderId"
                                value={formData.genderId}
                                onChange={(e) => setFormData({ ...formData, genderId: e.target.value })}
                                className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
                              >
                                <option value="">Select Gender</option>
                                {genders.map(gender => (
                                  <option key={gender.id} value={gender.id}>
                                    {gender.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                          {errors.genderId && <p className="text-red-500 text-xs mt-1">{errors.genderId}</p>}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold mb-4">Professional Information</h4>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Role/Designation *</label>
                          {dropdownLoading ? (
                            <div className="w-full h-10 bg-gray-100 rounded-lg animate-pulse"></div>
                          ) : (
                            <select
                              name="roleId"
                              className={`w-full p-2 border rounded-lg ${errors.roleId ? 'border-red-500' : 'border-gray-300'}`}
                              value={formData.roleId}
                              onChange={e => {
                                const role = e.target.value;
                                setFormData({ ...formData, roleId: role });
                              }}
                            >
                              <option value="">Select Role</option>
                              {roles.map(role => (
                                <option key={role.id} value={role.id}>
                                  {role.name}
                                </option>
                              ))}
                            </select>
                          )}
                          {errors.roleId && <p className="text-red-500 text-xs mt-1">{errors.roleId}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                          {dropdownLoading ? (
                            <div className="w-full h-10 bg-gray-100 rounded-lg animate-pulse"></div>
                          ) : (
                            <select
                              className="w-full p-2 border border-gray-300 rounded-lg"
                              value={formData.specializationId}
                              onChange={e => setFormData({ ...formData, specializationId: e.target.value })}
                            >
                              <option value="">Select Specialization</option>
                              {specializations.map(spec => (
                                <option key={spec.id} value={spec.id}>
                                  {spec.specializationName}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Password {editId ? "" : "*"}</label>
                          <input
                            name="password"
                            type="password"
                            className={`w-full p-2 border rounded-lg ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            placeholder={editId ? "Leave blank to keep current password" : "Minimum 8 characters"}
                          />
                          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Digital Signature</label>
                          <textarea
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            rows="2"
                            value={formData.signature || ""}
                            onChange={e => setFormData({ ...formData, signature: e.target.value })}
                            placeholder="Enter signature text"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={e => {
                              const file = e.target.files[0];
                              if (file) {
                                setFormData(prev => ({ ...prev, photo: file }));
                              }
                            }}
                          />
                          {typeof formData.photo === "object" && formData.photo instanceof File && (
                            <div className="mt-2">
                              <p className="text-sm text-gray-600">Selected file: {formData.photo.name}</p>
                              <button
                                type="button"
                                className="text-xs text-red-500 mt-1 underline"
                                onClick={() => setFormData(prev => ({ ...prev, photo: "" }))}
                              >
                                Remove File
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "Permissions" && (
                  <div className="max-w-3xl space-y-6">
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h4 className="text-lg font-semibold mb-4">System Permissions</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Select the permissions this staff member should have based on their role.
                      </p>
                      
                      <div className="space-y-3">
                        {permissionsByRole[formData.roleId ? getRoleDisplayName(formData.roleId) : 'Admin']?.map(permission => (
                          <label key={permission} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                            <input
                              type="checkbox"
                              checked={formData.permissions.includes(permission)}
                              onChange={() => togglePermission(permission)}
                              className="w-4 h-4 text-[var(--primary-color)] border-gray-300 rounded focus:ring-[var(--primary-color)]"
                            />
                            <span className="text-sm text-gray-700">{permission}</span>
                          </label>
                        ))}
                      </div>

                      {formData.permissions.length === 0 && (
                        <p className="text-sm text-gray-500 mt-4">No permissions selected. This user will have limited access.</p>
                      )}
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h5 className="font-medium text-blue-900 mb-2">Permission Notes</h5>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Permissions are based on the selected role</li>
                        <li>• Admin users have full system access</li>
                        <li>• Medical staff can access patient records</li>
                        <li>• Front desk staff can manage appointments and billing</li>
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === "Availability" && (
                  <div className="max-w-3xl space-y-6">
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold">Weekly Schedule</h4>
                        <div className="flex items-center space-x-2">
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.availability.isAvailable}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                availability: { ...prev.availability, isAvailable: e.target.checked }
                              }))}
                              className="w-4 h-4 text-[var(--primary-color)] border-gray-300 rounded focus:ring-[var(--primary-color)]"
                            />
                            <span className="text-sm text-gray-700">Available for scheduling</span>
                          </label>
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Default Slot Duration</label>
                        <select
                          value={formData.availability.slotDuration}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            availability: { ...prev.availability, slotDuration: e.target.value }
                          }))}
                          className="w-full p-2 border border-gray-300 rounded-lg"
                        >
                          <option value="">Select duration</option>
                          <option value="15">15 minutes</option>
                          <option value="30">30 minutes</option>
                          <option value="45">45 minutes</option>
                          <option value="60">1 hour</option>
                        </select>
                      </div>

                      <div className="space-y-3">
                        {Object.keys(formData.availability.days).map(day => (
                          <div key={day} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                            <div className="w-24 font-medium text-gray-700">{day}</div>
                            <div className="flex items-center space-x-2">
                              <label className="text-sm text-gray-600">From:</label>
                              <input
                                type="time"
                                value={formData.availability.days[day].from}
                                onChange={(e) => updateAvailabilityDay(day, 'from', e.target.value)}
                                className="p-1 border border-gray-300 rounded text-sm"
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <label className="text-sm text-gray-600">To:</label>
                              <input
                                type="time"
                                value={formData.availability.days[day].to}
                                onChange={(e) => updateAvailabilityDay(day, 'to', e.target.value)}
                                className="p-1 border border-gray-300 rounded text-sm"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h4 className="text-lg font-semibold mb-4">Holidays / Time Off</h4>
                      
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                          <input
                            type="date"
                            value={formData.availability.holidayDate}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              availability: { ...prev.availability, holidayDate: e.target.value }
                            }))}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                          <input
                            type="time"
                            value={formData.availability.holidayFrom}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              availability: { ...prev.availability, holidayFrom: e.target.value }
                            }))}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                          <input
                            type="time"
                            value={formData.availability.holidayTo}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              availability: { ...prev.availability, holidayTo: e.target.value }
                            }))}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={addHoliday}
                        disabled={!formData.availability.holidayDate}
                        className="px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg hover:bg-[var(--primary-color)] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add Holiday
                      </button>

                      {formData.availability.holidays.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {formData.availability.holidays.map(holiday => (
                            <div key={holiday.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                              <div className="text-sm">
                                <span className="font-medium">{holiday.date}</span>
                                {holiday.from && holiday.to && (
                                  <span className="text-gray-600 ml-2">({holiday.from} - {holiday.to})</span>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => removeHoliday(holiday.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <FaTrash className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "IPD Permission" && (
                  <div className="max-w-3xl space-y-6">
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h4 className="text-lg font-semibold mb-4">IPD (Inpatient Department) Permissions</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Configure inpatient department access and permissions for this staff member.
                      </p>
                      
                      <div className="space-y-4">
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h5 className="font-medium text-gray-900 mb-3">Patient Management</h5>
                          <div className="space-y-2">
                            {[
                              "Admit Patients",
                              "Discharge Patients", 
                              "View IPD Patient Records",
                              "Edit IPD Patient Records",
                              "Manage Patient Beds"
                            ].map(permission => (
                              <label key={permission} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                                <input
                                  type="checkbox"
                                  checked={formData.ipdPermissions.includes(permission)}
                                  onChange={() => {
                                    setFormData(prev => ({
                                      ...prev,
                                      ipdPermissions: prev.ipdPermissions.includes(permission)
                                        ? prev.ipdPermissions.filter(p => p !== permission)
                                        : [...prev.ipdPermissions, permission]
                                    }));
                                  }}
                                  className="w-4 h-4 text-[var(--primary-color)] border-gray-300 rounded focus:ring-[var(--primary-color)]"
                                />
                                <span className="text-sm text-gray-700">{permission}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-4">
                          <h5 className="font-medium text-gray-900 mb-3">Medical Operations</h5>
                          <div className="space-y-2">
                            {[
                              "Prescribe Medications",
                              "Order Lab Tests",
                              "View Test Results",
                              "Manage Treatment Plans",
                              "Access Medical History"
                            ].map(permission => (
                              <label key={permission} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                                <input
                                  type="checkbox"
                                  checked={formData.ipdPermissions.includes(permission)}
                                  onChange={() => {
                                    setFormData(prev => ({
                                      ...prev,
                                      ipdPermissions: prev.ipdPermissions.includes(permission)
                                        ? prev.ipdPermissions.filter(p => p !== permission)
                                        : [...prev.ipdPermissions, permission]
                                    }));
                                  }}
                                  className="w-4 h-4 text-[var(--primary-color)] border-gray-300 rounded focus:ring-[var(--primary-color)]"
                                />
                                <span className="text-sm text-gray-700">{permission}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-4">
                          <h5 className="font-medium text-gray-900 mb-3">Administrative Access</h5>
                          <div className="space-y-2">
                            {[
                              "View Ward Reports",
                              "Manage Staff Schedules",
                              "Access Billing Information",
                              "Generate Discharge Summaries",
                              "Emergency Access"
                            ].map(permission => (
                              <label key={permission} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                                <input
                                  type="checkbox"
                                  checked={formData.ipdPermissions.includes(permission)}
                                  onChange={() => {
                                    setFormData(prev => ({
                                      ...prev,
                                      ipdPermissions: prev.ipdPermissions.includes(permission)
                                        ? prev.ipdPermissions.filter(p => p !== permission)
                                        : [...prev.ipdPermissions, permission]
                                    }));
                                  }}
                                  className="w-4 h-4 text-[var(--primary-color)] border-gray-300 rounded focus:ring-[var(--primary-color)]"
                                />
                                <span className="text-sm text-gray-700">{permission}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>

                      {formData.ipdPermissions.length === 0 && (
                        <p className="text-sm text-gray-500 mt-4">No IPD permissions selected. This user will not have inpatient department access.</p>
                      )}
                    </div>

                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <h5 className="font-medium text-orange-900 mb-2">IPD Access Notes</h5>
                      <ul className="text-sm text-orange-800 space-y-1">
                        <li>• IPD permissions control access to inpatient facilities</li>
                        <li>• Medical staff typically need patient management permissions</li>
                        <li>• Administrative staff may need billing and report access</li>
                        <li>• Emergency access provides critical care override capabilities</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-4 border-t border-gray-200 pt-4">
                <button
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  onClick={() => {
                    setShowForm(false);
                    setFormData(emptyForm);
                    setEditId(null);
                    setErrors({});
                  }}
                >
                  Cancel
                </button>
                <button
                  className={`px-4 py-2 text-white bg-[var(--primary-color)] rounded-lg hover:bg-[var(--primary-color)] ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                      {editId ? "Updating..." : "Saving..."}
                    </>
                  ) : (
                    editId ? "Update Staff" : "Save Staff"
                  )}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
