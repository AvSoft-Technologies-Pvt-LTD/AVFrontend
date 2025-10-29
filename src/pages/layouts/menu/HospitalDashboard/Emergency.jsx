import React, { useState } from "react";
import { Plus } from "lucide-react";
import { FaEdit, FaTrash } from "react-icons/fa";
import ReusableModal from "../../../../components/microcomponents/Modal";
import DynamicTable from "../../../../components/microcomponents/DynamicTable";

const patientData = [
  {
    id: 1,
    treatmentId: "T001",
    hospitalUid: "HOS001",
    patientName: "Ad Fret St",
    mobileNo: "911",
    age: "49.82",
    ageYears: 49,
    ageMonths: 9,
    ageDays: 27,
    birthDate: "1974-01-15",
    gender: "Male",
    maritalStatus: "Married",
    financialCapability: "Medium",
    fatherName: "John Fret",
    motherName: "Anna Fret",
    spouseName: "Linda Fret",
    occupation: "Self-employed",
    email: "adfret@example.com",
    addressArea: "Central Zone",
    address: "123 Main Street, City Center, Metro City",
    admissionDate: "2020-10-05",
    admissionType: "Emergency",
    department: "Medicine",
    doctor: "Dr. Kamal Khan",
    doctorName: "Dr. Kamal Khan",
    referenceType: "Doctor",
    referenceDoctor: "Dr. X",
    patientType: "General",
    feeType: "Paid",
    chargePaid: "1500",
    bedNo: "201",
    remarks: "Patient brought in with chest pain. Condition stable.",
    careOfName: "Michael Fret",
    careOfRelation: "Father",
    coAddress: "C/O Michael Fret, 456 Side Street, City Suburb"
  },
  {
    id: 2,
    treatmentId: "T002",
    hospitalUid: "HOS002",
    patientName: "Rohit Verma",
    mobileNo: "9876543210",
    age: "32.50",
    ageYears: 32,
    ageMonths: 6,
    ageDays: 0,
    birthDate: "1992-01-15",
    gender: "Male",
    maritalStatus: "Single",
    financialCapability: "Low",
    fatherName: "Rajesh Verma",
    motherName: "Sushma Verma",
    spouseName: "",
    occupation: "Driver",
    email: "rohitv@example.com",
    addressArea: "North Zone",
    address: "22 Park Avenue, North City",
    admissionDate: "2023-07-10",
    admissionType: "Emergency",
    department: "Orthopedics",
    doctor: "Dr. Meena Shah",
    doctorName: "Dr. Meena Shah",
    referenceType: "Self",
    referenceDoctor: "",
    patientType: "General",
    feeType: "Free",
    chargePaid: "0",
    bedNo: "202",
    remarks: "Fracture due to road accident.",
    careOfName: "Rajesh Verma",
    careOfRelation: "Father",
    coAddress: "C/O Rajesh Verma, 33 Main Lane, North City"
  },
  {
    id: 3,
    treatmentId: "T003",
    hospitalUid: "HOS003",
    patientName: "Anjali Mehta",
    mobileNo: "9898989898",
    age: "28.75",
    ageYears: 28,
    ageMonths: 9,
    ageDays: 0,
    birthDate: "1996-10-10",
    gender: "Female",
    maritalStatus: "Married",
    financialCapability: "High",
    fatherName: "Arvind Mehta",
    motherName: "Rekha Mehta",
    spouseName: "Ramesh Mehta",
    occupation: "Engineer",
    email: "anjali@example.com",
    addressArea: "East Zone",
    address: "101 Tech Park, East End",
    admissionDate: "2024-03-22",
    admissionType: "Emergency",
    department: "Cardiology",
    doctor: "Dr. Karan Kapoor",
    doctorName: "Dr. Karan Kapoor",
    referenceType: "Hospital",
    referenceDoctor: "Dr. Neha Singh",
    patientType: "VIP",
    feeType: "Paid",
    chargePaid: "5000",
    bedNo: "301",
    remarks: "Shortness of breath and dizziness.",
    careOfName: "Ramesh Mehta",
    careOfRelation: "Husband",
    coAddress: "C/O Ramesh Mehta, 45 West Lane, Central City"
  },
  {
    id: 4,
    treatmentId: "T004",
    hospitalUid: "HOS004",
    patientName: "Karan Singh",
    mobileNo: "9123456789",
    age: "45.25",
    ageYears: 45,
    ageMonths: 3,
    ageDays: 0,
    birthDate: "1980-04-25",
    gender: "Male",
    maritalStatus: "Married",
    financialCapability: "Medium",
    fatherName: "Devendra Singh",
    motherName: "Kamla Singh",
    spouseName: "Pooja Singh",
    occupation: "Teacher",
    email: "karan.singh@example.com",
    addressArea: "West Zone",
    address: "78 School Road, West Town",
    admissionDate: "2024-12-15",
    admissionType: "Emergency",
    department: "Neurology",
    doctor: "Dr. Nidhi Rao",
    doctorName: "Dr. Nidhi Rao",
    referenceType: "Doctor",
    referenceDoctor: "Dr. Sharma",
    patientType: "General",
    feeType: "Paid",
    chargePaid: "2000",
    bedNo: "305",
    remarks: "Head trauma following fall.",
    careOfName: "Pooja Singh",
    careOfRelation: "Wife",
    coAddress: "C/O Pooja Singh, 14 Hill Road, West Town"
  },
  {
    id: 5,
    treatmentId: "T005",
    hospitalUid: "HOS005",
    patientName: "Pooja Rane",
    mobileNo: "9001234567",
    age: "35.00",
    ageYears: 35,
    ageMonths: 0,
    ageDays: 0,
    birthDate: "1990-06-20",
    gender: "Female",
    maritalStatus: "Single",
    financialCapability: "Low",
    fatherName: "Manoj Rane",
    motherName: "Seema Rane",
    spouseName: "",
    occupation: "Nurse",
    email: "pooja.rane@example.com",
    addressArea: "South Zone",
    address: "55 Wellness Road, South Block",
    admissionDate: "2022-11-09",
    admissionType: "Emergency",
    department: "Gynaecology",
    doctor: "Dr. Anu George",
    doctorName: "Dr. Anu George",
    referenceType: "Referral",
    referenceDoctor: "Dr. Thomas",
    patientType: "General",
    feeType: "Paid",
    chargePaid: "1000",
    bedNo: "401",
    remarks: "Abdominal pain and nausea.",
    careOfName: "Manoj Rane",
    careOfRelation: "Father",
    coAddress: "C/O Manoj Rane, 12 Bazar Road, South City"
  }
];


