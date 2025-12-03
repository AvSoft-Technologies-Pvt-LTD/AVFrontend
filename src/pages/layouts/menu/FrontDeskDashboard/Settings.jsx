import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Shield,
  Save,
  Edit2,
  Trash2,
  Plus,
  Mail,
  Phone,
  MapPin,
  Search,
  ChevronDown,
  SlidersHorizontal,
  Clock,
  Check,
  X,
} from "lucide-react";
import { toast } from "react-toastify";

// Mock Data
const mockTestCatalog = [
  {
    id: 1,
    name: "Complete Blood Count (CBC)",
    category: "Hematology",
    price: 1200,
    duration: "4 hours",
    description:
      "Measures various components of blood including red blood cells, white blood cells, and platelets.",
    popular: true,
  },
  {
    id: 2,
    name: "Lipid Profile",
    category: "Biochemistry",
    price: 1500,
    duration: "6 hours",
    description:
      "Measures cholesterol and triglyceride levels to assess heart disease risk.",
  },
];

const CATEGORIES = [
  "All Categories",
  "Hematology",
  "Biochemistry",
  "Endocrinology",
  "Diabetes",
  "Microbiology",
  "Serology",
  "Histopathology",
];

const PERMISSIONS = [
  "View Dashboard",
  "Manage Tests",
  "Manage Patients",
  "Manage Appointments",
  "View Reports",
  "Manage Users",
  "System Settings",
];

// UI Components
const Button = ({ className = "", variant = "default", size = "default", ...props }) => {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    default:
      "bg-gradient-to-r from-[var(--gradient-start)] to-[var(--accent-color)] text-white px-4 py-2 hover:opacity-90 hover:shadow-lg",
    outline:
      "border-2 border-gray-200 bg-white text-[var(--primary-color)] px-4 py-2 hover:bg-gray-50 hover:border-[var(--accent-color)]/30",
  };

  const sizes = {
    default: "text-sm",
    sm: "text-xs px-3 py-1.5",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
};

const Input = ({ className = "", ...props }) => (
  <input
    className={`w-full rounded-md border-2 border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]/50 focus:border-[var(--accent-color)] transition-all ${className}`}
    {...props}
  />
);

const Label = ({ className = "", children, ...props }) => (
  <label
    className={`text-sm font-medium text-[var(--primary-color)] ${className}`}
    {...props}
  >
    {children}
  </label>
);

