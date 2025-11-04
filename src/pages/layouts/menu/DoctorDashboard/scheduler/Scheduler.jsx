import React, { useState, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import {
  format,
  parse,
  startOfWeek,
  getDay,
  startOfDay,
  endOfDay,
  compareAsc,
} from "date-fns";
import { enUS } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronDown,
  Video,
  Copy,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import ReusableModal from "../../../../../components/microcomponents/Modal";
import { getAllAvailabilitySchedules } from "../../../../../utils/CrudService";
import { apiDateToJSDate, jsDateToString } from "./dateUtils";
import "./scheduler.css";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

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

const Scheduler = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [monthEvents, setMonthEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAppointmentDetail, setShowAppointmentDetail] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedColor, setSelectedColor] = useState("#3b82f6");
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  useEffect(() => {
    loadAppointments();
    const handler = () => {
      setShowMonthPicker(false);
      setShowYearPicker(false);
    };
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, []);

  const groupEventsByDate = (individualEvents) => {
    const map = {};
    individualEvents.forEach((e) => {
      const d = startOfDay(new Date(e.start));
      const key = format(d, "yyyy-MM-dd");
      if (!map[key]) map[key] = [];
      map[key].push(e);
    });

    const grouped = Object.keys(map).map((key) => {
      const [y, m, dd] = key.split("-").map(Number);
      const d = new Date(y, m - 1, dd);
      map[key].sort((a, b) => compareAsc(new Date(a.start), new Date(b.start)));
      return {
        id: `day-${key}`,
        title: "",
        start: startOfDay(d),
        end: endOfDay(d),
        allDay: true,
        resource: {
          events: map[key],
          color: map[key][0]?.resource?.color || "#3b82f6",
        },
      };
    });
    return grouped;
  };

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const response = await getAllAvailabilitySchedules();
      const schedules = response.data || [];

      // Convert schedules to calendar events
      const calendarEvents = [];
      schedules.forEach((schedule) => {
        const fromDate = apiDateToJSDate(schedule.fromDate);
        const toDate = apiDateToJSDate(schedule.toDate);

        if (fromDate && toDate) {
          // Create an event for the entire schedule period
          calendarEvents.push({
            id: schedule.id,
            title: `Dr. ${schedule.doctorName} - Available`,
            start: fromDate,
            end: toDate,
            resource: {
              doctor: schedule.doctorName,
              startTime: schedule.startTime,
              endTime: schedule.endTime,
              duration: schedule.appointmentDuration?.displayName,
              color: PRESET_COLORS[schedule.id % PRESET_COLORS.length],
              schedule: schedule,
            },
          });
        }
      });

      setEvents(calendarEvents);
      const groupedReal = groupEventsByDate(calendarEvents);
      groupedReal.sort((a, b) => a.start - b.start);
      setMonthEvents(groupedReal);

      const now = new Date();
      const upcoming = calendarEvents
        .filter((event) => event.start >= now)
        .sort((a, b) => a.start.getTime() - b.start.getTime())
        .slice(0, 5);
      setUpcomingAppointments(upcoming);
    } catch (error) {
      console.error("Error loading appointments:", error);
      toast.error("Failed to load schedules");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEvent = useCallback(
    (event) => {
      if (event?.resource?.events) {
        const iso = format(startOfDay(event.start), "yyyy-MM-dd");
        navigate(`/doctordashboard/scheduler/today?date=${iso}`, {
          state: { events: event.resource.events },
        });
      } else {
        setSelectedEvent(event);
        setSelectedColor(event?.resource?.color || "#3b82f6");
        setShowAppointmentDetail(true);
      }
    },
    [navigate]
  );

  const handleSelectSlot = useCallback(
    (slotInfo) => {
      const iso = format(startOfDay(new Date(slotInfo.start)), "yyyy-MM-dd");
      const dayEvents = events.filter((ev) => {
        const evDate = new Date(ev.start).toISOString().slice(0, 10);
        return evDate === iso;
      });
      navigate(`/doctordashboard/scheduler/today?date=${iso}`, { state: { events: dayEvents } });
    },
    [navigate, events]
  );

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Link copied to clipboard!");
  };

  const handleManageAvailability = () => {
    navigate("/doctordashboard/scheduler/availability");
  };

  const dayCountsMap = useMemo(() => {
    const map = {};
    monthEvents.forEach((m) => {
      const key = format(startOfDay(m.start), "yyyy-MM-dd");
      const count = Array.isArray(m.resource?.events) ? m.resource.events.length : 0;
      map[key] = (map[key] || 0) + count;
    });
    return map;
  }, [monthEvents]);

  const GroupedDayEvent = ({ event }) => {
    const dayEvents = event.resource?.events || [];
    const earliest = dayEvents[0];
    const earliestTime = earliest ? format(new Date(earliest.start), "h:mm a") : null;

    return (
      <div className="custom-event month-grouped">
        {earliestTime && (
          <div
            className="time-pill"
            style={{
              background: event.resource?.color || "#3b82f6",
              color: "#fff",
            }}
          >
            {earliestTime}
          </div>
        )}
      </div>
    );
  };

  const DateCellWrapper = ({ children, value }) => {
    const key = format(startOfDay(new Date(value)), "yyyy-MM-dd");
    const count = dayCountsMap[key] || 0;

    return (
      <div style={{ position: "relative", height: "100%" }}>
        <div style={{ height: "100%" }}>{children}</div>
        {count > 0 && (
          <div className="date-count-badge" title={`${count} schedule${count > 1 ? "s" : ""}`}>
            {count}
          </div>
        )}
      </div>
    );
  };

  const MonthEventRenderer = (props) => {
    if (props.event.resource?.events) {
      return <GroupedDayEvent event={props.event} />;
    }
    return (
      <div className="custom-event single-event">
        <div className="event-time">{format(props.event.start, "h:mm a")}</div>
        <div className="event-title">{props.event.title}</div>
      </div>
    );
  };

  const eventStyleGetter = (event) => {
    if (event.resource?.events) {
      return {
        style: {
          backgroundColor: "transparent",
          border: "0",
          color: "inherit",
          padding: 0,
          height: "auto",
          minHeight: "20px",
          boxSizing: "border-box",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          marginTop: "2px",
          position: "relative",
          overflow: "visible",
        },
      };
    }
    return {
      style: {
        backgroundColor: event.resource?.color || "#3b82f6",
        borderRadius: "6px",
        opacity: 0.95,
        color: "white",
        border: "0px",
        display: "block",
        fontSize: "13px",
        fontWeight: "500",
      },
    };
  };

  const CustomToolbar = ({ date, onNavigate }) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];
    const years = Array.from({ length: 11 }, (_, i) => date.getFullYear() - 5 + i);

    const handleMonthChange = (monthIndex) => {
      const newDate = new Date(date);
      newDate.setMonth(monthIndex);
      onNavigate("date", newDate);
      setCurrentDate(newDate);
      setShowMonthPicker(false);
    };
    const handleYearChange = (year) => {
      const newDate = new Date(date);
      newDate.setFullYear(year);
      onNavigate("date", newDate);
      setCurrentDate(newDate);
      setShowYearPicker(false);
    };
    const stop = (e) => e.stopPropagation();

    return (
      <div className="scheduler-toolbar" onClick={stop} style={{ overflow: "visible" }}>
        <div className="toolbar-left" style={{ overflow: "visible" }}>
          <div className="month-year-selector flex items-center gap-2 relative">
            {/* Month */}
            <div className="relative">
              <button
                className="selector-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMonthPicker((p) => !p);
                  setShowYearPicker(false);
                }}
              >
                <span className="hidden sm:inline">{months[date.getMonth()]}</span>
                <span className="sm:hidden">{months[date.getMonth()].slice(0, 3)}</span>
                <ChevronDown size={14} className="sm:w-4 sm:h-4" />
              </button>

              {showMonthPicker && (
                <div className="picker-dropdown month-picker" style={{ position: "absolute", top: "100%", left: 0, marginTop: 8, zIndex: 2000 }} onClick={stop}>
                  {months.map((month, index) => (
                    <button
                      key={month}
                      className={`picker-option ${date.getMonth() === index ? "active" : ""}`}
                      onClick={() => handleMonthChange(index)}
                    >
                      {month}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Year */}
            <div className="relative">
              <button
                className="selector-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowYearPicker((p) => !p);
                  setShowMonthPicker(false);
                }}
              >
                {date.getFullYear()}
                <ChevronDown size={14} className="sm:w-4 sm:h-4" />
              </button>

              {showYearPicker && (
                <div className="picker-dropdown year-picker" style={{ position: "absolute", top: "100%", left: 0, marginTop: 8, zIndex: 2001, maxHeight: 280, overflowY: "auto" }} onClick={stop}>
                  {years.map((year) => (
                    <button
                      key={year}
                      className={`picker-option ${date.getFullYear() === year ? "active" : ""}`}
                      onClick={() => handleYearChange(year)}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="toolbar-right">
          <button onClick={handleManageAvailability} className="availability-btn">
            <span className="hidden sm:inline">Manage Availability</span>
            <span className="sm:hidden">Availability</span>
          </button>
        </div>
      </div>
    );
  };

  const getInitial = (name) => {
    if (!name) return "?";
    return name.trim().charAt(0).toUpperCase();
  };

  const modalData = selectedEvent
    ? {
        doctor: selectedEvent.resource?.doctor || "-",
        schedule: selectedEvent.title || "-",
        startTime: selectedEvent.resource?.startTime || "-",
        endTime: selectedEvent.resource?.endTime || "-",
        duration: selectedEvent.resource?.duration || "-",
        date: format(selectedEvent.start, "EEEE, MMMM d, yyyy"),
      }
    : {};

  const viewFields = [
    { initialsKey: true, key: "doctor" },
    { titleKey: true, key: "doctor" },
    { subtitleKey: true, key: "date" },
    { label: "Schedule", key: "schedule" },
    { label: "Start Time", key: "startTime" },
    { label: "End Time", key: "endTime" },
    { label: "Appointment Duration", key: "duration" },
  ];

  if (loading) {
    return (
      <div className="scheduler-loading">
        <div className="loading-spinner" />
        <p className="text-sm sm:text-base">Loading your schedule...</p>
      </div>
    );
  }

  return (
    <div className="scheduler-container">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      <div className="scheduler-layout">
        <div className="calendar-section">
          <Calendar
            localizer={localizer}
            events={monthEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: "auto", minHeight: 400, overflow: "visible" }}
            eventPropGetter={eventStyleGetter}
            components={{
              toolbar: CustomToolbar,
              event: MonthEventRenderer,
              dateCellWrapper: DateCellWrapper,
            }}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            selectable
            popup
            views={["month"]}
            defaultView="month"
            date={currentDate}
            onNavigate={(newDate) => setCurrentDate(newDate)}
            className="no-inner-scroll"
          />
        </div>

        <div className="sidebar-section">
           <div className="google-meet-card">
            <div className="card-header">
              <h3>Connect with upcoming patient</h3>
            </div>
            <div className="meet-link-container">
              <div className="meet-link-wrapper">
                <Video size={16} color="#10b981" />
                <a
                  href="https://meet.google.com/y4x72A"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="meet-link"
                >
                  https://meet.google.com/y4x72A
                </a>
              </div>
              <button
                className="copy-btn"
                onClick={() => copyToClipboard("https://meet.google.com/y4x72A")}
                title="Copy link"
              >
                <Copy size={16} />
              </button>
            </div>
          </div>
          <div className="upcoming-card">
            <div className="card-header">
              <CalendarIcon size={16} className="sm:w-[18px] sm:h-[18px]" />
              <h3 className="text-xs sm:text-sm">Upcoming Schedules</h3>
            </div>

            <div className="upcoming-list">
              {upcomingAppointments.length === 0 ? (
                <div className="empty-state">
                  <Clock size={32} className="sm:w-10 sm:h-10 empty-icon" />
                  <p className="text-xs sm:text-sm">No upcoming schedules</p>
                </div>
              ) : (
                upcomingAppointments.map((appt) => (
                  <div
                    key={appt.id}
                    className="appointment-item"
                    onClick={() => handleSelectEvent(appt)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="patient-avatar" style={{ background: appt.resource.color || "#3b82f6" }}>
                      {getInitial(appt.resource.doctor)}
                    </div>

                    <div className="appt-details min-w-0">
                      <div className="appt-patient">
                        <span className="patient-name text-xs">{appt.resource.doctor}</span>
                      </div>

                      <div className="appt-time">
                        <Clock size={12} className="sm:w-[14px] sm:h-[14px]" />
                        <span className="text-xs">{format(appt.start, "MMM d, yyyy")}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {showAppointmentDetail && selectedEvent && createPortal(
        <ReusableModal
          isOpen={showAppointmentDetail}
          onClose={() => setShowAppointmentDetail(false)}
          mode="viewProfile"
          title="Schedule Details"
          data={modalData}
          viewFields={viewFields}
          size="md"
        />,
        document.body
      )}
    </div>
  );
};

export default Scheduler;