const admissionFields = [
  { name: "patientName", label: "Patient Name", type: "text" },
  { name: "ageYears", label: "Years", type: "number" },
  { name: "ageMonths", label: "Months", type: "number" },
  { name: "ageDays", label: "Days", type: "number" },
  { name: "birthDate", label: "Birth Date", type: "date" },
  {
    name: "gender",
    label: "Gender",
    type: "select",
    options: [
      { value: "Male", label: "Male" },
      { value: "Female", label: "Female" },
      { value: "Other", label: "Other" },
    ],
  },
  {
    name: "maritalStatus",
    label: "Marital Status",
    type: "select",
    options: [
      { value: "Single", label: "Single" },
      { value: "Married", label: "Married" },
      { value: "Other", label: "Other" },
    ],
  },
  {
    name: "financialCapability",
    label: "Financial Capability",
    type: "select",
    options: [
      { value: "Low", label: "Low" },
      { value: "Medium", label: "Medium" },
      { value: "High", label: "High" },
    ],
  },
  { name: "fatherName", label: "Father Name", type: "text" },
  { name: "motherName", label: "Mother Name", type: "text" },
  { name: "spouseName", label: "Spouse Name", type: "text" },
  {
    name: "occupation",
    label: "Occupation",
    type: "select",
    options: [
      { value: "Employed", label: "Employed" },
      { value: "Self-employed", label: "Self-employed" },
      { value: "Unemployed", label: "Unemployed" },
    ],
  },
  { name: "email", label: "Email", type: "text" },
  { name: "addressArea", label: "Address/Area", type: "text" },
  { name: "address", label: "Address", type: "textarea" }, {
    name: "admissionType",
    label: "Admission Type",
    type: "select",
    options: [
      { value: "Emergency", label: "Emergency" },
      { value: "Routine", label: "Routine" },
      { value: "Referral", label: "Referral" },
    ],
  },
  {
    name: "department",
    label: "Department",
    type: "select",
    options: [
      { value: "General", label: "General" },
      { value: "ENT", label: "ENT" },
      { value: "Medicine", label: "Medicine" },
    ],
  },
  {
    name: "doctor",
    label: "Doctor",
    type: "select",
    options: [
      { value: "Dr. Kamal Khan", label: "Dr. Kamal Khan" },
      { value: "Dr. Jamal Khan", label: "Dr. Jamal Khan" },
    ],
  },
  {
    name: "referenceType",
    label: "Reference Type",
    type: "select",
    options: [
      { value: "Doctor", label: "Doctor" },
      { value: "Self", label: "Self" },
      { value: "Referral", label: "Referral" },
    ],
  },
  {
    name: "referenceDoctor",
    label: "Reference Doctor",
    type: "select",
    options: [
      { value: "Dr. X", label: "Dr. X" },
      { value: "Dr. Y", label: "Dr. Y" },
    ],
  },
  {
    name: "patientType",
    label: "Patient Type",
    type: "select",
    options: [
      { value: "General", label: "General" },
      { value: "Staff", label: "Staff" },
      { value: "Student", label: "Student" },
      { value: "Free", label: "Free" },
    ],
  },
  {
    name: "feeType",
    label: "Fee / Charges",
    type: "select",
    options: [
      { value: "Paid", label: "Paid" },
      { value: "Free", label: "Free" },
      { value: "Partial", label: "Partial" },
    ],
  },
  { name: "chargePaid", label: "Charge Paid", type: "text" },
  { name: "bedNo", label: "Bed No", type: "text" },
  { name: "remarks", label: "Remarks / Patient Condition", type: "textarea" },
  { name: "careOfName", label: "C/O Name", type: "text" },
  {
    name: "careOfRelation",
    label: "C/O Relationship",
    type: "select",
    options: [
      { value: "Father", label: "Father" },
      { value: "Mother", label: "Mother" },
      { value: "Spouse", label: "Spouse" },
    ],
  },
  { name: "coAddress", label: "C/O Address", type: "textarea" },
  { name: "mobileNo", label: "Phone No", type: "text" },
  { name: "hospitalUid", label: "Hospital UID", type: "text" },
  { name: "treatmentId", label: "Treatment ID", type: "text" },
];

