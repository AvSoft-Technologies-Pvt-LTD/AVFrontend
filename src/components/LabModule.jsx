import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DynamicTable from "./microcomponents/DynamicTable";
import ReusableModal from "./microcomponents/Modal";
import TemplateModal from "../pages/layouts/menu/HospitalDashboard/TemplateModal";
import { Printer, FlaskConical, TestTube, ClipboardList, BarChart } from "lucide-react";
import { FaEdit, FaTrash } from "react-icons/fa";

const LabModule = () => {
  const navigate = useNavigate();
  const printRef = useRef(null);

  const tabs = [
    { value: "testAdvisedPatientList", label: "Test Advised Patient List", icon: ClipboardList },
    { value: "testOrderList", label: "Test Order List", icon: TestTube },
    { value: "labSalesList", label: "Lab Sales List", icon: BarChart },
    { value: "testReportGeneration", label: "Test Report Generation", icon: FlaskConical },
  ];

  // Enhanced test report data structure
  const initialDummyRows = {
    testAdvisedPatientList: [
      { id: 1, patientName: "John Doe", patientId: "PAT-001", treatmentID: "TRT-001", testName: "Complete Blood Count", advisedBy: "Dr. Smith", department: "Internal Medicine", testDate: "2024-01-15", status: "Pending", priority: "Normal", age: "35", gender: "Male", phoneNo: "123-456-7890" },
      { id: 2, patientName: "Jane Smith", patientId: "PAT-002", treatmentID: "TRT-002", testName: "Lipid Profile", advisedBy: "Dr. Johnson", department: "Cardiology", testDate: "2024-01-16", status: "Confirmed", priority: "Urgent", age: "42", gender: "Female", phoneNo: "098-765-4321" },
      { id: 3, patientName: "Ahmed Hassan", patientId: "PAT-003", treatmentID: "TRT-003", testName: "Thyroid Function Test", advisedBy: "Dr. Wilson", department: "Endocrinology", testDate: "2024-01-17", status: "Cancelled", priority: "Normal", age: "28", gender: "Male", phoneNo: "555-123-4567" }
    ],
    testOrderList: [
      { id: 1, orderId: "ORD-001", sample: "Blood", testSlip: "TS-001", testName: "ICT for Malarial pv/pf", specId: "SPEC-001", testStatus: "Collected", paymentStatus: "Paid", reportStatus: "In Process", expDate: "2024-01-20", treatmentId: "OP-0000000006", invoiceNo: "S-0000170", orderDate: "2024-01-11", patientName: "Muse raage ceele", age: "49", priority: "Normal", collectedBy: "Lab Tech 1", sampleCollectionDate: "2024-01-12" },
      { id: 2, orderId: "ORD-002", sample: "Urine", testSlip: "TS-002", testName: "Urine Analysis", specId: "SPEC-002", testStatus: "Processing", paymentStatus: "Unpaid", reportStatus: "Completed", expDate: "2024-01-18", treatmentId: "OP-0000000007", invoiceNo: "S-0000171", orderDate: "2024-01-12", patientName: "Ahmed Hassan", age: "28", priority: "Urgent", collectedBy: "Lab Tech 2", sampleCollectionDate: "2024-01-13" }
    ],
    labSalesList: [
      { id: 1, invoiceId: "INV-001", patientName: "John Doe", totalAmount: "5000", discount: "500", tax: "450", netAmount: "4950", paymentMode: "Cash", paymentStatus: "Paid", testNames: "CBC, Lipid Profile", saleDate: "2024-01-15" },
      { id: 2, invoiceId: "INV-002", patientName: "Jane Smith", totalAmount: "3000", discount: "0", tax: "270", netAmount: "3270", paymentMode: "Card", paymentStatus: "Paid", testNames: "Thyroid Function Test", saleDate: "2024-01-16" },
      { id: 3, invoiceId: "INV-003", patientName: "Ahmed Hassan", totalAmount: "2500", discount: "250", tax: "225", netAmount: "2475", paymentMode: "Online", paymentStatus: "Pending", testNames: "Liver Function Test", saleDate: "2024-01-17" }
    ],
    testReportGeneration: [
      {
        id: 1, reportId: "RPT-001", patientName: "John Doe", patientId: "PAT-001", age: "35", gender: "Male", phoneNo: "123-456-7890", address: "123 Main St, City, State 12345", testNames: "Complete Blood Count",
        testResults: { "Hemoglobin": { value: "14.5", unit: "g/dL", reference: "12.0-16.0", status: "Normal" }, "WBC Count": { value: "7500", unit: "/μL", reference: "4000-11000", status: "Normal" }, "RBC Count": { value: "4.5", unit: "million/μL", reference: "4.5-5.9", status: "Normal" }, "Platelets": { value: "250000", unit: "/μL", reference: "150000-450000", status: "Normal" } },
        collectedDate: "2024-01-12", reportDate: "2024-01-15", verifiedBy: "Dr. Wilson", status: "Verified", doctorName: "Dr. Smith", technician: "Lab Tech 1", labName: "Central Medical Laboratory", labAddress: "456 Health Ave, Medical City, State 67890", labPhone: "555-123-4567", labEmail: "info@centralmedlab.com", comments: "All parameters within normal limits."
      },
      {
        id: 2, reportId: "RPT-002", patientName: "Jane Smith", patientId: "PAT-002", age: "42", gender: "Female", phoneNo: "098-765-4321", address: "456 Oak Ave, Town, State 54321", testNames: "Lipid Profile",
        testResults: { "Total Cholesterol": { value: "220", unit: "mg/dL", reference: "<200", status: "High" }, "HDL Cholesterol": { value: "45", unit: "mg/dL", reference: ">40", status: "Normal" }, "LDL Cholesterol": { value: "140", unit: "mg/dL", reference: "<100", status: "High" }, "Triglycerides": { value: "180", unit: "mg/dL", reference: "<150", status: "High" } },
        collectedDate: "2024-01-13", reportDate: "2024-01-16", verifiedBy: "", status: "Pending", doctorName: "Dr. Johnson", technician: "Lab Tech 2", labName: "Central Medical Laboratory", labAddress: "456 Health Ave, Medical City, State 67890", labPhone: "555-123-4567", labEmail: "info@centralmedlab.com", comments: "Lipid levels elevated. Recommend dietary changes and follow-up."
      },
      {
        id: 3, reportId: "RPT-003", patientName: "Ahmed Hassan", patientId: "PAT-003", age: "28", gender: "Male", phoneNo: "555-123-4567", address: "789 Pine St, Village, State 98765", testNames: "Thyroid Function Test",
        testResults: { "TSH": { value: "2.5", unit: "mIU/L", reference: "0.4-4.0", status: "Normal" }, "T4 Free": { value: "1.2", unit: "ng/dL", reference: "0.8-1.8", status: "Normal" }, "T3 Free": { value: "3.1", unit: "pg/mL", reference: "2.3-4.2", status: "Normal" } },
        collectedDate: "2024-01-14", reportDate: "2024-01-17", verifiedBy: "Dr. Wilson", status: "Published", doctorName: "Dr. Wilson", technician: "Lab Tech 1", labName: "Central Medical Laboratory", labAddress: "456 Health Ave, Medical City, State 67890", labPhone: "555-123-4567", labEmail: "info@centralmedlab.com", comments: "Thyroid function normal."
      }
    ]
  };
  const [rows, setRows] = useState(initialDummyRows);
  const [activeTab, setActiveTab] = useState(tabs[0].value);
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState("add");
  const [currentRow, setCurrentRow] = useState(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [reportToPrint, setReportToPrint] = useState(null);

  const fields = {
    testAdvisedPatientList: [
      { name: "patientName", label: "Patient Name", required: true },
      { name: "patientId", label: "Patient ID", required: true },
      { name: "treatmentID", label: "Treatment ID", required: true },
      { name: "age", label: "Age", type: "number", required: true },
      { name: "gender", label: "Gender", type: "select", options: [{ value: "Male", label: "Male" }, { value: "Female", label: "Female" }, { value: "Other", label: "Other" }], required: true },
      { name: "phoneNo", label: "Phone No", required: true },
      { name: "department", label: "Department", type: "select", options: [{ value: "Internal Medicine", label: "Internal Medicine" }, { value: "Cardiology", label: "Cardiology" }, { value: "Neurology", label: "Neurology" }, { value: "Orthopedics", label: "Orthopedics" }, { value: "Endocrinology", label: "Endocrinology" }], required: true },
      { name: "advisedBy", label: "Advised By Doctor", type: "select", options: [{ value: "Dr. Smith", label: "Dr. Smith" }, { value: "Dr. Johnson", label: "Dr. Johnson" }, { value: "Dr. Wilson", label: "Dr. Wilson" }], required: true },
      { name: "testName", label: "Test Name", type: "multiselect", options: [{ value: "Complete Blood Count", label: "Complete Blood Count" }, { value: "Lipid Profile", label: "Lipid Profile" }, { value: "Thyroid Function Test", label: "Thyroid Function Test" }, { value: "Liver Function Test", label: "Liver Function Test" }], required: true },
      { name: "testDate", label: "Test Date", type: "date", required: true },
      { name: "priority", label: "Priority", type: "select", options: [{ value: "Normal", label: "Normal" }, { value: "Urgent", label: "Urgent" }, { value: "STAT", label: "STAT" }], required: true },
      { name: "status", label: "Status", type: "select", options: [{ value: "Pending", label: "Pending" }, { value: "Confirmed", label: "Confirmed" }, { value: "Cancelled", label: "Cancelled" }], required: true }
    ],
    testOrderList: [
      { name: "orderId", label: "Order ID", required: true },
      { name: "patientName", label: "Patient Name", required: true },
      { name: "sample", label: "Sample Type", type: "multiselect", options: [{ value: "Blood", label: "Blood" }, { value: "Urine", label: "Urine" }, { value: "Stool", label: "Stool" }, { value: "Sputum", label: "Sputum" }], required: true },
      { name: "testSlip", label: "Test Slip", required: true },
      { name: "testName", label: "Test Name", required: true },
      { name: "specId", label: "Specimen ID", required: true },
      { name: "testStatus", label: "Test Status", type: "select", options: [{ value: "Collected", label: "Collected" }, { value: "Processing", label: "Processing" }, { value: "Completed", label: "Completed" }, { value: "Rejected", label: "Rejected" }], required: true },
      { name: "paymentStatus", label: "Payment Status", type: "select", options: [{ value: "Paid", label: "Paid" }, { value: "Unpaid", label: "Unpaid" }, { value: "Partial", label: "Partial" }], required: true },
      { name: "reportStatus", label: "Report Status", type: "select", options: [{ value: "In Process", label: "In Process" }, { value: "Completed", label: "Completed" }, { value: "Delivered", label: "Delivered" }], required: true },
      { name: "orderDate", label: "Order Date", type: "date", required: true },
      { name: "sampleCollectionDate", label: "Sample Collection Date", type: "date", required: true },
      { name: "expDate", label: "Expected Date", type: "date", required: true },
      { name: "age", label: "Age", type: "number", required: true },
      { name: "priority", label: "Priority", type: "select", options: [{ value: "Normal", label: "Normal" }, { value: "Urgent", label: "Urgent" }, { value: "STAT", label: "STAT" }], required: true },
      { name: "collectedBy", label: "Collected By", required: true }
    ],
    labSalesList: [
      { name: "invoiceId", label: "Invoice ID", required: true },
      { name: "patientName", label: "Patient Name", required: true },
      { name: "testNames", label: "Test Names", type: "textarea", required: true },
      { name: "totalAmount", label: "Total Amount", type: "number", required: true },
      { name: "discount", label: "Discount", type: "number", required: true },
      { name: "tax", label: "Tax", type: "number", required: true },
      { name: "netAmount", label: "Net Amount", type: "number", required: true },
      { name: "paymentMode", label: "Payment Mode", type: "select", options: [{ value: "Cash", label: "Cash" }, { value: "Card", label: "Card" }, { value: "Online", label: "Online" }, { value: "Insurance", label: "Insurance" }], required: true },
      { name: "paymentStatus", label: "Payment Status", type: "select", options: [{ value: "Paid", label: "Paid" }, { value: "Pending", label: "Pending" }, { value: "Refunded", label: "Refunded" }], required: true },
      { name: "saleDate", label: "Sale Date", type: "date", required: true }
    ],
    testReportGeneration: [
      { name: "reportId", label: "Report ID", required: true },
      { name: "patientName", label: "Patient Name", required: true },
      { name: "patientId", label: "Patient ID", required: true },
      { name: "age", label: "Age", type: "number", required: true },
      { name: "gender", label: "Gender", type: "select", options: [{ value: "Male", label: "Male" }, { value: "Female", label: "Female" }, { value: "Other", label: "Other" }], required: true },
      { name: "phoneNo", label: "Phone No", required: true },
      { name: "address", label: "Patient Address", type: "textarea", required: true },
      { name: "testNames", label: "Test Names", type: "textarea", required: true },
      { name: "collectedDate", label: "Collected Date", type: "date", required: true },
      { name: "reportDate", label: "Report Date", type: "date", required: true },
      { name: "doctorName", label: "Doctor Name", required: true },
      { name: "technician", label: "Technician", required: true },
      { name: "verifiedBy", label: "Verified By" },
      { name: "labName", label: "Laboratory Name", required: true },
      { name: "labAddress", label: "Laboratory Address", type: "textarea", required: true },
      { name: "labPhone", label: "Laboratory Phone", required: true },
      { name: "labEmail", label: "Laboratory Email", type: "email", required: true },
      { name: "comments", label: "Comments/Observations", type: "textarea" },
      { name: "status", label: "Status", type: "select", options: [{ value: "Draft", label: "Draft" }, { value: "Pending", label: "Pending" }, { value: "Verified", label: "Verified" }, { value: "Published", label: "Published" }, { value: "Delivered", label: "Delivered" }], required: true }
    ]
  };
  const columns = {
    testAdvisedPatientList: [
      {
        header: "Patient ID",
        accessor: "patientId",
        cell: (row) => (
          <span className="font-semibold text-[var(--primary-color)]">{row.patientId}</span>
        )
      },
      { header: "Patient Name", accessor: "patientName", clickable: true },
      { header: "Test Name", accessor: "testName" },
      { header: "Advised By", accessor: "advisedBy" },
      { header: "Test Date", accessor: "testDate" },
      {
        header: "Status",
        accessor: "status",
        cell: (row) => (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
            row.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
            }`}>
            {row.status}
          </span>
        )
      },
      {
        header: "Priority",
        accessor: "priority",
        cell: (row) => (
          <span className={`px-2 py-1 rounded text-xs font-medium ${row.priority === 'Urgent' ? 'bg-red-100 text-red-800' :
            row.priority === 'STAT' ? 'bg-purple-100 text-purple-800' :
              'bg-gray-100 text-gray-800'
            }`}>
            {row.priority}
          </span>
        )
      },
      {
        header: "Actions",
        accessor: "actions",
        cell: (row) => (
          <div className="flex space-x-2">
            <button onClick={() => handleEdit(row)} className="edit-btn rounded p-1 transition  hover:animate-bounce"><FaEdit className="text-[--primary-color]" /></button>
            <button onClick={() => handleOpenDelete(row)} className="delete-btn rounded p-1 transition  hover:animate-bounce"><FaTrash className="text-red-500" /></button>
          </div>
        ),
      },
    ],
    testOrderList: [
      {
        header: "Order ID",
        accessor: "orderId",
        cell: (row) => (
          <span className="font-semibold text-[var(--primary-color)]">{row.orderId}</span>
        )
      },
      { header: "Patient Name", accessor: "patientName", clickable: true },
      { header: "Test Name", accessor: "testName" },
      { header: "Sample Type", accessor: "sample" },
      { header: "Collection Date", accessor: "sampleCollectionDate" },
      { header: "Collected By", accessor: "collectedBy" },
      {
        header: "Payment Status",
        accessor: "paymentStatus",
        cell: (row) => (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' :
            row.paymentStatus === 'Partial' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
            }`}>
            {row.paymentStatus}
          </span>
        )
      },
      {
        header: "Report Status",
        accessor: "reportStatus",
        cell: (row) => (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.reportStatus === 'Completed' || row.reportStatus === 'Delivered' ? 'bg-green-100 text-green-800' :
            row.reportStatus === 'In Process' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
            }`}>
            {row.reportStatus}
          </span>
        )
      },
      {
        header: "Actions",
        accessor: "actions",
        cell: (row) => (
          <div className="flex space-x-2">
            <button onClick={() => handleEdit(row)} className="edit-btn rounded p-1 transition  hover:animate-bounce"><FaEdit className="text-[--primary-color]" /></button>
            <button onClick={() => handleOpenDelete(row)} className="delete-btn rounded p-1 transition  hover:animate-bounce"><FaTrash className="text-red-500" /></button>
          </div>
        ),
      },
    ],
    labSalesList: [
      {
        header: "Invoice ID",
        accessor: "invoiceId",
        cell: (row) => (
          <span className="font-semibold text-[var(--primary-color)]">{row.invoiceId}</span>
        )
      },
      { header: "Patient Name", accessor: "patientName", clickable: true },
      { header: "Test Names", accessor: "testNames" },
      { header: "Total Amount", accessor: "totalAmount", cell: (row) => `$${row.totalAmount}` },
      { header: "Discount", accessor: "discount", cell: (row) => `$${row.discount}` },
      { header: "Net Amount", accessor: "netAmount", cell: (row) => `$${row.netAmount}` },
      { header: "Payment Mode", accessor: "paymentMode" },
      {
        header: "Payment Status",
        accessor: "paymentStatus",
        cell: (row) => (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' :
            row.paymentStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
            }`}>
            {row.paymentStatus}
          </span>
        )
      },
      { header: "Sale Date", accessor: "saleDate" },
      {
        header: "Actions",
        accessor: "actions",
        cell: (row) => (
          <div className="flex space-x-2">
            {/* <button onClick={() => handlePrint(row)} className="view-btn rounded p-1 transition  hover:animate-bounce">
              <Printer size={16} />
            </button> */}
            <button onClick={() => handleEdit(row)} className="edit-btn rounded p-1 transition  hover:animate-bounce"><FaEdit className="text-[--primary-color]" /></button>
            <button onClick={() => handleOpenDelete(row)} className="delete-btn rounded p-1 transition  hover:animate-bounce"><FaTrash className="text-red-500" /></button>
          </div>
        ),
      },
    ],
    testReportGeneration: [
      {
        header: "Report ID",
        accessor: "reportId",
        cell: (row) => (
          <span className="font-semibold text-[var(--primary-color)]">{row.reportId}</span>
        )
      },
      { header: "Patient Name", accessor: "patientName", clickable: true },
      { header: "Test Names", accessor: "testNames" },
      { header: "Collected Date", accessor: "collectedDate" },
      { header: "Report Date", accessor: "reportDate" },
      { header: "Verified By", accessor: "verifiedBy" },
      {
        header: "Status",
        accessor: "status",
        cell: (row) => (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.status === 'Published' || row.status === 'Delivered' || row.status === 'Verified' ? 'bg-green-100 text-green-800' :
            row.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
            }`}>
            {row.status}
          </span>
        )
      },
      {
        header: "Actions",
        accessor: "actions",
        cell: (row) => (
          <div className="flex space-x-2">
            <button onClick={() => handlePrintReport(row)} className="view-btn rounded p-1 transition  hover:animate-bounce">
              <Printer size={16} />
            </button>
            <button onClick={() => handleEdit(row)} className="edit-btn rounded p-1 transition  hover:animate-bounce"><FaEdit className="text-[--primary-color]" /></button>
            <button onClick={() => handleOpenDelete(row)} className="delete-btn rounded p-1 transition  hover:animate-bounce"><FaTrash className="text-red-500" /></button>
          </div>
        ),
      },
    ]
  };

  const viewFields = Object.fromEntries(
    Object.entries(fields).map(([tabKey, fieldArr]) => [
      tabKey,
      fieldArr.map((f, i) => ({
        key: f.name,
        label: f.label,
        titleKey: i === 0,
        initialsKey: i === 0,
        subtitleKey: i === 2,
      })),
    ])
  );
  const tabActionsMap = {
    testAdvisedPatientList: [{ label: "Advise Test", onClick: () => openAddModal(), className: "btn btn-primary" }],
    testOrderList: [{ label: "Create Test Order", onClick: () => openAddModal(), className: "btn btn-primary" }],
    labSalesList: [{ label: "Create Lab Bill", onClick: () => openAddModal(), className: "btn btn-primary" }],
    testReportGeneration: [{ label: "Generate Report", onClick: () => openAddModal(), className: "btn btn-primary" }]
  };
  const tabActions = tabActionsMap[activeTab] || [];
  const openAddModal = () => {
    setMode("add");
    setCurrentRow(null);
    setIsOpen(true);
  };

  const handleView = (row) => {
    setCurrentRow(row);
    setMode("viewProfile");
    setIsOpen(true);
  };

  const handleEdit = (row) => {
    setCurrentRow(row);
    setMode("edit");
    setIsOpen(true);
  };

  const handleOpenDelete = (row) => {
    setCurrentRow(row);
    setMode("confirmDelete");
    setIsOpen(true);
  };

  const handlePrint = (row) => {
    console.log(`Printing ${activeTab} for ${row.patientName}`);
    // Implementation for other print types
  };

  const handlePrintReport = (row) => {
    setReportToPrint(row);
    setShowPrintPreview(true);
  };

  const handleActualPrint = () => {
    window.print();
    setShowPrintPreview(false);
  };
  const handleSave = (data) => {
    if (mode === "add") {
      const newId = Math.max(...rows[activeTab].map(r => r.id), 0) + 1;
      const newRow = { id: newId, ...data };
      if (activeTab === 'testReportGeneration') {
        newRow.testResults = {};
        newRow.labName = newRow.labName || "Central Medical Laboratory";
        newRow.labAddress = newRow.labAddress || "456 Health Ave, Medical City, State 67890";
        newRow.labPhone = newRow.labPhone || "555-123-4567";
        newRow.labEmail = newRow.labEmail || "info@centralmedlab.com";
      }

      const updated = [...rows[activeTab], newRow];
      setRows({ ...rows, [activeTab]: updated });
      console.log(`${tabs.find(t => t.value === activeTab)?.label} added successfully!`);
    } else if (mode === "edit") {
      const updated = rows[activeTab].map((r) => (r.id === currentRow.id ? { ...r, ...data } : r));
      setRows({ ...rows, [activeTab]: updated });
      console.log(`${tabs.find(t => t.value === activeTab)?.label} updated successfully!`);
    }
    setIsOpen(false);
  };

  const handleDelete = () => {
    const updated = rows[activeTab].filter((r) => r.id !== currentRow.id);
    setRows({ ...rows, [activeTab]: updated });
    console.log(`${tabs.find(t => t.value === activeTab)?.label} deleted successfully!`);
    setIsOpen(false);
  };

  const getTitle = () => {
    const label = tabs.find((t) => t.value === activeTab)?.label || "";
    if (mode === "add") return `Add ${label}`;
    if (mode === "edit") return `Edit ${label}`;
    if (mode === "viewProfile") return `${label} Details`;
    return "Confirm Delete";
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="h4-heading ">Laboratory Management System</h1>
      </div>
      <DynamicTable
        columns={columns[activeTab]}
        data={rows[activeTab]}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabActions={tabActions}
        onCellClick={(row, col) => {
          if (col.clickable) {
            handleView(row);
          }
        }} />
      <ReusableModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        mode={mode}
        title={getTitle()}
        fields={fields[activeTab]}
        viewFields={viewFields[activeTab]}
        data={currentRow}
        onSave={handleSave}
        onDelete={handleDelete}
        size="lg" />

      {showPrintPreview && reportToPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Print Preview - Test Report</h2>
              <div className="flex space-x-2">
                <button onClick={handleActualPrint} className="view-btn flex items-center">
                  <Printer size={16} /><span>Print</span>
                </button>
                <button onClick={() => setShowPrintPreview(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                  Close
                </button>
              </div>
            </div>
            <div ref={printRef}><TemplateModal report={reportToPrint} /></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabModule;