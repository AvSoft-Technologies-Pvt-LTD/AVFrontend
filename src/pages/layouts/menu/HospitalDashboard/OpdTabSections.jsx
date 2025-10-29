import React, { useState } from "react";
import DynamicTable from "../../../../components/microcomponents/DynamicTable";
import ReusableModal from "../../../../components/microcomponents/Modal";
import { Plus } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FaPrint } from "react-icons/fa";
import InvoiceTemplateModal from "../../../../components/InvoiceTemplateModal";
// --- Main OPD Tab Section ---
const OpdTabSection = ({ patient = {} }) => {
  const [activeTab, setActiveTab] = useState("all");

  const tabs = [
    { label: "Show All", value: "all" },
    { label: "Treatment Panel", value: "treatment" },
    { label: "Invoice List", value: "invoice" },
    { label: "Account Ledger", value: "ledger" },
    { label: "Bed/Room Info", value: "bedroom" },
  ];

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`relative cursor-pointer flex items-center gap-1 px-4 py-2 font-medium transition-colors duration-300
                ${activeTab === tab.value
                  ? "text-[#01B07A] after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:bg-[#01B07A]"
                  : "text-gray-500 hover:text-[#01B07A] before:content-[''] before:absolute before:left-0 before:bottom-0 before:h-[2px] before:w-0 before:bg-[#01B07A] before:transition-all before:duration-300 hover:before:w-full"
                }`}
              style={{ position: "relative" }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "all" && <AllPatientsTable patient={patient} />}
      {activeTab === "treatment" && <TreatmentPanelTab patient={patient} />}
      {activeTab === "invoice" && <InvoiceTable patient={patient} />}
      {activeTab === "ledger" && <LedgerTable patient={patient} />}
      {activeTab === "bedroom" && <BedRoomTable patient={patient} />}
    </div>
  );
};

export default OpdTabSection;

// --- TREATMENT PANEL TAB (Discharge Tab Only) ---
const TreatmentPanelTab = ({ patient = {} }) => {
  const [dischargeModalOpen, setDischargeModalOpen] = useState(false);
  const [dischargeDataList, setDischargeDataList] = useState([]);
  const [dischargeDetails, setDischargeDetails] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const navigate = useNavigate();

  // Example surgeon options
  const surgeonOptions = [
    { value: "Dr. Jamal Khan", label: "Dr. Jamal Khan" },
    { value: "Dr. Mehta", label: "Dr. Mehta" },
    { value: "Dr. Roy", label: "Dr. Roy" },
    { value: "Dr. Pooja Singh", label: "Dr. Pooja Singh" },
  ];

  const dischargeFields = [
    { 
      name: "icdCode", 
      label: "ICD-10 Disease Code", 
      type: "select", 
      options: [
        { value: "A001", label: "A001 - Cholera due to Vibrio cholerae 01, biovar eltor" },
        { value: "A002", label: "A002 - Cholera due to Vibrio cholerae 01, biovar cholerae" },
        { value: "B001", label: "B001 - Varicella encephalitis" }
      ] 
    },
    { name: "dischargeDate", label: "Discharge Date", type: "date" },
    { name: "nextFollowup", label: "Next Followup Date", type: "date" },
    { name: "adviceDetails", label: "Advice Details", type: "textarea" },
    { name: "testDetails", label: "Test Details", type: "textarea" },
    { name: "treatmentDetails", label: "Treatment Details", type: "textarea" },
    { name: "status", label: "Status", type: "radio", options: ["Closed", "Draft"] },
    { name: "operationName", label: "Operation Name" },
    { name: "operationDate", label: "Operation Date", type: "date" },
    { name: "surgeonName", label: "Surgeon Name", type: "select", options: surgeonOptions },
    { name: "refSuggestion", label: "Ref Suggestion" },
    { name: "referenceBy", label: "Reference By" },
  ];

  const handleDischargeSave = (values) => {
    const newDischarge = {
      id: dischargeDataList.length + 1,
      doctor: values?.referenceBy || "-",
      status: values.status || "Draft",
      disease: (
        <div>
          {values.dischargeDate || "-"}<br />
          {values.icdCode || "-"}
        </div>
      ),
      details: values,
    };
    
    setDischargeDataList(prev => [...prev, newDischarge]);
    setDischargeModalOpen(false);
    toast.success("Discharge record created successfully!");
  };

  const handleAddRecord = (patient) => {
    navigate("/hospitaldashboard/form", { state: { patient } });
  };

  const dischargeTableColumns = [
    {
      header: "Edit", 
      accessor: "edit",
      cell: (row, idx) => (
        <button
          className="text-blue-700 underline hover:text-blue-900"
          onClick={() => {
            setDischargeDetails(dischargeDataList[idx]?.details);
            setShowReport(false);
          }}
        >
          Edit
        </button>
      )
    },
    {
      header: "Report", 
      accessor: "report",
      cell: (row, idx) => (
        <button
          className="text-blue-700 underline hover:text-blue-900"
          onClick={() => {
            setDischargeDetails(dischargeDataList[idx]?.details);
            setShowReport(true);
          }}
        >
          Report
        </button>
      )
    },
    { header: "Doctor Name", accessor: "doctor" },
    { header: "Status", accessor: "status" },
    { header: "Date & ICD-10 Codes of Diseases", accessor: "disease" },
  ];

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Discharge Certificate</h3>
        <button
          className="flex items-center gap-2 bg-[#0E1630] text-white px-4 py-2 rounded hover:bg-[#0E1630] transition"
          onClick={() => setDischargeModalOpen(true)}
        >
          <Plus size={16} />
          Create Discharge
        </button>
      </div>
      
      <DynamicTable
        columns={dischargeTableColumns}
        data={dischargeDataList}
        className="border border-t-0"
        hidePagination
      />
      
      <ReusableModal
        isOpen={dischargeModalOpen}
        onClose={() => setDischargeModalOpen(false)}
        mode="add"
        title="Discharge Form"
        fields={dischargeFields}
        onSave={handleDischargeSave}
        saveLabel="Discharge"
        cancelLabel="Cancel"
        data={{}}
      />
      
      {/* Show modal for edit */}
      <ReusableModal
        isOpen={!!dischargeDetails && !showReport}
        onClose={() => setDischargeDetails(null)}
        mode="viewProfile"
        title="Discharge Report"
        data={dischargeDetails || {}}
        viewFields={dischargeFields.map(f => ({ key: f.name, label: f.label }))}
      />
      
      {/* Show full page report */}
      {showReport && dischargeDetails && (
        <DischargeReport 
          details={dischargeDetails} 
          patient={patient}
          onClose={() => { 
            setShowReport(false); 
            setDischargeDetails(null); 
          }} 
        />
      )}
    </div>
  );
};

