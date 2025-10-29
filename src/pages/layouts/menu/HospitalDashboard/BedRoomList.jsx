
import React, { useState } from "react";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import DynamicTable from "../../../../components/microcomponents/DynamicTable";
import ReusableModal from "../../../../components/microcomponents/Modal";
import { useNavigate } from "react-router-dom";

const statusColors = {
  Active: "text-green-600 bg-green-100",
  Inactive: "text-red-600 bg-red-100",
};
const BedRoomList = () => {
  const navigate = useNavigate(); 

 const [bedroomData, setBedroomData] = useState([
  { id: 1, bedNo: "101", categoryName: "General Ward", floor: "1st Floor", bookingStatus: "Booked", status: "Active", currentPatient: "Sanjay", productName: "1001 General Bed", salePrice: 300 },
  { id: 2, bedNo: "102", categoryName: "ICU", floor: "1st Floor", bookingStatus: "Pre-Booked", status: "Inactive", currentPatient: "Trupti", productName: "Bariatric", salePrice: 400 },
  { id: 3, bedNo: "103", categoryName: "General Ward", floor: "2nd Floor", bookingStatus: "Available", status: "Active", currentPatient: "", productName: "1002 Semi-Fowler", salePrice: 250 },
  { id: 4, bedNo: "104", categoryName: "ICU", floor: "2nd Floor", bookingStatus: "Booked", status: "Active", currentPatient: "Meena", productName: "1007 ICU Bed", salePrice: 500 },
  { id: 5, bedNo: "105", categoryName: "Private", floor: "3rd Floor", bookingStatus: "Available", status: "Inactive", currentPatient: "Vaishnavi", productName: "1010 Private Deluxe", salePrice: 600 },
  { id: 6, bedNo: "106", categoryName: "General Ward", floor: "3rd Floor", bookingStatus: "Pre-Booked", status: "Active", currentPatient: "Ravi", productName: "1003 General Bed Plus", salePrice: 320 },
  { id: 7, bedNo: "107", categoryName: "ICU", floor: "1st Floor", bookingStatus: "Booked", status: "Inactive", currentPatient: "Anita", productName: "1008 Pediatric ICU", salePrice: 550 },
  { id: 8, bedNo: "108", categoryName: "Private", floor: "2nd Floor", bookingStatus: "Available", status: "Active", currentPatient: "Roshani", productName: "1011 Suite Room", salePrice: 800 },

  // Additional 8 from previous list
  { id: 9, bedNo: "109", categoryName: "Private Room", floor: "2nd Floor", bookingStatus: "Available", status: "Active", currentPatient: "", productName: "1012 Premium Private", salePrice: 750 },
  { id: 10, bedNo: "110", categoryName: "Semi-Private", floor: "2nd Floor", bookingStatus: "Booked", status: "Active", currentPatient: "Raj", productName: "1013 Twin Sharing", salePrice: 450 },
  { id: 11, bedNo: "111", categoryName: "Deluxe Suite", floor: "3rd Floor", bookingStatus: "Available", status: "Inactive", currentPatient: "", productName: "1014 Deluxe Suite", salePrice: 900 },
  { id: 12, bedNo: "112", categoryName: "ICU", floor: "3rd Floor", bookingStatus: "Pre-Booked", status: "Active", currentPatient: "Sheetal", productName: "1009 Advanced ICU", salePrice: 520 },
  { id: 13, bedNo: "113", categoryName: "Private Room", floor: "1st Floor", bookingStatus: "Booked", status: "Inactive", currentPatient: "Sameer", productName: "1015 Private Comfort", salePrice: 700 },
  { id: 14, bedNo: "114", categoryName: "General Ward", floor: "2nd Floor", bookingStatus: "Available", status: "Active", currentPatient: "", productName: "1004 General Light", salePrice: 260 },
  { id: 15, bedNo: "115", categoryName: "Semi-Private", floor: "2nd Floor", bookingStatus: "Available", status: "Active", currentPatient: "", productName: "1016 Semi-Private Plus", salePrice: 470 },
  { id: 16, bedNo: "116", categoryName: "Deluxe Suite", floor: "2nd Floor", bookingStatus: "Available", status: "Active", currentPatient: "", productName: "1017 Executive Suite", salePrice: 950 },
]);


  const [categoryOptions, setCategoryOptions] = useState([
    { label: "General Ward", value: "General Ward" },
    { label: "ICU", value: "ICU" },
    { label: "Private Room", value: "Private Room" },
  ]);

  const [floorOptions, setFloorOptions] = useState([
    { label: "1st Floor", value: "1st Floor" },
    { label: "2nd Floor", value: "2nd Floor" },
  ]);

  const productOptions = [
    { label: "1001 General Bed (300)", value: "1001 General Bed" },
    { label: "1006 Bariatric (400)", value: "1006 Bariatric" },
    { label: "201 Ac Cabin (1500)", value: "201 Ac Cabin" },
    { label: "Non Ac Cabin (1000)", value: "Non Ac Cabin" },
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedData, setSelectedData] = useState({});
  const [inlineModalOpen, setInlineModalOpen] = useState(false);
  const [inlineModalMode, setInlineModalMode] = useState("");
  const [inlineModalData, setInlineModalData] = useState({});

  const openInlineModal = (type) => {
    setInlineModalMode(type);
    setInlineModalData({ name: "", floorType: "", value: "", status: "Active" });
    setInlineModalOpen(true);
  };

  const handleInlineSave = (data) => {
    const name = data.name?.trim();
    if (inlineModalMode === "category") {
      if (!name) return;
      const newOption = { label: name, value: name };
      if (!categoryOptions.some((opt) => opt.value === name)) {
        setCategoryOptions((prev) => [...prev, newOption]);
        setSelectedData((prev) => ({ ...prev, categoryName: name }));
      }
    } else if (inlineModalMode === "floor") {
      const number = parseInt(data.value);
      if (isNaN(number)) return;

      const getOrdinal = (n) => {
        if (n % 10 === 1 && n % 100 !== 11) return `${n}st Floor`;
        if (n % 10 === 2 && n % 100 !== 12) return `${n}nd Floor`;
        if (n % 10 === 3 && n % 100 !== 13) return `${n}rd Floor`;
        return `${n}th Floor`;
      };

      const formattedName = getOrdinal(number);
      const newOption = { label: formattedName, value: formattedName };
      if (!floorOptions.some((opt) => opt.value === formattedName)) {
        setFloorOptions((prev) => [...prev, newOption]);
        setSelectedData((prev) => ({ ...prev, floor: formattedName }));
      }
    }

    setInlineModalOpen(false);
  };

  const handleAdd = () => {
    setModalMode("add");
    setSelectedData({});
    setIsModalOpen(true);
  };
const bedroomReport = () => {
  navigate("/hospitaldashboard/bedroom-report", { state: { bedroomData } });
};
  const handleEdit = (row) => {
    setModalMode("edit");
    setSelectedData(row);
    setIsModalOpen(true);
  };

  const handleView = (row) => {
    setModalMode("viewProfile");
    setSelectedData(row);
    setIsModalOpen(true);
  };

  const handleDeletePrompt = (row) => {
    setModalMode("delete");
    setSelectedData(row);
    setIsModalOpen(true);
  };

  const handleDelete = () => {
    setBedroomData((prev) => prev.filter((item) => item.id !== selectedData.id));
    setIsModalOpen(false);
    setSelectedData({});
  };

 const [formErrors, setFormErrors] = useState({});

const handleSave = (data) => {
  const errors = {};
  if (!data.bedNo) errors.bedNo = "Bed No is required.";
  if (!data.categoryName) errors.categoryName = "Category Name is required.";
  if (!data.floor) errors.floor = "Floor is required.";
  if (!data.bookingStatus) errors.bookingStatus = "Booking Status is required.";
  if (!data.status) errors.status = "Status is required.";
  if (!data.productName) errors.productName = "Product Name is required.";
  if (!data.salePrice || isNaN(data.salePrice) || Number(data.salePrice) <= 0) {
    errors.salePrice = "Sale Price must be a positive number.";
  }

  if (Object.keys(errors).length > 0) {
    setFormErrors(errors);
    return;
  }

  setFormErrors({}); // clear errors if all good

  const newData = { ...data };
  if (modalMode === "add") {
    setBedroomData((prev) => [...prev, { id: Date.now(), ...newData }]);
  } else if (modalMode === "edit") {
    setBedroomData((prev) =>
      prev.map((b) => (b.id === selectedData.id ? { ...b, ...newData } : b))
    );
  }
  setIsModalOpen(false);
  setSelectedData({});
};


  const fields = [
    { name: "bedNo", label: "Bed No" },
    {
      name: "categoryName",
      label: "Category Name",
      type: "select",
      options: categoryOptions,
      placeholder: "Select category",
      extraNode: (
        <button type="button" className="text-blue-600 underline text-sm ml-2" onClick={() => openInlineModal("category")}>
          + Add Category
        </button>
      ),
    },
    {
      name: "floor",
      label: "Floor",
      type: "select",
      options: floorOptions,
      placeholder: "Select floor",
      extraNode: (
        <button type="button" className="text-blue-600 underline text-sm ml-2" onClick={() => openInlineModal("floor")}>
          + Add Floor
        </button>
      ),
    },
    {
      name: "bookingStatus",
      label: "Booking Status",
      type: "select",
      options: [
        { label: "Booked", value: "Booked" },
        { label: "Pre-Booked", value: "Pre-Booked" },
        { label: "Available", value: "Available" },
      ],
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { label: "Active", value: "Active" },
        { label: "Inactive", value: "Inactive" },
      ],
    },
    { name: "currentPatient", label: "Current Patient" },
    {
      name: "productName",
      label: "Product Name",
      type: "select",
      options: productOptions,
    },
    { name: "salePrice", label: "Sale Price", type: "number" },
  ];

  const viewFields = [
    { key: "currentPatient", label: "current Patient", titleKey: true ,initialsKey:true},
    { key: "categoryName", label: "Category",subtitleKey:true },
    { key: "floor", label: "Floor" },
    { key: "bookingStatus", label: "Booking Status" },
    { key: "status", label: "Status" },
    { key: "currentPatient", label: "Current Patient" },
    { key: "productName", label: "Product Name" },
    { key: "salePrice", label: "Sale Price" },
  ];

  const columns = [
    { header: "Bed No", accessor: "bedNo" },
    {
      header: "Category Name",
      accessor: "categoryName",
      clickable: true,
      cell: (row) => row.categoryName,
    },
    { header: "Bed/Cabin Floor", accessor: "floor" },
    { header: "Booking Status", accessor: "bookingStatus" },
    
    { header: "current Patient", accessor: "currentPatient" },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => (
        <span className={`px-2 py-1 rounded-full text-sm font-medium ${statusColors[row.status] || ""}`}>
          {row.status}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: "actions",
      cell: (row) => (
        <div className="flex gap-2">
          <button onClick={() => handleEdit(row)} className="edit-btn flex items-center justify-center hover:bg-[--primary-color]/10 rounded p-1 transition" title="Edit">
            <FaEdit className="text-[--primary-color]" />
          </button>
          <button onClick={() => handleDeletePrompt(row)} className="delete-btn flex items-center justify-center hover:bg-red-100 rounded p-1 transition hover:animate-bounce" title="Delete">
            <FaTrash />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
  <h4 className="h4-heading">Bedroom List</h4>

  {/* Buttons aligned right */}
  <div className="flex items-center gap-2 ml-auto">
    <button onClick={bedroomReport} className="flex items-center gap-2 edit-btn rounded rounded-full">
       Bedroom Report
    </button>
    <button onClick={handleAdd} className="flex items-center gap-2 btn btn-primary">
      <FaPlus className="text-sm" /> Add Bedroom
    </button>
  </div>
</div>


      <DynamicTable
        columns={columns}
        data={bedroomData}
        filters={[
          {
            key: "combinedFilter",
            label: "Category",
            options: categoryOptions.map((opt) => ({ value: opt.value, label: opt.label })),
          },
        ]}
        onCellClick={(row, col) => {
          if (col.accessor === "categoryName") handleView(row);
        }}
      />

      <ReusableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        title={
          modalMode === "add"
            ? "Add Bedroom"
            : modalMode === "edit"
            ? "Edit Bedroom"
            : modalMode === "viewProfile"
            ? "View Bedroom"
            : "Delete Bedroom"
        }
        data={selectedData}
        fields={fields}
         errors={formErrors}
        viewFields={viewFields}
        onSave={handleSave}
        onDelete={handleDelete}
      />

      <ReusableModal
        isOpen={inlineModalOpen}
        onClose={() => setInlineModalOpen(false)}
        mode="add"
        title={`Add New ${inlineModalMode === "category" ? "Category" : "Floor"}`}
        data={inlineModalData}
        onSave={handleInlineSave}
        fields={
          inlineModalMode === "category"
            ? [
                { name: "name", label: "Category Name" },
                {
                  name: "status",
                  label: "Status",
                  type: "select",
                  options: [
                    { label: "Active", value: "Active" },
                    { label: "Inactive", value: "Inactive" },
                  ],
                },
              ]
            : [
                { name: "floorType", label: "Floor Type", type: "select", options: [
                    { label: "General", value: "General" },
                    { label: "Private", value: "Private" },
                  ]
                },
                { name: "value", label: "Floor Number (e.g., 3)" },
                {
                  name: "status",
                  label: "Status",
                  type: "select",
                  options: [
                    { label: "Active", value: "Active" },
                    { label: "Inactive", value: "Inactive" },
                  ],
                },
              ]
        }
      />
    </div>
  );
};

export default BedRoomList;


