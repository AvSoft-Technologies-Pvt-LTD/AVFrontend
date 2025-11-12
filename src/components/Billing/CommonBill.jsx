import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  Plus,
  Trash2,
  Save,
  Printer,
  Send,
  FileText,
  CreditCard,
  Calendar,
  User,
  Building2,
  Receipt,
} from 'lucide-react';
import ProfileCard from '../microcomponents/ProfileCard';
// import {
//   createBill,
//   updateBill,
//   generateBillNumber,
// } from '../utils/billingService';

const CommonBill = ({
  patient = {},
  doctorName = '',
  mode = 'create',
  existingBill,
  onClose,
  onSave,
  asPage = false,
}) => {
  const safePatient = patient || {};
  // Map to Profile props first, then fall back
  const displayName = (safePatient.fullName || safePatient.name || '').toString();
  const displayId = safePatient.id || safePatient.patientId || '';
  const displayType = safePatient.type || safePatient.patientType || 'OPD';
  const displayPhone = safePatient.phoneNumber || safePatient.phone || safePatient.contact || '';
  const displayAadhar = safePatient.aadharNumber || safePatient.aadhaarNumber || '';
  const displayGender = safePatient.gender || '';
  const displayDob = safePatient.dateOfBirth || safePatient.dob || '';
  const displayAddress = safePatient.address || '';
  const displayAdmissionId = safePatient.admissionId || safePatient.admissionID || '';
  const initials = (displayName || 'P')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  const profileFields = [
    { label: 'ID', value: displayId || 'N/A' },
    ...(doctorName ? [{ label: 'Doctor', value: doctorName }] : []),
    { label: 'Phone', value: displayPhone || 'N/A' },
    { label: 'DOB', value: displayDob || 'N/A' },
    { label: 'Type', value: String(displayType || 'OPD').toUpperCase() },
    ...(displayAddress ? [{ label: 'Address', value: displayAddress }] : []),
    ...(displayAadhar ? [{ label: 'Aadhar', value: `**** **** ${String(displayAadhar).slice(-4)}` }] : []),
    ...(String(displayType || '').toUpperCase() === 'IPD'
      ? [
          { label: 'Admission ID', value: displayAdmissionId || 'N/A' },
          { label: 'Ward/Bed', value: `${safePatient.wardType || ''}-${safePatient.wardNo || ''}-${safePatient.roomNo || ''}-${safePatient.bedNo || ''}` },
        ]
      : []),
  ];
  const [billNumber, setBillNumber] = useState('');
  const [billDate, setBillDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [billingType, setBillingType] = useState('Cash');
  const [insuranceProvider, setInsuranceProvider] = useState('');
  const [insurancePolicyNo, setInsurancePolicyNo] = useState('');
  const [insuranceClaimAmount, setInsuranceClaimAmount] = useState(0);
  const [insuranceCopay, setInsuranceCopay] = useState(0);
  const [items, setItems] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [taxPercentage, setTaxPercentage] = useState(18);
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [transactionId, setTransactionId] = useState('');
  const [amountPaid, setAmountPaid] = useState(0);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('Draft');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === 'create') {
      loadBillNumber();
    } else if (existingBill) {
      populateExistingBill();
    }
  }, [mode, existingBill]);

  const loadBillNumber = async () => {
    try {
      if (typeof generateBillNumber === 'function') {
        const number = await generateBillNumber();
        setBillNumber(number);
      } else {
        const now = new Date();
        const ymd = now.toISOString().slice(0, 10).replace(/-/g, '');
        const rnd = Math.random().toString(36).slice(2, 8).toUpperCase();
        setBillNumber(`BILL-${ymd}-${rnd}`);
      }
    } catch (_e) {
      const ts = Date.now().toString().slice(-6);
      setBillNumber(`BILL-${ts}`);
    }
  };

  const populateExistingBill = () => {
    if (!existingBill) return;
    setBillNumber(existingBill.bill_number || '');
    setBillDate(existingBill.bill_date);
    setBillingType(existingBill.billing_type);
    setInsuranceProvider(existingBill.insurance_provider || '');
    setInsurancePolicyNo(existingBill.insurance_policy_no || '');
    setInsuranceClaimAmount(existingBill.insurance_claim_amount || 0);
    setInsuranceCopay(existingBill.insurance_copay || 0);
    setItems(existingBill.items || []);
    setDiscount(existingBill.discount);
    setTaxPercentage(existingBill.tax_percentage);
    setPaymentMode(existingBill.payment_mode || 'Cash');
    setTransactionId(existingBill.transaction_id || '');
    setAmountPaid(existingBill.amount_paid);
    setNotes(existingBill.notes || '');
    setStatus(existingBill.status);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateTaxAmount = () => {
    const subtotal = calculateSubtotal();
    const afterDiscount = subtotal - discount;
    return (afterDiscount * taxPercentage) / 100;
  };

  const calculateGrandTotal = () => {
    const subtotal = calculateSubtotal();
    const taxAmount = calculateTaxAmount();
    return subtotal - discount + taxAmount;
  };

  const calculateBalance = () => {
    return calculateGrandTotal() - amountPaid;
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        description: '',
        quantity: 1,
        unit_cost: 0,
        tax_percent: taxPercentage,
        total: 0,
      },
    ]);
  };

  const updateItem = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    if (field === 'quantity' || field === 'unit_cost') {
      const quantity = Number(updatedItems[index].quantity);
      const unitCost = Number(updatedItems[index].unit_cost);
      updatedItems[index].total = quantity * unitCost;
    }
    setItems(updatedItems);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSave = async (saveStatus) => {
    if (!safePatient.id) {
      toast.error('Patient information is missing');
      return;
    }
    if (items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }
    setLoading(true);
    try {
      const wardInfo = safePatient.type === 'IPD'
        ? `${safePatient.wardType || ''}-${safePatient.wardNo || ''}-${safePatient.roomNo || ''}-${safePatient.bedNo || ''}`
        : undefined;
      const billData = {
        patient_id: safePatient.id,
        patient_name: safePatient.name || '',
        patient_type: safePatient.type || 'OPD',
        doctor_name: doctorName,
        admission_id: safePatient.admissionId,
        ward_info: wardInfo,
        bill_date: billDate,
        billing_type: billingType,
        insurance_provider: billingType === 'Insurance' ? insuranceProvider : undefined,
        insurance_policy_no: billingType === 'Insurance' ? insurancePolicyNo : undefined,
        insurance_claim_amount: billingType === 'Insurance' ? insuranceClaimAmount : undefined,
        insurance_copay: billingType === 'Insurance' ? insuranceCopay : undefined,
        subtotal: calculateSubtotal(),
        discount: discount,
        tax_percentage: taxPercentage,
        tax_amount: calculateTaxAmount(),
        grand_total: calculateGrandTotal(),
        amount_paid: amountPaid,
        balance: calculateBalance(),
        payment_mode: paymentMode,
        transaction_id: transactionId,
        status: saveStatus,
        notes: notes,
        created_by: doctorName,
        items: items,
      };
      // If billing service is not wired yet, prevent runtime errors gracefully
      if (!(typeof createBill === 'function') || !(typeof updateBill === 'function')) {
        toast.error('Billing service is not configured yet');
        setLoading(false);
        return;
      }
      let result;
      if (mode === 'edit' && existingBill?.id) {
        result = await updateBill(existingBill.id, billData);
      } else {
        result = await createBill(billData);
      }
      if (result.error) {
        throw result.error;
      }
      toast.success(
        saveStatus === 'Draft'
          ? 'Bill saved as draft'
          : saveStatus === 'Paid'
          ? 'Bill generated successfully'
          : 'Bill saved successfully'
      );
      if (onSave && result.data) {
        onSave(result.data);
      }
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error saving bill:', error);
      toast.error('Failed to save bill');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
    toast.info('Print dialog opened');
  };

  const handleSend = () => {
    toast.info('Send functionality coming soon');
  };

  return (
    <motion.div
      className={asPage ? "w-full bg-gray-100" : "fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto"}
      initial={asPage ? false : { opacity: 0 }}
      animate={asPage ? false : { opacity: 1 }}
      exit={asPage ? false : { opacity: 0 }}
    >
      <motion.div
        className={asPage ? "relative w-full max-w-7xl mx-auto bg-transparent rounded-none shadow-none" : "relative w-full max-w-6xl bg-white rounded-xl shadow-2xl my-4"}
        initial={asPage ? false : { scale: 0.9, y: 20 }}
        animate={asPage ? false : { scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div >
          {/* <div className="flex items-center gap-3">
            <Receipt className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Patient Billing</h2>
              <p className="text-sm opacity-90">{billNumber}</p>
            </div>
          </div> */}
          {!asPage && (
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <div className={asPage ? "p-6 md:p-6 space-y-6 max-w-7xl mx-auto" : "p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto"}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-600" />
              <input
                type="date"
                value={billDate}
                onChange={(e) => setBillDate(e.target.value)}
                className="input-field"
              />
            </div>
          </div>
          <ProfileCard initials={initials} name={displayName || 'N/A'} fields={profileFields}>
            {billNumber ? (
              <div className="flex items-center gap-2 bg-white/10 rounded-full px-2 py-1 text-xs">
                <Receipt className="w-4 h-4" />
                <span className="font-medium">{billNumber}</span>
              </div>
            ) : null}
          </ProfileCard>
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-teal-600" />
              Billing Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Billing Type
                </label>
                <select
                  value={billingType}
                  onChange={(e) => setBillingType(e.target.value)}
                  className="input-field"
                >
                  <option value="Cash">Cash</option>
                  <option value="Insurance">Insurance</option>
                  <option value="Credit">Credit</option>
                </select>
              </div>
              {billingType === 'Insurance' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Insurance Provider
                    </label>
                    <input
                      type="text"
                      value={insuranceProvider}
                      onChange={(e) => setInsuranceProvider(e.target.value)}
                      placeholder="Enter provider name"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Policy Number
                    </label>
                    <input
                      type="text"
                      value={insurancePolicyNo}
                      onChange={(e) => setInsurancePolicyNo(e.target.value)}
                      placeholder="Enter policy number"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Claim Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={insuranceClaimAmount}
                      onChange={(e) => setInsuranceClaimAmount(Number(e.target.value))}
                      placeholder="0.00"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Co-pay (₹)
                    </label>
                    <input
                      type="number"
                      value={insuranceCopay}
                      onChange={(e) => setInsuranceCopay(Number(e.target.value))}
                      placeholder="0.00"
                      className="input-field"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-600" />
                Itemized Charges
              </h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toast.info('Scan feature coming soon')}
                  className="btn btn-secondary px-3 py-2 rounded-lg text-sm"
                >
                  Scan from Prescription / Procedure
                </button>
                <button
                  onClick={addItem}
                  className="btn btn-primary flex items-center gap-2 px-3 py-2 rounded-lg"
                >
                  <Plus className="w-4 h-4" />
                  Add Item
                </button>
              </div>
            </div>
            <div className="space-y-3 custom-scrollbar">
              <div className="grid grid-cols-5 gap-3 text-sm font-semibold text-gray-700">
                <div>Description</div>
                <div>Qty</div>
                <div>Unit Cost (₹)</div>
                <div>Tax %</div>
                <div className="text-right">Total (₹)</div>
              </div>
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-5 gap-3 items-center">
                  <div className="border rounded-lg p-2">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      placeholder="Item description"
                      className="w-full px-2 py-1 outline-none text-sm"
                    />
                  </div>
                  <div className="border rounded-lg p-2">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                      min="1"
                      className="w-full px-2 py-1 outline-none text-sm"
                    />
                  </div>
                  <div className="border rounded-lg p-2">
                    <input
                      type="number"
                      value={item.unit_cost}
                      onChange={(e) => updateItem(index, 'unit_cost', Number(e.target.value))}
                      min="0"
                      step="0.01"
                      className="w-full px-2 py-1 outline-none text-sm"
                    />
                  </div>
                  <div className="border rounded-lg p-2">
                    <input
                      type="number"
                      value={item.tax_percent ?? 0}
                      onChange={(e) => updateItem(index, 'tax_percent', Number(e.target.value))}
                      min="0"
                      max="100"
                      step="0.01"
                      className="w-full px-2 py-1 outline-none text-sm"
                    />
                  </div>
                  <div className="p-2 text-right">
                    <div className="font-semibold text-gray-900">₹{(item.total || 0).toFixed(2)}</div>
                    <button
                      onClick={() => removeItem(index)}
                      className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 text-xs mt-1"
                    >
                      <Trash2 className="w-3 h-3" /> Remove
                    </button>
                  </div>
                </div>
              ))}
              {items.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No items added yet. Click "Add Item" to start.</p>
                </div>
              )}
            </div>
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
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    min="0"
                    step="0.01"
                    className="input-field w-32 text-right"
                  />
                </div>
                <div className="flex justify-between items-center gap-4">
                  <span className="text-gray-600">Tax (GST)</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={taxPercentage}
                      onChange={(e) => setTaxPercentage(Number(e.target.value))}
                      min="0"
                      max="100"
                      step="0.01"
                      className="input-field w-20 text-right"
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
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-teal-600" />
              Payment Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Payment Mode
                </label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="input-field"
                >
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Transaction ID
                </label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Enter transaction ID"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Amount Paid (₹)
                </label>
                <input
                  type="number"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(Number(e.target.value))}
                  min="0"
                  step="0.01"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Balance (₹)
                </label>
                <div className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg font-bold text-gray-900">
                  ₹{calculateBalance().toFixed(2)}
                </div>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Add any additional notes..."
                className="input-field resize-none"
              />
            </div>
          </div>
        </div>
        <div className={asPage ? "sticky bottom-0 z-10 bg-white border-t border-gray-200 px-6 py-4 flex flex-wrap gap-3 justify-end" : "sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-xl flex flex-wrap gap-3 justify-end"}>
          <button
            onClick={() => handleSave('Draft')}
            disabled={loading}
            className="btn btn-secondary px-5 py-2 rounded-xl disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            Save Draft
          </button>
          <button
            onClick={handlePrint}
            disabled={loading}
            className="btn btn-primary px-5 py-2 rounded-xl disabled:opacity-50"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button
            onClick={handleSend}
            disabled={loading}
            className="btn px-5 py-2 rounded-xl bg-purple-500 hover:bg-purple-600 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            Send
          </button>
          <button
            onClick={() => handleSave('Paid')}
            disabled={loading}
            className="btn px-5 py-2 rounded-xl bg-[var(--accent-color)] hover:opacity-90 disabled:opacity-50"
          >
            <Receipt className="w-4 h-4" />
            {loading ? 'Saving...' : 'Generate Bill'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CommonBill;
