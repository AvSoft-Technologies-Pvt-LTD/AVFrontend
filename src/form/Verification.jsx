import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { verifyOTP, sendOTP } from "../context-api/authSlice";
import VerifyOTP from "../components/microcomponents/VerifyOtp";

const Verification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { userType, phone, email, registrationData } = location.state || {};
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Redirect if required info is missing
  useEffect(() => {
    if (!userType || !phone) {
      navigate("/register");
    }
  }, [userType, phone, navigate]);

  if (!userType || !phone) return null;

  // Handle OTP verification
  const handleVerifyOtp = async (enteredOtp) => {
    if (enteredOtp.length !== 6) {
      setErrorMsg("Please enter a complete 6-digit OTP");
      return;
    }
    setIsVerifying(true);
    setErrorMsg("");
    try {
      console.log("Verifying OTP:", enteredOtp);
      console.log("Registration data:", registrationData);

      const resultAction = await dispatch(
        verifyOTP({
          identifier: phone,
          otp: enteredOtp,
          type: "registration",
          registrationData: registrationData,
        })
      );

      console.log("Result action:", resultAction);

      if (verifyOTP.fulfilled.match(resultAction)) {
        const userType = resultAction.payload?.userType || "patient";
        console.log("Navigating to:", userType);
        switch (userType) {
          case "doctor":
            navigate("/doctor/dashboard");
            break;
          case "patient":
            navigate("/patient/dashboard");
            break;
          case "hospital":
            navigate("/hospital/dashboard");
            break;
          case "lab":
            navigate("/lab/dashboard");
            break;
          default:
            navigate("/dashboard");
        }
      } else {
        setErrorMsg(resultAction.payload || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("Verification error:", error);
      setErrorMsg("An error occurred during verification. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle OTP resend
  const handleResendOtp = async () => {
    try {
      const resultAction = await dispatch(sendOTP(phone));
      if (sendOTP.fulfilled.match(resultAction)) {
        setErrorMsg("OTP has been resent successfully");
      } else {
        setErrorMsg("Failed to resend OTP. Please try again.");
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
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
        resendTimer={300}
        isVerifying={isVerifying}
        errorMsg={errorMsg}
      />
    </>
  );
};

export default Verification;
