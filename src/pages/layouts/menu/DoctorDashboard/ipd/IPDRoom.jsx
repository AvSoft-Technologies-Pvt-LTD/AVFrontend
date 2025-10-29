import React from "react";
import { Bed, CheckCircle, XCircle, DoorOpen } from "lucide-react";
import {
  Users,
  Heart,
  AlertTriangle,
  Baby,
  Shield,
  Stethoscope,
  Activity,
} from "lucide-react";

const WARD_ICONS = {
  "General Ward": Users,
  General: Users,
  "ICU Ward": Heart,
  ICU: Heart,
  ICCU: Activity,
  Emergency: AlertTriangle,
  "Private Room": Shield,
  Private: Shield,
  Maternity: Baby,
  Surgical: Stethoscope,
};

const getWardIcon = (wardType) => {
  if (!wardType) return <DoorOpen className="w-4 h-4 sm:w-5 sm:h-5" />;
  const IconComponent = WARD_ICONS[wardType] || DoorOpen;
  return <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />;
};

const IPDRoom = ({ wardData, selectedWard, selectedRoom, onSelectRoom }) => {
  if (!selectedWard) return null;

  return (
    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
      <h4 className="font-semibold mb-3 sm:mb-4 text-base sm:text-lg">
        Select Room in {selectedWard.type} Ward {selectedWard.number}
      </h4>
      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>Department:</strong> {selectedWard.department}
        </p>
        <p className="text-sm text-blue-800">
          <strong>Total Rooms:</strong> {selectedWard.rooms.length}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {selectedWard.rooms.map((room) => (
          <div
            key={room.roomId}
            className={`p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
              selectedRoom === room.roomNumber
                ? "border-[#01B07A] bg-[#E6FBF5] shadow-lg"
                : "border-gray-200 hover:border-gray-300"
            } ${
              room.beds.filter(bed => bed.bedStatusId === 1).length === 0
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            onClick={() =>
              room.beds.filter(bed => bed.bedStatusId === 1).length > 0 &&
              onSelectRoom(room.roomNumber)
            }
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <DoorOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                <h4 className="font-semibold text-xs sm:text-sm">
                  Room {room.roomNumber}
                </h4>
              </div>
              <div className="flex flex-col items-end gap-1">
                {room.beds.filter(bed => bed.bedStatusId === 1).length === 0 && (
                  <span className="text-[10px] text-red-600 font-medium">
                    Full
                  </span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <div className="bg-blue-50 rounded-xl p-2 text-center shadow-sm flex flex-col items-center">
                <Bed className="w-4 h-4 text-blue-600 mb-1" />
                <p className="text-[10px] text-gray-500 font-medium">Total</p>
                <p className="text-blue-600 font-bold text-sm">
                  {room.beds.length}
                </p>
              </div>
              <div className="bg-green-50 rounded-xl p-2 text-center shadow-sm flex flex-col items-center">
                <CheckCircle className="w-4 h-4 text-green-600 mb-1" />
                <p className="text-[10px] text-gray-500 font-medium">
                  Available
                </p>
                <p className="text-green-600 font-bold text-sm">
                  {room.beds.filter(bed => bed.bedStatusId === 1).length}
                </p>
              </div>
              <div className="bg-red-50 rounded-xl p-2 text-center shadow-sm flex flex-col items-center">
                <XCircle className="w-4 h-4 text-red-600 mb-1" />
                <p className="text-[10px] text-gray-500 font-medium">
                  Occupied
                </p>
                <p className="text-red-600 font-bold text-sm">
                  {room.beds.filter(bed => bed.bedStatusId !== 1).length}
                </p>
              </div>
            </div>
            <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-red-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    (room.beds.filter(bed => bed.bedStatusId !== 1).length / room.beds.length) * 100
                  }%`,
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
      {selectedRoom && (
        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-[#E6FBF5] rounded-lg border border-[#01B07A]">
          <p className="text-xs sm:text-sm text-[#01B07A] font-medium">
            Selected: {selectedWard.type} Ward {selectedWard.number} - Room {selectedRoom}
          </p>
        </div>
      )}
    </div>
  );
};

export default IPDRoom;
