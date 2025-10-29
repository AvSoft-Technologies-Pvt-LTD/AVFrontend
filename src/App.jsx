
import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { initializeAuth } from "./context-api/authSlice";

// Public Pages
import Login from "./form/Login";
import RegisterSelect from "./form/RegisterSelect";
import Registration from "./form/Registration";
import Verification from "./form/Verification";
import PasswordResetPage from "./form/PasswordResetPage";
import { PatientProvider } from "./context-api/PatientContext";
import BookApp from "./components/BookApp";
import Home from "./pages/Home";
import MedicalRecords from "./pages/layouts/menu/PatientDashboard/MedicalRecord"
import MedicalRecordDetails from "./pages/layouts/menu/PatientDashboard/MedicalRecordDetails";

//Healthcard
import Healthcard from "./components/Healthcard/Healthcard";
import HealthcardOTP from "./components/Healthcard/HealthcardOTP";
import MedicalRecordHC from "./components/Healthcard/MedicalRecordHC";
// Layouts & Dashboards
import DashboardLayout from "./pages/layouts/DashboardLayout";
import PdashboardRoutes from "./pages/layouts/menu/PatientDashboard/PdashboardRoutes";
import AdminRoutes from "./pages/layouts/menu/SuperAdminDashboard/AdminRoute";
import AdminDashboard from "./pages/layouts/menu/SuperAdminDashboard/Dashboard";
import DrRoutes from "./pages/layouts/menu/DoctorDashboard/DrRoutes";
import Overview from "./pages/layouts/menu/DoctorDashboard/Overview";
import LabRoutes from "./pages/layouts/menu/LabDashboard/Ldroutes";
import LabDashboard from "./pages/layouts/menu/LabDashboard/LabDashboard";
import HospitalRoutes from "./pages/layouts/menu/HospitalDashboard/Hdroutes";
import HospitalDashboard from "./pages/layouts/menu/HospitalDashboard/Dashboard";
import Dashboard from "./pages/layouts/menu/PatientDashboard/Dashboard";
// Shared Components
import StaffManagement from "./components/AdminModule";
import PharmacyManagement from "./components/PharmacyModule";
import LabManagement from "./components/LabModule";
import QueueManagement from "./components/QueueManagaement";
import QueueToken from "./components/Queue-Token";
import Frontdesk from "./components/FrontendDesk";
import TokenDisplay from "./components/Token-Display";
import BedRoomList from "./pages/layouts/menu/DoctorDashboard/bed-manangement/BedRoomList"
import ImageAnnotationCanvas from "./components/microcomponents/ImageAnnotationCanvas";
import BedMaster from "./pages/layouts/menu/DoctorDashboard/bed-manangement/BedMaster";
// ---------------------- NEW Scheduler Imports ----------------------
import Scheduler from "./pages/layouts/menu/DoctorDashboard/scheduler/Scheduler";
 import Today from "./pages/layouts/menu/DoctorDashboard/scheduler/Today";
import AvailabilityPage from "./pages/layouts/menu/DoctorDashboard/scheduler/AvailabilityPage";
import AvailabilityOverviewPage from "./pages/layouts/menu/DoctorDashboard/scheduler/AvailabilityOverviewPage";
// Toast
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import InitialAssessmentForm from "./components/InitialAssesment";

// ---------------------- Helpers ----------------------

