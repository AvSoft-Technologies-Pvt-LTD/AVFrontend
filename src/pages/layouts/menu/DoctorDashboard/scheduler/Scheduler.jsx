import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import {
  format,
  parse,
  startOfWeek,
  getDay,
  addMonths,
  subMonths,
  startOfDay,
  endOfDay,
  compareAsc,
} from "date-fns";
import { enUS } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Video,
  Copy,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import AppointmentDetailModal from "./AppointmentDetailModal";
import { generateDummyAppointments } from "./dummyData";
import "./scheduler.css";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const mockAppointments = generateDummyAppointments();

const Scheduler = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [monthEvents, setMonthEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date(2025, 8, 1));
  const [showAppointmentDetail, setShowAppointmentDetail] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
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

  const loadAppointments = () => {
    setLoading(true);
    setTimeout(() => {
      const calendarEvents = mockAppointments.map((appt) => {
        const endDate = new Date(appt.date);
        endDate.setMinutes(endDate.getMinutes() + 30);
        return {
          id: appt.id,
          title: appt.name,
          start: appt.date,
          end: endDate,
          resource: {
            patient: appt.name,
            phone: appt.phone,
            type: appt.consultationType,
            reason: appt.symptoms,
            email: appt.email,
            color: appt.color,
            meetLink: appt.meetLink,
          },
        };
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

      setLoading(false);
    }, 600);
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

  const handleUpdateEventColor = (eventId, newColor) => {
    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === eventId
          ? { ...event, resource: { ...event.resource, color: newColor } }
          : event
      )
    );
    setMonthEvents((prev) =>
      prev.map((m) =>
        m.resource?.events?.some((ev) => ev.id === eventId)
          ? { ...m, resource: { ...m.resource, color: newColor } }
          : m
      )
    );
    toast.success("Event color updated!");
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Link copied to clipboard!");
  };

// UPDATED: Navigate to /doctordashboard/scheduler/availability (removed conditional navigation)
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
          <div className="date-count-badge" title={`${count} appointment${count > 1 ? "s" : ""}`}>
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
      "July", "August", "September", "October", "November", "December"
    ];
    const years = Array.from({ length: 11 }, (_, i) => date.getFullYear() - 5 + i);
    const goToBack = () => {
      const newDate = subMonths(date, 1);
      onNavigate("prev", newDate);
      setCurrentDate(newDate);
    };
    const goToNext = () => {
      const newDate = addMonths(date, 1);
      onNavigate("next", newDate);
      setCurrentDate(newDate);
    };
    const goToCurrent = () => {
      const iso = format(startOfDay(new Date()), "yyyy-MM-dd");
      navigate(`/doctordashboard/scheduler/today?date=${iso}`, { relative: "path" });
    };
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
      <div className="scheduler-toolbar" onClick={stop}>
        {/* Added responsive toolbar layout */}
        <div className="toolbar-left">
          <div className="month-year-selector">
            <button
              className="selector-btn"
              onClick={(e) => {
                e.stopPropagation();
                setShowMonthPicker(!showMonthPicker);
                setShowYearPicker(false);
              }}
            >
              <span className="hidden sm:inline">{months[date.getMonth()]}</span>
              <span className="sm:hidden">{months[date.getMonth()].slice(0, 3)}</span>
              <ChevronDown size={14} className="sm:w-4 sm:h-4" />
            </button>
            <button
              className="selector-btn"
              onClick={(e) => {
                e.stopPropagation();
                setShowYearPicker(!showYearPicker);
                setShowMonthPicker(false);
              }}
            >
              {date.getFullYear()}
              <ChevronDown size={14} className="sm:w-4 sm:h-4" />
            </button>
          </div>
          {showMonthPicker && (
            <div className="picker-dropdown month-picker" onClick={stop}>
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
          {showYearPicker && (
            <div className="picker-dropdown year-picker" onClick={stop}>
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
        <div className="toolbar-right">
          <button
            onClick={handleManageAvailability}
            className="availability-btn"
          >
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

      {/* Added responsive grid layout */}
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

        {/* Sidebar - Added responsive styling */}
        <div className="sidebar-section">
          {/* Google Meet Card - Added responsive text */}
          <div className="google-meet-card">
            <div className="card-header">
              <h3 className="text-xs sm:text-sm">Connect with upcoming patient</h3>
            </div>
            <div className="meet-link-container">
              <div className="meet-link-wrapper">
                <Video size={14} className="sm:w-4 sm:h-4 flex-shrink-0" color="#10b981" />
                <a
                  href="https://meet.google.com/y4x72A"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="meet-link text-xs break-all"
                >
                  https://meet.google.com/y4x72A
                </a>
              </div>
              <button
                className="copy-btn flex-shrink-0"
                onClick={() => copyToClipboard("https://meet.google.com/y4x72A")}
                title="Copy link"
              >
                <Copy size={14} className="sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>

          {/* Upcoming Appointments - Added responsive styling */}
          <div className="upcoming-card">
            <div className="card-header">
              <CalendarIcon size={16} className="sm:w-[18px] sm:h-[18px]" />
              <h3 className="text-xs sm:text-sm">Upcoming Appointments</h3>
            </div>

            <div className="upcoming-list">
              {upcomingAppointments.length === 0 ? (
                <div className="empty-state">
                  <Clock size={32} className="sm:w-10 sm:h-10 empty-icon" />
                  <p className="text-xs sm:text-sm">No upcoming appointments</p>
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
                    <div
                      className="patient-avatar"
                      style={{ background: appt.resource.color || "#3b82f6" }}
                    >
                      {getInitial(appt.title)}
                    </div>

                    <div className="appt-details min-w-0">
                      <div className="appt-patient">
                        <span className="patient-name text-xs">{appt.resource.patient}</span>
                        {appt.resource.type && (
                          <span className={`type-inline ${appt.resource.type?.toLowerCase()}`}>
                            {appt.resource.type}
                          </span>
                        )}
                      </div>

                      <div className="appt-time">
                        <Clock size={12} className="sm:w-[14px] sm:h-[14px]" />
                        <span className="text-xs">{format(appt.start, "h:mm a")}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {showAppointmentDetail && selectedEvent && (
        <AppointmentDetailModal
          isOpen={showAppointmentDetail}
          onClose={() => setShowAppointmentDetail(false)}
          event={selectedEvent}
          onUpdateColor={handleUpdateEventColor}
        />
      )}
    </div>
  );
};

export default Scheduler;