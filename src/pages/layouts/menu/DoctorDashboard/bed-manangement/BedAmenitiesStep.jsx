import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bed,
  DoorOpen as Door,
  Settings,
  Plus,
  Trash2,
  Monitor,
  Circle,
  Phone,
  Eye,
  Activity,
} from "lucide-react";
import { getAllBedAmenities, getAllBedStatuses } from "../../../../../utils/CrudService";

const BedAmenitiesStep = ({
  bedMasterData,
  setBedMasterData,
  bedCountByRoom,
  setBedCountByRoom,
  addBed,
  deleteBed,
}) => {
  const [bedAmenityOptions, setBedAmenityOptions] = useState([]);
  const [loadingBedAmenities, setLoadingBedAmenities] = useState(false);
  const [bedStatusOptions, setBedStatusOptions] = useState([]);
  const [loadingBedStatuses, setLoadingBedStatuses] = useState(false);

  useEffect(() => {
    fetchBedAmenities();
    fetchBedStatuses();
  }, []);

  useEffect(() => {
    console.log("Current beds in state:", bedMasterData.beds);
  }, [bedMasterData.beds]);

  const fetchBedAmenities = async () => {
    setLoadingBedAmenities(true);
    try {
      const resp = await getAllBedAmenities();
      const data = resp?.data ?? [];
      if (Array.isArray(data) && data.length > 0) {
        const normalized = data.map((item) => ({
          id: String(item.id ?? item.key ?? item._id ?? item.name),
          name: item.amenityName ?? item.name ?? item.label ?? item.displayName ?? String(item.id),
          icon: item.icon ?? item.iconName ?? "Monitor",
          color: item.color ?? "text-gray-500",
          ...item,
        }));
        setBedAmenityOptions(normalized);
      } else {
        console.warn("No bed amenities found from API.");
        setBedAmenityOptions([]);
      }
    } catch (err) {
      console.error("Failed to load bed amenities:", err);
      setBedAmenityOptions([]);
    } finally {
      setLoadingBedAmenities(false);
    }
  };

  const fetchBedStatuses = async () => {
    setLoadingBedStatuses(true);
    try {
      const resp = await getAllBedStatuses();
      const data = resp?.data ?? [];
      if (Array.isArray(data) && data.length > 0) {
        const normalized = data.map((item) => ({
          id: String(item.id ?? item.key ?? item.code ?? item.value ?? item._id),
          value: Number(item.id ?? item.bedStatusId ?? item.key ?? item.code), // ✅ Store numeric value
          name: item.statusName ?? item.name ?? item.label ?? item.displayName ?? String(item.id),
          color: item.color ?? item.bgClass ?? null,
          ...item,
        }));
        setBedStatusOptions(normalized);
      } else {
        console.warn("No bed statuses found from API.");
        setBedStatusOptions([]);
      }
    } catch (err) {
      console.error("Failed to load bed statuses:", err);
      setBedStatusOptions([]);
    } finally {
      setLoadingBedStatuses(false);
    }
  };

  const getIconComponent = (iconName) => {
    const icons = { Monitor, Settings, Circle, Activity, Phone, Eye };
    return icons[iconName] || Monitor;
  };

  // ✅ FIXED: Map bedStatusId to color
  const statusColorsMapFromOptions = (bedStatusId) => {
    const found = bedStatusOptions.find((s) => Number(s.value) === Number(bedStatusId));
    if (found?.color) return found.color.startsWith("bg-") ? found.color : undefined;
    return "bg-gray-300";
  };

  if (loadingBedAmenities || loadingBedStatuses) {
    return (
      <div className="text-center py-8 sm:py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        <p className="mt-4 text-gray-600">Loading bed configuration...</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <Bed className="text-orange-600" size={20} />
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Bed Configuration</h2>
      </div>

      {!bedMasterData.rooms || bedMasterData.rooms.length === 0 ? (
        <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg">
          <Door className="mx-auto mb-4 text-gray-400" size={40} />
          <h3 className="text-base sm:text-lg font-semibold text-gray-600">No Rooms Created</h3>
          <p className="text-sm sm:text-base text-gray-500">Please create rooms first</p>
        </div>
      ) : (
        bedMasterData.rooms.map((room) => {
          const ward = bedMasterData.wards?.find((w) => String(w.id) === String(room.wardId));
          const department = bedMasterData.departments?.find(
            (d) => String(d.id) === String(ward?.departmentId)
          );
          const isActiveRoom = String(bedMasterData.selectedRoom?.id) === String(room.id);
          const isAddingBed = String(bedMasterData.activeRoomId) === String(room.id);

          const roomBedAmenities = Array.isArray(bedMasterData.bedAmenitiesByRoom?.[room.id])
            ? bedMasterData.bedAmenitiesByRoom[room.id]
            : Array.isArray(room.amenities)
            ? room.amenities
            : [];
          const roomBedAmenitiesSet = new Set((roomBedAmenities || []).map((x) => String(x)));

          const filteredBeds =
            bedMasterData.beds?.filter((b) => String(b.roomId) === String(room.id)) || [];
          console.log("Room:", room.id, "Filtered beds:", filteredBeds);

          return (
            <div
              key={room.id}
              className={`bg-white rounded-lg p-4 sm:p-6 border border-gray-200 shadow-sm mb-6 ${
                isActiveRoom || isAddingBed
                  ? "ring-2 ring-[var(--accent-color)] border-[var(--accent-color)] bg-[var(--accent-color)] bg-opacity-10"
                  : ""
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Door className="text-[var(--accent-color)]" size={16} />
                  <span className="break-words">Bed Configuration - {room.name}</span>
                </h3>
              </div>

              {/* Bed Amenities */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-semibold mb-2 text-gray-700 flex items-center gap-2">
                  <Settings size={14} /> Bed Amenities
                </h4>
                {bedAmenityOptions.length === 0 ? (
                  <p className="text-gray-500 text-sm">No amenities available.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {bedAmenityOptions.map((amenity) => {
                      const IconComponent = getIconComponent(amenity.icon);
                      const amenityIdStr = String(amenity.id);
                      const isSelected = roomBedAmenitiesSet.has(amenityIdStr);
                      return (
                        <button
                          key={amenity.id}
                          onClick={() => {
                            setBedMasterData((prev) => {
                              const currentRoom =
                                prev.rooms.find((r) => String(r.id) === String(room.id)) || room;
                              const currentAmenities = Array.isArray(currentRoom.amenities)
                                ? currentRoom.amenities.map(String)
                                : [];
                              const updatedAmenities = currentAmenities.includes(amenityIdStr)
                                ? currentAmenities.filter((id) => id !== amenityIdStr)
                                : [...currentAmenities, amenityIdStr];
                              const updatedRoom = { ...currentRoom, amenities: updatedAmenities };
                              const updatedBedAmenitiesByRoom = {
                                ...(prev.bedAmenitiesByRoom || {}),
                                [room.id]: updatedAmenities,
                              };
                              return {
                                ...prev,
                                rooms: prev.rooms.map((r) =>
                                  String(r.id) === String(room.id) ? updatedRoom : r
                                ),
                                bedAmenitiesByRoom: updatedBedAmenitiesByRoom,
                                beds: prev.beds.map((b) =>
                                  String(b.roomId) === String(room.id)
                                    ? { ...b, amenities: updatedAmenities }
                                    : b
                                ),
                              };
                            });
                          }}
                          className={`flex items-center justify-between p-2 rounded-lg border transition-all duration-200 ${
                            isSelected
                              ? "border-orange-500 bg-orange-50 shadow-sm"
                              : "border-gray-200 bg-white hover:bg-gray-50 hover:border-orange-300"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <IconComponent className={amenity.color} size={12} />
                            <span className="text-xs font-medium truncate">{amenity.name}</span>
                          </div>
                          <div
                            className={`w-4 h-2 flex items-center rounded-full p-0.5 transition-all duration-200 flex-shrink-0 ${
                              isSelected ? "bg-orange-500 justify-end" : "bg-gray-300 justify-start"
                            }`}
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Bed Count & Add */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4">
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={bedCountByRoom[room.id] ?? 1}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    setBedCountByRoom((prev) => ({
                      ...prev,
                      [room.id]: isNaN(v) ? 1 : Math.max(1, Math.min(20, v)),
                    }));
                  }}
                  placeholder="Beds"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm w-full sm:w-20"
                />
                <button
                  onClick={async () => {
                    if (!room.number) return;
                    const count = Math.max(1, parseInt(bedCountByRoom[room.id] ?? 1, 10));
                    setBedMasterData((prev) => ({ ...prev, selectedRoom: room, activeRoomId: room.id }));
                    await addBed(room.id, count);
                  }}
                  disabled={!room.number || String(bedMasterData.activeRoomId) === String(room.id)}
                  className="btn view-btn text-sm flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={14} /> Add Beds
                </button>
              </div>

              {/* Beds Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                <AnimatePresence>
                  {filteredBeds.map((bed) => {
                    const statusColorClass = statusColorsMapFromOptions(bed.bedStatusId || 1);
                    return (
                      <motion.div
                        key={bed.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <Bed className="text-orange-600 flex-shrink-0" size={14} />
                            <span className="font-medium text-xs sm:text-sm truncate">{bed.name}</span>
                          </div>
                          <button
                            onClick={() => deleteBed(bed.id)}
                            className="text-red-500 hover:text-red-600 p-1 rounded hover:bg-red-50 flex-shrink-0"
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>

                        {/* ✅ FIXED: Bind to bedStatusId (numeric) */}
                        <select
                          value={bed.bedStatusId || bedStatusOptions[0]?.value || 1}
                          onChange={(e) => {
                            e.stopPropagation();
                            const newStatusId = Number(e.target.value);
                            setBedMasterData((prev) => ({
                              ...prev,
                              beds: prev.beds.map((b) =>
                                String(b.id) === String(bed.id) ? { ...b, bedStatusId: newStatusId } : b
                              ),
                            }));
                          }}
                          className="w-full text-xs border border-gray-300 rounded mb-2 px-2 py-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {bedStatusOptions.map((s) => (
                            <option key={s.id ?? s.value} value={s.value}>
                              {s.name}
                            </option>
                          ))}
                        </select>

                        <div className={`${statusColorClass} h-2 rounded-full`} />

                        <div className="flex flex-wrap gap-1 mt-2">
                          {Array.isArray(bed.amenities) &&
                            bed.amenities.map((amenityId) => {
                              const amenity = bedAmenityOptions.find(
                                (a) => String(a.id) === String(amenityId)
                              );
                              if (!amenity) return null;
                              const IconComponent = getIconComponent(amenity.icon);
                              return (
                                <span
                                  key={amenityId}
                                  className="inline-flex items-center gap-1 px-1 py-0.5 bg-gray-100 rounded-full text-xs"
                                  title={amenity.name}
                                >
                                  <IconComponent className={amenity.color} size={8} />
                                </span>
                              );
                            })}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          );
        })
      )}
    </motion.div>
  );
};

export default BedAmenitiesStep;
