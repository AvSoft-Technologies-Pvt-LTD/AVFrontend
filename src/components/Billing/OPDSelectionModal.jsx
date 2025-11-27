import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Activity, Plus } from "lucide-react";
import { toast } from 'react-toastify';

// Dummy data for OPD services
const dummyOPDServices = [
  { id: 1, name: "Consultation Fee", price: 500 },
  { id: 2, name: "Follow-up Fee", price: 300 },
  { id: 3, name: "Dressing", price: 250 },
  { id: 4, name: "Injection", price: 150 },
  { id: 5, name: "Procedure Fee", price: 1000 },
  { id: 6, name: "ECG", price: 300 },
  { id: 7, name: "X-Ray", price: 500 },
  { id: 8, name: "Blood Test", price: 400 },
  { id: 9, name: "Ultrasound", price: 1200 },
  { id: 10, name: "Physiotherapy", price: 600 }
];

export default function OPDSelectionModal({ onClose, onAddItems }) {
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call with timeout
    const timer = setTimeout(() => {
      setServices(dummyOPDServices);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleToggleService = (service) => {
    setSelectedServices(prev =>
      prev.find(s => s.id === service.id)
        ? prev.filter(s => s.id !== service.id)
        : [...prev, service]
    );
  };

  const handleAddItems = () => {
    const items = selectedServices.map((service, index) => ({
      id: `item-${Date.now()}-opd-${index}`,
      description: service.name,
      cost: service.price,
      quantity: 1,
      amount: service.price
    }));

    if (items.length === 0) {
      toast.error("Please select at least one service");
      return;
    }

    onAddItems(items);
    onClose();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent-color)] mx-auto"></div>
        </div>
      </div>
    );
  }

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
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            <Activity className="text-[var(--accent-color)]" size={28} />
            OPD Billing Items
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            data-testid="close-opd-modal-btn"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Select Services</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {services.map((service) => (
                <label
                  key={service.id}
                  className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedServices.some(s => s.id === service.id)
                      ? 'border-[var(--accent-color)] bg-[var(--accent-color)]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedServices.some(s => s.id === service.id)}
                    onChange={() => handleToggleService(service)}
                    className="h-5 w-5 rounded text-[var(--accent-color)] focus:ring-[var(--accent-color)]"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{service.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[var(--accent-color)]">₹{service.price}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              onClick={handleAddItems}
              data-testid="add-opd-items-btn"
              className="px-6 py-3 text-white rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center gap-2 bg-gradient-to-r from-[#01B07A] to-[#1A223F] hover:from-[#019e6b] hover:to-[#141b36]"
            >
              <Plus size={20} />
              Add Selected Items
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}