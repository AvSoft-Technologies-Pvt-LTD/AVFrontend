




import React, { useState, useEffect } from "react";
import { Bell, MessageCircle, ArrowLeft, Search, Filter, CheckCircle, Circle, Users, Calendar, FileText, Stethoscope, X, Clock, AlertTriangle, User, Phone, Mail, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const DoctorNotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await axios.get("https://67e631656530dbd3110f0322.mockapi.io/drnotifiy");
      const sorted = res.data
        .map((n) => ({
          ...n,
          createdAt: n.createdAt && !isNaN(new Date(n.createdAt)) ? n.createdAt : new Date().toISOString(),
          unread: n.unread ?? true,
          message: n.message || "New notification",
          type: n.type || "appointment",
          category: n.category || "general",
          priority: n.priority || "normal",
          patientName: n.name || "Unknown Patient",
          patientPhone: n.phone || "+1 (555) 123-4567",
          patientEmail: n.email || "patient@example.com",
          appointmentDate: n.appointmentDate || new Date().toISOString(),
          appointmentTime: n.appointmentTime || "10:00 AM",
          location: n.location || "Main Clinic - Room 101",
          description: n.description || "Additional details about this notification.",
        }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setNotifications(sorted);
      setFilteredNotifications(sorted);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    let filtered = notifications;

    if (searchTerm) {
      filtered = filtered.filter((n) =>
        n.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.patientName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== "all") {
      filtered = filtered.filter((n) =>
        filterType === "unread" ? n.unread : !n.unread
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((n) => n.category === categoryFilter);
    }

    setFilteredNotifications(filtered);
  }, [notifications, searchTerm, filterType, categoryFilter]);

  const getTimeAgo = (time) => {
    const date = new Date(time);
    if (isNaN(date)) return "Unknown time";
    const diff = (Date.now() - date.getTime()) / 1000;
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr${Math.floor(diff / 3600) > 1 ? "s" : ""} ago`;
    return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) > 1 ? "s" : ""} ago`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date)) return "Invalid date";
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date)) return "Invalid time";
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const openNotificationModal = (notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
    markAsRead(notification.id);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedNotification(null);
  };

  const markAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, unread: false } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default:
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  const getPriorityBadgeColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-500 text-white";
      case "medium":
        return "bg-yellow-500 text-white";
      default:
        return "bg-blue-500 text-white";
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "appointment":
        return <Calendar className="h-4 w-4" />;
      case "patient":
        return <Users className="h-4 w-4" />;
      case "report":
        return <FileText className="h-4 w-4" />;
      case "medical":
        return <Stethoscope className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "appointment", label: "Appointments" },
    { value: "patient", label: "Patients" },
    { value: "report", label: "Reports" },
    { value: "medical", label: "Medical" },
    { value: "general", label: "General" },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-color)]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-1.5 sm:p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Doctor Notifications</h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                  {unreadCount > 0 ? `${unreadCount} unread notifications` : "All caught up!"}
                </p>
              </div>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="hidden md:flex items-center gap-2 px-3 md:px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <CheckCircle className="h-4 w-4" />
                Mark all as read
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
        {/* Search and Filters */}
       <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
  <div className="flex flex-col sm:flex-row gap-4 items-center">
    {/* Search Bar */}
    <div className="relative flex-1 w-full sm:w-auto">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search notifications and patients..."
        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-sm sm:text-base"
      />
    </div>

    {/* Filter Buttons */}
    <div className="flex gap-2 w-full sm:w-auto">
      <button
        onClick={() => setFilterType("all")}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
          filterType === "all"
            ? "bg-[var(--primary-color)] text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        All
      </button>
      <button
        onClick={() => setFilterType("unread")}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
          filterType === "unread"
            ? "bg-[var(--primary-color)] text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        <Circle className="h-3 w-3" />
        Unread
      </button>
      <button
        onClick={() => setFilterType("read")}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
          filterType === "read"
            ? "bg-[var(--primary-color)] text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        <CheckCircle className="h-3 w-3" />
        Read
      </button>
    </div>
  </div>
