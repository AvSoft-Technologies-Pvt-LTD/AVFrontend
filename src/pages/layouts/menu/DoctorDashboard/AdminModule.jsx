import React, { useState } from "react";
import { FaUserCircle, FaEnvelope, FaPhone, FaSearch, FaArrowLeft, FaUsers, FaUserShield, FaClock, FaBed } from "react-icons/fa";

const initialStaff = [
  { 
    id: 1, 
    name: "Dr. Trupti Chavan", 
    email: "snehakonnur23@gmail.com", 
    phone: "9082640664", 
    role: "Doctor", 
    gender: "Female", 
    password: "", 
    department: "Cardiology", 
    signature: "", 
    permissions: ["View Patients", "Write Prescriptions", "Access Reports"],
    availability: {
      slotDuration: "30",
      isAvailable: true,
      days: {
        Monday: { from: "09:00", to: "17:00" },
        Tuesday: { from: "09:00", to: "17:00" },
        Wednesday: { from: "09:00", to: "17:00" },
        Thursday: { from: "09:00", to: "17:00" },
        Friday: { from: "09:00", to: "17:00" },
        Saturday: { from: "09:00", to: "13:00" },
        Sunday: { from: "", to: "" },
      },
      holidays: []
    }
  },
  { 
    id: 2, 
    name: "Kavya Sharma", 
    email: "kavya11@gmail.com", 
    phone: "7895461235", 
    role: "Nurse", 
    gender: "Female", 
    password: "", 
    department: "ICU", 
    signature: "", 
    permissions: ["View Patients", "Update Vitals"],
    availability: {
      slotDuration: "15",
      isAvailable: true,
      days: {
        Monday: { from: "08:00", to: "16:00" },
        Tuesday: { from: "08:00", to: "16:00" },
        Wednesday: { from: "08:00", to: "16:00" },
        Thursday: { from: "08:00", to: "16:00" },
        Friday: { from: "08:00", to: "16:00" },
        Saturday: { from: "", to: "" },
        Sunday: { from: "", to: "" },
      },
      holidays: []
    }
  },
  { 
    id: 3, 
    name: "Sahana Kadrolli", 
    email: "sahan@gmail.com", 
    phone: "9901341761", 
    role: "LabTech", 
    gender: "Female", 
    password: "", 
    department: "Laboratory", 
    signature: "", 
    permissions: ["View Reports", "Upload Test Results"],
    availability: {
      slotDuration: "20",
      isAvailable: true,
      days: {
        Monday: { from: "07:00", to: "15:00" },
        Tuesday: { from: "07:00", to: "15:00" },
        Wednesday: { from: "07:00", to: "15:00" },
        Thursday: { from: "07:00", to: "15:00" },
        Friday: { from: "07:00", to: "15:00" },
        Saturday: { from: "07:00", to: "12:00" },
        Sunday: { from: "", to: "" },
      },
      holidays: []
    }
  },
  { 
    id: 4, 
    name: "Bill Anderson", 
    email: "bill12@gmail.com", 
    phone: "1234576892", 
    role: "Frontdesk", 
    gender: "Male", 
    password: "", 
    department: "Reception", 
    signature: "", 
    permissions: ["Manage Appointments", "Register Patients"],
    availability: {
      slotDuration: "10",
      isAvailable: true,
      days: {
        Monday: { from: "08:00", to: "18:00" },
        Tuesday: { from: "08:00", to: "18:00" },
        Wednesday: { from: "08:00", to: "18:00" },
        Thursday: { from: "08:00", to: "18:00" },
        Friday: { from: "08:00", to: "18:00" },
        Saturday: { from: "08:00", to: "14:00" },
        Sunday: { from: "", to: "" },
      },
      holidays: []
    }
  },
  { 
    id: 5, 
    name: "Roshani Kailas Thakare", 
    email: "roshanithakare879@gmail.com", 
    phone: "7483018998", 
    role: "Admin", 
    gender: "Female", 
    password: "", 
    department: "Administration", 
    signature: "", 
    permissions: ["Full Access", "User Management", "System Settings", "Reports Access"],
    availability: {
      slotDuration: "60",
      isAvailable: true,
      days: {
        Monday: { from: "09:00", to: "17:00" },
        Tuesday: { from: "09:00", to: "17:00" },
        Wednesday: { from: "09:00", to: "17:00" },
        Thursday: { from: "09:00", to: "17:00" },
        Friday: { from: "09:00", to: "17:00" },
        Saturday: { from: "", to: "" },
        Sunday: { from: "", to: "" },
      },
      holidays: []
    }
  }
];

