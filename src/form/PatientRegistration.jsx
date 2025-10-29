import React, { useState, useEffect, useRef } from 'react';
import {
  User, Phone, CreditCard, CheckCircle, Fingerprint,
  Calendar, MapPin, Lock, Loader2, AlertCircle
} from 'lucide-react';

const validatePhone = (p) => /^\d{10}$/.test(p);
const validateAadhar = (a) => /^\d{12}$/.test(a);

// --- Hardcoded Data ---
const hardcodedPatients = [
  {
    id: 1,
    fullName: 'Rajesh Kumar',
    gender: 'Male',
    dateOfBirth: '1985-05-15',
    phoneNumber: '9876543210',
    aadharNumber: '123456789012',
    address: '123, MG Road, Bangalore, Karnataka',
  },
  {
    id: 2,
    fullName: 'Priya Sharma',
    gender: 'Female',
    dateOfBirth: '1990-08-22',
    phoneNumber: '8765432109',
    aadharNumber: '987654321098',
    address: '456, Indira Nagar, Bangalore, Karnataka',
  },
];

// --- Components ---
const AadharInput = ({ value, onChange, error }) => {
  const formatAadhar = (val) => {
    const digits = val.replace(/\D/g, '');
    const parts = [];
    for (let i = 0; i < digits.length; i += 4) {
      parts.push(digits.substring(i, i + 4));
    }
    return parts.join(' ');
  };
  const handleChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    if (rawValue.length <= 12) {
      onChange(rawValue);
    }
  };
  return (
    <div>
      <input
        type="text"
        value={formatAadhar(value)}
        onChange={handleChange}
        className={`input-field ${error ? 'input-error' : ''}`}
        placeholder="XXXX XXXX XXXX"
        maxLength={14}
      />
      {error && <p className="error-text">{error}</p>}
    </div>
  );
};

const OtpInput = ({ length, value, onChange }) => {
  const [otp, setOtp] = useState(Array(length).fill(''));
  const inputRefs = useRef([]);
  useEffect(() => {
    const otpArray = value.split('');
    setOtp([...otpArray, ...Array(length - otpArray.length).fill('')]);
  }, [value, length]);
  const handleChange = (index, val) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[index] = val.slice(-1);
    setOtp(newOtp);
    onChange(newOtp.join(''));
    if (val && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };
  return (
    <div className="flex gap-3 justify-center">
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
          className="w-14 h-16 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-[#01D48C] focus:outline-none transition-colors"
        />
      ))}
    </div>
  );
};