</div>


        {/* Mark All Read Button - Mobile */}
        {unreadCount > 0 && (
          <div className="md:hidden mb-4">
            <button
              onClick={markAllAsRead}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[var(--primary-color)] text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <CheckCircle className="h-4 w-4" />
              Mark all as read
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="space-y-3 sm:space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-8 sm:p-12 text-center">
              <Bell className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 text-gray-300" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                {searchTerm || filterType !== "all" || categoryFilter !== "all" ? "No notifications found" : "No notifications yet"}
              </h3>
              <p className="text-sm sm:text-base text-gray-500">
                {searchTerm || filterType !== "all" || categoryFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "You'll see your notifications here"}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => openNotificationModal(notification)}
                className={`bg-white rounded-lg sm:rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-md ${
                  notification.unread
                    ? "border-l-4 border-l-[var(--primary-color)] border-gray-200 shadow-sm"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="p-4 sm:p-6">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className={`p-2 sm:p-3 rounded-full ${getPriorityColor(notification.priority)} flex-shrink-0`}>
                      {getCategoryIcon(notification.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-2 flex-wrap">
                        {notification.unread && (
                          <div className="w-2 h-2 bg-[var(--primary-color)] rounded-full flex-shrink-0" />
                        )}
                        <span className="text-xs text-gray-500 uppercase tracking-wide font-medium truncate">
                          {notification.category || "General"}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500 whitespace-nowrap">{getTimeAgo(notification.createdAt)}</span>
                        {notification.priority === "high" && (
                          <>
                            <span className="text-xs text-gray-400 hidden sm:inline">•</span>
                            <span className="text-xs font-medium text-red-600 hidden sm:inline">High Priority</span>
                          </>
                        )}
                        {notification.patientName && (
                          <>
                            <span className="text-xs text-gray-400 hidden sm:inline">•</span>
                            <span className="text-xs font-medium text-[var(--primary-color)] truncate max-w-[120px] sm:max-w-none">
                              {notification.patientName}
                            </span>
                          </>
                        )}
                      </div>
                      <p className="text-sm sm:text-base text-gray-900 font-medium leading-relaxed mb-2">
                        {notification.message}
                      </p>
                      {notification.description && (
                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-2">
                          {notification.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bottom Spacing for Mobile */}
        <div className="h-16 sm:h-20"></div>
      </div>

      {/* Notification Detail Modal */}
{isModalOpen && selectedNotification && (
  <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
    <div className="bg-white rounded-xl sm:rounded-2xl w-[90%] max-w-sm sm:max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
      {/* Modal Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-3 sm:px-4 py-3 sm:py-4 rounded-t-xl sm:rounded-t-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-bold text-gray-900">
            Notification Details
          </h2>
          <button
            onClick={closeModal}
            className="p-1.5 sm:p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0 ml-2"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
      </div>
      {/* Modal Content: Same as List Card */}
      <div className="p-4 sm:p-6">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className={`p-2 sm:p-3 rounded-full ${getPriorityColor(selectedNotification.priority)} flex-shrink-0`}>
            {getCategoryIcon(selectedNotification.category)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-2 flex-wrap">
              {selectedNotification.unread && (
                <div className="w-2 h-2 bg-[var(--primary-color)] rounded-full flex-shrink-0" />
              )}
              <span className="text-xs text-gray-500 uppercase tracking-wide font-medium truncate">
                {selectedNotification.category || "General"}
              </span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {getTimeAgo(selectedNotification.createdAt)}
              </span>
              {selectedNotification.priority === "high" && (
                <>
                  <span className="text-xs text-gray-400 hidden sm:inline">•</span>
                  <span className="text-xs font-medium text-red-600 hidden sm:inline">High Priority</span>
                </>
              )}
              {selectedNotification.patientName && (
                <>
                  <span className="text-xs text-gray-400 hidden sm:inline">•</span>
                  <span className="text-xs font-medium text-[var(--primary-color)] truncate max-w-[120px] sm:max-w-none">
                    {selectedNotification.patientName}
                  </span>
                </>
              )}
            </div>
            <p className="text-sm sm:text-base text-gray-900 font-medium leading-relaxed mb-2">
              {selectedNotification.message}
            </p>
            {selectedNotification.description && (
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {selectedNotification.description}
              </p>
            )}
          </div>
        </div>
      </div>
      {/* Additional Details (if needed) */}
     
    </div>
  </div>
)}



    </div>
  );
};

export default DoctorNotificationsPage;
