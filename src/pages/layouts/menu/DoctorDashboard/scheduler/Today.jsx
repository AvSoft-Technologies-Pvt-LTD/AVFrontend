import React, { useEffect, useMemo, useState } from "react";
import { format, startOfDay } from "date-fns";
import { Clock, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import "./scheduler.css";

const mkDemoEventsForDate = (dateObj) => {
  const d = dateObj instanceof Date ? dateObj : new Date(dateObj);
  const mk = (h, m, duration = 40) => {
    const start = new Date(d);
    start.setHours(h, m, 0, 0);
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + duration);
    return { start, end };
  };

  const patients = [
    "John Smith", "Peter Chung", "Anita R", "Sarah Johnson", "Mike Davis", "Emily Chen",
    "Robert Wilson", "Lisa Anderson", "David Brown", "Maria Garcia", "James Taylor", "Jennifer Martinez",
  ];

  const types = ["PHYSICAL", "VIRTUAL"];
  const statuses = ["Confirmed", "Upcoming", "Checked In"];
  const titles = ["Medical Checkup", "Operation", "Follow-up", "Consultation", "Annual Physical"];
  const colors = ["#10b981", "#3b82f6", "#f97316", "#8b5cf6", "#06b6d4", "#ef4444"];

  const timeSlots = [
    { h: 8, m: 0 }, { h: 9, m: 0 }, { h: 10, m: 30 }, { h: 11, m: 0 },
    { h: 13, m: 30 }, { h: 14, m: 0 }, { h: 15, m: 0 }, { h: 16, m: 0 },
  ];

  return timeSlots.map((slot, idx) => {
    const times = mk(slot.h, slot.m);
    return {
      id: `demo-${idx}-${d.toISOString().slice(0, 10)}`,
      title: titles[idx % titles.length],
      start: times.start,
      end: times.end,
      resource: {
        patient: patients[idx % patients.length],
        color: colors[idx % colors.length],
        consultationType: types[idx % 2],
        status: statuses[idx % statuses.length],
        groupCount: idx === 3 ? 3 : 0,
      },
    };
  });
};

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

const TodayView = ({ events = [], onSelectEvent }) => {
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()));

  useEffect(() => {}, []);

  const dayEvents = useMemo(() => {
    const iso = selectedDate.toISOString().slice(0, 10);

    const filtered = (events || []).filter((ev) =>
      ev && ev.start && (new Date(ev.start)).toISOString().slice(0, 10) === iso
    );

    if (filtered.length) {
      return filtered.map((ev, idx) => ({
        ...ev,
        id: ev.id ?? `evt-${idx}`,
        resource: ev.resource || {
          patient: ev.title || "Patient",
          color: "#3b82f6",
        },
      }));
    }

    return mkDemoEventsForDate(selectedDate);
  }, [events, selectedDate]);

  const gotoPrev = () =>
    setSelectedDate(startOfDay(new Date(selectedDate.getTime() - 24 * 3600 * 1000)));

  const gotoNext = () =>
    setSelectedDate(startOfDay(new Date(selectedDate.getTime() + 24 * 3600 * 1000)));

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

  return (
    <div className="scheduler-container">
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
              Total appointments: <span className="font-bold text-slate-800">{dayEvents.length}</span>
            </div>
            <button className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl border border-gray-200 bg-white hover:shadow-md transition-all text-xs sm:text-sm w-full sm:w-auto">
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
                const hasEvents = eventsAt.length > 0; // ✅ Important

                return (
                  <section
                    key={idx}
                    className={`slot-container ${hasEvents ? "has-events" : ""}`} // ✅ Important
                    aria-label={`Slot ${key}`}
                  >
                    {hasEvents ? (
                      <div className="slot-events">
                        {eventsAt.map((ev) => {
                          const patient = ev.resource?.patient ?? ev.title ?? "Patient";
                          const color = ev.resource?.color ?? "#3b82f6";
                          const type = (ev.resource?.consultationType || "").toUpperCase();
                          const typeLabel = type === "PHYSICAL" ? "PHYSICAL" : type === "VIRTUAL" ? "VIRTUAL" : "—";

                          return (
                            <button
                              key={ev.id}
                              onClick={() => onSelectEvent?.(ev)}
                              className="event-card"
                              style={{ color }}
                              data-color={color}
                            >
                              <div className="event-left">
                                <div className="patient-avatar" style={{ backgroundColor: color }}>
                                  {initials(patient)}
                                </div>
                              </div>

                              <div className="event-main min-w-0 flex-1">
                                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                                  <div className="event-patient text-xs sm:text-sm truncate">{patient}</div>
                                  <div className={`type-badge text-xs ${type === "PHYSICAL" ? "physical" : "virtual"}`}>
                                    {typeLabel}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                                <Clock size={12} className="sm:w-[14px] sm:h-[14px] text-slate-400" />
                                <div className="font-medium text-slate-700 text-xs sm:text-sm whitespace-nowrap">
                                  {format(new Date(ev.start), "hh:mm a")} — {format(new Date(ev.end), "hh:mm a")}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="slot-placeholder">
                        <div className="text-xs sm:text-sm">No appointments</div>
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
