import React, { useState, useRef, useEffect } from 'react';

const VerifyOTP = ({
  title = "Verify OTP",
  description = "Enter the 6-digit code sent to your email or phone.",
  email,
  otpLength = 6,
  onVerify,
  onResend,
  onBack,
  resendTimer = 60,
}) => {
  const [otp, setOtp] = useState(Array(otpLength).fill(''));
  const [timer, setTimer] = useState(resendTimer);
  const inputRefs = useRef([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < otpLength - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 animate-fade-in">
      <div className="w-full max-w-4xl flex flex-row items-center bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Left Side: OTP Form */}
        <div className="w-1/2 p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
            <p className="mt-2 text-sm text-gray-600">{description}</p>
          </div>

          <div className="flex justify-between">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(ref) => { if (ref) inputRefs.current[index] = ref; }}
                type="text"
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                maxLength={1}
                autoFocus={index === 0}
                className="w-12 h-12 text-center text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
              />
            ))}
          </div>

          <button
            onClick={() => onVerify(otp.join(''))}
            className="w-full py-2 px-4 bg-[var(--primary-color)] text-white font-medium rounded-md hover:bg-[var(--accent-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-all"
          >
            Verify OTP
          </button>

          <div className="text-center">
            <button
              disabled={timer > 0}
              onClick={onResend}
              className={`text-sm ${timer > 0 ? 'text-gray-400' : 'text-[var(--primary-color)] hover:underline'}`}
            >
              Didn't receive the code? {timer > 0 ? `Resend in ${timer}s` : 'Resend'}
            </button>
          </div>

          <div className="text-center">
            <button
              onClick={onBack}
              className="text-sm text-gray-600 hover:text-[var(--primary-color)] transition-all"
            >
              Wrong email? <span className="font-medium">Go back</span>
            </button>
          </div>
        </div>

        {/* Right Side: Image */}
            <div className="w-full md:w-1/2 md:pl-4 hidden md:block">
          <img
            src="https://img.freepik.com/free-vector/secure-login-concept-illustration_114360-4582.jpg"
            alt="OTP verification illustration"
            className="w-full h-auto rounded-xl animate-slideIn"
          />
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
