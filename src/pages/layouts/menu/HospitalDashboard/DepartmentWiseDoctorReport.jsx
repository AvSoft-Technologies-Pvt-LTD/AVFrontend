
import React, { useRef } from "react";
import DynamicTable from "../../../../components/microcomponents/DynamicTable";

const doctorOptions = [
  { label: "Dr. Kamal Khan", value: "002" },
  { label: "Dr. Jamil Khan", value: "003" },
];

const departmentOptions = [
  { label: "Cardiology", value: "cardiology" },
  { label: "Orthopedics", value: "orthopedics" },
  { label: "ENT", value: "ent" },
];

const columns = [
  { header: "Serial", accessor: "serial" },
  { header: "Outdoor Bill Item", accessor: "item" },
  { header: "Rate", accessor: "rate" },
  { header: "Patient Quantity", accessor: "qty" },
  { header: "Total Amount", accessor: "amount" },
];

const tableData = [
  {
    id: 1,
    serial: 1,
    item: "Consultation Fee",
    rate: 500,
    qty: 4,
    amount: 2000,
    department: "cardiology",
    doctor: "002",
    date: "2025-07-15",
  },
  {
    id: 2,
    serial: 2,
    item: "ECG",
    rate: 300,
    qty: 2,
    amount: 600,
    department: "cardiology",
    doctor: "003",
    date: "2025-07-16",
  },
  {
    id: 3,
    serial: 3,
    item: "X-Ray",
    rate: 400,
    qty: 1,
    amount: 400,
    department: "orthopedics",
    doctor: "002",
    date: "2025-07-17",
  },
  {
    id: 4,
    serial: 4,
    item: "ENT Checkup",
    rate: 350,
    qty: 3,
    amount: 1050,
    department: "ent",
    doctor: "003",
    date: "2025-07-18",
  },
];

// Filters for DynamicTable: Doctor, Department, From Date, To Date
const filters = [
  {
    key: "doctor",
    label: "Doctor Name",
    options: [{ value: "", label: "All Doctors" }, ...doctorOptions],
  },
  {
    key: "department",
    label: "Department Name",
    options: [{ value: "", label: "All Departments" }, ...departmentOptions],
  },
  
];



const DepartmentWiseDoctorReport = () => {
  const printRef = useRef();

  const handlePrint = () => {
    // For print, filter manually using filters
    // Get filter values from DOM
    const doctor = document.querySelector('[name="doctor"]')?.value || "";
    const department = document.querySelector('[name="department"]')?.value || "";
    const fromDate = document.querySelector('[name="date"]')?.value || "";
    const toDate = document.querySelector('[name="dateTo"]')?.value || "";

    const filteredRows = tableData.filter((item) => {
      const matchesDepartment = !department || item.department === department;
      const matchesDoctor = !doctor || item.doctor === doctor;
      const matchesFrom = !fromDate || new Date(item.date) >= new Date(fromDate);
      const matchesTo = !toDate || new Date(item.date) <= new Date(toDate);
      return matchesDepartment && matchesDoctor && matchesFrom && matchesTo;
    });

    const tableRows = filteredRows
      .map(
        (item) =>
          `<tr>
            <td>${item.serial}</td>
            <td>${item.item}</td>
            <td>${item.rate}</td>
            <td>${item.qty}</td>
            <td>${item.amount}</td>
          </tr>`
      )
      .join("");

    const totalQty = filteredRows.reduce((acc, item) => acc + Number(item.qty), 0);
    const totalAmount = filteredRows
      .reduce((acc, item) => acc + Number(item.amount), 0)
      .toFixed(2);

    const printWindow = window.open("", "", "height=600,width=800");
    printWindow.document.write(`
      <html>
        <head>
          <title>Report</title>
          <style>
            @media print {
              .print\\:hidden { display: none !important; }
            }
            body {
              font-family: 'Segoe UI', Roboto, sans-serif;
              padding: 40px;
              color: #1f2937;
              background-color: #ffffff;
              font-size: 14px;
              line-height: 1.6;
            }
            .header {
              text-align: center;
              margin-bottom: 6px;
            }
            .header h1 {
              font-size: 24px;
              font-weight: 700;
              color: #1d4ed8;
              margin: 0;
            }
            .address {
              font-size: 13px;
              color: #374151;
              font-style: italic;
              margin: 4px 0 6px;
            }
            .line {
              border-top: 1px solid #e5e7eb;
              margin: 12px 0;
            }
            .meta-top {
              text-align: center;
              font-size: 13px;
              font-weight: 500;
              color: #1f2937;
              margin: 10px 0 6px;
            }
            .section-title {
              text-align: center;
              font-size: 15px;
              font-weight: 600;
              margin: 8px 0 10px;
              color: #111827;
              text-transform: capitalize;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
              border-radius: 6px;
              overflow: hidden;
            }
            th {
              background-color: #f3f4f6;
              color: #1f2937;
              font-weight: 600;
              padding: 10px;
              border: 1px solid #d1d5db;
              text-align: center;
            }
            td {
              padding: 10px;
              border: 1px solid #e5e7eb;
              text-align: center;
              color: #111827;
            }
            tr:nth-child(even) {
              background-color: #f9fafb;
            }
            .footer {
              margin-top: 20px;
              font-size: 14px;
              font-weight: 600;
              text-align: right;
              color: #111827;
              border-top: 2px solid #d1d5db;
              padding-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>AV Swasthya Health Care</h1>
            <div class="address">58/10, 5th Floor, Free School Street, Panthapath, Kalabagan, Dhaka 1205</div>
          </div>
          <div class="line"></div>
          <div class="meta-top">
            Outdoor Details
          </div>
          <h2 class="section-title">Outdoor Details</h2>
          <table>
            <thead>
              <tr>
                <th>Serial</th>
                <th>Outdoor Bill Item</th>
                <th>Rate</th>
                <th>Qty</th>
                <th>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          <div class="footer">
            Report Total Quantity: ${totalQty} | Total Amount: ₹${totalAmount}
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="p-6">
      <div ref={printRef}>
        <div className="flex flex-col items-center text-center mb-16 relative">
          
          <div className="absolute right-0 top-0 print:hidden ">
            <button
              onClick={handlePrint}
              className="btn btn-primary"
            >
              Print Report
            </button>
          </div>
        </div>
        {/* DynamicTable with filters */}
        <div className="mt-6">
          <DynamicTable columns={columns} data={tableData} filters={filters} />
        </div>
        <div className="total mt-2 px-4">
          Report Total Quantity:{" "}
          {tableData.reduce((acc, item) => acc + Number(item.qty), 0)} | Total
          Amount: ₹
          {tableData
            .reduce((acc, item) => acc + Number(item.amount), 0)
            .toFixed(2)}
                </div>
      </div>
    </div>
  );
};

export default DepartmentWiseDoctorReport;