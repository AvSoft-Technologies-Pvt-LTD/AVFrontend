


import React, { useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import DynamicTable from "../../../../components/microcomponents/DynamicTable";
import ReusableModal from "../../../../components/microcomponents/Modal";
import logo from "../../../../assets/AV.png";


const statusColors = {
  active: "text-green-600 bg-green-100",
  inactive: "text-red-600 bg-red-100",
};

const OrganizationLogo = () => {
  const [data, setData] = useState([
  {
    id: 1,
    orgName: "Robi Corporate Hospital System",
    shortName: "-",
    contactInfo: "12345678444",
    address:
      "58/10, 5th floor, Free School Street, Panthapath, Kalabagan, Dhaka, Dhaka 1205",
    businessNature: "Healthcare",
    isActive: "active",
    picture: logo, // assigned imported logo image
    orgType: "Hospital",
  },
  {
    id: 2,
    orgName: "Apollo Clinic Services",
    shortName: "Apollo",
    contactInfo: "9876543210",
    address: "Plot 23, Sector 18, Noida, Uttar Pradesh, 201301",
    businessNature: "Healthcare",
    isActive: "active",
    picture:
      "https://upload.wikimedia.org/wikipedia/en/4/4e/Apollo_Hospitals_Logo.png",
    orgType: "Clinic",
  },
  {
    id: 3,
    orgName: "Green Life Hospital",
    shortName: "GLH",
    contactInfo: "8801777777777",
    address: "32 Green Road, Dhanmondi, Dhaka 1205",
    businessNature: "Healthcare",
    isActive: "inactive",
    picture:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Robi_Axiata_Limited_Logo.svg/512px-Robi_Axiata_Limited_Logo.svg.png",
    orgType: "Hospital",
  },
]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("viewProfile");
  const [selectedOrg, setSelectedOrg] = useState(null);

  const columns = [
    {
      header: "Logo",
      accessor: "picture",
      cell: (row) => (
        <img
          src={row.picture}
          alt="logo"
          className="h-10 object-contain rounded"
        />
      ),
    },
    {
      header: "Organization Name",
      accessor: "orgName",
      clickable: true,
    },
    { header: "Contact", accessor: "contactInfo" },
    {
      header: "Status",
      accessor: "isActive",
      cell: (row) => {
        const statusLabel = row.isActive === "active" ? "Active" : "Inactive";
        const statusClass =
          row.isActive === "active" ? statusColors.active : statusColors.inactive;
        return (
          <span
            className={`px-2 py-1 rounded-full text-sm font-medium ${statusClass}`}
          >
            {statusLabel}
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
            className="edit-btn flex items-center justify-center hover:bg-[--primary-color]/10 rounded p-1 transition"
            onClick={() => {
              setSelectedOrg(row);
              setModalMode("edit");
              setModalOpen(true);
            }}
            title="Edit"
          >
            <FaEdit className="text-[--primary-color]" />
          </button>
          <button
            onClick={() => {
              setSelectedOrg(row);
              setModalMode("confirmDelete");
              setModalOpen(true);
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

  const viewFields = [
    { key: "orgName", label: "Organization Name", titleKey: true, initialsKey: true },
    { key: "orgType", label: "Type", subtitleKey: true },
    { key: "shortName", label: "Short Name" },
    { key: "businessNature", label: "Business Nature" },
    { key: "contactInfo", label: "Contact Info" },
    { key: "address", label: "Address" },
    {
      key: "isActive",
      label: "Status",
      render: (value) => (value === "Y" ? "Active" : "Inactive"),
    },
  ];

  const fields = [
    { name: "orgName", label: "Organization Name", type: "text" },
    { name: "shortName", label: "Short Name", type: "text" },
    { name: "orgType", label: "Type", type: "text" },
    { name: "businessNature", label: "Business Nature", type: "text" },
    { name: "contactInfo", label: "Contact", type: "text" },
    { name: "address", label: "Address", type: "textarea" },
    {
      name: "isActive",
      label: "Status",
      type: "select",
      options: [
        { value: "Y", label: "Active" },
        { value: "N", label: "Inactive" },
      ],
    },
    {
      name: "picture",
      label: "Logo",
      type: "file",
      multiple: false,
    },
  ];

  const handleCellClick = (row, col) => {
    if (col.accessor === "orgName") {
      setSelectedOrg(row);
      setModalMode("viewProfile");
      setModalOpen(true);
    }
  };

  const handleSave = (formValues) => {
    const updated = { ...formValues };

    // If picture is a file, convert to object URL
    if (updated.picture && typeof updated.picture === "object") {
      updated.picture = URL.createObjectURL(updated.picture);
    }

    if (modalMode === "edit") {
      setData((prev) =>
        prev.map((item) =>
          item.id === selectedOrg.id ? { ...item, ...updated } : item
        )
      );
    }

    setModalOpen(false);
    setSelectedOrg(null);
  };

  const handleDelete = () => {
    if (selectedOrg) {
      setData((prev) => prev.filter((org) => org.id !== selectedOrg.id));
      setSelectedOrg(null);
      setModalOpen(false);
    }
  };

  return (
    <div className="p-4">
      <h4 className="h4-heading mb-4">Organization Logo Setting</h4>

      <DynamicTable
        columns={columns}
        data={data}
        onCellClick={handleCellClick}
      />

      <ReusableModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        title={
          modalMode === "edit"
            ? "Edit Organization"
            : modalMode === "confirmDelete"
            ? "Confirm Delete"
            : "Organization Details"
        }
        data={selectedOrg}
        viewFields={viewFields}
        fields={fields}
        onSave={handleSave}
        onDelete={handleDelete}
        size="md"
      />
    </div>
  );
};

export default OrganizationLogo;
