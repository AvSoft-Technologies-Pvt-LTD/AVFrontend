import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ForgotPassword from '../components/microcomponents/ForgotPassword';
import VerifyOTP from '../components/microcomponents/VerifyOtp';
import ResetPassword from '../components/microcomponents/ResetPassword';

const PasswordResetPage = () => {
  const navigate = useNavigate();
  const [screen, setScreen] = useState('forgot');
  const [email, setEmail] = useState('');

  const handleForgotSubmit = (email) => {
    setEmail(email);
    setScreen('verify');
    console.log(`OTP sent to ${email}`);
  };

  const handleVerifySubmit = (otp) => {
    setScreen('reset');
  };

  const handleResetSubmit = (newPassword, confirmPassword) => {
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    console.log(`Password reset for ${email}`);
    navigate('/login');
  };

  const goBackToLogin = () => navigate('/login');
  const goBackToForgot = () => setScreen('forgot');

  // Only allow email method
  const forgotPasswordProps = {
    title: "Forgot Password?",
    description: "Enter your email to receive a reset code.",
    inputPlaceholder: "Email",
    buttonText: "Send OTP",
    onSubmit: handleForgotSubmit,
    onBackToLogin: goBackToLogin,
    methodOptions: [{ label: "Email", value: "email" }], // Only email option
    selectedMethod: "email", // Default to email
    onMethodChange: () => {}, // No-op, since only email is allowed
    email: email,
    setEmail: setEmail,
  };

  const verifyOTPProps = {
    title: "Verify OTP",
    description: `Enter the 6-digit code sent to your email: ${email}`,
    email,
    otpLength: 6,
    onVerify: handleVerifySubmit,
    onResend: () => console.log("Resend OTP"),
    onBack: goBackToForgot,
    resendTimer: 60,
  };

  const resetPasswordProps = {
    title: "Reset Password",
    description: "Create a new password for your account.",
    newPasswordPlaceholder: "New Password",
    confirmPasswordPlaceholder: "Confirm Password",
    buttonText: "Reset Password",
    onSubmit: handleResetSubmit,
    onBackToLogin: goBackToLogin,
  };

  return (
    <div className="password-reset-page">
      {screen === 'forgot' && <ForgotPassword {...forgotPasswordProps} />}
      {screen === 'verify' && <VerifyOTP {...verifyOTPProps} />}
      {screen === 'reset' && <ResetPassword {...resetPasswordProps} />}
    </div>
  );
};

export default PasswordResetPage;
