
import React, { useState, useEffect } from "react";
import Modal from "../../../../components/microcomponents/Modal";
import DynamicTable from "../../../../components/microcomponents/DynamicTable";
import { FaEdit, FaTrash } from "react-icons/fa";

const ProductPage = () => {
  const statusColors = { active: "text-green-600 bg-green-100", inactive: "text-red-600 bg-red-100" };
  const [isOpen, setIsOpen] = useState(false);
  const [addingField, setAddingField] = useState(null);
  const [mode, setMode] = useState("add");
  const [formErrors, setFormErrors] = useState({});
   const [rows, setRows] = useState([
    { id: 1, productType: "HOSPITAL", category: " Category A", itemId: "ITM001", itemName: "Surgical Gloves", basicPrice: "200", gst: "5", salesPrice: "250", discPercent: "10", finalSalesPrice: "225", buyPrice: "180", itemType: "Disposable", unitName: "Box", numberStripBox: "", stripQuantity: "", minSalePrice: "220", sizeDesc: "Medium", avgBuyPrice: "185", expireDate: "2025-12-31", doseType: "", instruction: "Store in a cool, dry place.", description: "High quality sterile surgical gloves.", status: "active" },
    { id: 2, productType: "LAB", category: " Category B", itemId: "ITM002", itemName: "Test Tubes", basicPrice: "100", gst: "12", salesPrice: "150", discPercent: "5", finalSalesPrice: "142.5", buyPrice: "90", itemType: "Glassware", unitName: "Pack", numberStripBox: "", stripQuantity: "", minSalePrice: "140", sizeDesc: "15ml", avgBuyPrice: "95", expireDate: "", doseType: "", instruction: "Handle with care.", description: "Durable test tubes for laboratory use.", status: "active" },
    { id: 3, productType: "PHARMA", category: " Category C", itemId: "ITM003", itemName: "Paracetamol Tablets", basicPrice: "50", gst: "5", salesPrice: "80", discPercent: "0", finalSalesPrice: "80", buyPrice: "45", itemType: "Tablet", unitName: "Strip", numberStripBox: "10", stripQuantity: "15", minSalePrice: "75", sizeDesc: "500mg", avgBuyPrice: "47", expireDate: "2026-06-30", doseType: "Oral", instruction: "Take after food.", description: "Paracetamol 500mg tablets.", status: "active" },
    { id: 4, productType: "SURGICAL", category: " Category A", itemId: "ITM004", itemName: "Sterile Syringes", basicPrice: "15", gst: "5", salesPrice: "20", discPercent: "0", finalSalesPrice: "20", buyPrice: "12", itemType: "Disposable", unitName: "Piece", numberStripBox: "", stripQuantity: "", minSalePrice: "18", sizeDesc: "5ml", avgBuyPrice: "13", expireDate: "2027-03-31", doseType: "", instruction: "Use once only.", description: "Single-use sterile syringes.", status: "active" },
    { id: 5, productType: "IMAGING", category: "Category D", itemId: "ITM005", itemName: "X-Ray Film", basicPrice: "300", gst: "18", salesPrice: "400", discPercent: "5", finalSalesPrice: "380", buyPrice: "280", itemType: "Consumable", unitName: "Pack", numberStripBox: "", stripQuantity: "", minSalePrice: "370", sizeDesc: "12x15 inches", avgBuyPrice: "290", expireDate: "2026-09-30", doseType: "", instruction: "Store flat, away from light.", description: "High-quality X-ray films for radiology.", status: "inactive" }
  ]);
  const [currentRow, setCurrentRow] = useState(null);
  const [reopenProductForm, setReopenProductForm] = useState(false);
const [productFields, setProductFields] = useState([
  { name: "productType", label: "Product Type", type: "select", options: [
    { label: "BED", value: "BED" }, { label: "CONSUMABLE", value: "CONSUMABLE" }, { label: "LAB", value: "LAB" }, { label: "PHARMA", value: "PHARMA" },
    { label: "DOCTOR", value: "DOCTOR" }, { label: "HOSPITAL", value: "HOSPITAL" }, { label: "SURGICAL", value: "SURGICAL" }, { label: "IMAGING", value: "IMAGING" },
    { label: "NURSING", value: "NURSING" }, { label: "EQUIPMENT", value: "EQUIPMENT" }, { label: "SUPPLIES", value: "SUPPLIES" },
    { label: "MEDICAL DEVICE", value: "MEDICAL DEVICE" }, { label: "OT EQUIPMENT", value: "OT EQUIPMENT" }, { label: "ICU", value: "ICU" }, { label: "WARD", value: "WARD" }
  ]},
  { name: "category", label: "Category", type: "select", options: [{ label: "A", value: "A" }, { label: "B", value: "B" }],
    extraNode: (<button onClick={() => { setAddingField("category"); setCurrentRow({}); setMode("add"); setIsOpen(true); }} className="text-xs text-blue-600 underline">+ Add New Category</button>) },
  { name: "itemId", label: "Item ID" }, { name: "itemName", label: "Item Name" }, { name: "basicPrice", label: "Basic Price" }, { name: "gst", label: "GST/VAT %" },
  { name: "salesPrice", label: "Sales Price" }, { name: "discPercent", label: "Disc %" }, { name: "finalSalesPrice", label: "Final Sales Price" }, { name: "buyPrice", label: "Buy Price" },
  { name: "itemType", label: "Item Type", type: "select", options: [{ label: "Tablet", value: "Tablet" }, { label: "Syringe", value: "Syringe" }],
    extraNode: (<button onClick={() => { setAddingField("itemType"); setCurrentRow({}); setMode("add"); setIsOpen(true); }} className="text-xs text-blue-600 underline">+ Add New Item Type</button>) },
  { name: "unitName", label: "Unit Name" }, { name: "numberStripBox", label: "Number Strip Box" }, { name: "stripQuantity", label: "Strip Quantity" },
  { name: "minSalePrice", label: "Min Sale Price" }, { name: "sizeDesc", label: "Size-Desc/Degree" }, { name: "avgBuyPrice", label: "Avg Buy Price" },
  { name: "expireDate", label: "Expire Date", type: "date" }, { name: "doseType", label: "Dose/Sample Type" }, { name: "instruction", label: "Instruction" },
  { name: "description", label: "Description" }, { name: "status", label: "Status", type: "select", options: [{ label: "Active", value: "active" }, { label: "Inactive", value: "inactive" }] }
]);
  useEffect(() => { if (!isOpen && reopenProductForm) { setIsOpen(true); setReopenProductForm(false); } }, [isOpen, reopenProductForm]);

  // const validateProduct = d => {
  //   const e = {}; if (!d.productType) e.productType = "Required."; if (!d.category) e.category = "Required.";
  //   if (!d.itemId) e.itemId = "Required."; if (!d.itemName) e.itemName = "Required."; if (!d.salesPrice) e.salesPrice = "Required."; if (!d.status) e.status = "Required.";
  //   ["basicPrice", "salesPrice"].forEach(f => { if (d[f] && isNaN(Number(d[f]))) e[f] = `${f} must be number.`; }); return e;
  // };

  const handleSave = (d) => {
    if (addingField) {
      const v = d[addingField]?.trim(); if (!v) return alert("Name required");
      setProductFields(f => f.map(field => field.name === addingField ? { ...field, options: [...(field.options || []), { label: v, value: v }] } : field));
      setIsOpen(false); setAddingField(null); setMode("add"); setCurrentRow({}); setFormErrors({}); setReopenProductForm(true); return;
    }
    const e = validateProduct(d); if (Object.keys(e).length) return setFormErrors(e);
    if (mode === "add") setRows(p => [...p, { ...d, id: Date.now() }]);
    else if (mode === "edit") setRows(p => p.map(r => r.id === currentRow.id ? { ...r, ...d } : r));
    setFormErrors({}); setIsOpen(false);
  };

  const handleEdit = r => { setCurrentRow(r); setMode("edit"); setIsOpen(true); };
  const handleOpenDelete = r => { setCurrentRow(r); setMode("confirmDelete"); setIsOpen(true); };
  const handleDelete = () => { if (currentRow) setRows(p => p.filter(r => r.id !== currentRow.id)); setCurrentRow(null); };
  const handleView = r => { setCurrentRow(r); setMode("viewProfile"); setIsOpen(true); };

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between mb-4"><h1 className="h4-heading">Product List</h1>
        <button onClick={() => { setMode("add"); setCurrentRow(null); setIsOpen(true); }} className="btn btn-primary">+ Create</button>
      </div>
      <DynamicTable
        columns={[
          { header: "Product Type", accessor: "productType", clickable: true },
          { header: "Item ID", accessor: "itemId" }, { header: "Item Name", accessor: "itemName" },
          { header: "Sales Price", accessor: "salesPrice" }, { header: "Basic Price", accessor: "basicPrice" },
          {
            header: "Status", accessor: "status",
            cell: row => (<span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[row.status] || "bg-gray-100"}`}>{row.status?.toUpperCase()}</span>)
          },
          {
            header: "Actions", accessor: "actions",
            cell: row => (<div className="flex space-x-2">
                 <button onClick={() => handleEdit(row)} className="edit-btn rounded p-1 transition  hover:animate-bounce"><FaEdit /></button>
                 <button onClick={() => handleOpenDelete(row)} className="delete-btn rounded p-1 transition  hover:animate-bounce"><FaTrash /></button>
               </div>)
          }
        ]}
        data={rows}
        filters={[{ key: "combinedFilter", options: productFields.filter(f => f.type === "select").flatMap(f => f.options) }]}
        onCellClick={(r, c) => { if (c.accessor === "productType") handleView(r); }}
      />
      <Modal
        key={mode + addingField}
        isOpen={isOpen}
        onClose={() => { setIsOpen(false); setAddingField(null); }}
        mode={mode}
        title={addingField ? `Add New ${addingField}` : mode === "add" ? "Add Product" : mode === "edit" ? "Edit Product" : mode === "viewProfile" ? "Product Details" : "Confirm Delete"}
        fields={addingField ? [{ name: addingField, label: `New ${addingField}` }] : productFields}
        viewFields={productFields.map((f, i) => ({ key: f.name, label: f.label, titleKey: i === 0, initialsKey: i === 0, subtitleKey: i === 1 }))}
        data={currentRow}
        onSave={handleSave} onDelete={handleDelete}
        saveLabel={mode === "edit" ? "Update" : "Save"}
        deleteLabel="Yes, Delete" cancelLabel="Cancel"
        errors={formErrors}
      />
    </div>
  );
};
export default ProductPage;
