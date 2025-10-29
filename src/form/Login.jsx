import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { loginUser, sendLoginOTP, verifyOTP, clearError } from "../context-api/authSlice";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth || {});

  // ------------------ STATE ------------------
  const [loginMode, setLoginMode] = useState("password");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ------------------ LOCAL STORAGE LOAD ------------------
  useEffect(() => {
    const savedIdentifier = localStorage.getItem("rememberedIdentifier");
    const savedLoginMode = localStorage.getItem("rememberedLoginMode");
    const savedRememberMe = localStorage.getItem("rememberMe") === "true";

    if (savedRememberMe && savedIdentifier) {
      setIdentifier(savedIdentifier);
      setRememberMe(true);
    }
    if (savedLoginMode) {
      setLoginMode(savedLoginMode);
    }
    dispatch(clearError());
  }, [dispatch]);

  // ------------------ LOCAL STORAGE SAVE ------------------
  useEffect(() => {
    if (rememberMe && identifier) {
      localStorage.setItem("rememberedIdentifier", identifier);
      localStorage.setItem("rememberedLoginMode", loginMode);
      localStorage.setItem("rememberMe", "true");
    } else {
      localStorage.removeItem("rememberedIdentifier");
      localStorage.removeItem("rememberedLoginMode");
      localStorage.removeItem("rememberMe");
    }
  }, [rememberMe, identifier, loginMode]);

  // ------------------ HELPERS ------------------
  const routeToDashboard = (userType) => {
    const dashboardRoutes = {
      superadmin: "/superadmindashboard",
      doctor: "/doctordashboard",
      freelancer: "/doctordashboard",
      lab: "/labdashboard",
      hospital: "/hospitaldashboard",
      patient: "/patientdashboard",
    };
    const route = dashboardRoutes[userType?.toLowerCase()] || "/patientdashboard";
    navigate(route, { replace: true });
  };

  // ------------------ LOGIN HANDLERS ------------------
  const handleLogin = async (e) => {
    e.preventDefault();
    dispatch(clearError());

    try {
      if (loginMode === "password") {
        const resultAction = await dispatch(
          loginUser({ identifier, password })
        );
        if (loginUser.fulfilled.match(resultAction)) {
          routeToDashboard(resultAction.payload.userType);
        }
      } else {
        const resultAction = await dispatch(
          verifyOTP({ identifier, otp, type: "login" })
        );
        if (verifyOTP.fulfilled.match(resultAction)) {
          routeToDashboard(resultAction.payload.userType);
        }
      }
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  const handleSendOtp = async () => {
    if (!identifier.trim()) return;
    dispatch(clearError());
    try {
      const resultAction = await dispatch(sendLoginOTP(identifier));
      if (sendLoginOTP.fulfilled.match(resultAction)) {
        setOtpSent(true);
      }
    } catch (err) {
      console.error("Send OTP error:", err);
    }
  };

  const handleModeChange = (mode) => {
    setLoginMode(mode);
    setOtpSent(false);
    setOtp("");
    dispatch(clearError());
  };

  const handleForgotPassword = () => {
    navigate("/password-reset");
  };

  // ------------------ UI ------------------
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="flex flex-col md:flex-row items-center w-full max-w-4xl bg-white p-6 md:p-8 rounded-2xl shadow-md border border-gray-200">
        
        {/* Form Section */}
        <div className="w-full md:w-1/2 mb-6 md:mb-0 md:pr-4">
          <h2 className="h2-heading text-center mb-6">Login to Your Account</h2>

          {/* Login Mode Toggle */}
          <div className="flex justify-center mb-6 p-1">
            <button
              type="button"
              className={`px-4 py-2 md:px-6 font-semibold transition-all border-b-2 ${
                loginMode === "password"
                  ? "border-[#01D48C] text-[#01D48C]"
                  : "border-transparent text-gray-600 hover:bg-gray-100"
              }`}
              onClick={() => handleModeChange("password")}
            >
              Password
            </button>
            <button
              type="button"
              className={`px-4 py-2 md:px-6 font-semibold transition-all border-b-2 ${
                loginMode === "otp"
                  ? "border-[#01D48C] text-[#01D48C]"
                  : "border-transparent text-gray-600 hover:bg-gray-100"
              }`}
              onClick={() => handleModeChange("otp")}
            >
              OTP
            </button>
          </div>

          {/* Password Login */}
          {loginMode === "password" && (
            <form onSubmit={handleLogin}>
              <div className="relative w-full mb-6">
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="input-field"
                  placeholder="Email or Phone"
                  required
                />
              </div>
              <div className="relative w-full mb-6">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-12"
                  placeholder="Password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xl text-gray-400 hover:text-[#0E1630] focus:outline-none"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <FiEye /> : <FiEyeOff />}
                </button>
              </div>
              {error && <p className="error-text">{error}</p>}
              <div className="flex items-center justify-between mb-6">
                <label className="flex items-center space-x-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                  />
                  <span>Remember me</span>
                </label>
                <span
                  className="text-[var(--accent-color)] hover:underline cursor-pointer"
                  onClick={handleForgotPassword}
                >
                  Forgot Password?
                </span>
              </div>
              <button
                type="submit"
                className={`btn btn-primary w-full ${loading ? "btn-disabled" : ""}`}
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
          )}

          {/* OTP Login */}
          {loginMode === "otp" && (
            <>
              <div className="relative w-full mb-6">
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="input-field"
                  placeholder="Phone Number or Email"
                  required
                />
              </div>
              {!otpSent && (
                <button
                  type="button"
                  className={`btn btn-primary w-full mb-6 ${loading || !identifier ? "btn-disabled" : ""}`}
                  onClick={handleSendOtp}
                  disabled={loading || !identifier}
                >
                  {loading ? "Sending OTP..." : "Send OTP"}
                </button>
              )}
              {otpSent && (
                <form onSubmit={handleLogin}>
                  <div className="relative w-full mb-6">
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="input-field"
                      maxLength={6}
                      placeholder="Enter OTP"
                      required
                    />
                  </div>
                  {error && <p className="error-text">{error}</p>}
                  <div className="flex items-center justify-between mb-6">
                    <label className="flex items-center space-x-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={() => setRememberMe(!rememberMe)}
                        className="accent-[#0E1630]"
                      />
                      <span>Remember me</span>
                    </label>
                    <button
                      type="button"
                      className="text-sm text-[#0E1630] hover:underline"
                      onClick={handleSendOtp}
                      disabled={loading}
                    >
                      Resend OTP
                    </button>
                  </div>
                  <button
                    type="submit"
                    className={`btn btn-primary w-full ${loading || !otp ? "btn-disabled" : ""}`}
                    disabled={loading || !otp}
                  >
                    {loading ? "Verifying..." : "Verify OTP & Login"}
                  </button>
                </form>
              )}
            </>
          )}

          <p className="text-sm text-gray-600 text-center mt-6">
            Don't have an account?{" "}
            <span
              className="text-[var(--accent-color)] hover:underline cursor-pointer font-semibold"
              onClick={() => navigate("/register")}
            >
              Register
            </span>
          </p>
        </div>

        {/* Image Section */}
        <div className="w-full md:w-1/2 md:pl-4 hidden md:block">
          <img
            src="https://img.freepik.com/premium-vector/doctor-examines-report-disease-medical-checkup-annual-doctor-health-test-appointment-tiny-person-concept-preventive-examination-patient-consults-hospital-specialist-vector-illustration_419010-581.jpg"
            alt="Login illustration"
            className="w-full h-auto rounded-xl"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
