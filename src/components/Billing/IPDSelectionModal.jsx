import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Bed, Plus } from "lucide-react";
import { toast } from 'react-toastify';

// Dummy data
const dummyWardData = {
  wards: [
    { id: 1, name: "General", price: 2000 },
    { id: 2, name: "Semi-Private", price: 3500 },
    { id: 3, name: "Private", price: 5000 },
    { id: 4, name: "Deluxe", price: 7500 }
  ],
  addons: [
    { id: 1, name: "TV", price: 200 },
    { id: 2, name: "AC", price: 300 },
    { id: 3, name: "Fridge", price: 150 },
    { id: 4, name: "Extra Bed", price: 1000 }
  ],
  services: [
    { id: 1, name: "Nursing Care", price: 500 },
    { id: 2, name: "Doctor Visit", price: 1000 },
    { id: 3, name: "Meal Service", price: 300 },
    { id: 4, name: "Laundry", price: 200 }
  ]
};

export default function IPDSelectionModal({ patient, onClose, onAddItems }) {
  const [wardData, setWardData] = useState({ wards: [], addons: [], services: [] });
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call with timeout
    const timer = setTimeout(() => {
      setWardData(dummyWardData);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Rest of your component remains the same...
  const handleToggleAddon = (addon) => {
    setSelectedAddons(prev =>
      prev.find(a => a.name === addon.name)
        ? prev.filter(a => a.name !== addon.name)
        : [...prev, addon]
    );
  };

  const handleToggleService = (service) => {
    setSelectedServices(prev =>
      prev.find(s => s.name === service.name)
        ? prev.filter(s => s.name !== service.name)
        : [...prev, service]
    );
  };

  const handleAddItems = () => {
    const items = [];
    const days = patient.daysAdmitted || 1;

    // Add bed charges based on ward type
    const ward = wardData.wards.find(w => w.name === patient.wardType);
    if (ward) {
      items.push({
        id: `item-${Date.now()}-bed`,
        description: `Bed Charges (${ward.name})`,
        cost: ward.price,
        quantity: days,
        amount: ward.price * days
      });
    }

    // Add selected addons
    selectedAddons.forEach((addon, index) => {
      items.push({
        id: `item-${Date.now()}-addon-${index}`,
        description: addon.name,
        cost: addon.price,
        quantity: days,
        amount: addon.price * days
      });
    });

    // Add selected services
    selectedServices.forEach((service, index) => {
      items.push({
        id: `item-${Date.now()}-service-${index}`,
        description: service.name,
        cost: service.price,
        quantity: 1, // Services are typically one-time charges
        amount: service.price
      });
    });

    if (items.length === 0) {
      toast.error("Please select at least one item");
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
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            <Bed className="text-[var(--accent-color)]" size={28} />
            IPD Billing Items
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            data-testid="close-ipd-modal-btn"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Ward Info */}
          <div className="bg-gradient-to-r from-[#01B07A]/10 to-[#1A223F]/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Ward Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Ward Type</p>
                <p className="text-lg font-semibold text-[var(--primary-color)]">{patient.wardType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Days Admitted</p>
                <p className="text-lg font-semibold text-[var(--primary-color)]">{patient.daysAdmitted || 1}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Rate per Day</p>
                <p className="text-lg font-semibold text-[var(--accent-color)]">
                  ₹{wardData.wards.find(w => w.name === patient.wardType)?.price || 0}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">Bed Charges (Auto-added)</p>
              <p className="text-2xl font-bold text-[var(--accent-color)]">
                ₹{(wardData.wards.find(w => w.name === patient.wardType)?.price || 0) * (patient.daysAdmitted || 1)}
              </p>
            </div>
          </div>

          {/* Add-ons */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Select Add-ons</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {wardData.addons.map((addon, index) => (
                <label
                  key={index}
                  className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedAddons.find(a => a.name === addon.name)
                      ? 'border-[var(--accent-color)] bg-[var(--accent-color)]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={!!selectedAddons.find(a => a.name === addon.name)}
                    onChange={() => handleToggleAddon(addon)}
                    className="h-5 w-5 rounded text-[var(--accent-color)] focus:ring-[var(--accent-color)]"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{addon.name}</p>
                    <p className="text-sm text-gray-600">₹{addon.price}/day</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="font-semibold text-[var(--accent-color)]">
                      ₹{addon.price * (patient.daysAdmitted || 1)}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Select Services</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {wardData.services.map((service, index) => (
                <label
                  key={index}
                  className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedServices.find(s => s.name === service.name)
                      ? 'border-[var(--accent-color)] bg-[var(--accent-color)]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={!!selectedServices.find(s => s.name === service.name)}
                    onChange={() => handleToggleService(service)}
                    className="h-5 w-5 rounded text-[var(--accent-color)] focus:ring-[var(--accent-color)]"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{service.name}</p>
                    <p className="text-sm text-gray-600">₹{service.price}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="font-semibold text-[var(--accent-color)]">₹{service.price}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Add Button */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              onClick={handleAddItems}
              data-testid="add-ipd-items-btn"
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