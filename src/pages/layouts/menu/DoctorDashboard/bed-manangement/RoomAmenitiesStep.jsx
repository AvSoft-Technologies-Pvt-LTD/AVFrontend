import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  DoorOpen as Door,
  Settings,
  Plus,
  Trash2,
  Snowflake,
  Activity,
  Thermometer,
  Wifi,
  Phone,
  Monitor,
  ShowerHead,
  Loader,
  AlertCircle,
  Utensils,
  Armchair,
  Tv,
  Box
} from "lucide-react";
import { getAllRoomAmenities } from "../../../../../utils/CrudService";
import { toast } from "react-toastify";

const RoomAmenitiesStep = ({
  bedMasterData,
  setBedMasterData,
  roomAddErrors,
  setRoomAddErrors,
  newRoomNameByWard,
  setNewRoomNameByWard,
  addingRoomByWard,
  setAddingRoomByWard,
  handleAddRoom,
  deleteRoom,
}) => {
  const [roomAmenities, setRoomAmenities] = useState([]);
  const [loadingAmenities, setLoadingAmenities] = useState(false);
  const [amenitiesError, setAmenitiesError] = useState(null);

  const localWardTypes = bedMasterData?.localWardTypes || bedMasterData?.wardTypes || [];

  const getWardTypeName = (ward) => {
    if (!ward) return "Unknown";
    if (ward.typeName) return ward.typeName;
    try {
      const t = (localWardTypes || []).find((tt) => {
        return (
          String(tt.id) === String(ward.type) ||
          String(tt.id) === String(ward.typeId) ||
          String(tt.typeName) === String(ward.typeName) ||
          String(tt.name) === String(ward.typeName) ||
          String(tt.name) === String(ward.name)
        );
      });
      return t?.typeName || t?.name || null;
    } catch (e) {
      return null;
    }
  };

  const computeDisplayLabel = (ward) => {
    if (!ward) return "Unknown";
    const isGenericBackendName = ward?.name && /^ward\s*\d+$/i.test(String(ward.name).trim());
    const resolvedType = (localWardTypes || []).find((t) => {
      try {
        return (
          String(t.id) === String(ward.type) ||
          String(t.id) === String(ward.typeId) ||
          String(t.typeName) === String(ward.typeName) ||
          String(t.name) === String(ward.typeName) ||
          String(t.name) === String(ward.name)
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

const getIconComponent = (amenityName) => {
  if (!amenityName) return Monitor;
  const name = String(amenityName).toLowerCase();
  if (name.includes("air") || name.includes("conditioning") || name.includes("ac")) return Snowflake;
  if (name.includes("oxygen") || name.includes("supply")) return Activity;
  if (name.includes("heating") || name.includes("temperature")) return Thermometer;
  if (name.includes("wifi") || name.includes("internet")) return Wifi;
  if (name.includes("phone") || name.includes("call")) return Phone;
  if (name.includes("tv") || name.includes("television") || name.includes("smart tv")) return Tv;
  if (name.includes("bathroom") || name.includes("shower")) return ShowerHead;
  if (name.includes("recliner") || name.includes("chair")) return Armchair;
  if (name.includes("refrigerator") || name.includes("fridge")) return Box;
  if (name.includes("meal") || name.includes("service")) return Utensils;
  if (name.includes("string")) return Monitor;
  return Monitor;
};

  const getAmenityColor = (amenityName) => {
    if (!amenityName) return "text-gray-500";
    const name = String(amenityName).toLowerCase();
    if (name.includes("air") || name.includes("ac")) return "text-blue-500";
    if (name.includes("oxygen")) return "text-green-500";
    if (name.includes("heating")) return "text-orange-500";
    if (name.includes("wifi")) return "text-purple-500";
    if (name.includes("phone")) return "text-indigo-500";
    if (name.includes("tv") || name.includes("television") || name.includes("smart tv")) return "text-gray-500";
    if (name.includes("bathroom")) return "text-cyan-500";
    if (name.includes("recliner") || name.includes("chair")) return "text-yellow-500";
    if (name.includes("refrigerator") || name.includes("fridge")) return "text-blue-500";
    if (name.includes("meal") || name.includes("service")) return "text-red-500";
    if (name.includes("string")) return "text-gray-500";
    return "text-gray-500";
  };

  const fetchRoomAmenities = async () => {
    setLoadingAmenities(true);
    setAmenitiesError(null);
    try {
      const response = await getAllRoomAmenities();
      let amenitiesData = [];
      if (Array.isArray(response?.data)) {
        amenitiesData = response.data;
      } else if (Array.isArray(response?.data?.List)) {
        amenitiesData = response.data.List;
      } else {
        const maybe = response?.data?.data;
        if (Array.isArray(maybe)) amenitiesData = maybe;
      }
      if (!Array.isArray(amenitiesData)) amenitiesData = [];
      const transformedAmenities = amenitiesData.map((amenity) => ({
        id: String(amenity.id ?? amenity.roomAmenityId ?? amenity._id ?? ""),
        name: amenity.roomAmenityName ?? amenity.name ?? amenity.roomAmenity ?? "Unnamed",
        icon: getIconComponent(amenity.roomAmenityName ?? amenity.name),
        color: getAmenityColor(amenity.roomAmenityName ?? amenity.name),
      }));
      setRoomAmenities(transformedAmenities);
    } catch (error) {
      console.error("Failed to fetch room amenities:", error);
      setAmenitiesError("Failed to load room amenities. Please try again.");
      toast.error("Failed to load room amenities");
      setRoomAmenities([
        { id: "1", name: "Air Conditioning", icon: Snowflake, color: "text-blue-500" },
        { id: "2", name: "Oxygen Supply", icon: Activity, color: "text-green-500" },
        { id: "3", name: "WiFi Access", icon: Wifi, color: "text-purple-500" },
      ]);
    } finally {
      setLoadingAmenities(false);
    }
  };

  useEffect(() => {
    fetchRoomAmenities();
  }, []);

  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <Door className="text-[var(--accent-color)]" size={20} />
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Room & Amenities Setup</h2>
      </div>
      {loadingAmenities && (
        <div className="flex items-center justify-center py-4">
          <Loader className="animate-spin mr-2" size={20} />
          <span className="text-gray-600">Loading room amenities...</span>
        </div>
      )}
      {amenitiesError && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="text-red-500" size={20} />
          <div>
            <p className="text-red-700 font-medium">Error loading amenities</p>
            <p className="text-red-600 text-sm">{amenitiesError}</p>
            <button
              onClick={fetchRoomAmenities}
              className="mt-2 text-sm text-red-700 hover:text-red-800 underline"
            >
              Retry
            </button>
          </div>
        </div>
      )}
      {!(Array.isArray(bedMasterData?.wards) && bedMasterData.wards.length > 0) ? (
        <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg">
          <Building2 className="mx-auto mb-4 text-gray-400" size={40} />
          <h3 className="text-base sm:text-lg font-semibold text-gray-600">No Wards Created</h3>
          <p className="text-sm sm:text-base text-gray-500">Please create wards first</p>
        </div>
      ) : (
        bedMasterData.wards.map((ward) => {
          const department = bedMasterData.departments.find((d) => String(d.id) === String(ward.departmentId));
          const isActiveWard = String(bedMasterData.selectedWard?.id) === String(ward.id);
          const isAddingRoom = String(bedMasterData.activeWardId) === String(ward.id);
          const wardAmenities = bedMasterData.roomAmenitiesByWard?.[ward.id] || [];
          const wardLabel = computeDisplayLabel(ward);
          const prefix = `${department?.name || "Dept"} - ${wardLabel} - `;
          const fullStored = newRoomNameByWard?.[ward.id] || prefix;
          const inputRoomNo = fullStored.split("-").pop().trim();
          const resolvedWardForState = () => {
            const resolvedType = (localWardTypes || []).find((t) => {
              try {
                return (
                  String(t.id) === String(ward.type) ||
                  String(t.id) === String(ward.typeId) ||
                  String(t.typeName) === String(ward.typeName) ||
                  String(t.name) === String(ward.typeName) ||
                  String(t.name) === String(ward.name)
                );
              } catch (e) {
                return false;
              }
            });
            return { ...ward, typeName: ward.typeName || resolvedType?.typeName || resolvedType?.name };
          };
          return (
            <div
              key={ward.id}
              className={`bg-white rounded-lg p-4 sm:p-6 border border-gray-200 shadow-sm mb-6 cursor-pointer ${isActiveWard || isAddingRoom ? "ring-2 ring-[var(--accent-color)] border-[var(--accent-color)] bg-[var(--accent-color)]/5" : ""}`}
              onClick={() => {
                setBedMasterData((prev) => ({ ...prev, selectedWard: isActiveWard ? null : resolvedWardForState(), activeWardId: ward.id }));
                setNewRoomNameByWard((prev) => ({ ...prev, [ward.id]: prefix }));
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Building2 className="text-purple-600" size={16} />
                  <div>
                    <div className="text-xs text-gray-500">Department - Ward</div>
                    <div className="font-semibold text-gray-900 text-sm truncate">
                      {department?.name || "Unknown"} - {getWardTypeName(ward) || ward?.typeName || ward?.name || "Unknown"}
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setBedMasterData((prev) => ({
                      ...prev,
                      selectedWard: isActiveWard ? null : resolvedWardForState(),
                      activeWardId: ward.id
                    }));
                  }}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-red-50 hover:bg-red-100 text-red-600 shadow-sm"
                  title="Ward actions"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">Room No:</label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={inputRoomNo}
                    onChange={(e) => {
                      const rawRoomNo = e.target.value;
                      setRoomAddErrors((prev) => {
                        const next = { ...prev };
                        delete next[ward.id];
                        return next;
                      });
                      setBedMasterData((prev) => ({ ...prev, selectedWard: resolvedWardForState(), activeWardId: ward.id }));
                      setNewRoomNameByWard((prev) => ({ ...prev, [ward.id]: `${prefix}${rawRoomNo}` }));
                    }}
                    placeholder="e.g. 101"
                    className={`w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none text-sm ${roomAddErrors[ward.id] ? "border-red-400 focus:ring-red-300" : "border-gray-300 focus:ring-[var(--accent-color)]"}`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddRoom(ward, department, wardAmenities);
                      }
                    }}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddRoom(ward, department, wardAmenities);
                    }}
                    disabled={!!addingRoomByWard[ward.id]}
                    className={`btn view-btn flex-shrink-0 text-sm ${addingRoomByWard[ward.id] ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    <Plus size={14} /> {addingRoomByWard[ward.id] ? "Adding..." : "Add Room"}
                  </button>
                </div>
                {roomAddErrors[ward.id] && <div className="mt-2 text-xs text-red-600">{roomAddErrors[ward.id]}</div>}
                <div className="mt-3">
                  <div className="text-sm font-semibold mb-2 text-gray-700 flex items-center gap-2">
                    <Settings size={14} /> Amenities
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {roomAmenities.length === 0 ? (
                      <div className="text-sm text-gray-500">No amenities available</div>
                    ) : (
                      roomAmenities.map((amenity) => {
                        const IconComponent = amenity.icon;
                        const isSelected = (wardAmenities || []).map(String).includes(String(amenity.id));
                        return (
                          <button
                            key={amenity.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setBedMasterData((prev) => {
                                const prevWardAmenities = prev.roomAmenitiesByWard?.[ward.id] || [];
                                const nextWardAmenities = prevWardAmenities.includes(amenity.id)
                                  ? prevWardAmenities.filter((id) => id !== amenity.id)
                                  : [...prevWardAmenities, amenity.id];
                                return {
                                  ...prev,
                                  selectedWard: resolvedWardForState(),
                                  activeWardId: ward.id,
                                  roomAmenitiesByWard: { ...(prev.roomAmenitiesByWard || {}), [ward.id]: nextWardAmenities },
                                };
                              });
                            }}
                            className={`flex items-center justify-center px-3 py-2 rounded-lg border transition-all duration-200 text-sm space-x-2 ${isSelected ? "border-[var(--accent-color)] bg-[var(--accent-color)] text-white shadow-sm" : "border-gray-200 bg-white hover:bg-gray-50 hover:border-[var(--accent-color)]"}`}
                          >
                            <IconComponent className={isSelected ? "text-white" : amenity.color} size={14} />
                            <span className="text-xs font-medium ml-1">{amenity.name}</span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <AnimatePresence>
                  {Array.isArray(bedMasterData.rooms) && bedMasterData.rooms.filter((r) => String(r.wardId) === String(ward.id)).map((room) => {
                    const isHighlighted = String(bedMasterData.selectedRoom?.id) === String(room.id);
                    const roomNumberOnly = String(room.name || "").split("-").pop().trim();
                    return (
                      <motion.div
                        key={room.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        whileHover={{ scale: 1.03, boxShadow: "0px 8px 20px rgba(0,0,0,0.08)" }}
                        className={`relative rounded-lg p-4 border border-gray-200 bg-white shadow-md ${isHighlighted ? "ring-2 ring-[var(--accent-color)]" : ""}`}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteRoom(room.id);
                          }}
                          className="absolute top-3 right-3 z-10 inline-flex items-center justify-center w-9 h-9 rounded-full bg-red-50 hover:bg-red-100 text-red-600 shadow-sm"
                        >
                          <Trash2 size={18} />
                        </button>
                        <div className="mb-3">
                          <div className="text-xs text-gray-500">Room No:</div>
                          <div className="font-semibold text-gray-800 text-lg">{roomNumberOnly}</div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(room.amenities) && room.amenities.map((amenityId) => {
                            const amenity = roomAmenities.find((a) => a.id === String(amenityId));
                            if (!amenity) return null;
                            const IconComponent = amenity.icon;
                            return (
                              <span
                                key={amenityId}
                                className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 shadow-sm"
                                title={amenity.name}
                              >
                                <IconComponent className={amenity.color} size={16} />
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

export default RoomAmenitiesStep;
