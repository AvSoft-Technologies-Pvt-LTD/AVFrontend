import React, { useState } from "react";
import { Key } from "lucide-react";
import { FaEdit, FaTrash } from "react-icons/fa";
import ReusableModal from "../../../../components/microcomponents/Modal";
import DynamicTable from "../../../../components/microcomponents/DynamicTable";

const userFields = [
  { name: "empId", label: "Employee ID", type: "text" },
  { name: "fullName", label: "Full Name", type: "text" },
  { name: "email", label: "Email", type: "email" },
  { name: "phone", label: "Phone Number", type: "text" },
  {
    name: "role",
    label: "Role",
    type: "select",
    options: [
      { value: "Doctor", label: "Doctor" },
      { value: "Head Nurse", label: "Head Nurse" },
      { value: "Nurse", label: "Nurse" },
      { value: "Lab Technician", label: "Lab Technician" },
      { value: "Receptionist", label: "Receptionist" },
      { value: "Admin", label: "Admin" },
      { value: "Pharmacist", label: "Pharmacist" },
    ],
  },
  { name: "password", label: "Password", type: "password" },
  { name: "confirmPassword", label: "Confirm Password", type: "password" },
  {
    name: "isActive",
    label: "Is Active",
    type: "select",
    options: [
      { value: true, label: "Active" },
      { value: false, label: "Inactive" },
    ],
  },
  {
    name: "isSuperAdmin",
    label: "Super Admin",
    type: "select",
    options: [
      { value: false, label: "No" },
      { value: true, label: "Yes" },
    ],
  },
];

const changePasswordFields = [
  { name: "currentPassword", label: "Current Password", type: "password" },
  { name: "newPassword", label: "New Password", type: "password" },
  { name: "confirmNewPassword", label: "Confirm New Password", type: "password" },
];

const userViewFields = [
  { label: "Employee ID", key: "empId" },
  {
    label: "Full Name",
    key: "fullName",
    initialsKey: true,
    titleKey: true,
    subtitleKey: true,
  },
  { label: "Email", key: "email" },
  { label: "Phone Number", key: "phone" },
  { label: "Role", key: "role" },
  { label: "Is Active", key: "isActive" },
  { label: "Super Admin", key: "isSuperAdmin" },
  { label: "Last Login", key: "lastLogin" },
  { label: "Created Date", key: "createdDate" },
];

const initialUsers = [
  {
    id: 1,
    empId: "EMP001",
    fullName: "Dr. Sarah Johnson",
    email: "sarah@hospital.com",
    phone: "+1-555-0123",
    role: "Doctor",
    isActive: true,
    isSuperAdmin: false,
    lastLogin: "2024-01-15 09:30 AM",
    createdDate: "2024-01-01",
  },
  {
    id: 2,
    empId: "EMP002",
    fullName: "Michael Chen",
    email: "michael@hospital.com",
    phone: "+1-555-0456",
    role: "Admin",
    isActive: true,
    isSuperAdmin: true,
    lastLogin: "2024-01-15 08:15 AM",
    createdDate: "2024-01-02",
  },
  {
    id: 3,
    empId: "EMP003",
    fullName: "Emily Rodriguez",
    email: "emily@hospital.com",
    phone: "+1-555-0789",
    role: "Head Nurse",
    isActive: true,
    isSuperAdmin: false,
    lastLogin: "2024-01-14 06:45 PM",
    createdDate: "2024-01-03",
  },
  {
    id: 4,
    empId: "EMP004",
    fullName: "James Wilson",
    email: "jame@hospital.com",
    phone: "+1-555-0321",
    role: "Lab Technician",
    isActive: false,
    isSuperAdmin: false,
    lastLogin: "2024-01-10 02:20 PM",
    createdDate: "2024-01-04",
  },
  {
    id: 5,
    empId: "EMP005",
    fullName: "Lisa Thompson",
    email: "lisa@hospital.com",
    phone: "+1-555-0654",
    role: "Receptionist",
    isActive: true,
    isSuperAdmin: false,
    lastLogin: "2024-01-15 07:00 AM",
    createdDate: "2024-01-05",
  },
];

