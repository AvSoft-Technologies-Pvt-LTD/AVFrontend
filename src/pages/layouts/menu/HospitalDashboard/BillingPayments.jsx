
import React, { useState } from 'react';
import { CreditCard, Wallet, ShieldCheck, AlertCircle, FileText, X, Building2, Phone, Mail, MapPin } from 'lucide-react';

const billingSummary = [
  { title: 'Total Billing', value: '₹ 12,50,000', icon: <Wallet className="w-6 h-6" />, borderClass: 'card-border-primary', iconClass: 'card-icon-primary card-icon-white' },
  { title: 'Paid Amount', value: '₹ 9,80,000', icon: <CreditCard className="w-6 h-6" />, borderClass: 'card-border-accent', iconClass: 'card-icon-accent card-icon-white' },
  { title: 'Pending Payments', value: '₹ 2,70,000', icon: <AlertCircle className="w-6 h-6" />, borderClass: 'card-border-primary', iconClass: 'card-icon-primary card-icon-white' },
  { title: 'Insurance Covered', value: '₹ 6,40,000', icon: <ShieldCheck className="w-6 h-6" />, borderClass: 'card-border-accent', iconClass: 'card-icon-accent card-icon-white' }
];

const invoiceData = [
  { invoice: 'INV-2023-001', patient: 'Amit Kumar', amount: '₹12,500', date: '12/05/2023', status: 'Paid', method: 'Insurance' },
  { invoice: 'INV-2023-002', patient: 'Priya Sharma', amount: '₹8,900', date: '15/05/2023', status: 'Pending', method: 'Cash' },
  { invoice: 'INV-2023-003', patient: 'Rahul Singh', amount: '₹15,200', date: '18/05/2023', status: 'Paid', method: 'UPI' },
  { invoice: 'INV-2023-004', patient: 'Sunita Patel', amount: '₹7,300', date: '10/05/2023', status: 'Overdue', method: 'Credit Card' }
];

const statusStyle = {
  Paid: 'bg-green-100 text-green-600 border border-green-300 flex items-center justify-center rounded-full min-w-[72px] min-h-[28px] max-h-[28px] px-2 py-0.5 text-xs font-semibold',
  Pending: 'bg-yellow-100 text-yellow-700 border border-yellow-300 flex items-center justify-center rounded-full min-w-[72px] min-h-[28px] max-h-[28px] px-2 py-0.5 text-xs font-semibold',
  Overdue: 'bg-red-100 text-red-600 border border-red-300 flex items-center justify-center rounded-full min-w-[72px] min-h-[28px] max-h-[28px] px-2 py-0.5 text-xs font-semibold'
};

