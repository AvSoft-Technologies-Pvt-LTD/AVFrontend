import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, ArrowLeft, RefreshCw } from 'lucide-react';

const Verification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userType, phone, email, registrationData } = location.state || {};
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(300);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errors, setErrors] = useState({});

  // Redirect if missing required data
  useEffect(() => {
    if (!userType || !phone) {
      navigate('/register');
    }
  }, [userType, phone, navigate]);

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format contact info for display
  const formatContact = (contact) => {
    if (!contact) return '';
    if (contact.includes('@')) {
      const [name, domain] = contact.split('@');
      return `${name.substring(0, 2)}***@${domain}`;
    } else {
      return `****${contact.slice(-4)}`;
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1 || isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
    setErrors({});
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
      }
    }
  };

  const handleVerifyOtp = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setErrors({ otp: 'Please enter complete 6-digit OTP' });
      return;
    }
    setIsVerifying(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockUser = {
        id: registrationData?.userId || Date.now().toString(),
        userType: userType.toLowerCase(),
        role: userType.charAt(0).toUpperCase() + userType.slice(1),
        phone,
        email,
        firstName: registrationData?.firstName || 'User',
        lastName: registrationData?.lastName || '',
        hospitalName: registrationData?.hospitalName,
        centerName: registrationData?.centerName,
        isAuthenticated: true,
        token: 'mock-jwt-token-' + Date.now()
      };
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('token', mockUser.token);

      if (userType === 'patient') {
        navigate('/healthcard', {
          state: {
            userData: registrationData,
            fromRegistration: true
          }
        });
      } else {
        const dashboardRoutes = {
          doctor: '/doctordashboard',
          hospital: '/hospitaldashboard',
          lab: '/labdashboard'
        };
        navigate(dashboardRoutes[userType] || '/patientdashboard');
      }
    } catch (error) {
      setErrors({ otp: 'Invalid OTP. Please try again.' });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setTimeLeft(300);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      setErrors({});
    } catch (error) {
      setErrors({ resend: 'Failed to resend OTP. Please try again.' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden flex">
        {/* Left Side - Image */}
        <div className="w-1/2 bg-primary bg-opacity-10 flex items-center justify-center p-4">
          <img
            src="https://img.freepik.com/premium-vector/doctor-examines-report-disease-medical-checkup-annual-doctor-health-test-appointment-tiny-person-concept-preventive-examination-patient-consults-hospital-specialist-vector-illustration_419010-581.jpg"
            alt="Medical verification illustration"
            className="w-full h-full max-w-md object-contain"
          />
        </div>

        {/* Right Side - Verification Form */}
        <div className="w-1/2 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4 mx-auto">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="h2-heading text-gray-800 mb-2">Verify Your Account</h2>
            <p className="text-gray-600">Enter the 6-digit code sent to your contact details</p>
          </div>

          {/* User Info Card */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                {registrationData?.firstName?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h3 className="font-semibold text-lg capitalize">
                  {registrationData?.firstName || 'User'} {registrationData?.lastName}
                </h3>
                <p className="text-sm text-gray-600 capitalize">
                  {userType} {registrationData?.hospitalName && `• ${registrationData.hospitalName}`}
                  {registrationData?.centerName && `• ${registrationData.centerName}`}
                </p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-600">Verification code sent to:</p>
              <p className="font-medium text-primary">
                {formatContact(phone)}
                {email && <>, {formatContact(email)}</>}
              </p>
            </div>
          </div>

          {/* OTP Input */}
          <div className="mb-6">
            <div className="flex justify-center space-x-3 mb-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`w-12 h-12 text-center text-xl font-bold border-2 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20 transition-colors ${
                    errors.otp ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              ))}
            </div>
            {errors.otp && <p className="text-red-500 text-sm text-center mt-2">{errors.otp}</p>}
          </div>

          {/* Timer and Actions */}
          <div className="space-y-4">
            <div className="text-center">
              {timeLeft > 0 ? (
                <p className="text-sm text-gray-600">
                  Code expires in <span className="font-semibold text-primary">{formatTime(timeLeft)}</span>
                </p>
              ) : (
                <p className="text-sm text-red-600">Code has expired</p>
              )}
            </div>

            <button
              onClick={handleVerifyOtp}
              disabled={isVerifying || otp.join('').length !== 6}
              className={`btn btn-primary w-full py-3 px-4 rounded-lg text-white font-medium transition-all ${
                isVerifying ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isVerifying ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </span>
              ) : (
                'Verify & Continue'
              )}
            </button>

            <div className="text-center">
              {canResend ? (
                <button
                  onClick={handleResendOtp}
                  className="btn btn-secondary flex items-center justify-center gap-2 mx-auto"
                >
                  <RefreshCw className="w-4 h-4" />
                  Resend Code
                </button>
              ) : (
                <p className="text-sm text-gray-500">
                  Didn't receive the code? You can resend in {formatTime(timeLeft)}
                </p>
              )}
            </div>
            {errors.resend && <p className="text-red-500 text-sm text-center">{errors.resend}</p>}
          </div>

          {/* Back Button */}
          <div className="mt-8 text-center">
            <button
              onClick={() => navigate('/registration', { state: { userType } })}
              className="btn btn-secondary flex items-center justify-center gap-2 mx-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Registration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Verification;