const FingerprintScanner = ({ onComplete, isScanning }) => {
  useEffect(() => {
    if (isScanning) {
      const timer = setTimeout(() => {
        onComplete();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isScanning, onComplete]);
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="relative">
        <div className={`w-32 h-32 rounded-full bg-gradient-to-br from-[#01D48C] to-[#01B07A] flex items-center justify-center shadow-2xl ${isScanning ? 'animate-pulse' : ''}`}>
          <Fingerprint className="text-white" size={60} />
        </div>
        {isScanning && (
          <>
            <div className="absolute inset-0 rounded-full border-4 border-[#01D48C] animate-ping"></div>
            <div className="absolute inset-0 rounded-full border-4 border-[#01B07A] animate-spin" style={{ animationDuration: '3s' }}></div>
          </>
        )}
      </div>
      <p className="mt-6 text-lg font-semibold text-gray-700">
        {isScanning ? 'Scanning fingerprint...' : 'Place finger on scanner'}
      </p>
      {isScanning && (
        <div className="mt-4 flex gap-2">
          <div className="w-2 h-2 bg-[#01D48C] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-[#01D48C] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-[#01D48C] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      )}
    </div>
  );
};

// --- Main Component ---
const PatientRegistration = () => {
  const [step, setStep] = useState(1);
  const [verificationMethod, setVerificationMethod] = useState(null);
  const [formData, setFormData] = useState({
    aadharNumber: '',
    phoneNumber: '',
    otp: '',
  });
  const [errors, setErrors] = useState({});
  const [isVerifying, setIsVerifying] = useState(false);
  const [showFingerprintScanner, setShowFingerprintScanner] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [sentOtp, setSentOtp] = useState('');
  const [patientData, setPatientData] = useState(null);

  // --- Handlers ---
  const fetchPatientByAadhar = async (aadharNumber) => {
    return hardcodedPatients.find(p => p.aadharNumber === aadharNumber) || null;
  };
  const fetchPatientByPhone = async (phoneNumber) => {
    return hardcodedPatients.find(p => p.phoneNumber === phoneNumber) || null;
  };
  const handleAadharSubmit = () => {
    if (!formData.aadharNumber.trim()) {
      setErrors({ aadharNumber: 'Aadhar card number is required' });
      return;
    }
    if (!validateAadhar(formData.aadharNumber.trim())) {
      setErrors({ aadharNumber: 'Enter a valid 12-digit Aadhar number' });
      return;
    }
    setErrors({});
    setShowFingerprintScanner(true);
  };
  const handleFingerprintScanStart = () => {
    setIsScanning(true);
  };
  const handleFingerprintComplete = async () => {
    setIsVerifying(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2500));
      const patient = await fetchPatientByAadhar(formData.aadharNumber.trim());
      if (patient) {
        setPatientData(patient);
        setShowFingerprintScanner(false);
        setStep(2);
      } else {
        setErrors({ aadharNumber: 'Patient not found with this Aadhar number' });
        setShowFingerprintScanner(false);
        setIsScanning(false);
      }
    } catch (error) {
      setErrors({ aadharNumber: 'Error verifying Aadhar. Please try again.' });
      setShowFingerprintScanner(false);
      setIsScanning(false);
    } finally {
      setIsVerifying(false);
    }
  };
  const handlePhoneSendOtp = async () => {
    if (!formData.phoneNumber.trim()) {
      setErrors({ phoneNumber: 'Phone number is required' });
      return;
    }
    if (!validatePhone(formData.phoneNumber.trim())) {
      setErrors({ phoneNumber: 'Enter a valid 10-digit phone number' });
      return;
    }
    setIsVerifying(true);
    setErrors({});
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockOtp = '1234';
      setSentOtp(mockOtp);
      setVerificationMethod('phone');
      alert(`OTP sent to ${formData.phoneNumber}: ${mockOtp} (for testing)`);
    } catch (error) {
      setErrors({ phoneNumber: 'Error sending OTP. Please try again.' });
    } finally {
      setIsVerifying(false);
    }
  };
  const handleOtpVerification = async () => {
    if (formData.otp.length !== 4) {
      setErrors({ otp: 'Please enter complete OTP' });
      return;
    }
    setIsVerifying(true);
    setErrors({});
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (formData.otp === sentOtp || formData.otp === '1234') {
        const patient = await fetchPatientByPhone(formData.phoneNumber.trim());
        if (patient) {
          setPatientData(patient);
          setStep(2);
        } else {
          setErrors({ otp: 'Patient not found with this phone number' });
        }
      } else {
        setErrors({ otp: 'Invalid OTP. Please try again.' });
      }
    } catch (error) {
      setErrors({ otp: 'Error verifying OTP. Please try again.' });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className=" bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#01D48C] to-[#0E1630] p-6 text-white">
            <h1 className="h3-heading text-white">Patient Registration</h1>
            <div className="flex items-center gap-2 text-sm opacity-90">
              {/* <Activity size={16} /> */}
              <span>Step {step} of 2</span>
            </div>
          </div>

          {/* Step 1: Verification Method */}
          {step === 1 && !showFingerprintScanner && (
            <div className="p-6 space-y-6 custom-slide-in-left">
              <h2 className="h3-heading">Patient Verification</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Aadhar Verification */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border-2 border-blue-200 hover:shadow-lg transition-all card-animate-pulse">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                      <CreditCard className="text-white" size={24} />
                    </div>
                    <h3 className="h4-heading text-blue-900">Aadhar Card</h3>
                  </div>
                  <AadharInput
                    value={formData.aadharNumber}
                    onChange={(value) => setFormData(prev => ({ ...prev, aadharNumber: value }))}
                    error={errors.aadharNumber}
                  />
                  <button
                    onClick={handleAadharSubmit}
                    disabled={isVerifying}
                    className="btn btn-primary w-full mt-4"
                  >
                    <Fingerprint size={20} />
                    Verify with Fingerprint
                  </button>
                </div>
                {/* Phone Verification */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border-2 border-green-200 hover:shadow-lg transition-all card-animate-pulse">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mr-3">
                      <Phone className="text-white" size={24} />
                    </div>
                    <h3 className="h4-heading text-green-900">Phone Number</h3>
                  </div>
                  {verificationMethod !== 'phone' ? (
                    <>
                      <input
                        type="tel"
                        maxLength={10}
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value.replace(/[^\d]/g, '') }))}
                        className={`input-field ${errors.phoneNumber ? 'input-error' : ''}`}
                        placeholder="9876543210"
                      />
                      {errors.phoneNumber && <p className="error-text">{errors.phoneNumber}</p>}
                      <button
                        onClick={handlePhoneSendOtp}
                        disabled={isVerifying}
                        className="btn btn-primary w-full mt-4"
                      >
                        {isVerifying ? (
                          <>
                            <Loader2 className="animate-spin" size={20} />
                            Sending OTP...
                          </>
                        ) : (
                          <>
                            <Lock size={20} />
                            Send OTP
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-gray-600 mb-4 text-center">Enter OTP sent to {formData.phoneNumber}</p>
                      <OtpInput
                        length={4}
                        value={formData.otp}
                        onChange={(value) => setFormData(prev => ({ ...prev, otp: value }))}
                      />
                      {errors.otp && <p className="error-text">{errors.otp}</p>}
                      <button
                        onClick={handleOtpVerification}
                        disabled={isVerifying || formData.otp.length !== 4}
                        className="btn btn-primary w-full mt-4"
                      >
                        {isVerifying ? (
                          <>
                            <Loader2 className="animate-spin" size={20} />
                            Verifying...
                          </>
                        ) : (
                          <>
                            <CheckCircle size={20} />
                            Verify OTP
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Fingerprint Scanner */}
          {showFingerprintScanner && (
            <div className="p-6">
              <FingerprintScanner
                isScanning={isScanning}
                onComplete={handleFingerprintComplete}
              />
              {!isScanning && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={handleFingerprintScanStart}
                    className="btn btn-primary"
                  >
                    Start Scanning
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Patient Profile Confirmation */}
          {step === 2 && patientData && (
            <div className="p-6 space-y-6 custom-slide-in-right">
              <h2 className="h3-heading">Confirm Patient Details</h2>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl shadow-inner">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                  <div className="flex-1 space-y-4 w-full">
                    <h3 className="h4-heading">{patientData.fullName}</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 bg-white p-3 rounded-lg">
                        <User className="text-gray-500" size={20} />
                        <div>
                          <p className="text-xs text-gray-500">Gender</p>
                          <p className="font-semibold">{patientData.gender}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-white p-3 rounded-lg">
                        <Calendar className="text-gray-500" size={20} />
                        <div>
                          <p className="text-xs text-gray-500">Date of Birth</p>
                          <p className="font-semibold">{patientData.dateOfBirth}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-white p-3 rounded-lg">
                        <Phone className="text-gray-500" size={20} />
                        <div>
                          <p className="text-xs text-gray-500">Phone</p>
                          <p className="font-semibold">{patientData.phoneNumber}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 bg-white p-3 rounded-lg">
                      <MapPin className="text-gray-500 mt-1" size={20} />
                      <div>
                        <p className="text-xs text-gray-500">Address</p>
                        <p className="font-semibold">{patientData.address}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#01D48C] to-[#01B07A] flex items-center justify-center text-white text-5xl font-bold border-4 border-white shadow-xl">
                      {patientData.fullName.charAt(0).toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => { setStep(1); setPatientData(null); }}
                  className="btn btn-secondary w-full"
                >
                  Not {patientData.fullName}
                </button>
                <button
                  onClick={() => alert('Registration confirmed!')}
                  className="btn btn-primary w-full"
                >
                  <CheckCircle size={20} />
                  Confirm
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientRegistration;
