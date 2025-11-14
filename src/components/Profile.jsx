import React, { useState, useEffect, useRef } from 'react';
import {
  User, Phone, CreditCard, CheckCircle, Fingerprint,
  Calendar, MapPin, Lock, Loader2, X
} from 'lucide-react';

const validatePhone = (p) => /^\d{10}$/.test(p);
const validateAadhar = (a) => /^\d{12}$/.test(a);

const OtpAlert = ({ phone, otp, onDismiss }) => (
  <div className="fixed top-4 right-4 z-50">
    <div className="bg-white border-l-4 border-[#01D48C] p-4 rounded-lg flex items-start gap-3 max-w-sm backdrop-blur-md bg-white/90">
      <CheckCircle className="text-[#01D48C] mt-1" size={20} />
      <div>
        <h4 className="h4-heading">OTP Sent!</h4>
        <p className="paragraph">
          An OTP has been sent to <span className="font-medium">{phone}</span>.
        </p>
        <p className="paragraph">
          For testing: <span className="font-medium">{otp}</span>
        </p>
      </div>
      <button onClick={onDismiss} className="text-gray-500 hover:text-gray-700 ml-auto">
        <X size={18} />
      </button>
    </div>
  </div>
);

const AadharInput = ({ value, onChange, error }) => {
  const formatAadhar = (val) => {
    const digits = val.replace(/\D/g, '');
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  };
  const handleChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    if (rawValue.length <= 12) onChange(rawValue);
  };
  return (
    <div className="w-full max-w-xs mx-auto">
      <input
        type="text"
        value={formatAadhar(value)}
        onChange={handleChange}
        className={`input-field w-full ${error ? 'input-error' : ''}`}
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
    if (val && index < length - 1) inputRefs.current[index + 1]?.focus();
  };
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };
  return (
    <div className="flex gap-3 justify-center mt-4 md:mt-6">
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
          className="w-14 h-16 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-[#01D48C] focus:outline-none focus:ring-2 focus:ring-[#01D48C] bg-white/70 transition-all"
        />
      ))}
    </div>
  );
};

const FingerprintScanner = ({ onComplete, isScanning }) => {
  useEffect(() => {
    if (isScanning) {
      const timer = setTimeout(() => onComplete(), 2500);
      return () => clearTimeout(timer);
    }
  }, [isScanning, onComplete]);
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <div className="relative">
        <div
          className={`w-32 h-32 rounded-full bg-gradient-to-br from-[#01D48C] to-[#248070] flex items-center justify-center ${
            isScanning ? 'animate-pulse' : ''
          }`}
        >
          <Fingerprint className="text-white" size={60} />
        </div>
        {isScanning && (
          <>
            <div className="absolute inset-0 rounded-full border-4 border-[#68c723] animate-ping"></div>
            <div
              className="absolute inset-0 rounded-full border-4 border-[#01D48C] animate-spin"
              style={{ animationDuration: '3s' }}
            ></div>
          </>
        )}
      </div>
      <p className="mt-6 text-lg font-semibold text-gray-700">
        {isScanning ? 'Scanning fingerprint...' : 'Place your finger on the scanner'}
      </p>
    </div>
  );
};

