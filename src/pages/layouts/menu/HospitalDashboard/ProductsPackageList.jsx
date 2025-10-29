import React, { useState } from "react";
import Modal from "../../../../components/microcomponents/Modal";
import DynamicTable from "../../../../components/microcomponents/DynamicTable";
import { FaEdit, FaTrash } from "react-icons/fa";

const PackageProductPage = () => {
  const statusColors = {
    active: "text-green-600 bg-green-100",
    inactive: "text-red-600 bg-red-100",
  };

  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState("add");
  const [formErrors, setFormErrors] = useState({});
  const [rows, setRows] = useState([
    {
      id: 1,
      packageProduct: "Blood Test Package",
      product: "Paracetamol Tablets - PHARMA -",
      productQuantity: "2",
      remark: "For fever",
      status: "active",
    },
    {
      id: 2,
      packageProduct: "Blood Test Package",
      product: "Surgical Gloves - SURGICAL -",
      productQuantity: "1",
      remark: "Disposable",
      status: "inactive",
    },
    {
      id: 3,
      packageProduct: "General Ward Care",
      product: "General Bed - BED -",
      productQuantity: "5",
      remark: "Shared ward",
      status: "active",
    },
  ]);
  const [currentRow, setCurrentRow] = useState(null);

  // ✅ FIXED: No spaces in keys
  const productPackageFields = [
    {
      name: "packageProduct",
      label: "Package Product",
      type: "select",
      options: [
        { label: "General Bed", value: "General Bed" },
        { label: "Tb. Napa Extra", value: "Tb. Napa Extra" },
        { label: "Doctor Visit Fee", value: "Doctor Visit Fee" },
        { label: "Histopathology Medium Sample (51gm - 100gm)", value: "Histopathology Medium Sample (51gm - 100gm)" },
        { label: "Medicine", value: "Medicine" },
        { label: "Alprazolam", value: "Alprazolam" },
        { label: "Paracetamol Tablets", value: "Paracetamol Tablets" },
        { label: "Sterile Syringes", value: "Sterile Syringes" },
        { label: "X-Ray Film", value: "X-Ray Film" },
        { label: "Test Tubes", value: "Test Tubes" },
        { label: "Surgical Gloves", value: "Surgical Gloves" },
        { label: "Insulin Injection", value: "Insulin Injection" },
        { label: "Blood Test Package", value: "Blood Test Package" },
        { label: "ICU Bed", value: "ICU Bed" },
        { label: "Ultrasound Scan", value: "Ultrasound Scan" },
        { label: "Ward Bed", value: "Ward Bed" },
        { label: "Surgery Fees", value: "Surgery Fees" },
        { label: "Consultation Fee", value: "Consultation Fee" },
        { label: "Nursing Charges", value: "Nursing Charges" },
      ],
    },
    {
      name: "product",
      label: "Product",
      type: "select",
      options: [
        { label: "sadfa - OPERATION -", value: "sadfa - OPERATION -" },
        { label: "General Bed - BED -", value: "General Bed - BED -" },
        { label: "Doctor Visit Fee - HOS -", value: "Doctor Visit Fee - HOS -" },
        { label: "Tb. Napa Extra - PHARMA -", value: "Tb. Napa Extra - PHARMA -" },
        { label: "Histopathology Medium Sample (51gm -100gm) - LAB Hematology -", value: "Histopathology Medium Sample (51gm -100gm) - LAB Hematology -" },
        { label: "Consultation Fee - CONSULTANT -", value: "Consultation Fee - CONSULTANT -" },
        { label: "Medicine - CONSULTANT -", value: "Medicine - CONSULTANT -" },
      ],
    },
    { name: "productQuantity", label: "Product Quantity" },
    { name: "remark", label: "Remark" },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ],
    },
  ];
const viewFields = productPackageFields.map((f, idx) => ({
  key: f.name,
  label: f.label,
  titleKey: idx === 0,     
  initialsKey: idx === 0,
  subtitleKey: idx === 1,  
}));
  const validateProduct = (d) => {
    const e = {};
    if (!d.product) e.product = "Product is required.";
    if (!d.productQuantity) e.productQuantity = "Quantity is required.";
    if (!d.status) e.status = "Status is required.";
    if (d.productQuantity && isNaN(Number(d.productQuantity)))
      e.productQuantity = "Quantity must be a number.";
    return e;
  };

  const handleSave = (d) => {
  const e = validateProduct(d);
  if (Object.keys(e).length) return setFormErrors(e);

  const cleanedData = { ...d };
  ["packageProduct", "product", "status"].forEach(key => {
    if (cleanedData[key]) cleanedData[key] = cleanedData[key].trim();
  });

  setRows((p) =>
    mode === "add"
      ? [...p, { ...cleanedData, id: Date.now() }]
      : p.map((r) => (r.id === currentRow.id ? { ...r, ...cleanedData } : r))
  );

  setFormErrors({});
  setIsOpen(false);
};

  const handleEdit = (r) => {
    setCurrentRow(r);
    setMode("edit");
    setIsOpen(true);
  };

  const handleOpenDelete = (r) => {
    setCurrentRow(r);
    setMode("confirmDelete");
    setIsOpen(true);
  };

  const handleDelete = () => {
    setRows((p) => p.filter((r) => r.id !== currentRow.id));
    setCurrentRow(null);
    setIsOpen(false);
  };

  const handleView = (r) => {
    setCurrentRow(r);
    setMode("viewProfile");
    setIsOpen(true);
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between mb-4">
        <h1 className="h4-heading">Package Product List</h1>
        <button
          onClick={() => {
            setMode("add");
            setCurrentRow(null);
            setIsOpen(true);
          }}
          className="btn btn-primary"
        >
          + Add Product
        </button>
      </div>

      <DynamicTable
        columns={[
          { header: "Package Product", accessor: "packageProduct", clickable: true },
          { header: "Product", accessor: "product" },
          { header: "Quantity", accessor: "productQuantity" },
          { header: "Remark", accessor: "remark" },
          {
            header: "Status",
            accessor: "status",
            cell: (r) => {
              const k = r.status?.toLowerCase();
              return (
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    statusColors[k] || "text-gray-600 bg-gray-100"
                  }`}
                >
                  {k?.toUpperCase()}
                </span>
              );
            },
          },
          {
            header: "Actions",
            accessor: "actions",
            cell: (r) => (
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(r)}
                  className="edit-btn rounded p-1 transition  hover:animate-bounce"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleOpenDelete(r)}
                  className="delete-btn rounded p-1 transition  hover:animate-bounce"
                >
                  <FaTrash />
                </button>
              </div>
            ),
          },
        ]}
        data={rows}
        filters={[
          {
            key: "combinedFilter",
            options: productPackageFields
              .filter((f) => f.type === "select")
              .flatMap((f) => f.options),
          },
        ]}
        onCellClick={(row, col) =>
          col.accessor === "packageProduct" && handleView(row)
        }
      />

      <Modal
        key={mode}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        mode={mode}
        title={
          mode === "add"
            ? "Add Package Product"
            : mode === "edit"
            ? "Edit Package Product"
            : mode === "viewProfile"
            ? "Product Details"
            : "Confirm Delete"
        }
        fields={productPackageFields}
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

export default PackageProductPage;
