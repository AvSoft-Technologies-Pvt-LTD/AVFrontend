

import React, { useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import DynamicTable from "../../../../components/microcomponents/DynamicTable";
import ReusableModal from "../../../../components/microcomponents/Modal";

const statusColors = {
  active: "text-green-600 bg-green-100",
  inactive: "text-red-600 bg-red-100",
};

const OrganizationInfoSettings = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [mode, setMode] = useState("add");

const [infoData, setInfoData] = useState([
  {
    id: 1,
    infoType: "CURRENCY_LABEL",
    content: "Official currency .",
    status: "Active",
  },
  {
    id: 2,
    infoType: "PATIENT_ADMISSION_GUIDELINES",
    content:
      "<ol><li>Patients must report to the admission desk with a valid referral or doctor's note.</li><li>Ensure all necessary documents, including identification and insurance papers, are submitted.</li><li>Admission is subject to room availability and medical assessment.</li></ol>",
    status: "Active",
  },
  {
    id: 3,
    infoType: "DISCHARGE_PROCEDURE",
    content:
      "<p>Discharges are processed after clearance from all departments. Final bills and prescriptions must be collected before leaving.</p>",
    status: "Active",
  },
  {
    id: 4,
    infoType: "VISITING_HOURS",
    content:
      "<ul><li>Morning Visit: 8:30 AM – 10:30 AM</li><li>Evening Visit: 3:00 PM – 5:00 PM</li><li>Only two visitors allowed per patient at a time.</li></ul>",
    status: "Active",
  },
  {
    id: 5,
    infoType: "EMERGENCY_HOTLINE",
    content:
      "<p>In case of any emergency, please contact our 24-hour helpline at <strong>09678-123456</strong>.</p>",
    status: "Active",
  },
  {
    id: 6,
    infoType: "SUPPORTED_INSURANCE_PROVIDERS",
    content:
      "<p>Our hospital accepts health plans from major providers including <strong>Guardian Health, MediPlus, SafeLife</strong>. Check coverage details during admission.</p>",
    status: "Active",
  },
  {
    id: 7,
    infoType: "AMBULANCE_AVAILABILITY",
    content:
      "<p>To request ambulance support, dial <strong>102</strong> or <strong>+880-1555-000102</strong>. Available for local and intercity transfers.</p>",
    status: "Active",
  },
  {
    id: 8,
    infoType: "GENERAL_SAFETY_GUIDELINES",
    content:
      "<ol><li>Face masks are mandatory throughout the premises.</li><li>Maintain at least 1-meter distance from others.</li><li>Report any symptoms to staff immediately.</li></ol>",
    status: "Active",
  }
]);




  const fields = [
    {
      name: "infoType",
      label: "Info Type",
      type: "select",
      options: [
        { label: "Currency Format", value: "CURRENCY_FORMAT" },
        { label: "Currency Style", value: "CURRENCY_STYLE" },
        { label: "Currency Text", value: "CURRENCY_TEXT" },
        {
          label: "Hospital Admission Rules",
          value: "HOSPITAL_ADMISSION_RULES",
        },
      ],
    },
    { name: "content", label: "Content", type: "textarea" },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { label: "Active", value: "Active" },
        { label: "Inactive", value: "Inactive" },
      ],
    },
  ];

 const columns = [
  { header: "Info Type", accessor: "infoType" },
  {
    header: "Content",
    accessor: "content",
    cell: (row) => (
      <div
        className="max-w-[500px] whitespace-pre-wrap break-words text-sm prose prose-sm"
        dangerouslySetInnerHTML={{ __html: row.content }}
      />
    ),
  },
  {
    header: "Status",
    accessor: "status",
    cell: (row) => {
      const statusKey = row.status?.toLowerCase() || "inactive";
      return (
        <span
          className={`px-2 py-1 rounded-full text-sm font-medium ${statusColors[statusKey]}`}
        >
          {row.status}
        </span>
      );
    },
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
    if (!data.infoType) errors.infoType = "Info Type is required";
    if (!data.content || data.content.trim() === "")
      errors.content = "Content is required";
    if (!data.status) errors.status = "Status is required";
    return errors;
  };

  const handleSave = (data) => {
    const errors = validateForm(data);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (mode === "edit") {
      setInfoData((prev) =>
        prev.map((item) =>
          item.id === formData.id ? { ...item, ...data } : item
        )
      );
    } else {
      setInfoData((prev) => [...prev, { ...data, id: Date.now() }]);
    }

    setIsModalOpen(false);
    setFormErrors({});
  };

  const handleDelete = () => {
    setInfoData((prev) => prev.filter((item) => item.id !== formData.id));
    setIsModalOpen(false);
    setFormData({});
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h4 className="h4-heading">Organization Info Settings</h4>
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

      <DynamicTable columns={columns} data={infoData} />

      <ReusableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          mode === "edit"
            ? "Edit Info"
            : mode === "confirmDelete"
            ? "Confirm Delete"
            : "Add Info"
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

export default OrganizationInfoSettings;
