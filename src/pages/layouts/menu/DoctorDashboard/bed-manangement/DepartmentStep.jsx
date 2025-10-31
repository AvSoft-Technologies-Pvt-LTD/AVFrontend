// DepartmentStep.jsx
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building, Plus, Trash2, ChevronDown, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { getAllSpecializations } from "../../../../../utils/masterService";

const DepartmentStep = ({
  bedMasterData,
  setBedMasterData,
  isEditMode,
  editingNameById,
  setEditingNameById,
  addDepartment,
  deleteDepartment,
}) => {
  const [specializations, setSpecializations] = useState([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState(null);
  const [loadingSpecializations, setLoadingSpecializations] = useState(false);
  const [specializationError, setSpecializationError] = useState(null);

  const [specDropdownOpen, setSpecDropdownOpen] = useState(false);
  const [specSearch, setSpecSearch] = useState("");
  const specDropdownRef = useRef(null);

  useEffect(() => {
    const fetchSpecializations = async () => {
      setLoadingSpecializations(true);
      setSpecializationError(null);
      try {
        const resp = await getAllSpecializations();
        const data = resp?.data ?? [];
        setSpecializations(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("getAllSpecializations error:", error);
        setSpecializationError("Failed to load specializations. Please try again or add departments manually.");
        setSpecializations([]);
      } finally {
        setLoadingSpecializations(false);
      }
    };

    fetchSpecializations();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (specDropdownRef.current && !specDropdownRef.current.contains(e.target)) {
        setSpecDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredSpecs = specializations.filter((s) => {
    const label = (s.name || s.specializationName || s.description || "").toLowerCase();
    return label.includes(specSearch.trim().toLowerCase());
  });

  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 sm:space-y-6">
      {!isEditMode && (
        <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 shadow-sm">
          <h3 className="text-base sm:text-lg font-semibold mb-4">Add Department from Specializations</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1" ref={specDropdownRef}>
              <button
                type="button"
                onClick={() => {
                  setSpecDropdownOpen((s) => !s);
                  setSpecSearch("");
                }}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] appearance-none bg-white flex items-center justify-between text-left"
                disabled={loadingSpecializations}
              >
                <span className="truncate">
                  {selectedSpecialization ? (selectedSpecialization.name || selectedSpecialization.specializationName || selectedSpecialization.description) : "Select a specialization"}
                </span>
                <ChevronDown className="text-gray-400" size={16} />
              </button>

              {specDropdownOpen && (
                <div className="absolute z-[60] mt-1 w-full bg-white border border-gray-200 rounded shadow max-h-60 overflow-auto">
                  <div className="p-2 border-b border-gray-100">
                    <input
                      type="text"
                      value={specSearch}
                      onChange={(e) => setSpecSearch(e.target.value)}
                      placeholder="Search..."
                      className="w-full px-3 py-2 text-sm border rounded focus:outline-none"
                    />
                  </div>

                  <div>
                    {loadingSpecializations ? (
                      <div className="p-3 text-sm flex items-center gap-2">
                        <Loader2 className="animate-spin" size={16} /> Loading...
                      </div>
                    ) : filteredSpecs.length === 0 ? (
                      <div className="p-3 text-sm text-gray-500">No specializations found</div>
                    ) : (
                      filteredSpecs.map((spec) => (
                        <div
                          key={spec.id}
                          className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                          onClick={() => {
                            setSelectedSpecialization(spec);
                            setSpecDropdownOpen(false);
                            setSpecSearch("");
                          }}
                        >
                          {spec.name || spec.specializationName || spec.description || "Unknown Specialization"}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (selectedSpecialization) {
                    addDepartment(selectedSpecialization);
                    setSelectedSpecialization(null);
                  } else {
                    toast.warning("Please select a specialization to add.");
                  }
                }}
                disabled={!selectedSpecialization || loadingSpecializations}
                className="btn btn-primary flex-shrink-0"
              >
                <Plus size={16} /> Add
              </button>
            </div>
          </div>
          {specializationError && <p className="text-red-500 text-sm mt-2">{specializationError}</p>}
          {loadingSpecializations && <p className="text-[var(--accent-color)] text-sm mt-2 flex items-center gap-2"><Loader2 size={16} className="animate-spin" />Loading specializations...</p>}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <AnimatePresence>
          {bedMasterData.departments.map((dept) => (
            <motion.div 
              key={dept.id} 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.9 }} 
              className={`bg-white rounded-lg p-4 border shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer ${bedMasterData.selectedDepartment?.id === dept.id ? "border-[var(--accent-color)] ring-2 ring-[var(--accent-color)] ring-opacity-20" : "border-gray-200"}`} 
              onClick={() => setBedMasterData((prev) => ({ ...prev, selectedDepartment: dept }))}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 bg-[var(--primary-color)] rounded-full flex items-center justify-center flex-shrink-0">
                    <Building className="text-white" size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    {bedMasterData.selectedDepartment?.id === dept.id && editingNameById[dept.id] ? (
                      <input 
                        value={editingNameById[dept.id]} 
                        onChange={(e) => setEditingNameById((prev) => ({ ...prev, [dept.id]: e.target.value }))} 
                        onBlur={() => {
                          const newName = editingNameById[dept.id]?.trim();
                          if (newName) setBedMasterData((prev) => ({ ...prev, departments: prev.departments.map((d) => d.id === dept.id ? { ...d, name: newName } : d) }));
                          setEditingNameById((prev) => ({ ...prev, [dept.id]: undefined }));
                        }} 
                        onKeyDown={(e) => e.key === "Enter" && e.target.blur()} 
                        className="text-base font-semibold bg-white px-2 py-1 rounded border w-full" 
                      />
                    ) : (
                      <h3 
                        className="text-base font-semibold text-gray-900 truncate cursor-pointer" 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setEditingNameById((prev) => ({ ...prev, [dept.id]: dept.name })); 
                        }}
                      >
                        {dept.name}
                      </h3>
                    )}
                    <p className="text-sm text-gray-600">Wards: {bedMasterData.wards.filter((w) => String(w.departmentId) === String(dept.id)).length}</p>
                  </div>
                </div>
                {!dept.locked && (
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      deleteDepartment(dept.id); 
                    }} 
                    className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default DepartmentStep;