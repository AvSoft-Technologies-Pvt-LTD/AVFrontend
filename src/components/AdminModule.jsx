import React, { useState } from "react";
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
  FaFlask
} from "react-icons/fa";

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

const roleIcons = {
  Doctor: <FaUserMd className="text-[var(--primary-color)]" />,
  Nurse: <FaUserNurse className="text-green-500" />,
  LabTech: <FaFlask className="text-purple-500" />,
  Frontdesk: <FaUserTie className="text-gray-500" />,
  Admin: <FaUserCog className="text-indigo-500" />,
};

export default function StaffManagement({ onBack }) {
  const [staffList, setStaffList] = useState(initialStaff);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("Details");
  const [formData, setFormData] = useState(emptyForm);
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
            {filteredStaff.map(staff => (
              <div
                key={staff.id}
                onClick={() => handleEditClick(staff)}
                className="flex items-center p-3 mb-2 bg-white rounded-lg shadow-sm hover:shadow-md cursor-pointer transition-shadow"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <span className="text-[var(--primary-color)] font-semibold">{staff.name.charAt(0)}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-800">{staff.name}</h3>
                    <div className="text-xs text-gray-500">{roleIcons[staff.role]}</div>
                  </div>
                  <p className="text-sm text-gray-500">{staff.role}</p>
                  <p className="text-xs text-green-500">{staff.department}</p>
                  <p className="text-xs text-gray-400">{staff.phone}</p>
                </div>
              </div>
            ))}
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
                            name="name"
                            className={`w-full p-2 border rounded-lg ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Enter full name"
                          />
                          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                          <input
                            name="email"
                            type="email"
                            className={`w-full p-2 border rounded-lg ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            placeholder="Enter email address"
                          />
                          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                          <input
                            name="phone"
                            className={`w-full p-2 border rounded-lg ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="Enter phone number"
                          />
                          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                          <div className="mt-2">
                            <select
                              name="gender"
                              value={formData.gender}
                              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                              className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
                            >
                              <option value="">Select Gender</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                          {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold mb-4">Professional Information</h4>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Role/Designation *</label>
                          <select
                            name="role"
                            className={`w-full p-2 border rounded-lg ${errors.role ? 'border-red-500' : 'border-gray-300'}`}
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
                          <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                          <select
                            className="w-full p-2 border border-gray-300 rounded-lg"
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
                                className="h-16 border rounded shadow-sm"
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
                )}

                {activeTab === "Permissions" && (
                  <div className="max-w-3xl">
                    <h4 className="text-lg font-semibold mb-4">Role-Based Permissions</h4>
                    {formData.role ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {permissionsByRole[formData.role]?.map(permission => (
                          <label key={permission} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.permissions.includes(permission)}
                              onChange={() => togglePermission(permission)}
                              className="text-[var(--primary-color)]"
                            />
                            <span>{permission}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FaUserShield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-600">Please select a role first to assign permissions</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "Availability" && (
                  <div className="max-w-3xl space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Slot Duration (minutes)</label>
                        <input
                          type="number"
                          min="5"
                          max="120"
                          className="w-full p-2 border border-gray-300 rounded-lg"
                          value={formData.availability.slotDuration}
                          onChange={e => setFormData(prev => ({
                            ...prev,
                            availability: { ...prev.availability, slotDuration: e.target.value }
                          }))}
                          placeholder="e.g., 30"
                        />
                      </div>
                      <div className="flex items-center gap-4">
                        <label className="text-sm font-medium text-gray-700">Available for Appointments</label>
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
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--primary-color)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary-color)]"></div>
                        </label>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold mb-4">Weekly Schedule</h4>
                      <div className="space-y-3">
                        {Object.keys(formData.availability.days).map(day => (
                          <div key={day} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg">
                            <div className="w-20 font-medium">{day}</div>
                            <input
                              type="time"
                              className="p-2 border border-gray-300 rounded-lg flex-1"
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
                              className="p-2 border border-gray-300 rounded-lg flex-1"
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

                    <div>
                      <h4 className="text-lg font-semibold mb-4">Holidays & Leave</h4>
                      <div className="space-y-4">
                        <div className="flex gap-3 items-end">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input
                              type="date"
                              className="w-full p-2 border border-gray-300 rounded-lg"
                              value={formData.availability.holidayDate}
                              onChange={e => setFormData(prev => ({
                                ...prev,
                                availability: { ...prev.availability, holidayDate: e.target.value }
                              }))}
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">From (Optional)</label>
                            <input
                              type="time"
                              className="w-full p-2 border border-gray-300 rounded-lg"
                              value={formData.availability.holidayFrom}
                              onChange={e => setFormData(prev => ({
                                ...prev,
                                availability: { ...prev.availability, holidayFrom: e.target.value }
                              }))}
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">To (Optional)</label>
                            <input
                              type="time"
                              className="w-full p-2 border border-gray-300 rounded-lg"
                              value={formData.availability.holidayTo}
                              onChange={e => setFormData(prev => ({
                                ...prev,
                                availability: { ...prev.availability, holidayTo: e.target.value }
                              }))}
                            />
                          </div>
                          <button
                            onClick={addHoliday}
                            className="bg-[var(--primary-color)] hover:bg-[var(--primary-color)] text-white py-2 px-4 rounded-lg"
                            disabled={!formData.availability.holidayDate}
                          >
                            Add
                          </button>
                        </div>

                        {formData.availability.holidays?.length > 0 && (
                          <div className="border rounded-lg overflow-hidden">
                            <div className="bg-gray-50 px-4 py-2 border-b">
                              <h5 className="font-medium">Scheduled Holidays</h5>
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
                  <div className="max-w-3xl">
                    <h4 className="text-lg font-semibold mb-4">IPD (In-Patient Department) Permissions</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                            className="text-[var(--primary-color)]"
                          />
                          <span>{permission}</span>
                        </label>
                      ))}
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
