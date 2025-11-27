import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { loginUser, sendLoginOTP, verifyOTP, clearError } from "../context-api/authSlice";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth || {});
  const [loginMode, setLoginMode] = useState("password");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Local Storage Load
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

  // Local Storage Save
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

  // Helpers
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

  // Login Handlers
  const handleLogin = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    try {
      if (loginMode === "password") {
        const resultAction = await dispatch(loginUser({ identifier, password }));
        if (loginUser.fulfilled.match(resultAction)) {
          routeToDashboard(resultAction.payload.userType);
        }
      } else {
        const resultAction = await dispatch(verifyOTP({ identifier, otp: getOtpValue(), type: "login" }));
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
    setOtp(["", "", "", "", "", ""]);
    dispatch(clearError());
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const getOtpValue = () => otp.join('');
  const handleForgotPassword = () => navigate("/password-reset");

  return (
    <>
      <Navbar />
      <div
        className="min-h-screen w-full flex items-center justify-start bg-cover bg-center bg-no-repeat relative"
        style={{ backgroundImage: "url('/src/assets/login.jpg')" }}
      >
        <div className="absolute inset-0 bg-opacity-50"></div>
        <div className="relative z-10 w-full max-w-md ml-4 sm:ml-8 md:ml-16 lg:ml-24 xl:ml-32 p-4">
          <div className="bg-white/95 backdrop-blur-sm p-6 md:p-8 rounded-2xl shadow-2xl shadow-black/50 border border-white/20">
            <div className="w-full">
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 text-gray-800">Login to Your Account</h2>
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
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01D48C] focus:border-transparent outline-none input-field"
                      placeholder="Email or Phone"
                      required
                    />
                  </div>
                  <div className="relative w-full mb-6">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01D48C] focus:border-transparent outline-none pr-12 input-field"
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
                  {error && <p className="text-red-500 text-sm mb-4 error-text">{error}</p>}
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
                    <span
                      className="text-[#01D48C] hover:underline cursor-pointer text-sm"
                      onClick={handleForgotPassword}
                    >
                      Forgot Password?
                    </span>
                  </div>
                  <button
                    type="submit"
                    className={`w-full btn btn-primary btn ${loading ? "btn-disabled" : ""}`}
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
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01D48C] focus:border-transparent outline-none input-field"
                      placeholder="Phone Number or Email"
                      required
                    />
                  </div>
                  {!otpSent && (
                    <button
                      type="button"
                      className={`w-full btn btn-primary  mb-6 btn ${loading || !identifier ? "btn-disabled" : ""}`}
                      onClick={handleSendOtp}
                      disabled={loading || !identifier}
                    >
                      {loading ? "Sending OTP..." : "Send OTP"}
                    </button>
                  )}
                  {otpSent && (
                    <form onSubmit={handleLogin}>
                      <div className="flex justify-center gap-2 mb-6">
                        {otp.map((digit, index) => (
                          <input
                            key={index}
                            id={`otp-${index}`}
                            type="text"
                            value={digit}
                            onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ''))}
                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                            className="w-12 h-12 text-center text-xl font-semibold border-2 border-gray-300 rounded-lg focus:border-[#01D48C] focus:outline-none transition-colors"
                            maxLength={1}
                            required
                          />
                        ))}
                      </div>
                      {error && <p className="text-red-500 text-sm mb-4 error-text">{error}</p>}
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
                          className="text-sm text-[#01D48C] hover:underline"
                          onClick={handleSendOtp}
                          disabled={loading}
                        >
                          Resend OTP
                        </button>
                      </div>
                      <button
                        type="submit"
                        className={`w-full w-full btn btn-primary  btn ${loading || getOtpValue().length !== 6 ? "btn-disabled" : ""}`}
                        disabled={loading || getOtpValue().length !== 6}
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
                  className="text-[#01D48C] hover:underline cursor-pointer font-semibold"
                  onClick={() => navigate("/register")}
                >
                  Register
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Login;
