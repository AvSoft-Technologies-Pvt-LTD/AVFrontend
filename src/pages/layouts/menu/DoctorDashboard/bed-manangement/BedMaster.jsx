import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Building,
  Building2,
  Bed,
  DoorOpen as Door,
  Check,
  ArrowLeft,
  ArrowRight,
  Save,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import DepartmentStep from "./DepartmentStep";
import WardStep from "./WardStep";
import RoomAmenitiesStep from "./RoomAmenitiesStep";
import BedAmenitiesStep from "./BedAmenitiesStep";
import ReviewAndSaveStep from "./ReviewAndSaveStep";
import {
  createSpecializationWards,
  updateSpecializationWards,
  getWardById,
} from "../../../../../utils/CrudService";

const BedMaster = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const incomingEditData = location.state?.editData;
  const isEditMode = !!incomingEditData;

  const [roomAddErrors, setRoomAddErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const [loadingEdit, setLoadingEdit] = useState(false);

  const [bedMasterData, setBedMasterData] = useState({
    departments: [],
    wards: [],
    rooms: [],
    beds: [],
    roomAmenitiesByWard: {},
    bedAmenitiesByRoom: {},
    selectedDepartment: null,
    selectedWard: null,
    selectedRoom: null,
    selectedBed: null,
    activeDepartmentId: null,
    activeWardId: null,
    activeRoomId: null,
    wardTypes: [],
  });

  const [specDropdownOpen, setSpecDropdownOpen] = useState(false);
  const [bedCountByRoom, setBedCountByRoom] = useState({});
  const [newRoomNameByWard, setNewRoomNameByWard] = useState({});
  const [addingWard, setAddingWard] = useState({});
  const [editingNameById, setEditingNameById] = useState({});
  const [addingRoomByWard, setAddingRoomByWard] = useState({});

  const steps = [
    { id: 0, title: "Department Setup", icon: Building, color: "text-[var(--primary-color)]" },
    { id: 1, title: "Ward Creation", icon: Building2, color: "text-purple-600" },
    { id: 2, title: "Room & Amenities", icon: Door, color: "text-[var(--accent-color)]" },
    { id: 3, title: "Bed Configuration", icon: Bed, color: "text-orange-600" },
    { id: 4, title: "Review & Save", icon: Check, color: "text-gray-600" },
  ];

  const fallbackWardTypes = [
    { id: "general", name: "General Ward", description: "Multi-bed general patient care" },
    { id: "icu", name: "ICU", description: "Intensive Care Unit" },
    { id: "iccu", name: "ICCU", description: "Intensive Cardiac Care Unit" },
    { id: "maternity", name: "Maternity", description: "Maternity and childcare" },
    { id: "private", name: "Private Room", description: "Single private rooms" },
    { id: "emergency", name: "Emergency", description: "Emergency treatment area" },
  ];

  // ✅ FIXED: Preserve backend IDs during edit
  const mapServerPayloadToLocal = (server) => {
    const defaultRoomAmenities = ["1", "3"];
    const defaultBedAmenities = ["monitor", "sidetable"];

    const safeRooms = Array.isArray(server.rooms) ? server.rooms : [];

    // Collect nested beds from rooms
    const nestedBeds = safeRooms.flatMap((room) => {
      const rbeds = Array.isArray(room.beds) ? room.beds : [];
      return rbeds.map((b) => ({
        ...b,
        __roomIdFromRoom: room.roomId ?? room.id,
        __roomNumberFromRoom: room.roomNumber ?? room.number,
      }));
    });

    // Prefer top-level server.beds; else use nested room beds
    let rawBeds =
      Array.isArray(server.beds) && server.beds.length > 0
        ? server.beds
        : nestedBeds;

    // ✅ FIXED: Use backend IDs, not generated ones
    const roomsMapped = safeRooms.map((room) => ({
      id: room.id || room.roomId, // ✅ Preserve backend room ID
      name:
        room.name ||
        `${server.specializationName || server.department || "Dept"} - ${
          server.wardName || server.ward || "Ward"
        } - Room ${room.roomNumber || "1"}`,
      number: room.roomNumber || room.number || room.name || "1",
      wardId: null, // set below
      amenities:
        Array.isArray(room.amenities) && room.amenities.length > 0
          ? room.amenities
          : room.roomAmenities || defaultRoomAmenities,
      capacity: room.capacity || room.bedCount || null,
    }));

    // ✅ FIXED: Use backend ward ID
    const wardId = server?.wardId || server?.id; // ✅ Preserve backend ward ID
    const departmentId = server?.specializationId;
    const roomsWithWard = roomsMapped.map((r) => ({ ...r, wardId }));

    // If still no beds, synthesize from each room's capacity/bedCount
    if (!Array.isArray(rawBeds) || rawBeds.length === 0) {
      rawBeds = roomsWithWard.flatMap((r) => {
        const count = Number(r.capacity ?? 0);
        if (!count || Number.isNaN(count) || count <= 0) return [];
        return Array.from({ length: count }).map((_, i) => ({
          bedId: `bed-${r.id}-${i + 1}`,
          bedNumber: String(i + 1),
          name: `Bed ${i + 1}`,
          bedStatusId: 1,
          __roomIdFromRoom: r.id,
          __roomNumberFromRoom: r.number,
          bedAmenities: r.amenities ?? defaultBedAmenities,
        }));
      });
    }

    // ✅ FIXED: Preserve backend bed IDs and bedStatusId
    const bedsMapped = (rawBeds || []).map((bed) => {
      const matchedRoom =
        roomsWithWard.find((r) => String(r.id) === String(bed.roomId)) ||
        roomsWithWard.find((r) => String(r.number) === String(bed.roomNumber)) ||
        roomsWithWard.find((r) => String(r.number) === String(bed.roomId)) ||
        roomsWithWard.find((r) => String(r.id) === String(bed.__roomIdFromRoom)) ||
        roomsWithWard.find((r) => String(r.number) === String(bed.__roomNumberFromRoom));

      const normalizedRoomId = matchedRoom?.id ?? roomsWithWard[0]?.id;

      return {
        id: bed.id || bed.bedId, // ✅ Preserve backend bed ID
        name: bed.name || `Bed ${bed.bedNumber || "1"}`,
        number: bed.bedNumber || bed.number || bed.name || "1",
        roomId: normalizedRoomId,
        bedStatusId: Number(bed.bedStatusId) || 1, // ✅ Store numeric bedStatusId
        status: bed.status || (Number(bed.bedStatusId) === 2 ? "occupied" : "available"),
        wardId,
        amenities:
          Array.isArray(bed.amenities) && bed.amenities.length > 0
            ? bed.amenities
            : bed.bedAmenities || defaultBedAmenities,
      };
    });

    const department = {
      id: departmentId,
      name: server.specializationName || server.department || "Unknown Department",
      locked: true,
    };

    // ✅ FIXED: Preserve backend ward ID and wardTypeId
    const ward = {
      id: wardId, // ✅ Use backend ward ID
      name: server.wardName || server.ward || "Ward 1",
      type: (server.wardTypeId || server.type || "").toString().toLowerCase() || "general",
      departmentId: department.id,
      wardTypeId: server.wardTypeId || 0, // ✅ Preserve wardTypeId
    };

    // Aggregate amenities
    const roomAmenitiesByWard = {};
    roomsWithWard.forEach((r) => {
      roomAmenitiesByWard[ward.id] = [
        ...(roomAmenitiesByWard[ward.id] || []),
        ...(Array.isArray(r.amenities) ? r.amenities : []),
      ];
    });
    Object.keys(roomAmenitiesByWard).forEach((k) => {
      roomAmenitiesByWard[k] = Array.from(new Set(roomAmenitiesByWard[k]));
    });

    const bedAmenitiesByRoom = {};
    bedsMapped.forEach((b) => {
      bedAmenitiesByRoom[b.roomId] = [
        ...(bedAmenitiesByRoom[b.roomId] || []),
        ...(Array.isArray(b.amenities) ? b.amenities : []),
      ];
    });
    Object.keys(bedAmenitiesByRoom).forEach((k) => {
      bedAmenitiesByRoom[k] = Array.from(new Set(bedAmenitiesByRoom[k]));
    });

    console.log("Mapped rooms:", roomsWithWard.length, "Mapped beds:", bedsMapped.length);

    return {
      departments: [department],
      wards: [ward],
      rooms: roomsWithWard,
      beds: bedsMapped,
      selectedDepartment: department,
      selectedWard: ward,
      selectedRoom: roomsWithWard[0] || null,
      activeDepartmentId: department.id,
      activeWardId: ward.id,
      activeRoomId: roomsWithWard[0]?.id || null,
      roomAmenitiesByWard,
      bedAmenitiesByRoom,
    };
  };

  // If editData is present but partial, fetch full ward payload; then map to local
  useEffect(() => {
    if (!incomingEditData) return;
    let mounted = true;
    const ensureFullPayloadThenMap = async () => {
      try {
        setLoadingEdit(true);

        if (
          incomingEditData?.specializationName ||
          incomingEditData?.wardName ||
          Array.isArray(incomingEditData?.rooms) ||
          Array.isArray(incomingEditData?.beds)
        ) {
          const mapped = mapServerPayloadToLocal(incomingEditData);
          if (!mounted) return;
          setBedMasterData((prev) => ({ ...prev, ...mapped }));
          return;
        }

        const candidateId = incomingEditData?.id ?? incomingEditData?.wardId ?? null;
        if (!candidateId) {
          toast.error("Invalid edit data - missing ward id");
          return;
        }
        if (typeof candidateId !== "number" && (typeof candidateId === "string" && !/^\d+$/.test(candidateId))) {
          toast.error("Invalid ward ID. Only numeric IDs are supported.");
          return;
        }

        const numericId = Number(candidateId);
        if (isNaN(numericId)) {
          toast.error("Invalid ward ID. Must be a number.");
          return;
        }

        toast.info("Fetching ward details for edit...");
        const res = await getWardById(numericId);
        const serverPayload = res?.data;
        if (!serverPayload) {
          toast.error("Ward not found");
          return;
        }
        if (!serverPayload.specializationId) {
          toast.error("Specialization ID is missing in the ward data.");
          return;
        }

        const mapped = mapServerPayloadToLocal(serverPayload);
        if (!mounted) return;
        setBedMasterData((prev) => ({ ...prev, ...mapped }));
      } catch (err) {
        console.error("Failed to load ward for edit:", err);
        toast.error("Failed to load ward details for editing.");
      } finally {
        if (mounted) setLoadingEdit(false);
      }
    };
    ensureFullPayloadThenMap();
    return () => {
      mounted = false;
    };
  }, [incomingEditData]);

  const canGoNext = () => {
    switch (currentStep) {
      case 0: return (bedMasterData.departments || []).length > 0;
      case 1: return (bedMasterData.wards || []).length > 0;
      case 2: return Array.isArray(bedMasterData.rooms) && bedMasterData.rooms.length > 0;
      case 3: return Array.isArray(bedMasterData.beds) && bedMasterData.beds.length > 0;
      default: return true;
    }
  };

  const handleNext = () => {
    if (canGoNext()) setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    else toast.warning("Please complete the current step before proceeding.");
  };
  const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  // Department functions
  const addDepartment = (specializationData) => {
    if (!specializationData) return;
    const departmentName =
      specializationData.name || specializationData.specializationName || specializationData.description || "Unnamed";
    const existingDept = (bedMasterData.departments || []).find((d) => d.name === departmentName);
    if (existingDept) {
      toast.warning("Department already exists");
      return;
    }
    const newDept = {
      id: `dept-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: departmentName,
      specializationId: specializationData.id || specializationData.specializationId || null,
      createdAt: new Date().toISOString(),
    };
    setBedMasterData((prev) => ({ ...prev, departments: [...(prev.departments || []), newDept] }));
    toast.success("Department added successfully");
  };

  const deleteDepartment = (id) => {
    setBedMasterData((prev) => {
      const nextDepartments = (prev.departments || []).filter((d) => d.id !== id);
      const nextWards = (prev.wards || []).filter((w) => w.departmentId !== id);
      const nextRooms = (prev.rooms || []).filter((r) => nextWards.some((w) => w.id === r.wardId));
      const nextBeds = (prev.beds || []).filter((b) => nextRooms.some((r) => r.id === b.roomId));
      return {
        ...prev,
        departments: nextDepartments,
        wards: nextWards,
        rooms: nextRooms,
        beds: nextBeds,
        selectedDepartment: prev.selectedDepartment?.id === id ? null : prev.selectedDepartment,
        selectedWard: nextWards.find((w) => w.id === prev.selectedWard?.id) || null,
        selectedRoom: nextRooms.find((r) => r.id === prev.selectedRoom?.id) || null,
      };
    });
    toast.success("Department deleted successfully");
  };

  // Ward functions
  const addWard = async (wardTypeId, departmentId) => {
    try {
      setAddingWard((prev) => ({ ...(prev || {}), [`${departmentId}_${wardTypeId}`]: true }));
      const wardTypes = bedMasterData.wardTypes || fallbackWardTypes;
      const wardCount = (bedMasterData.wards || []).filter(
        (w) => String(w.departmentId) === String(departmentId) && String(w.type) === String(wardTypeId)
      ).length;
      const wardType = wardTypes.find((t) => String(t.id) === String(wardTypeId)) || { name: "Ward", typeName: "Ward" };
      const defaultName = `${wardType.typeName || wardType.name || "Ward"} ${wardCount + 1}`;
      const newWard = {
        id: `ward-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: defaultName,
        wardName: defaultName,
        type: wardTypeId,
        typeId: wardTypeId,
        wardTypeId: wardTypeId,
        typeName: wardType.typeName || wardType.name || null,
        departmentId,
        specializationId: departmentId,
      };
      setBedMasterData((prev) => ({
        ...prev,
        wards: [...(prev.wards || []), newWard],
        activeDepartmentId: departmentId,
        selectedWard: newWard,
      }));
      toast.success("Ward added successfully");
      return newWard;
    } catch (err) {
      console.error("Failed to add ward", err);
      toast.error("Failed to add ward");
      return null;
    } finally {
      setAddingWard((prev) => {
        const next = { ...(prev || {}) };
        delete next[`${departmentId}_${wardTypeId}`];
        return next;
      });
    }
  };

  const deleteWard = async (wardId) => {
    try {
      setBedMasterData((prev) => {
        const newWards = (prev.wards || []).filter((w) => String(w.id) !== String(wardId));
        const newRooms = (prev.rooms || []).filter((r) => String(r.wardId) !== String(wardId));
        const newBeds = (prev.beds || []).filter((b) => newRooms.some((r) => String(r.id) === String(b.roomId)));
        const roomAmenitiesByWard = { ...(prev.roomAmenitiesByWard || {}) };
        delete roomAmenitiesByWard[wardId];
        return {
          ...prev,
          wards: newWards,
          rooms: newRooms,
          beds: newBeds,
          roomAmenitiesByWard,
          selectedWard: prev.selectedWard?.id === wardId ? null : prev.selectedWard,
          selectedRoom: newRooms.find((r) => r.id === prev.selectedRoom?.id) || null,
        };
      });
      toast.success("Ward deleted successfully");
    } catch (err) {
      console.error("deleteWard error:", err);
    }
  };

  // Room functions
  const addRoom = async (roomName, roomNumber, wardId, wardAmenities) => {
    try {
      setBedMasterData((prev) => ({ ...prev, activeWardId: wardId }));
      const newRoom = {
        id: `room-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: roomName,
        number: roomNumber || "",
        roomNumber: roomNumber || "",
        wardId,
        amenities: Array.isArray(wardAmenities) ? [...wardAmenities] : [],
        amenityIds: Array.isArray(wardAmenities) ? wardAmenities.map((a) => parseInt(a) || a) : [],
      };
      setBedMasterData((prev) => {
        const updatedRoomAmenitiesByWard = { ...(prev.roomAmenitiesByWard || {}) };
        updatedRoomAmenitiesByWard[wardId] = Array.from(
          new Set([...(updatedRoomAmenitiesByWard[wardId] || []), ...(wardAmenities || [])])
        );
        return {
          ...prev,
          rooms: [...(prev.rooms || []), newRoom],
          activeWardId: null,
          selectedRoom: newRoom,
          roomAmenitiesByWard: updatedRoomAmenitiesByWard,
        };
      });
      toast.success("Room added successfully");
      return newRoom;
    } catch (err) {
      console.error("addRoom error:", err);
      setBedMasterData((prev) => ({ ...prev, activeWardId: null }));
      throw err;
    }
  };

  const deleteRoom = async (roomId) => {
    try {
      setBedMasterData((prev) => {
        const newRooms = (prev.rooms || []).filter((r) => String(r.id) !== String(roomId));
        const selectedRoom = prev.selectedRoom?.id === roomId ? null : prev.selectedRoom;
        const newBeds = (prev.beds || []).filter((b) => String(b.roomId) !== String(roomId));
        const newBedAmenitiesByRoom = { ...(prev.bedAmenitiesByRoom || {}) };
        delete newBedAmenitiesByRoom[roomId];
        return { ...prev, rooms: newRooms, beds: newBeds, selectedRoom, bedAmenitiesByRoom: newBedAmenitiesByRoom };
      });
      toast.success("Room deleted successfully");
    } catch (err) {
      console.error("deleteRoom error:", err);
    }
  };

  const handleAddRoom = async (ward, department, wardAmenities) => {
    const wardId = ward?.id;
    const key = String(wardId);
    if (addingRoomByWard[key]) return;
    setAddingRoomByWard((p) => ({ ...(p || {}), [key]: true }));
    try {
      const prefix = `${department?.name || "Dept"} - ${ward.name} - `;
      const nameToSend = (newRoomNameByWard?.[wardId] || prefix).trim();
      if (!nameToSend) {
        toast.warning("Room name required");
        return;
      }
      const numMatch = nameToSend.match(/(\d+(?:-\d+)*)$/);
      const roomNumber = numMatch ? numMatch[1] : "";
      await addRoom(nameToSend, roomNumber, wardId, wardAmenities);
      setNewRoomNameByWard((prev) => {
        const next = { ...(prev || {}) };
        delete next[wardId];
        return next;
      });
      setBedMasterData((prev) => ({ ...prev, selectedWard: ward, activeWardId: wardId }));
    } catch (err) {
      console.error("addRoom failed", err);
    } finally {
      setAddingRoomByWard((p) => {
        const next = { ...(p || {}) };
        delete next[key];
        return next;
      });
    }
  };

  // Bed functions
  const addBed = async (roomId, count = 1) => {
    try {
      const room = (bedMasterData.rooms || []).find((r) => String(r.id) === String(roomId));
      if (!room) {
        console.error("Room not found for roomId:", roomId);
        return;
      }
      const existingCount = (bedMasterData.beds || []).filter((b) => String(b.roomId) === String(roomId)).length;
      const newBeds = Array.from({ length: count }).map((_, idx) => ({
        id: `bed-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 7)}`,
        name: `Bed ${existingCount + idx + 1}`,
        number: `${roomId}-${existingCount + idx + 1}`,
        bedNumber: `${existingCount + idx + 1}`,
        roomId,
        bedStatusId: 1, // ✅ Default to Available
        status: "available",
        amenities: Array.isArray(room?.amenities) ? [...room.amenities] : [],
        amenityIds: Array.isArray(room?.amenities) ? room.amenities.map((a) => parseInt(a) || a) : [],
      }));
      setBedMasterData((prev) => ({
        ...prev,
        beds: [...(prev.beds || []), ...newBeds],
        activeRoomId: null,
        selectedBed: newBeds[0] || prev.selectedBed,
      }));
      toast.success(`${count} bed(s) added successfully`);
    } catch (err) {
      console.error("addBed error:", err);
      setBedMasterData((prev) => ({ ...prev, activeRoomId: null }));
    }
  };

  const deleteBed = async (bedId) => {
    try {
      setBedMasterData((prev) => {
        const newBeds = (prev.beds || []).filter((b) => String(b.id) !== String(bedId));
        const selectedBed = prev.selectedBed?.id === bedId ? null : prev.selectedBed;
        return { ...prev, beds: newBeds, selectedBed };
      });
      toast.success("Bed deleted successfully");
    } catch (err) {
      console.error("deleteBed error:", err);
    }
  };

  // ✅ FIXED: Build correct PUT payload grouped by ward with proper IDs
  const handleSave = async () => {
    try {
      if (isEditMode && bedMasterData.wards.length > 0) {
        // ✅ Edit Mode - Build proper PUT payload with ward ID
        const ward = bedMasterData.wards[0];
        const wardId = ward.id; // ✅ Use existing ward ID
        const specializationId = ward.departmentId || ward.specializationId;

        const wardRooms = (bedMasterData.rooms || []).filter((r) => String(r.wardId) === String(wardId));
        
        const roomsPayload = wardRooms.map((room) => {
          const roomBeds = (bedMasterData.beds || []).filter((b) => String(b.roomId) === String(room.id));
          
          const bedsPayload = roomBeds.map((bed) => ({
            id: bed.id, // ✅ Preserve bed ID
            bedNumber: bed.bedNumber || bed.number || bed.name,
            bedStatusId: bed.bedStatusId || 1, // ✅ Send bedStatusId
            amenityIds: Array.isArray(bed.amenityIds)
              ? bed.amenityIds.map((a) => parseInt(a) || 0).filter((a) => a > 0)
              : Array.isArray(bed.amenities)
              ? bed.amenities.map((a) => parseInt(a) || 0).filter((a) => a > 0)
              : [],
          }));

          return {
            id: room.id, // ✅ Preserve room ID
            roomNumber: room.roomNumber || room.number || room.name,
            amenityIds: Array.isArray(room.amenityIds)
              ? room.amenityIds.map((a) => parseInt(a) || 0).filter((a) => a > 0)
              : Array.isArray(room.amenities)
              ? room.amenities.map((a) => parseInt(a) || 0).filter((a) => a > 0)
              : [],
            bedAmenityIds: Array.isArray(bedMasterData.bedAmenitiesByRoom?.[room.id])
              ? bedMasterData.bedAmenitiesByRoom[room.id].map((a) => parseInt(a) || 0).filter((a) => a > 0)
              : [],
            beds: bedsPayload,
          };
        });

        const payload = [
          {
            id: wardId, // ✅ Include ward ID for update
            wardName: ward.wardName || ward.name,
            wardTypeId: parseInt(ward.wardTypeId || ward.typeId || ward.type) || 0,
            rooms: roomsPayload,
          }
        ];

        console.log("PUT Payload:", JSON.stringify(payload, null, 2));
        await updateSpecializationWards(specializationId, payload);
        toast.success("Ward updated successfully!");
      } else {
        // Create Mode
        const specializationPayloads = (bedMasterData.departments || []).map((department) => {
          const departmentWards = (bedMasterData.wards || []).filter(
            (w) => String(w.departmentId) === String(department.id)
          );
          const wardsPayload = departmentWards.map((ward) => {
            const wardRooms = (bedMasterData.rooms || []).filter((r) => String(r.wardId) === String(ward.id));
            const roomsPayload = wardRooms.map((room) => {
              const roomBeds = (bedMasterData.beds || []).filter((b) => String(b.roomId) === String(room.id));
              const bedsPayload = roomBeds.map((bed) => ({
                bedId: bed.id,
                bedNumber: bed.bedNumber || bed.number || bed.name,
                bedStatusId: bed.bedStatusId || 1,
                amenityIds: Array.isArray(bed.amenityIds)
                  ? bed.amenityIds.map((a) => parseInt(a) || 0).filter((a) => a > 0)
                  : Array.isArray(bed.amenities)
                  ? bed.amenities.map((a) => parseInt(a) || 0).filter((a) => a > 0)
                  : [],
              }));
              return {
                roomId: room.id,
                roomNumber: room.roomNumber || room.number || room.name,
                amenityIds: Array.isArray(room.amenityIds)
                  ? room.amenityIds.map((a) => parseInt(a) || 0).filter((a) => a > 0)
                  : Array.isArray(room.amenities)
                  ? room.amenities.map((a) => parseInt(a) || 0).filter((a) => a > 0)
                  : [],
                bedAmenityIds: Array.isArray(bedMasterData.bedAmenitiesByRoom?.[room.id])
                  ? bedMasterData.bedAmenitiesByRoom[room.id].map((a) => parseInt(a) || 0).filter((a) => a > 0)
                  : [],
                beds: bedsPayload,
              };
            });
            return {
              wardName: ward.wardName || ward.name,
              wardTypeId: parseInt(ward.wardTypeId || ward.typeId || ward.type) || 0,
              rooms: roomsPayload,
            };
          });
          return {
            specializationId:
              parseInt(department.specializationId || department.id || department.specialization?.id) || null,
            wards: wardsPayload,
          };
        });

        if (!specializationPayloads.length) {
          toast.warning("Nothing to save. Add departments/wards/rooms/beds first.");
          return;
        }

        for (const payload of specializationPayloads) {
          await createSpecializationWards(payload);
        }
        toast.success("Bed management configuration saved successfully!");
      }

      navigate("/doctordashboard/bedroommanagement");
    } catch (error) {
      console.error("Error saving to backend:", error);
      toast.error("Failed to save configuration. Please try again.");
    }
  };

  const renderStepIndicator = () => (
    <div className="max-w-7xl mx-auto mb-6 sm:mb-8 px-2 sm:px-4 w-full">
      <div className="flex items-center justify-center w-full overflow-hidden">
        <div className="flex items-center justify-center w-full space-x-1 sm:space-x-2 md:space-x-4">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const IconComponent = step.icon;
            return (
              <React.Fragment key={step.id}>
                <motion.div
                  className="flex flex-col items-center min-w-[60px] sm:min-w-[80px] md:min-w-[100px]"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div
                    className={`relative w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                      isCompleted
                        ? "bg-[var(--primary-color)] text-white border-[var(--primary-color)] shadow-lg"
                        : isCurrent
                        ? "bg-[var(--accent-color)] text-white border-[var(--accent-color)] shadow-xl transform scale-110"
                        : "bg-white text-gray-400 border-gray-300"
                    }`}
                  >
                    <IconComponent size={14} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />
                  </div>
                  <div
                    className={`mt-1 text-center transition-all duration-300 text-[10px] sm:text-xs md:text-sm ${
                      isCurrent ? "text-[var(--primary-color)] font-semibold" : "text-gray-500"
                    }`}
                  >
                    {step.title}
                  </div>
                </motion.div>
                {index < steps.length - 1 && (
                  <div
                    className={`hidden sm:flex flex-1 h-0.5 mx-1 sm:mx-2 md:mx-4 transition-all duration-300 ${
                      isCompleted ? "bg-[var(--primary-color)]" : "bg-gray-300"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    if (loadingEdit) {
      return <div className="p-6 text-center text-sm text-gray-600">Loading ward for edit...</div>;
    }
    switch (currentStep) {
      case 0:
        return (
          <DepartmentStep
            bedMasterData={bedMasterData}
            setBedMasterData={setBedMasterData}
            isEditMode={isEditMode}
            editingNameById={editingNameById}
            setEditingNameById={setEditingNameById}
            addDepartment={addDepartment}
            deleteDepartment={deleteDepartment}
          />
        );
      case 1:
        return (
          <WardStep
            bedMasterData={bedMasterData}
            setBedMasterData={setBedMasterData}
            addingWard={addingWard}
            setAddingWard={setAddingWard}
            editingNameById={editingNameById}
            setEditingNameById={setEditingNameById}
            addWard={addWard}
            deleteWard={deleteWard}
          />
        );
      case 2:
        return (
          <RoomAmenitiesStep
            bedMasterData={bedMasterData}
            setBedMasterData={setBedMasterData}
            roomAddErrors={roomAddErrors}
            setRoomAddErrors={setRoomAddErrors}
            newRoomNameByWard={newRoomNameByWard}
            setNewRoomNameByWard={setNewRoomNameByWard}
            addingRoomByWard={addingRoomByWard}
            setAddingRoomByWard={setAddingRoomByWard}
            handleAddRoom={handleAddRoom}
            deleteRoom={deleteRoom}
          />
        );
      case 3:
        return (
          <BedAmenitiesStep
            bedMasterData={bedMasterData}
            setBedMasterData={setBedMasterData}
            bedCountByRoom={bedCountByRoom}
            setBedCountByRoom={setBedCountByRoom}
            addBed={addBed}
            deleteBed={deleteBed}
          />
        );
      case 4:
        return <ReviewAndSaveStep bedMasterData={bedMasterData} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="pb-20 p-2 sm:p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4 sm:mb-6 md:mb-8">
            <motion.div className="mb-3 sm:mb-4 md:mb-6" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-2 mb-2 sm:mb-3 md:mb-4">
                <button
                  onClick={() => navigate("/doctordashboard/bedroommanagement")}
                  className="flex items-center text-xs sm:text-sm text-[var(--primary-color)] hover:underline"
                >
                  ← Back to List
                </button>
              </div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                {incomingEditData ? "Edit" : "Create"} Bed Management Master
              </h1>
            </motion.div>
            {renderStepIndicator()}
          </div>
          <div className="max-w-7xl mx-auto">
            <div className="p-2 sm:p-4 md:p-6 lg:p-8">{renderStepContent()}</div>
          </div>
        </div>
      </div>
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="w-full sm:w-auto flex justify-start">
              <button
                onClick={handleBack}
                disabled={currentStep === 0}
                className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentStep === 0
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 hover:text-gray-900 hover:shadow-sm"
                }`}
              >
                <ArrowLeft size={16} />
                <span className="hidden sm:inline">Back</span>
              </button>
            </div>
            <div className="w-full sm:w-auto flex justify-end">
              {currentStep < steps.length - 1 ? (
                <button
                  onClick={handleNext}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    canGoNext()
                      ? "bg-[var(--accent-color)] hover:bg-opacity-90 text-white shadow-md hover:shadow-lg"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                  disabled={!canGoNext()}
                >
                  <span className="hidden sm:inline">Next</span>
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-3 bg-[var(--accent-color)] hover:bg-opacity-90 text-white rounded-lg transition-all duration-200 font-medium shadow-lg text-sm"
                >
                  <Save size={16} />
                  <span>{incomingEditData ? "Update" : "Save"} & Finish</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BedMaster;