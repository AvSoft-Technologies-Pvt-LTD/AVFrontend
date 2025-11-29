import React, { useState } from 'react';
import DynamicTable from '../../../../components/microcomponents/DynamicTable';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MOCK_PAYMENTS = [
  {
    id: 1,
    patient_name: 'John Doe',
    test_name: 'Complete Blood Count (CBC)',
    amount: 125.50,
    payment_date: '2023-11-28',
    payment_method: 'Credit Card',
    status: 'Paid',
    invoice_id: 'INV-2023-001',
    receipt_number: 'RCPT-2023-001',
  },
  {
    id: 2,
    patient_name: 'Jane Smith',
    test_name: 'Lipid Profile',
    amount: 89.99,
    payment_date: '2023-11-27',
    payment_method: 'Insurance',
    status: 'Paid',
    invoice_id: 'INV-2023-002',
    receipt_number: 'RCPT-2023-002',
  },
  {
    id: 3,
    patient_name: 'Robert Johnson',
    test_name: 'Thyroid Panel',
    amount: 150.00,
    payment_date: '2023-11-26',
    payment_method: 'Debit Card',
    status: 'Unpaid',
    invoice_id: 'INV-2023-003',
    receipt_number: null,
  },
];

export default function Payments() {
  const [payments, setPayments] = useState(MOCK_PAYMENTS);

  const columns = [
    { header: 'Invoice ID', accessor: 'invoice_id' },
    { header: 'Patient Name', accessor: 'patient_name' },
    { header: 'Test Name', accessor: 'test_name' },
    { 
      header: 'Amount', 
      accessor: 'amount', 
      cell: (row) => `$${row.amount.toFixed(2)}` 
    },
    { header: 'Payment Date', accessor: 'payment_date' },
    { header: 'Payment Method', accessor: 'payment_method' },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => (
        <span
          className={`status-badge ${
            row.status === 'Paid' ? 'status-paid' : row.status === 'Unpaid' ? 'status-unpaid' : 'status-partial'
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toast.info(`Viewing receipt for ${row.patient_name}`);
            }}
            className="p-2 hover:bg-blue-500/10 text-blue-400 rounded-lg transition-colors"
            title="View Receipt"
          >
            View Receipt
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4">
      <ToastContainer position="top-right" theme="dark" />
      <DynamicTable
        title="Payments"
        columns={columns}
        data={payments}
        tabActions={[
          {
            label: 'Generate Report',
            onClick: () => toast.info('Report generation would be implemented here'),
          },
        ]}
      />
    </div>
  );
}
