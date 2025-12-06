import { useState } from "react";
import {
  User,
  Shield,
  Bell,
  Save,
  Mail,
  Phone,
  Edit2,
  Trash2,
  Plus,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PERMISSIONS = [
  "View Dashboard",
  "Manage Tests",
  "Manage Patients",
  "Manage Appointments",
  "View Reports",
  "Manage Users",
  "System Settings",
];

export default function FrontDeskSettings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [profileImage, setProfileImage] = useState(null);

  const [roles, setRoles] = useState([
    {
      role: "Administrator",
      permissions: [
        "Full Access",
        "User Management",
        "Financial Reports",
        "System Settings",
      ],
      users: 2,
    },
    {
      role: "Front Desk Staff",
      permissions: ["Test Booking", "Patient Registration", "Basic Reports"],
      users: 3,
    },
  ]);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [autoLogout, setAutoLogout] = useState("15");

  // ---------------- Handlers ----------------

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const imageUrl = URL.createObjectURL(file);
    setProfileImage(imageUrl);
  };

  const handleSaveProfile = () => {
    toast.success("Frontdesk profile updated successfully!");
  };

  const handleSaveSecurity = () => {
    toast.success("Security settings updated!");
  };

  const handleSaveNotifications = () => {
    toast.success("Notification preferences saved!");
  };

  const handleAddRole = () => {
    setSelectedRole(null);
    setIsRoleModalOpen(true);
    // TODO: open your role modal here
  };

  const handleEditRole = (role) => {
    setSelectedRole(role);
    setIsRoleModalOpen(true);
    // TODO: open your role modal here
  };

  const handleDeleteRole = (roleToDelete) => {
    if (
      window.confirm(
        `Are you sure you want to delete the role "${roleToDelete.role}"?`
      )
    ) {
      setRoles(roles.filter((role) => role.role !== roleToDelete.role));
      toast.success("Role deleted successfully");
    }
  };

  return (
    <div className="space-y-6 p-4">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      {/* Tabs – same UI as Lab Settings */}
      <div className="bg-white rounded-xl shadow-sm p-1 mb-8 border border-gray-50">
        <nav className="flex space-x-1">
          {[
            {
              value: "profile",
              label: "Profile",
              icon: <User className="w-4 h-4 mr-2" />,
            },
            {
              value: "roles",
              label: "Roles",
              icon: <Shield className="w-4 h-4 mr-2" />,
            },
            {
              value: "security",
              label: "Security",
              icon: <Shield className="w-4 h-4 mr-2" />,
            },
            {
              value: "notifications",
              label: "Notifications",
              icon: <Bell className="w-4 h-4 mr-2" />,
            },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-2.5 text-sm font-medium rounded-lg flex items-center transition-colors ${
                activeTab === tab.value
                  ? "bg-[var(--accent-color)]/10 text-[var(--primary-color)]"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* ---------- PROFILE TAB ---------- */}
      {activeTab === "profile" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-50 p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar / Summary */}
            <div className="w-full md:w-1/3 lg:w-1/4">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="relative group">
                  <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center overflow-hidden">
                    <img
                      src={
                        profileImage ||
                        "https://api.dicebear.com/7.x/avataaars/svg?seed=frontdesk"
                      }
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <input
                    type="file"
                    id="frontdeskProfileUpload"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />

                  <label
                    htmlFor="frontdeskProfileUpload"
                    className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4 text-gray-600" />
                  </label>
                </div>

                <div className="mt-4 text-center">
                  <h2 className="text-lg font-semibold">Front Desk Staff</h2>
                  <p className="text-sm text-gray-500">Front Desk Operator</p>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="flex-1">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-[var(--primary-color)]">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative floating-input">
                      <input
                        type="text"
                        defaultValue="FrontDesk"
                        className="peer w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--primary-color)] transition-colors"
                        placeholder=" "
                      />
                      <label className="absolute left-3 top-2 text-base text-gray-400 transition-all duration-200 pointer-events-none peer-focus:text-[var(--primary-color)] peer-focus:bg-white peer-focus:px-1 peer-focus:text-xs peer-focus:-top-2 peer-focus:left-2 peer-focus:z-10 peer-[:not(:placeholder-shown)]:text-[var(--primary-color)] peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:z-10">
                        First Name
                      </label>
                    </div>
                    <div className="relative floating-input">
                      <input
                        type="text"
                        defaultValue="Staff"
                        className="peer w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--primary-color)] transition-colors"
                        placeholder=" "
                      />
                      <label className="absolute left-3 top-2 text-base text-gray-400 transition-all duration-200 pointer-events-none peer-focus:text-[var(--primary-color)] peer-focus:bg-white peer-focus:px-1 peer-focus:text-xs peer-focus:-top-2 peer-focus:left-2 peer-focus:z-10 peer-[:not(:placeholder-shown)]:text-[var(--primary-color)] peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:z-10">
                        Last Name
                      </label>
                    </div>
                    <div className="relative floating-input">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        defaultValue="frontdesk@pocketclinic.com"
                        className="peer w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--primary-color)] transition-colors"
                        placeholder=" "
                      />
                      <label className="absolute left-10 top-2 text-base text-gray-400 transition-all duration-200 pointer-events-none peer-focus:text-[var(--primary-color)] peer-focus:bg-white peer-focus:px-1 peer-focus:text-xs peer-focus:-top-2 peer-focus:left-2 peer-focus:z-10 peer-[:not(:placeholder-shown)]:text-[var(--primary-color)] peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:z-10">
                        Email
                      </label>
                    </div>
                    <div className="relative floating-input">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        defaultValue="+91 98765 43210"
                        className="peer w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--primary-color)] transition-colors"
                        placeholder=" "
                      />
                      <label className="absolute left-10 top-2 text-base text-gray-400 transition-all duration-200 pointer-events-none peer-focus:text-[var(--primary-color)] peer-focus:bg-white peer-focus:px-1 peer-focus:text-xs peer-focus:-top-2 peer-focus:left-2 peer-focus:z-10 peer-[:not(:placeholder-shown)]:text-[var(--primary-color)] peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:z-10">
                        Phone
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveProfile}
                    className="inline-flex items-center view-btn"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------- ROLES TAB ---------- */}
      {activeTab === "roles" && (
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-[var(--primary-color)]">
              Role-based Access Control
            </h2>
            <button
              onClick={handleAddRole}
              className="flex items-center gap-2 bg-[var(--primary-color)] text-white px-4 py-2 rounded-lg shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Role
            </button>
          </div>

          <div className="space-y-4">
            {roles.map((role, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-xl p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold text-lg text-gray-900">
                        {role.role}
                      </h3>
                      <span className="px-3 py-1 bg-blue-100 text-[var(--primary-color)] text-xs font-medium rounded-full">
                        {role.users} {role.users === 1 ? "user" : "users"}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {role.permissions.map((permission, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-[var(--primary-color)]"
                        >
                          {permission}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditRole(role)}
                      className="edit-btn rounded hover:bg-green-100 transition hover:animate-bounce"
                      title="Edit role"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteRole(role)}
                      className="delete-btn hover:bg-green-100 transition hover:animate-bounce"
                      title="Delete role"
                      disabled={role.users > 0}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------- SECURITY TAB ---------- */}
      {activeTab === "security" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-50 p-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-[var(--primary-color)]">
              Security Settings
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Update password and configure auto logout for frontdesk users.
            </p>
          </div>

          {/* Password */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative floating-input md:col-span-2">
                <input
                  type="password"
                  className="peer w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--primary-color)] transition-colors"
                  placeholder=" "
                />
                <label className="absolute left-3 top-2 text-base text-gray-400 transition-all duration-200 pointer-events-none peer-focus:text-[var(--primary-color)] peer-focus:bg-white peer-focus:px-1 peer-focus:text-xs peer-focus:-top-2 peer-focus:left-2 peer-focus:z-10 peer-[:not(:placeholder-shown)]:text-[var(--primary-color)] peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:z-10">
                  Current Password
                </label>
              </div>

              <div className="relative floating-input">
                <input
                  type="password"
                  className="peer w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--primary-color)] transition-colors"
                  placeholder=" "
                />
                <label className="absolute left-3 top-2 text-base text-gray-400 transition-all duration-200 pointer-events-none peer-focus:text-[var(--primary-color)] peer-focus:bg-white peer-focus:px-1 peer-focus:text-xs peer-focus:-top-2 peer-focus:left-2 peer-focus:z-10 peer-[:not(:placeholder-shown)]:text-[var(--primary-color)] peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:z-10">
                  New Password
                </label>
              </div>

              <div className="relative floating-input">
                <input
                  type="password"
                  className="peer w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--primary-color)] transition-colors"
                  placeholder=" "
                />
                <label className="absolute left-3 top-2 text-base text-gray-400 transition-all duration-200 pointer-events-none peer-focus:text-[var(--primary-color)] peer-focus:bg-white peer-focus:px-1 peer-focus:text-xs peer-focus:-top-2 peer-focus:left-2 peer-focus:z-10 peer-[:not(:placeholder-shown)]:text-[var(--primary-color)] peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:z-10">
                  Confirm Password
                </label>
              </div>
            </div>
          </div>

          {/* Auto Logout */}
          <div className="space-y-2 pt-2">
            <h3 className="text-md font-semibold text-[var(--primary-color)]">
              Auto Logout
            </h3>
            <p className="text-sm text-gray-500">
              Automatically log out frontdesk users after inactivity.
            </p>
            <div className="mt-3 max-w-xs">
              <select
                value={autoLogout}
                onChange={(e) => setAutoLogout(e.target.value)}
                className="block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--primary-color)] focus:ring-1 focus:ring-[var(--accent-color)]/80"
              >
                <option value="5">5 minutes</option>
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">60 minutes</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleSaveSecurity}
              className="inline-flex items-center view-btn"
            >
              <Save className="w-4 h-4 mr-2" />
              Update Security
            </button>
          </div>
        </div>
      )}

      {/* ---------- NOTIFICATIONS TAB ---------- */}
      {activeTab === "notifications" && (
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold">Email Notifications</h2>
            <div className="space-y-4 mt-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">New Patient Registration</p>
                  <p className="text-sm text-gray-500">
                    Notify when a new patient is registered at front desk
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={emailNotifications}
                    onChange={() =>
                      setEmailNotifications(!emailNotifications)
                    }
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent-color)]/100"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Appointment Booking</p>
                  <p className="text-sm text-gray-500">
                    Alert for new appointments booked at front desk
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={emailNotifications}
                    onChange={() =>
                      setEmailNotifications(!emailNotifications)
                    }
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent-color)]/100"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-bold">SMS Notifications</h2>
            <div className="space-y-4 mt-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Token / Queue Updates</p>
                  <p className="text-sm text-gray-500">
                    SMS to patients for token / queue status
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={smsNotifications}
                    onChange={() => setSmsNotifications(!smsNotifications)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent-color)]/100"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Appointment Reminders</p>
                  <p className="text-sm text-gray-500">
                    Send reminders for upcoming appointments
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={smsNotifications}
                    onChange={() => setSmsNotifications(!smsNotifications)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent-color)]/100"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSaveNotifications}
              className="inline-flex items-center view-btn"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Preferences
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
