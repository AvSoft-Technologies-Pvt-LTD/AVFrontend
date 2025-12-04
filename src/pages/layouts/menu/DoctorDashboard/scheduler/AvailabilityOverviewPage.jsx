import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Calendar, Clock, Edit3, Trash2, Plus, AlertCircle } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getAvailabilitySchedulesByDoctor,
  deleteAvailabilitySchedule,
} from "../../../../../utils/CrudService";
import { apiDateToJSDate, apiDateToString } from "./dateUtils";
import "./scheduler.css";

const AvailabilityOverviewPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const doctorId = user?.doctorId || user?.id;
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState(null);
  const [highlightedScheduleId, setHighlightedScheduleId] = useState(null);

  useEffect(() => {
    if (!doctorId) {
      setLoading(false);
      toast.error("Doctor ID not found. Please log in again.");
      return;
    }
    loadSchedules(doctorId);
  }, [doctorId]);

  const loadSchedules = async (currentDoctorId) => {
    setLoading(true);
    try {
      const response = await getAvailabilitySchedulesByDoctor(currentDoctorId);
      const sortedSchedules = (response.data || []).sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setSchedules(sortedSchedules);
      
      // Highlight the first schedule if it's new (created in the last 24 hours)
      if (sortedSchedules.length > 0) {
        const newestSchedule = sortedSchedules[0];
        const isNew = Date.now() - new Date(newestSchedule.createdAt).getTime() < 24 * 60 * 60 * 1000;
        if (isNew) {
          setHighlightedScheduleId(newestSchedule.id);
        }
      }
    } catch (error) {
      console.error("Error loading schedules:", error);
      toast.error("Failed to load schedules");
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-remove highlight after 3 seconds
  useEffect(() => {
    if (highlightedScheduleId) {
      const timer = setTimeout(() => {
        setHighlightedScheduleId(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [highlightedScheduleId]);

  const handleEdit = (schedule) => {
    navigate(`/doctordashboard/scheduler/availability/edit/${schedule.id}`);
  };

  const handleDelete = (scheduleId) => {
    if (!doctorId) {
      toast.error("Doctor ID not found. Please log in again.");
      return;
    }
    setScheduleToDelete(scheduleId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!doctorId || !scheduleToDelete) {
      setIsDeleteDialogOpen(false);
      return;
    }

    try {
      await deleteAvailabilitySchedule(scheduleToDelete);
      await loadSchedules(doctorId);
      toast.success("Schedule deleted successfully!");
    } catch (error) {
      console.error("Error deleting schedule:", error);
      const backendMsg = error?.response?.data?.error || error?.response?.data?.message || "";
      if (backendMsg.includes("violates foreign key constraint")) {
        toast.error("Cannot delete: this schedule has existing appointments.");
      } else {
        toast.error("Failed to delete schedule");
      }
    } finally {
      setIsDeleteDialogOpen(false);
      setScheduleToDelete(null);
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

    const formatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return `${startDate.toLocaleDateString("en-US", formatOptions)} - 
            ${endDate.toLocaleDateString("en-US", formatOptions)}`;
  };

  const getActiveDaysCount = (schedule) => {
    if (!schedule?.fromDate || !schedule?.toDate) return 0;
    const startDate = apiDateToJSDate(schedule.fromDate);
    const endDate = apiDateToJSDate(schedule.toDate);
    if (!startDate || !endDate) return 0;

    const msPerDay = 1000 * 60 * 60 * 24;
    const totalDays = Math.floor((endDate - startDate) / msPerDay) + 1;
    const unavailableCount = Array.isArray(schedule.unavailableDates) 
      ? schedule.unavailableDates.length 
      : 0;

    return Math.max(0, totalDays - unavailableCount);
  };

  const getUnavailableDates = (schedule) => {
    const src = Array.isArray(schedule.unavailableDates) ? schedule.unavailableDates : [];
    if (src.length === 0) return null;
    
    return src
      .map(apiDate => apiDateToString(apiDate))
      .filter(Boolean)
      .map(dateStr => new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }))
      .join(", ");
  };

  const renderScheduleCard = (schedule) => {
    const unavailableDates = getUnavailableDates(schedule);
    const activeDays = getActiveDaysCount(schedule);
    const isHighlighted = highlightedScheduleId === schedule.id;
    const isNew = Date.now() - new Date(schedule.createdAt).getTime() < 24 * 60 * 60 * 1000;

    return (
      <div
        key={schedule.id}
        className={`
          bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 
          transition-all duration-300 border-l-4
          ${
            isHighlighted 
              ? "border-blue-500 bg-blue-50 scale-[1.01] shadow-blue-100" 
              : "border-transparent hover:shadow-xl hover:border-blue-200"
          }
        `}
      >
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-gray-900">
                {formatDateRange(schedule.fromDate, schedule.toDate)}
              </h3>
              {isNew && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  New
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {activeDays} active days • {schedule.startTime} - {schedule.endTime}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleEdit(schedule)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Edit"
            >
              <Edit3 size={18} />
            </button>
            <button
              onClick={() => handleDelete(schedule.id)}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
  <div className="flex gap-3">
    <div className="p-2 bg-gray-50 rounded-lg min-w-[100px]">
      <p className="text-xs font-medium text-gray-500 mb-1">Duration</p>
      <p className="text-sm font-medium text-gray-900">
        {schedule.appointmentDuration?.durationMinutes || 0} min
      </p>
    </div>
    <div className="p-2 bg-gray-50 rounded-lg min-w-[100px]">
      <p className="text-xs font-medium text-gray-500 mb-1">Total Slots</p>
      <p className="text-sm font-medium text-gray-900">
        {schedule.totalSlots || 0}
      </p>
    </div>
  </div>
  {unavailableDates && (
    <div className="flex-1 min-w-0">
      <div className="p-2 bg-amber-50 rounded-lg h-full">
        <p className="text-xs font-medium text-amber-700 mb-1">Unavailable Dates</p>
        <p className="text-xs text-amber-700 line-clamp-1" title={unavailableDates}>
          {unavailableDates}
        </p>
      </div>
    </div>
  )}
</div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4 sm:px-6">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 p-6 bg-white rounded-xl shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Availability</h1>
            <p className="text-gray-500 mt-1">Manage your working schedules</p>
          </div>
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            <Plus size={18} />
            New Schedule
          </button>
        </div>

        {schedules.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No schedules found
            </h3>
            <p className="text-gray-500 mb-6">
              Create your first availability schedule to get started
            </p>
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
            >
              <Plus size={18} />
              Create Schedule
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {schedules.map(schedule => renderScheduleCard(schedule))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-red-500" />
                <h3 className="text-lg font-semibold text-gray-900">Delete Schedule</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this schedule? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setIsDeleteDialogOpen(false);
                    setScheduleToDelete(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg"
                >
                  Delete Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailabilityOverviewPage;