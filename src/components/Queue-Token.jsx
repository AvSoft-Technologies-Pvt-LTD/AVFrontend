import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Activity, CheckCircle, X, ChevronDown } from 'lucide-react';
import {
  getSpecializationsBySymptoms,
  createQueueToken,
  getAllSymptoms,
  getDoctorsBySpecialty
} from "../utils/masterService";
import AadharVerificationFlow from '../components/AadharVerification/Profile';

const TOKENS_KEY = 'hospital_tokens';

const TokenGenerator = () => {
  const dispatch = useDispatch();
  const doctorId = useSelector((state) => state.auth.doctorId);

  // State
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [isVerifying, setIsVerifying] = useState(false);
  const [patientData, setPatientData] = useState(null);
  const [symptoms, setSymptoms] = useState('');
  const [suggestedSpecializations, setSuggestedSpecializations] = useState([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState(null);
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [priority, setPriority] = useState('normal');
  const [consultationType, setConsultationType] = useState('opd');
  const [isSearchingSpecializations, setIsSearchingSpecializations] = useState(false);
  const [allSymptoms, setAllSymptoms] = useState([]);
  const [showSymptomsSuggestions, setShowSymptomsSuggestions] = useState(false);
  const [filteredSymptoms, setFilteredSymptoms] = useState([]);
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [lastTokenDetails, setLastTokenDetails] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [currentSlotGroup, setCurrentSlotGroup] = useState(0);

  // Fetch all symptoms
  useEffect(() => {
    const fetchAllSymptoms = async () => {
      try {
        const response = await getAllSymptoms();
        const symptoms = Array.isArray(response.data)
          ? response.data.map(item => item.name || item.label || item)
          : [];
        setAllSymptoms(symptoms);
        setFilteredSymptoms(symptoms); // Show all symptoms by default
      } catch (error) {
        console.error("Failed to fetch symptoms:", error);
        setAllSymptoms([]);
        setFilteredSymptoms([]);
      }
    };
    fetchAllSymptoms();
  }, []);

  // Filter symptoms based on input
  useEffect(() => {
    if (symptoms.trim() === '') {
      setFilteredSymptoms(allSymptoms);
    } else {
      const filtered = allSymptoms.filter(symptom =>
        symptom.toLowerCase().includes(symptoms.toLowerCase())
      );
      setFilteredSymptoms(filtered);
    }
  }, [symptoms, allSymptoms]);

  // Toggle dropdown visibility
  const toggleSymptomsDropdown = () => {
    setShowSymptomsSuggestions(!showSymptomsSuggestions);
  };

  // Get today's date
  function getTodayDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  // Fetch specializations by symptoms
  useEffect(() => {
    if (symptoms) {
      const fetchSpecializations = async () => {
        try {
          const response = await getSpecializationsBySymptoms({ q: symptoms });
          const specialties = Array.isArray(response.data)
            ? response.data.map(item => ({
                id: item.id || item.specialityId,
                name: item.name || item.label || item.specializationName || item,
              }))
            : [];
          setSuggestedSpecializations(specialties);
        } catch (error) {
          console.error("Failed to fetch specializations:", error);
          setSuggestedSpecializations([]);
        }
      };
      fetchSpecializations();
    }
  }, [symptoms]);

  // Fetch doctors by specialty
  useEffect(() => {
    if (selectedSpecialization?.id) {
      const fetchDoctorsBySpecialty = async () => {
        try {
          setIsSearchingSpecializations(true);
          const response = await getDoctorsBySpecialty(selectedSpecialization.id);
          const doctors = response.data || [];
          const processedDoctors = doctors.map(doctor => ({
            id: doctor.id || doctor.doctorId,
            doctorId: doctor.doctorId || doctor.id,
            name: doctor.name || doctor.doctorName || 'Unknown Doctor',
            specializationName: doctor.specializationName || doctor.specialty || selectedSpecialization?.name,
            fees: doctor.fees || doctor.consultationFee || 0,
            experience: doctor.experience || 0,
            education: doctor.education || doctor.qualification || '',
            city: doctor.city || doctor.location || '',
            hospital: doctor.hospital || '',
            image: doctor.image || doctor.photo || '',
            availability: doctor.availability || [],
            bookedSlots: doctor.bookedSlots || [],
            queue: doctor.queue || Math.floor(Math.random() * 10),
          }));
          setAvailableDoctors(processedDoctors);
        } catch (error) {
          console.error("Failed to fetch doctors:", error);
          setAvailableDoctors([]);
        } finally {
          setIsSearchingSpecializations(false);
        }
      };
      fetchDoctorsBySpecialty();
    }
  }, [selectedSpecialization?.id]);

  // Get available dates for selected doctor
  const getAvailableDates = (doctor) => {
    if (Array.isArray(doctor.availability) && doctor.availability.length > 0) {
      return doctor.availability.map(slot => ({
        date: slot.date,
        day: new Date(slot.date).toLocaleDateString('en-US', { weekday: 'short' }),
        available: slot.available || true,
      }));
    }
    return [];
  };

  // Get available time slots for selected doctor and date
  const getAvailableSlots = (doctor, date) => {
    if (!doctor || !date) return [];
    const slot = doctor.availability?.find(s => s.date === date);
    if (!slot?.times) return [];
    const normalizeSlotEntry = (entry) => {
      if (entry && typeof entry === 'object') {
        const rawTime = entry.time || entry.slotTime || entry.startTime || '';
        return {
          time: typeof rawTime === 'string' ? rawTime.trim() : rawTime,
          slotId: entry.slotId ?? entry.id ?? null,
        };
      }
      return {
        time: typeof entry === 'string' ? entry.trim() : entry,
        slotId: null,
      };
    };
    const slotLevelBooked = Array.isArray(slot.bookedSlots) ? slot.bookedSlots : [];
    const doctorLevelBooked = Array.isArray(doctor.bookedSlots) ? doctor.bookedSlots : [];
    const bookedEntries = [...slotLevelBooked, ...doctorLevelBooked]
      .map(normalizeSlotEntry)
      .filter(item => item.time);
    const isSameSlot = (booked, candidate) => {
      const bookedId = booked.slotId ?? null;
      const candidateId = candidate.slotId ?? null;
      if (bookedId !== null && candidateId !== null) {
        return bookedId === candidateId;
      }
      const bookedTime = (booked.time ?? '').toString().trim();
      const candidateTime = (candidate.time ?? '').toString().trim();
      return bookedTime === candidateTime;
    };
    return slot.times
      .map(entry => {
        const normalized = normalizeSlotEntry(entry);
        if (!normalized.time) {
          return null;
        }
        const isBooked = bookedEntries.some(booked => isSameSlot(booked, normalized));
        return {
          ...normalized,
          isBooked,
        };
      })
      .filter(Boolean);
  };

  // Get visible slots (12 at a time)
  const getVisibleSlots = (allSlots) => {
    const startIndex = currentSlotGroup * 12;
    const endIndex = startIndex + 12;
    return allSlots.slice(startIndex, endIndex);
  };

  // Handle slot navigation
  const handleSlotNavigation = (direction) => {
    const totalSlots = getAvailableSlots(selectedDoctor, selectedDate).length;
    const totalGroups = Math.ceil(totalSlots / 12);
    if (direction === 'left') {
      setCurrentSlotGroup(prev => Math.max(0, prev - 1));
    } else {
      setCurrentSlotGroup(prev => Math.min(totalGroups - 1, prev + 1));
    }
  };

  // Reset slot group when date changes
  useEffect(() => {
    setCurrentSlotGroup(0);
  }, [selectedDate]);

  // Handlers
  const handlePatientConfirm = (confirmedPatientData) => {
    setPatientData({
      ...confirmedPatientData,
      fullName: confirmedPatientData.name || confirmedPatientData.fullName || 'Patient',
      gender: confirmedPatientData.gender || 'N/A',
      phoneNumber: confirmedPatientData.phoneNumber || 'N/A',
    });
    setStep(2);
  };

  const handlePatientCancel = () => {
    setPatientData(null);
  };

  const handleSymptomSelect = (selectedSymptom) => {
    setSymptoms(selectedSymptom);
    setShowSymptomsSuggestions(false);
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
      const specializations = response.data?.map(spec => ({
        id: spec.id,
        name: typeof spec === 'string' ? spec : spec.specializationName,
        description: `Specialization for ${symptoms}`,
      })) || [];
      if (specializations.length > 0) {
        setSuggestedSpecializations(specializations);
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

  const handleSpecializationSelect = (spec) => {
    setSelectedSpecialization(spec);
    setStep(3);
  };

  const clearSlotError = (prevErrors = {}) => {
    if (!prevErrors.slot) return prevErrors;
    const { slot, ...rest } = prevErrors;
    return rest;
  };

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    const today = getTodayDate();
    setSelectedDate(today);
    setSelectedTime('');
    setSelectedSlotId(null);
    setIsLoadingSlots(true);
    setErrors(prev => clearSlotError(prev));
    const dates = getAvailableDates(doctor);
    setAvailableDates(dates);
    setTimeout(() => {
      const slots = getAvailableSlots(doctor, today);
      setAvailableSlots(slots);
      setIsLoadingSlots(false);
    }, 500);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime('');
    setSelectedSlotId(null);
    setIsLoadingSlots(true);
    setErrors(prev => clearSlotError(prev));
    setTimeout(() => {
      const slots = getAvailableSlots(selectedDoctor, date);
      setAvailableSlots(slots);
      setIsLoadingSlots(false);
    }, 500);
  };

  const handleTimeSelect = ({ time, slotId }) => {
    setSelectedTime(time);
    setSelectedSlotId(slotId ?? null);
    if (slotId !== null && slotId !== undefined) {
      setErrors(prev => clearSlotError(prev));
    } else {
      setErrors(prev => ({ ...prev, slot: 'Selected slot is missing an identifier. Please choose another slot.' }));
    }
  };

  const handleGenerateToken = async () => {
    if (selectedSlotId === null || selectedSlotId === undefined) {
      setErrors(prev => ({ ...prev, slot: 'Please select a valid slot before generating a token.' }));
      return;
    }
    const patientId = patientData?.id || patientData?.patientId;
    if (!patientId) {
      setErrors(prev => ({ ...prev, patient: 'Patient information is missing. Please verify again.' }));
      setStep(1);
      return;
    }
    setIsVerifying(true);
    try {
      const rawSpecializationId = Number(
        selectedSpecialization?.id ||
        selectedSpecialization?.specializationId ||
        selectedSpecialization?.specialityId ||
        selectedSpecialization?.specialtyId ||
        0
      );
      const doctorIdentifier = Number(selectedDoctor?.doctorId || selectedDoctor?.id || 0);
      const slotIdentifier = Number(selectedSlotId);
      const normalizedConsultationType = consultationType === 'virtual' ? 'VIRTUAL' : 'PHYSICAL';
      const waitMinutes = consultationType === 'virtual'
        ? (priority === 'emergency' ? 2 : 15)
        : (priority === 'emergency' ? 5 : 30);
      const departmentId = Number(selectedDoctor?.departmentId || rawSpecializationId || 0);
      const requestBody = {
        patientName: (patientData.fullName || '').trim(),
        phoneNumber: patientData.phoneNumber,
        departmentId,
        slotId: slotIdentifier,
        doctorId: doctorIdentifier,
        patientId: 1,
        priorityLevel: priority.toUpperCase(),
        reasonForVisit: (symptoms || 'General Consultation').trim(),
        status: 'WAITING',
        estimatedWaitMinutes: waitMinutes,
        consultationType: normalizedConsultationType,
      };
      const response = await createQueueToken(requestBody);
      console.log('Queue token created:', response?.data || response);
      const tokenResponse = (response && response.data) ? response.data : response;
      const normalizedToken = {
        tokenNumber: tokenResponse?.tokenNumber || null,
        patientName: tokenResponse?.patientName || patientData.fullName,
        phoneNumber: tokenResponse?.phoneNumber || patientData.phoneNumber,
        doctorName: tokenResponse?.doctorName || selectedDoctor?.name || '',
        specialization: tokenResponse?.departmentName || selectedSpecialization?.name || '',
        priorityLevel: tokenResponse?.priorityLevel || priority.toUpperCase(),
        reasonForVisit: tokenResponse?.reasonForVisit || symptoms || 'General Consultation',
        status: tokenResponse?.status || 'WAITING',
        slotDate: tokenResponse?.slotDate || selectedDate || null,
        slotTime: tokenResponse?.slotTime || selectedTime || null,
      };
      setLastTokenDetails(normalizedToken);
      setAvailableSlots(prev =>
        prev.filter(slot => {
          const timeValue = slot.time;
          const slotIdValue = slot.slotId ?? null;
          return !(
            timeValue === selectedTime &&
            (slotIdValue ?? null) === (selectedSlotId ?? null)
          );
        })
      );
      setSelectedTime('');
      setSelectedSlotId(null);
      setErrors(prev => {
        const cleared = clearSlotError(prev);
        const { patient, ...rest } = cleared || {};
        return rest;
      });
      setStep(4);
    } catch (error) {
      console.error('API Error:', error);
      setErrors({ api: 'Failed to generate token. Please try again.' });
    } finally {
      setIsVerifying(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setErrors({});
    setPatientData(null);
    setSymptoms('');
    setSuggestedSpecializations([]);
    setSelectedSpecialization(null);
    setAvailableDoctors([]);
    setSelectedDoctor(null);
    setPriority('normal');
    setConsultationType('opd');
    setSelectedDate(getTodayDate());
    setSelectedSlotId(null);
    setLastTokenDetails(null);
  };

  // Get next token number
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

  const formatDateFromArray = (dateArray) => {
    if (Array.isArray(dateArray) && dateArray.length >= 3) {
      const [year, month, day] = dateArray;
      const dateObj = new Date(year, (month ?? 1) - 1, day);
      if (!Number.isNaN(dateObj.getTime())) {
        return dateObj.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        });
      }
    }
    return null;
  };

  const formatDateString = (dateValue) => {
    if (!dateValue) return null;
    const dateObj = new Date(dateValue);
    if (Number.isNaN(dateObj.getTime())) return null;
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatLabelValue = (value) => {
    if (!value) return 'N/A';
    return value
      .toString()
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/(^|\s)\S/g, (match) => match.toUpperCase());
  };

  const formatTimeValue = (timeValue) => {
    if (!timeValue) return 'N/A';
    if (/[AP]M$/i.test(timeValue)) return timeValue;
    const [hoursStr, minutes = '00'] = timeValue.split(':');
    let hours = Number(hoursStr);
    if (Number.isNaN(hours)) return timeValue;
    const suffix = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes.padStart(2, '0')} ${suffix}`;
  };

  const to24HourTime = (timeValue) => {
    if (!timeValue) return '';
    if (!/[AP]M$/i.test(timeValue)) {
      return timeValue;
    }
    const [timePart, modifier] = timeValue.split(/\s+/);
    const [rawHours, rawMinutes = '00'] = timePart.split(':');
    let hours = Number(rawHours);
    let minutes = rawMinutes;
    if (Number.isNaN(hours)) return timeValue;
    const upperMod = modifier.toUpperCase();
    if (upperMod === 'PM' && hours < 12) {
      hours += 12;
    }
    if (upperMod === 'AM' && hours === 12) {
      hours = 0;
    }
    return `${hours.toString().padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  };

  const fallbackTokenNumber = `T${getNextTokenNumber().toString().padStart(3, '0')}`;
  const displayTokenNumber = lastTokenDetails?.tokenNumber || fallbackTokenNumber;
  const displayPatientName = lastTokenDetails?.patientName || patientData?.fullName || 'N/A';
  const displayPhoneNumber = lastTokenDetails?.phoneNumber || patientData?.phoneNumber || 'N/A';
  const displayDoctorName = lastTokenDetails?.doctorName || selectedDoctor?.name || 'N/A';
  const displaySpecialization = lastTokenDetails?.specialization || selectedSpecialization?.name || 'N/A';
  const displayPriorityRaw = lastTokenDetails?.priorityLevel || priority.toUpperCase();
  const displayPriority = formatLabelValue(displayPriorityRaw);
  const displayReason = lastTokenDetails?.reasonForVisit || symptoms || 'N/A';
  const displayStatus = formatLabelValue(lastTokenDetails?.status || 'WAITING');
  const displaySlotDate =
    formatDateFromArray(lastTokenDetails?.slotDate) ||
    formatDateString(lastTokenDetails?.slotDate) ||
    formatDateString(selectedDate) ||
    'N/A';
  const displaySlotTime = formatTimeValue(lastTokenDetails?.slotTime || selectedTime);

  // Render
  return (
    <div className="min-h-screen  p-4">
      <div className="max-w-full mx-auto">
        <div className="overflow-visible">
          {/* Header */}
          <div className=" p-6 text-white">
            <h1 className="h4-heading text-white">Hospital Token System</h1>
            <div className="flex items-center gap-2 text-sm opacity-90">
              <Activity size={16} />
              <span>Step {step} of 4</span>
            </div>
          </div>

          {/* Step 1: Patient Verification */}
          {step === 1 && (
            <div className=" max-w-full p-6">
              <AadharVerificationFlow
                onComplete={(verifiedData) => {
                  setPatientData(verifiedData);
                  setStep(2);
                }}
              />
            </div>
          )}

          {/* Step 2: Symptoms + Specializations */}
          {step === 2 && (
            <div className="p-6 max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Side - Dropdowns */}
                <div className="lg:col-span-1 space-y-4">
                  {/* Patient Info Header */}
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#01D48C] to-[#01B07A] flex items-center justify-center text-white font-bold shadow-lg">
                        {patientData?.fullName?.charAt(0)?.toUpperCase() || 'P'}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">{patientData?.fullName || 'Patient'}</h3>
                        <p className="text-xs text-gray-500">
                          {patientData?.gender || 'N/A'} • {patientData?.phoneNumber || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Symptoms Input with Suggestions */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Symptoms</label>
                    <div className="relative">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Describe your symptoms..."
                          value={symptoms}
                          onChange={(e) => setSymptoms(e.target.value)}
                          onClick={toggleSymptomsDropdown}
                          onFocus={toggleSymptomsDropdown}
                          className="w-full p-3 rounded-lg border border-gray-200 focus:border-[#01D48C] focus:ring-2 focus:ring-[#01D48C]/20 transition-all text-sm"
                        />
                        <ChevronDown
                          className="w-4 h-4 text-gray-500 absolute right-3 top-3 cursor-pointer"
                          onClick={toggleSymptomsDropdown}
                        />
                      </div>
                      {showSymptomsSuggestions && (
                        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200">
                          <div className="max-h-60 overflow-y-auto">
                            {filteredSymptoms.length > 0 ? (
                              filteredSymptoms.map((symptom, index) => (
                                <div
                                  key={index}
                                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 transition-colors"
                                  onMouseDown={() => {
                                    handleSymptomSelect(symptom);
                                    setShowSymptomsSuggestions(false);
                                  }}
                                >
                                  <div className="font-medium">{symptom}</div>
                                </div>
                              ))
                            ) : (
                              <div className="px-4 py-3 text-sm text-gray-500">No results</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Back Button */}
                  <button
                    onClick={() => setStep(1)}
                    className="w-full p-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    Back to Verification
                  </button>
                </div>

                {/* Right Side - Symptoms & Specializations */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Selected Symptoms Card */}
                  <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-lg text-gray-800">Selected Symptoms</h3>
                      {symptoms && (
                        <button
                          onClick={() => {
                            setSymptoms('');
                            setShowSymptomsSuggestions(false);
                          }}
                          className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
                        >
                          <X size={14} /> Clear
                        </button>
                      )}
                    </div>
                    {symptoms ? (
                      <div className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 flex items-start">
                          <div className="bg-blue-100 p-2 rounded-full mr-3">
                            <Activity className="text-blue-600" size={18} />
                          </div>
                          <div>
                            <p className="text-gray-800 font-medium">{symptoms}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Selected on {new Date().toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                        {/* Suggested Specializations */}
                        <div className="mt-6">
                          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                            <Activity className="mr-2 text-green-500" size={16} />
                            Suggested Specializations
                          </h4>
                          {isSearchingSpecializations ? (
                            <div className="flex justify-center py-4">
                              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                            </div>
                          ) : suggestedSpecializations.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {suggestedSpecializations.slice(0, 4).map((spec) => (
                                <div
                                  key={spec.id}
                                  onClick={() => handleSpecializationSelect(spec)}
                                  className="p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md border-gray-200 hover:border-green-300 hover:bg-green-50"
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="bg-green-100 p-2 rounded-lg">
                                      <Activity className="text-green-600" size={16} />
                                    </div>
                                    <div>
                                      <p className="font-medium text-gray-800 text-sm">{spec.name}</p>
                                      <p className="text-xs text-gray-500 mt-1">
                                        {spec.description || 'Specialist for your symptoms'}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : symptoms ? (
                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                              <div className="flex">
                                <div className="flex-shrink-0">
                                  <Activity className="h-5 w-5 text-yellow-400" />
                                </div>
                                <div className="ml-3">
                                  <p className="text-sm text-yellow-700">
                                    No specializations found for these symptoms. Try being more specific.
                                  </p>
                                </div>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
                          <Activity className="text-gray-400" size={24} />
                        </div>
                        <h4 className="text-gray-600 font-medium mb-1">No symptoms selected</h4>
                        <p className="text-sm text-gray-500 max-w-md mx-auto">
                          Select symptoms to see suggested specializations.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Doctor Selection */}
          {step === 3 && (
            <div className="p-6 space-y-6">
              <div className="bg-green-50 p-4 rounded-xl border-l-4 border-green-500">
                <p className="text-sm text-green-800">
                  <strong>Specialization:</strong> {selectedSpecialization?.name}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableDoctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    onClick={() => handleDoctorSelect(doctor)}
                    className={`p-6 border-2 rounded-2xl cursor-pointer transition-all hover:shadow-lg ${selectedDoctor?.id === doctor.id
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
                          <p className="text-sm text-gray-600">{doctor.education}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Experience: {doctor.experience}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Fees: ₹{doctor.fees}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Date and Time Selection */}
              {selectedDoctor && (
                <div className="bg-gray-50 p-6 rounded-2xl space-y-6">
                  <h3 className="text-lg font-bold text-gray-800">Select Appointment Date & Time</h3>
                  {/* Date (Today - Fixed) */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">Appointment Date (Today)</label>
                    <input
                      type="date"
                      className="w-full p-3 rounded-lg border border-gray-200 bg-gray-100 cursor-not-allowed text-sm"
                      value={selectedDate}
                      readOnly
                    />
                    {selectedDate && (
                      <p className="text-xs text-green-600">
                        Selected: {new Date(selectedDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    )}
                  </div>
                  {/* Time Slot Selection */}
                  {selectedDate && (
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">Available Time Slots</label>
                      {isLoadingSlots ? (
                        <div className="text-center py-6">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#01D48C] mx-auto mb-3"></div>
                          <p className="text-gray-600 text-sm">Loading available slots...</p>
                        </div>
                      ) : availableSlots.length > 0 ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-4 gap-2">
                            {getVisibleSlots(availableSlots).map((timeSlot, index) => {
                              const timeValue = timeSlot.time;
                              const slotId = timeSlot.slotId ?? null;
                              const isBooked = selectedDoctor?.bookedSlots?.some(slot => {
                                const bookedTime = typeof slot === 'object' ? slot.time : slot;
                                const bookedSlotId = typeof slot === 'object' ? slot.slotId ?? null : null;
                                return bookedTime === timeValue && (bookedSlotId ?? null) === (slotId ?? null);
                              });
                              const isSelected = selectedTime === timeValue && (selectedSlotId ?? null) === (slotId ?? null);
                              return (
                                <button
                                  key={`${timeValue}-${slotId ?? index}`}
                                  disabled={isBooked}
                                  onClick={() => handleTimeSelect(timeSlot)}
                                  className={`py-2 px-3 rounded-lg text-xs font-medium transition-all duration-200 relative ${isBooked
                                    ? "bg-red-100 text-red-400 cursor-not-allowed border border-red-200"
                                    : isSelected
                                      ? "bg-gradient-to-r from-[#01D48C] to-[#01B07A] text-white shadow-md transform scale-105"
                                      : "bg-white border border-gray-200 text-gray-700 hover:bg-green-50 hover:border-[#01D48C]"
                                    }`}
                                >
                                  {timeValue}
                                  {isBooked && (
                                    <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                          {/* Slot navigation arrows */}
                          {availableSlots.length > 12 && (
                            <div className="flex items-center justify-center gap-6 mt-2">
                              <button
                                type="button"
                                onClick={() => handleSlotNavigation('left')}
                                className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 text-base text-gray-700 hover:bg-gray-100 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                                disabled={currentSlotGroup === 0}
                              >
                                &#8592;
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSlotNavigation('right')}
                                className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 text-base text-gray-700 hover:bg-gray-100 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                                disabled={currentSlotGroup >= Math.ceil(availableSlots.length / 12) - 1}
                              >
                                &#8594;
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-6 bg-gray-100 rounded-lg border border-gray-200">
                          <Activity className="text-gray-400 text-2xl mx-auto mb-2" />
                          <p className="text-gray-600 text-sm">No slots available for this date</p>
                          <p className="text-gray-500 text-xs mt-1">Please select a different date</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              <div className="bg-gray-50 p-6 rounded-2xl">
                <div className="flex gap-4 mb-6">
                  <div className="flex-1">
                    <label className="block text-lg font-bold mb-4">Consultation Type</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setConsultationType('opd')}
                        className={`p-4 rounded-xl border-2 transition-all ${consultationType === 'opd'
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        <div className="font-bold text-lg">OPD Visit</div>
                        <div className="text-sm text-gray-500 mt-1">In-person consultation</div>
                      </button>
                      <button
                        onClick={() => setConsultationType('virtual')}
                        className={`p-4 rounded-xl border-2 transition-all ${consultationType === 'virtual'
                          ? 'border-purple-500 bg-purple-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        <div className="font-bold text-lg text-purple-600">Virtual</div>
                        <div className="text-sm text-gray-500 mt-1">Online consultation</div>
                      </button>
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-lg font-bold mb-4">Priority Level</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setPriority('normal')}
                        className={`p-4 rounded-xl border-2 transition-all ${priority === 'normal'
                          ? 'border-green-500 bg-green-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        <div className="font-bold text-lg">Normal</div>
                        <div className="text-sm text-gray-500 mt-1">
                          {consultationType === 'virtual' ? '~15 min wait' : '~30 min wait'}
                        </div>
                      </button>
                      <button
                        onClick={() => setPriority('emergency')}
                        className={`p-4 rounded-xl border-2 transition-all ${priority === 'emergency'
                          ? 'border-red-500 bg-red-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        <div className="font-bold text-lg text-red-600">Emergency</div>
                        <div className="text-sm text-gray-500 mt-1">
                          {consultationType === 'virtual' ? '~2 min wait' : '~5 min wait'}
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => {
                    setStep(2);
                    setSuggestedSpecializations([]);
                    setSelectedSpecialization(null);
                  }}
                  className="btn btn-secondary"
                >
                  Go Back
                </button>
                <button
                  onClick={handleGenerateToken}
                  className="btn btn-primary"
                  disabled={!selectedDoctor || !selectedDate || !selectedTime}
                >
                  {isVerifying ? 'Generating...' : !selectedDoctor ? 'Select Doctor First' : !selectedDate ? 'Select Date' : !selectedTime ? 'Select Time Slot' : 'Generate Token'}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <div className="p-6 space-y-6 text-center">
              <div className="flex justify-center">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
                  <CheckCircle className="text-green-500" size={60} />
                </div>
              </div>
              <h2 className="h2-heading">Token Generated!</h2>
              <div className="bg-gradient-to-r from-[#01D48C] to-[#01B07A] text-white p-12 rounded-3xl shadow-2xl">
                <p className="text-lg opacity-90 mb-2">Last Token Number</p>
                <p className="text-3xl font-black mb-6">{displayTokenNumber}</p>
                <div className="bg-white/15 rounded-2xl p-6 backdrop-blur-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left text-sm text-white/90">
                    <div>
                      <p className="uppercase text-xs tracking-wide opacity-80">Patient Name</p>
                      <p className="text-base font-semibold text-white">{displayPatientName}</p>
                    </div>
                    <div>
                      <p className="uppercase text-xs tracking-wide opacity-80">Doctor Name</p>
                      <p className="text-base font-semibold text-white">{displayDoctorName}</p>
                    </div>
                    <div>
                      <p className="uppercase text-xs tracking-wide opacity-80">Specialization</p>
                      <p className="text-base font-semibold text-white">{displaySpecialization}</p>
                    </div>
                    <div>
                      <p className="uppercase text-xs tracking-wide opacity-80">Priority Level</p>
                      <p className="text-base font-semibold text-white">{displayPriority}</p>
                    </div>
                    <div>
                      <p className="uppercase text-xs tracking-wide opacity-80">Appointment Date</p>
                      <p className="text-base font-semibold text-white">{displaySlotDate}</p>
                    </div>
                    <div>
                      <p className="uppercase text-xs tracking-wide opacity-80">Appointment Time</p>
                      <p className="text-base font-semibold text-white">{displaySlotTime}</p>
                    </div>
                    <div>
                      <p className="uppercase text-xs tracking-wide opacity-80">Status</p>
                      <p className="text-base font-semibold text-white">{displayStatus}</p>
                    </div>
                    <div>
                      <p className="uppercase text-xs tracking-wide opacity-80">Reason For Visit</p>
                      <p className="text-base font-semibold text-white">{displayReason}</p>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={resetForm}
                className="btn btn-primary mx-auto"
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