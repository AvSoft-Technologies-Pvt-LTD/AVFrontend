// import React, { useState } from "react";
// import { FaEdit, FaTrash } from "react-icons/fa";
// import DynamicTable from "../../../../components/microcomponents/DynamicTable";
// import ReusableModal from "../../../../components/microcomponents/Modal";

// const TelephoneDirectory = () => {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [formData, setFormData] = useState({});
//   const [formErrors, setFormErrors] = useState({});
//   const [mode, setMode] = useState("add");

// const [directoryData, setDirectoryData] = useState([
//   {
//     id: 1,
//     department: "Cardiology",
//     designation: "Senior Consultant",
//     name: "Dr. Ayesha Khan",
//     phone: "9876543210",
//     email: "ayesha.khan@hospital.com",
//     room: "301-A",
//   },
//   {
//     id: 2,
//     department: "Neurology",
//     designation: "Junior Doctor",
//     name: "Dr. Rohan Mehta",
//     phone: "9123456780",
//     email: "rohan.mehta@hospital.com",
//     room: "216-B",
//   },
//   {
//     id: 3,
//     department: "Orthopedics",
//     designation: "Consultant",
//     name: "Dr. Ravi Verma",
//     phone: "9988776655",
//     email: "ravi.verma@hospital.com",
//     room: "410-C",
//   },
//   {
//     id: 4,
//     department: "Pediatrics",
//     designation: "Senior Resident",
//     name: "Dr. Meena Joshi",
//     phone: "8877665544",
//     email: "meena.joshi@hospital.com",
//     room: "112-A",
//   },
//   {
//     id: 5,
//     department: "Oncology",
//     designation: "Chief Oncologist",
//     name: "Dr. Arjun Singh",
//     phone: "7788990011",
//     email: "arjun.singh@hospital.com",
//     room: "520-B",
//   },
//   {
//     id: 6,
//     department: "Gynecology",
//     designation: "Consultant",
//     name: "Dr. Neha Sharma",
//     phone: "6655443322",
//     email: "neha.sharma@hospital.com",
//     room: "302-B",
//   },
//   {
//     id: 7,
//     department: "ENT",
//     designation: "Junior Consultant",
//     name: "Dr. Anil Kapoor",
//     phone: "7766554433",
//     email: "anil.kapoor@hospital.com",
//     room: "207-D",
//   },
//   {
//     id: 8,
//     department: "Dermatology",
//     designation: "Senior Consultant",
//     name: "Dr. Shalini Rao",
//     phone: "9090909090",
//     email: "shalini.rao@hospital.com",
//     room: "109-C",
//   }
// ]);


//   const departmentOptions = [
//     "Accident and emergency (A&E)",
//     "Admissions",
//     "Allergists/Immunologists",
//     "Anatomy",
//     "Anesthetics",
//     "Biochemistry",
//     "Cardiology",
//     "Neurology",
//   ];

//   const fields = [
//     {
//       name: "department",
//       label: "Department",
//       type: "select",
//       options: departmentOptions.map((v) => ({ value: v, label: v })),
//     },
//     {
//       name: "designation",
//       label: "Designation",
//       type: "select",
//       options: [
//         "Senior Consultant",
//         "Junior Doctor",
//         "Resident",
//         "Surgeon",
//         "Physician",
//         "Medical Officer",
//       ].map((v) => ({ value: v, label: v })),
//     },
//     { name: "name", label: "Name" },
//     { name: "phone", label: "Phone" },
//     { name: "email", label: "Email" },
//     { name: "room", label: "Room No." },
//   ];

//   const columns = [
//     { header: "Department", accessor: "department" },
//     { header: "Designation", accessor: "designation" },
//     { header: "Name", accessor: "name" },
//     { header: "Phone", accessor: "phone" },
//     { header: "Email", accessor: "email" },
//     { header: "Room", accessor: "room" },
//     {
//       header: "Actions",
//       accessor: "actions",
//       cell: (row) => (
//         <div className="flex gap-2">
//           <button
//             onClick={() => {
//               setFormData(row);
//               setFormErrors({});
//               setMode("edit");
//               setIsModalOpen(true);
//             }}
//             className="edit-btn flex items-center justify-center hover:bg-[--primary-color]/10 rounded p-1 transition hover:animate-bounce"
//             title="Edit"
//             type="button"
//           >
//             <FaEdit className="text-[--primary-color]" />
//           </button>

//           <button
//             onClick={() => {
//               setFormData(row);
//               setMode("confirmDelete");
//               setIsModalOpen(true);
//             }}
//             className="delete-btn flex items-center justify-center hover:bg-red-100 rounded p-1 transition hover:animate-bounce"
//             title="Delete"
//             type="button"
//           >
//             <FaTrash className="text-red-500" />
//           </button>
//         </div>
//       ),
//     },
//   ];

