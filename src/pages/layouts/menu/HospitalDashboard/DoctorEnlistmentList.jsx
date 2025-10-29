import React, { useState } from "react";
import { Plus } from "lucide-react";
import { FaEdit, FaTrash } from "react-icons/fa";
import ReusableModal from "../../../../components/microcomponents/Modal";
import DynamicTable from "../../../../components/microcomponents/DynamicTable";

const doctorFilters = [
  {
    key: "combinedFilter",
    label: "Department",
    options: ["Cardiology", "Medicine", "Surgery", "Pediatrics"].map(dep => ({
      value: dep,
      label: dep
    }))
  }
];

const DoctorEnlistmentList = () => {
const [doctors, setDoctors] = useState([
  {
    id: 1,
    eid: "EMP001",
    employeeName: "Dr. Jamal Khan",
    doctorCode: "DOC001",
    categoryName: "Cardiology",
    specialist: "Heart Surgeon",
    productName: "Cardiac Surgery",
    practiceStartDate: "2018-01-15",
    experience: "6 years",
    doctorFee: 2500,
    remarks: "Senior Consultant",
    popularCategory: true,
    status: "Active",
    punchStatus: "Present",
    availableFrom: "09:00",
    availableTo: "17:00",
    mapEmployee: "EMP001 Dr. Jamal Khan",
    dutyDepartment: "Cardiology",
    dutyDesignation: "Doctor",
    doctorService: "Cardiac Surgery",
    phone: "9876543210",
    email: "jamal.khan@example.com",
    roomNo: "101",
    emergencyContact: "9000011111",
    address: "Mumbai",
    degreeSummary: "MBBS, MD (Cardiology)",
    specializationArea: "Heart surgery",
    doctorSummary: "Experienced heart surgeon with over 6 years of practice."
  },
  {
    id: 2,
    eid: "EMP002",
    employeeName: "Dr. Kamal Khan",
    doctorCode: "DOC002",
    categoryName: "Medicine",
    specialist: "General Physician",
    productName: "General Consultation",
    practiceStartDate: "2020-03-10",
    experience: "4 years",
    doctorFee: 1500,
    remarks: "General Medicine",
    popularCategory: false,
    status: "Active",
    punchStatus: "On Leave",
    availableFrom: "",
    availableTo: "",
    mapEmployee: "EMP002 Dr. Kamal Khan",
    dutyDepartment: "Medicine",
    dutyDesignation: "Consultant",
    doctorService: "OPD Care",
    phone: "9876543211",
    email: "kamal.khan@example.com",
    roomNo: "102",
    emergencyContact: "9000022222",
    address: "Delhi",
    degreeSummary: "MBBS, MD",
    specializationArea: "Internal Medicine",
    doctorSummary: "Focused on general medical care for all age groups."
  },
  {
    id: 3,
    eid: "EMP003",
    employeeName: "Dr. Sarah Ahmed",
    doctorCode: "DOC003",
    categoryName: "Pediatrics",
    specialist: "Child Specialist",
    productName: "Child Care",
    practiceStartDate: "2017-08-22",
    experience: "7 years",
    doctorFee: 1800,
    remarks: "Expert in child health",
    popularCategory: true,
    status: "Active",
    punchStatus: "Present",
    availableFrom: "10:00",
    availableTo: "16:00",
    mapEmployee: "EMP003 Dr. Sarah Ahmed",
    dutyDepartment: "Pediatrics",
    dutyDesignation: "Professor & Doctor",
    doctorService: "Child Treatment",
    phone: "9876543212",
    email: "sarah.ahmed@example.com",
    roomNo: "103",
    emergencyContact: "9000033333",
    address: "Chennai",
    degreeSummary: "MBBS, DCH",
    specializationArea: "Pediatric medicine",
    doctorSummary: "Expert pediatrician with 7 years of experience."
  },
  {
    id: 4,
    eid: "EMP004",
    employeeName: "Dr. Anil Mehta",
    doctorCode: "DOC004",
    categoryName: "Surgery",
    specialist: "Orthopedic Surgeon",
    productName: "Bone Surgery",
    practiceStartDate: "2015-06-30",
    experience: "9 years",
    doctorFee: 3000,
    remarks: "Specialist in trauma surgery",
    popularCategory: false,
    status: "Inactive",
    punchStatus: "Absent",
    availableFrom: "",
    availableTo: "",
    mapEmployee: "EMP004 Dr. Anil Mehta",
    dutyDepartment: "Surgery",
    dutyDesignation: "Consultant",
    doctorService: "Trauma Care",
    phone: "9876543213",
    email: "anil.mehta@example.com",
    roomNo: "104",
    emergencyContact: "9000044444",
    address: "Bangalore",
    degreeSummary: "MBBS, MS (Ortho)",
    specializationArea: "Orthopedic surgery",
    doctorSummary: "Expert in complex trauma and orthopedic procedures."
  },
  {
    id: 5,
    eid: "EMP005",
    employeeName: "Dr. Kavita Joshi",
    doctorCode: "DOC005",
    categoryName: "Medicine",
    specialist: "Internal Medicine",
    productName: "Chronic Care",
    practiceStartDate: "2016-11-10",
    experience: "8 years",
    doctorFee: 2000,
    remarks: "Specialist in chronic illness",
    popularCategory: true,
    status: "Active",
    punchStatus: "Half Day",
    availableFrom: "08:00",
    availableTo: "12:00",
    mapEmployee: "EMP005 Dr. Kavita Joshi",
    dutyDepartment: "Medicine",
    dutyDesignation: "Assistant Doctor",
    doctorService: "Chronic Illness Care",
    phone: "9876543214",
    email: "kavita.joshi@example.com",
    roomNo: "105",
    emergencyContact: "9000055555",
    address: "Pune",
    degreeSummary: "MBBS, MD",
    specializationArea: "Chronic disease management",
    doctorSummary: "Skilled in managing long-term health conditions."
  },
  {
    id: 6,
    eid: "EMP006",
    employeeName: "Dr. Rohit Sharma",
    doctorCode: "DOC006",
    categoryName: "Cardiology",
    specialist: "Interventional Cardiologist",
    productName: "Heart Checkup",
    practiceStartDate: "2019-09-12",
    experience: "5 years",
    doctorFee: 2700,
    remarks: "Expert in stent placement",
    popularCategory: false,
    status: "Active",
    punchStatus: "Present",
    availableFrom: "11:00",
    availableTo: "18:00",
    mapEmployee: "EMP006 Dr. Rohit Sharma",
    dutyDepartment: "Cardiology",
    dutyDesignation: "Doctor",
    doctorService: "Heart Procedures",
    phone: "9876543215",
    email: "rohit.sharma@example.com",
    roomNo: "106",
    emergencyContact: "9000066666",
    address: "Hyderabad",
    degreeSummary: "MBBS, DM (Cardiology)",
    specializationArea: "Cardiac intervention",
    doctorSummary: "Focused on angioplasty and heart catheterizations."
  }
]);



  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: "add",
    type: "doctor",
    data: {}
  });

  const employees = [
    { id: 1, name: "Dr. Jamal Khan", eid: "EMP001" },
    { id: 2, name: "Dr. Kamal Khan", eid: "EMP002" },
    { id: 3, name: "Dr. Sarah Ahmed", eid: "EMP003" }
  ];

  const departments = [
    { id: 1, name: "Cardiology" },
    { id: 2, name: "Medicine" },
    { id: 3, name: "Surgery" },
    { id: 4, name: "Pediatrics" }
  ];

  const designations = [
    { id: 1, name: "Professor & Doctor" },
    { id: 2, name: "Doctor" },
    { id: 3, name: "Consultant" },
    { id: 4, name: "Assistant Doctor" }
  ];

  const calculateExperience = (startDate) => {
    const start = new Date(startDate);
    const now = new Date();
    const years = Math.floor((now - start) / (365.25 * 24 * 60 * 60 * 1000));
    return `${years} year${years !== 1 ? "s" : ""}`;
  };

  const openModal = (mode, type = "doctor", data = {}) => {
    setModalState({ isOpen: true, mode, type, data });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, mode: "add", type: "doctor", data: {} });
  };

  const handleSave = (formData) => {
    const { mode, data } = modalState;
    const selectedEmployee = employees.find(emp => formData.mapEmployee?.includes(emp.eid));
    const eid = selectedEmployee?.eid || `EMP${doctors.length + 1}`;

    const newDoctor = {
      ...formData,
      eid,
      employeeName: formData.employee || selectedEmployee?.name || "",
      experience: calculateExperience(formData.practiceStartDate),
      popularCategory: formData.popularCategory === "true" || formData.popularCategory === true,
      status: "Active"
    };

    if (mode === "add") {
      setDoctors([...doctors, { ...newDoctor, id: doctors.length + 1 }]);
    } else {
      setDoctors(doctors.map(doc => doc.id === data.id ? { ...doc, ...newDoctor } : doc));
    }

    closeModal();
  };

  const handleDelete = (id) => {
    setDoctors(doctors.filter(doc => doc.id !== id));
  };

  const unifiedColumns = [
    { header: "EID", accessor: "eid" },
{
  header: "Doctor Name",
  accessor: "employeeName",
  clickable: true,
  cell: (row) => (
    <button
      onClick={() => openModal("viewProfile", "doctor", row)}
      className="flex items-center gap-2 text-[var(--primary-color)] hover:text-[var(--accent-color)] underline cursor-pointer"
      style={{ textDecorationThickness: 2 }}
      title="View Doctor"
    >
      {/* Blinking dot before name */}
      <div
        className={`w-2.5 h-2.5 rounded-full animate-pulse ${
          row.status === "Inactive" ? "bg-red-500" : "bg-[var(--accent-color)]"
        }`}
      ></div>
      <span>{row.employeeName}</span>
    </button>
  )
}


,
    { header: "Category", accessor: "categoryName" },
    // { header: "Specialist", accessor: "specialist" },
    // {
    //   header: "Today Status",
    //   accessor: "punchStatus",
    //   cell: (row) => {
    //     const punch = row.punchStatus;
    //     const colorMap = {
    //       Present: "bg-green-100 text-green-700",
    //       "On Leave": "bg-yellow-100 text-yellow-700",
    //       Absent: "bg-red-100 text-red-700",
    //       "Half Day": "bg-orange-100 text-orange-700"
    //     };
    //     return (
    //       <span className={`text-xs px-2 py-1 rounded-full ${colorMap[punch] || "bg-gray-100 text-gray-700"}`}>
    //         {punch || "NA"}
    //       </span>
    //     );
    //   }
    // },
    { header: "Available From", accessor: "availableFrom" },
    { header: "Available To", accessor: "availableTo" },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => (
        <span
          className={`text-xs px-2 py-1 rounded-full uppercase ${
            row.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {row.status}
        </span>
      )
    },
    //   {
    //   header: "Today Status",
    //   accessor: "punchStatus",
    //   cell: (row) => {
    //     const punch = row.punchStatus;
    //     const colorMap = {
    //       Present: "bg-green-100 text-green-700",
    //       "On Leave": "bg-yellow-100 text-yellow-700",
    //       Absent: "bg-red-100 text-red-700",
    //       "Half Day": "bg-orange-100 text-orange-700"
    //     };
    //     return (
    //       <span className={`text-xs px-2 py-1 rounded-full ${colorMap[punch] || "bg-gray-100 text-gray-700"}`}>
    //         {punch || "NA"}
    //       </span>
    //     );
    //   }
    // },
    {
      header: "Actions",
      accessor: "actions",
      cell: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => openModal("edit", "doctor", row)}
            className="edit-btn flex items-center justify-center hover:bg-blue-100 rounded p-1 transition hover:animate-bounce"
            title="Edit"
          >
            <FaEdit size={16} />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="delete-btn flex items-center justify-center hover:bg-red-100 rounded p-1 transition hover:animate-bounce"
            title="Delete"
          >
            <FaTrash size={16} />
          </button>
        </div>
      )
    }
  ];

  const getDoctorFields = () => [
   { name: "employeeName", label: "Doctor Name", type: "text", required: true },

    { name: "doctorCode", label: "Doctor Code", type: "text", required: true },
    {
      name: "punchStatus",
      label: "Today Status",
      type: "select",
      options: ["Present", "On Leave", "Half Day", "Absent"].map(s => ({ value: s, label: s }))
    },
    { name: "availableFrom", label: "Available From", type: "time" },
    { name: "availableTo", label: "Available To", type: "time" },
    {
      name: "mapEmployee",
      label: "Map HR Employee",
      type: "select",
      required: true,
      options: employees.map(emp => ({ value: `${emp.eid} ${emp.name}`, label: `${emp.eid} ${emp.name}` }))
    },
    {
      name: "dutyDepartment",
      label: "Duty Department",
      type: "select",
      required: true,
      options: departments.map(dep => ({ value: dep.name, label: dep.name }))
    },
    {
      name: "dutyDesignation",
      label: "Duty Designation",
      type: "select",
      required: true,
      options: designations.map(des => ({ value: des.name, label: des.name }))
    },
    { name: "doctorService", label: "Doctor Service", type: "text", required: true },
    { name: "phone", label: "Phone", type: "tel" },
    { name: "email", label: "Email", type: "email" },
    { name: "roomNo", label: "Room No", type: "text" },
    { name: "emergencyContact", label: "Emergency Contact", type: "tel" },
    { name: "address", label: "Address", type: "textarea" },
    { name: "degreeSummary", label: "Degree Summary", type: "textarea", required: true },
    { name: "specializationArea", label: "Specialize Area", type: "textarea", required: true },
    { name: "doctorSummary", label: "Doctor Summary", type: "textarea" }
  ];

  const viewDoctorFields = [
    { key: "employeeName", label: "Doctor Name", initialsKey : true,titleKey: true ,subtitleKey :true},
    { key: "eid", label: "Employee ID" },
    { key: "doctorCode", label: "Doctor Code" },
    { key: "categoryName", label: "Category" },
    { key: "specialist", label: "Specialist" },
    { key: "productName", label: "Product" },
    { key: "practiceStartDate", label: "Practice Start Date" },
    { key: "experience", label: "Experience" },
    { key: "doctorFee", label: "Doctor Fee" },
    { key: "remarks", label: "Remarks" },
    { key: "punchStatus", label: "Today Status" },
    { key: "availableFrom", label: "Available From" },
    { key: "availableTo", label: "Available To" },
    { key: "status", label: "Status" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="h4-heading">Doctor Enlistment</h1>
        <button onClick={() => openModal("add", "doctor")} className="btn btn-primary flex items-center gap-2">
          <Plus size={20} />
          Create Doctor
        </button>
      </div>

      <DynamicTable
        columns={unifiedColumns}
        data={doctors}
        filters={doctorFilters}
      />

      <ReusableModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        mode={modalState.mode}
        title={
          modalState.mode === "edit"
            ? "Edit Doctor"
            : modalState.mode === "viewProfile"
            ? "Doctor Details"
            : "Create Doctor"
        }
        fields={getDoctorFields()}
        viewFields={viewDoctorFields}
        data={modalState.data}
        onSave={handleSave}
        saveLabel={modalState.mode === "edit" ? "Update" : "Create"}
        size="lg"
      />
    </div>
  );
};

export default DoctorEnlistmentList;