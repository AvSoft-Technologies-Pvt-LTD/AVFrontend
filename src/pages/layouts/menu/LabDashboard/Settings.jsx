import { useState, useEffect } from 'react';
import {
  User,
  Building2,
  Shield,
  TestTube2,
  Bell,
  Save,
  Upload,
  Mail,
  Phone,
  MapPin,
  Edit2,
  Trash2,
  Plus,
  Check,
  X,
  Clock,
  ChevronDown,
  Search,
  SlidersHorizontal
} from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReusableModal from '../../../../components/microcomponents/Modal';

const mockTestCatalog = [
  {
    id: 1,
    name: 'Complete Blood Count (CBC)',
    category: 'Hematology',
    price: 1200,
    duration: '4 hours',
    description: 'Measures various components of blood including red blood cells, white blood cells, and platelets.',
    popular: true
  },
  {
    id: 2,
    name: 'Lipid Profile',
    category: 'Biochemistry',
    price: 1500,
    duration: '6 hours',
    description: 'Measures cholesterol and triglyceride levels to assess heart disease risk.'
  },
  {
    id: 3,
    name: 'Thyroid Function Test',
    category: 'Endocrinology',
    price: 1800,
    duration: '8 hours',
    description: 'Measures thyroid hormone levels to evaluate thyroid function.'
  },
  {
    id: 4,
    name: 'Liver Function Test',
    category: 'Biochemistry',
    price: 1600,
    duration: '6 hours',
    description: 'Assesses liver health by measuring enzymes, proteins, and substances produced by the liver.'
  },
  {
    id: 5,
    name: 'Blood Glucose',
    category: 'Diabetes',
    price: 600,
    duration: '2 hours',
    description: 'Measures blood sugar levels to screen for diabetes and monitor glucose control.',
    popular: true
  },
];

const CATEGORIES = [
  'All Categories',
  'Hematology',
  'Biochemistry',
  'Endocrinology',
  'Diabetes',
  'Microbiology',
  'Serology',
  'Histopathology'
];

const PERMISSIONS = [
  'View Dashboard',
  'Manage Tests',
  'Manage Patients',
  'Manage Appointments',
  'View Reports',
  'Manage Users',
  'System Settings'
];

