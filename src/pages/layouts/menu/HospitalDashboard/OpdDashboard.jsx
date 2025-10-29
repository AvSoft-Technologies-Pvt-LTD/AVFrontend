import React, { useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import OpdTabSection from "./OpdTabSections";

const testBillingButtons = [
  { label: "LAB Billing", key: "lab" },
  { label: "Dental Billing", key: "dental" },
  { label: "HOS Billing", key: "hos" },
  { label: "Ordered Test", key: "ordered" },
  { label: "Pharmacy Billing", key: "pharmacy" },
];

const OpdDashboard = () => {
  const { treatmentId } = useParams();
  const { state } = useLocation();
  const patient = state || {};
  const navigate = useNavigate();

  const cardData = [
    { label: "Total Bill", value: "895.00", color: "bg-blue-500" },
    { label: "Return Bill", value: "0.00", color: "bg-cyan-500" },
    { label: "Discount/Adjustment", value: "91.00", color: "bg-teal-500" },
    { label: "Payable Bill", value: "804.00", color: "bg-green-500" },
    { label: "Total Deposit", value: "755.00", color: "bg-emerald-600" },
    { label: "Total Due", value: "-49.00", color: "bg-yellow-400" },
  ];

  const [invoiceData, setInvoiceData] = useState([]);
  const [ledgerData, setLedgerData] = useState([]);

  const [showTestForm, setShowTestForm] = useState(false);
  const [testType, setTestType] = useState("");
  const [testAmount, setTestAmount] = useState("");
  const [testDiscount, setTestDiscount] = useState("");
  const [testPaid, setTestPaid] = useState("");

  const handleBillingClick = (type) => {
    setTestType(type);
    setShowTestForm(true);
  };

  const handleSaveTest = () => {
    const newInvoice = {
      id: invoiceData.length + 1,
      invoiceNo: `S-00018${invoiceData.length + 1}`,
      billType: testType,
      transactionDate: new Date().toLocaleDateString(),
      totalBill: testAmount,
      discount: testDiscount,
      paid: testPaid,
      due: (Number(testAmount) - Number(testDiscount) - Number(testPaid)).toFixed(2),
      status: "Close",
    };
    setInvoiceData([...invoiceData, newInvoice]);

    const newLedger = {
      id: ledgerData.length + 1,
      vid: (20 + ledgerData.length).toString(),
      transactionDate: new Date().toLocaleDateString(),
      accountHead: testType,
      description: "Test Billing",
      bill: testAmount,
      deposit: testPaid,
    };
    setLedgerData([...ledgerData, newLedger]);

    setShowTestForm(false);
    setTestType("");
    setTestAmount("");
    setTestDiscount("");
    setTestPaid("");
  };

  return (
    <div className="p-6 space-y-6 font-[Poppins] bg-[#f9fafb]">
      {/* Patient Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[var(--color-surface)] border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="space-y-2 text-sm text-gray-700">
          <p><strong>Patient Name:</strong> {patient.patientName}</p>
          <p><strong>Age:</strong> {patient.age || "-"}</p>
          <p><strong>Gender:</strong> {patient.gender || "-"}</p>
          <p><strong>Phone:</strong> {patient.phone}</p>
          <p><strong>Address:</strong> {patient.address || "-"}</p>
          <p><strong>Doctor/Consultant:</strong><br />{patient.doctor}</p>
        </div>
        <div className="space-y-2 text-sm text-gray-700">
          <p><strong>Treatment ID:</strong> {patient.treatmentID || treatmentId}</p>
          <p><strong>Hospital UID:</strong> {patient.hospitalUID}</p>
          <p><strong>Admission Date:</strong> {patient.admissionDate}</p>
          <p><strong>Bed:</strong> {patient.bed}</p>
          <p><strong>Discharge Date:</strong> {patient.dischargeDate}</p>
          <div className="mt-3 w-28 h-10 bg-gray-200 text-center text-xs font-semibold text-gray-600 rounded flex items-center justify-center shadow-inner">
            Barcode
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {cardData.map((item, i) => (
          <div key={i} className="bg-[var(--color-surface)] border border-gray-100 rounded-2xl p-5 shadow-md flex items-center justify-between">
            <div>
              <p className="text-xl font-semibold text-[var(--primary-color)]">{item.value}</p>
              <p className="text-sm text-gray-500">{item.label}</p>
            </div>
            <span className="p-3 rounded-full" style={{ backgroundColor: item.color, color: "#fff" }}>
              <ArrowRight size={20} />
            </span>
          </div>
        ))}
      </div>

      {/* Billing Buttons */}
      <div className="mt-2 flex flex-wrap gap-2">
        {testBillingButtons.map((btn) => (
          <button
            key={btn.key}
            onClick={() => handleBillingClick(btn.key)}
            className="bg-[var(--primary-color)] text-white text-xs px-4 py-2 rounded-md hover:opacity-90 transition"
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Test Billing Form */}
      {showTestForm && (
        <div className="bg-white border rounded-lg p-4 space-y-4 shadow-md">
          <h4 className="text-md font-semibold">New {testType} Billing</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <input
              type="number"
              placeholder="Amount"
              value={testAmount}
              onChange={(e) => setTestAmount(e.target.value)}
              className="border px-3 py-2 rounded w-full"
            />
            <input
              type="number"
              placeholder="Discount"
              value={testDiscount}
              onChange={(e) => setTestDiscount(e.target.value)}
              className="border px-3 py-2 rounded w-full"
            />
            <input
              type="number"
              placeholder="Paid"
              value={testPaid}
              onChange={(e) => setTestPaid(e.target.value)}
              className="border px-3 py-2 rounded w-full"
            />
            <button
              onClick={handleSaveTest}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Tabbed DynamicTable Section */}
      <OpdTabSection patient={patient} />
    </div>
  );
};

export default OpdDashboard;