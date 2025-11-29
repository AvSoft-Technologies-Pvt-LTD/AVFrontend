import React, { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Tooltip } from "react-tooltip";
import { User, BarChart3, LayoutDashboard,Ticket, CalendarCheck, Settings, ShoppingBag, Stethoscope, ClipboardList, ShieldCheck, AlertTriangle, ChevronLeft, ChevronRight, DollarSign, CreditCard, Microscope, Pill, FileText, Hospital, UserCog, Users, ChevronDown, ChevronUp, Package, Power } from "lucide-react";
import { logout } from "../../context-api/authSlice";
import logo from "../../assets/fav.png";

export const menuItemsMap = {
  doctor: [
    { icon: LayoutDashboard, label: "Dashboard", path: "/doctordashboard" },
    {
      icon: CalendarCheck,
      label: "Appointments",
      path: "/doctordashboard/appointments",
    },
    { icon: ShoppingBag, label: "Patients", path: "/doctordashboard/patients" },
    { icon: ShieldCheck, label: "Payments", path: "/doctordashboard/billing" },
      { icon: CalendarCheck, label: "Scheduler", path: "/doctordashboard/scheduler" },
    { icon: Settings, label: "Settings", path: "/doctordashboard/settings" },
  ],
  
  lab: [
    { icon: LayoutDashboard, label: "Dashboard", path: "/labdashboard" },
    { icon: CalendarCheck, label: "Test Bookings", path: "/labdashboard/test-bookings" },
    { icon: Users, label: "Patients", path: "/labdashboard/patients" },
    { icon: UserCog, label: "Lab Technicians", path: "/labdashboard/lab-technicians" },
    { icon: Package, label: "Inventory", path: "/labdashboard/inventory" },
    { icon: CreditCard, label: "Payments", path: "/labdashboard/payments" },
    // { icon: ClipboardList, label: "Test Catalogs", path: "/labdashboard/test-catalogs" },
    { icon: Settings, label: "Settings", path: "/labdashboard/settings" },
  ],
  hospital: [
    { icon: LayoutDashboard, label: "Dashboard", path: "/hospitaldashboard" },
    { icon: Stethoscope, label: "OPD", path: "/hospitaldashboard/opd-list" },
    { icon: Hospital, label: "IPD", path: "/hospitaldashboard/Ipd" },
    {
      icon: ShieldCheck,
      label: "Billing & Payments",
      path: "/hospitaldashboard/billing-payments",
    },
    {
      icon: AlertTriangle,
      label: "Emergency",
      path: "/hospitaldashboard/emergency",
    },
    { icon: UserCog, label: "Settings", path: "/hospitaldashboard/settings" },
  ],
  superadmin: [
    { icon: LayoutDashboard, label: "Dashboard", path: "/superadmindashboard" },
    {
      icon: Users,
      label: "Manage Patients",
      path: "/superadmindashboard/managepatients",
    },
    {
      icon: Stethoscope,
      label: "Manage Doctors",
      isSubmenu: true,
      submenu: [
        {
          label: "Freelancer Doctors",
          path: "/superadmindashboard/manage-doctors",
        },
        {
          label: "PocketClinic Doctors",
          path: "/superadmindashboard/manage-doctors/PocketClinic",
        },
      ],
    },
    {
      icon: Hospital,
      label: "Manage Hospitals",
      path: "/superadmindashboard/manage-hospitals",
    },
    {
      icon: Microscope,
      label: "Manage Labs",
      path: "/superadmindashboard/manage-labs",
    },
    {
      icon: Pill,
      label: "Manage Pharmacies",
      path: "/superadmindashboard/manage-pharmacies",
    },
    { icon: User, label: "Roles", path: "/superadmindashboard/manage-roles" },
    {
      icon: BarChart3,
      label: "Reports",
      path: "/superadmindashboard/manage-reports",
    },
    {
      icon: ShieldCheck,
      label: "Payments",
      path: "/superadmindashboard/payments",
    },
    {
      icon: Settings,
      label: "Settings",
      path: "/superadmindashboard/settings",
    },
  ],
  patient: [
    { icon: LayoutDashboard, label: "Dashboard", path: "/patientdashboard" },
    {
      icon: CalendarCheck,
      label: "My Appointments",
      path: "/patientdashboard/appointments",
    },
    {
      icon: FileText,
      label: "Medical Records",
      path: "/patientdashboard/medical-records",
    },
    // {
    //   icon: ShoppingCart,
    //   label: "Online Shopping",
    //   path: "/patientdashboard/shopping",
    // },
    // { icon: Shield, label: "Insurance", path: "/patientdashboard/insurance" },
    { icon: DollarSign, label: "Billing", path: "/patientdashboard/billing" },
    { icon: Settings, label: "Settings", path: "/patientdashboard/settings" },
  ],
  frontdesk: [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      path: "/frontdeskdashboard"
    },
    {
      icon: Users,
      label: "Patients",
      path: "/frontdeskdashboard/patients"
    },
    {
      icon: Ticket,
      label: "Token Management",
      path: "/frontdeskdashboard/tokens"
    },
    {
      icon: Settings,
      label: "Settings",
      path: "/frontdeskdashboard/settings"
    }
  ],
};

