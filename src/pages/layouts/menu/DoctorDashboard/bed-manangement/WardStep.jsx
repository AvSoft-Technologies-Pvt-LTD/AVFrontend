import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Plus,
  Trash2,
  Users,
  Heart,
  Baby,
  Shield,
  AlertTriangle,
  Activity,
} from "lucide-react";

import {
  getAllWardTypes as apiGetAllWardTypes,
  createWardType as apiCreateWardType,
  deleteWardType as apiDeleteWardType,
} from "../../../../../utils/CrudService";

const DEFAULT_ICON = Building2;

const guessIconForName = (name) => {
  if (!name) return Users;
  const n = String(name).toLowerCase();
  if (n.includes("icu") || n.includes("intensive")) return Heart;
  if (n.includes("maternity") || n.includes("baby")) return Baby;
  if (n.includes("private") || n.includes("single")) return Shield;
  if (n.includes("emergency")) return AlertTriangle;
  return Users;
};

const normalizeWardType = (raw) => {
  const id =
    raw.id ??
    raw.type ??
    raw.key ??
    raw.typeId ??
    raw._id ??
    raw.uuid ??
    String(raw.name || raw.typeName || raw.type || raw.id);
  const name = raw.typeName || raw.name || raw.type || `Ward ${id}`;
  const typeName = raw.typeName || raw.name || raw.type || String(id);
  const description = raw.description || raw.desc || "";
  const guess = guessIconForName(name);
  const icon = raw.icon || (guess && (guess.displayName || guess)) || "Users";
  const color = raw.color || raw.style || "bg-gray-50";
  return { ...raw, id, name, typeName, description, icon, color };
};