// ✅ PrivateRoute with allowed userType
const PrivateRoute = ({ allowedTypes }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  
  console.log('PrivateRoute - Auth state:', { isAuthenticated, user, allowedTypes });
  
  if (!isAuthenticated || !user) {
    console.log('PrivateRoute - Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  const userType = user.userType?.toLowerCase();
  console.log('PrivateRoute - User type:', userType);
  
  if (allowedTypes && !allowedTypes.includes(userType)) {
    console.log('PrivateRoute - User type not allowed, redirecting to appropriate dashboard');
    // Redirect to appropriate dashboard based on user type
    const redirectRoutes = {
      patient: '/patientdashboard',
      doctor: '/doctordashboard',
      freelancer: '/doctordashboard',
      hospital: '/hospitaldashboard',
      lab: '/labdashboard',
      superadmin: '/superadmindashboard'
    };
    return <Navigate to={redirectRoutes[userType] || '/login'} replace />;
  }
  
  return <Outlet />;
};

// ✅ Redirect to correct dashboard based on role
const RoleRedirect = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  
  console.log('RoleRedirect - Auth state:', { isAuthenticated, user });
  
  if (!isAuthenticated || !user) {
    console.log('RoleRedirect - Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  const userType = user.userType?.toLowerCase();
  console.log('RoleRedirect - Redirecting based on user type:', userType);

  switch (userType) {
    case "doctor":
      return <Navigate to="/doctordashboard" replace />;
    case "lab":
      return <Navigate to="/labdashboard" replace />;
    case "hospital":
      return <Navigate to="/hospitaldashboard" replace />;
    case "freelancer":
      return <Navigate to="/doctordashboard" replace />;
    case "superadmin":
      return <Navigate to="/superadmindashboard" replace />;
    case "patient":
      return <Navigate to="/patientdashboard" replace />;
    default:
      console.log('RoleRedirect - Unknown user type, redirecting to login');
      return <Navigate to="/login" replace />;
  }
};

const App = () => {
  const [tokens, setTokens] = useState([]);
  const handleTokenGenerated = (newToken) =>
    setTokens((prev) => [...prev, newToken]);
  const handleTokenUpdate = (updatedTokens) => setTokens(updatedTokens);
  const getNextTokenNumber = () => tokens.length + 1;
  const dispatch = useDispatch();
  
  // ✅ Redux state
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
  const [appLoading, setAppLoading] = useState(true);

  useEffect(() => {
    console.log('App - Initializing auth');
    // ✅ On app load, restore user from localStorage
    dispatch(initializeAuth());
    setAppLoading(false);
  }, [dispatch]);

  useEffect(() => {
    console.log('App - Auth state changed:', { isAuthenticated, user });
  }, [isAuthenticated, user]);

  if (appLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-lg mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  // ✅ Shared module routes for all dashboards
  const sharedRoutes = (
    <>
      <Route
        path="specialization"
        element={<InitialAssessmentForm />}
      />
      <Route path="dr-admin" element={<StaffManagement />} />
      <Route path="pharmacymodule" element={<PharmacyManagement />} />
      <Route path="labmodule" element={<LabManagement />} />
      <Route path="frontdesk" element={<Frontdesk />} />
      <Route
        path="queuemanagement"
        element={
          <QueueManagement
            tokens={tokens}
            onTokensUpdate={handleTokenUpdate}
          />
        }
      />
      <Route
        path="queuetoken"
        element={
          <QueueToken
            onTokenGenerated={handleTokenGenerated}
            currentTokenNumber={getNextTokenNumber()}
          />
        }
      />
      <Route
        path="tokendisplay"
        element={<TokenDisplay tokens={tokens} />}
      />
      <Route path="bedroommanagement" element={<BedRoomList/>}/>
    </>
  );

  return (
          <PatientProvider>

    <Router>
      <Routes>
        {/* ✅ Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<RegisterSelect />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/verification" element={<Verification />} />
        <Route path="/password-reset" element={<PasswordResetPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/bookconsultation" element={<BookApp />} />
        <Route path="/medical-records" element={<MedicalRecords />} />
        <Route path="/medical-record-details" element={<MedicalRecordDetails />} />
        
        {/* Healthcard */}
         <Route path="/healthcard" element={<Healthcard />} />
        <Route path="/healthcard-otp" element={<HealthcardOTP />} />
        <Route path="/healthcard-medicalrecord" element={<MedicalRecordHC />} />
        {/* ✅ Redirect Based on Role */}
        <Route path="/redirect" element={<RoleRedirect />} />
        
        {/* ✅ Patient Dashboard */}
        <Route element={<PrivateRoute allowedTypes={["patient"]} />}>
          <Route path="/patientdashboard" element={<DashboardLayout />}>
     <Route index element={<Dashboard />} />
            <Route path="*" element={<PdashboardRoutes />} />
          </Route>
        </Route>
        
        {/* ✅ Doctor Dashboard */}
        <Route element={<PrivateRoute allowedTypes={["doctor", "freelancer"]} />}>
          <Route path="/doctordashboard" element={<DashboardLayout />}>
            <Route index element={<Overview />} />
            {sharedRoutes}
            <Route path="template" element={<ImageAnnotationCanvas />} />
            <Route path="bedroommanagement/bedmaster" element={<BedMaster />} />
<Route path="scheduler" element={<Scheduler />} />
    <Route path="scheduler/availability" element={<AvailabilityOverviewPage />} />
    <Route path="scheduler/availability/create" element={<AvailabilityPage />} />
    <Route path="scheduler/availability/edit/:scheduleId" element={<AvailabilityPage />} />
    <Route path="scheduler/today" element={<Today />} />  
            <Route path="*" element={<DrRoutes />} />
          </Route>
        </Route>
        
        {/* ✅ Hospital Dashboard */}
        <Route element={<PrivateRoute allowedTypes={["hospital"]} />}>
          <Route path="/hospitaldashboard" element={<DashboardLayout />}>
            <Route index element={<HospitalDashboard />} />
            {sharedRoutes}
            <Route path="*" element={<HospitalRoutes />} />
          </Route>
        </Route>
        
        {/* ✅ Lab Dashboard */}
        <Route element={<PrivateRoute allowedTypes={["lab"]} />}>
          <Route path="/labdashboard" element={<DashboardLayout />}>
            <Route index element={<LabDashboard />} />
            <Route path="*" element={<LabRoutes />} />
          </Route>
        </Route>
        
        {/* ✅ Super Admin Dashboard */}
        <Route element={<PrivateRoute allowedTypes={["superadmin"]} />}>
          <Route path="/superadmindashboard" element={<DashboardLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="*" element={<AdminRoutes />} />
          </Route>
        </Route>
        
        {/* ✅ Fallback Route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      
      <ToastContainer position="top-right" autoClose={3000} />
    </Router>
          </PatientProvider>

  );
};

export default App;