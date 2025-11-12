import React, { useState, useEffect } from "react";
import { Bell, MessageCircle, ArrowLeft, Search, Filter, CheckCircle, Circle, X, Clock, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  getPatientNotifications,
  getPatientUnreadNotificationCount,
  getLatestPatientNotifications,
  markPatientNotificationRead,
  markAllPatientNotificationsRead,
} from "../../../../utils/masterService";

const PatientNotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const { patientId } = useSelector((s) => s.auth || {});
  const navigate = useNavigate();

  // Normalize backend date representation to ISO string
  const normalizeDate = (val) => {
    try {
      if (Array.isArray(val) && val.length >= 6) {
        const [y, m, d, hh, mm, ss, nanos] = val;
        const ms = nanos ? Math.floor(nanos / 1e6) : 0;
        return new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, ss || 0, ms).toISOString();
      }
      if (typeof val === "string") return val;
    } catch (_) {}
    return new Date().toISOString();
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      if (!patientId) {
        setNotifications([]);
        setFilteredNotifications([]);
        setUnreadCount(0);
        setLoading(false);
        return;
      }
      const res = await getPatientNotifications({ patientId, page, size });
      console.log("Notifications fetch params:", { patientId, page, size });
      console.log("Notifications raw response:", res.data);
      const data = res.data ?? {};
      // Support multiple shapes: array at root, content at root, or data.content
      const items = Array.isArray(data)
        ? data
        : Array.isArray(data.content)
        ? data.content
        : Array.isArray(data.data?.content)
        ? data.data.content
        : [];
      const mapped = items.map((n) => {
        const t = (n.type || "").toString().toUpperCase();
        const title = (n.title || "").toString();
        const msg = (n.message || "").toString();
        const link = (n.link || "").toString();
        const isPaymentType = ["PAYMENT", "PAYMENT_DUE", "BILL", "BILLING", "INVOICE", "BOOKING_APPOINTMENT", "APPOINTMENT", "BOOKING", "PAY_NOW"]
          .some((k) => t.includes(k));
        const mentionsPayment = /pay\s?now|pay\b|payment|bill|invoice|booking|appointment/i.test(`${title} ${msg}`);
        const linkToPayment = /payment|pay-now|checkout/i.test(link);
        const isSuccess = /PAYMENT_SUCCESS|SUCCESS/i.test(t) || /payment\s+successful|success(ful)?/i.test(`${title} ${msg}`);
        const showPayButton = !isSuccess && (isPaymentType || mentionsPayment || linkToPayment);
        return ({
          id: n.notificationId,
          notificationId: n.notificationId,
          patientId: n.patientId,
          type: n.type || "general",
          title: n.title || "",
          message: n.message || "New notification",
          payload: n.payload,
          link: n.link,
          unread: !n.read,
          read: n.read,
          createdAt: normalizeDate(n.createdAt),
          priority: "normal",
          description: n.description,
          showPayButton,
        });
      });
      const sorted = mapped.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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
  }, [patientId, page, size]);

  const fetchUnread = async () => {
    if (!patientId) { setUnreadCount(0); return; }
    try {
      const res = await getPatientUnreadNotificationCount(patientId);
      setUnreadCount(Number(res.data) || 0);
    } catch (e) {
      console.error("Unread count error:", e);
    }
  };

  useEffect(() => {
    fetchUnread();
  }, [patientId]);

  useEffect(() => {
    let filtered = notifications;
    if (searchTerm) {
      filtered = filtered.filter((n) =>
        n.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterType !== "all") {
      filtered = filtered.filter((n) =>
        filterType === "unread" ? n.unread : !n.unread
      );
    }
    setFilteredNotifications(filtered);
  }, [notifications, searchTerm, filterType]);

  const getTimeAgo = (time) => {
    const date = new Date(time);
    if (isNaN(date)) return "Unknown time";
    const diff = (Date.now() - date.getTime()) / 1000;
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr${Math.floor(diff / 3600) > 1 ? "s" : ""} ago`;
    return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) > 1 ? "s" : ""} ago`;
  };

  const markAsRead = async (notificationId) => {
    try {
      if (patientId) {
        await markPatientNotificationRead(notificationId, patientId);
      }
      setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, unread: false, read: true } : n)));
      setFilteredNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, unread: false, read: true } : n)));
      fetchUnread();
    } catch (e) {
      console.error("Mark as read error:", e);
    }
  };

  const markAllAsRead = async () => {
    try {
      if (patientId) {
        await markAllPatientNotificationsRead(patientId);
      }
      setNotifications((prev) => prev.map((n) => ({ ...n, unread: false, read: true })));
      setFilteredNotifications((prev) => prev.map((n) => ({ ...n, unread: false, read: true })));
      fetchUnread();
    } catch (e) {
      console.error("Mark all as read error:", e);
    }
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

  const getTypeIcon = (type) => {
    switch (type) {
      case "appointment":
        return <Bell className="h-4 w-4" />;
      case "message":
        return <MessageCircle className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const openNotificationModal = (notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
    if (notification.unread) {
      markAsRead(notification.id);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedNotification(null);
  };

  // unreadCount from API is shown in header/buttons

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
           <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-col sm:flex-row">
  {/* Back Button */}
  <button
    onClick={() => navigate(-1)}
    className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors self-start sm:self-auto"
  >
    <ArrowLeft className="h-5 w-5" />
  </button>

  {/* Title + Subtitle */}
  <div className="flex flex-col">
    <h1 className="text-lg sm:text-2xl font-bold text-gray-900 leading-tight">
      Messages & Notifications
    </h1>
    <p className="text-sm text-gray-600">
      {unreadCount > 0 ? `${unreadCount} unread messages` : "All caught up!"}
    </p>
  </div>
</div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <CheckCircle className="h-4 w-4" />
                Mark all as read
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search and Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search messages..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterType("all")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === "all"
                    ? "bg-[var(--primary-color)] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType("unread")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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
          <div className="sm:hidden mb-4">
            <button
              onClick={markAllAsRead}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[var(--primary-color)] text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <CheckCircle className="h-4 w-4" />
              Mark all as read
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchTerm || filterType !== "all" ? "No messages found" : "No messages yet"}
              </h3>
              <p className="text-gray-500">
                {searchTerm || filterType !== "all"
                  ? "Try adjusting your search or filters"
                  : "You'll see your messages and notifications here"}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => openNotificationModal(notification)}
                className={`bg-white rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-md ${
                  notification.unread
                    ? "border-l-4 border-l-[var(--primary-color)] border-gray-200 shadow-sm"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start gap-2">
                    <div className={`p-2 rounded-full ${getPriorityColor(notification.priority)}`}>
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                    
                      <div className="flex items-center gap-1 md:gap-2 mb-2">
  {notification.unread && (
    <div className="w-2 h-2 bg-[var(--primary-color)] rounded-full flex-shrink-0" />
  )}
  <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">
    {notification.type || "General"}
  </span>
  <span className="text-xs text-gray-400">•</span>
  <span className="text-xs text-gray-500">{getTimeAgo(notification.createdAt)}</span>
  {notification.priority === "high" && (
    <>
      <span className="text-xs text-gray-400">•</span>
      <span className="text-xs font-medium text-red-600">High Priority</span>
    </>
  )}
  {notification.showPayButton && (
     <button
    onClick={(e) => {
      e.stopPropagation();
      navigate("/patientdashboard/payment");
    }}
    className="ml-auto bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white text-xs font-semibold px-3 py-1 rounded-full transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
  >
    Pay Now
  </button>
  )}
</div>

                      <p className="text-gray-900 font-medium leading-relaxed mb-2">
                        {notification.message}
                      </p>
                      {notification.description && (
                        <p className="text-sm text-gray-600 leading-relaxed">
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
        <div className="h-20"></div>
      </div>

      {/* Notification Detail Modal */}
   {isModalOpen && selectedNotification && (
  <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
    {/* Modal Container */}
    <div className="bg-white rounded-xl sm:rounded-2xl w-full sm:w-[90%] sm:max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-y-auto
      sm:relative sm:my-auto sm:mx-auto sm:static fixed sm:bottom-auto sm:left-auto sm:right-auto">
      
      {/* Modal Header (Sticky) */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4 rounded-t-xl sm:rounded-t-2xl flex items-center justify-between">
        <h2 className="text-sm sm:text-base font-bold text-gray-900">
          Notification Details
        </h2>
        <button
          onClick={closeModal}
          className="p-1.5 sm:p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0"
        >
          <X className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </div>

      {/* Modal Content */}
      <div className="p-4 sm:p-6">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className={`p-2 sm:p-3 rounded-full ${getPriorityColor(selectedNotification.priority)} flex-shrink-0`}>
            {getTypeIcon(selectedNotification.type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-2 flex-wrap">
              {selectedNotification.unread && (
                <div className="w-2 h-2 bg-[var(--primary-color)] rounded-full flex-shrink-0" />
              )}
              <span className="text-xs text-gray-500 uppercase tracking-wide font-medium truncate">
                {selectedNotification.type || "General"}
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

        {/* Pay Now Button (if applicable) */}
        {selectedNotification.showPayButton && (
          <div className="mt-4">
            <div className="flex w-full">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/patientdashboard/payment");
                }}
                className="ml-auto bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white text-xs font-semibold px-3 py-1 rounded-full transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
              >
                Pay Now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default PatientNotificationsPage;
