// 📄 src/pages/HealthcardOTP.jsx
import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useLocation } from "react-router-dom";
import VerifyOTP from "../../components/microcomponents/VerifyOtp";

const HealthcardOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData, healthId } = location.state || {};

  const [email, setEmail] = useState(userData?.email || "user@example.com");
  const [otpSent, setOtpSent] = useState(true);

  const handleVerify = async (enteredOtp) => {
    try {
      console.log("Verifying OTP:", enteredOtp);
      await new Promise((res) => setTimeout(res, 1000));
      if (enteredOtp === "123456") {
        toast.success("OTP verified successfully!");
        setTimeout(() => {
          navigate("/healthcard-medicalrecord", { state: { userData, healthId } });
        }, 1000);
      } else {
        toast.error("Invalid OTP. Please try again.");
      }
    } catch (error) {
      toast.error("Verification failed. Please try again later.");
      console.error(error);
    }
  };

  const handleResend = async () => {
    try {
      console.log("Resending OTP...");
      await new Promise((res) => setTimeout(res, 1000));
      toast.info("OTP resent successfully!");
    } catch (error) {
      toast.error("Failed to resend OTP.");
    }
  };

  const handleBack = () => {
    toast.info("Returning to previous step...");
    navigate(-1); // Go back to Healthcard
  };

  if (!otpSent) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-6 bg-white rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold text-gray-800">Enter Your Email</h2>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-3 w-full p-2 border border-gray-300 rounded-md"
          />
          <button
            onClick={() => {
              setOtpSent(true);
              toast.success("OTP sent successfully!");
            }}
            className="mt-4 w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Send OTP
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <VerifyOTP
        title="Verify Your Identity"
        description={`Enter the 6-digit code sent to ${email}`}
        email={email}
        otpLength={6}
        onVerify={handleVerify}
        onResend={handleResend}
        onBack={handleBack}
        resendTimer={60}
      />
      <ToastContainer position="top-center" />
    </>
  );
};

export default HealthcardOTP;