export default function Settings() {
  // State for test catalog
  const [testCatalog, setTestCatalog] = useState(mockTestCatalog);
  const [filteredTests, setFilteredTests] = useState(mockTestCatalog);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [sortBy, setSortBy] = useState('name');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedTest, setSelectedTest] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  // State for roles
  const [roles, setRoles] = useState([
    {
      role: 'Administrator',
      permissions: ['Full Access', 'User Management', 'Financial Reports', 'System Settings'],
      users: 2,
    },
    {
      role: 'Lab Technician',
      permissions: ['Test Management', 'Report Generation', 'Patient Records'],
      users: 5,
    },
    {
      role: 'Receptionist',
      permissions: ['Test Booking', 'Patient Registration', 'Basic Reports'],
      users: 3,
    },
  ]);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  // State for notifications
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setProfileImage(imageUrl);
  };
  // Test catalog handlers
  const handleSaveTest = (formData) => {
    const newTest = {
      ...formData,
      id: modalMode === 'add' ? Math.max(...testCatalog.map((test) => test.id), 0) + 1 : selectedTest.id,
      price: parseFloat(formData.price),
    };

    if (modalMode === 'add') {
      setTestCatalog([...testCatalog, newTest]);
    } else {
      setTestCatalog(testCatalog.map((test) => (test.id === selectedTest.id ? newTest : test)));
    }

    setIsModalOpen(false);
    toast.success(`Test ${modalMode === 'add' ? 'added' : 'updated'} successfully!`);
  };

  const handleDeleteTest = (testId) => {
    if (window.confirm('Are you sure you want to delete this test?')) {
      setTestCatalog(testCatalog.filter((test) => test.id !== testId));
      toast.success('Test removed from catalog');
    }
  };

  // Role handlers
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
      setRoles(roles.filter(role => role.role !== roleToDelete.role));
      toast.success('Role deleted successfully');
    }
  };

  const handleSaveRole = (formData) => {
    if (selectedRole) {
      // Update existing role
      setRoles(roles.map(role =>
        role.role === selectedRole.role ? { ...formData, users: role.users } : role
      ));
      toast.success('Role updated successfully');
    } else {
      // Add new role
      const newRole = {
        ...formData,
        users: 0,
        permissions: formData.permissions || []
      };
      setRoles([...roles, newRole]);
      toast.success('Role added successfully');
    }
    setIsRoleModalOpen(false);
  };

  // Other handlers
  const handleSaveProfile = () => {
    toast.success('Profile updated successfully!');
  };

  const handleSaveLabInfo = () => {
    toast.success('Lab information updated successfully!');
  };

  const handleSaveNotifications = () => {
    toast.success('Notification settings saved!');
  };

  // Filter and sort tests
  useEffect(() => {
    let result = [...testCatalog];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(test =>
        test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory && selectedCategory !== 'All Categories') {
      result = result.filter(test => test.category === selectedCategory);
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

    setFilteredTests(result);
  }, [testCatalog, searchTerm, selectedCategory, sortBy]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All Categories');
    setSortBy('name');
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
      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm p-1 mb-8 border border-gray-50">
        <nav className="flex space-x-1">
          {[
            { value: 'profile', label: 'Profile', icon: <User className="w-4 h-4 mr-2" /> },
            { value: 'lab-info', label: 'Lab Info', icon: <Building2 className="w-4 h-4 mr-2" /> },
            { value: 'roles', label: 'Roles', icon: <Shield className="w-4 h-4 mr-2" /> },
            { value: 'tests', label: 'Tests', icon: <TestTube2 className="w-4 h-4 mr-2" /> },
            { value: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4 mr-2" /> },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-2.5 text-sm font-medium rounded-lg flex items-center transition-colors ${activeTab === tab.value
                ? 'bg-[var(--accent-color)]/10 text-[var(--primary-color)]'
                : 'text-gray-500 hover:bg-gray-100'
                }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Profile Settings */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-50 p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3 lg:w-1/4">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="relative group">
                  <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center overflow-hidden">
                    <img src={profileImage || "https://api.dicebear.com/7.x/avataaars/svg?seed=admin"} alt="Profile" className="w-full h-full object-cover" />
                  </div>

                  <input type="file" id="profileUpload" accept="image/*" className="hidden" onChange={handleImageChange} />

                  <label htmlFor="profileUpload" className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
                    <Edit2 className="w-4 h-4 text-gray-600" />
                  </label>
                </div>

                <div className="mt-4 text-center">
                  <h2 className="text-lg font-semibold">Dr. Sarah Johnson</h2>
                  <p className="text-sm text-gray-500">Lab Administrator</p>
                </div>
              </div>
            </div>

            <div className="flex-1">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-[var(--primary-color)]">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative floating-input">
                      <input
                        type="text"
                        defaultValue="Sarah"
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
                        defaultValue="Johnson"
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
                        defaultValue="sarah.johnson@medlab.com"
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
                        defaultValue="+1 (555) 123-4567"
                        className="peer w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--primary-color)] transition-colors"
                        placeholder=" "
                      />
                      <label className="absolute left-10 top-2 text-base text-gray-400 transition-all duration-200 pointer-events-none peer-focus:text-[var(--primary-color)] peer-focus:bg-white peer-focus:px-1 peer-focus:text-xs peer-focus:-top-2 peer-focus:left-2 peer-focus:z-10 peer-[:not(:placeholder-shown)]:text-[var(--primary-color)] peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:z-10">
                        Phone
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4 text-[var(--primary-color)]">About</h3>
                  <div className="relative floating-input">
                    <textarea
                      rows={3}
                      className="peer w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--primary-color)] transition-colors pt-4"
                      defaultValue="Senior Laboratory Administrator with 10+ years of experience in managing clinical laboratory operations and ensuring quality control."
                      placeholder=" "
                    ></textarea>
                    <label className="absolute left-3 top-2 text-base text-gray-400 transition-all duration-200 pointer-events-none peer-focus:text-[var(--primary-color)] peer-focus:bg-white peer-focus:px-1 peer-focus:text-xs peer-focus:-top-2 peer-focus:left-2 peer-focus:z-10 peer-[:not(:placeholder-shown)]:text-[var(--primary-color)] peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:z-10">
                      Bio
                    </label>
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

      {/* Lab Information */}
      {activeTab === 'lab-info' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-50 p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Lab Name */}
            <div className="relative floating-input md:col-span-2">
              <input
                type="text"
                defaultValue="MedLab Diagnostics"
                className="peer w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--primary-color)] transition-colors"
                placeholder=" "
              />
              <label className="absolute left-3 top-2 text-base text-gray-400 transition-all duration-200 pointer-events-none peer-focus:text-[var(--primary-color)] peer-focus:bg-white peer-focus:px-1 peer-focus:text-xs peer-focus:-top-2 peer-focus:left-2 peer-focus:z-10 peer-[:not(:placeholder-shown)]:text-[var(--primary-color)] peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:z-10">
                Lab Name
              </label>
            </div>

            {/* Email */}
            <div className="relative floating-input">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                defaultValue="contact@medlab.com"
                className="peer w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--primary-color)] transition-colors"
                placeholder=" "
              />
              <label className="absolute left-10 top-2 text-base text-gray-400 transition-all duration-200 pointer-events-none peer-focus:text-[var(--primary-color)] peer-focus:bg-white peer-focus:px-1 peer-focus:text-xs peer-focus:-top-2 peer-focus:left-2 peer-focus:z-10 peer-[:not(:placeholder-shown)]:text-[var(--primary-color)] peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:z-10">
                Email
              </label>
            </div>

            {/* Phone */}
            <div className="relative floating-input">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                defaultValue="+91 11 2345 6789"
                className="peer w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--primary-color)] transition-colors"
                placeholder=" "
              />
              <label className="absolute left-10 top-2 text-base text-gray-400 transition-all duration-200 pointer-events-none peer-focus:text-[var(--primary-color)] peer-focus:bg-white peer-focus:px-1 peer-focus:text-xs peer-focus:-top-2 peer-focus:left-2 peer-focus:z-10 peer-[:not(:placeholder-shown)]:text-[var(--primary-color)] peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:z-10">
                Phone
              </label>
            </div>

            {/* Address */}
            <div className="relative floating-input md:col-span-2">
              <div className="absolute left-3 top-3">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <textarea
                defaultValue="123 Medical Plaza, Connaught Place, New Delhi - 110001"
                rows={3}
                className="peer w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--primary-color)] transition-colors pt-4"
                placeholder=" "
              />
              <label className="absolute left-10 top-2 text-base text-gray-400 transition-all duration-200 pointer-events-none peer-focus:text-[var(--primary-color)] peer-focus:bg-white peer-focus:px-1 peer-focus:text-xs peer-focus:-top-2 peer-focus:left-2 peer-focus:z-10 peer-[:not(:placeholder-shown)]:text-[var(--primary-color)] peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:z-10">
                Address
              </label>
            </div>

            {/* License Number */}
            <div className="relative floating-input">
              <input
                type="text"
                defaultValue="LAB/2024/001234"
                className="peer w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--primary-color)] transition-colors"
                placeholder=" "
              />
              <label className="absolute left-3 top-2 text-base text-gray-400 transition-all duration-200 pointer-events-none peer-focus:text-[var(--primary-color)] peer-focus:bg-white peer-focus:px-1 peer-focus:text-xs peer-focus:-top-2 peer-focus:left-2 peer-focus:z-10 peer-[:not(:placeholder-shown)]:text-[var(--primary-color)] peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:z-10">
                License Number
              </label>
            </div>

            {/* Accreditation */}
            <div className="relative floating-input">
              <input
                type="text"
                defaultValue="NABL Accredited"
                className="peer w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--primary-color)] transition-colors"
                placeholder=" "
              />
              <label className="absolute left-3 top-2 text-base text-gray-400 transition-all duration-200 pointer-events-none peer-focus:text-[var(--primary-color)] peer-focus:bg-white peer-focus:px-1 peer-focus:text-xs peer-focus:-top-2 peer-focus:left-2 peer-focus:z-10 peer-[:not(:placeholder-shown)]:text-[var(--primary-color)] peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:z-10">
                Accreditation
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleSaveLabInfo}
              className="flex items-center gap-2 view-btn"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Role-based Access */}
      {activeTab === 'roles' && (
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-[var(--primary-color)]">Role-based Access Control</h2>
            <button
              onClick={handleAddRole}
              className="flex items-center gap-2 bg-[var(--primary-color)] text-white px-4 py-2 rounded-lg  shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Role
            </button>
          </div>

          <div className="space-y-4">
            {roles.map((role, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-5 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold text-lg text-gray-900">{role.role}</h3>
                      <span className="px-3 py-1 bg-blue-100 text-[var(--primary-color)] text-xs font-medium rounded-full">
                        {role.users} {role.users === 1 ? 'user' : 'users'}
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
                      className="delete-btn hover:bg-green-100 transition hover:animate-bounce "
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


      {/* Test Catalog */}
      {activeTab === 'tests' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[var(--primary-color)]">Test Catalog</h1>
              <p className="text-gray-500">Manage your lab's test catalog and pricing</p>
            </div>
            <button
              onClick={() => {
                setModalMode('add');
                setSelectedTest(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 bg-[var(--primary-color)] text-white px-4 py-2 rounded-lg  shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add New Test
            </button>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search tests..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--accent-color)]/100 focus:border-[var(--accent-color)]/100"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="relative">
                <select
                  className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]/100 focus:border-[var(--accent-color)]/100 text-sm"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[var(--primary-color)]">
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>

              <div className="relative">
                <select
                  className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]/100 focus:border-[var(--accent-color)]/100 text-sm"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="name">Sort by Name</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="category">Category</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[var(--primary-color)]">
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>

              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filters</span>
              </button>
            </div>

            {(searchTerm || selectedCategory !== 'All Categories') && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">Filters applied:</span>
                {searchTerm && (
                  <span className="inline-flex items-center bg-[var(--accent-color)]/10 text-[var(--primary-color)] px-2.5 py-0.5 rounded-full text-xs font-medium">
                    Search: {searchTerm}
                    <button
                      onClick={() => setSearchTerm('')}
                      className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                )}
                {selectedCategory !== 'All Categories' && (
                  <span className="inline-flex items-center bg-[var(--accent-color)]/10 text-[var(--primary-color)] px-2.5 py-0.5 rounded-full text-xs font-medium">
                    Category: {selectedCategory}
                    <button
                      onClick={() => setSelectedCategory('All Categories')}
                      className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                )}
                <button
                  onClick={resetFilters}
                  className="text-blue-600 hover:text-[var(--primary-color)] text-xs font-medium ml-2"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Test Cards */}
          {filteredTests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTests.map((test) => (
                <div key={test.id} className="bg-white rounded-xl shadow-sm border border-gray-50 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{test.name}</h3>
                        <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-[var(--primary-color)]">
                          {test.category}
                        </span>
                        {test.popular && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            Popular
                          </span>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setModalMode('edit');
                            setSelectedTest(test);
                            setIsModalOpen(true);
                          }}
                          className="edit-btn rounded hover:bg-green-100 transition hover:animate-bounce"
                          title="Edit test"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTest(test.id)}
                          className="delete-btn rounded hover:bg-green-100 transition hover:animate-bounce"
                          title="Delete test"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                      {test.description || 'No description available.'}
                    </p>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1.5 text-gray-400" />
                        <span>{test.duration}</span>
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        ₹{test.price.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <TestTube2 className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No tests found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search or filter to find what you're looking for.</p>
              <button
                onClick={resetFilters}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-[var(--primary-color)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent-color)]/100"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Notification Settings */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold">Email Notifications</h2>
            <div className="space-y-4 mt-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Test Completion Alerts</p>
                  <p className="text-sm text-gray-500">Notify when a test is completed</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={emailNotifications}
                    onChange={() => setEmailNotifications(!emailNotifications)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent-color)]/100"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">New Booking Notifications</p>
                  <p className="text-sm text-gray-500">Alert for new test bookings</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={emailNotifications}
                    onChange={() => setEmailNotifications(!emailNotifications)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent-color)]/100"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Daily Reports</p>
                  <p className="text-sm text-gray-500">Receive daily summary reports</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked readOnly />
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
                  <p className="font-medium">Report Ready Alerts</p>
                  <p className="text-sm text-gray-500">SMS when patient report is ready</p>
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
                  <p className="text-sm text-gray-500">Send test appointment reminders</p>
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

      {/* Test Modal */}
      <ReusableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        title={`${modalMode === 'add' ? 'Add New Test' : 'Edit Test'}`}
        data={selectedTest || {}}
        saveLabel={modalMode === 'add' ? 'Add Test' : 'Update Test'}
        cancelLabel="Cancel"
        onSave={handleSaveTest}
        fields={[
          {
            name: 'name',
            label: 'Test Name',
            type: 'text',
            placeholder: 'Enter test name',
            required: true,
            colSpan: 2
          },
          {
            name: 'category',
            label: 'Category',
            type: 'select',
            options: CATEGORIES.filter(cat => cat !== 'All Categories').map(cat => ({
              value: cat,
              label: cat
            })),
            required: true
          },
          {
            name: 'price',
            label: 'Price (₹)',
            type: 'number',
            placeholder: '0.00',
            min: 0,
            step: '0.01',
            required: true,
            prefix: '₹'
          },
          {
            name: 'duration',
            label: 'Duration',
            type: 'text',
            placeholder: 'e.g., 24 hours, 2-3 days',
            required: true
          },
          {
            name: 'description',
            label: 'Description',
            type: 'textarea',
            placeholder: 'Enter a brief description of the test',
            rows: 3,
            colSpan: 2
          },
          {
            name: 'popular',
            label: 'Mark as Popular',
            type: 'checkbox',
            description: 'Show this test in the popular section'
          }
        ]}
        size="md"
        showSuccessToast={false}
        preventCloseOnSave={false}
        onCancel={() => setIsModalOpen(false)}
      />

      {/* Role Modal */}
      <ReusableModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        mode={selectedRole ? 'edit' : 'add'}
        title={`${selectedRole ? 'Edit' : 'Add New'} Role`}
        data={selectedRole || {}}
        saveLabel={selectedRole ? 'Update Role' : 'Add Role'}
        cancelLabel="Cancel"
        onSave={handleSaveRole}
        fields={[
          {
            name: 'role',
            label: 'Role Name',
            type: 'text',
            placeholder: 'e.g., Lab Manager, Receptionist',
            required: true
          },
          {
            name: 'permissions',
            label: 'Permissions',
            type: 'multiselect',
            options: PERMISSIONS,
            placeholder: 'Select permissions',
            required: true
          }
        ]}
        size="md"
        showSuccessToast={false}
        preventCloseOnSave={false}
        onCancel={() => setIsRoleModalOpen(false)}
      />
    </div>
  );
}