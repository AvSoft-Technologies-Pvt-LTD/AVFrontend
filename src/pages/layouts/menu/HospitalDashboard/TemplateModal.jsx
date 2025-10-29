import React from "react";
import { motion } from "framer-motion";
import { X, Printer, FileText, User } from "lucide-react";

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between">
    <span className="text-sm font-medium text-gray-600">{label}</span>
    <span className="text-sm text-gray-900">{value}</span>
  </div>
);

const TemplateModal = ({ isOpen, onClose, template }) => {
  if (!isOpen || !template) return null;

  const handlePrint = () => window.print();

  const testRows = (test) => [
    test === "Hemoglobin"
      ? "14.5"
      : test === "WBC Count"
      ? "7.2"
      : test === "Platelets"
      ? "320"
      : test === "RBC Count"
      ? "4.8"
      : "---",
    test === "Hemoglobin"
      ? "g/dL"
      : test === "WBC Count"
      ? "10³/L"
      : test === "Platelets"
      ? "10³/L"
      : test === "RBC Count"
      ? "10⁶/L"
      : "---",
    test === "Hemoglobin"
      ? "13.0-17.0"
      : test === "WBC Count"
      ? "4.0-11.0"
      : test === "Platelets"
      ? "150-400"
      : test === "RBC Count"
      ? "4.5-5.5"
      : "---",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between bg-[var(--primary-color)] px-6 py-4 text-white print:text-white print:px-6 print:py-4 print:flex print:items-center print:justify-between" style={{ backgroundColor: template.headerColor, printColorAdjust: 'exact' }}>
          <div className="flex items-center gap-3">
            <FileText size={24} />
            <h2 className="text-xl font-semibold">Template Preview</h2>
          </div>
          <div className="flex items-center gap-3 no-print">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-lg bg-white/20 px-3 py-2 text-white hover:bg-white/30 transition-colors"
              title="Print Template"
            >
              <Printer size={16} />
              Print
            </button>
            <button
              onClick={onClose}
              className="rounded-lg bg-white/20 p-2 text-white hover:bg-white/30 transition-colors"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        {/* Content */}
        <div className="p-8">
          <div className="mx-auto max-w-4xl bg-white shadow-lg print:shadow-none">
            {/* Lab Header */}
            <div
              className="flex items-center justify-between p-6 text-white"
              style={{ backgroundColor: template.headerColor }}
            >
              <div className="flex items-center gap-4">
                {template.logoUrl && (
                  <img
                    src={template.logoUrl}
                    alt="Lab Logo"
                    className="h-16 w-16 rounded-full object-cover"
                  />
                )}
                <div>
                  <h1 className="text-2xl font-bold">{template.labName}</h1>
                  <p className="text-sm opacity-90">{template.labAddress}</p>
                  <p className="text-sm opacity-90">{template.labContact}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90">Laboratory Report</p>
                <p className="text-xs opacity-75">
                  Generated: {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
            {/* Info */}
            <div className="border-b border-gray-200 p-6 grid grid-cols-2 gap-6">
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-800">
                  <FileText size={20} />
                  Template Information
                </h3>
                <div className="space-y-2">
                  <InfoRow label="Template Title:" value={template.templateTitle} />
                  <InfoRow label="Total Items:" value={template.totalItemCount} />
                  <InfoRow label="Created:" value={template.createdDate} />
                </div>
              </div>
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-800">
                  <User size={20} />
                  Doctor Information
                </h3>
                <div className="space-y-2">
                  <InfoRow label="Doctor Name:" value={template.doctorName} />
                  <InfoRow label="Specialization:" value="Pathology" />
                  <InfoRow label="License:" value="MD-PATH-2024" />
                </div>
              </div>
            </div>
            {/* Patient */}
            <div className="border-b border-gray-200 p-6">
              <h3 className="mb-4 text-lg font-semibold text-gray-800">
                Sample Patient Information
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <InfoRow label="Patient Name:" value="John Doe" />
                  <InfoRow label="Age/Gender:" value="35/Male" />
                </div>
                <div className="space-y-2">
                  <InfoRow label="Patient ID:" value="PAT-2024-001" />
                  <InfoRow label="Sample Type:" value="Blood" />
                </div>
                <div className="space-y-2">
                  <InfoRow
                    label="Collection Date:"
                    value={new Date().toLocaleDateString()}
                  />
                  <InfoRow
                    label="Report Date:"
                    value={new Date().toLocaleDateString()}
                  />
                </div>
              </div>
            </div>
            {/* Tests */}
            <div className="border-b border-gray-200 p-6">
              <h3 className="mb-4 text-lg font-semibold text-gray-800">
                Test Results
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="py-3 text-left text-sm font-semibold text-gray-700">
                        Test Name
                      </th>
                      <th className="py-3 text-left text-sm font-semibold text-gray-700">
                        Result
                      </th>
                      <th className="py-3 text-left text-sm font-semibold text-gray-700">
                        Units
                      </th>
                      <th className="py-3 text-left text-sm font-semibold text-gray-700">
                        Reference Range
                      </th>
                      <th className="py-3 text-left text-sm font-semibold text-gray-700">
                        Remarks
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {template.tests &&
                      template.tests.map((test, i) => (
                        <tr key={i} className="border-b border-gray-100">
                          <td className="py-3 text-sm text-gray-900">{test}</td>
                          <td className="py-3 text-sm text-gray-900">
                            {testRows(test)[0]}
                          </td>
                          <td className="py-3 text-sm text-gray-900">
                            {testRows(test)[1]}
                          </td>
                          <td className="py-3 text-sm text-gray-900">
                            {testRows(test)[2]}
                          </td>
                          <td className="py-3 text-sm text-gray-900">
                            <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                              Normal
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Footer */}
            <div className="p-6 flex justify-between items-end">
              <div>
                <p className="text-sm text-gray-600 mb-2">Interpretation:</p>
                <p className="text-sm text-gray-900">
                  All parameters are within normal limits.
                </p>
              </div>
              <div className="text-right">
                <div className="mb-2">
                  <p className="text-sm font-medium text-gray-900">
                    {template.doctorName}
                  </p>
                  <p className="text-xs text-gray-600">MD Pathology</p>
                  <p className="text-xs text-gray-600">License: MD-PATH-2024</p>
                  {/* Doctor Signature Image */}
                  {template.drSignUrl && (
                    <img
                      src={template.drSignUrl}
                      alt="Doctor Signature"
                     className="h-12 w-auto mt-2 ml-10 object-contain"

                    />
                  )}
                </div>
                <div className="mt-4 border-t border-gray-300 pt-2">
                  <p className="text-xs text-gray-500">Digital Signature</p>
                </div>
              </div>
            </div>
            {/* Disclaimer */}
            {/* <div
              className="px-6 py-4 text-center text-white"
              style={{ backgroundColor: template.headerColor }}
            >
              <p className="text-xs opacity-90">
                This report is computer-generated and does not require a
                physical signature. For queries, contact {template.labContact}
              </p>
            </div> */}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TemplateModal;
