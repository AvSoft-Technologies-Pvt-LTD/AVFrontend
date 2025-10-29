import React from "react";
import { motion } from "framer-motion";
import { X, Printer, FileText, User } from "lucide-react";
import sign from "../assets/doctorsign1.png"; // Example path for doctor's signature image
const InfoRow = ({ label, value }) => (
  <div className="flex justify-between">
    <span className="text-sm font-medium text-gray-600">{label}</span>
    <span className="text-sm text-gray-900">{value}</span>
  </div>
);

const InvoiceTemplateModal = ({ isOpen, onClose, invoice }) => {
  if (!isOpen || !invoice) return null;

  const handlePrint = () => window.print();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between bg-black px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <FileText size={24} />
            <h2 className="text-xl font-semibold">Invoice Preview</h2>
          </div>
          <div className="flex items-center gap-3 no-print">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-lg bg-white/20 px-3 py-2 hover:bg-white/30"
              title="Print Template"
            >
              <Printer size={16} />
              Print
            </button>
            <button
              onClick={onClose}
              className="rounded-lg bg-white/20 p-2 hover:bg-white/30"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-8">
          <div className="mx-auto max-w-3xl bg-white shadow-lg print:shadow-none">
            {/* Lab Info */}
            <div className="flex items-center justify-between p-6 text-white bg-black">
              <div>
                <h1 className="text-2xl font-bold">City Medical Lab</h1>
                <p className="text-sm">123 Health Street, Medical City</p>
                <p className="text-sm">+1-965-0123</p>
              </div>
              <div className="text-right">
                <p className="text-sm">Invoice Report</p>
                <p className="text-xs">Generated: {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            {/* Invoice Info */}
            <div className="border-b border-gray-200 p-6 grid grid-cols-2 gap-6">
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-800">
                  <FileText size={20} />
                  Invoice Information
                </h3>
                <div className="space-y-2">
                  <InfoRow label="Invoice No:" value={invoice.invoiceNo} />
                  <InfoRow label="Treatment ID:" value={invoice.treatmentID} />
                  <InfoRow label="Hospital UID:" value={invoice.hospitalUID} />
                </div>
              </div>
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-800">
                  <User size={20} />
                  Doctor Information
                </h3>
                <div className="space-y-2">
                  <InfoRow label="Doctor:" value={invoice.doctor} />
                  <InfoRow label="Department:" value={invoice.department} />
                  <InfoRow label="Bed No:" value={invoice.bed} />
                </div>
              </div>
            </div>

            {/* Patient Info */}
            <div className="border-b border-gray-200 p-6">
              <h3 className="mb-4 text-lg font-semibold text-gray-800">Patient Information</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <InfoRow label="Name:" value={invoice.patientName} />
                  <InfoRow label="Age/Gender:" value={`${invoice.age} / ${invoice.gender}`} />
                </div>
                <div className="space-y-2">
                  <InfoRow label="Phone:" value={invoice.phone} />
                  <InfoRow label="Address:" value={invoice.address} />
                </div>
                <div className="space-y-2">
                  <InfoRow label="Admission Date:" value={invoice.admissionDate} />
                  <InfoRow label="Discharge Date:" value={invoice.dischargeDate} />
                </div>
              </div>
            </div>

            {/* Invoice Items Table */}
            <div className="border-b border-gray-200 p-6">
              <h3 className="mb-4 text-lg font-semibold text-gray-800">Invoice Items</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-3 text-left text-sm font-semibold text-gray-700">#</th>
                    <th className="py-3 text-left text-sm font-semibold text-gray-700">Item Name</th>
                    <th className="py-3 text-left text-sm font-semibold text-gray-700">Quantity</th>
                    <th className="py-3 text-left text-sm font-semibold text-gray-700">Unit Price</th>
                    <th className="py-3 text-left text-sm font-semibold text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3 text-sm text-gray-900">{index + 1}</td>
                      <td className="py-3 text-sm text-gray-900">{item.name}</td>
                      <td className="py-3 text-sm text-gray-900">{item.qty}</td>
                      <td className="py-3 text-sm text-gray-900">₹{item.price.toFixed(2)}</td>
                      <td className="py-3 text-sm text-gray-900">₹{(item.qty * item.price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-6 flex justify-between">
              <p className="text-sm text-gray-600">
                All charges are final and inclusive of applicable taxes.
              </p>
              <p className="text-sm font-bold text-gray-900">
                Grand Total: ₹{parseFloat(invoice.billAmount).toFixed(2)}
              </p>
            </div>
            </div>

            {/* Total Amount */}
            

            {/* Interpretation and Doctor Footer */}
            <div className="p-6 flex justify-between items-end mt-10">
              <div>
                <p className="text-sm text-gray-600 mb-2">Interpretation:</p>
                <p className="text-sm text-gray-900">
                  All parameters are within normal limits.
                </p>
              </div>
              <div className="text-right">
                <div className="mb-2">
                  <p className="text-sm font-medium text-gray-900">
                    {invoice.doctor}
                  </p>
                  <p className="text-xs text-gray-600">MD Pathology</p>
                  <p className="text-xs text-gray-600">License: MD-PATH-2024</p>
                     <img
            src={sign}
            alt="Doctor Signature"
            className="h-20 w-auto mt-2  object-contain"
          />
                  
                </div>
                <div className="mt-4 border-t border-gray-300 pt-2">
                  <p className="text-xs text-gray-500">Digital Signature</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default InvoiceTemplateModal;
