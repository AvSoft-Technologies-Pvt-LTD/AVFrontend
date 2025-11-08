import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, Edit3, Trash2, Plus } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getAllAvailabilitySchedules,
  deleteAvailabilitySchedule,
} from "../../../../../utils/CrudService";
import { apiDateToJSDate, apiDateToString } from "./dateUtils";
import "./scheduler.css";

const AvailabilityOverviewPage = () => {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    setLoading(true);
    try {
      const response = await getAllAvailabilitySchedules();
      setSchedules(response.data || []);
    } catch (error) {
      console.error("Error loading schedules:", error);
      toast.error("Failed to load schedules");
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (schedule) => {
    navigate(`/doctordashboard/scheduler/availability/edit/${schedule.id}`);
  };

  const handleDelete = async (scheduleId) => {
    if (window.confirm("Are you sure you want to delete this schedule?")) {
      try {
        await deleteAvailabilitySchedule(scheduleId);
        loadSchedules();
        toast.success("Schedule deleted successfully!");
      } catch (error) {
        console.error("Error deleting schedule:", error);
        toast.error("Failed to delete schedule");
      }
    }
  };

  const handleCreateNew = () => {
    navigate("/doctordashboard/scheduler/availability/create");
  };

  const formatDateRange = (fromDate, toDate) => {
    if (!fromDate || !toDate) return "No dates";

    const startDate = apiDateToJSDate(fromDate);
    const endDate = apiDateToJSDate(toDate);

    if (!startDate || !endDate) return "Invalid dates";

    return `${startDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })} - ${endDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}`;
  };

  // Helper: format unavailable dates from API ([y,m,d] arrays)
  const getUnavailableDates = (schedule) => {
    const src = Array.isArray(schedule.unavailableDates)
      ? schedule.unavailableDates
      : [];
    if (src.length === 0) return null;
    return src
      .map((apiDate) => apiDateToString(apiDate))
      .filter(Boolean)
      .map((dateStr) => new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }))
      .join(", ");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-4 sm:py-8 px-2 sm:px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-4 sm:py-8 px-2 sm:px-4">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6 p-4 sm:p-6 bg-white rounded-xl sm:rounded-2xl shadow-lg">
          <div className="w-full sm:w-auto">
            <h1 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">
              Availability Overview
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Manage your working schedules
            </p>
          </div>
          <button
            onClick={handleCreateNew}
            className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-[var(--primary-color)] text-white rounded-lg text-xs sm:text-sm w-full sm:w-auto whitespace-nowrap hover:opacity-90 transition-all"
          >
            <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />
            Create New Schedule
          </button>
        </div>

        {/* Schedules List */}
        {schedules.length === 0 ? (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-8 sm:p-12 text-center">
            <Calendar size={48} className="sm:w-16 sm:h-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
              No Schedules Found
            </h3>
            <p className="text-sm sm:text-base text-slate-600 mb-4 sm:mb-6">
              Create your first availability schedule to get started
            </p>
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-[var(--primary-color)] text-white rounded-lg text-xs sm:text-sm hover:opacity-90 transition-all"
            >
              <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />
              Create Schedule
            </button>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {schedules.map((schedule) => {
              const unavailableDates = getUnavailableDates(schedule);
              return (
                <div
                  key={schedule.id}
                  className="availability-card bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all"
                >
                  {/* Grid for Dates, Working Hours, and Duration */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-3 sm:mb-4">
                    {/* Dates */}
                    <div className="flex items-start gap-2 sm:gap-3">
                      <Calendar size={16} className="sm:w-[18px] sm:h-[18px] text-[var(--primary-color)] mt-1 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-500 uppercase">
                          Dates
                        </p>
                        <p className="text-xs sm:text-sm font-semibold text-slate-900">
                          {schedule.daySlots?.length || 0} day(s) selected
                        </p>
                        <p className="text-xs text-slate-500 mt-1 break-words">
                          {formatDateRange(schedule.fromDate, schedule.toDate)}
                        </p>
                        {unavailableDates && (
                          <p className="text-xs text-amber-600 mt-1 break-words">
                            Unavailable: {unavailableDates}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Working Hours */}
                    <div className="flex items-start gap-2 sm:gap-3">
                      <Clock size={16} className="sm:w-[18px] sm:h-[18px] text-emerald-600 mt-1 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-500 uppercase">
                          Working Hours
                        </p>
                        <p className="text-xs sm:text-sm font-semibold text-slate-900">
                          {schedule.startTime} - {schedule.endTime}
                        </p>
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="flex items-start gap-2 sm:gap-3">
                      <Clock size={16} className="sm:w-[18px] sm:h-[18px] text-purple-600 mt-1 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-500 uppercase">
                          Duration
                        </p>
                        <p className="text-xs sm:text-sm font-semibold text-slate-900">
                          {schedule.appointmentDuration?.durationMinutes} minutes
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {schedule.appointmentDuration?.displayName}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Edit/Delete Buttons and Total Slots */}
                  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                    <div className="flex gap-2 order-2 sm:order-1">
                      <button
                        onClick={() => handleEdit(schedule)}
                        className="flex-1 sm:flex-none p-2 bg-[color:rgba(14,22,48,0.08)] text-[var(--primary-color)] rounded-lg hover:bg-[color:rgba(14,22,48,0.14)] transition-all"
                        title="Edit Schedule"
                      >
                        <Edit3 size={16} className="sm:w-[18px] sm:h-[18px]" />
                      </button>
                      <button
                        onClick={() => handleDelete(schedule.id)}
                        className="flex-1 sm:flex-none p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all"
                        title="Delete Schedule"
                      >
                        <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                      </button>
                    </div>

                    {/* Total Slots */}
                    {schedule.totalSlots !== undefined && (
                      <div className="w-full sm:w-auto sm:flex-1 sm:max-w-xs p-2 sm:p-3 bg-slate-50 rounded-lg order-1 sm:order-2">
                        <p className="text-xs font-semibold text-slate-600">
                          Total Slots:{" "}
                          <span className="text-slate-900">
                            {schedule.totalSlots}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailabilityOverviewPage;
