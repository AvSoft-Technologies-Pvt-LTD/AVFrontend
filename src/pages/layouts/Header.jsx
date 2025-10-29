import React, { useState, useEffect } from "react";
import {
  Bell,
  Pill,
  Menu,
  X,
  FileText,
  Ambulance,
  MoreHorizontal,
  ArrowLeft,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import ModulesMenu from "../../components/microcomponents/ModulesMenu";
import logo from "../../assets/logo.png";

const HeaderWithNotifications = ({ toggleSidebar, currentPageName }) => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileHeaderOpen, setIsMobileHeaderOpen] = useState(false);
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth?.user);

  const getRoleConfig = (userType) => {
    const configs = {
      patient: {
        displayName: "Patient",
        primaryColor: "var(--primary-color)",
        accentColor: "var(--accent-color)",
      },
      doctor: {
        displayName: "Doctor",
        primaryColor: "var(--primary-color)",
        accentColor: "var(--accent-color)",
      },
      freelancer: {
        displayName: "Freelancer Doctor",
        primaryColor: "var(--primary-color)",
        accentColor: "var(--accent-color)",
      },
      hospital: {
        displayName: "Hospital Admin",
        primaryColor: "var(--primary-color)",
        accentColor: "var(--accent-color)",
      },
      lab: {
        displayName: "Lab Technician",
        primaryColor: "var(--primary-color)",
        accentColor: "var(--accent-color)",
      },
      superadmin: {
        displayName: "Super Admin",
        primaryColor: "var(--primary-color)",
        accentColor: "var(--accent-color)",
      },
    };
    return configs[userType?.toLowerCase()] || configs.patient;
  };

  const getUserDisplayName = (user) => {
    if (!user) return "User";
    const userType = user.role?.toLowerCase();
    switch (userType) {
      case "doctor":
      case "freelancer":
        return `Dr. ${user.firstName || user.email?.split("@")[0] || "Doctor"}`;
      case "hospital":
        return (
          user.hospitalName || user.email?.split("@")[0] || "Hospital Admin"
        );
      case "lab":
        return user.labName || user.email?.split("@")[0] || "Lab Admin";
      case "superadmin":
        return (
          user.SuperadminName || user.email?.split("@")[0] || "Super Admin"
        );
      case "patient":
        return `${user.firstName || user.email?.split("@")[0] || "Patient"}`;
      default:
        return user.email?.split("@")[0] || "User";
    }
  };

  const getUserInitials = (user) => {
    if (!user) return "U";
    if (user.firstName) return user.firstName.charAt(0).toUpperCase();
    if (user.hospitalName) return user.hospitalName.charAt(0).toUpperCase();
    if (user.centerName) return user.centerName.charAt(0).toUpperCase();
    if (user.labName) return user.labName.charAt(0).toUpperCase();
    if (user.name) return user.name.charAt(0).toUpperCase();
    return "U";
  };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(
        "https://67e631656530dbd3110f0322.mockapi.io/drnotifiy"
      );
      const sorted = res.data
        .map((n) => ({
          ...n,
          createdAt:
            n.createdAt && !isNaN(new Date(n.createdAt))
              ? n.createdAt
              : new Date().toISOString(),
          unread: n.unread ?? true,
          message: n.message || "New notification",
        }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setNotifications(sorted);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const unreadCount = notifications.filter((n) => n.unread).length;
  const displayNotifications = notifications.slice(0, 2);

  const getTimeAgo = (time) => {
    const date = new Date(time);
    if (isNaN(date)) return "Unknown time";
    const diff = (Date.now() - date.getTime()) / 1000;
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400)
      return `${Math.floor(diff / 3600)} hr${
        Math.floor(diff / 3600) > 1 ? "s" : ""
      } ago`;
    return `${Math.floor(diff / 86400)} day${
      Math.floor(diff / 86400) > 1 ? "s" : ""
    } ago`;
  };

  const toggleMobileHeader = () => {
    setIsMobileHeaderOpen(!isMobileHeaderOpen);
  };

  const closeMobileHeader = () => {
    setIsMobileHeaderOpen(false);
  };

  const handleNotificationClick = () => {
    const userType = user?.userType?.toLowerCase();
    const notificationRoutes = {
      patient: "/patientdashboard/notifications",
      doctor: "/doctordashboard/notifications",
      freelancer: "/doctordashboard/notifications",
      hospital: "/hospitaldashboard/notifications",
      lab: "/labdashboard/notifications",
      superadmin: "/superadmindashboard/notifications",
    };
    const route = notificationRoutes[userType];
    if (route) {
      navigate(route);
    }
  };

  const handleViewAllClick = () => {
    setShowNotifications(false);
    handleNotificationClick();
  };

  const handleModuleSelect = () => {
    closeMobileHeader();
  };

  if (!user) {
    return null;
  }

  const userDisplayName = getUserDisplayName(user);
  const userInitials = getUserInitials(user);
  const userType = user.userType?.toLowerCase();
  const roleConfig = getRoleConfig(userType);

  return (
    <>
      {/* Main Header */}
      <nav className="sticky bg-white rounded-3xl shadow-lg top-0 mt-2 z-30 py-2 mx-2 sm:mx-4 border border-gray-100">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12 sm:h-16">
            {/* Left Side - Mobile & Tablet Menu Button */}
            <div className="flex items-center gap-3 xl:hidden">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
            {/* Center - Logo/Brand on Mobile & Tablet, User Name and Current Page on Desktop */}
            <div className="flex items-center gap-3">
              {/* Mobile & Tablet - DigiHealth Brand */}
              <div className="xl:hidden flex items-center gap-2">
                <img
                  src={logo}
                  alt="DigiHealth Logo"
                  className="h-8 w-8 sm:h-10 sm:w-10"
                />
                <span className="text-[var(--primary-color)] font-bold text-lg sm:text-xl">
                  DigiHealth
                </span>
              </div>
              {/* Desktop - User Name and Current Page */}
              <div className="hidden xl:block">
                <div className="flex items-center gap-3">
                  {/* Back Button */}
                  <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    title="Go Back"
                  >
                    <ArrowLeft className="h-5 w-5 text-gray-700" />
                  </button>

                  <div>
                    <p className="text-[var(--primary-color)] font-bold text-lg">
                      {currentPageName}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* Right Side - Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Desktop Actions */}
              <div className="hidden xl:flex items-center gap-2 sm:gap-4 text-[#021630]">
                {userType === "patient" ? (
                  <>
                    <button
                      onClick={() => navigate("/patientdashboard/pharmacy")}
                      title="Pharmacy"
                      className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[var(--primary-color)] hover:bg-[var(--accent-color)] transition-all duration-300 group shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <Pill className="h-5 w-5 sm:h-6 sm:w-6 text-white transition-all duration-300 group-hover:text-white" />
                    </button>
                    <button
                      onClick={() => navigate("/patientdashboard/ambulance")}
                      title="Ambulance"
                      className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-500 hover:bg-red-600 transition-all duration-300 group shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <Ambulance className="h-5 w-5 sm:h-6 sm:w-6 text-white transition-all duration-300 group-hover:text-white" />
                    </button>
                    <div className="relative">
                      <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[var(--primary-color)] hover:bg-[var(--accent-color)] transition-all duration-300 group shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-white transition-all duration-300 group-hover:text-white" />
                        {unreadCount > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-red-500 text-white w-5 h-5 sm:w-6 sm:h-6 text-xs rounded-full flex items-center justify-center animate-pulse font-semibold">
                            {unreadCount}
                          </span>
                        )}
                      </button>
                      {showNotifications && (
                        <div className="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-[80vh] overflow-y-auto z-50">
                          <div className="sticky top-0 bg-[var(--primary-color)] px-6 py-4 border-b flex justify-between items-center rounded-t-2xl">
                            <h3 className="text-lg font-bold text-white">
                              Notifications
                            </h3>
                            <button
                              onClick={handleViewAllClick}
                              className="text-sm font-medium text-[var(--accent-color)] hover:underline transition-colors"
                            >
                              View All
                            </button>
                          </div>
                          {displayNotifications.length === 0 ? (
                            <div className="px-6 py-8 text-center text-gray-500 text-sm">
                              <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                              <p className="font-medium">
                                You're all caught up! 🎉
                              </p>
                            </div>
                          ) : (
                            displayNotifications.map((n) => (
                              <div
                                key={n.id}
                                onClick={() =>
                                  setNotifications((prev) =>
                                    prev.map((notif) =>
                                      notif.id === n.id
                                        ? { ...notif, unread: false }
                                        : notif
                                    )
                                  )
                                }
                                className={`group px-6 py-4 border-b cursor-pointer transition-all duration-200 ${
                                  n.unread
                                    ? "bg-[var(--accent-color)]/10"
                                    : "bg-white"
                                } hover:bg-[var(--accent-color)]/20`}
                              >
                                <div className="flex justify-between gap-3">
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900 leading-relaxed">
                                      {n.message}
                                    </p>
                                    <span className="text-xs text-gray-500 block mt-1">
                                      {getTimeAgo(n.createdAt)}
                                    </span>
                                  </div>
                                  {n.unread && (
                                    <div className="w-2 h-2 mt-1 bg-[var(--accent-color)] rounded-full group-hover:opacity-80 flex-shrink-0" />
                                  )}
                                </div>
                                {n.showPayButton && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      console.log("Pay now clicked for", n.id);
                                    }}
                                    className="mt-3 bg-[var(--accent-color)] hover:bg-yellow-400 text-[var(--primary-color)] text-xs font-semibold px-4 py-2 rounded-full transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                                  >
                                    Pay Now
                                  </button>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  ["doctor", "hospital", "freelancer", "lab"].includes(
                    userType
                  ) && (
                    <>
                      <button
                        className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[var(--primary-color)] hover:bg-[var(--accent-color)] transition-all duration-300 group shadow-lg hover:shadow-xl transform hover:scale-105"
                        onClick={() => {
                          const specialization =
                            localStorage.getItem("selectedSpecialization") ||
                            "General Physician";
                          const dashboardPrefix =
                            {
                              doctor: "doctordashboard",
                              hospital: "hospitaldashboard",
                              freelancer: "doctordashboard",
                              lab: "labdashboard",
                            }[userType] || "";
                          navigate(`/${dashboardPrefix}/specialization`, {
                            state: { specialization, uploadedFiles: [] },
                          });
                        }}
                      >
                        <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-white transition-all duration-300 group-hover:text-white" />
                      </button>
                      {["doctor", "hospital", "freelancer"].includes(
                        userType
                      ) && (
                        <ModulesMenu
                          user={user}
                          onModuleSelect={handleModuleSelect}
                        />
                      )}
                      <div className="relative">
                        <button
                          onClick={() =>
                            setShowNotifications(!showNotifications)
                          }
                          className="relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[var(--primary-color)] hover:bg-[var(--accent-color)] transition-all duration-300 group shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-white transition-all duration-300 group-hover:text-white" />
                          {unreadCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-red-500 text-white w-5 h-5 sm:w-6 sm:h-6 text-xs rounded-full flex items-center justify-center animate-pulse font-semibold">
                              {unreadCount}
                            </span>
                          )}
                        </button>
                        {showNotifications && (
                          <div className="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-[80vh] overflow-y-auto z-50">
                            <div className="sticky top-0 bg-[var(--primary-color)] px-6 py-4 border-b flex justify-between items-center rounded-t-2xl">
                              <h3 className="text-lg font-bold text-white">
                                Notifications
                              </h3>
                              <button
                                onClick={handleViewAllClick}
                                className="text-sm font-medium text-[var(--accent-color)] hover:underline transition-colors"
                              >
                                View All
                              </button>
                            </div>
                            {displayNotifications.length === 0 ? (
                              <div className="px-6 py-8 text-center text-gray-500 text-sm">
                                <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                <p className="font-medium">
                                  You're all caught up! 🎉
                                </p>
                              </div>
                            ) : (
                              displayNotifications.map((n) => (
                                <div
                                  key={n.id}
                                  onClick={() =>
                                    setNotifications((prev) =>
                                      prev.map((notif) =>
                                        notif.id === n.id
                                          ? { ...notif, unread: false }
                                          : notif
                                      )
                                    )
                                  }
                                  className={`group px-6 py-4 border-b cursor-pointer transition-all duration-200 ${
                                    n.unread
                                      ? "bg-[var(--accent-color)]/10"
                                      : "bg-white"
                                  } hover:bg-[var(--accent-color)]/20`}
                                >
                                  <div className="flex justify-between gap-3">
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-gray-900 leading-relaxed">
                                        {n.message}
                                      </p>
                                      <span className="text-xs text-gray-500 block mt-1">
                                        {getTimeAgo(n.createdAt)}
                                      </span>
                                    </div>
                                    {n.unread && (
                                      <div className="w-2 h-2 mt-1 bg-[var(--accent-color)] rounded-full group-hover:opacity-80 flex-shrink-0" />
                                    )}
                                  </div>
                                  {n.showPayButton && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        console.log(
                                          "Pay now clicked for",
                                          n.id
                                        );
                                      }}
                                      className="mt-3 bg-[var(--accent-color)] hover:bg-yellow-400 text-[var(--primary-color)] text-xs font-semibold px-4 py-2 rounded-full transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                                    >
                                      Pay Now
                                    </button>
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    </>
                  )
                )}
              </div>
              {/* Mobile & Tablet Header Toggle Button */}
              <div className="xl:hidden">
                <button
                  onClick={toggleMobileHeader}
                  className="relative flex items-center justify-center w-10 h-10 rounded-full bg-[var(--primary-color)] hover:bg-[var(--accent-color)] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <MoreHorizontal className="h-5 w-5 text-white" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white w-5 h-5 text-xs rounded-full flex items-center justify-center animate-pulse font-semibold">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Header Backdrop */}
      {isMobileHeaderOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm xl:hidden"
          onClick={closeMobileHeader}
        />
      )}

      {/* Mobile & Tablet Header Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50 xl:hidden transform transition-transform duration-300 ease-in-out ${
          isMobileHeaderOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div
          className="px-6 py-4 flex justify-between items-center"
          style={{ backgroundColor: roleConfig.primaryColor }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 flex items-center justify-center rounded-full text-lg font-bold text-white"
              style={{ backgroundColor: roleConfig.accentColor }}
            >
              {userInitials}
            </div>
            <div>
              <h3 className="text-white font-semibold text-base">
                {userDisplayName}
              </h3>
              <p className="text-gray-200 text-sm">{roleConfig.displayName}</p>
            </div>
          </div>
          <button
            onClick={closeMobileHeader}
            className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {/* Quick Actions Section */}
        <div className="p-6 border-b border-gray-100">
          <h4 className="text-gray-900 font-semibold text-sm uppercase tracking-wide mb-4">
            Quick Actions
          </h4>
          <div className="grid grid-cols-1 gap-3">
            {userType === "patient" ? (
              <>
                <button
                  onClick={() => {
                    navigate("/patientdashboard/pharmacy");
                    closeMobileHeader();
                  }}
                  className="flex flex-row items-center gap-3 p-4 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl border border-green-200 transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
                >
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <Pill className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    Pharmacy
                  </span>
                </button>
                <button
                  onClick={() => {
                    navigate("/patientdashboard/ambulance");
                    closeMobileHeader();
                  }}
                  className="flex flex-row items-center gap-3 p-4 bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 rounded-xl border border-red-200 transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
                >
                  <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                    <Ambulance className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    Ambulance
                  </span>
                </button>
              </>
            ) : (
              ["doctor", "hospital", "lab", "freelancer"].includes(
                userType
              ) && (
                <>
                  <button
                    onClick={() => {
                      const specialization =
                        localStorage.getItem("selectedSpecialization") ||
                        "General Physician";
                      const dashboardPrefix =
                        {
                          doctor: "doctordashboard",
                          hospital: "hospitaldashboard",
                          freelancer: "doctordashboard",
                          lab: "labdashboard",
                        }[userType] || "";
                      navigate(`/${dashboardPrefix}/specialization`, {
                        state: { specialization, uploadedFiles: [] },
                      });
                      closeMobileHeader();
                    }}
                    className="flex flex-row items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl border border-blue-200 transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
                  >
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      Reports
                    </span>
                  </button>
                  {["doctor", "hospital", "freelancer"].includes(userType) && (
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-purple-200 p-4">
                      <ModulesMenu
                        user={user}
                        onModuleSelect={closeMobileHeader}
                      />
                    </div>
                  )}
                </>
              )
            )}
            <button
              onClick={() => {
                handleNotificationClick();
                closeMobileHeader();
              }}
              className="flex flex-row items-center gap-3 p-4 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl border border-purple-200 transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: roleConfig.primaryColor }}
              >
                <Bell className="h-6 w-6 text-white" />
              </div>
              <div className="flex justify-between items-center flex-1">
                <span className="text-sm font-medium text-gray-700">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    {unreadCount}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default HeaderWithNotifications;
