import React, { useState } from "react";
import Modal from "../../../../components/microcomponents/Modal";
import DynamicTable from "../../../../components/microcomponents/DynamicTable";
import { FaEdit, FaTrash } from "react-icons/fa";

const SupplierPage = () => {
  const statusColors = { active: "text-green-600 bg-green-100", inactive: "text-red-600 bg-red-100" };
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState("add");
  const [formErrors, setFormErrors] = useState({});
  const [currentRow, setCurrentRow] = useState(null);
  const [rows, setRows] = useState([
    { id: 1, supplierId: "SUP001", supplierName: "ABC Suppliers", address: "123 Main St", contactNo: "9876543210", email: "abc@example.com", contactPerson: "John Doe", status: "active", bankAccountNo: "1234567890" },
    { id: 2, supplierId: "SUP002", supplierName: "XYZ Traders", address: "456 Market Rd", contactNo: "9123456780", email: "xyz@example.com", contactPerson: "Jane Smith", status: "inactive", bankAccountNo: "9876543210" }
  ]);

  const supplierFields = [
    { name: "supplierId", label: "Supplier ID" },
    { name: "supplierName", label: "Supplier Name" },
    { name: "address", label: "Address" },
    { name: "contactNo", label: "Contact No" },
    { name: "email", label: "Email" },
    { name: "contactPerson", label: "Contact Person" },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" }
      ]
    },
    { name: "bankAccountNo", label: "Bank Account No" }
  ];

  const filterSupplier = [{
    key: "combinedFilter",
    options: supplierFields
      .filter(f => f.type === "select")
      .flatMap(f => f.options?.map(opt => ({ value: opt.value, label: opt.label })) || [])
  }];

 const viewFields = supplierFields.map((f, idx) => ({
  key: f.name,
  label: f.label,
  titleKey: idx === 1,      // Supplier Name
  initialsKey: idx === 1,
  subtitleKey: idx === 0    // Supplier ID
}));

  const validateSupplier = (data) => {
    const errors = {};
    if (!data.supplierId) errors.supplierId = "Supplier ID is required.";
    if (!data.supplierName) errors.supplierName = "Supplier Name is required.";
    if (!data.status) errors.status = "Status is required.";
    return errors;
  };

  const handleSave = (data) => {
    const errors = validateSupplier(data);
    if (Object.keys(errors).length) return setFormErrors(errors);
    if (mode === "add") setRows(prev => [...prev, { ...data, id: Date.now() }]);
    else if (mode === "edit" && currentRow) setRows(prev => prev.map(row => row.id === currentRow.id ? { ...row, ...data } : row));
    setFormErrors({}); setIsOpen(false);
  };

  const handleEdit = (row) => { setCurrentRow(row); setMode("edit"); setIsOpen(true); };
  const handleOpenDelete = (row) => { setCurrentRow(row); setMode("confirmDelete"); setIsOpen(true); };
  const handleDelete = () => { if (currentRow) setRows(prev => prev.filter(row => row.id !== currentRow.id)); setCurrentRow(null); };
  const handleView = (row) => { setCurrentRow(row); setMode("viewProfile"); setIsOpen(true); };

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="h4-heading">Supplier List</h1>
        <button onClick={() => { setMode("add"); setCurrentRow(null); setIsOpen(true); }} className="btn btn-primary">+ Create</button>
      </div>

      <DynamicTable
        columns={[
          { header: "Supplier ID", accessor: "supplierId", clickable: true },
          { header: "Supplier Name", accessor: "supplierName" },
          { header: "Contact No", accessor: "contactNo" },
          {
            header: "Status", accessor: "status",
            cell: row => (
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[row.status] || "text-gray-600 bg-gray-100"}`}>
                {row.status?.toUpperCase()}
              </span>
            )
          },
          {
            header: "Actions", accessor: "actions",
            cell: row => (
              <div className="flex space-x-2">
                <button onClick={() => handleEdit(row)} className="edit-btn rounded p-1 transition  hover:animate-bounce"><FaEdit /></button>
                <button onClick={() => handleOpenDelete(row)} className="delete-btn rounded p-1 transition  hover:animate-bounce"><FaTrash /></button>
              </div>
            )
          }
        ]}
        data={rows}
        filters={filterSupplier}
        onCellClick={(row, col) => { if (col.accessor === "supplierId") handleView(row); }}
      />

      <Modal
        key={mode}
        isOpen={isOpen}
        onClose={() => { setIsOpen(false); }}
        mode={mode}
        title={mode === "add" ? "Add New Supplier" : mode === "edit" ? "Edit Supplier" : mode === "viewProfile" ? "Supplier Details" : "Confirm Delete"}
        fields={supplierFields}
        viewFields={viewFields}
        data={currentRow}
        onSave={handleSave}
        onDelete={handleDelete}
        saveLabel={mode === "edit" ? "Update" : "Save"}
        deleteLabel="Yes, Delete"
        cancelLabel="Cancel"
        errors={formErrors}
      />
    </div>
  );
};

export default SupplierPage;
