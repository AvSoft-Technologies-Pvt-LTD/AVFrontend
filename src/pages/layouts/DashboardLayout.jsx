import { Outlet, useLocation, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState, useMemo } from "react";
import Sidebar, { menuItemsMap } from "./Sidebar";
import HeaderWithNotifications from "./Header";
import Loader from "../../components/Loader";
import { initializeAuth } from "../../context-api/authSlice";

const DashboardLayout = () => {
  const dispatch = useDispatch();
  const {
    user,
    isAuthenticated,
    loading: authLoading,
  } = useSelector((state) => state.auth);
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 300);
    return () => clearTimeout(timeout);
  }, [location.pathname]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader />
          <p className="text-lg mt-4 text-gray-600">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const userType = user.userType?.toLowerCase();
  if (!userType) {
    return <Navigate to="/login" replace />;
  }

  const routeValidation = {
    patient: location.pathname.startsWith("/patientdashboard"),
    doctor: location.pathname.startsWith("/doctordashboard"),
    freelancer: location.pathname.startsWith("/doctordashboard"),
    hospital: location.pathname.startsWith("/hospitaldashboard"),
    lab: location.pathname.startsWith("/labdashboard"),
    superadmin: location.pathname.startsWith("/superadmindashboard"),
  };

  if (routeValidation[userType] === false) {
    const redirectRoutes = {
      patient: "/patientdashboard",
      doctor: "/doctordashboard",
      freelancer: "/doctordashboard",
      hospital: "/hospitaldashboard",
      lab: "/labdashboard",
      superadmin: "/superadmindashboard",
    };
    return <Navigate to={redirectRoutes[userType] || "/login"} replace />;
  }

  // Enhanced currentPageName logic to match more specific paths first
  const currentPageName = useMemo(() => {
    const menuItems = menuItemsMap[userType] || [];
    const currentPath = location.pathname;

    // First, check all menu items and submenu items and sort by path length (longer first)
    const allMenuOptions = [];

    menuItems.forEach((item) => {
      if (item.isSubmenu) {
        // Add submenu items
        item.submenu.forEach((sub) => {
          allMenuOptions.push({
            label: sub.label,
            path: sub.path,
            isSubmenu: true,
          });
        });
      } else {
        // Add main menu items
        allMenuOptions.push({
          label: item.label,
          path: item.path,
          isSubmenu: false,
        });
      }
    });

    // Sort by path length (longer paths first) to match more specific routes first
    allMenuOptions.sort((a, b) => b.path.length - a.path.length);

    // Find the first matching path
    const matchedItem = allMenuOptions.find((option) => {
      // For exact dashboard matches
      if (option.label === "Dashboard" && currentPath === option.path) {
        return true;
      }
      // For other paths, use startsWith
      if (option.label !== "Dashboard" && currentPath.startsWith(option.path)) {
        return true;
      }
      return false;
    });

    return matchedItem ? matchedItem.label : "Dashboard";
  }, [location.pathname, userType]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        isMobileDrawerOpen={sidebarOpen}
        closeMobileDrawer={() => setSidebarOpen(false)}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <HeaderWithNotifications
          toggleSidebar={toggleSidebar}
          currentPageName={currentPageName}
        />
        <main className="flex-1 overflow-y-auto relative">
          {loading && (
            <div className="absolute inset-0 z-40 flex items-center justify-center bg-white bg-opacity-70">
              <Loader />
            </div>
          )}
          <div
            className={`transition-opacity duration-500 ${
              loading ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          >
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;