import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import VerifyOTP from "../components/microcomponents/VerifyOtp"; 
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
const Verification = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { userType, phone, email, registrationData } = location.state || {};

  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // -----------------------------
  // REDIRECT FIX (Important)
  // -----------------------------
  useEffect(() => {
    if (!userType || !phone) {
      navigate("/register"); // safe now
    }
  }, [userType, phone, navigate]);

  // If missing required info, return null until useEffect redirects
  if (!userType || !phone) return null;

  // -----------------------------
  // VERIFY OTP FUNCTION
  // -----------------------------
  const handleVerifyOtp = async (enteredOtp) => {
    if (enteredOtp.length !== 6) {
      setErrorMsg("Please enter complete 6-digit OTP");
      return;
    }

    setIsVerifying(true);
    setErrorMsg("");

    try {
      // mock verification
      await new Promise((res) => setTimeout(res, 1000));

      const user = {
        id: registrationData?.userId || Date.now().toString(),
        userType: userType.toLowerCase(),
        role: userType.charAt(0).toUpperCase() + userType.slice(1),
        phone,
        email,
        firstName: registrationData?.firstName || "User",
        lastName: registrationData?.lastName || "",
        hospitalName: registrationData?.hospitalName,
        centerName: registrationData?.centerName,
        isAuthenticated: true,
        token: "mock-jwt-token-" + Date.now(),
      };

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", user.token);

      // Navigation by user type
      const routes = {
        doctor: "/doctordashboard",
        hospital: "/hospitaldashboard",
        lab: "/labdashboard",
      };

      navigate(routes[userType] || "/patientdashboard", {
        state:
          userType === "patient"
            ? { userData: registrationData, fromRegistration: true }
            : undefined,
      });
    } catch (error) {
      setErrorMsg("Invalid OTP. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  // -----------------------------
  // RESEND OTP FUNCTION
  // -----------------------------
  const handleResendOtp = async () => {
    try {
      await new Promise((res) => setTimeout(res, 500));
      setErrorMsg("");
    } catch {
      setErrorMsg("Failed to resend OTP. Try again.");
    }
  };

  // -----------------------------
  // BACK FUNCTION
  // -----------------------------
  const handleBack = () => {
    navigate("/registration", { state: { userType } });
  };

  return (
    <>
     <Navbar/>
    <VerifyOTP
      title="Verify Your Account"
      description="Enter the 6-digit code sent to your phone or email."
      email={email || phone}
      otpLength={6}
      onVerify={handleVerifyOtp}
      onResend={handleResendOtp}
      onBack={handleBack}
      resendTimer={300} // 5-minute timer
    />
        <Footer/>
    </>
  );
};

export default Verification;