export default function BillingAndPayments() {
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  // Pagination state and logic
   const [state, setState] = useState({ currentPage: 1 });
  const pageSize = 4; // Show 4 rows per page
  const totalPages = Math.ceil(invoiceData.length / pageSize);
  const currentInvoices = invoiceData.slice(
    (state.currentPage - 1) * pageSize,
    state.currentPage * pageSize
  );

  return (
    <div className="bg-[var(--color-surface)] rounded-xl shadow-md p-6 mt-6">
      <h3 className="h3-heading mb-6 flex items-center">
        <span className="w-1 h-6 bg-[var(--accent-color)] rounded-full inline-block mr-3" />
        Billing & Payments
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {billingSummary.map((card, i) => (
          <div
            key={i}
            className={`card-stat ${card.borderClass} card-animate-pulse`}
            tabIndex={0}
            onMouseEnter={e => e.currentTarget.classList.add('card-animate-pulse')}
            onAnimationEnd={e => e.currentTarget.classList.remove('card-animate-pulse')}
          >
            <div className="card-content">
              <div className="card-info">
                <p className="subheading font-semibold text-xs">{card.title}</p>
                <p className="paragraph font-bold text-lg">{card.value}</p>
              </div>
              <div className={`card-icon ${card.iconClass}`}>{card.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="table-container animate-slideIn">
          <thead className="table-head">
            <tr>
              <th className="px-6 py-3 text-left">Invoice</th>
              <th className="px-6 py-3 text-left">Patient</th>
              <th className="px-6 py-3 text-left">Amount</th>
              <th className="px-6 py-3 text-left">Date</th>
              <th className="px-6 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {currentInvoices.map((item, i) => (
             <tr
  key={i}
  className="transition-colors duration-150 cursor-pointer"
>
              
<td className="px-6 py-4">
  <button
    className="text-[var(--primary-color)] font-semibold hover:text-[var(--accent-color)] transition-colors duration-200 focus:outline-none"
    onClick={() => setSelectedInvoice(item)}
  >
    {item.invoice}
  </button>
</td>

                <td className="px-6 py-4">{item.patient}</td>
                <td className="px-6 py-4">{item.amount}</td>
                <td className="px-6 py-4">{item.date}</td>
                <td className="px-6 py-4">
                  <span className={statusStyle[item.status]}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      <div className="flex justify-end items-center mt-4">
        <div className="flex items-center gap-2">
          <button
            disabled={state.currentPage === 1}
            onClick={() => setState(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
            className={`edit-btn ${state.currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Previous
          </button>
          <span>
            Page {state.currentPage} of {totalPages || 1}
          </span>
          <button
            disabled={state.currentPage === totalPages || totalPages === 0}
            onClick={() => setState(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
            className={`edit-btn ${state.currentPage === totalPages || totalPages === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Next
          </button>
        </div>
      </div>

      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm modal-fadeIn">
          <div className="relative w-full max-w-lg rounded-xl overflow-hidden shadow-2xl modal-slideUp bg-white border border-[var(--accent-color)]">
            {/* Close Button */}
            <button
              onClick={() => setSelectedInvoice(null)}
              className="absolute top-4 right-4 p-2 bg-[var(--accent-color)]/10 hover:bg-[var(--accent-color)]/30 rounded-full transition-all duration-200 text-[var(--primary-color)] hover:text-[var(--accent-color)] shadow"
              aria-label="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
            {/* Invoice Header */}
            <div className="px-8 pt-8 pb-4 border-b border-gray-100 flex items-center gap-3">
              <div className="p-2 rounded bg-[var(--accent-color)] flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-[var(--primary-color)]">Invoice</h3>
                <span className="text-xs text-[var(--accent-color)] font-semibold">{selectedInvoice.invoice}</span>
              </div>
            </div>
            {/* Invoice Body */}
            <div className="px-8 py-6 flex flex-col gap-6">
              {/* Patient & Hospital */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Building2 className="w-4 h-4 text-[var(--accent-color)]" />
                  <span className="font-semibold">City Hospital</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <MapPin className="w-3 h-3" /> 123 Medical Center Drive, Healthcare City
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Phone className="w-3 h-3" /> +91 98765 43210
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Mail className="w-3 h-3" /> contact@cityhospital.com
                </div>
              </div>
              {/* Patient Info */}
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500">Patient</span>
                <span className="font-semibold text-[var(--primary-color)]">{selectedInvoice.patient}</span>
              </div>
              {/* Invoice Details */}
              <div className="flex flex-col gap-2 border-t border-b border-gray-100 py-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Date</span>
                  <span className="text-[var(--primary-color)] text-sm">{selectedInvoice.date}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Amount</span>
                  <span className="font-bold text-lg text-[var(--accent-color)]">{selectedInvoice.amount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Payment Method</span>
                  <span className="flex items-center gap-1 text-[var(--primary-color)] text-sm font-medium">
                    {selectedInvoice.method === 'Credit Card' && <CreditCard className="w-4 h-4" />}
                    {selectedInvoice.method === 'UPI' && <Wallet className="w-4 h-4 text-[var(--accent-color)]" />}
                    {selectedInvoice.method === 'Cash' && <Wallet className="w-4 h-4" />}
                    {selectedInvoice.method === 'Insurance' && <ShieldCheck className="w-4 h-4 text-[var(--accent-color)]" />}
                    {selectedInvoice.method}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyle[selectedInvoice.status]}`}>
                    {selectedInvoice.status}
                  </span>
                </div>
              </div>
              {/* Thank You */}
              <div className="flex flex-col items-center gap-1 mt-2">
                <span className="text-xs text-gray-400">Thank you for choosing City Hospital</span>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="btn-secondary mt-2"
                >
                  <span className="paragraph text-white">Close</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
