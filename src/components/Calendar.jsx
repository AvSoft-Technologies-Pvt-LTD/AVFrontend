import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths } from "date-fns";

const Calendar = ({ title, appointments }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const navigateMonth = (direction) => {
    setCurrentDate(direction === "next" ? addMonths(currentDate, 1) : subMonths(currentDate, 1));
    setSelectedDate(null);
  };

  const getDayAppointments = (day) => {
    const dateStr = format(new Date(currentDate.getFullYear(), currentDate.getMonth(), day), "yyyy-MM-dd");
    return appointments.filter((appointment) => appointment.date === dateStr);
  };

  return (
    <div className="flex bg-gray-100 shadow-lg rounded-xl overflow-hidden border border-gray-300">
      {/* Calendar Section */}
      <div className="w-2/3 p-6 bg-white">
        <header className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex items-center space-x-3">
            <button onClick={() => navigateMonth("prev")} className="text-gray-600 hover:text-cyan-500 transition">
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button onClick={() => navigateMonth("next")} className="text-gray-600 hover:text-cyan-500 transition">
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        </header>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2 text-center text-gray-700 font-semibold">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="py-2 text-cyan-600">{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2 text-center">
          {Array.from({ length: firstDayOfMonth }, (_, i) => (
            <div key={`empty-${i}`} className="py-6"></div>
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dayAppointments = getDayAppointments(day);

            return (
              <div
                key={day}
                className={`p-4 rounded-lg cursor-pointer transition relative bg-gray-50 hover:bg-cyan-100 ${
                  selectedDate === day ? "bg-cyan-200 border border-cyan-500" : ""
                } ${dayAppointments.length ? "border border-cyan-500 shadow-md" : ""}`}
                onClick={() => setSelectedDate(day)}
              >
                <span className="text-lg font-semibold">{day}</span>
                {dayAppointments.length > 0 && (
                  <span className="absolute top-2 right-2 px-2 py-1 text-xs bg-cyan-500 text-white rounded-full">
                    {dayAppointments.length}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right-Side Appointment Details */}
      <div className="w-1/3 p-6 bg-gray-50 border-l border-gray-300">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          {selectedDate
            ? `Appointments for ${format(new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDate), "MMMM d, yyyy")}`
            : "Select a date"}
        </h3>

        {selectedDate ? (
          <ul className="space-y-3">
            {getDayAppointments(selectedDate).length > 0 ? (
              getDayAppointments(selectedDate).map((appointment) => (
                <li key={appointment.id} className="p-4 bg-white shadow-md rounded-lg border-l-4 border-cyan-600">
                  <p className="text-lg font-semibold text-gray-800">{appointment.title}</p>
                  <p className="text-sm text-gray-500">{appointment.time} - {appointment.patientName}</p>
                </li>
              ))
            ) : (
              <p className="text-gray-600 text-sm">No appointments on this day.</p>
            )}
          </ul>
        ) : (
          <p className="text-gray-600 text-sm">Click a date to see appointments.</p>
        )}
      </div>
    </div>
  );
};

export default Calendar;