import React, { useState, useEffect, useRef } from 'react';
import {
  User, Phone, CreditCard, CheckCircle, Fingerprint,
  Calendar, Droplet, MapPin, Lock, Loader2, ChevronRight,
  Activity, Stethoscope, Clock, AlertCircle, Search, Users, List
} from 'lucide-react';
import { getSpecializationsBySymptoms } from "../utils/masterService";

const TOKENS_KEY = 'hospital_tokens';
const validatePhone = (p) => /^\d{10}$/.test(p);
const validateAadhar = (a) => /^\d{12}$/.test(a);

const getNextTokenNumber = () => {
  try {
    const tokens = JSON.parse(localStorage.getItem(TOKENS_KEY) || '[]');
    return tokens.length
      ? tokens.reduce((max, token) => Math.max(max, parseInt((token.tokenNumber || '').replace(/\D/g, ''))), 0) + 1
      : 1;
  } catch {
    return 1;
  }
};

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

const hardcodedDoctors = [
  { id: 1, name: 'Dr. Rajesh Kumar', degree: 'MD', experience: '15 years', availability: 'Available', specialization: 'Neurology', queue: 3 },
  { id: 2, name: 'Dr. Priya Sharma', degree: 'MBBS, MS', experience: '10 years', availability: 'Available', specialization: 'General Medicine', queue: 5 },
  { id: 3, name: 'Dr. Amit Patel', degree: 'MD, DM', experience: '20 years', availability: 'Busy', specialization: 'ENT', queue: 0 },
  { id: 4, name: 'Dr. Anjali Singh', degree: 'MBBS, MD', experience: '12 years', availability: 'Available', specialization: 'Cardiology', queue: 2 },
  { id: 5, name: 'Dr. Vikram Rao', degree: 'MS, MCh', experience: '18 years', availability: 'Available', specialization: 'Orthopedics', queue: 4 },
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
const TokenGenerator = () => {
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
  const [symptoms, setSymptoms] = useState('');
  const [suggestedSpecializations, setSuggestedSpecializations] = useState([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState(null);
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [priority, setPriority] = useState('normal');
  const [isSearchingSpecializations, setIsSearchingSpecializations] = useState(false);

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

  const handleSymptomsSubmit = async () => {
    if (!symptoms.trim()) {
      setErrors({ symptoms: 'Please describe your symptoms' });
      return;
    }
    setIsSearchingSpecializations(true);
    setErrors({});
    try {
      const response = await getSpecializationsBySymptoms({ q: symptoms });
      if (response.data && response.data.length > 0) {
        const mappedSpecializations = response.data.map((spec, index) => ({
          id: index + 1,
          name: spec,
          description: `Specialization for ${symptoms}`,
        }));
        setSuggestedSpecializations(mappedSpecializations);
      } else {
        setErrors({ symptoms: 'No specializations found. Please try different symptoms.' });
      }
    } catch (error) {
      setErrors({ symptoms: 'Error loading specializations. Please try again.' });
      console.error("Error fetching specializations:", error);
    } finally {
      setIsSearchingSpecializations(false);
    }
  };

  useEffect(() => {
    const fetchSpecializations = async () => {
      if (!symptoms.trim()) {
        setSuggestedSpecializations([]);
        return;
      }
      setIsSearchingSpecializations(true);
      try {
        const response = await getSpecializationsBySymptoms({ q: symptoms });
        if (response.data && response.data.length > 0) {
          const mappedSpecializations = response.data.map((spec, index) => ({
            id: index + 1,
            name: spec,
            description: `Specialization for ${symptoms}`,
          }));
          setSuggestedSpecializations(mappedSpecializations);
        } else {
          setSuggestedSpecializations([]);
        }
      } catch (error) {
        console.error("Error fetching specializations:", error);
        setSuggestedSpecializations([]);
      } finally {
        setIsSearchingSpecializations(false);
      }
    };
    const debounceTimer = setTimeout(() => {
      fetchSpecializations();
    }, 1000);
    return () => clearTimeout(debounceTimer);
  }, [symptoms]);

  const handleSpecializationSelect = (spec) => {
    setSelectedSpecialization(spec);
    const filteredDoctors = hardcodedDoctors.filter(
      (doc) => doc.specialization.toLowerCase() === spec.name.toLowerCase()
    );
    setAvailableDoctors(filteredDoctors);
    setStep(4);
  };

  const handleGenerateToken = async () => {
    if (!selectedDoctor) {
      setErrors({ doctor: 'Please select a doctor' });
      return;
    }
    setIsVerifying(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const tokenNum = getNextTokenNumber();
    const newToken = {
      id: `token-${Date.now()}`,
      tokenNumber: `T${tokenNum.toString().padStart(3, '0')}`,
      patientId: patientData.id,
      patientName: patientData.fullName,
      phoneNumber: patientData.phoneNumber,
      aadharNumber: patientData.aadharNumber,
      symptoms,
      specialization: selectedSpecialization?.name,
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      priority,
      status: 'waiting',
      generatedAt: new Date().toISOString(),
      queue: selectedDoctor.queue,
    };
    try {
      const tokens = JSON.parse(localStorage.getItem(TOKENS_KEY) || '[]');
      tokens.push(newToken);
      localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
    } catch (error) {
      console.error('Error saving token:', error);
    }
    setStep(5);
    setIsVerifying(false);
  };

  const resetForm = () => {
    setStep(1);
    setVerificationMethod(null);
    setFormData({ aadharNumber: '', phoneNumber: '', otp: '' });
    setErrors({});
    setPatientData(null);
    setSymptoms('');
    setSuggestedSpecializations([]);
    setSelectedSpecialization(null);
    setAvailableDoctors([]);
    setSelectedDoctor(null);
    setPriority('normal');
    setShowFingerprintScanner(false);
    setIsScanning(false);
  };

  // --- Render ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#01D48C] to-[#0E1630] p-6 text-white">
            <h1 className="h3-heading text-white">Hospital Token System</h1>
            <div className="flex items-center gap-2 text-sm opacity-90">
              <Activity size={16} />
              <span>Step {step} of 5</span>
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
                  onClick={() => setStep(3)}
                  className="btn btn-primary w-full"
                >
                  <CheckCircle size={20} />
                  Confirm
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Symptoms + Specializations */}
          {step === 3 && (
            <div className="p-6 space-y-5 max-w-4xl mx-auto custom-slide-in-left">
              {/* Patient Info Header */}
              <div className="flex items-center gap-4 bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#01D48C] to-[#01B07A] flex items-center justify-center text-white text-xl font-bold shadow-lg">
                  {patientData.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800">{patientData.fullName}</h3>
                  <p className="text-xs text-gray-500">
                    {patientData.gender} • {patientData.phoneNumber}
                  </p>
                </div>
              </div>

              {/* Symptoms Input */}
              <h2 className="h3-heading">Describe Your Symptoms</h2>
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 flex items-start gap-2">
                <AlertCircle className="text-blue-600 mt-0.5 flex-shrink-0" size={16} />
                <p className="text-xs text-blue-800">
                  Describe your symptoms in detail. Our AI will recommend the best specialization.
                </p>
              </div>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className={`input-field h-32 ${errors.symptoms ? 'input-error' : ''}`}
                placeholder="Example: I have severe headaches for 3 days with dizziness and nausea..."
              />
              {errors.symptoms && <p className="error-text">{errors.symptoms}</p>}

              {/* Specializations Display */}
              {suggestedSpecializations.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="h3-heading">Recommended Specializations</h3>
                    <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {suggestedSpecializations.length} matches found
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {suggestedSpecializations.map((spec, index) => (
                      <div
                        key={spec.id}
                        onClick={() => handleSpecializationSelect(spec)}
                        className={`group p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                          selectedSpecialization?.id === spec.id
                            ? 'border-[#01D48C] bg-green-50 shadow-md'
                            : 'border-gray-200 hover:border-[#01D48C] hover:bg-green-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#01D48C] to-[#01B07A] rounded-lg flex items-center justify-center text-white group-hover:scale-105 transition-transform flex-shrink-0">
                            <Stethoscope size={20} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-base text-gray-800 group-hover:text-[#01D48C] transition-colors">
                                {spec.name}
                              </h4>
                              {index === 0 && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                                  Best Match
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 mt-1">{spec.description}</p>
                          </div>
                          <ChevronRight className="text-gray-400 group-hover:text-[#01D48C] group-hover:translate-x-1 transition-all flex-shrink-0" size={20} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Back Button */}
              <button
                onClick={() => setStep(2)}
                className="btn btn-secondary w-full"
              >
                Back to Profile
              </button>
            </div>
          )}

          {/* Step 4: Doctor Selection */}
          {step === 4 && (
            <div className="p-6 space-y-6 custom-slide-in-right">
              <h2 className="h2-heading">Select Doctor</h2>
              <div className="bg-green-50 p-4 rounded-xl border-l-4 border-green-500">
                <p className="text-sm text-green-800">
                  <strong>Specialization:</strong> {selectedSpecialization?.name}
                </p>
              </div>
              <div className="space-y-4">
                {availableDoctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    onClick={() => setSelectedDoctor(doctor)}
                    className={`p-6 border-2 rounded-2xl cursor-pointer transition-all hover:shadow-lg ${
                      selectedDoctor?.id === doctor.id
                        ? 'border-[#01D48C] bg-green-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#01D48C] to-[#01B07A] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                          {doctor.name.split(' ')[1]?.charAt(0) || 'D'}
                        </div>
                        <div>
                          <h3 className="font-bold text-xl text-gray-800">{doctor.name}</h3>
                          <p className="text-sm text-gray-600">{doctor.degree}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            <Clock className="inline mr-1" size={12} />
                            Experience: {doctor.experience}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                          doctor.availability === 'Available'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {doctor.availability}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Users size={14} />
                          <span>Queue: {doctor.queue}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-gray-50 p-6 rounded-2xl">
                <label className="block text-lg font-bold mb-4">Priority Level</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setPriority('normal')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      priority === 'normal'
                        ? 'border-green-500 bg-green-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-bold text-lg">Normal</div>
                    <div className="text-sm text-gray-500 mt-1">~30 min wait</div>
                  </button>
                  <button
                    onClick={() => setPriority('emergency')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      priority === 'emergency'
                        ? 'border-red-500 bg-red-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-bold text-lg text-red-600">Emergency</div>
                    <div className="text-sm text-gray-500 mt-1">~5 min wait</div>
                  </button>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setStep(3);
                    setSuggestedSpecializations([]);
                    setSelectedSpecialization(null);
                  }}
                  className="btn btn-secondary w-full"
                >
                  Go Back
                </button>
                <button
                  onClick={handleGenerateToken}
                  disabled={!selectedDoctor || isVerifying}
                  className="btn btn-primary w-full"
                >
                  {isVerifying ? 'Generating...' : 'Generate Token'}
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Success */}
          {step === 5 && (
            <div className="p-6 space-y-6 text-center custom-slide-in-left">
              <div className="flex justify-center">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
                  <CheckCircle className="text-green-500" size={60} />
                </div>
              </div>
              <h2 className="h2-heading">Token Generated!</h2>
              <div className="bg-gradient-to-r from-[#01D48C] to-[#01B07A] text-white p-12 rounded-3xl shadow-2xl">
                <p className="text-lg opacity-90 mb-2">Your Token Number</p>
                <p className="text-2xl font-black mb-2">T{getNextTokenNumber().toString().padStart(3, '0')}</p>
                <div className="bg-white bg-opacity-20 rounded-xl p-4">
                  <p className="text-lg text-black">Estimated Wait Time</p>
                  <p className="text-2xl text-black font-bold mt-1">
                    {priority === 'emergency' ? '~5 minutes' : '~30 minutes'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-2xl">
                  <h3 className="font-bold text-xl mb-4">Patient Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-gray-600">Name</span>
                      <span className="font-semibold">{patientData?.fullName}</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-gray-600">Phone</span>
                      <span className="font-semibold">{patientData?.phoneNumber}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Gender</span>
                      <span className="font-semibold">{patientData?.gender}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-6 rounded-2xl">
                  <h3 className="font-bold text-xl mb-4">Appointment Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-gray-600">Doctor</span>
                      <span className="font-semibold">{selectedDoctor?.name}</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-gray-600">Specialization</span>
                      <span className="font-semibold">{selectedSpecialization?.name}</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-gray-600">Queue Position</span>
                      <span className="font-semibold">{selectedDoctor?.queue}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Priority</span>
                      <span className={`font-semibold ${priority === 'emergency' ? 'text-red-600' : 'text-green-600'}`}>
                        {priority === 'emergency' ? 'Emergency' : 'Normal'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={resetForm}
                className="btn btn-primary w-full"
              >
                Generate Another Token
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TokenGenerator;