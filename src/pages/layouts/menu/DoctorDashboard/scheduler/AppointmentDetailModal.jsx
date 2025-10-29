import React, { useState } from "react";
import {
  X,
  User,
  Phone,
  Mail,
  Clock,
  FileText,
  Edit2,
  Trash2,
  Palette,
} from "lucide-react";
import { format } from "date-fns";

const PRESET_COLORS = [
  "#3b82f6",
  "#10b981",
  "#8b5cf6",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
  "#f97316",
  "#6366f1",
];

const AppointmentDetailModal = ({ isOpen, onClose, event, onUpdateColor }) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState(
    event.resource.color || "#3b82f6"
  );

  if (!isOpen) return null;

  const handleColorChange = (color) => {
    setSelectedColor(color);
    onUpdateColor(event.id, color);
    setShowColorPicker(false);
  };

  return (
<div
  className="fixed inset-0 bg-black/30 backdrop-blur-md z-[99999] flex items-center justify-center p-2 sm:p-4"
  onClick={onClose}
>



      <div
        className="bg-white rounded-lg sm:rounded-xl shadow-xl w-full max-w-[95%] sm:max-w-md md:max-w-lg lg:max-w-2xl mx-2 sm:mx-4 my-4 sm:my-8 overflow-hidden max-h-[95vh] sm:max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header - Added responsive padding and text sizing */}
        <div
          className="border-l-4 px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex justify-between items-start sm:items-center gap-2"
          style={{ borderLeftColor: selectedColor }}
        >
          <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <div
              className="w-2 sm:w-3 h-8 sm:h-10 rounded-full flex-shrink-0"
              style={{ backgroundColor: selectedColor }}
            ></div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 truncate">
                {event.resource.patient}
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-gray-500 truncate">
                {format(event.start, "EEEE, MMMM d, yyyy")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 focus:outline-none flex-shrink-0"
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Modal Body - Added responsive padding and scrolling */}
        <div className="p-3 sm:p-4 md:p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Time */}
            <div className="flex items-start space-x-2 sm:space-x-3">
              <div className="mt-1 flex-shrink-0">
                <Clock size={16} className="sm:w-[18px] sm:h-[18px] text-gray-500" />
              </div>
              <div className="min-w-0 flex-1">
                <label className="block text-xs sm:text-sm font-medium text-gray-600">
                  Time
                </label>
                <p className="text-sm sm:text-base md:text-lg text-gray-800 break-words">
                  {format(event.start, "h:mm a")} - {format(event.end, "h:mm a")}
                </p>
              </div>
            </div>

            {/* Patient Name */}
            <div className="flex items-start space-x-2 sm:space-x-3">
              <div className="mt-1 flex-shrink-0">
                <User size={16} className="sm:w-[18px] sm:h-[18px] text-gray-500" />
              </div>
              <div className="min-w-0 flex-1">
                <label className="block text-xs sm:text-sm font-medium text-gray-600">
                  Patient Name
                </label>
                <p className="text-sm sm:text-base md:text-lg text-gray-800 break-words">
                  {event.resource.patient}
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start space-x-2 sm:space-x-3">
              <div className="mt-1 flex-shrink-0">
                <Phone size={16} className="sm:w-[18px] sm:h-[18px] text-gray-500" />
              </div>
              <div className="min-w-0 flex-1">
                <label className="block text-xs sm:text-sm font-medium text-gray-600">
                  Phone
                </label>
                <p className="text-sm sm:text-base md:text-lg text-gray-800 break-words">
                  {event.resource.phone}
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start space-x-2 sm:space-x-3">
              <div className="mt-1 flex-shrink-0">
                <Mail size={16} className="sm:w-[18px] sm:h-[18px] text-gray-500" />
              </div>
              <div className="min-w-0 flex-1">
                <label className="block text-xs sm:text-sm font-medium text-gray-600">
                  Email
                </label>
                <p className="text-sm sm:text-base md:text-lg text-gray-800 break-all">
                  {event.resource.email}
                </p>
              </div>
            </div>

            {/* Consultation Type */}
            <div className="sm:col-span-2 flex items-start space-x-2 sm:space-x-3">
              <div className="mt-1 flex-shrink-0">
                <FileText size={16} className="sm:w-[18px] sm:h-[18px] text-gray-500" />
              </div>
              <div className="min-w-0 flex-1">
                <label className="block text-xs sm:text-sm font-medium text-gray-600">
                  Consultation Type
                </label>
                <p>
                  <span
                    className={`inline-block px-2 py-1 text-xs sm:text-sm rounded-full ${
                      event.resource.type?.toLowerCase() === "follow-up"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {event.resource.type}
                  </span>
                </p>
              </div>
            </div>

            {/* Reason for Visit */}
            <div className="sm:col-span-2 flex items-start space-x-2 sm:space-x-3">
              <div className="mt-1 flex-shrink-0">
                <FileText size={16} className="sm:w-[18px] sm:h-[18px] text-gray-500" />
              </div>
              <div className="min-w-0 flex-1">
                <label className="block text-xs sm:text-sm font-medium text-gray-600">
                  Reason for Visit
                </label>
                <p className="text-sm sm:text-base md:text-lg text-gray-800 break-words">
                  {event.resource.reason}
                </p>
              </div>
            </div>

            {/* Event Color */}
            <div className="sm:col-span-2 flex items-start space-x-2 sm:space-x-3">
              <div className="mt-1 flex-shrink-0">
                <Palette size={16} className="sm:w-[18px] sm:h-[18px] text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-xs sm:text-sm font-medium text-gray-600">
                  Event Color
                </label>
                <div className="mt-1">
                  <button
                    className="px-3 py-2 rounded-md text-xs sm:text-sm font-medium border border-gray-300 focus:outline-none w-full sm:w-auto"
                    style={{ backgroundColor: selectedColor }}
                    onClick={() => setShowColorPicker(!showColorPicker)}
                  >
                    Change Color
                  </button>
                  {showColorPicker && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {PRESET_COLORS.map((color) => (
                        <button
                          key={color}
                          className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 ${
                            selectedColor === color
                              ? "border-blue-500"
                              : "border-transparent"
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => handleColorChange(color)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer - Added responsive layout and sizing */}
        <div className="bg-gray-50 px-3 sm:px-4 md:px-6 py-3 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 border-t border-gray-200">
          <button
            className="flex items-center justify-center gap-1 sm:gap-2 px-3 py-2 text-xs sm:text-sm font-medium text-red-600 hover:text-red-800 focus:outline-none border border-red-200 rounded-md sm:border-0"
            onClick={() => {}}
          >
            <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
            Cancel Appointment
          </button>
          <button
            className="flex items-center justify-center gap-1 sm:gap-2 px-3 py-2 text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-800 focus:outline-none border border-blue-200 rounded-md sm:border-0"
            onClick={() => {}}
          >
            <Edit2 size={16} className="sm:w-[18px] sm:h-[18px]" />
            Edit Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetailModal;