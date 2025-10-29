import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPrint } from "react-icons/fa";
import { FiExternalLink } from "react-icons/fi";
import ReusableModal from "../../../../components/microcomponents/Modal";
import DynamicTable from "../../../../components/microcomponents/DynamicTable";
import InvoiceTemplateModal from "../../../../components/InvoiceTemplateModal"; // New Template

const OpdPatientBilling = () => {
  const navigate = useNavigate();

  const initialData = [
    {
      id: 1,
      invoiceNo: "S-000063",
      treatmentID: "CP-0000000045",
      hospitalUID: "HID000041",
      patientName: "Amir Shekh",
      age: "32",
      gender: "Male",
      phone: "01913945486",
      address: "123 Street, City",
      doctor: "Dr. Jamal Khan",
      department: "Dental",
      admissionDate: "22/06/2020",
      dischargeDate: "n/a",
      bed: "B-101",
      billAmount: "200.00",
      items: [
        { name: "Consultation", qty: 1, price: 100 },
        { name: "X-Ray", qty: 1, price: 100 },
      ],
    },
    {
      id: 2,
      invoiceNo: "S-000064",
      treatmentID: "CP-0000000046",
      hospitalUID: "HID000042",
      patientName: "Rina Das",
      age: "28",
      gender: "Female",
      phone: "9876543210",
      address: "456 Avenue, City",
      doctor: "Dr. Amir Ali",
      department: "Cardiology",
      admissionDate: "25/06/2020",
      dischargeDate: "n/a",
      bed: "B-102",
      billAmount: "500.00",
      items: [
        { name: "ECG", qty: 1, price: 150 },
        { name: "Consultation", qty: 1, price: 350 },
      ],
    },
    {
      id: 3,
      invoiceNo: "S-000065",
      treatmentID: "CP-0000000047",
      hospitalUID: "HID000043",
      patientName: "Suresh Mehta",
      age: "45",
      gender: "Male",
      phone: "9123456789",
      address: "789 Road, City",
      doctor: "Dr. Sneha Verma",
      department: "Neurology",
      admissionDate: "28/06/2020",
      dischargeDate: "n/a",
      bed: "B-103",
      billAmount: "750.00",
      items: [
        { name: "MRI Scan", qty: 1, price: 600 },
        { name: "Consultation", qty: 1, price: 150 },
      ],
    },
  ];

  const [tableData, setTableData] = useState(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [modalMode, setModalMode] = useState("view");

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const doctorOptions = [
    { label: "Dr. Jamal Khan", value: "Dr. Jamal Khan" },
    { label: "Dr. Amir Ali", value: "Dr. Amir Ali" },
    { label: "Dr. Sneha Verma", value: "Dr. Sneha Verma" },
  ];

  const referDoctorOptions = [
    { label: "Dr. Saira Rahman", value: "Dr. Saira Rahman" },
    { label: "Dr. Mehul Jain", value: "Dr. Mehul Jain" },
    { label: "Dr. S. Rahim", value: "Dr. S. Rahim" },
  ];

  const handleReferSave = (formValues) => {
    const update = (data) =>
      data.map((row) =>
        row.id === selectedRow.id
          ? { ...row, referDoctor: formValues.doctorReferBy }
          : row
      );
    setTableData(update);
    setIsModalOpen(false);
  };

  const handlePrintInvoice = (row) => {
    const formattedItems = row.items.map((item) => ({
      ...item,
      unitPrice: item.price,
      amount: item.price * item.qty,
    }));
    setSelectedInvoice({ ...row, items: formattedItems });
    setIsPrintModalOpen(true);
  };

  const handleReferClick = (row) => {
    setSelectedRow(row);
    setModalMode("add");
    setIsModalOpen(true);
  };

  const handleView = (row) => {
    setSelectedRow(row);
    setModalMode("viewProfile");
    setIsModalOpen(true);
  };

  const fields = [
    { name: "department", label: "Department", type: "text", disabled: true },
    { name: "doctor", label: "Doctor Name", type: "select", options: doctorOptions },
    { name: "referDate", label: "Refer Date", type: "date" },
    { name: "doctorReferBy", label: "Doctor Refer By", type: "select", options: referDoctorOptions },
    { name: "remarks", label: "Remarks", type: "textarea" },
  ];

  const viewFields = [
    { key: "patientName", label: "Patient Name", titleKey: true, initialsKey: true },
    { key: "gender", label: "Gender" },
    { key: "phone", label: "Mobile No" },
    { key: "address", label: "Address" },
    { key: "doctor", label: "Doctor", subtitleKey: true },
    { key: "department", label: "Department" },
    { key: "hospitalUID", label: "Hospital UID" },
    { key: "treatmentID", label: "Treatment ID" },
    { key: "cardIssueDate", label: "Card Issue Date" },
    { key: "bed", label: "Bed" },
    { key: "dischargeDate", label: "Discharge Date" },
    { key: "billAmount", label: "Bill Amount" },
  ];

  const columns = [
    { header: "Invoice No", accessor: "invoiceNo", cell: (row) => <span>{row.invoiceNo}</span> },
    {
      header: "Patient Name",
      accessor: "patientName",
      cell: (row) => (
        <button className="text-black-600 underline hover:text-indigo-800" onClick={() => handleView(row)}>
          {row.patientName}
        </button>
      ),
    },
    { header: "Department", accessor: "department" },
    { header: "Mobile No", accessor: "phone" },
    {
      header: "Refer Doctor",
      accessor: "referDoctor",
      cell: (row) => (
        <button onClick={() => handleReferClick(row)} className="text-green-600 underline hover:text-green-800">
          {row.referDoctor || "Refer Doctor"}
        </button>
      ),
    },
    { header: "Bill Amount", accessor: "billAmount" },
    {
      header: "Action",
      accessor: "action",
      cell: (row) => (
        <div className="flex gap-2">
          <button onClick={() => handlePrintInvoice(row)} title="Print Invoice">
            <FaPrint className="text-gray-600 hover:text-black" />
          </button>
          <button
            onClick={() =>
              navigate(`/hospitaldashboard/opd-dashboard/${row.treatmentID}`, { state: { ...row } })
            }
            title="Go to Dashboard"
          >
            <FiExternalLink className="text-blue-600 hover:text-blue-800" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 mt-5">
      <DynamicTable
        columns={columns}
        data={tableData}
        filters={[
          {
            key: "department",
            label: "Department",
            type: "select",
            options: [
              { label: "Dental", value: "Dental" },
              { label: "Cardiology", value: "Cardiology" },
              { label: "Neurology", value: "Neurology" },
            ],
          },
        ]}
      />

      {selectedRow && (
        <ReusableModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          mode={modalMode}
          title={modalMode === "viewProfile" ? `Patient Detail: ${selectedRow.patientName}` : "Refer Doctor Details"}
          saveLabel="Save Refer"
          cancelLabel="Close"
          fields={modalMode === "add" ? fields : []}
          viewFields={viewFields}
          data={
            modalMode === "viewProfile"
              ? selectedRow
              : {
                  department: selectedRow.department || "",
                  doctor: selectedRow.doctor || "",
                  referDate: new Date().toISOString().split("T")[0],
                  doctorReferBy: "",
                  remarks: "",
                }
          }
          onSave={modalMode === "add" ? handleReferSave : null}
        />
      )}

      {/* NEW PRINT MODAL */}
      <InvoiceTemplateModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        invoice={selectedInvoice}
      />
    </div>
  );
};

export default OpdPatientBilling;
