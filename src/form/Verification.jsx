import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { verifyOTP, sendOTP } from "../context-api/authSlice";
import VerifyOTP from "../components/microcomponents/VerifyOtp"; 
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
const Verification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

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
  // Update the handleVerifyOtp function in Verification.jsx
const handleVerifyOtp = async (enteredOtp) => {
  if (enteredOtp.length !== 6) {
    setErrorMsg("Please enter complete 6-digit OTP");
    return;
  }

  setIsVerifying(true);
  setErrorMsg("");

  try {
    const resultAction = await dispatch(verifyOTP({
      identifier: phone,
      otp: enteredOtp,
      type: 'registration',
      registrationData: registrationData
    }));

    if (verifyOTP.fulfilled.match(resultAction)) {
      // Success case - navigate based on user type
      const userType = resultAction.payload?.userType || 'patient';
      switch (userType) {
        case 'doctor':
          navigate('/doctor/dashboard');
          break;
        case 'patient':
          navigate('/patient/dashboard');
          break;
        case 'hospital':
          navigate('/hospital/dashboard');
          break;
        case 'lab':
          navigate('/lab/dashboard');
          break;
        default:
          navigate('/dashboard');
      }
    } else {
      setErrorMsg(resultAction.payload || "Invalid OTP. Please try again.");
    }
  } catch (error) {
    console.error('Verification error:', error);
    setErrorMsg("An error occurred during verification. Please try again.");
  } finally {
    setIsVerifying(false);
  }
};
  // -----------------------------
  // RESEND OTP FUNCTION
  // -----------------------------
  const handleResendOtp = async () => {
    try {
      const resultAction = await dispatch(sendOTP(phone));
      if (sendOTP.fulfilled.match(resultAction)) {
        setErrorMsg("OTP has been resent successfully");
      } else {
        setErrorMsg("Failed to resend OTP. Please try again.");
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      setErrorMsg("An error occurred while resending OTP. Please try again.");
    }
  };
  const handleBack = () => {
    navigate("/registration", { state: { userType } });
  };

  return (
    <>
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
    </>
  );
};

export default Verification;
