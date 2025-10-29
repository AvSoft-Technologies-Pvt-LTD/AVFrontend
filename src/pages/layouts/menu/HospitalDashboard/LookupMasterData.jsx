import React, { useState } from "react";
import { Plus } from "lucide-react";
import { FaEdit, FaTrash } from "react-icons/fa";
import ReusableModal from "../../../../components/microcomponents/Modal";

import DynamicTable from "../../../../components/microcomponents/DynamicTable";


const lookupFields = [
  {
    name: "type",
    label: "Lookup Type",
    type: "select",
    options: [
      { value: "Appointment Type", label: "Appointment Type", },
      { value: "Booking Status", label: "Booking Status" },
      { value: "Department", label: "Department" },
      { value: "Doctor Role", label: "Doctor Role" },
      { value: "Room Type", label: "Room Type" }
    ]
  },
  { name: "value", label: "Value", type: "text" },
  { name: "sort", label: "Sort Order", type: "number" },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "Active", label: "Active" },
      { value: "Inactive", label: "Inactive" }
    ]
  }
];

const lookupFilters = [
  {
    key: "combinedFilter",
    label: "Lookup Type",
    options: [
      { value: "Appointment Type", label: "Appointment Type" },
      { value: "Booking Status", label: "Booking Status" },
      { value: "Department", label: "Department" },
      { value: "Doctor Role", label: "Doctor Role" },
      { value: "Room Type", label: "Room Type" }
    ]
  }
];

const lookupViewFields = [
  { label: "Type", key: "type" },
  { label: "Value", key: "value" },
  { label: "Sort Order", key: "sort" },
  { label: "Status", key: "status" },
  { label: "Created Date", key: "createdDate" }
];

const initialLookups = [
  { id: 1, type: "Appointment Type", value: "Walk-in", sort: 1, status: "Active", createdDate: "2025-07-01" },
  { id: 2, type: "Appointment Type", value: "Online", sort: 2, status: "Active", createdDate: "2025-07-01" },
  { id: 3, type: "Booking Status", value: "Pending", sort: 1, status: "Active", createdDate: "2025-07-01" },
  { id: 4, type: "Booking Status", value: "Confirmed", sort: 2, status: "Active", createdDate: "2025-07-01" },
  { id: 5, type: "Booking Status", value: "Cancelled", sort: 3, status: "Inactive", createdDate: "2025-07-01" },
  { id: 6, type: "Department", value: "Cardiology", sort: 1, status: "Active", createdDate: "2025-07-01" },
  { id: 7, type: "Department", value: "Orthopedics", sort: 2, status: "Active", createdDate: "2025-07-01" },
  { id: 8, type: "Department", value: "Neurology", sort: 3, status: "Active", createdDate: "2025-07-01" },
  { id: 9, type: "Doctor Role", value: "Consultant", sort: 1, status: "Active", createdDate: "2025-07-01" },
  { id: 10, type: "Doctor Role", value: "Surgeon", sort: 2, status: "Active", createdDate: "2025-07-01" },
  { id: 11, type: "Room Type", value: "ICU", sort: 1, status: "Active", createdDate: "2025-07-01" },
  { id: 12, type: "Room Type", value: "General Ward", sort: 2, status: "Active", createdDate: "2025-07-01" }
];

const LookupMasterData = () => {
  const [lookupData, setLookupData] = useState(initialLookups);
  const [modalState, setModalState] = useState({ isOpen: false, mode: "add", data: {} });

  const openModal = (mode, data = {}) => setModalState({ isOpen: true, mode, data });
  const closeModal = () => setModalState({ isOpen: false, mode: "add", data: {} });

  const handleSave = (formData) => {
    if (modalState.mode === "add") {
      setLookupData([
        ...lookupData,
        {
          ...formData,
          id: Date.now(),
          createdDate: new Date().toISOString().split("T")[0]
        }
      ]);
    } else if (modalState.mode === "edit") {
      setLookupData(
        lookupData.map(item =>
          item.id === modalState.data.id ? { ...item, ...formData } : item
        )
      );
    }
    closeModal();
  };

  const handleDelete = () => {
    setLookupData(lookupData.filter(item => item.id !== modalState.data.id));
    closeModal();
  };

  const lookupColumns = [
    {
      header: "Type",
      accessor: "type",
      // cell: row => (
      //   <button
      //       className="text-[var(--primary-color)]  hover:text-[var(--accent-color)] underline cursor-pointer"
      //     onClick={() => openModal("viewProfile", row)}
      //   >
      //     {row.type}
      //   </button>
      // )
    },
    {
      header: "Value",
      accessor: "value",
      // cell: row => (
      //   <button
      //       className="text-[var(--primary-color)]  hover:text-[var(--accent-color)] underline cursor-pointer"
      //     onClick={() => openModal("viewProfile", row)}
      //   >
      //     {row.value}
      //   </button>
      // )
    },
    { header: "Sort", accessor: "sort" },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => {
        const key = row.status?.toLowerCase(); // "active" or "inactive"
        const statusColors = {
          active: "text-green-600 bg-green-100",
          inactive: "text-red-600 bg-red-100",
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[key] || "text-gray-600 bg-gray-100"}`}>
            {key?.toUpperCase()}
          </span>
        );
      },
    },
    { header: "Created", accessor: "createdDate" },
    {
      header: "Actions",
      accessor: "actions",
      cell: row => (
        <div className="flex gap-2">
          <button
            onClick={() => openModal("edit", row)}
            className="edit-btn hover:bg-blue-100 rounded p-1 transition hover:animate-bounce"
            title="Edit"
          >
            <FaEdit size={16} />
          </button>
          <button
            onClick={() => openModal("confirmDelete", row)}
            className="delete-btn  hover:bg-blue-100 rounded p-1 transition hover:animate-bounce"
            title="Delete"
          >
            <FaTrash size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen pt-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="h4-heading">Lookup Master Data</h1>
          <button
            onClick={() => openModal("add")}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus size={20} /> Add Lookup Value
          </button>
        </div>
        <DynamicTable columns={lookupColumns} data={lookupData} filters={lookupFilters} />
        {/* Modal rendering logic */}
        <ReusableModal
          isOpen={modalState.isOpen}
          onClose={closeModal}
          mode={modalState.mode}
          fields={lookupFields}
          data={modalState.data}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};

export default LookupMasterData;
