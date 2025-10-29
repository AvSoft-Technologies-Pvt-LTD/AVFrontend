import React, { useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import DynamicTable from "../../../../components/microcomponents/DynamicTable";
import ReusableModal from "../../../../components/microcomponents/Modal";

const Property = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [mode, setMode] = useState("add");
const [propertyData, setPropertyData] = useState([
  {
    id: 1,
    headName: "COST_CENTER_VOUCHER",
    headValue: "Enabled", // Enables cost center tracking on vouchers
  },
  {
    id: 2,
    headName: "ORGANIZATION_NAME",
    headValue: "Robi Corporate Hospital System",
  },
  {
    id: 3,
    headName: "ALLOW_EDIT_AFTER_APPROVE",
    headValue: "false", // Prevent editing after approval
  },
  {
    id: 4,
    headName: "MAX_LOGIN_ATTEMPTS",
    headValue: "3", // Max login attempts before account lock
  },
  {
    id: 5,
    headName: "ENABLE_EMAIL_NOTIFICATION",
    headValue: "true", // Enable system-wide email alerts
  },
  {
    id: 6,
    headName: "PAYROLL_CYCLE",
    headValue: "Monthly", // Defines payroll frequency
  },
  {
    id: 7,
    headName: "DEFAULT_CURRENCY",
    headValue: "BDT", // Bangladesh Taka as default currency
  },
  {
    id: 8,
    headName: "ORGANIZATION_TIMEZONE",
    headValue: "Asia/Dhaka", // For consistent timestamping
  },
  {
    id: 9,
    headName: "ENABLE_SMS_REMINDERS",
    headValue: "true", // For appointment and billing SMS
  },
  {
    id: 10,
    headName: "PATIENT_PORTAL_ACCESS",
    headValue: "true", // Enable self-service portal for patients
  },
  {
    id: 11,
    headName: "MAX_FILE_UPLOAD_SIZE_MB",
    headValue: "10", // Max allowed upload size
  },
  {
    id: 12,
    headName: "ENABLE_2FA",
    headValue: "true", // Two-factor authentication
  }
]);



  const fields = [
    {
      name: "headName",
      label: "Head Name",
      type: "select",
      options: [
        { value: "COST_CENTER_VOUCHER", label: "COST_CENTER_VOUCHER" },
        { value: "DEFAULT_CLIENT_PID", label: "DEFAULT_CLIENT_PID" },
        { value: "FOOTER_REPORT", label: "FOOTER_REPORT" },
        { value: "INVOICE_PREFIX", label: "INVOICE_PREFIX" },
        { value: "REDIRECT_SALES_REPORT_PAGE", label: "REDIRECT_SALES_REPORT_PAGE" },
        { value: "REQUISITION_REQ", label: "REQUISITION_REQ" },
        { value: "SALES_DISALLOW_ZERO_STOCK", label: "SALES_DISALLOW_ZERO_STOCK" },
        { value: "SALES_REF_NO", label: "SALES_REF_NO" },
        { value: "SALES_SEND_SMS", label: "SALES_SEND_SMS" },
        { value: "SAMPLE_SALES_ID", label: "SAMPLE_SALES_ID" },
        { value: "SHOW_DUE_REPORT", label: "SHOW_DUE_REPORT" },
        { value: "SMALL_REPORT_HEADER", label: "SMALL_REPORT_HEADER" },
        { value: "TOP_REPORT_HEADER", label: "TOP_REPORT_HEADER" },
        { value: "UNIT_CONVERSION", label: "UNIT_CONVERSION" },
        { value: "VOUCHER_REF_NO", label: "VOUCHER_REF_NO" },
      ],
    },
    {
      name: "headValue",
      label: "Head Value",
      type: "textarea",
    },
  ];

  const columns = [
    { header: "Head Name", accessor: "headName" },
    {
      header: "Head Value",
      accessor: "headValue",
      cell: (row) => (
        <div className="max-w-[300px] truncate" title={row.headValue}>
          {row.headValue}
        </div>
      ),
    },
    {
      header: "Actions",
      accessor: "actions",
      cell: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              setFormData(row);
              setFormErrors({});
              setMode("edit");
              setIsModalOpen(true);
            }}
            className="edit-btn flex items-center justify-center hover:bg-[--primary-color]/10 rounded p-1 transition hover:animate-bounce"
            title="Edit"
            type="button"
          >
            <FaEdit className="text-[--primary-color]" />
          </button>

          <button
            onClick={() => {
              setFormData(row);
              setMode("confirmDelete");
              setIsModalOpen(true);
            }}
            className="delete-btn flex items-center justify-center hover:bg-red-100 rounded p-1 transition hover:animate-bounce"
            title="Delete"
            type="button"
          >
            <FaTrash className="text-red-500" />
          </button>
        </div>
      ),
    },
  ];

  const validateForm = (data) => {
    const errors = {};
    if (!data.headName) errors.headName = "Head Name is required";
    if (!data.headValue || data.headValue.trim() === "") {
      errors.headValue = "Head Value is required";
    }
    return errors;
  };

  const handleSave = (data) => {
    const errors = validateForm(data);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (mode === "edit") {
      setPropertyData((prev) =>
        prev.map((item) =>
          item.id === formData.id ? { ...item, ...data } : item
        )
      );
    } else {
      setPropertyData((prev) => [...prev, { ...data, id: Date.now() }]);
    }

    setIsModalOpen(false);
    setFormErrors({});
  };

  const handleDelete = () => {
    setPropertyData((prev) =>
      prev.filter((item) => item.id !== formData.id)
    );
    setIsModalOpen(false);
    setFormData({});
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h4 className="h4-heading">Property List</h4>
        <button
          onClick={() => {
            setFormData({});
            setFormErrors({});
            setMode("add");
            setIsModalOpen(true);
          }}
          className="btn btn-primary"
        >
          + Create
        </button>
      </div>

      <DynamicTable columns={columns} data={propertyData} />

      <ReusableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          mode === "edit"
            ? "Edit Property"
            : mode === "confirmDelete"
            ? "Confirm Delete"
            : "Add Property"
        }
        fields={fields}
        mode={mode}
        data={formData}
        onSave={handleSave}
        onDelete={handleDelete}
        errors={formErrors}
      />
    </div>
  );
};

export default Property;