// --- Discharge Report Component (Full Page) ---
const DischargeReport = ({ details, patient, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-auto">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-4 no-print">
          <div className="text-center w-full font-semibold text-xl">Discharge Certificate</div>
          <div className="flex gap-2">
            <button 
              onClick={handlePrint}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              Print
            </button>
            <button 
              onClick={onClose} 
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
            >
              Close
            </button>
          </div>
        </div>
        
        <div className="border rounded p-6 text-sm bg-white shadow-lg">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-[#01B07A] mb-2">Hospital Management System</h1>
            <h2 className="text-lg font-semibold">Discharge Certificate</h2>
          </div>
          
          <div className="flex justify-between mb-6">
            <div className="space-y-1">
              <div><strong>Patient Name:</strong> {patient.patientName || "-"}</div>
              <div><strong>Age:</strong> {patient.age || "-"}</div>
              <div><strong>Gender:</strong> {patient.gender || "-"}</div>
              <div><strong>Phone:</strong> {patient.phone || "-"}</div>
              <div><strong>Address:</strong> {patient.address || "-"}</div>
              <div><strong>Doctor/Consultant:</strong> {patient.doctor || "-"}</div>
              <div className="text-xs text-gray-600">{patient.consultantDetails || "PEDIATRICS-MD(D),FCPS(P),Glasgow,UK,ECUSA,Professor C4"}</div>
            </div>
            <div className="text-right space-y-1">
              <div><strong>Treatment ID:</strong> {patient.treatmentID || "-"}</div>
              <div><strong>Hospital UID:</strong> {patient.hospitalUID || "-"}</div>
              <div><strong>Admission Date:</strong> {patient.admissionDate || "-"}</div>
              <div><strong>Bed:</strong> {patient.bed || "-"}</div>
              <div><strong>Discharge Date:</strong> {details.dischargeDate || "-"}</div>
              <div className="mt-4">
                <div className="border border-black w-24 h-8 flex items-center justify-center text-xs">
                  Barcode
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <div className="font-semibold mb-2 text-[#01B07A]">Test Details</div>
              <div className="border p-3 min-h-[80px] bg-gray-50 rounded">
                {details.testDetails || "No test details provided"}
              </div>
            </div>
            <div>
              <div className="font-semibold mb-2 text-[#01B07A]">Operation Details</div>
              <div className="border p-3 min-h-[80px] bg-gray-50 rounded">
                <div><strong>Operation name:</strong> {details.operationName || "-"}</div>
                <div><strong>Surgeon:</strong> {details.surgeonName || "-"}</div>
                <div><strong>Findings:</strong> {details.refSuggestion || "-"}</div>
                <div><strong>Procedure:</strong> {details.treatmentDetails || "-"}</div>
                <div><strong>Date:</strong> {details.operationDate || "-"}</div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <div className="font-semibold mb-2 text-[#01B07A]">Previous Treatment</div>
              <div className="border p-3 min-h-[80px] bg-gray-50 rounded">
                {details.adviceDetails || "No previous treatment details"}
              </div>
            </div>
            <div>
              <div className="font-semibold mb-2 text-[#01B07A]">Current Treatment & Advice</div>
              <div className="border p-3 min-h-[80px] bg-gray-50 rounded">
                {details.treatmentDetails || "No current treatment details"}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <div className="flex-1">
              <div className="font-semibold mb-2 text-[#01B07A]">Doctor Information</div>
              <div className="border p-3 min-h-[60px] bg-gray-50 rounded">
                {details.referenceBy || "No doctor information"}
              </div>
            </div>
            <div className="flex-1">
              <div className="font-semibold mb-2 text-[#01B07A]">ICD-10 Diagnosis</div>
              <div className="border p-3 min-h-[60px] bg-gray-50 rounded">
                <div><strong>Code:</strong> {details.icdCode || "-"}</div>
                {details.icdCode === "A001" && (
                  <div className="text-sm mt-1">Cholera due to Vibrio cholerae 01, biovar eltor</div>
                )}
                {details.icdCode === "A002" && (
                  <div className="text-sm mt-1">Cholera due to Vibrio cholerae 01, biovar cholerae</div>
                )}
                {details.icdCode === "B001" && (
                  <div className="text-sm mt-1">Varicella encephalitis</div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <div>
              <div className="text-sm text-gray-600">Next Follow-up Date:</div>
              <div className="font-semibold">{details.nextFollowup || "Not scheduled"}</div>
            </div>
            <div className="text-center">
              <div className="border-t border-black w-48 mb-2"></div>
              <div className="text-sm">Doctor's Signature</div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            margin: 0;
            padding: 0;
          }
        }
      `}</style>
    </div>
  );
};

// --- ALL PATIENTS TABLE ---
const AllPatientsTable = ({ patient = {} }) => {
  return (
    <div>
      
 <div className="">      <TreatmentPanelTab  />
</div>
<div className="mb-10"> <InvoiceTable  /></div>
      
     <div className="mb-10"> <LedgerTable  /></div>
     <div className="mb-10"> <BedRoomTable  /></div>
    </div>
  );
};

// --- INVOICE TABLE ---
const itemOptions = [
  { label: "1001# General Bed - BED", value: "1001# General Bed - BED", price: 500 },
  { label: "1006# Bariatric - BED", value: "1006# Bariatric - BED", price: 800 },
  { label: "201# Ac Cabin - BED", value: "201# Ac Cabin - BED", price: 1000 },
  { label: "Non Ac Cabin - BED", value: "Non Ac Cabin - BED", price: 700 },
  { label: "1001# Doctor Visit Fee - HOS", value: "1001# Doctor Visit Fee - HOS", price: 300 },
  { label: "1016# Cleanings - HOS", value: "1016# Cleanings - HOS", price: 400 },
  { label: "12# Corona Virus - HOS", value: "12# Corona Virus - HOS", price: 1200 },
  { label: "Blood Test", value: "Blood Test", price: 200 },
  { label: "X-Ray", value: "X-Ray", price: 500 },
  { label: "MRI", value: "MRI", price: 1500 },
];

const InvoiceTable = ({ patient = {}, itemOptions = [] }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [modalMode, setModalMode] = useState("viewProfile");
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const [invoiceData, setInvoiceData] = useState([
    {
      id: 1,
      invoiceNo: "S-000063",
      billType: "Consultant",
      collection: "Collection",
      transactionDate: "22/06/2020",
      type: "Sales",
      totalBill: "200.00",
      discAdj: "0.00",
      accountMapBill: "200.00",
      accountMapPaid: "22423.00",
      dueAmount: "-22223.00",
      status: "Close",
      actionBy: "CLOUDERP",
      servicedItem: "Blood Test",
    },
  ]);

  const handlePrintInvoice = (row) => {
    const invoiceWithPatientData = {
      ...row,
      ...patient,
      items: [
        {
          name: row.servicedItem,
          qty: 1,
          price: parseFloat(row.accountMapBill),
        },
      ],
      billAmount: parseFloat(row.accountMapBill),
    };

    setSelectedInvoice(invoiceWithPatientData);
    setTemplateModalOpen(true);
  };

  const columns = [
    { header: "ID", accessor: "id", clickable: true },
    { header: "Invoice No", accessor: "invoiceNo" },
    { header: "Bill Type", accessor: "billType" },
    { header: "Serviced Item", accessor: "servicedItem" },
    { header: "Total Bill", accessor: "totalBill" },
    { header: "Due Amount", accessor: "dueAmount" },
    { header: "Status", accessor: "status" },
    {
      header: "Action",
      accessor: "action",
      cell: (row) => (
        <button
          onClick={() => handlePrintInvoice(row)}
          className="text-blue-600 hover:text-blue-800"
          title="Print Invoice"
        >
          <FaPrint />
        </button>
      ),
    },
  ];

  const viewFields = [
    { key: "id", label: "ID", titleKey: true },
    { key: "invoiceNo", label: "Invoice No" },
    { key: "billType", label: "Bill Type" },
    { key: "servicedItem", label: "Serviced & Billed Item" },
    { key: "collection", label: "Collection" },
    { key: "transactionDate", label: "Transaction Date" },
    { key: "type", label: "Type" },
    { key: "totalBill", label: "Total Bill" },
    { key: "discAdj", label: "Disc Adj" },
    { key: "accountMapBill", label: "Account Map Bill" },
    { key: "accountMapPaid", label: "Account Map Paid" },
    { key: "dueAmount", label: "Due Amount" },
    { key: "status", label: "Status" },
    { key: "actionBy", label: "Action By" },
  ];

  const formFields = [
    { name: "invoiceNo", label: "Invoice No" },
    {
      name: "billType",
      label: "Bill Type",
      type: "select",
      options: [
        { value: "Consultant", label: "Consultant" },
        { value: "General", label: "General" },
        { value: "Emergency", label: "Emergency" },
      ],
    },
    {
      name: "servicedItem",
      label: "Serviced & Billed Item",
      type: "select",
      options: itemOptions.map((item) => ({
        value: item.value,
        label: item.label,
      })),
    },
    { name: "type", label: "Type", defaultValue: "Sales" },
    { name: "discAdj", label: "Discount Adj", type: "number", defaultValue: 0 },
    {
      name: "accountMapPaid",
      label: "Account Map Paid",
      type: "number",
      defaultValue: 0,
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "Open", label: "Open" },
        { value: "Close", label: "Close" },
      ],
    },
    { name: "actionBy", label: "Action By", defaultValue: "System" },
  ];

  const handleCellClick = (row, col) => {
    if (col.accessor === "id") {
      setModalData(row);
      setModalMode("viewProfile");
      setModalOpen(true);
    }
  };

  const handleAddClick = () => {
    setModalData({});
    setModalMode("add");
    setModalOpen(true);
  };

  const handleSave = (formValues) => {
    const selectedItem = itemOptions.find(
      (item) => item.value === formValues.servicedItem
    );
    const price = selectedItem ? selectedItem.price : 0;
    const discAdj = Number(formValues.discAdj || 0);
    const totalBill = price;
    const finalUnit = price - discAdj;
    const paid = Number(formValues.accountMapPaid || 0);
    const due = finalUnit - paid;

    const newInvoice = {
      id: invoiceData.length + 1,
      invoiceNo:
        formValues.invoiceNo ||
        `S-${(1000 + invoiceData.length + 1).toString().padStart(6, "0")}`,
      billType: formValues.billType || "General",
      collection: formValues.collection || "Default",
      transactionDate: new Date().toLocaleDateString("en-GB"),
      type: formValues.type || "Sales",
      servicedItem: formValues.servicedItem,
      totalBill: totalBill.toFixed(2),
      discAdj: discAdj.toFixed(2),
      accountMapBill: finalUnit.toFixed(2),
      accountMapPaid: paid.toFixed(2),
      dueAmount: due.toFixed(2),
      status: formValues.status || "Open",
      actionBy: formValues.actionBy || "System",
    };

    setInvoiceData((prev) => [...prev, newInvoice]);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Invoice Table</h2>
        <button
          onClick={handleAddClick}
          className="flex items-center gap-2 bg-[#0E1630] text-white px-4 py-2 rounded hover:bg-[#0E1630] transition"
        >
          <Plus size={18} />
          Add Invoice
        </button>
      </div>

      <DynamicTable
        columns={columns}
        data={invoiceData}
        onCellClick={handleCellClick}
        filters={[
          {
            key: "status",
            label: "Status",
            options: [
              { value: "Open", label: "Open" },
              { value: "Close", label: "Close" },
            ],
          },
          {
            key: "billType",
            label: "Bill Type",
            options: [
              { value: "Consultant", label: "Consultant" },
              { value: "General", label: "General" },
              { value: "Emergency", label: "Emergency" },
            ],
          },
        ]}
      />

      {/* View / Add Invoice Modal */}
      <ReusableModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        title={modalMode === "add" ? "Add New Invoice" : "Invoice Details"}
        data={modalData || {}}
        fields={formFields}
        viewFields={viewFields}
        onSave={handleSave}
      />

      {/* Print Preview Template Modal */}
      <InvoiceTemplateModal
        isOpen={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        invoice={selectedInvoice}
      />
    </>
  );
};

// --- LEDGER TABLE ---
const LedgerTable = ({ patient = {} }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);

  const handlePrint = (row) => {
    // Convert row data + patient to format for InvoiceTemplateModal
    const invoiceData = {
      invoiceNo: row.vid,
      treatmentID: patient.treatmentID,
      hospitalUID: patient.hospitalUID,
      doctor: patient.doctor,
      department: "General",
      bed: patient.bed || "-",
      patientName: patient.patientName,
      age: patient.age,
      gender: patient.gender,
      phone: patient.phone,
      address: patient.address,
      admissionDate: patient.admissionDate || "-",
      dischargeDate: patient.dischargeDate || "-",
      billAmount: row.bill || row.lineTotal || 0,
      items: row.items?.map(item => ({
        name: item.name,
        qty: item.qty,
        price: item.rate
      })) || []
    };

    setModalData(invoiceData);
    setModalOpen(true);
  };

  const columns = [
    { header: "VID", accessor: "vid", clickable: true },
    { header: "Transaction Date", accessor: "transactionDate" },
    { header: "Account Head Ref", accessor: "accountHead" },
    { header: "Bill", accessor: "bill" },
    { header: "Deposit", accessor: "deposit" },
    { header: "Line Total", accessor: "lineTotal" },
    {
      header: "Action",
      accessor: "action",
      cell: (row) => (
        <button
          onClick={() => handlePrint(row)}
          className="text-blue-600 hover:text-blue-800"
          title="Print"
        >
          <FaPrint />
        </button>
      ),
    },
  ];

  // Sample data (same as before)
  const data = [
    {
      id: 1,
      vid: 311,
      transactionDate: "15/07/2025",
      accountHead: "Lab Collection (1303)",
      description: "Auto: Received - S-000198 LAB",
      voucherType: "Collection",
      bill: 0,
      deposit: 2,
      lineTotal: -2,
      actionBy: "DEMO10@EXA",
    },
    {
      id: 2,
      vid: 310,
      transactionDate: "15/07/2025",
      accountHead: "Lab Bill Income (3103)",
      description: "Auto: Bill - S-000198 LAB",
      voucherType: "Bill",
      bill: 189,
      deposit: 0,
      lineTotal: 189,
      actionBy: "DEMO10@EXA",
      items: [
        {
          name: "Total Cholesterol",
          qty: 1,
          rate: 450,
          tPrice: 450,
          discount: "2%",
          discountAmount: 9,
          total: 441,
        },
      ],
    },
  ];

  return (
    <>
      <h2 className="text-xl font-bold mb-4">Account Ledger</h2>

      <DynamicTable
        columns={columns}
        data={data}
        onCellClick={(row, col) => {
          if (col.accessor === "vid") {
            setModalData(row);
            setModalOpen(true);
          }
        }}
        filters={[
          {
            key: "voucherType",
            label: "Voucher Type",
            type: "select",
            options: [
              { value: "Bill", label: "Bill" },
              { value: "Collection", label: "Collection" },
              { value: "Indoor Return", label: "Indoor Return" },
              { value: "Debit Voucher", label: "Debit Voucher" },
            ],
          },
        ]}
      />

      {/* Invoice Template Modal for printing */}
      <InvoiceTemplateModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        invoice={modalData}
      />
    </>
  );
};

// --- BEDROOM TABLE ---
const BedRoomTable = ({ patient = {} }) => {
  const [bedData, setBedData] = useState([
    {
      id: 1,
      link: "CP-000000045 - Amir Shekh",
      bedNo: "B1",
      bedCategory: "Deluxe",
      bookingDate: "2025-07-14",
      endDate: "2025-07-20",
      bookingType: "General",
      bookStatus: "Occupied",
    },
    {
      id: 2,
      link: "CP-000000046 - Sarah Ahmed",
      bedNo: "B2",
      bedCategory: "Standard",
      bookingDate: "2025-07-15",
      endDate: "2025-07-22",
      bookingType: "Package",
      bookStatus: "Reserved",
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Add new row to table
  const handleAdd = (values) => {
    if (
      !values.link ||
      !values.bedNo ||
      !values.bedCategory ||
      !values.startDate ||
      !values.endDate ||
      !values.bookingType
    ) {
      toast.error("Please fill all required fields.");
      return;
    }
    
    const newEntry = {
      id: bedData.length + 1,
      link: values.link,
      bedNo: values.bedNo,
      bedCategory: values.bedCategory,
      bookingDate: values.startDate,
      endDate: values.endDate,
      bookingType: values.bookingType,
      bookStatus: "Occupied",
    };
    
    setBedData((prev) => [...prev, newEntry]);
    setIsModalOpen(false);
  };

  const columns = [
    { header: "Patient", accessor: "link" },
    { header: "Bed No", accessor: "bedNo" },
    { header: "Bed Category", accessor: "bedCategory" },
    { header: "Booking Date", accessor: "bookingDate" },
    { header: "End Date", accessor: "endDate" },
    { header: "Booking Type", accessor: "bookingType" },
    { header: "Book Status", accessor: "bookStatus" },
  ];

  const formFields = [
    { 
      name: "link", 
      label: "Patient", 
      type: "select", 
      options: [
        { value: "CP-000000045 - Amir Shekh", label: "CP-000000045 - Amir Shekh" },
        { value: "CP-000000046 - Sarah Ahmed", label: "CP-000000046 - Sarah Ahmed" },
        { value: "CP-000000047 - John Doe", label: "CP-000000047 - John Doe" }
      ] 
    },
    { name: "bedNo", label: "Bed No", type: "text" },
    { 
      name: "bedCategory", 
      label: "Bed Category", 
      type: "select",
      options: [
        { value: "Standard", label: "Standard" },
        { value: "Deluxe", label: "Deluxe" },
        { value: "VIP", label: "VIP" },
        { value: "ICU", label: "ICU" }
      ]
    },
    { name: "startDate", label: "Start Date", type: "date" },
    { name: "endDate", label: "End Date", type: "date" },
    { 
      name: "bookingType", 
      label: "Booking Type", 
      type: "select", 
      options: [
        { value: "General", label: "General" },
        { value: "Package", label: "Package" },
        { value: "Draft", label: "Draft" },
      ] 
    },
  ];

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Bed/Room Information</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#01B07A] text-white rounded hover:bg-[#004f3d] transition"
        >
          <Plus size={16} /> Add Bed Booking
        </button>
      </div>
      
      <DynamicTable 
        columns={columns} 
        data={bedData}
        filters={[
          {
            key: "bookStatus",
            label: "Status",
            options: [
              { value: "Occupied", label: "Occupied" },
              { value: "Reserved", label: "Reserved" },
              { value: "Available", label: "Available" }
            ]
          },
          {
            key: "bedCategory",
            label: "Category",
            options: [
              { value: "Standard", label: "Standard" },
              { value: "Deluxe", label: "Deluxe" },
              { value: "VIP", label: "VIP" },
              { value: "ICU", label: "ICU" }
            ]
          }
        ]}
      />

      <ReusableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode="add"
        title="Room Booking"
        onSave={handleAdd}
        data={{}}
        fields={formFields}
      />
    </>
  );
};