const permissionsByRole = {
  Doctor: ["View Patients", "Write Prescriptions", "Access Reports", "Surgery Authorization", "Discharge Patients"],
  Nurse: ["View Patients", "Update Vitals", "Medication Administration", "Patient Care Notes"],
  LabTech: ["View Reports", "Upload Test Results", "Sample Collection", "Equipment Maintenance"],
  Frontdesk: ["Manage Appointments", "Register Patients", "Billing Support", "Insurance Verification"],
  Admin: ["Full Access", "User Management", "System Settings", "Reports Access", "Audit Logs"],
  Pharmacist: ["Medication Dispensing", "Inventory Management", "Drug Interaction Checks"],
};

const departments = [
  "Cardiology", "ICU", "Laboratory", "Reception", "Administration", 
  "Emergency", "Pediatrics", "Orthopedics", "Radiology", "Pharmacy"
];

const tabs = ["Details", "Permissions", "Availability", "IPD Permission"];
const topTabs = ["Staff", "Referral Doctors", "Vendors"];

const emptyForm = {
  name: "", email: "", phone: "", role: "", gender: "",
  password: "", department: "", signature: "", permissions: [],
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
  }
};

export default function StaffManagement({ onBack }) {
  const [staffList, setStaffList] = useState(initialStaff);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("Details");
  const [formData, setFormData] = useState(emptyForm);
  const [mainTab, setMainTab] = useState("Staff");
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [errors, setErrors] = useState({});

  const filteredStaff = staffList.filter(staff => 
    staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    if (!formData.role) newErrors.role = "Role is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.password && editId === null) newErrors.password = "Password is required";
    if (formData.password && formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      // Add shake animation to error fields
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
    setTimeout(() => {
      if (editId !== null) {
        setStaffList(prev => prev.map(s => s.id === editId ? { ...formData, id: editId } : s));
      } else {
        setStaffList(prev => [...prev, { ...formData, id: Date.now() }]);
      }
      setLoading(false);
      setFormData(emptyForm);
      setEditId(null);
      setShowForm(false);
      setActiveTab("Details");
      setErrors({});
    }, 1000);
  };

  const togglePermission = (perm) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter(p => p !== perm)
        : [...prev.permissions, perm],
    }));
  };

  const handleEditClick = (staff) => {
    setFormData(staff);
    setEditId(staff.id);
    setShowForm(true);
    setActiveTab("Details");
    setErrors({});
  };

  const addHoliday = () => {
    if (!formData.availability.holidayDate) return;
    
    const newHoliday = {
      date: formData.availability.holidayDate,
      from: formData.availability.holidayFrom || "Full Day",
      to: formData.availability.holidayTo || "Full Day"
    };
    
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        holidays: [...(prev.availability.holidays || []), newHoliday],
        holidayDate: "",
        holidayFrom: "",
        holidayTo: ""
      }
    }));
  };

  const removeHoliday = (index) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        holidays: prev.availability.holidays.filter((_, i) => i !== index)
      }
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 font-[var(--font-family)]">
   

      <div className="flex h-[calc(100vh-120px)]">
        {/* Sidebar */}
        <aside className="w-[35%] bg-white border-r flex flex-col">

          {/* Search and Add */}
          <div className="p-4 border-b">
            <div className="flex gap-3 mb-3">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input 
                  placeholder="Search staff..." 
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--primary-color)] transition-colors"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                className="btn btn-primary px-4 py-2 text-sm whitespace-nowrap"
                onClick={() => { 
                  setShowForm(true); 
                  setFormData(emptyForm); 
                  setEditId(null); 
                  setActiveTab("Details");
                  setErrors({});
                }}
              >
                + Add Staff
              </button>
            </div>
          </div>

          {/* Staff List */}
          <div className="flex-1 overflow-y-auto hide-scrollbar">
            <div className="p-4 space-y-3">
              {filteredStaff.map(staff => (
                <div
                  key={staff.id}
                  onClick={() => handleEditClick(staff)}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-[var(--accent-color)]/30 cursor-pointer transition-all duration-200 group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[var(--primary-color)] to-[var(--accent-color)] rounded-full flex items-center justify-center text-white font-semibold text-lg">
                      {staff.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-[var(--primary-color)] truncate">{staff.name}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          staff.role === 'Doctor' ? 'bg-blue-100 text-blue-800' :
                          staff.role === 'Nurse' ? 'bg-green-100 text-green-800' :
                          staff.role === 'Admin' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {staff.role}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 flex items-center gap-1 mb-1">
                        <FaEnvelope className="w-3 h-3" />
                        <span className="truncate">{staff.email}</span>
                      </p>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <FaPhone className="w-3 h-3" />
                        {staff.phone}
                      </p>
                      {staff.department && (
                        <p className="text-xs text-[var(--accent-color)] mt-1 font-medium">
                          {staff.department}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-white">
          {!showForm ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <FaUsers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="h3-heading mb-2">Select a Staff Member</h3>
                <p className="paragraph">Choose a staff member from the list to view or edit their details</p>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col">
              {/* Form Header */}
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="h3-heading">
                      {editId ? "Edit Staff Member" : "Add New Staff Member"}
                    </h2>
                    <p className="paragraph text-sm">
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
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <FaArrowLeft className="text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Form Tabs */}
              <div className="px-6 border-b">
                <div className="flex gap-8">
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
                        className={`flex items-center gap-2 py-4 px-2 text-sm font-medium border-b-2 transition-all duration-200 ${
                          activeTab === tab 
                            ? "border-[var(--accent-color)] text-[var(--accent-color)]" 
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
              <div className="flex-1 p-6">
                {activeTab === "Details" && (
                  <div className="max-w-4xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Basic Information */}
                      <div className="space-y-4">
                        <h4 className="h4-heading mb-4">Basic Information</h4>
                        
                        <div>
                          <label className="detail-label">Full Name *</label>
                          <input
                            name="name"
                            className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Enter full name"
                          />
                          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>

                        <div>
                          <label className="detail-label">Email Address *</label>
                          <input
                            name="email"
                            type="email"
                            className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            placeholder="Enter email address"
                          />
                          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>

                        <div>
                          <label className="detail-label">Phone Number *</label>
                          <input
                            name="phone"
                            className={`input-field ${errors.phone ? 'border-red-500' : ''}`}
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="Enter phone number"
                          />
                          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                        </div>

                        <div>
                          <label className="detail-label">Gender *</label>
                          <div className="flex gap-4 mt-2">
                            {["Male", "Female", "Other"].map(gender => (
                              <label key={gender} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name="gender"
                                  value={gender}
                                  checked={formData.gender === gender}
                                  onChange={e => setFormData({ ...formData, gender: e.target.value })}
                                  className="text-[var(--accent-color)]"
                                />
                                <span className="text-sm">{gender}</span>
                              </label>
                            ))}
                          </div>
                          {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
                        </div>
                      </div>

                      {/* Professional Information */}
                      <div className="space-y-4">
                        <h4 className="h4-heading mb-4">Professional Information</h4>
                        
                        <div>
                          <label className="detail-label">Role/Designation *</label>
                          <select
                            name="role"
                            className={`input-field ${errors.role ? 'border-red-500' : ''}`}
                            value={formData.role}
                            onChange={e => {
                              const role = e.target.value;
                              setFormData({ ...formData, role, permissions: [] });
                            }}
                          >
                            <option value="">Select Role</option>
                            {Object.keys(permissionsByRole).map(role => (
                              <option key={role} value={role}>{role}</option>
                            ))}
                          </select>
                          {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
                        </div>

                        <div>
                          <label className="detail-label">Department</label>
                          <select
                            className="input-field"
                            value={formData.department}
                            onChange={e => setFormData({ ...formData, department: e.target.value })}
                          >
                            <option value="">Select Department</option>
                            {departments.map(dept => (
                              <option key={dept} value={dept}>{dept}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="detail-label">Password {editId ? "" : "*"}</label>
                          <input
                            name="password"
                            type="password"
                            className={`input-field ${errors.password ? 'border-red-500' : ''}`}
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            placeholder={editId ? "Leave blank to keep current password" : "Minimum 8 characters"}
                          />
                          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                        </div>

                        <div>
                          <label className="detail-label">Digital Signature</label>
                          <div className="flex flex-col gap-2">
                            <textarea
                              className="input-field"
                              rows="2"
                              value={typeof formData.signature === "string" && !formData.signature.startsWith("data:") ? formData.signature : ""}
                              onChange={e => setFormData({ ...formData, signature: e.target.value })}
                              placeholder="Enter signature text"
                              disabled={typeof formData.signature === "string" && formData.signature.startsWith("data:")}
                            />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={e => {
                                const file = e.target.files[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (ev) => {
                                    setFormData(prev => ({ ...prev, signature: ev.target.result }));
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                            {typeof formData.signature === "string" && formData.signature.startsWith("data:") && (
                              <div className="mt-2">
                                <img
                                  src={formData.signature}
                                  alt="Signature Preview"
                                  className="h-16 border rounded shadow"
                                />
                                <button
                                  type="button"
                                  className="text-xs text-red-500 mt-1 underline"
                                  onClick={() => setFormData(prev => ({ ...prev, signature: "" }))}
                                >
                                  Remove Image
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "Permissions" && (
                  <div className="max-w-4xl">
                    <h4 className="h4-heading mb-4">Role-Based Permissions</h4>
                    {formData.role ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {permissionsByRole[formData.role]?.map(permission => (
                          <label key={permission} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.permissions.includes(permission)}
                              onChange={() => togglePermission(permission)}
                              className="w-4 h-4 text-[var(--accent-color)] rounded focus:ring-[var(--accent-color)]"
                            />
                            <span className="text-sm font-medium">{permission}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FaUserShield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="paragraph">Please select a role first to assign permissions</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "Availability" && (
                  <div className="max-w-4xl space-y-6">
                    {/* Availability Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="detail-label">Slot Duration (minutes)</label>
                        <input
                          type="number"
                          min="5"
                          max="120"
                          className="input-field"
                          value={formData.availability.slotDuration}
                          onChange={e => setFormData(prev => ({
                            ...prev,
                            availability: { ...prev.availability, slotDuration: e.target.value }
                          }))}
                          placeholder="e.g., 30"
                        />
                      </div>
                      <div className="flex items-center gap-4">
                        <label className="detail-label">Available for Appointments</label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={formData.availability.isAvailable}
                            onChange={e => setFormData(prev => ({
                              ...prev,
                              availability: { ...prev.availability, isAvailable: e.target.checked }
                            }))}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--accent-color)]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent-color)]"></div>
                        </label>
                      </div>
                    </div>

                    {/* Weekly Schedule */}
                    <div>
                      <h4 className="h4-heading mb-4">Weekly Schedule</h4>
                      <div className="space-y-3">
                        {Object.keys(formData.availability.days).map(day => (
                          <div key={day} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg">
                            <div className="w-20 font-medium text-sm">{day}</div>
                            <input
                              type="time"
                              className="input-field flex-1"
                              value={formData.availability.days[day].from}
                              onChange={e => {
                                const updated = { ...formData.availability.days[day], from: e.target.value };
                                setFormData(prev => ({
                                  ...prev,
                                  availability: {
                                    ...prev.availability,
                                    days: { ...prev.availability.days, [day]: updated }
                                  }
                                }));
                              }}
                            />
                            <span className="text-gray-500">to</span>
                            <input
                              type="time"
                              className="input-field flex-1"
                              value={formData.availability.days[day].to}
                              onChange={e => {
                                const updated = { ...formData.availability.days[day], to: e.target.value };
                                setFormData(prev => ({
                                  ...prev,
                                  availability: {
                                    ...prev.availability,
                                    days: { ...prev.availability.days, [day]: updated }
                                  }
                                }));
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Holidays */}
                    <div>
                      <h4 className="h4-heading mb-4">Holidays & Leave</h4>
                      <div className="space-y-4">
                        <div className="flex gap-3 items-end">
                          <div className="flex-1">
                            <label className="detail-label">Date</label>
                            <input
                              type="date"
                              className="input-field"
                              value={formData.availability.holidayDate}
                              onChange={e => setFormData(prev => ({
                                ...prev,
                                availability: { ...prev.availability, holidayDate: e.target.value }
                              }))}
                            />
                          </div>
                          <div className="flex-1">
                            <label className="detail-label">From (Optional)</label>
                            <input
                              type="time"
                              className="input-field"
                              value={formData.availability.holidayFrom}
                              onChange={e => setFormData(prev => ({
                                ...prev,
                                availability: { ...prev.availability, holidayFrom: e.target.value }
                              }))}
                            />
                          </div>
                          <div className="flex-1">
                            <label className="detail-label">To (Optional)</label>
                            <input
                              type="time"
                              className="input-field"
                              value={formData.availability.holidayTo}
                              onChange={e => setFormData(prev => ({
                                ...prev,
                                availability: { ...prev.availability, holidayTo: e.target.value }
                              }))}
                            />
                          </div>
                          <button
                            onClick={addHoliday}
                            className="btn btn-primary px-4 py-2"
                            disabled={!formData.availability.holidayDate}
                          >
                            Add
                          </button>
                        </div>
                        
                        {formData.availability.holidays?.length > 0 && (
                          <div className="border rounded-lg overflow-hidden">
                            <div className="bg-gray-50 px-4 py-2 border-b">
                              <h5 className="font-medium text-sm">Scheduled Holidays</h5>
                            </div>
                            <div className="divide-y">
                              {formData.availability.holidays.map((holiday, index) => (
                                <div key={index} className="flex items-center justify-between p-3">
                                  <div>
                                    <span className="font-medium">{holiday.date}</span>
                                    {holiday.from !== "Full Day" && (
                                      <span className="text-sm text-gray-600 ml-2">
                                        {holiday.from} - {holiday.to}
                                      </span>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => removeHoliday(index)}
                                    className="text-red-500 hover:text-red-700 text-sm"
                                  >
                                    Remove
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "IPD Permission" && (
                  <div className="max-w-4xl">
                    <h4 className="h4-heading mb-4">IPD (In-Patient Department) Permissions</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        "Admit Patients",
                        "Discharge Patients", 
                        "Transfer Patients",
                        "Access Patient Records",
                        "Update Treatment Plans",
                        "Medication Orders",
                        "Surgery Scheduling",
                        "Emergency Procedures"
                      ].map(permission => (
                        <label key={permission} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.permissions.includes(permission)}
                            onChange={() => togglePermission(permission)}
                            className="w-4 h-4 text-[var(--accent-color)] rounded focus:ring-[var(--accent-color)]"
                          />
                          <span className="text-sm font-medium">{permission}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="p-6 border-t bg-gray-50">
                <div className="flex justify-end gap-4">
                  <button
                    className="btn btn-secondary px-6 py-2 animated-cancel-btn"
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
                    className={`btn btn-primary px-6 py-2 ${loading ? "btn-disabled" : ""}`}
                    onClick={handleSave}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="loader-spinner"></div>
                        {editId ? "Updating..." : "Saving..."}
                      </>
                    ) : (
                      editId ? "Update Staff" : "Save Staff"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}