const Sidebar = ({ isMobileDrawerOpen, closeMobileDrawer }) => {
const [isCollapsed, setIsCollapsed] = useState(false);
const [openSubmenuIndex, setOpenSubmenuIndex] = useState(null);
const [isDesktop, setIsDesktop] = useState(window?.innerWidth >= 1024);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  // Get user from Redux store
  const user = useSelector((state) => state.auth?.user);

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
  if (!user) {
    return "U";
  }
  // Check for firstName
  if (user.firstName) {
    return user.firstName.charAt(0).toUpperCase();
  }
  // Check for name (fallback)
  if (user.name) {
    return user.name.charAt(0).toUpperCase();
  }
  // Check for hospitalName
  if (user.hospitalName) {
    return user.hospitalName.charAt(0).toUpperCase();
  }
  // Check for labName
  if (user.labName) {
    return user.labName.charAt(0).toUpperCase();
  }
  // Check for centerName
  if (user.centerName) {
    return user.centerName.charAt(0).toUpperCase();
  }
  // Check for email (fallback)
  if (user.email) {
    return user.email.charAt(0).toUpperCase();
  }
  // Final fallback
  return "U";
};


  const roleDisplayNames = {
    patient: "Patient",
    doctor: "Doctor",
    freelancer: "Freelancer Doctor",
    hospital: "Hospital Admin",
    lab: "Lab Technician",
    superadmin: "Super Admin",
  };

 useEffect(() => {
  const handleResize = () => {
    const desktop = window.innerWidth >= 1024;
    setIsDesktop(desktop);

    // collapse automatically on small screens, keep user choice on desktop
    if (!desktop) {
      setIsCollapsed(true);
    }
    // else: keep whatever isCollapsed currently is (so user toggles persist)
  };

  window.addEventListener("resize", handleResize);
  handleResize();
  return () => window.removeEventListener("resize", handleResize);
}, []);

  useEffect(() => {
    if (user?.userType) {
      const userMenus = menuItemsMap[user.userType.toLowerCase()] || [];
      const matchedSubIndex = userMenus.findIndex(
        (item) =>
          item.isSubmenu &&
          item.submenu.some((sub) => location.pathname.startsWith(sub.path))
      );
      setOpenSubmenuIndex(matchedSubIndex !== -1 ? matchedSubIndex : null);
    }
  }, [location.pathname, user]);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const handleLogout = () => {
    dispatch(logout());
    closeMobileDrawer();
    navigate("/login");
  };

  const handleSubmenuToggle = (index) => {
    setOpenSubmenuIndex(openSubmenuIndex === index ? null : index);
  };

  if (!user || !user.userType) {
    return null;
  }

  const userDisplayName = getUserDisplayName(user);
  const userInitials = getUserInitials(user);
  const userType = user.userType?.toLowerCase();
  const menuItems = menuItemsMap[userType] || [];

  const SidebarContent = () => (
    <>

<div className="flex flex-col items-center mb-6">
  {/* Logo + Title (always visible) */}
  <div className="flex items-center justify-between w-full">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-md overflow-hidden">
        <img
          src={logo}
          alt="PocketClinic Logo"
          className="w-full h-full object-cover rounded-lg"
        />
      </div>
      {(!isCollapsed || !isDesktop) && (
        <h3 className="font-bold text-lg text-white hidden md:block">
          PocketClinic
        </h3>
      )}
    </div>
    {/* Toggle button beside logo when expanded */}
    {!isCollapsed && isDesktop && (
      <button
        onClick={toggleSidebar}
        aria-label="Collapse sidebar"
        className="text-white hover:bg-white/20 p-2 rounded-full transition-colors duration-200"
        title="Collapse"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
    )}
  </div>
  {/* Toggle button below logo when collapsed */}
  {isCollapsed && isDesktop && (
    <button
      onClick={toggleSidebar}
      aria-label="Expand sidebar"
      className="text-white hover:bg-white/20 p-2 rounded-full transition-colors duration-200 mt-2"
      title="Expand"
    >
      <ChevronRight className="h-5 w-5" />
    </button>
  )}
</div>




      {/* User Profile Section */}
      <div className="flex items-center p-1 mb-4 rounded-lg">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[var(--accent-color)] text-[var(--primary-color)] flex items-center justify-center rounded-full text-lg font-bold shadow-md">
          {userInitials}
        </div>
        {(!isCollapsed || window.innerWidth < 1024) && (
          <div className="ml-3">
            <p className="text-sm font-semibold text-white">
              {userDisplayName}
            </p>
            <span className="text-xs text-gray-300">
              {roleDisplayNames[userType] || "User"}
            </span>
          </div>
        )}
      </div>

      {/* Menu Items */}
      <ul className="flex-1 space-y-1 overflow-y-auto">
        {menuItems.map((item, idx) =>
          item.isSubmenu ? (
            <li key={idx} className="mb-1">
<button
  onClick={() => handleSubmenuToggle(idx)}
  className={`flex items-center justify-between w-full py-2.5 px-3 rounded-lg transition-all duration-200 ${
    openSubmenuIndex === idx
      ? "bg-white/20 text-white"
      : "hover:bg-white/10 text-gray-300 hover:text-white"
  }`}
>
  <div data-tooltip-id="sidebar-tooltip" data-tooltip-content={item.label}>
    <item.icon className="h-5 w-5" />
  </div>
  {(!isCollapsed || window.innerWidth < 1024) && (
    <span className="text-sm font-medium">{item.label}</span>
  )}
  {(!isCollapsed || window.innerWidth < 1024) &&
    (openSubmenuIndex === idx ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    ))}
</button>

              {openSubmenuIndex === idx &&
                (!isCollapsed || window.innerWidth < 1024) && (
                  <ul className="ml-6 mt-1 space-y-1">
                    {item.submenu.map((sub, subIdx) => (
                      <li key={subIdx}>
                        <NavLink
                          to={sub.path}
                          onClick={() =>
                            window.innerWidth < 1024 && closeMobileDrawer()
                          }
                          className={({ isActive }) =>
                            `block py-2 px-3 rounded-lg transition-all duration-200 text-sm ${
                              isActive
                                ? "bg-[var(--accent-color)] text-[var(--primary-color)] font-medium"
                                : "text-gray-300 hover:bg-white/10 hover:text-white"
                            }`
                          }
                        >
                          {sub.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
            </li>
          ) : (
            <li key={idx} className="mb-1">
 <NavLink
  to={item.path}
  end={item.path === "/" || item.label === "Dashboard"}
  onClick={() => window.innerWidth < 1024 && closeMobileDrawer()}
  className={({ isActive }) =>
    `flex items-center gap-3 py-2.5 px-3 rounded-lg transition-all duration-200 ${
      isActive
        ? "bg-[var(--accent-color)] text-[var(--primary-color)] font-medium"
        : "text-gray-300 hover:bg-white/10 hover:text-white"
    }`
  }
>
  <div data-tooltip-id="sidebar-tooltip" data-tooltip-content={item.label}>
    <item.icon className="h-5 w-5" />
  </div>
  {(!isCollapsed || window.innerWidth < 1024) && (
    <span className="text-sm">{item.label}</span>
  )}
</NavLink>

            </li>
          )
        )}
      </ul>

      {/* Logout Button */}
      <button
  onClick={handleLogout}
  className="flex items-center gap-3 w-full py-2.5 px-3 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-all duration-200 mt-4"
  data-tooltip-id="sidebar-tooltip"
  data-tooltip-content="Logout"
>
  <Power className="h-5 w-5" />
  {(!isCollapsed || window.innerWidth < 1024) && <span>Logout</span>}
</button>
{isDesktop && isCollapsed && (
  <Tooltip
    id="sidebar-tooltip"
    place="right"
    className="tooltip-gradient text-on-gradient"
    offset={40}
    style={{ zIndex: 9999 }}
  />
)}

    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={`hidden lg:flex h-screen bg-[var(--primary-color)] text-white p-4 flex-col rounded-xl shadow-xl transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        <SidebarContent />
      </div>

      {/* Mobile/Tablet Drawer Backdrop */}
      {isMobileDrawerOpen && (
        <div
          className="fixed inset-0 z-40 backdrop-blur-sm lg:hidden"
          onClick={closeMobileDrawer}
        />
      )}

      {/* Mobile/Tablet Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-[var(--primary-color)] text-white p-4 flex flex-col rounded-r-xl shadow-2xl transform transition-transform duration-300 ease-in-out z-50 lg:hidden ${
          isMobileDrawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent />
      </div>
    </>
  );
};

export default Sidebar;