const userFilters = [
  {
    key: "combinedFilter",
    label: "Role",
    options: [
      { value: "Doctor", label: "Doctor" },
      { value: "Head Nurse", label: "Head Nurse" },
      { value: "Nurse", label: "Nurse" },
      { value: "Lab Technician", label: "Lab Technician" },
      { value: "Receptionist", label: "Receptionist" },
      { value: "Admin", label: "Admin" },
      { value: "Pharmacist", label: "Pharmacist" },
    ],
  },
];


// Add statusColors mapping for badge styling
const statusColors = {
  active: "text-green-600 bg-green-100",
  inactive: "text-red-600 bg-red-100",
};

const SecuritySettings = () => {
  const [modalState, setModalState] = useState({ isOpen: false, mode: "add", data: {} });
  const [passwordModalState, setPasswordModalState] = useState({ isOpen: false, data: {} });
  const [users, setUsers] = useState(initialUsers);
  const [formErrors, setFormErrors] = useState({});
  const [passwordFormErrors, setPasswordFormErrors] = useState({});

  const openModal = (mode, data = {}) => setModalState({ isOpen: true, mode, data });
  const closeModal = () => {
    setModalState({ isOpen: false, mode: "add", data: {} });
    setFormErrors({});
  };

  const openPasswordModal = (data) => setPasswordModalState({ isOpen: true, data });
  const closePasswordModal = () => {
    setPasswordModalState({ isOpen: false, data: {} });
    setPasswordFormErrors({});
  };

  const validateUser = (data) => {
    const errors = {};
    if (!data.empId) errors.empId = "Employee ID is required.";
    if (!data.fullName) errors.fullName = "Full Name is required.";
    if (!data.email) errors.email = "Email is required.";
    else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(data.email)) errors.email = "Invalid email format.";
    if (!data.phone) errors.phone = "Phone Number is required.";
    if (!data.role) errors.role = "Role is required.";
    if (modalState.mode === "add") {
      if (!data.password) errors.password = "Password is required.";
      if (data.password !== data.confirmPassword) errors.confirmPassword = "Passwords do not match.";
    }
    return errors;
  };

  const validatePasswordChange = (data) => {
    const errors = {};
    if (!data.currentPassword) {
      errors.currentPassword = "Current password is required.";
    }

    if (!data.newPassword) {
      errors.newPassword = "New password is required.";
    } else {
      if (data.newPassword.length < 8) {
        errors.newPassword = "Password must be at least 8 characters.";
      } else if (!/[A-Z]/.test(data.newPassword)) {
        errors.newPassword = "Include at least one uppercase letter.";
      } else if (!/[a-z]/.test(data.newPassword)) {
        errors.newPassword = "Include at least one lowercase letter.";
      } else if (!/[0-9]/.test(data.newPassword)) {
        errors.newPassword = "Include at least one number.";
      } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(data.newPassword)) {
        errors.newPassword = "Include at least one special character.";
      } else if (data.newPassword === data.currentPassword) {
        errors.newPassword = "New password must be different from current password.";
      }
    }

    if (!data.confirmNewPassword) {
      errors.confirmNewPassword = "Please confirm the new password.";
    } else if (data.newPassword !== data.confirmNewPassword) {
      errors.confirmNewPassword = "New password and confirmation do not match.";
    }

    return errors;
  };

  const handleSaveUser = (formData) => {
    const errors = validateUser(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (modalState.mode === "add") {
      setUsers([
        ...users,
        {
          ...formData,
          id: Date.now(),
          lastLogin: "Never",
          createdDate: new Date().toISOString().split("T")[0],
        },
      ]);
    } else if (modalState.mode === "edit") {
      setUsers(users.map((u) => (u.id === modalState.data.id ? { ...u, ...formData } : u)));
    }

    setFormErrors({});
    closeModal();
  };

  const handleDeleteUserConfirm = () => {
    setUsers(users.filter((u) => u.id !== modalState.data.id));
    closeModal();
  };

  const handleChangePasswordSave = (formData) => {
    const errors = validatePasswordChange(formData);
    if (Object.keys(errors).length > 0) {
      setPasswordFormErrors(errors);
      return;
    }

    alert("Password updated successfully.");
    setPasswordFormErrors({});
    closePasswordModal();
  };

  const usersColumns = [
   {
  header: "Emp ID",
  accessor: "empId",
  cell: (row) => (
    <button
      type="button"
      className="text-[var(--primary-color)] hover:text-[var(--accent-color)] underline cursor-pointer"
      onClick={() => openModal("viewProfile", row)}
      title="View Details"
    >
      {row.empId}
    </button>
  ),
},
{
  header: "Full Name",
  accessor: "fullName",
  cell: (row) => (
    <button
      type="button"
      className="text-[var(--primary-color)]  hover:text-[var(--accent-color)] underline cursor-pointer"
      onClick={() => openModal("viewProfile", row)}
      title="View Details"
    >
      {row.fullName}
    </button>
  ),
},

    {
      header: "Role",
      accessor: "role",
      cell: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.role === "Doctor"
            ? "bg-blue-100 text-blue-800"
            : row.role === "Admin"
              ? "bg-purple-100 text-purple-800"
              : row.role === "Head Nurse"
                ? "bg-green-100 text-green-800"
                : row.role === "Lab Technician"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-800"
          }`}>
          {row.role}
        </span>
      ),
    },
    {
      header: "Is Active",
      accessor: "isActive",
      cell: (row) => {
        const statusKey = row.isActive ? "active" : "inactive";
        return (
          <span className={`px-2 py-1 rounded-full text-xs  ${statusColors[statusKey]}`}>
            {statusKey.toUpperCase()}
          </span>
        );
      },
    },
    {
      header: "Last Login",
      accessor: "lastLogin",
    },
    {
      header: "Actions",
      accessor: "actions",
      cell: (row) => (
        <div className="flex gap-2">
          <button onClick={() => openModal("edit", row)} className="edit-btn hover:bg-blue-100 rounded p-1 transition hover:animate-bounce" title="Edit User">
            <FaEdit size={16} />
          </button>
          <button onClick={() => openPasswordModal(row)} className="view-btn hover:bg-blue-100 rounded p-1 transition hover:animate-bounce" title="Change Password">
            <Key size={16} />
          </button>
          <button onClick={() => openModal("confirmDelete", row)} className="delete-btn  hover:bg-blue-100 rounded p-1 transition hover:animate-bounce" title="Delete User">
            <FaTrash size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="max-w-6xl ">
        
        <div className="flex justify-between items-center mb-6">
  <h1 className="h4-heading">Security Settings</h1>
  {/* <button onClick={() => openModal("add")} className="btn btn-primary flex items-center gap-2">
    <Plus size={20} /> Create New User
  </button> */}
</div>


        <div>
          <DynamicTable columns={usersColumns} data={users} filters={userFilters} />
        </div>
      </div>

      <ReusableModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        mode={modalState.mode}
        title={
          modalState.mode === "add"
            ? "Create New User"
            : modalState.mode === "edit"
              ? "Edit User"
              : modalState.mode === "viewProfile"
                ? "User Details"
                : "Confirm Delete"
        }
        data={modalState.data}
        fields={userFields}
        viewFields={userViewFields}
        onSave={handleSaveUser}
        onDelete={handleDeleteUserConfirm}
        size="lg"
        errors={formErrors}
      />

      <ReusableModal
        isOpen={passwordModalState.isOpen}
        onClose={closePasswordModal}
        mode="add"
        title={`Change Password - ${passwordModalState.data.fullName || ""}`}
        data={{}}
        fields={changePasswordFields}
        onSave={handleChangePasswordSave}
        size="md"
        saveLabel="Update Password"
        errors={passwordFormErrors}
      />
    </div>
  );
};

export default SecuritySettings;
