import React, { useState } from "react";
import Modal from "../../../../components/microcomponents/Modal";
import DynamicTable from "../../../../components/microcomponents/DynamicTable";
import { FaEdit, FaTrash } from "react-icons/fa";

const Designation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState("add");
  const [currentRow, setCurrentRow] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [rows, setRows] = useState([
    { id: 1, departmentName: "Cardiology", departmentCode: "CARD", designationName: "Senior Doctor", designationCode: "SD001" },
    { id: 2, departmentName: "Neurology", departmentCode: "NEUR", designationName: "Consultant", designationCode: "CN001" },
    { id: 3, departmentName: "Orthopedics", departmentCode: "ORTH", designationName: "Resident", designationCode: "RES001" },
    { id: 4, departmentName: "Pediatrics", departmentCode: "PEDI", designationName: "Junior Doctor", designationCode: "JD001" },
    { id: 5, departmentName: "Radiology", departmentCode: "RADI", designationName: "Technician", designationCode: "TECH001" },
  ]);

  // Fields for add/edit with readonly codes
  const combinedFields = [
    { name: "departmentName", label: "Department Name" },
    { name: "designationName", label: "Designation Name" },
    { name: "departmentCode", label: "Department Code", readonly: true },
    { name: "designationCode", label: "Designation Code", readonly: true },
  ];

  const viewFields = combinedFields.map((f, idx) => ({
    key: f.name,
    label: f.label,
    titleKey: idx === 1,      // Supplier Name
    initialsKey: idx === 1,
    subtitleKey: idx === 0    // Supplier ID
  }));

  const validate = (data) => {
    const e = {};
    if (!data.departmentName) e.departmentName = "Required";
    if (!data.designationName) e.designationName = "Required";
    return e;
  };

  const generateCodes = (data) => ({
    departmentCode: data.departmentName ? data.departmentName.substring(0, 4).toUpperCase() : "DEPT",
    designationCode: data.designationName ? data.designationName.substring(0, 2).toUpperCase() + Date.now().toString().slice(-3) : "DS" + Date.now().toString().slice(-3),
  });

  const handleSave = (data) => {
    const e = validate(data);
    if (Object.keys(e).length) return setFormErrors(e);
    const codes = generateCodes(data);
    if (mode === "add") {
      setRows((p) => [...p, { ...data, ...codes, id: Date.now() }]);
    } else {
      setRows(rows.map((r) => (r.id === currentRow.id ? { ...r, ...data, ...codes } : r)));
    }
    setFormErrors({});
    setIsOpen(false);
  };

  const handleEdit = (r) => {
    const codes = generateCodes(r);
    setCurrentRow({ ...r, ...codes });
    setMode("edit");
    setIsOpen(true);
  };

  const handleOpenDelete = (r) => { setCurrentRow(r); setMode("confirmDelete"); setIsOpen(true); };
  const handleDelete = () => { setRows(rows.filter((r) => r.id !== currentRow.id)); setIsOpen(false); };

  const handleAdd = () => {
    const initial = { departmentName: "", designationName: "" };
    const codes = generateCodes(initial);
    setCurrentRow({ ...initial, ...codes });
    setMode("add");
    setIsOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...currentRow, [name]: value };
    const codes = generateCodes(updated);
    setCurrentRow({ ...updated, ...codes });
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="h4-heading">Departments & Designations</h1>
        <button onClick={handleAdd} className="btn btn-primary">+ Create</button>
      </div>

      <DynamicTable
        columns={[
          { header: "Department Name", accessor: "departmentName", clickable: true },
          { header: "Department Code", accessor: "departmentCode" },
          { header: "Designation Name", accessor: "designationName" },
          { header: "Designation Code", accessor: "designationCode" },
          {
            header: "Actions", accessor: "actions", cell: (row) => (
              <div className="flex space-x-2">
                <button onClick={() => handleEdit(row)} className="edit-btn rounded p-1 transition  hover:animate-bounce"><FaEdit /></button>
                <button onClick={() => handleOpenDelete(row)} className="delete-btn rounded p-1 transition  hover:animate-bounce"><FaTrash /></button>
              </div>
            ),
          },
        ]}
        data={rows}
        onCellClick={(row, col) => { if (col.accessor === "departmentName") { setCurrentRow(row); setMode("viewProfile"); setIsOpen(true); } }}
      />

      <Modal
        key={mode}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        mode={mode}
        title={mode === "add" ? "Add New" : mode === "edit" ? "Edit" : mode === "viewProfile" ? " Details" : "Confirm Delete"}
        fields={mode === "viewProfile" ? viewFields : combinedFields}
        viewFields={viewFields}
        data={currentRow}
        onSave={handleSave}
        onDelete={handleDelete}
        errors={formErrors}
        saveLabel={mode === "edit" ? "Update" : "Save"}
        deleteLabel="Yes, Delete"
        cancelLabel="Cancel"
        onChange={handleInputChange}
      />
    </div>
  );
};

export default Designation;