const ProgressIndicator = ({ step }) => {
  const steps = [
    { id: 1, label: 'Verification Method' },
    { id: 2, label: 'Scan / OTP' },
    { id: 3, label: 'Confirmation' },
  ];
  return (
    <div className="flex justify-center gap-10 mt-6">
      {steps.map((s) => (
        <div key={s.id} className="flex flex-col items-center">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl ${
              s.id <= step
                ? 'bg-gradient-to-br from-[#01D48C] to-[#248070]'
                : 'bg-gray-200 text-gray-500'
            }`}
          >
            {s.id}
          </div>
          <span
            className={`text-base mt-2 ${
              s.id <= step ? 'text-gray-800 font-semibold' : 'text-gray-400'
            }`}
          >
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );
};

const PatientVerificationSteps = ({
  fetchPatientByAadhar,
  fetchPatientByPhone,
  sendOtp,
  onConfirm,
  onCancel,
  otpLength = 4,
  patientsFallback = [
    {
      id: 1,
      fullName: 'Rajesh Kumar',
      gender: 'Male',
      dateOfBirth: '1985-05-15',
      phoneNumber: '9876543210',
      aadharNumber: '123456789012',
      address: '123, MG Road, Bangalore, Karnataka',
    },
  ],
}) => {
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
  const [showOtpAlert, setShowOtpAlert] = useState(false);
  const defaultFetchPatientByAadhar = async (aadharNumber) =>
    patientsFallback.find((p) => p.aadharNumber === aadharNumber) || null;
  const defaultFetchPatientByPhone = async (phoneNumber) =>
    patientsFallback.find((p) => p.phoneNumber === phoneNumber) || null;

  const handleAadharSubmit = () => {
    if (!formData.aadharNumber.trim()) {
      setErrors({ aadharNumber: 'Aadhar number is required' });
      return;
    }
    if (!validateAadhar(formData.aadharNumber.trim())) {
      setErrors({ aadharNumber: 'Enter a valid 12-digit Aadhar' });
      return;
    }
    setErrors({});
    setShowFingerprintScanner(true);
  };

  const handleFingerprintScanStart = () => setIsScanning(true);

  const handleFingerprintComplete = async () => {
    setIsVerifying(true);
    await new Promise((r) => setTimeout(r, 2000));
    const patient = await defaultFetchPatientByAadhar(formData.aadharNumber);
    if (patient) {
      setPatientData(patient);
      setShowFingerprintScanner(false);
      setStep(3);
    } else setErrors({ aadharNumber: 'Patient not found' });
    setIsVerifying(false);
    setIsScanning(false);
  };

  const handlePhoneSendOtp = async () => {
    if (!validatePhone(formData.phoneNumber.trim())) {
      setErrors({ phoneNumber: 'Enter a valid 10-digit phone' });
      return;
    }
    setIsVerifying(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSentOtp('1234');
    setVerificationMethod('phone');
    setShowOtpAlert(true);
    setIsVerifying(false);
  };

  const handleOtpVerification = async () => {
    if (formData.otp !== sentOtp) {
      setErrors({ otp: 'Invalid OTP' });
      return;
    }
    setIsVerifying(true);
    const patient = await defaultFetchPatientByPhone(formData.phoneNumber);
    if (patient) {
      setPatientData(patient);
      setStep(3);
    } else setErrors({ otp: 'Patient not found' });
    setIsVerifying(false);
  };

  return (
    <div className="p-2 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-white rounded-2xl">
        {showOtpAlert && (
          <OtpAlert phone={formData.phoneNumber} otp={sentOtp} onDismiss={() => setShowOtpAlert(false)} />
        )}
        <ProgressIndicator step={step} />

        {/* Step 1: Verification Options */}
        {step === 1 && !showFingerprintScanner && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Aadhar Card */}
            <div className="p-6 bg-white rounded-xl border border-gray-200 transition-all hover:shadow-sm">
              <div className="flex flex-col items-center text-center">
                <CreditCard className="text-[#01D48C]" size={32} />
                <h3 className="h3-heading">Aadhar Card</h3>
                <p className="paragraph mb-4">Secure biometric verification</p>
                <AadharInput
                  value={formData.aadharNumber}
                  onChange={(val) => setFormData({ ...formData, aadharNumber: val })}
                  error={errors.aadharNumber}
                />
                <button
                  onClick={handleAadharSubmit}
                  disabled={isVerifying}
                  className="btn btn-primary mt-4"
                >
                  <Fingerprint size={20} /> Use this method
                </button>
              </div>
            </div>
            {/* Phone Number */}
            <div className="p-6 bg-white rounded-xl border border-gray-200 transition-all hover:shadow-sm">
              <div className="flex flex-col items-center text-center">
                <Phone className="text-[#01D48C]" size={32} />
                <h3 className="h3-heading">Phone Number</h3>
                <p className="paragraph mb-4">Verify using OTP</p>
                {verificationMethod !== 'phone' ? (
                  <div className="w-full max-w-xs mx-auto space-y-4">
                    <input
                      type="tel"
                      maxLength={10}
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, phoneNumber: e.target.value.replace(/[^\d]/g, '') })
                      }
                      className={`input-field w-full ${errors.phoneNumber ? 'input-error' : ''}`}
                      placeholder="9876543210"
                    />
                    {errors.phoneNumber && (
                      <p className="error-text">{errors.phoneNumber}</p>
                    )}
                    <button
                      onClick={handlePhoneSendOtp}
                      disabled={isVerifying}
                      className="btn btn-primary w-full"
                    >
                      {isVerifying ? (
                        <>
                          <Loader2 className="animate-spin" size={20} /> Sending...
                        </>
                      ) : (
                        <>
                          <Lock size={20} /> Use this method
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="w-full mt-2">
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
                      <p className="paragraph text-center">
                        Enter OTP sent to {formData.phoneNumber}
                      </p>
                      <OtpInput
                        length={otpLength}
                        value={formData.otp}
                        onChange={(val) => setFormData({ ...formData, otp: val })}
                      />
                      {errors.otp && <p className="error-text text-center">{errors.otp}</p>}
                      <div className="flex justify-center">
                        <button
                          onClick={handleOtpVerification}
                          className="btn btn-primary mt-2"
                        >
                          <CheckCircle size={20} /> Verify OTP
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Fingerprint */}
        {showFingerprintScanner && (
          <div className="mt-10">
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

        {/* Step 3: Confirmation */}
        {step === 3 && patientData && (
          <div className="mt-10 space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border-t-4 border-[#01D48C]">
              <div className="flex flex-col md:flex-row items-start gap-6">
                {/* Left Side: Details */}
                <div className="flex-1 w-full">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-800">
                    <div className="p-3 rounded-lg flex gap-3 items-center">
                      <User className="text-[#01D48C]" size={18} />
                      <span>{patientData.gender}</span>
                    </div>
                    <div className="p-3 rounded-lg flex gap-3 items-center">
                      <Calendar className="text-[#01D48C]" size={18} />
                      <span>{patientData.dateOfBirth}</span>
                    </div>
                    <div className="p-3 rounded-lg flex gap-3 items-center">
                      <Phone className="text-[#01D48C]" size={18} />
                      <span>{patientData.phoneNumber}</span>
                    </div>
                    <div className="p-3 rounded-lg flex gap-3 items-center">
                      <CreditCard className="text-[#01D48C]" size={18} />
                      <span>**** **** {patientData.aadharNumber.slice(-4)}</span>
                    </div>
                  </div>
                  <div className="mt-4 p-3 rounded-lg flex gap-3">
                    <MapPin className="text-[#01D48C]" size={18} />
                    <span>{patientData.address}</span>
                  </div>
                </div>
                {/* Right Side: Profile Circle and Name */}
                <div className="flex flex-col items-center md:items-end w-full md:w-auto mt-4 md:mt-0">
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#01D48C] to-[#248070] text-white flex items-center justify-center text-4xl font-bold shadow-lg relative profile-circle">
                    {patientData.fullName.charAt(0)}
                    <CheckCircle className="absolute bottom-1 right-1 bg-[#68c723] text-white rounded-full" size={20} />
                  </div>
                  <h3 className="h2-heading">{patientData.fullName}</h3>
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-4 mt-6 flex-wrap">
              <button
                onClick={() => {
                  setStep(1);
                  setPatientData(null);
                  onCancel && onCancel();
                }}
                className="btn btn-secondary"
              >
                <X size={18} className="inline mr-1" /> Not {patientData.fullName}
              </button>
              <button
                onClick={() => onConfirm && onConfirm(patientData)}
                className="btn btn-primary"
              >
                <CheckCircle size={18} className="inline mr-1" /> Yes, that’s me
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientVerificationSteps;
