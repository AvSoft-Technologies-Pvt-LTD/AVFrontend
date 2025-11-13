import React, { useState, useContext, useRef } from 'react';
import { Plus, Trash2, Save, Printer, Send, FileText, CreditCard, Calendar, User, Building2, Receipt, RotateCcw } from 'lucide-react';
import ProfileCard from '../../components/microcomponents/ProfileCard';
import PaymentGateway from '../../components/microcomponents/PaymentGatway';
import { usePatientContext } from '../../context-api/PatientContext'; // Adjust the import path as needed
import { useLocation } from 'react-router-dom';

const FloatingInput = ({ label, name, value, onChange, type = 'text', error, required = false, ...rest }) => (
  <div className="relative mb-6 min-w-0 floating-input" data-placeholder={label}>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-lg transition-all duration-200
        ${error ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100' : 'border-gray-200 focus:border-[#01B07A] focus:ring-2 focus:ring-emerald-100'}
        focus:outline-none peer placeholder-transparent`}
      placeholder=" "
      {...rest}
    />
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

const FloatingSelect = ({ label, name, value, onChange, options, error, required = false }) => (
  <div className="relative mb-6 min-w-0 floating-input">
    <select
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className={`w-full px-4 pt-6 pb-2 bg-gray-50 border-2 rounded-lg transition-all duration-200 appearance-none cursor-pointer
        ${error ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100' : 'border-gray-200 focus:border-[#01B07A] focus:ring-2 focus:ring-emerald-100'}
        focus:outline-none peer pr-10`}
    >
      <option value=""></option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    <label className={`absolute left-4 -top-2.5 text-xs font-semibold bg-white px-1 text-[#01B07A] pointer-events-none z-10`}>
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

const BillingForm = () => {
  const { activeTab, patient } = usePatientContext();
  const location = useLocation();
  // Prefer IPD patient passed via router state, fallback to context
  const ipdFromState = location?.state?.patient || location?.state?.selectedPatient || null;
  const [formData, setFormData] = useState({
    billingType: 'Cash',
    insuranceProvider: '',
    insurancePolicyNo: '',
    insuranceClaimAmount: 0,
    insuranceCopay: 0,
    billDate: new Date().toISOString().split('T')[0],
    paymentMode: 'Cash',
    transactionId: '',
    discount: 0,
    tax: 18,
    amountPaid: 0,
    notes: '',
  });
  const [items, setItems] = useState([]);
  const [errors, setErrors] = useState({});
  const [gatewayOpen, setGatewayOpen] = useState(false);
  const printRef = useRef(null);

  // Prepare patient profile fields (prefer IPD data from router state)
  const base = ipdFromState || patient || {};
  const fullName = base.name || [base.firstName, base.middleName, base.lastName].filter(Boolean).join(' ');
  const initials = (fullName || 'AC').split(' ').map(s => s?.[0]).filter(Boolean).join('').toUpperCase();
  const wardType = base.wardType || '';
  const wardNo = base.wardNo || base.wardNumber || '';
  const roomNo = base.roomNo || base.roomNumber || '';
  const bedNo = base.bedNo || base.bedNumber || '';
  const isIPD = (activeTab === 'IPD') || !!(wardType || wardNo || roomNo || bedNo || base.type === 'ipd');

  const patientProfile = {
    initials,
    name: fullName || 'Patient',
    fields: [
      { label: 'ID', value: base.sequentialId || base.id || 'N/A' },
      { label: 'Doctor', value: base.doctorName || patient?.doctorName || 'N/A' },
      { label: 'Phone', value: base.phone || base.phoneNumber || 'N/A' },
      { label: 'DOB', value: base.dob || base.dateOfBirth || 'N/A' },
      { label: 'Type', value: isIPD ? 'IPD' : (activeTab || base.type || 'OPD') },
      { label: 'Address', value: base.address || base.temporaryAddress || base.addressTemp || 'N/A' },
      ...(isIPD ? [
        { label: 'Admission ID', value: base.sequentialId || base.admissionId || 'N/A' },
        { label: 'Ward/Bed', value: `${wardType || ''}-${wardNo || ''}-${roomNo || ''}-${bedNo || ''}`.replace(/-+$/,'') || 'N/A' },
      ] : []),
    ],
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    const numericFields = new Set(['discount', 'tax', 'amountPaid', 'insuranceClaimAmount', 'insuranceCopay']);
    const nextVal = numericFields.has(name) ? (value === '' ? '' : Number(value)) : value;
    setFormData((prev) => ({ ...prev, [name]: nextVal }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { id: Date.now(), description: '', quantity: 1, unit_cost: 0, tax_percent: formData.tax, total: 0 },
    ]);
  };

  const updateItem = (id, field, value) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'quantity' || field === 'unit_cost') {
            updatedItem.total = updatedItem.quantity * updatedItem.unit_cost;
          }
          return updatedItem;
        }
        return item;
      })
    );
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateTaxAmount = () => {
    const subtotal = calculateSubtotal();
    const afterDiscount = subtotal - (subtotal * formData.discount / 100);
    return (afterDiscount * formData.tax) / 100;
  };

  const calculateGrandTotal = () => {
    const subtotal = calculateSubtotal();
    const afterDiscount = subtotal - (subtotal * formData.discount / 100);
    const taxAmount = calculateTaxAmount();
    return afterDiscount + taxAmount;
  };

  const calculateBalance = () => {
    return calculateGrandTotal() - formData.amountPaid;
  };

  const openGateway = () => setGatewayOpen(true);
  const closeGateway = () => setGatewayOpen(false);
  const handleGatewayPay = (method, data) => {
    // On successful payment, mark full balance as paid and close
    const due = calculateBalance();
    setFormData((prev) => ({
      ...prev,
      amountPaid: Number(prev.amountPaid || 0) + (due > 0 ? due : 0),
      transactionId: prev.transactionId || 'TXN-' + Date.now(),
    }));
    setGatewayOpen(false);
  };

  const getGatewayMethods = () => {
    switch (formData.paymentMode) {
      case 'UPI':
        return ['upi'];
      case 'Card':
        return ['card'];
      case 'Bank Transfer':
        return ['netbanking'];
      default:
        return ['wallet'];
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (items.length === 0) newErrors.items = 'At least one item is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const billData = {
        ...formData,
        items,
        subtotal: calculateSubtotal(),
        taxAmount: calculateTaxAmount(),
        grandTotal: calculateGrandTotal(),
        balance: calculateBalance(),
      };
      console.log('Billing Data:', billData);
      alert('Bill submitted successfully!');
    }
  };

  const handleClear = () => {
    setFormData({
      billingType: 'Cash',
      insuranceProvider: '',
      insurancePolicyNo: '',
      insuranceClaimAmount: 0,
      insuranceCopay: 0,
      billDate: new Date().toISOString().split('T')[0],
      paymentMode: 'Cash',
      transactionId: '',
      discount: 0,
      tax: 18,
      amountPaid: 0,
      notes: '',
    });
    setItems([]);
    setErrors({});
  };

  const handlePrint = () => {
    const root = printRef.current;
    if (!root) return window.print();

    // Clone and sync current field values into attributes so they show up when printed
    const clone = root.cloneNode(true);
    const syncFields = (container) => {
      const fields = container.querySelectorAll('input, textarea, select');
      fields.forEach((el) => {
        const tag = el.tagName.toLowerCase();
        if (tag === 'input') {
          const input = el;
          const type = input.type;
          if (type === 'checkbox' || type === 'radio') {
            if (input.checked) input.setAttribute('checked', 'checked');
            else input.removeAttribute('checked');
          } else {
            input.setAttribute('value', input.value ?? '');
          }
        } else if (tag === 'textarea') {
          const ta = el;
          ta.textContent = ta.value ?? '';
        } else if (tag === 'select') {
          const sel = el;
          const val = sel.value;
          Array.from(sel.options).forEach((opt) => {
            if (opt.value === val) opt.setAttribute('selected', 'selected');
            else opt.removeAttribute('selected');
          });
        }
      });
    };
    syncFields(clone);
    const html = clone.outerHTML;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const win = iframe.contentWindow;
    const doc = win?.document || iframe.contentDocument;
    if (!doc) {
      document.body.removeChild(iframe);
      return window.print();
    }

    // Build a safe <head>: only stylesheets and style tags, no scripts
    const cssLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
      .map((el) => el.outerHTML)
      .join('\n');
    const inlineStyles = Array.from(document.querySelectorAll('style'))
      .map((el) => el.outerHTML)
      .join('\n');
    const baseHref = document.baseURI || window.location.origin + '/';

    doc.open();
    doc.write(`<!doctype html>
      <html>
        <head>
          <base href="${baseHref}">
          ${cssLinks}
          ${inlineStyles}
          <style>
            @page { size: auto; margin: 12mm; }
            html, body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: #fff; color: #111827; font: 14px/1.4 system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; }
            /* Ensure cards/tables keep borders */
            .border, .border-2, .border-gray-200, .border-gray-300 { border-color: #e5e7eb !important; }
            .rounded-2xl, .rounded-lg { border-radius: 12px !important; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #e5e7eb; padding: 8px; }
            /* Make floating inputs readable */
            .floating-input label { position: static !important; display: block !important; margin-bottom: 4px; font-weight: 600; color: #374151; background: transparent !important; }
            .floating-input input, .floating-input select, .floating-input textarea { background: transparent !important; border: 1px solid #e5e7eb !important; padding: 8px 10px !important; box-shadow: none !important; color: #111827 !important; }
            /* Hide things explicitly marked for print-hide or Tailwind print:hidden utility */
            [data-print-hide], .print\\:hidden { display: none !important; }
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>`);
    doc.close();

    const printWhenReady = async () => {
      try {
        if (win?.document?.fonts?.ready) {
          await win.document.fonts.ready;
        }
      } catch {}
      // Small delay to ensure external CSS applies
      setTimeout(() => {
        win?.focus();
        win?.print();
        setTimeout(() => document.body.removeChild(iframe), 300);
      }, 100);
    };

    if (iframe.onload === null) {
      // Some browsers fire onload for the iframe after doc.write
      iframe.onload = printWhenReady;
    }
    // Fallback in case onload doesn't fire
    setTimeout(printWhenReady, 200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto" ref={printRef}>
        {/* Header with Patient Profile */}
        <div className="mb-8 animate-fade-in">
          <ProfileCard
            initials={patientProfile.initials}
            name={patientProfile.name}
            fields={patientProfile.fields}
          />
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 md:p-8 space-y-6">
            {/* Billing Details Section */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-teal-600" />
                Billing Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FloatingSelect
                  label="Billing Type"
                  name="billingType"
                  value={formData.billingType}
                  onChange={handleInputChange}
                  options={[
                    { label: 'Cash', value: 'Cash' },
                    { label: 'Insurance', value: 'Insurance' },
                    { label: 'Credit', value: 'Credit' },
                  ]}
                />
                {formData.billingType === 'Insurance' && (
                  <>
                    <FloatingInput
                      label="Insurance Provider"
                      name="insuranceProvider"
                      value={formData.insuranceProvider}
                      onChange={handleInputChange}
                    />
                    <FloatingInput
                      label="Policy Number"
                      name="insurancePolicyNo"
                      value={formData.insurancePolicyNo}
                      onChange={handleInputChange}
                    />
                    <FloatingInput
                      label="Claim Amount (₹)"
                      name="insuranceClaimAmount"
                      type="number"
                      value={formData.insuranceClaimAmount}
                      onChange={handleInputChange}
                    />
                    <FloatingInput
                      label="Co-pay (₹)"
                      name="insuranceCopay"
                      type="number"
                      value={formData.insuranceCopay}
                      onChange={handleInputChange}
                    />
                  </>
                )}
              </div>
            </div>

            {/* Itemized Charges Section */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-teal-600" />
                  Itemized Charges
                </h3>
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center gap-2 px-4 py-2 bg-[#01B07A] text-white rounded-lg hover:bg-[#01935f] transition-colors duration-200 font-semibold"
                >
                  <Plus size={18} /> Add Item
                </button>
              </div>
              {errors.items && <p className="text-red-500 text-sm mb-4">{errors.items}</p>}
              {items.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <p className="text-gray-500 text-lg">No items added yet. Click "Add Item" to begin.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100 border-b-2 border-gray-300">
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Description</th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-700">Qty</th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-700">Unit Cost (₹)</th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-700">Tax %</th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-700">Total (₹)</th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-700">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                              placeholder="Item description"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#01B07A] focus:ring-1 focus:ring-emerald-100"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                              min="1"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#01B07A] focus:ring-1 focus:ring-emerald-100 text-right"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={item.unit_cost}
                              onChange={(e) => updateItem(item.id, 'unit_cost', Number(e.target.value))}
                              min="0"
                              step="0.01"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#01B07A] focus:ring-1 focus:ring-emerald-100 text-right"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={item.tax_percent}
                              onChange={(e) => updateItem(item.id, 'tax_percent', Number(e.target.value))}
                              min="0"
                              max="100"
                              step="0.01"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#01B07A] focus:ring-1 focus:ring-emerald-100 text-right"
                            />
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-gray-900">
                            ₹{item.total.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {items.length > 0 && (
                <div className="mt-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border border-gray-200">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="text-right font-semibold text-gray-900">₹{calculateSubtotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center gap-4">
                      <span className="text-gray-600">Discount</span>
                      <input
                        type="number"
                        name="discount"
                        value={formData.discount}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className="w-32 px-4 py-2.5 bg-gray-50 border-2 rounded-lg focus:outline-none focus:border-[#01B07A] focus:ring-2 focus:ring-emerald-100 text-right"
                      />
                    </div>
                    <div className="flex justify-between items-center gap-4">
                      <span className="text-gray-600">Tax (GST)</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          name="tax"
                          value={formData.tax}
                          onChange={handleInputChange}
                          min="0"
                          max="100"
                          step="0.01"
                          className="w-24 px-4 py-2.5 bg-gray-50 border-2 rounded-lg focus:outline-none focus:border-[#01B07A] focus:ring-2 focus:ring-emerald-100 text-right"
                        />
                        <span className="text-gray-600">%</span>
                        <span className="text-gray-900 font-semibold ml-2">₹{calculateTaxAmount().toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="pt-3 border-t-2 border-teal-600">
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-blue-700">Grand Total</span>
                        <span className="text-2xl font-bold text-blue-700">₹{calculateGrandTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Details Section */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-teal-600" />
                Payment Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FloatingSelect
                  label="Payment Mode"
                  name="paymentMode"
                  value={formData.paymentMode}
                  onChange={handleInputChange}
                  options={[
                    { label: 'Cash', value: 'Cash' },
                    { label: 'Card', value: 'Card' },
                    { label: 'UPI', value: 'UPI' },
                    { label: 'Bank Transfer', value: 'Bank Transfer' },
                  ]}
                />
                {formData.paymentMode !== 'Cash' && (
                  <div className="flex items-end mb-6">
                    <button
                      type="button"
                      onClick={openGateway}
                      className="px-4 py-3 bg-[#01B07A] text-white rounded-lg hover:bg-[#01935f] transition-colors duration-200 font-semibold"
                    >
                      Pay via {formData.paymentMode}
                    </button>
                  </div>
                )}
                <FloatingInput
                  label="Transaction ID"
                  name="transactionId"
                  value={formData.transactionId}
                  onChange={handleInputChange}
                />
                <FloatingInput
                  label="Amount Paid (₹)"
                  name="amountPaid"
                  type="number"
                  value={formData.amountPaid}
                  onChange={handleInputChange}
                />
                <FloatingInput
                  label="Balance (₹)"
                  name="balanceDisplay"
                  value={`₹${calculateBalance().toFixed(2)}`}
                  onChange={() => {}}
                  readOnly
                />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Add any additional notes..."
                  className="input-field resize-none w-full"
                />
              </div>
            </div>
            {/* Payment Gateway Modal */}
            <PaymentGateway
              isOpen={gatewayOpen}
              onClose={closeGateway}
              amount={Number(calculateBalance().toFixed(2))}
              bookingId={patient?.id || 'N/A'}
              methods={getGatewayMethods()}
              onPay={handleGatewayPay}
              currency="₹"
              merchantName="DigiHealth"
            />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6 print:hidden" data-print-hide>
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center justify-center gap-2 px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-semibold"
              >
                <RotateCcw size={18} /> Clear Form
              </button>
              {/* <button
                type="button"
                onClick={handlePrint}
                className="flex items-center justify-center gap-2 px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-semibold"
              >
                <Printer size={18} /> Print
              </button> */}
              <button
                type="submit"
                className="flex items-center justify-center gap-2 px-8 py-3 bg-[#01B07A] text-white rounded-lg hover:bg-[#01935f] transition-colors duration-200 font-semibold shadow-lg hover:shadow-xl"
              >
                <Send size={18} /> Submit Bill
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BillingForm;
