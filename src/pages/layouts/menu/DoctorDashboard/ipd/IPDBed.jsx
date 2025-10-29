import React from "react";
import {
  Bed,
  ChevronLeft,
  ChevronRight,
  User,
  CheckCircle,
  Wrench,
  Snowflake,
  Monitor,
  ShowerHead,
  Wind,
  Phone,
  Settings,
  Circle,
  Activity,
  Eye,
  Wifi,
  Thermometer,
} from "lucide-react";

const FACILITY_ICONS = {
  AC: Snowflake,
  TV: Monitor,
  Bathroom: ShowerHead,
  Oxygen: Wind,
  Monitor: Monitor,
  "Call Button": Phone,
  Phone: Phone,
  "Adjustable Bed": Settings,
  "Bedside Table": Circle,
  "Oxygen Pipeline": Activity,
  "Adjustable Lighting": Eye,
  WiFi: Wifi,
  Heating: Thermometer,
};

const IPDBed = ({
  selectedWard,
  selectedRoom,
  bedFacilities,
  selectedBed,
  onSelectBed,
  ipdPatients,
  bedScrollIndex,
  onScrollBeds,
}) => {
  if (!selectedWard || !selectedRoom) return null;

  // Find the selected room object from the ward's rooms array
  const selectedRoomObj = selectedWard.rooms.find(
    (room) => room.roomNumber === selectedRoom.toString()
  );

  // Use the actual beds from the selected room
  const roomBeds = selectedRoomObj?.beds || [];

  // Paginate the beds
  const bedsPerPage = window.innerWidth < 640 ? 4 : window.innerWidth < 768 ? 6 : 12;
  const visibleBeds = roomBeds.slice(bedScrollIndex, bedScrollIndex + bedsPerPage);

  const isBedOccupied = (bedNumber) => {
    const wardFormat = `${selectedWard.type}-${selectedWard.number}-${bedNumber}`;
    return ipdPatients.some(
      (patient) => patient.status === "Admitted" && patient.ward === wardFormat
    );
  };

  const getBedStatus = (bed) => {
    const isUnderMaintenance = Math.random() < 0.05;
    if (isUnderMaintenance) return "maintenance";
    if (isBedOccupied(bed.bedNumber)) return "occupied";
    return "available";
  };

  const getBedColors = (bed) => {
    const status = getBedStatus(bed);
    const isSelected = selectedBed === bed.bedNumber;
    if (isSelected)
      return "border-green-500 bg-green-50 text-green-700 shadow-lg shadow-green-200";
    if (status === "occupied")
      return "border-gray-400 bg-gray-100 text-gray-600";
    if (status === "maintenance")
      return "border-gray-400 bg-gray-100 text-gray-500";
    return "border-[var(--primary-color,#0E1630)] bg-white text-[var(--primary-color,#0E1630)] hover:border-[var(--primary-color,#0E1630)] hover:shadow-lg hover:shadow-blue-200";
  };

  const getBedIcon = (bed) => {
    const status = getBedStatus(bed);
    const isSelected = selectedBed === bed.bedNumber;
    if (isSelected) return "text-green-500";
    if (status === "occupied") return "text-gray-500";
    if (status === "maintenance") return "text-gray-400";
    return "text-[var(--primary-color,#0E1630)]";
  };

  return (
    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
      <h4 className="font-semibold mb-3 sm:mb-4 text-base sm:text-lg">
        Select Bed in {selectedWard.type} Ward {selectedWard.number} - Room {selectedRoom}
      </h4>
      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>Department:</strong> {selectedWard.department}
        </p>
        <p className="text-sm text-blue-800">
          <strong>Room Beds:</strong> {roomBeds.length}
        </p>
      </div>
      <div className="flex items-center gap-2 mb-4">
        {bedScrollIndex > 0 && (
          <button
            onClick={() => onScrollBeds("left")}
            className="p-1.5 sm:p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition-all duration-200 shadow-md flex-shrink-0"
          >
            <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
          </button>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1.5 sm:gap-2 flex-1">
          {visibleBeds.map((bed) => {
            const status = getBedStatus(bed);
            const isSelected = selectedBed === bed.bedNumber;
            const facilities = bedFacilities[bed.bedNumber] || [];
            const isDisabled = status === "occupied" || status === "maintenance";
            return (
              <div
                key={bed.bedId}
                onClick={() => !isDisabled && onSelectBed(bed.bedNumber)}
                className={`relative p-1.5 sm:p-2 rounded-lg border-2 cursor-pointer transition-all duration-300 ${getBedColors(
                  bed
                )} ${isDisabled ? "cursor-not-allowed opacity-60" : ""}`}
              >
                <div className="flex flex-col items-center space-y-0.5 sm:space-y-1">
                  <div className={`${getBedIcon(bed)}`}>
                    {status === "maintenance" ? (
                      <Wrench className="w-3 h-3 sm:w-4 sm:h-4" />
                    ) : status === "occupied" ? (
                      <User className="w-3 h-3 sm:w-4 sm:h-4" />
                    ) : isSelected ? (
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
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
                  <div className="hidden sm:flex flex-wrap gap-0.5 justify-center">
                    {facilities.map((facility) => {
                      const IconComponent = FACILITY_ICONS[facility];
                      return IconComponent ? (
                        <div key={facility} className="relative group">
                          <IconComponent className="w-3 h-3 sm:w-4 sm:h-4" />
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                            {facility}
                          </div>
                        </div>
                      ) : null;
                    })}
                  </div>
                  {facilities.length === 0 && (
                    <div className="text-[8px] sm:text-[10px] opacity-60 hidden sm:block">
                      Basic Room
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {bedScrollIndex + bedsPerPage < roomBeds.length && (
          <button
            onClick={() => onScrollBeds("right")}
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
