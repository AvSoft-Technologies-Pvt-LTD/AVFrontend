import { useState, useRef, useEffect } from 'react';
import { Smartphone, CheckCircle2, RefreshCw } from 'lucide-react';

export default function OTPVerification({ phoneNumber = '+91 98765 43210', onVerified, onCancel }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(120);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;
    const newOtp = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
    setOtp(newOtp);
    if (pastedData.length === 6) handleVerify(pastedData);
  };

  const handleVerify = (otpValue) => {
    setVerifying(true);
    setTimeout(() => {
      if (otpValue === '123456' || otpValue.length === 6) {
        onVerified();
      } else {
        setError('Invalid OTP. Please try again.');
        setVerifying(false);
      }
    }, 1500);
  };

  const handleResend = () => {
    setIsResending(true);
    setOtp(['', '', '', '', '', '']);
    setTimeLeft(120);
    setTimeout(() => setIsResending(false), 1000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-lg bg-gray-100 rounded-2xl shadow-xl p-8 border border-gray-100">
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-[var(--primary-color)] to-[var(--accent-color)] rounded-2xl flex items-center justify-center shadow-lg mb-4">
          <Smartphone className="w-8 h-8 text-[var(--color-surface)]" />
        </div>
        <h2 className="h4-heading font-bold text-[var(--primary-color)] mb-2">OTP Verification</h2>
        <p className="text-gray-500 text-sm text-center">
          Enter the 6-digit code sent to
        </p>
        <p className="text-[var(--primary-color)] font-semibold text-sm">{phoneNumber}</p>
      </div>
      <div className="space-y-6">
        <div>
          <div className="flex gap-3 justify-center mb-4" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 transition-all duration-200 focus:outline-none ${
                  error
                    ? 'border-red-300 bg-red-50'
                    : digit
                    ? 'border-[var(--accent-color)] bg-[var(--accent-color)]/5'
                    : 'border-gray-200 bg-gray-50 focus:border-[var(--accent-color)] focus:bg-white'
                }`}
                disabled={verifying}
              />
            ))}
          </div>
          {error && (
            <div className="flex items-center justify-center gap-2 text-red-500 text-sm">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500"></span>
              {error}
            </div>
          )}
          {verifying && (
            <div className="flex items-center justify-center gap-2 text-[var(--accent-color)] text-sm">
              <CheckCircle2 className="w-4 h-4 animate-pulse" />
              <span>Verifying OTP...</span>
            </div>
          )}
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${timeLeft > 30 ? 'bg-[var(--accent-color)]' : 'bg-red-500'} animate-pulse`}></div>
              <span className="text-sm font-semibold text-gray-600">Code expires in</span>
              <span className={`text-sm font-bold ${timeLeft > 30 ? 'text-[var(--accent-color)]' : 'text-red-500'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
        </div>
        <div className="">
          <button
            onClick={handleResend}
            disabled={timeLeft > 90 || isResending}
            className="w-full flex items-center gap-2 justify-center text-sm text-gray-600 hover:text-[var(--primary-color)] font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${isResending ? 'animate-spin' : ''}`} />
            {isResending ? 'Resending...' : 'Resend OTP'}
          </button>
        </div>
      </div>
      <div className=" border-t border-gray-100">
        <button
          onClick={onCancel}
          className="w-full py-3 text-sm text-gray-600 hover:text-[var(--primary-color)] font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200"
        >
          Change Verification Method
        </button>
      </div>
      <div className="mt-2">
        <div className="flex items-start gap-3 bg-blue-50 rounded-xl p-4">
          <div className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-xs text-blue-800 leading-relaxed">
            For testing purposes, use OTP: <span className="font-bold">123456</span>
          </p>
        </div>
      </div>
    </div>
  );
}
