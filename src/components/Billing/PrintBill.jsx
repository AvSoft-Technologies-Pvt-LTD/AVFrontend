import React, { useRef } from "react";
import { motion } from "framer-motion";
import { X, Printer } from "lucide-react";
import InvoiceTemplate from "../../components/microcomponents/TableComponents/InvoiceTemplate";

export default function PrintBill({ bill, onClose }) {
  const printRef = useRef();

  const handlePrint = () => {
    window.print();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        ref={printRef}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center no-print z-10">
          <h2 className="text-xl font-bold text-gray-800" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Bill Preview
          </h2>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              data-testid="print-invoice-btn"
              className="px-4 py-2 bg-[var(--accent-color)] text-white rounded-lg hover:bg-[var(--accent-color)]/90 transition-colors flex items-center gap-2"
            >
              <Printer size={20} />
              Print
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-8">
          <InvoiceTemplate invoice={bill} showActions={false} />
        </div>
      </motion.div>
    </motion.div>
  );
}