//   const filters = [
//     {
//       key: "combinedFilter",
//       label: "Department",
//       options: departmentOptions.map((dep) => ({
//         value: dep,
//         label: dep,
//       })),
//     },
//   ];

//   const validateForm = (data) => {
//     const errors = {};

//     if (!data.department) errors.department = "Department is required";
//     if (!data.designation) errors.designation = "Designation is required";
//     if (!data.name || data.name.trim() === "")
//       errors.name = "Name is required";
//     if (!data.phone || !/^\d{10}$/.test(data.phone))
//       errors.phone = "Valid 10-digit phone number required";
//     if (
//       !data.email ||
//       !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(data.email)
//     )
//       errors.email = "Valid email is required";
//     if (!data.room || data.room.trim() === "")
//       errors.room = "Room number is required";

//     return errors;
//   };

//   const handleSave = (data) => {
//     const errors = validateForm(data);
//     if (Object.keys(errors).length > 0) {
//       setFormErrors(errors);
//       return;
//     }

//     if (mode === "edit") {
//       setDirectoryData((prev) =>
//         prev.map((item) =>
//           item.id === formData.id ? { ...item, ...data } : item
//         )
//       );
//     } else {
//       setDirectoryData((prev) => [...prev, { ...data, id: Date.now() }]);
//     }

//     setIsModalOpen(false);
//     setFormErrors({});
//   };

//   const handleDelete = () => {
//     setDirectoryData((prev) =>
//       prev.filter((entry) => entry.id !== formData.id)
//     );
//     setIsModalOpen(false);
//     setFormData({});
//   };

//   return (
//     <div className="p-6">
//       <div className="flex justify-between items-center mb-4">
//         <h4 className="h4-heading">Telephone Directory</h4>
//         <button
//           onClick={() => {
//             setFormData({});
//             setFormErrors({});
//             setMode("add");
//             setIsModalOpen(true);
//           }}
//           className="btn btn-primary"
//         >
//           + Create
//         </button>
//       </div>

//       <DynamicTable columns={columns} data={directoryData} filters={filters} />

