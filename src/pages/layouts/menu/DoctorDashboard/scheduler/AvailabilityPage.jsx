import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Clock,
  ChevronRight,
  ChevronLeft,
  Save,
} from "lucide-react";
import { toast } from "react-toastify";
import "./scheduler.css";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const AvailabilityPage = () => {
  const navigate = useNavigate();
  const { scheduleId } = useParams();
  const isEditMode = !!scheduleId;

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDates, setSelectedDates] = useState([]);
  const [deselectedDates, setDeselectedDates] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [duration, setDuration] = useState(30);
  const [generatedSlots, setGeneratedSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const savedData = localStorage.getItem("doctorAvailabilitySchedules");
      if (savedData) {
        const schedules = JSON.parse(savedData);
        const schedule = schedules.find(s => s.id === scheduleId);
        
        if (schedule) {
          setSelectedDates(schedule.selectedDates || []);
          setDeselectedDates(schedule.deselectedDates || []);
          setStartTime(schedule.startTime || "09:00");
          setEndTime(schedule.endTime || "17:00");
          setDuration(schedule.duration || 30);
          
          if (schedule.selectedDates && schedule.selectedDates.length > 0) {
            const sorted = [...schedule.selectedDates].sort((a, b) => new Date(a) - new Date(b));
            setStartDate(sorted[0]);
            setEndDate(sorted[sorted.length - 1]);
            
            const first = new Date(sorted[0]);
            setSelectedMonth(first.getMonth());
            setSelectedYear(first.getFullYear());
          }
        }
      }
    }
  }, [isEditMode, scheduleId]);

  // Auto-regenerate slots in step 2 when duration changes
  useEffect(() => {
    if (currentStep === 2 && selectedDates.length > 0) {
      const slots = generateSlotsArray();
      setGeneratedSlots(slots);
    }
  }, [duration, currentStep]);

  const toggleDate = (date) => {
    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(
      2,
      "0"
    )}-${String(date).padStart(2, "0")}`;

    if (selectedDates.includes(dateStr)) {
      // toggle deselected state for already selected date
      if (deselectedDates.includes(dateStr)) {
        setDeselectedDates((prev) => prev.filter((d) => d !== dateStr));
      } else {
        setDeselectedDates((prev) => [...prev, dateStr]);
      }
      return;
    }

    // start a new selection or finish range
    if (!startDate || (startDate && endDate)) {
      setStartDate(dateStr);
      setEndDate(null);
      setSelectedDates([dateStr]);
      setDeselectedDates([]);
    } else if (startDate && !endDate) {
      setEndDate(dateStr);
      const start = new Date(startDate);
      const current = new Date(dateStr);
      const isBefore = current < start;
      const newStart = isBefore ? dateStr : startDate;
      const newEnd = isBefore ? startDate : dateStr;

      setStartDate(newStart);
      setEndDate(newEnd);

      const allDates = [];
      const startDateObj = new Date(newStart);
      const endDateObj = new Date(newEnd);

      for (
        let d = new Date(startDateObj);
        d <= endDateObj;
        d.setDate(d.getDate() + 1)
      ) {
        const dateInRange = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
          2,
          "0"
        )}-${String(d.getDate()).padStart(2, "0")}`;
        allDates.push(dateInRange);
      }

      setSelectedDates(allDates);
      setDeselectedDates([]);
    }
  };

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const formatTimeWithAMPM = (hours, minutes) => {
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
  };

  const generateSlotsArray = () => {
    const slots = [];
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;

    const activeDates = selectedDates.filter((d) => !deselectedDates.includes(d));

    activeDates.forEach((dateStr) => {
      const date = new Date(dateStr);
      const dayName = DAYS[date.getDay() === 0 ? 6 : date.getDay() - 1];
      let currentMinutes = startTotalMinutes;

      while (currentMinutes < endTotalMinutes) {
        const hours = Math.floor(currentMinutes / 60);
        const minutes = currentMinutes % 60;
        const timeStr = formatTimeWithAMPM(hours, minutes);
        slots.push({
          day: dayName,
          time: timeStr,
          date: dateStr,
          sortTime: currentMinutes,
        });
        currentMinutes += duration;
      }
    });
    return slots;
  };

  const generateSlots = () => {
    const activeDates = selectedDates.filter((d) => !deselectedDates.includes(d));

    if (activeDates.length === 0) {
      toast.error("Please select at least one active date");
      return;
    }

    const slots = generateSlotsArray();
    setGeneratedSlots(slots);
    setCurrentStep(2);
  };

  const handleSave = () => {
    const activeDates = selectedDates.filter((d) => !deselectedDates.includes(d));
    if (activeDates.length === 0) {
      toast.error("No active dates to save");
      return;
    }
    
    setLoading(true);
    setTimeout(() => {
      // Load existing schedules
      const savedData = localStorage.getItem("doctorAvailabilitySchedules");
      let schedules = savedData ? JSON.parse(savedData) : [];

      const scheduleData = {
        id: isEditMode ? scheduleId : `schedule-${Date.now()}`,
        selectedDates: activeDates,
        deselectedDates,
        startTime,
        endTime,
        duration,
        generatedSlots,
        savedAt: new Date().toISOString(),
      };

      if (isEditMode) {
        // Update existing schedule
        schedules = schedules.map(s => s.id === scheduleId ? scheduleData : s);
      } else {
        // Add new schedule
        schedules.push(scheduleData);
      }

      localStorage.setItem("doctorAvailabilitySchedules", JSON.stringify(schedules));
      toast.success(
        isEditMode ? "Availability updated successfully!" : "Availability saved successfully!"
      );
      setLoading(false);
      navigate("/doctordashboard/scheduler/availability");
    }, 1000);
  };

  const goBack = () => {
    setCurrentStep(1);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
    const blanks = Array(adjustedFirstDay).fill(null);
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const allCells = [...blanks, ...daysArray];

    return (
      <div className="calendar-grid">
        <div className="calendar-weekdays">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <div key={day} className="calendar-weekday">
              {day}
            </div>
          ))}
        </div>
        <div className="calendar-dates">
          {allCells.map((date, index) => {
            if (date === null) {
              return <div key={`blank-${index}`} className="calendar-date blank"></div>;
            }

            const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(
              2,
              "0"
            )}-${String(date).padStart(2, "0")}`;
            const isSelected = selectedDates.includes(dateStr);
            const isDeselected = deselectedDates.includes(dateStr);
            const isStartDate = startDate === dateStr;
            const isEndDate = endDate === dateStr;
            const isInRange =
              startDate &&
              endDate &&
              new Date(dateStr) >= new Date(startDate) &&
              new Date(dateStr) <= new Date(endDate);

            return (
              <button
                key={date}
                onClick={() => toggleDate(date)}
                className={`
                  calendar-date
                  ${isSelected && !isDeselected ? "selected" : ""}
                  ${isDeselected ? "deselected" : ""}
                  ${isStartDate && !isDeselected ? "start-date" : ""}
                  ${isEndDate && !isDeselected ? "end-date" : ""}
                  ${isInRange && !isDeselected ? "in-range" : ""}
                `}
              >
                {date}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const activeDatesCount = selectedDates.filter((d) => !deselectedDates.includes(d)).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-4 sm:py-8 px-2 sm:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header - Added responsive text sizing */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6 p-4 sm:p-6 bg-white rounded-xl sm:rounded-2xl shadow-lg">
          <div>
            <h1 className="text-base sm:text-lg md:text-xl font-bold text-slate-900">
              {isEditMode ? "Update Availability" : "Create Availability"}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Configure your working hours and schedule
            </p>
          </div>
        </div>

        {/* Stepper - Added responsive layout */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-8 mt-4 sm:mt-6">
          <div className="flex items-center justify-center mb-6 sm:mb-8">
            <div className="flex items-center gap-3 sm:gap-4">
              <div
                className={`flex flex-col items-center gap-1 sm:gap-2 ${
                  currentStep >= 1 ? "text-blue-600" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-base sm:text-lg transition-all duration-300 ${
                    currentStep >= 1
                      ? "bg-blue-600 text-white shadow-lg scale-110"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  1
                </div>
                <span className="text-xs sm:text-sm font-semibold text-center">Schedule</span>
              </div>
              <div className={`w-16 sm:w-24 h-1 rounded transition-all duration-500 ${currentStep >= 2 ? "bg-blue-600" : "bg-gray-200"}`}></div>
              <div
                className={`flex flex-col items-center gap-1 sm:gap-2 ${
                  currentStep >= 2 ? "text-blue-600" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-base sm:text-lg transition-all duration-300 ${
                    currentStep >= 2
                      ? "bg-blue-600 text-white shadow-lg scale-110"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  2
                </div>
                <span className="text-xs sm:text-sm font-semibold text-center">Preview & Save</span>
              </div>
            </div>
          </div>

          {currentStep === 1 ? (
            <div className="space-y-6 sm:space-y-8">
              {/* Step 1 Content - Added responsive grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
                {/* Calendar Section */}
                <div className="bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200">
                  <label className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wide mb-3 block">
                    Select Specific Dates
                  </label>
                  <div className="bg-white p-3 sm:p-4 rounded-lg border border-slate-200">
                    {/* Month/Year Navigation - Added responsive buttons */}
                    <div className="flex items-center justify-between mb-3 bg-slate-50 p-2 sm:p-3 rounded-lg">
                      <button
                        onClick={() => setSelectedMonth((prev) => (prev === 0 ? 11 : prev - 1))}
                        className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <ChevronLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
                      </button>
                      <div className="font-bold text-sm sm:text-base text-slate-800">
                        {MONTHS[selectedMonth]} {selectedYear}
                      </div>
                      <button
                        onClick={() => setSelectedMonth((prev) => (prev === 11 ? 0 : prev + 1))}
                        className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <ChevronRight size={16} className="sm:w-[18px] sm:h-[18px]" />
                      </button>
                    </div>

                    {renderCalendar()}

                    {activeDatesCount > 0 && (
                      <div className="mt-3 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-center text-xs">
                        <span className="text-emerald-800 font-semibold">
                          {activeDatesCount} day(s) selected
                        </span>
                        {deselectedDates.length > 0 && (
                          <span className="text-amber-700 ml-2">({deselectedDates.length} unavailable)</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Working Hours Section - Added responsive inputs */}
                <div className="bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200">
                  <label className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wide mb-3 block">
                    Working Hours
                  </label>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 mb-2 block">Start Time</label>
                      <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 border-2 border-slate-200 rounded-lg bg-white hover:border-emerald-400 transition-colors">
                        <Clock size={16} className="sm:w-[18px] sm:h-[18px] text-slate-400 flex-shrink-0" />
                        <input
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="flex-1 outline-none font-semibold text-slate-800 text-sm min-w-0"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-600 mb-2 block">End Time</label>
                      <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 border-2 border-slate-200 rounded-lg bg-white hover:border-emerald-400 transition-colors">
                        <Clock size={16} className="sm:w-[18px] sm:h-[18px] text-slate-400 flex-shrink-0" />
                        <input
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className="flex-1 outline-none font-semibold text-slate-800 text-sm min-w-0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 sm:space-y-8">
              {/* Step 2 Content - Added responsive duration buttons */}
              <div>
                <label className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wide mb-3 sm:mb-4 block">
                  Appointment Duration (minutes)
                </label>
                <div className="flex gap-2 sm:gap-3 flex-wrap">
                  {[5, 10, 15, 20, 25, 30, 40].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => setDuration(mins)}
                      className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl border-2 font-semibold text-xs sm:text-sm transition-all duration-200 ${
                        duration === mins
                          ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-emerald-600 shadow-lg scale-105"
                          : "bg-white border-slate-200 text-slate-600 hover:border-emerald-400 hover:bg-emerald-50"
                      }`}
                    >
                      {mins} min
                    </button>
                  ))}
                </div>
              </div>

              {/* Slots Preview - Added responsive layout */}
              <div>
                <label className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wide mb-3 sm:mb-4 block">
                  Generated Slots Preview ({generatedSlots.length} slots)
                </label>
                <div className="bg-slate-50 p-4 sm:p-6 rounded-xl border border-slate-200 max-h-64 sm:max-h-96 overflow-y-auto">
                  {[...new Set(generatedSlots.map((s) => s.date))].map((date) => {
                    const dateObj = new Date(date);
                    const dayName = DAYS[dateObj.getDay() === 0 ? 6 : dateObj.getDay() - 1];
                    const dateSlots = generatedSlots.filter((s) => s.date === date);
                    return (
                      <div key={date} className="mb-4 sm:mb-6 last:mb-0">
                        <h4 className="font-bold text-xs sm:text-sm text-slate-800 mb-2 sm:mb-3">
                          {dayName} -{" "}
                          {dateObj.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {dateSlots
                            .sort((a, b) => a.sortTime - b.sortTime)
                            .map((slot, idx) => (
                              <div
                                key={idx}
                                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm font-semibold text-slate-700"
                              >
                                {slot.time}
                              </div>
                            ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Footer Buttons - Added responsive layout */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-4 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-200">
            {currentStep === 2 && (
              <button
                onClick={goBack}
                className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all font-semibold text-sm"
              >
                <ChevronLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
                Back
              </button>
            )}

            {currentStep === 1 ? (
              <button
                onClick={generateSlots}
                disabled={activeDatesCount === 0}
                className="flex items-center justify-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 flex items-center justify-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl font-semibold text-sm disabled:opacity-50"
              >
                Next
                <ChevronRight size={16} className="sm:w-[18px] sm:h-[18px]" />
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl font-semibold text-sm disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} className="sm:w-[18px] sm:h-[18px]" />
                    {isEditMode ? "Update & Save" : "Confirm & Save"}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityPage;