

import React, { useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import DynamicTable from "../../../../components/microcomponents/DynamicTable";
import ReusableModal from "../../../../components/microcomponents/Modal";

const statusColors = {
  Active: "text-green-600 bg-green-100",
 Inactive: "text-red-600 bg-red-100",
};

const AccountHeadMapping = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [mode, setMode] = useState("add");

 const [mappingData, setMappingData] = useState([
  {
    id: 1,
    paramName: "TRD_AF_ASSET",
    description: "Assets",
    status: "Active",
    accountHead: "Asset (1000)",
    tag: "Accounts",
  },
  {
    id: 2,
    paramName: "CONSULTANT_BILL",
    description: "Consultant Fees",
    status: "Inactive",
    accountHead: "Consultant Bill (3105)",
    tag: "Hospital",
  },
  {
    id: 3,
    paramName: "TRD_AF_LIABILITY",
    description: "Liabilities",
    status: "Active",
    accountHead: "Liability (2000)",
    tag: "Accounts",
  },
  {
    id: 4,
    paramName: "PHARMACY_SALES",
    description: "Pharmacy Sales",
    status: "Active",
    accountHead: "Sales (4100)",
    tag: "Pharmacy",
  },
  {
    id: 5,
    paramName: "LAB_TEST_FEES",
    description: "Laboratory Test Fees",
    status: "Inactive",
    accountHead: "Lab Income (3200)",
    tag: "Lab",
  },
  {
    id: 6,
    paramName: "IPD_SERVICE",
    description: "IPD Service Charges",
    status: "Active",
    accountHead: "IPD Income (3300)",
    tag: "Hospital",
  },
  {
    id: 7,
    paramName: "OPD_SERVICE",
    description: "OPD Service Charges",
    status: "Active",
    accountHead: "OPD Income (3400)",
    tag: "Hospital",
  },
  {
    id: 8,
    paramName: "ADMIN_EXPENSE",
    description: "Administrative Expenses",
    status: "Inactive",
    accountHead: "Expenses (5100)",
    tag: "Accounts",
  }
]);


  const fields = [
    {
      name: "paramName",
      label: "Parameter Name",
      type: "select",
      options: [
        "TRD_AF_CASH", "TRD_AF_SALE", "TRD_AF_PURCHASE", "TRD_AF_ASSET", "TRD_AF_INCOME",
        "TRD_AF_EXPENSE", "TRD_AF_LIABILITY", "TRD_AR_CHEQUE", "TRD_AF_CARD", "TRD_AF_SALES_COMMISSION",
        "SALARY_ACCOUNT_FROM", "SALARY_ACCOUNT_TO", "LAB_BILL_HEAD", "LAB_PAID_HEAD",
        "HOS_BILL_HEAD", "HOS_PAID_HEAD", "PHARMA_BILL_HEAD", "PHARMA_PAID_HEAD",
        "IPM_BILL_HEAD", "IPM_PAID_HEAD"
      ].map(v => ({ value: v, label: v })),
    },
    { name: "description", label: "Description" },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: ["Active", "X"].map(v => ({ value: v, label: v })),
    },
    {
      name: "accountHead",
      label: "Account Head Name",
      type: "select",
      options: [
        { value: "Asset (1000)", label: "Asset (1000)" },
        { value: "Cash in Hand (1001)", label: "-- Cash in Hand (1001)" },
        { value: "Consultant Bill (3105)", label: "-- Consultant Bill (3105)" },
        { value: "Product Purchase (4101)", label: "-- Product Purchase (4101)" },
        { value: "Lab Collection (1303)", label: "----- Lab Collection (1303)" },
        { value: "Liability (2000)", label: "Liability (2000)" },
      ],
    },
    { name: "tag", label: "Tag" },
  ];

  const columns = [
    { header: "Parameter Name", accessor: "paramName" },
    { header: "Description", accessor: "description" },
   
    { header: "Account Head Name", accessor: "accountHead" },
    { header: "Tag", accessor: "tag" }, {
      header: "Status",
      accessor: "status",
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[row.status] || "bg-gray-200 text-gray-700"
            }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: "actions",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setFormData(row);
              setFormErrors({});
              setMode("edit");
              setIsModalOpen(true);
            }}
            className="edit-btn flex items-center justify-center hover:bg-[--primary-color]/10 rounded p-1 transition"
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
          >
            <FaTrash className="text-red-500"/>
          </button>
        </div>
      ),
    },
  ];

  const validateForm = (data) => {
    const errors = {};
    if (!data.paramName) errors.paramName = "Parameter Name is required";
    if (!data.description) errors.description = "Description is required";
    if (!data.status) errors.status = "Status is required";
    if (!data.accountHead) errors.accountHead = "Account Head is required";
    if (!data.tag) errors.tag = "Tag is required";
    return errors;
  };

  const handleSave = (data) => {
    const errors = validateForm(data);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (mode === "edit") {
      setMappingData((prev) =>
        prev.map((item) =>
          item.id === formData.id ? { ...item, ...data } : item
        )
      );
    } else {
      setMappingData((prev) => [...prev, { ...data, id: Date.now() }]);
    }

    setIsModalOpen(false);
    setFormErrors({});
  };

  const handleDelete = () => {
    setMappingData((prev) => prev.filter((item) => item.id !== formData.id));
    setIsModalOpen(false);
    setFormData({});
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h4 className="h4-heading">Account Head Setting</h4>
        <button
          onClick={() => {
            setFormData({});
            setFormErrors({});
            setMode("add");
            setIsModalOpen(true);
          }}
          className="btn btn-primary"
        >
          + Add
        </button>
      </div>

      <DynamicTable columns={columns} data={mappingData} />

      <ReusableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          mode === "edit"
            ? "Edit Mapping"
            : mode === "confirmDelete"
            ? "Confirm Delete"
            : "Add Mapping"
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

export default AccountHeadMapping;