//       <ReusableModal
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         title={
//           mode === "edit"
//             ? "Edit Entry"
//             : mode === "confirmDelete"
//             ? "Confirm Delete"
//             : "Add Entry"
//         }
//         fields={fields}
//         mode={mode}
//         data={formData}
//         onSave={handleSave}
//         onDelete={handleDelete}
//         errors={formErrors}
//       />
//     </div>
//   );
// };

// export default TelephoneDirectory;


import React, { useState, useRef } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import DynamicTable from "../../../../components/microcomponents/DynamicTable";
import ReusableModal from "../../../../components/microcomponents/Modal";

const TelephoneDirectory = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [mode, setMode] = useState("add");

  const printRef = useRef();

  const [directoryData, setDirectoryData] = useState([
    {
      id: 1,
      department: "Cardiology",
      designation: "Senior Consultant",
      name: "Dr. Ayesha Khan",
      phone: "9876543210",
      email: "ayesha.khan@hospital.com",
      room: "301-A",
    },
    {
      id: 2,
      department: "Neurology",
      designation: "Junior Doctor",
      name: "Dr. Rohan Mehta",
      phone: "9123456780",
      email: "rohan.mehta@hospital.com",
      room: "216-B",
    },
    {
      id: 3,
      department: "Orthopedics",
      designation: "Consultant",
      name: "Dr. Ravi Verma",
      phone: "9988776655",
      email: "ravi.verma@hospital.com",
      room: "410-C",
    },
    {
      id: 4,
      department: "Pediatrics",
      designation: "Senior Resident",
      name: "Dr. Meena Joshi",
      phone: "8877665544",
      email: "meena.joshi@hospital.com",
      room: "112-A",
    },
    {
      id: 5,
      department: "Oncology",
      designation: "Chief Oncologist",
      name: "Dr. Arjun Singh",
      phone: "7788990011",
      email: "arjun.singh@hospital.com",
      room: "520-B",
    },
    {
      id: 6,
      department: "Gynecology",
      designation: "Consultant",
      name: "Dr. Neha Sharma",
      phone: "6655443322",
      email: "neha.sharma@hospital.com",
      room: "302-B",
    },
    {
      id: 7,
      department: "ENT",
      designation: "Junior Consultant",
      name: "Dr. Anil Kapoor",
      phone: "7766554433",
      email: "anil.kapoor@hospital.com",
      room: "207-D",
    },
    {
      id: 8,
      department: "Dermatology",
      designation: "Senior Consultant",
      name: "Dr. Shalini Rao",
      phone: "9090909090",
      email: "shalini.rao@hospital.com",
      room: "109-C",
    },
  ]);

  const departmentOptions = [
    "Accident and emergency (A&E)",
    "Admissions",
    "Allergists/Immunologists",
    "Anatomy",
    "Anesthetics",
    "Biochemistry",
    "Cardiology",
    "Neurology",
  ];

  const fields = [
    {
      name: "department",
      label: "Department",
      type: "select",
      options: departmentOptions.map((v) => ({ value: v, label: v })),
    },
    {
      name: "designation",
      label: "Designation",
      type: "select",
      options: [
        "Senior Consultant",
        "Junior Doctor",
        "Resident",
        "Surgeon",
        "Physician",
        "Medical Officer",
      ].map((v) => ({ value: v, label: v })),
    },
    { name: "name", label: "Name" },
    { name: "phone", label: "Phone" },
    { name: "email", label: "Email" },
    { name: "room", label: "Room No." },
  ];

  const columns = [
    { header: "Department", accessor: "department" },
    { header: "Designation", accessor: "designation" },
    { header: "Name", accessor: "name" },
    { header: "Phone", accessor: "phone" },
    { header: "Email", accessor: "email" },
    { header: "Room", accessor: "room" },
    {
      header: "Actions",
      accessor: "actions",
      cell: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              setFormData(row);
              setFormErrors({});
              setMode("edit");
              setIsModalOpen(true);
            }}
            className="edit-btn flex items-center justify-center hover:bg-[--primary-color]/10 rounded p-1 transition hover:animate-bounce"
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
            type="button"
          >
            <FaTrash className="text-red-500" />
          </button>
        </div>
      ),
    },
  ];

  const filters = [
    {
      key: "combinedFilter",
      label: "Department",
      options: departmentOptions.map((dep) => ({
        value: dep,
        label: dep,
      })),
    },
  ];

  const validateForm = (data) => {
    const errors = {};
    if (!data.department) errors.department = "Department is required";
    if (!data.designation) errors.designation = "Designation is required";
    if (!data.name || data.name.trim() === "") errors.name = "Name is required";
    if (!data.phone || !/^\d{10}$/.test(data.phone))
      errors.phone = "Valid 10-digit phone number required";
    if (
      !data.email ||
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(data.email)
    )
      errors.email = "Valid email is required";
    if (!data.room || data.room.trim() === "") errors.room = "Room number is required";
    return errors;
  };

  const handleSave = (data) => {
    const errors = validateForm(data);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (mode === "edit") {
      setDirectoryData((prev) =>
        prev.map((item) => (item.id === formData.id ? { ...item, ...data } : item))
      );
    } else {
      setDirectoryData((prev) => [...prev, { ...data, id: Date.now() }]);
    }

    setIsModalOpen(false);
    setFormErrors({});
  };

  const handleDelete = () => {
    setDirectoryData((prev) => prev.filter((entry) => entry.id !== formData.id));
    setIsModalOpen(false);
    setFormData({});
  };

  const printTable = () => {
    const printContent = printRef.current;
    const win = window.open("", "", "width=900,height=700");
    win.document.write(`
      <html>
        <head>
          <title>Print Directory</title>
          <style>
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #000; padding: 8px; text-align: left; }
            th { background-color: #f3f3f3; }
            h2 { text-align: center; }
          </style>
        </head>
        <body>
          <h2>Telephone Directory</h2>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h4 className="h4-heading">Telephone Directory</h4>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setFormData({});
              setFormErrors({});
              setMode("add");
              setIsModalOpen(true);
            }}
            className="btn btn-primary"
          >
            + Create
          </button>
          <button onClick={printTable} className="btn-secondary">
            Print
          </button>
        </div>
      </div>

      <DynamicTable columns={columns} data={directoryData} filters={filters} />

      {/* Hidden printable content */}
      <div style={{ display: "none" }}>
        <div ref={printRef}>
          <table>
            <thead>
              <tr>
                <th>Department</th>
                <th>Designation</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Room</th>
              </tr>
            </thead>
            <tbody>
              {directoryData.map((entry) => (
                <tr key={entry.id}>
                  <td>{entry.department}</td>
                  <td>{entry.designation}</td>
                  <td>{entry.name}</td>
                  <td>{entry.phone}</td>
                  <td>{entry.room}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ReusableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          mode === "edit"
            ? "Edit Entry"
            : mode === "confirmDelete"
            ? "Confirm Delete"
            : "Add Entry"
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

export default TelephoneDirectory;