const Switch = ({ defaultChecked, onChange }) => {
  const [checked, setChecked] = useState(!!defaultChecked);
  const toggle = () => {
    const next = !checked;
    setChecked(next);
    onChange?.(next);
  };
  return (
    <button
      type="button"
      onClick={toggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 ${
        checked
          ? "bg-gradient-to-r from-[var(--gradient-start)] to-[var(--accent-color)]"
          : "bg-gray-300"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-all duration-200 ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
};

const Select = ({ value, defaultValue, onValueChange, children }) => {
  const [internal, setInternal] = useState(defaultValue ?? "");
  const current = value !== undefined ? value : internal;
  const handleChange = (e) => {
    setInternal(e.target.value);
    onValueChange?.(e.target.value);
  };
  return React.cloneElement(children, { value: current, onChange: handleChange });
};

const SelectTrigger = ({ className = "", children, ...props }) => (
  <select
    className={`w-full rounded-md border-2 border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]/50 focus:border-[var(--accent-color)] transition-all ${className}`}
    {...props}
  >
    {children}
  </select>
);

const SelectItem = ({ value, children }) => (
  <option value={value}>{children}</option>
);

const Card = ({ className = "", children }) => (
  <div
    className={`rounded-xl border-2 border-gray-100 bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow ${className}`}
  >
    {children}
  </div>
);

const CardHeader = ({ className = "", children }) => (
  <div className={`border-b border-gray-100 px-6 py-4 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ className = "", children }) => (
  <h2 className={`text-lg font-semibold text-[var(--primary-color)] ${className}`}>
    {children}
  </h2>
);

const CardDescription = ({ className = "", children }) => (
  <p className={`text-sm text-gray-500 ${className}`}>{children}</p>
);

const CardContent = ({ className = "", children }) => (
  <div className={`px-6 py-4 ${className}`}>{children}</div>
);

const Tabs = ({ defaultValue, children }) => {
  const [value, setValue] = useState(defaultValue);
  return React.Children.map(children, (child) =>
    React.cloneElement(child, { value, setValue })
  );
};

const TabsList = ({ className = "", value, setValue, children }) => (
  <div className={`inline-grid rounded-xl bg-gray-100 p-1 text-sm font-medium shadow-sm ${className}`}>
    {React.Children.map(children, (child) =>
      React.cloneElement(child, { current: value, setValue })
    )}
  </div>
);

const TabsTrigger = ({ value: tabValue, current, setValue, children }) => {
  const active = current === tabValue;
  return (
    <button
      type="button"
      onClick={() => setValue(tabValue)}
      className={`flex items-center justify-center rounded-lg px-3 py-1.5 transition-all ${
        active
          ? "bg-gradient-to-r from-[var(--gradient-start)] to-[var(--accent-color)] text-white shadow-sm font-semibold"
          : "text-gray-600 hover:text-[var(--primary-color)] hover:bg-white/60"
      }`}
    >
      {children}
    </button>
  );
};

const TabsContent = ({ tab, value, children }) =>
  tab === value ? <div className="mt-6">{children}</div> : null;

const Separator = () => <div className="h-px w-full bg-gray-200" />;

// Main FrontDeskSettings Component
export default function FrontDeskSettings() {
  // State for Profile
  const [profileImage, setProfileImage] = useState(null);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");

  // State for Roles
  const [roles, setRoles] = useState([
    {
      role: "Administrator",
      permissions: ["Full Access", "User Management", "Financial Reports", "System Settings"],
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

  // Handlers
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const imageUrl = URL.createObjectURL(file);
    setProfileImage(imageUrl);
  };

  const handleSaveProfile = () => {
    toast.success("Profile updated successfully!");
  };

  const handleAddRole = () => {
    setSelectedRole(null);
    setIsRoleModalOpen(true);
  };

  const handleEditRole = (role) => {
    setSelectedRole(role);
    setIsRoleModalOpen(true);
  };

  const handleDeleteRole = (roleToDelete) => {
    if (window.confirm(`Are you sure you want to delete the role "${roleToDelete.role}"?`)) {
      setRoles(roles.filter((role) => role.role !== roleToDelete.role));
      toast.success("Role deleted successfully");
    }
  };

  const handleSaveRole = (formData) => {
    if (selectedRole) {
      setRoles(
        roles.map((role) =>
          role.role === selectedRole.role ? { ...formData, users: role.users } : role
        )
      );
      toast.success("Role updated successfully");
    } else {
      const newRole = {
        ...formData,
        users: 0,
        permissions: formData.permissions || [],
      };
      setRoles([...roles, newRole]);
      toast.success("Role added successfully");
    }
    setIsRoleModalOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-5xl p-6 bg-gray-50 min-h-screen"
    >
      {/* Header with Save Button */}
      <div className="flex justify-end mb-8">
        <Button onClick={handleSaveProfile} className="gap-2 px-6 py-2.5 font-medium shadow-md">
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="roles">
            <Shield className="h-4 w-4 mr-2" />
            Roles
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent tab="profile" value={activeTab}>
          <div className="bg-white rounded-xl shadow-sm border border-gray-50 p-6">
            <div className="flex flex-col md:flex-row gap-6">
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
                      id="profileUpload"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                    <label
                      htmlFor="profileUpload"
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
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Roles Tab */}
        <TabsContent tab="roles" value={activeTab}>
          <div className="bg-white rounded-lg shadow p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-[var(--primary-color)]">
                Role-based Access Control
              </h2>
              <Button
                onClick={handleAddRole}
                className="flex items-center gap-2 bg-[var(--primary-color)] text-white px-4 py-2 rounded-lg shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add Role
              </Button>
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
                        <h3 className="font-semibold text-lg text-gray-900">{role.role}</h3>
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
                      <Button
                        onClick={() => handleEditRole(role)}
                        className="edit-btn rounded hover:bg-green-100 transition hover:animate-bounce"
                        title="Edit role"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteRole(role)}
                        className="delete-btn hover:bg-green-100 transition hover:animate-bounce"
                        title="Delete role"
                        disabled={role.users > 0}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent tab="security" value={activeTab}>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-[var(--accent-color)]" />
                  Security Settings
                </CardTitle>
                <CardDescription>Manage password and session security.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Current Password</Label>
                    <Input type="password" />
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>New Password</Label>
                      <Input type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label>Confirm Password</Label>
                      <Input type="password" />
                    </div>
                  </div>
                  <Button className="w-full md:w-auto">Update Password</Button>
                </div>
                <Separator />
                <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
                  <div className="space-y-0.5">
                    <Label className="text-base">Auto Logout</Label>
                    <p className="text-sm text-gray-500">Lock screen after inactivity.</p>
                  </div>
                  <Select defaultValue="15">
                    <SelectTrigger className="w-[180px]">
                      <SelectItem value="5">5 Minutes</SelectItem>
                      <SelectItem value="15">15 Minutes</SelectItem>
                      <SelectItem value="30">30 Minutes</SelectItem>
                    </SelectTrigger>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