const Emergency = () => {
  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedData, setSelectedData] = useState({});

  const openAdmissionModal = (mode, row = null) => {
    if (row) {
      const formattedRow = {
        ...row,
        doctor: row.doctorName,
        occupation: row.occupation?.replace(/\u2011|\u00A0/g, "-"),
        ageYears: row.ageYears || parseInt(row.age),
      };
      setSelectedData(formattedRow);
    } else {
      setSelectedData({});
    }
    setModalMode(mode);
    setOpenModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      console.log("Deleted ID:", id);
    }
  };

  const handleSave = (formData) => {
    console.log("Saved form:", formData);
    setOpenModal(false);
  };

  const patientFilters = [
  {
    key: "patientType",
    label: "Filter",
    options: [
      { value: "General", label: "General" },
      { value: "VIP", label: "VIP" },
   

      { value: "Free", label: "Free" },
    ],
  },
];

  const emergencyColumns = [
    { header: "Treatment ID", accessor: "treatmentId" },
    { header: "Hospital UID", accessor: "hospitalUid" },
    {
      header: "Patient Name",
      accessor: "patientName",
      cell: (row) => (
        <button
          onClick={() => openAdmissionModal("viewProfile", row)}
          className="flex items-center gap-2 text-[var(--primary-color)] hover:text-[var(--accent-color)] underline cursor-pointer"
        >
          {row.patientName}
        </button>
      ),
    },
    { header: "Admission Date", accessor: "admissionDate" },
    { header: "Doctor Name", accessor: "doctorName" },
    { header: "Bed No", accessor: "bedNo" },
    { header: "Patient Type", accessor: "patientType" },
    {
      header: "Actions",
      accessor: "actions",
      cell: (row) => (
        <div className="flex gap-2 items-center">
          <button
            onClick={() => openAdmissionModal("edit", row)}
            title="Edit"
       className="edit-btn flex items-center justify-center hover:bg-blue-100 rounded p-1 transition hover:animate-bounce"
          >
            <FaEdit size={16} />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            title="Delete"
             className="delete-btn flex items-center justify-center hover:bg-red-100 rounded p-1 transition hover:animate-bounce"
          >
            <FaTrash size={16} />
          </button>
        </div>
      ),
    },
  ];

const viewFields = admissionFields.map(({ name, label }) => {
  const field = { key: name, label };
  if (name === "patientName") {
    field.initialsKey = true;
    field.titleKey = true;
    field.subtitleKey = true;
  }
  return field;
});


  return (
    <div className="p-4 space-y-4 overflow-visible">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Emergency Patients</h2>
        <button
          onClick={() => openAdmissionModal("add")}
          className=" btn-primary flex items-center gap-2  text-white px-4 py-2 rounded"
         
        >
          <Plus size={16} /> Admission
        </button>
      </div>

     <DynamicTable data={patientData} columns={emergencyColumns} filters={patientFilters} />

      <ReusableModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        mode={modalMode}
        title={
          modalMode === "viewProfile"
            ? "View Admission Details"
            : modalMode === "edit"
            ? "Edit Admission"
            : "New Admission"
        }
        fields={admissionFields}
        data={selectedData}
        saveLabel="Confirm Admission"
        onSave={handleSave}
        viewFields={modalMode === "viewProfile" ? viewFields : []}
      />
    </div>
  );
};

export default Emergency;