import React, { useEffect, useMemo, useState } from "react";
import { format, startOfDay } from "date-fns";
import { Clock, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getAvailabilitySchedulesByDoctorAndDate } from "../../../../../utils/CrudService";
import { apiDateToJSDate, jsDateToString } from "./dateUtils";
import "./scheduler.css";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const timeLabelsBetween = (startHour = 8, endHour = 18, stepMins = 30) => {
  const labels = [];
  for (let h = startHour; h < endHour; h++) {
    labels.push(new Date(0, 0, 0, h, 0));
    if (stepMins < 60) labels.push(new Date(0, 0, 0, h, stepMins));
  }
  return labels;
};

const initials = (name = "") => {
  const t = (name || "").trim();
  return t ? t.charAt(0).toUpperCase() : "?";
};

const TodayView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()));
  const [dayEvents, setDayEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get date from URL query parameter
    const searchParams = new URLSearchParams(location.search);
    const dateParam = searchParams.get("date");
    if (dateParam) {
      setSelectedDate(startOfDay(new Date(dateParam)));
    }
  }, [location.search]);

  useEffect(() => {
    loadDayEvents();
  }, [selectedDate]);

  const loadDayEvents = async () => {
    setLoading(true);
    try {
      const dateStr = jsDateToString(selectedDate);
      const doctorId = 1; // TODO: Get from auth context
      
      const response = await getAvailabilitySchedulesByDoctorAndDate(doctorId, dateStr);
      const schedules = response.data || [];

      // Convert schedules to events
      const events = [];
      schedules.forEach((schedule) => {
        const fromDate = apiDateToJSDate(schedule.fromDate);
        const toDate = apiDateToJSDate(schedule.toDate);

        if (fromDate && toDate) {
          // Find the slots for this specific date
          const targetDateStr = jsDateToString(selectedDate);
          const daySlot = schedule.generatedSlots?.find((slot) => {
            const slotDateStr = `${slot.date[0]}-${String(slot.date[1]).padStart(2, "0")}-${String(slot.date[2]).padStart(2, "0")}`;
            return slotDateStr === targetDateStr;
          });

          if (daySlot && daySlot.slots) {
            // Create events for each slot
            daySlot.slots.forEach((timeSlot, idx) => {
              // Parse time slot (e.g., "9:00 AM")
              const timeParts = timeSlot.match(/(\\d+):(\\d+)\\s*(AM|PM)/i);
              if (timeParts) {
                let hours = parseInt(timeParts[1]);
                const minutes = parseInt(timeParts[2]);
                const period = timeParts[3].toUpperCase();

                if (period === "PM" && hours !== 12) hours += 12;
                if (period === "AM" && hours === 12) hours = 0;

                const start = new Date(selectedDate);
                start.setHours(hours, minutes, 0, 0);

                const end = new Date(start);
                end.setMinutes(end.getMinutes() + (schedule.appointmentDuration?.durationMinutes || 30));

                events.push({
                  id: `${schedule.id}-${idx}`,
                  title: `Available Slot`,
                  start: start,
                  end: end,
                  resource: {
                    doctor: schedule.doctorName,
                    color: "#3b82f6",
                    type: "Available",
                    duration: schedule.appointmentDuration?.displayName,
                  },
                });
              }
            });
          }
        }
      });

      setDayEvents(events);
    } catch (error) {
      console.error("Error loading day events:", error);
      toast.error("Failed to load schedules for this day");
      setDayEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const gotoPrev = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(startOfDay(newDate));
  };

  const gotoNext = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(startOfDay(newDate));
  };

  const slotMap = useMemo(() => {
    const map = {};
    dayEvents.forEach((ev) => {
      const dt = new Date(ev.start);
      const key =
        dt.getHours().toString().padStart(2, "0") + ":" +
        dt.getMinutes().toString().padStart(2, "0");
      map[key] = map[key] || [];
      map[key].push(ev);
    });
    return map;
  }, [dayEvents]);

  const timeSlots = timeLabelsBetween(8, 18, 30);

  if (loading) {
    return (
      <div className="scheduler-container">
        <div className="scheduler-loading">
          <div className="loading-spinner" />
          <p className="text-sm sm:text-base">Loading schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="scheduler-container">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <div className="todayview-root">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-200 gap-3">
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={gotoPrev}
              aria-label="Previous day"
              className="p-1.5 sm:p-2 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all flex-shrink-0"
            >
              <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
            </button>

            <div className="font-bold text-sm sm:text-base md:text-lg lg:text-xl text-slate-900 min-w-0 flex-1 text-center sm:text-left truncate">
              {format(selectedDate, "EEEE, MMMM d, yyyy")}
            </div>

            <button
              onClick={gotoNext}
              aria-label="Next day"
              className="p-1.5 sm:p-2 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all flex-shrink-0"
            >
              <ChevronRight size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <div className="text-xs sm:text-sm text-slate-500">
              Total slots: <span className="font-bold text-slate-800">{dayEvents.length}</span>
            </div>
            <button
              onClick={() => navigate("/doctordashboard/scheduler")}
              className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl border border-gray-200 bg-white hover:shadow-md transition-all text-xs sm:text-sm w-full sm:w-auto"
            >
              <CalendarIcon size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Back to Calendar</span>
              <span className="sm:hidden">Calendar</span>
            </button>
          </div>
        </div>

        {/* Time Grid */}
        <div className="todayview-main">
          {/* Time Column */}
          <div className="time-column">
            <div className="flex flex-col">
              {timeSlots.map((t, idx) => (
                <div key={idx} className="slot-row" aria-hidden="true">
                  <div className="text-xs sm:text-sm">{format(t, "hh:mm a")}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Appointments Column */}
          <div className="appointments-column">
            <div>
              {timeSlots.map((t, idx) => {
                const key =
                  t.getHours().toString().padStart(2, "0") + ":" +
                  t.getMinutes().toString().padStart(2, "0");
                const eventsAt = slotMap[key] || [];
                const hasEvents = eventsAt.length > 0;

                return (
                  <section
                    key={idx}
                    className={`slot-container ${hasEvents ? "has-events" : ""}`}
                    aria-label={`Slot ${key}`}
                  >
                    {hasEvents ? (
                      <div className="slot-events">
                        {eventsAt.map((ev) => {
                          const doctor = ev.resource?.doctor ?? "Doctor";
                          const color = ev.resource?.color ?? "#3b82f6";
                          const type = ev.resource?.type || "Available";

                          return (
                            <div
                              key={ev.id}
                              className="event-card"
                              style={{ color }}
                              data-color={color}
                            >
                              <div className="event-left">
                                <div className="patient-avatar" style={{ backgroundColor: color }}>
                                  {initials(doctor)}
                                </div>
                              </div>

                              <div className="event-main min-w-0 flex-1">
                                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                                  <div className="event-patient text-xs sm:text-sm truncate">{doctor}</div>
                                  <div className="type-badge text-xs bg-green-100 text-green-800">
                                    {type}
                                  </div>
                                </div>
                                {ev.resource?.duration && (
                                  <div className="text-xs text-slate-500 mt-1">
                                    Duration: {ev.resource.duration}
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                                <Clock size={12} className="sm:w-[14px] sm:h-[14px] text-slate-400" />
                                <div className="font-medium text-slate-700 text-xs sm:text-sm whitespace-nowrap">
                                  {format(new Date(ev.start), "hh:mm a")} — {format(new Date(ev.end), "hh:mm a")}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="slot-placeholder">
                        <div className="text-xs sm:text-sm">No slots available</div>
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodayView;
