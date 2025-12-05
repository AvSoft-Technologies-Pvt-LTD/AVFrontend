import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePatientContext } from "../../context-api/PatientContext";
import PatientSearch from "./PatientSearch";
import ProfileCard from "../../components/microcomponents/ProfileCard";
import PrintBill from "./PrintBill";
import { toast } from 'react-toastify';
import { DollarSign, FileText, Save, Package, Activity, Bed } from "lucide-react";
import IPDSelectionModal from "./IPDSelectionModal";
import OPDSelectionModal from "./OPDSelectionModal";
import PharmacyModal from "./PharmacyModal";

export default function BillingModule() {
  const { patient: contextPatient } = usePatientContext();
  const [patient, setPatient] = useState(null);
  const [billingItems, setBillingItems] = useState([]);
  const [showPrintBill, setShowPrintBill] = useState(false);
  const [generatedBill, setGeneratedBill] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showIPDModal, setShowIPDModal] = useState(false);
  const [showOPDModal, setShowOPDModal] = useState(false);
  const [showPharmacyModal, setShowPharmacyModal] = useState(false);

  // Update local patient state when contextPatient changes
  useEffect(() => {
    if (contextPatient) {
      // Format the patient data based on whether it's IPD or OPD
      const formattedPatient = {
        patientId: contextPatient.id || contextPatient.patientId,
        patientName: contextPatient.name || contextPatient.patientName,
        patientType: contextPatient.sequentialId?.startsWith('IPD') ? 'IPD' : 'OPD',
        patientEmail: contextPatient.email || contextPatient.patientEmailId,
        patientPhone: contextPatient.phoneNumber || contextPatient.patientPhoneNumber,
        doctorName: contextPatient.doctorName,
        ...(contextPatient.ward && { wardType: contextPatient.ward }),
        ...(contextPatient.admissionDate && { 
          daysAdmitted: Math.ceil((new Date() - new Date(contextPatient.admissionDate)) / (1000 * 60 * 60 * 24))
        })
      };
      setPatient(formattedPatient);
    }
  }, [contextPatient]);

  const fetchPatient = (patientId) => {
    setIsLoading(true);
    try {
      // Simulate API call with timeout
      setTimeout(() => {
        const foundPatient = dummyPatients[patientId];
        if (foundPatient) {
          setPatient(foundPatient);
          setBillingItems([]);
          toast.success(`Patient ${foundPatient.patientName} loaded successfully`);
        } else {
          throw new Error("Patient not found");
        }
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error:', error);
      toast.error("Patient not found");
      setPatient(null);
      setBillingItems([]);
      setIsLoading(false);
    }
  };

  const handleAddBillingItems = (items) => {
    setBillingItems([...billingItems, ...items]);
    toast.success(`${items.length} item(s) added to bill`);
  };

  const handleUpdateItem = (id, field, value) => {
    const updatedItems = billingItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === "quantity" || field === "cost") {
          updated.amount = updated.quantity * updated.cost;
        }
        return updated;
      }
      return item;
    });
    setBillingItems(updatedItems);
  };

  const handleDeleteItem = (id) => {
    setBillingItems(billingItems.filter(item => item.id !== id));
    toast.error("Item removed");
  };

  const calculateTotals = () => {
    const subtotal = billingItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    const discount = 0;
    const tax = subtotal * 0.05;
    const total = subtotal - discount + tax;
    return { subtotal, discount, tax, total };
  };

  const handleGenerateBill = () => {
    if (!patient) {
      toast.error("Please select a patient first");
      return;
    }
    if (billingItems.length === 0) {
      toast.error("Please add at least one billing item");
      return;
    }

    const { subtotal, discount, tax, total } = calculateTotals();
    const billData = {
      patientId: patient.patientId,
      patientName: patient.patientName,
      patientEmail: patient.patientEmail,
      patientPhone: patient.patientPhone,
      patientAddress: patient.patientAddress,
      doctorName: patient.doctorName,
      items: billingItems,
      subtotal,
      discount,
      tax,
      total,
      billedAmount: total,
      paidAmount: 0,
      status: "Pending",
      paymentMethod: "Cash",
      notes: "Generated bill",
      invoiceId: `INV-${Date.now()}`,
      date: new Date().toISOString().split('T')[0]
    };

    // Simulate API call
    setTimeout(() => {
      setGeneratedBill(billData);
      setShowPrintBill(true);
      toast.success("Bill generated successfully!");
    }, 500);
  };

  const { subtotal, discount, tax, total } = calculateTotals();

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
      


        {/* Rest of your JSX remains exactly the same */}
        <AnimatePresence>
          {patient && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mb-6"
            >
              <ProfileCard
                initials={patient.patientName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                name={patient.patientName}
                fields={[
                  { label: 'ID', value: patient.patientId },
                  { label: 'Type', value: patient.patientType },
                  { label: 'Email', value: patient.patientEmail },
                  { label: 'Phone', value: patient.patientPhone },
                  { label: 'Address', value: patient.patientAddress },
                  { label: 'Doctor', value: patient.doctorName },
                  ...(patient.patientType === 'IPD' ? [
                    { label: 'Ward', value: patient.wardType || 'N/A' },
                    { label: 'Days Admitted', value: patient.daysAdmitted }
                  ] : [])
                ].filter(Boolean)}
              />

              <div className="mt-6 flex flex-wrap gap-4 justify-center">
                {patient.patientType === 'IPD' && (
                  <button
                    onClick={() => setShowIPDModal(true)}
                    data-testid="select-ipd-billing-btn"
                    className="px-6 py-3 text-white rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center gap-2 bg-gradient-to-r from-[#01B07A] to-[#1A223F] hover:from-[#019e6b] hover:to-[#141b36]"
                  >
                    <Bed size={20} />
                    Select IPD Billing Items
                  </button>
                )}
                {patient.patientType === 'OPD' && (
                  <button
                    onClick={() => setShowOPDModal(true)}
                    data-testid="select-opd-billing-btn"
                    className="px-6 py-3 text-white rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center gap-2 bg-gradient-to-r from-[#01B07A] to-[#1A223F] hover:from-[#019e6b] hover:to-[#141b36]"
                  >
                    <Activity size={20} />
                    Select OPD Billing Items
                  </button>
                )}
                <button
                  onClick={() => setShowPharmacyModal(true)}
                  data-testid="pharmacy-btn"
                  className="px-6 py-3 text-white rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center gap-2 bg-gradient-to-r from-[#1A223F] to-[#01B07A] hover:from-[#141b36] hover:to-[#019e6b]"
                >
                  <Package size={20} />
                  Pharmacy
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rest of your JSX remains exactly the same */}
        <AnimatePresence>
          {patient && billingItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mb-6"
            >
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-teal-100 p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  <FileText className="inline mr-2" size={24} />
                  Billing Items
                </h2>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Item</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Qty</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Rate</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Total</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {billingItems.map(item => (
                        <tr key={item.id}>
                          <td className="px-4 py-2 text-sm">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => handleUpdateItem(item.id, "description", e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
                            />
                          </td>
                          <td className="px-4 py-2 text-sm">
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleUpdateItem(item.id, "quantity", parseFloat(e.target.value) || 0)}
                              className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
                              min="1"
                            />
                          </td>
                          <td className="px-4 py-2 text-sm">
                            <input
                              type="number"
                              value={item.cost}
                              onChange={(e) => handleUpdateItem(item.id, "cost", parseFloat(e.target.value) || 0)}
                              className="w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
                              min="0"
                            />
                          </td>
                          <td className="px-4 py-2 text-sm font-semibold">₹{item.amount.toFixed(2)}</td>
                          <td className="px-4 py-2 text-sm">
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="px-3 py-1 text-white rounded-lg transition-colors text-sm bg-red-500 hover:bg-red-600"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {patient && billingItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mb-6"
            >
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-teal-100 p-6">
                <div className="max-w-md ml-auto space-y-3">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal:</span>
                    <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Discount:</span>
                    <span className="font-semibold">₹{discount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Tax (5%):</span>
                    <span className="font-semibold">₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="h-px bg-gray-300"></div>
                  <div className="flex justify-between text-xl font-bold text-[var(--accent-color)]">
                    <span>Grand Total:</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {patient && billingItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-wrap gap-4 justify-center"
            >
              <button
                onClick={handleGenerateBill}
                data-testid="generate-bill-btn"
                className="px-6 py-3 text-white rounded-lg transition-all transform hover:scale-105 shadow-lg flex items-center gap-2 bg-gradient-to-r from-[#01B07A] to-[#1A223F] hover:from-[#019e6b] hover:to-[#141b36]"
              >
                <DollarSign size={20} />
                Generate Bill
              </button>
              <button
                onClick={() => setShowPrintBill(true)}
                data-testid="print-bill-btn"
                className="px-6 py-3 text-white rounded-lg transition-all transform hover:scale-105 shadow-lg flex items-center gap-2 bg-gradient-to-r from-[#1A223F] to-[#01B07A] hover:from-[#141b36] hover:to-[#019e6b]"
                disabled={!generatedBill}
              >
                <FileText size={20} />
                Print Bill
              </button>
              <button
                onClick={handleGenerateBill}
                data-testid="save-bill-btn"
                className="px-6 py-3 text-white rounded-lg transition-all transform hover:scale-105 shadow-lg flex items-center gap-2 bg-gradient-to-r from-[#01D48C] to-[#0E1630] hover:from-[#01c27f] hover:to-[#0a0f21]"
              >
                <Save size={20} />
                Save
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {showIPDModal && (
          <IPDSelectionModal
            patient={patient}
            onClose={() => setShowIPDModal(false)}
            onAddItems={handleAddBillingItems}
          />
        )}

        {showOPDModal && (
          <OPDSelectionModal
            onClose={() => setShowOPDModal(false)}
            onAddItems={handleAddBillingItems}
          />
        )}

        {showPharmacyModal && (
          <PharmacyModal
            onClose={() => setShowPharmacyModal(false)}
            onAddItems={handleAddBillingItems}
          />
        )}

        {showPrintBill && generatedBill && (
          <PrintBill bill={generatedBill} onClose={() => setShowPrintBill(false)} />
        )}
      </div>
    </div>
  );
}