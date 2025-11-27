import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Package, Scan, Plus } from "lucide-react";
import { toast } from 'react-toastify';

// Dummy pharmacy products
const dummyPharmacyProducts = {
  "P001": { id: "P001", name: "Paracetamol 500mg", rate: 10 },
  "P002": { id: "P002", name: "Ibuprofen 400mg", rate: 15 },
  "P003": { id: "P003", name: "Azithromycin 250mg", rate: 50 },
  "P004": { id: "P004", name: "Vitamin C 1000mg", rate: 25 },
  "P005": { id: "P005", name: "Cetirizine 10mg", rate: 12 }
};

export default function PharmacyModal({ onClose, onAddItems }) {
  const [productCode, setProductCode] = useState("");
  const [scannedItems, setScannedItems] = useState([]);

  const handleScan = (code) => {
    const product = dummyPharmacyProducts[code];
    
    if (!product) {
      toast.error("Product not found");
      return;
    }
    
    // Check if item already exists
    const existingItem = scannedItems.find(item => item.id === `item-${product.id}`);
    if (existingItem) {
      setScannedItems(scannedItems.map(item =>
        item.id === existingItem.id
          ? { 
              ...item, 
              quantity: item.quantity + 1, 
              amount: (item.quantity + 1) * item.cost 
            }
          : item
      ));
      toast.info(`Updated quantity for ${product.name}`);
    } else {
      setScannedItems([
        ...scannedItems,
        {
          id: `item-${Date.now()}-${product.id}`,
          description: product.name,
          cost: product.rate,
          quantity: 1,
          amount: product.rate
        }
      ]);
      toast.success(`Added ${product.name}`);
    }
    setProductCode("");
  };

  const handleUpdateQuantity = (id, quantity) => {
    setScannedItems(scannedItems.map(item =>
      item.id === id
        ? { 
            ...item, 
            quantity: Math.max(1, parseInt(quantity) || 1), 
            amount: Math.max(item.cost, (parseInt(quantity) || 1) * item.cost) 
          }
        : item
    ));
  };

  const handleRemoveItem = (id) => {
    setScannedItems(scannedItems.filter(item => item.id !== id));
    toast.error("Item removed");
  };

  const handleAddItems = () => {
    if (scannedItems.length === 0) {
      toast.error("Please scan at least one item");
      return;
    }
    onAddItems(scannedItems);
    onClose();
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
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            <Package className="text-[var(--accent-color)]" size={28} />
            Pharmacy
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            data-testid="close-pharmacy-modal-btn"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Scanner */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Scan Product</h3>
            <div className="flex gap-3">
              <input
                type="text"
                value={productCode}
                onChange={(e) => setProductCode(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && productCode && handleScan(productCode)}
                placeholder="Enter product code (e.g., P001, P002)"
                data-testid="pharmacy-scan-input"
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[var(--accent-color)] transition-all"
              />
              <button
                onClick={() => productCode && handleScan(productCode)}
                data-testid="pharmacy-scan-btn"
                className="px-6 py-3 bg-[var(--accent-color)] text-white rounded-xl hover:bg-[var(--accent-color)]/90 transition-all flex items-center gap-2"
              >
                <Scan size={20} />
                Scan
              </button>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Quick scan:</p>
              <div className="flex flex-wrap gap-2">
                {Object.keys(dummyPharmacyProducts).map((code) => (
                  <button
                    key={code}
                    onClick={() => handleScan(code)}
                    className="px-3 py-2 bg-white border-2 border-orange-200 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors text-sm font-medium"
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Scanned Items */}
          {scannedItems.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Scanned Items</h3>
              <div className="space-y-3">
                {scannedItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{item.description}</p>
                      <p className="text-sm text-gray-600">₹{item.cost} each</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleUpdateQuantity(item.id, e.target.value)}
                        className="w-20 px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[var(--accent-color)]"
                        min="1"
                      />
                      <div className="text-right min-w-[80px]">
                        <p className="text-sm text-gray-600">Total</p>
                        <p className="font-semibold text-[var(--accent-color)]">₹{item.amount}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Button */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              onClick={handleAddItems}
              data-testid="add-pharmacy-items-btn"
              className="px-6 py-3 text-white rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center gap-2 bg-gradient-to-r from-[#01B07A] to-[#1A223F] hover:from-[#019e6b] hover:to-[#141b36]"
            >
              <Plus size={20} />
              Add to Bill ({scannedItems.length} items)
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}