const WardStep = ({
  bedMasterData,
  setBedMasterData,
  wardTypes: wardTypesProp,
  addingWard: addingWardProp,
  setAddingWard: setAddingWardProp,
  editingNameById,
  setEditingNameById,
  addWard: addWardProp,
  deleteWard: deleteWardProp,
  isEditMode,
}) => {
  const [localWardTypes, setLocalWardTypes] = useState((wardTypesProp || []).map(normalizeWardType));
  const [localAdding, setLocalAdding] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addingWard = addingWardProp ?? localAdding;
  const setAddingWard = setAddingWardProp ?? setLocalAdding;

  const getIconComponent = (iconNameOrComp) => {
    if (!iconNameOrComp) return DEFAULT_ICON;
    if (typeof iconNameOrComp === "function") return iconNameOrComp;
    const map = { Users, Heart, Activity, Baby, Shield, AlertTriangle };
    return map[iconNameOrComp] || DEFAULT_ICON;
  };

  useEffect(() => {
    let mounted = true;
    const shouldFetch = !Array.isArray(wardTypesProp) || wardTypesProp.length === 0;

    if (!shouldFetch) {
      const normalized = (wardTypesProp || []).map(normalizeWardType);
      setLocalWardTypes(normalized);
      setBedMasterData((prev) => ({ ...prev, wardTypes: normalized }));
      return () => {
        mounted = false;
      };
    }

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiGetAllWardTypes();
        if (!mounted) return;
        const data = res?.data ?? [];
        const normalized = Array.isArray(data) ? data.map(normalizeWardType) : [];
        setLocalWardTypes(normalized);
        setBedMasterData((prev) => ({ ...prev, wardTypes: normalized }));
      } catch (err) {
        console.error("WardSetup: failed to fetch ward types:", err);
        if (!mounted) return;
        setError("Failed to load ward types from server.");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [wardTypesProp, setBedMasterData]);

  const wardMatchesType = (ward, wardType) => {
    if (!ward || !wardType) return false;
    const wardTypeVals = [wardType.id, wardType.name, wardType.typeName].map((v) => String(v));
    const wardVal = String(ward.type ?? ward.typeId ?? ward.wardTypeId ?? ward.typeName ?? "");
    return wardTypeVals.includes(wardVal);
  };

  const handleAddWard = useCallback(
    async (wardTypeId, departmentId) => {
      if (typeof addWardProp === "function") return addWardProp(wardTypeId, departmentId);

      const key = `${departmentId}_${wardTypeId}`;
      setAddingWard((prev) => ({ ...prev, [key]: true }));

      try {
        const wardType = (localWardTypes || []).find((t) => String(t.id) === String(wardTypeId));

        if (!wardType) {
          console.error("Ward type not found:", wardTypeId);
          return;
        }

        const existing = bedMasterData.wards || [];
        const sameTypeCount = existing.filter(
          (w) => String(w.departmentId) === String(departmentId) && wardMatchesType(w, wardType)
        ).length;

        const displayBase = wardType.typeName || wardType.name || "Ward";
        const displayName = `${displayBase} ${sameTypeCount + 1}`;

        const payload = {
          name: displayName,
          wardName: displayName,
          type: wardType.id,
          typeId: wardType.id,
          wardTypeId: wardType.id,
          typeName: wardType.typeName || wardType.name,
          departmentId,
          specializationId: departmentId,
        };

        const res = await apiCreateWardType(payload);
        const createdRaw = res?.data ?? null;

        const created = createdRaw
          ? normalizeWardType(createdRaw)
          : { ...payload, id: `ward-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` };

        const createdWard = {
          ...created,
          id: created.id ?? `ward-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name: created.name || displayName,
          wardName: created.wardName || created.name || displayName,
          type: created.type ?? created.typeId ?? created.wardTypeId ?? wardType.id,
          typeId: created.typeId ?? created.type ?? created.wardTypeId ?? wardType.id,
          wardTypeId: created.wardTypeId ?? created.typeId ?? created.type ?? wardType.id,
          typeName: created.typeName || wardType.typeName || wardType.name,
          departmentId,
          specializationId: departmentId,
          wardType: wardType,
        };

        setLocalWardTypes((prev) => {
          const exists = (prev || []).some((t) => String(t.id) === String(createdWard.id));
          return exists
            ? (prev || []).map((t) => (String(t.id) === String(createdWard.id) ? createdWard : t))
            : [...(prev || []), createdWard];
        });

        setBedMasterData((prev) => ({
          ...prev,
          wards: [...(prev.wards || []), createdWard],
          selectedWard: createdWard,
          activeDepartmentId: departmentId,
        }));
      } catch (err) {
        console.error("WardSetup: failed to create ward type:", err);
      } finally {
        setAddingWard((prev) => {
          const copy = { ...(prev || {}) };
          delete copy[key];
          return copy;
        });
      }
    },
    [addWardProp, setAddingWard, localWardTypes, setBedMasterData, bedMasterData.wards]
  );

  const handleDeleteWard = useCallback(
    async (wardId) => {
      if (typeof deleteWardProp === "function") return deleteWardProp(wardId);

      try {
        await apiDeleteWardType(wardId);
        setLocalWardTypes((prev) => (prev || []).filter((t) => String(t.id) !== String(wardId)));
        setBedMasterData((prev) => ({
          ...prev,
          wards: (prev.wards || []).filter((w) => String(w.id) !== String(wardId)),
          selectedWard: prev.selectedWard && String(prev.selectedWard.id) === String(wardId) ? null : prev.selectedWard,
        }));
      } catch (err) {
        console.error("WardSetup: failed to delete ward type:", err);
      }
    },
    [deleteWardProp, setBedMasterData]
  );

  const computeDisplayLabel = (ward) => {
    const isGenericBackendName = ward?.name && /^ward\s*\d+$/i.test(String(ward.name).trim());

    const resolvedType = (localWardTypes || []).find((t) => {
      try {
        return (
          String(t.id) === String(ward.type) ||
          String(t.id) === String(ward.typeId) ||
          String(t.id) === String(ward.wardTypeId) ||
          String(t.typeName) === String(ward.typeName) ||
          String(t.name) === String(ward.typeName) ||
          String(t.name) === String(ward.name) ||
          (ward.wardType && String(t.id) === String(ward.wardType.id))
        );
      } catch (e) {
        return false;
      }
    });

    if (ward?.name && !isGenericBackendName) return ward.name;
    if (ward?.typeName) return ward.typeName;
    if (resolvedType) return resolvedType.typeName || resolvedType.name;
    return ward?.name || `Ward ${ward?.id ?? ""}`;
  };

  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <Building2 className="text-purple-600" size={20} />
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Ward Creation</h2>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading ward types...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : !bedMasterData?.departments || bedMasterData.departments.length === 0 ? (
        <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg">
          <Building2 className="mx-auto mb-4 text-gray-400" size={40} />
          <h3 className="text-base sm:text-lg font-semibold text-gray-600">No Departments Created</h3>
          <p className="text-sm sm:text-base text-gray-500">Please create a department first</p>
        </div>
      ) : (
        (bedMasterData.departments || []).map((department) => {
          const isActiveDepartment = String(bedMasterData.selectedDepartment?.id) === String(department.id);
          const isAddingWard = String(bedMasterData.activeDepartmentId) === String(department.id);

          return (
            <div
              key={department.id}
              className={`bg-white rounded-lg p-4 sm:p-6 border border-gray-200 shadow-sm mb-6 cursor-pointer ${
                isActiveDepartment || isAddingWard ? "ring-2 ring-green-500 border-green-500 bg-green-50" : ""
              }`}
              onClick={() => setBedMasterData((prev) => ({ ...prev, selectedDepartment: isActiveDepartment ? null : department }))}
            >
              <h3 className="text-base sm:text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
                <Building2 className="text-[var(--primary-color)]" size={16} />
                <span className="break-words">Ward Creation ({department.name})</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 mb-4">
                {(localWardTypes || []).map((wardType) => {
                  const IconComponent = getIconComponent(wardType.icon) || DEFAULT_ICON;
                  const wardCount = (bedMasterData.wards || []).filter(
                    (w) => wardMatchesType(w, wardType) && String(w.departmentId) === String(department.id)
                  ).length;
                  const key = `${department.id}_${wardType.id}`;

                  return (
                    <motion.div
                      key={wardType.id}
                      className={`relative p-3 sm:p-4 rounded-lg border transition-all duration-200 ${
                        wardCount > 0 ? "bg-green-50 border-green-200" : wardType.color || ""
                      }`}
                      whileHover={{ scale: 1.02 }}
                    >
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          setBedMasterData((prev) => ({ ...prev, selectedDepartment: department, activeDepartmentId: department.id }));
                          await handleAddWard(wardType.id, department.id);
                        }}
                        disabled={!!addingWard[key]}
                        className="absolute top-3 right-3 inline-flex items-center gap-1 text-xs text-[var(--accent-color)] font-medium"
                      >
                        <Plus size={12} />
                        {addingWard[key] ? "Adding..." : "Add Ward"}
                      </button>

                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <IconComponent size={14} />
                          <span className="font-medium text-xs sm:text-sm">{wardType.name}</span>
                        </div>
                      </div>

                      <p className="text-xs opacity-70 text-left mb-6">{wardType.description}</p>
                      {wardCount > 0 && (
                        <span className="absolute bottom-3 right-3 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                          {wardCount} added
                        </span>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-700">Created Wards:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  <AnimatePresence>
                    {(bedMasterData.wards || [])
                      .filter((w) => String(w.departmentId) === String(department.id))
                      .map((ward) => {
                        const wardType = (localWardTypes || []).find((t) => {
                          try {
                            return (
                              String(t.id) === String(ward.type) ||
                              String(t.id) === String(ward.typeId) ||
                              String(t.id) === String(ward.wardTypeId) ||
                              String(t.typeName) === String(ward.typeName) ||
                              String(t.name) === String(ward.typeName) ||
                              String(t.name) === String(ward.name) ||
                              (ward.wardType && String(t.id) === String(ward.wardType.id))
                            );
                          } catch (e) {
                            return false;
                          }
                        });

                        const IconComponent = getIconComponent(wardType?.icon) || Building2;
                        const isHighlighted = String(bedMasterData.selectedWard?.id) === String(ward.id);

                        const displayLabel = computeDisplayLabel(ward);

                        return (
                          <motion.div
                            key={ward.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer ${
                              isHighlighted
                                ? "border-[var(--accent-color)] bg-[var(--accent-color)] bg-opacity-10 ring-1 ring-[var(--accent-color)]"
                                : wardType?.color || "bg-gray-50"
                            }`}
                            onClick={() => setBedMasterData((prev) => ({ ...prev, selectedWard: ward }))}
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <IconComponent size={14} />
                              <div className="min-w-0">
                                {bedMasterData.selectedWard?.id === ward.id && editingNameById?.[ward.id] ? (
                                  <input
                                    value={editingNameById[ward.id]}
                                    onChange={(e) => setEditingNameById((prev) => ({ ...prev, [ward.id]: e.target.value }))}
                                    onBlur={() => {
                                      const newName = editingNameById[ward.id]?.trim();
                                      if (newName) {
                                        setBedMasterData((prev) => ({
                                          ...prev,
                                          wards: prev.wards.map((w) => (w.id === ward.id ? { ...w, name: newName, wardName: newName } : w)),
                                        }));
                                        setLocalWardTypes((prev) => (prev || []).map((t) => (t.id === ward.id ? { ...t, name: newName } : t)));
                                      }
                                      setEditingNameById((prev) => ({ ...prev, [ward.id]: undefined }));
                                    }}
                                    onKeyDown={(e) => e.key === "Enter" && e.target.blur()}
                                    className="text-sm font-medium block truncate bg-white px-1 py-0.5 rounded border"
                                  />
                                ) : (
                                  <span
                                    className="font-medium text-sm block truncate cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingNameById((prev) => ({ ...prev, [ward.id]: ward.name }));
                                    }}
                                  >
                                    {displayLabel}
                                  </span>
                                )}
                                <div className="text-xs opacity-70">{wardType?.description}</div>
                              </div>
                            </div>

                            {!isEditMode && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteWard(ward.id);
                                }}
                                className="text-red-500 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors flex-shrink-0"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </motion.div>
                        );
                      })}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          );
        })
      )}
    </motion.div>
  );
};

export default WardStep;