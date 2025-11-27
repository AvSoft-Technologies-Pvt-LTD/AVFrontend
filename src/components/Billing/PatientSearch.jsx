import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, Loader2 } from "lucide-react";

export default function PatientSearch({ onSearch, isLoading }) {
  const [patientId, setPatientId] = useState("");

  const handleSearch = () => {
    if (patientId.trim()) {
      onSearch(patientId.trim());
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="mb-8"
    >
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-teal-100 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Patient Search
        </h2>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter Patient ID (e.g., PT001, PT002, PT003)"
              data-testid="patient-search-input"
              className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[var(--accent-color)] transition-all"
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
          <button
            onClick={handleSearch}
            disabled={isLoading || !patientId.trim()}
            data-testid="search-patient-btn"
            className="px-8 py-3 text-white rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg flex items-center gap-2 bg-gradient-to-r from-[#01B07A] to-[#1A223F] hover:from-[#019e6b] hover:to-[#141b36] disabled:from-gray-400 disabled:to-gray-600"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Searching...
              </>
            ) : (
              "Search"
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}