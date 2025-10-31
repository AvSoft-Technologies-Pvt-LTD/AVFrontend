import React from "react";
import { Calendar, CreditCard, Mail, MapPin, Phone, Printer, Stethoscope, User } from "lucide-react";

const InvoiceTemplate = React.memo(({ invoice, showActions, onPrint, onPay }) => {
  if (!invoice) return null;

  const handlePrint = () => {
    if (onPrint) {
      onPrint(invoice);
    } else {
      window.print();
    }
  };

  const handlePay = () => {
    if (onPay) {
      onPay(invoice);
    } else {
      alert(`Pay ₹${invoice.billedAmount-invoice.paidAmount}`);
    }
  };
  console.log("Rendering InvoiceTemplate for invoice:", invoice);

  return (
    <>
  <div id="invoice-print-template" className="invoice-container bg-white rounded-lg p-6" style={{ minHeight: '420px' }}>
        {/* Header Section */}
        <div className="flex justify-between items-start mb-6 pb-4 border-b-2 border-[var(--accent-color)]">
          <div>
            <h1 className="h2-heading">INVOICE</h1>
            <p className="text-sm text-gray-600 font-medium">#{invoice.invoiceId}</p>
          </div>
        <div id="invoice-print-template" className="invoice-container bg-white rounded-lg p-6">
            <div className="w-12 h-12 bg-[var(--accent-color)] rounded-lg flex items-center justify-center">
              <Stethoscope className="text-white" size={20} />
            </div>
            <div>
              <div className="text-lg font-semibold text-[var(--accent-color)]">DigiHealth</div>
              <div className="no-print text-xs text-gray-500">Healthcare Solutions</div>
            </div>
          </div>
        </div>
        {/* Invoice and Patient Details */}
        <div className="grid grid-cols-2 gap-8 mb-6">
          <div>
            <h3 className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide border-b border-gray-200 pb-1">
              Invoice Details
            </h3>
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                <span>Date: {invoice.date}</span>
              </div>
              <div className="flex items-center text-sm">
                <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                <span>
                  Due:{" "}
                  {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center text-sm">
                <Stethoscope className="w-4 h-4 mr-2 text-gray-500" />
                <span>Doctor: {invoice.doctorName}</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide border-b border-gray-200 pb-1">
              Patient Information
            </h3>
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <User className="w-4 h-4 mr-2 text-gray-500" />
                <span className="font-medium">{invoice.patientName}</span>
              </div>
              <div className="flex items-center text-sm">
                <Mail className="w-4 h-4 mr-2 text-gray-500" />
                <span>{invoice.patientEmail}</span>
              </div>
              <div className="flex items-center text-sm">
                <Phone className="w-4 h-4 mr-2 text-gray-500" />
                <span>{invoice.patientPhone}</span>
              </div>
              <div className="flex items-center text-sm">
                <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                <span>{invoice.patientAddress}</span>
              </div>
            </div>
          </div>
        </div>
        {/* Invoice Items Table */}
        <div className="mb-6">
          <table className="w-full border-collapse border border-gray-200 text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 px-8 py-1  text-left font-semibold">
                  Description
                </th>
                <th className="border border-gray-200 px-8 py-1  text-right font-semibold">
                  Unit Cost
                </th>
                <th className="border border-gray-200 px-8 py-1  text-right font-semibold">
                  Qty
                </th>
                <th className="border border-gray-200 px-8 py-1  text-right font-semibold">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice?.items?.map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="border border-gray-200 px-8 py-1 ">{item.description}</td>
                  <td className="border border-gray-200 px-8 py-1 text-right font-medium">
                    ₹{item.cost}
                  </td>
                  <td className="border border-gray-200 px-8 py-1 text-right font-medium">
                    {item.quantity}
                  </td>
                  <td className="border border-gray-200 px-8 py-1 text-right font-medium">
                    ₹{item.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Invoice Totals */}
        <div className="flex justify-end mb-6">
          <div className="w-72">
            <div className="space-y-2">
              <div className="flex justify-between py-1 text-sm border-b border-gray-100">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">
                  ₹{invoice.subtotal || invoice.billedAmount}
                </span>
              </div>
              <div className="flex justify-between py-1 text-sm border-b border-gray-100">
                <span className="text-gray-600">Discount</span>
                <span className="font-medium">₹{invoice.discount}</span>
              </div>
              <div className="flex justify-between py-1 text-sm border-b border-gray-100">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">₹{invoice.tax}</span>
              </div>
              <div className="bg-[var(--accent-color)] text-white py-3 px-4 mt-3 rounded-md font-semibold text-lg flex justify-between">
                <span>Total Amount</span>
                <span>₹{invoice.total || invoice.billedAmount}</span>
              </div>
            </div>
          </div>
        </div>
        {/* Footer */}
        <div className="pt-4 border-t border-gray-200">
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-gray-700 mb-2">Terms & Conditions</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Payment is due within 30 days of invoice date. Late payments may incur additional
              charges. For any queries regarding this invoice, please contact us at
              billing@digihealth.com
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-[var(--accent-color)] mb-1">
              Thank you for choosing DigiHealth for your healthcare needs
            </p>
            <p className="text-xs text-gray-500">
              contact@digihealth.com | +91 98765 43210
            </p>
          </div>
        </div>
        {/* Actions */}
        {showActions && (
        <div className="no-print flex justify-center items-center gap-2 mb-4 mt-4">
          <button
            onClick={handlePrint}
            className="no-print flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-700 border text-sm"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      )}
        {showActions && (
          <div className="no-print mt-6 pt-4 border-t border-gray-200 flex flex-wrap gap-3 justify-center">
            {invoice?.billedAmount > invoice?.paidAmount && (
              <button
                onClick={handlePay}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-color)] hover:bg-[var(--accent-color)]/90 text-white rounded-lg transition-colors text-sm"
              >
                <CreditCard className="w-4 h-4" /> Pay ₹{invoice.billedAmount - invoice.paidAmount}
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
});

export default InvoiceTemplate;