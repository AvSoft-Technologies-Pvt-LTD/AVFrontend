import React from "react";
import {
  Bed,
  ChevronLeft,
  ChevronRight,
  User,
  CheckCircle,
  Wrench,
} from "lucide-react";
import { getSpecializationsWardsSummaryForIpdAdmission } from "../../../../../utils/CrudService";

// Map backend bedStatusId -> UI status
const STATUS_MAP = {
  1: "available",
  2: "occupied",
  3: "maintenance",
  4: "blocked",
};

const IPDBed = ({
  selectedWard,       // expects { type: wardName, department: specializationName, ... }
  selectedRoom,       // roomNumber (string/number)
  selectedBed,        // current selected bedNumber (string/number)
  onSelectBed,        // (bedNumber) => void
  ipdPatients = [],   // admitted patients list
  bedScrollIndex = 0,
  onScrollBeds,       // ("left" | "right") => void
}) => {
  const [loading, setLoading] = React.useState(false);
  const [roomBeds, setRoomBeds] = React.useState([]);
  const [wardHeader, setWardHeader] = React.useState({ wardName: "", specializationName: "" });

  // fetch beds for the selected ward + room from API
  React.useEffect(() => {
    let alive = true;
    const fetchBeds = async () => {
      if (!selectedWard || !selectedRoom) return;
      setLoading(true);
      try {
        const res = await getSpecializationsWardsSummaryForIpdAdmission();
        const data = Array.isArray(res?.data) ? res.data : [];

        // Find the ward by name & specialization
        const ward = data.find(
          (w) =>
            (w.wardName || "").toString() === (selectedWard.type || "").toString() &&
            (w.specializationName || "").toString() === (selectedWard.department || "").toString()
        );

        const roomObj = ward?.rooms?.find(
          (r) => (r.roomNumber || "").toString() === (selectedRoom || "").toString()
        );

        if (alive) {
          setWardHeader({
            wardName: ward?.wardName || selectedWard.type || "",
            specializationName: ward?.specializationName || selectedWard.department || "",
          });
          setRoomBeds(roomObj?.beds || []);
        }
      } catch (e) {
        if (alive) {
          setRoomBeds([]);
        }
        console.error("[IPDBed] fetch error:", e);
      } finally {
        if (alive) setLoading(false);
      }
    };
    fetchBeds();
    return () => {
      alive = false;
    };
  }, [selectedWard, selectedRoom]);

  // Build admitted ward keys for quick lookup
  const occupiedWardKeys = React.useMemo(() => {
    const set = new Set();
    (ipdPatients || [])
      .filter((p) => (p.status || "").toLowerCase() === "admitted")
      .forEach((p) => {
        if (p.ward) set.add(p.ward.toString());
      });
    return set;
  }, [ipdPatients]);

  // Try to split a combined ward name like "ICU 1" -> {base:"ICU", num:"1"}
  const splitWardTypeAndNumber = React.useMemo(() => {
    const raw = (selectedWard?.type || "").toString();
    const m = raw.match(/^(.+?)\s+(\d+)\s*$/);
    return {
      baseType: m ? m[1] : selectedWard?.type || "",
      wardNumber: m ? m[2] : (selectedWard?.number ?? selectedWard?.wardNumber ?? ""),
    };
  }, [selectedWard]);

  const makeWardKeyCandidates = (bedNumber) => {
    const roomPart = selectedRoom?.toString() ?? "";
    const bedPart = bedNumber?.toString() ?? "";
    const baseType = splitWardTypeAndNumber.baseType?.toString() ?? "";
    const wardNum = splitWardTypeAndNumber.wardNumber?.toString() ?? "";

    // Preferred: wardType-wardNumber-room-bed (what your save code uses)
    const k1 = `${baseType}-${wardNum}-${roomPart}-${bedPart}`;

    // Fallbacks for legacy/edge data
    const k2 = `${selectedWard?.type}-${selectedWard?.number ?? ""}-${roomPart}-${bedPart}`;
    const k3 = `${selectedWard?.type}-${roomPart}-${bedPart}`; // if ward number wasn’t stored

    return [k1, k2, k3].filter(Boolean);
  };

  const isBedOccupied = (bedNumber) => {
    const candidates = makeWardKeyCandidates(bedNumber);
    return candidates.some((k) => occupiedWardKeys.has(k));
  };

  const getBedStatus = (bed) => {
    const apiStatus = STATUS_MAP[bed?.bedStatusId] || "available";
    if (apiStatus === "maintenance" || apiStatus === "blocked") return "maintenance";
    if (isBedOccupied(bed?.bedNumber)) return "occupied";
    if (apiStatus === "occupied") return "occupied";
    return "available";
  };

  const getBedColors = (status, isSelected) => {
    if (isSelected)
      return "border-green-500 bg-green-50 text-green-700 shadow-lg shadow-green-200";
    if (status === "occupied")
      return "border-gray-400 bg-gray-100 text-gray-600";
    if (status === "maintenance")
      return "border-gray-400 bg-gray-100 text-gray-500";
    return "border-[var(--primary-color,#0E1630)] bg-white text-[var(--primary-color,#0E1630)] hover:border-[var(--primary-color,#0E1630)] hover:shadow-lg hover:shadow-blue-200";
  };

  const getBedIconClass = (status, isSelected) => {
    if (isSelected) return "text-green-500";
    if (status === "occupied") return "text-gray-500";
    if (status === "maintenance") return "text-gray-400";
    return "text-[var(--primary-color,#0E1630)]";
  };

  // Pagination (responsive)
  const bedsPerPage =
    typeof window !== "undefined"
      ? window.innerWidth < 640
        ? 4
        : window.innerWidth < 768
        ? 6
        : 12
      : 12;

  const visibleBeds = roomBeds.slice(bedScrollIndex, bedScrollIndex + bedsPerPage);

  if (!selectedWard || !selectedRoom) return null;

  return (
    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
      <h4 className="font-semibold mb-3 sm:mb-4 text-base sm:text-lg">
        Select Bed in {wardHeader.wardName} — Room {selectedRoom}
      </h4>

      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>Department:</strong> {wardHeader.specializationName}
        </p>
        <p className="text-sm text-blue-800">
          <strong>Room Beds:</strong> {loading ? "…" : roomBeds.length}
        </p>
      </div>

      <div className="flex items-center gap-2 mb-4">
        {bedScrollIndex > 0 && (
          <button
            onClick={() => onScrollBeds?.("left")}
            className="p-1.5 sm:p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition-all duration-200 shadow-md flex-shrink-0"
          >
            <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
          </button>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1.5 sm:gap-2 flex-1">
          {loading ? (
            <div className="col-span-full text-center text-sm text-gray-600">Loading beds…</div>
          ) : visibleBeds.length === 0 ? (
            <div className="col-span-full text-center text-sm text-gray-600">No beds found for this room.</div>
          ) : (
            visibleBeds.map((bed) => {
              const status = getBedStatus(bed);
              const isSelected = selectedBed?.toString() === bed.bedNumber?.toString();
              const isDisabled = status === "occupied" || status === "maintenance";

              return (
                <div
                  key={bed.bedId}
                  onClick={() => !isDisabled && onSelectBed?.(bed.bedNumber)}
                  className={`relative p-1.5 sm:p-2 rounded-lg border-2 transition-all duration-300 ${
                    getBedColors(status, isSelected)
                  } ${isDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                >
                  <div className="flex flex-col items-center space-y-0.5 sm:space-y-1">
                    <div className={getBedIconClass(status, isSelected)}>
                      {status === "maintenance" ? (
                        <Wrench className="w-3 h-3 sm:w-4 sm:h-4" />
                      ) : status === "occupied" ? (
                        <User className="w-3 h-3 sm:w-4 sm:h-4" />
                      ) : isSelected ? (
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                      ) : (
                        <Bed className="w-3 h-3 sm:w-4 sm:h-4" />
                      )}
                    </div>

                    <div className="text-center">
                      <div className="font-bold text-xs">Bed {bed.bedNumber}</div>
                      <div className="text-[8px] sm:text-[10px] opacity-75 capitalize">
                        {status === "maintenance"
                          ? "Maintenance"
                          : status === "occupied"
                          ? "Occupied"
                          : "Available"}
                      </div>
                    </div>

                    {/* Amenities: API gives numeric IDs. Render a hint if present. */}
                    {(Array.isArray(bed.amenities) && bed.amenities.length > 0) ? (
                      <div className="text-[8px] sm:text-[10px] opacity-60 hidden sm:block">
                        {bed.amenities.length} amenity{bed.amenities.length > 1 ? "ies" : "y"}
                      </div>
                    ) : (
                      <div className="text-[8px] sm:text-[10px] opacity-60 hidden sm:block">
                        Basic Room
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {bedScrollIndex + bedsPerPage < roomBeds.length && (
          <button
            onClick={() => onScrollBeds?.("right")}
            className="p-1.5 sm:p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition-all duration-200 shadow-md flex-shrink-0"
          >
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
          </button>
        )}
      </div>
    </div>
  );
};

export default IPDBed;
