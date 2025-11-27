import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { FaChevronLeft, FaChevronRight, FaMapMarkerAlt, FaStethoscope, FaCalendarAlt, FaClock, FaUser, FaHospital } from 'react-icons/fa';
import { ArrowLeft, ChevronDown } from "lucide-react";
import {
  getHospitalDropdown,
  getSpecializationsBySymptoms,
  getAllSymptoms,
  getDoctorsBySpecialty,
} from '../utils/masterService';
import { createAppointments } from '../utils/CrudService';

const MultiStepForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth?.user);
  const patientId = useSelector((state) => state.auth?.patientId) || 0;

  // Clear sessionStorage on unmount and navigation
  useEffect(() => {
    return () => {
      const formStateKeys = [
        'consultationType', 'symptoms', 'specialty', 'specialtyId', 'selectedState',
        'location', 'pincode', 'doctorType', 'hospitalName', 'hospitalId', 'minPrice', 'maxPrice',
        'fullAddress', 'isCurrentLocation', 'selectedDate', 'selectedTime', 'selectedSlotId'
      ];
      formStateKeys.forEach(key => {
        sessionStorage.removeItem(`formState_${key}`);
      });
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      const formStateKeys = [
        'consultationType', 'symptoms', 'specialty', 'specialtyId', 'selectedState',
        'location', 'pincode', 'doctorType', 'hospitalName', 'hospitalId', 'minPrice', 'maxPrice',
        'fullAddress', 'isCurrentLocation', 'selectedDate', 'selectedTime', 'selectedSlotId'
      ];
      formStateKeys.forEach(key => {
        sessionStorage.removeItem(`formState_${key}`);
      });
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Initial state (fresh start)
  const getInitialState = () => {
    return {
      consultationType: "Physical",
      symptoms: "",
      specialty: "",
      specialtyId: "",
      specialties: [],
      selectedDoctor: null,
      doctors: [],
      filteredDoctors: [],
      states: [],
      selectedState: "",
      cities: [],
      location: "",
      pincode: "",
      pincodeLoading: false,
      pincodeError: "",
      doctorType: "All",
      hospitalName: "",
      hospitalId: "",
      hospitalsOptions: [],
      hospitalsLoading: false,
      minPrice: "",
      maxPrice: "",
      selectedDate: "",
      selectedTime: "",
      selectedSlotId: 0,
      fullAddress: "",
      showBookingModal: false,
      showConfirmationModal: false,
      isLoading: false,
      loadingCities: false,
      loadingDoctors: false,
      isCurrentLocation: false,
    };
  };

  const [state, setState] = useState(getInitialState);
  const [symptomsDropdownOpen, setSymptomsDropdownOpen] = useState(false);
  const [symptomsSearch, setSymptomsSearch] = useState("");
  const [allSymptoms, setAllSymptoms] = useState([]);
  const [currentSlotGroup, setCurrentSlotGroup] = useState(0);

  // Update state and sessionStorage
  const updateState = (updates) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  // Fetch doctors by specialtyId
  const fetchDoctorsBySpecialty = async () => {
    if (!state.specialtyId) {
      console.log("No specialtyId provided, skipping doctor fetch");
      return;
    }
    try {
      updateState({ loadingDoctors: true });
      console.log("Fetching doctors for specialtyId:", state.specialtyId);
      const response = await getDoctorsBySpecialty(state.specialtyId);
      console.log("Doctors API response:", response.data);
      let doctors = response.data || [];
      if (!Array.isArray(doctors)) {
        console.warn("API response is not an array, converting:", doctors);
        doctors = [];
      }
      const processedDoctors = doctors.map(doctor => ({
        id: doctor.id || doctor.doctorId,
        doctorId: doctor.doctorId || doctor.id,
        doctorName: doctor.doctorName || doctor.name || 'Unknown Doctor',
        name: doctor.name || doctor.doctorName || 'Unknown Doctor',
        specializationName: doctor.specializationName || doctor.specialty || state.specialty,
        fees: doctor.fees || doctor.consultationFee || 0,
        experience: doctor.experience || 0,
        education: doctor.education || doctor.qualification || '',
        city: doctor.city || doctor.location || '',
        doctorPanelName: doctor.doctorPanelName || doctor.doctorType || 'General',
        hospital: doctor.hospital || '',
        image: doctor.image || doctor.photo || '',
        availability: doctor.availability || [],
        bookedSlots: doctor.bookedSlots || []
      }));
      console.log("Processed doctors:", processedDoctors);
      updateState({
        doctors: processedDoctors,
        filteredDoctors: processedDoctors,
        loadingDoctors: false,
      });
    } catch (error) {
      console.error("Failed to fetch doctors:", error);
      if (error.response) {
        console.error("API Error Response:", {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Request setup error:", error.message);
      }
      updateState({
        doctors: [],
        filteredDoctors: [],
        loadingDoctors: false,
      });
    }
  };

  // Apply client-side filters
  useEffect(() => {
    if (!state.doctors || !Array.isArray(state.doctors)) return;
    const filtered = state.doctors.filter(d => {
      if (state.doctorType !== "All" && d.doctorPanelName !== state.doctorType) return false;
      if (state.minPrice !== "" && parseInt(d.fees) < parseInt(state.minPrice)) return false;
      if (state.maxPrice !== "" && parseInt(d.fees) > parseInt(state.maxPrice)) return false;
      if (state.hospitalName !== "" && d.hospital && !d.hospital.toLowerCase().includes(state.hospitalName.toLowerCase())) return false;
      if (state.consultationType === "Physical" && state.location && d.city !== state.location) return false;
      return true;
    });
    updateState({ filteredDoctors: filtered });
  }, [state.doctors, state.doctorType, state.minPrice, state.maxPrice, state.hospitalName, state.location, state.consultationType]);

  // On specialty selection: fetch by specialty; if cleared, clear doctors
  useEffect(() => {
    console.log("Specialty changed:", {
      specialtyId: state.specialtyId,
      specialty: state.specialty,
      consultationType: state.consultationType,
      location: state.location
    });
    if (state.specialtyId) {
      fetchDoctorsBySpecialty();
    } else {
      updateState({ doctors: [], filteredDoctors: [] });
    }
  }, [state.specialtyId]);

  // Fetch hospitals
  const fetchHospitals = async () => {
    const collator = new Intl.Collator(undefined, { sensitivity: "base" });
    const byLabelAsc = (a, b) => collator.compare(String(a.label || ""), String(b.label || ""));
    try {
      updateState({ hospitalsLoading: true });
      const response = await getHospitalDropdown();
      const options = (response?.data ?? [])
        .map(h => {
          const label = h?.name || h?.hospitalName || h?.label || "";
          const value = h?.id ?? label;
          return { label, value };
        })
        .filter(o => o.label)
        .sort(byLabelAsc);
      updateState({
        hospitalsOptions: options,
        hospitalsLoading: false,
      });
    } catch (error) {
      console.error("Failed to fetch hospitals:", error);
      updateState({
        hospitalsOptions: [],
        hospitalsLoading: false,
      });
    }
  };

  // Fetch all symptoms
  const fetchAllSymptoms = async () => {
    try {
      const response = await getAllSymptoms();
      const symptoms = Array.isArray(response.data)
        ? response.data.map(item => ({
          id: item.id ?? item.symptomId ?? item.value ?? item.name ?? item.label,
          name: item.name || item.label || item.symptomName || String(item),
        }))
        : [];
      setAllSymptoms(symptoms);
    } catch (error) {
      console.error("Failed to fetch symptoms:", error);
      setAllSymptoms([]);
    }
  };

  // Fetch specializations by symptoms
  useEffect(() => {
    if (state.symptoms) {
      const fetchSpecializations = async () => {
        try {
          const response = await getSpecializationsBySymptoms({ q: state.symptoms });
          const specialties = Array.isArray(response.data)
            ? response.data.map(item => ({
              id: item.id || item.specialityId,
              name: item.name || item.label || item.specializationName || item,
            }))
            : [];
          const stillValid = specialties.some(s => String(s.id) === String(state.specialtyId || ''));
          if (!stillValid) {
            updateState({ specialties, specialtyId: '', specialty: '', doctors: [], filteredDoctors: [] });
          } else {
            updateState({ specialties });
          }
        } catch (error) {
          console.error("Failed to fetch specializations:", error);
          updateState({ specialties: [], specialtyId: '', specialty: '', doctors: [], filteredDoctors: [] });
        }
      };
      fetchSpecializations();
    }
  }, [state.symptoms]);

  // Fetch location by pincode
  const fetchLocationByPincode = async (pincode) => {
    if (!pincode || pincode.length !== 6) {
      updateState({ pincodeError: "Please enter a valid 6-digit pincode" });
      return;
    }
    updateState({ pincodeLoading: true, pincodeError: "" });
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await response.json();
      if (data && data[0] && data[0].Status === "Success") {
        const postOffices = data[0].PostOffice;
        const detectedState = postOffices[0]?.State;
        const detectedDistrict = postOffices[0]?.District;
        const cities = postOffices.map((office) => office.Name);
        updateState({
          selectedState: detectedState || "",
          cities,
          location: cities[0] || "",
          fullAddress: `${detectedDistrict}, ${detectedState} - ${pincode}`,
          pincodeLoading: false,
          pincodeError: "",
          isCurrentLocation: false,
        });
      } else {
        updateState({
          pincodeLoading: false,
          pincodeError: "Invalid pincode or location not found",
        });
      }
    } catch (error) {
      console.error("Pincode lookup error:", error);
      updateState({
        pincodeLoading: false,
        pincodeError: "Failed to fetch location. Please try again.",
      });
    }
  };

  // Handle pincode change
  const handlePincodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 6) {
      updateState({
        pincode: value,
        pincodeError: "",
      });
      if (value.length === 6) {
        fetchLocationByPincode(value);
      }
    }
  };

  // Handle state change
  const handleStateChange = (e) => {
    const selectedState = e.target.value;
    updateState({
      selectedState,
      cities: [],
      location: "",
      pincode: "",
      pincodeError: "",
      isCurrentLocation: false,
    });
  };

  // Handle location change
  const handleLocationChange = (e) => {
    const newLocation = e.target.value;
    const shouldResetPincode = newLocation === "current-location" || !state.pincode;
    updateState({
      location: newLocation,
      fullAddress: "",
      pincode: shouldResetPincode ? "" : state.pincode,
      pincodeError: "",
      isCurrentLocation: newLocation === "current-location"
    });
  };

  // Handle payment
  const handlePayment = async () => {
    const doctorId = state.selectedDoctor?.doctorId || state.selectedDoctor?.id || 0;
    const hospitalId = state.hospitalId || 0;
    const slotId = state.selectedSlotId || 0;

    let symptomId = 0;
    let symptomIds = [];
    if (state.symptoms) {
      const symptom = allSymptoms.find((s) => s.name === state.symptoms);
      if (symptom?.id) {
        symptomId = symptom.id;
        symptomIds = [symptom.id];
      }
    }

    let appointmentTime = state.selectedTime;
    if (appointmentTime) {
      const [time, modifier] = appointmentTime.split(' ');
      let [hours, minutes] = time.split(':');
      if (hours === '12') {
        hours = '00';
      }
      if (modifier === 'PM') {
        hours = parseInt(hours, 10) + 12;
      }
      appointmentTime = `${hours.toString().padStart(2, '0')}:${minutes}`;
    }

    const normalizedConsultationType =
      String(state.consultationType).toLowerCase() === 'virtual' ? 'Virtual' : 'Physical';

    const payload = {
      patientId: patientId,
      doctorId: doctorId,
      hospitalId: hospitalId,
      slotId: slotId,
      symptomIds: symptomIds,
      specialtyId: state.specialtyId || 0,
      appointmentDate: state.selectedDate,
      appointmentTime: appointmentTime,
      consultationType: normalizedConsultationType,
      consultationFees: state.selectedDoctor?.fees || 0.1,
      notes: state.symptoms || "No specific symptoms",
    };

    updateState({
      isLoading: true,
      showBookingModal: false,
      showConfirmationModal: true,
    });

    try {
      const bookingResponse = await createAppointments(payload);
      console.log("Booking successful:", bookingResponse);
      setTimeout(() => {
        updateState({
          showConfirmationModal: false,
          selectedState: "",
          location: "",
          pincode: "",
          symptoms: "",
          selectedDate: "",
          selectedTime: "",
          selectedSlotId: 0,
          specialty: "",
          specialtyId: "",
          specialties: [],
          selectedDoctor: null,
          consultationType: "Physical",
          cities: [],
          pincodeError: "",
          isCurrentLocation: false,
          isLoading: false,
          hospitalName: "",
          hospitalId: "",
        });
        navigate("/patientdashboard/appointments");
      }, 2000);
    } catch (error) {
      console.error("Booking failed:", error);
      updateState({
        showConfirmationModal: false,
        isLoading: false,
      });
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Booking failed. Please check your internet connection and try again.";
      alert(`Booking Failed: ${errorMessage}`);
      updateState({ showBookingModal: true });
    }
  };

  // Get times for selected date
  const getTimesForDate = (date) => {
    if (!state.selectedDoctor?.availability || !date) return [];
    const availabilitySlot = state.selectedDoctor.availability.find(slot => slot.date === date);
    if (!availabilitySlot) return [];

    return availabilitySlot.times.map(time => {
      if (typeof time === 'object') {
        return { time: time.time, slotId: time.slotId };
      } else {
        return { time: time, slotId: 0 };
      }
    });
  };

  // Get visible slots (9 at a time)
  const getVisibleSlots = (allSlots) => {
    const startIndex = currentSlotGroup * 9;
    const endIndex = startIndex + 9;
    return allSlots.slice(startIndex, endIndex);
  };

  // Handle slot navigation
  const handleSlotNavigation = (direction) => {
    const totalSlots = getTimesForDate(state.selectedDate).length;
    const totalGroups = Math.ceil(totalSlots / 9);
    if (direction === 'left') {
      setCurrentSlotGroup(prev => Math.max(0, prev - 1));
    } else {
      setCurrentSlotGroup(prev => Math.min(totalGroups - 1, prev + 1));
    }
  };

  // Reset slot group when date changes
  useEffect(() => {
    setCurrentSlotGroup(0);
  }, [state.selectedDate]);

  // Get today's date
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Handle view all doctors
  const handleViewAllDoctors = () => {
    const currentFormState = {
      consultationType: state.consultationType,
      symptoms: state.symptoms,
      specialty: state.specialty,
      specialtyId: state.specialtyId,
      selectedState: state.selectedState,
      location: state.location,
      pincode: state.pincode,
      doctorType: state.doctorType,
      hospitalName: state.hospitalName,
      hospitalId: state.hospitalId,
      minPrice: state.minPrice,
      maxPrice: state.maxPrice,
      fullAddress: state.fullAddress,
      isCurrentLocation: state.isCurrentLocation,
      cities: state.cities,
      specialties: state.specialties,
      doctors: state.doctors,
      filteredDoctors: state.filteredDoctors || []
    };
    navigate('/patientdashboard/alldoctors', {
      state: {
        filteredDoctors: state.filteredDoctors || [],
        preservedFormState: currentFormState
      }
    });
  };

  // Scroll logic for doctor cards
  const scrollRef = useRef(null);
  const [currentGroup, setCurrentGroup] = useState(0);
  const cardWidth = 300;
  const visibleCards = 3;
  const totalGroups = state.filteredDoctors && Array.isArray(state.filteredDoctors)
    ? Math.ceil(state.filteredDoctors.length / visibleCards)
    : 0;
  const scrollToGroup = groupIndex => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        left: groupIndex * cardWidth * visibleCards,
        behavior: "smooth"
      });
      setCurrentGroup(groupIndex);
    }
  };
  const scroll = (dir) => {
    let newGroup = currentGroup + dir;
    if (newGroup < 0) newGroup = 0;
    if (newGroup >= totalGroups) newGroup = totalGroups - 1;
    scrollToGroup(newGroup);
  };

  // Auto-scroll effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const container = scrollRef.current;
        const maxScrollLeft = container.scrollWidth - container.clientWidth;
        if (container.scrollLeft + 300 >= maxScrollLeft) {
          container.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          container.scrollBy({ left: 300, behavior: "smooth" });
        }
      }
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchHospitals();
        await fetchAllSymptoms();
        if (state.selectedState) {
          const response = await fetch(`https://api.postalpincode.in/state/${state.selectedState}`);
          const data = await response.json();
          if (data && data[0] && data[0].Status === "Success") {
            const cities = data[0].PostOffice.map((office) => office.Name);
            updateState({ cities });
          }
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };
    fetchData();
  }, []);

  // Reset location fields for virtual consultation
  useEffect(() => {
    if (state.consultationType === "Virtual") {
      updateState({
        selectedState: "",
        location: "",
        pincode: "",
        cities: [],
        fullAddress: "",
        pincodeError: "",
        isCurrentLocation: false,
        hospitalName: "",
        hospitalId: "",
      });
    }
  }, [state.consultationType]);

  // Safe references for rendering
  const safeFilteredDoctors = state.filteredDoctors || [];
  const safeSpecialties = state.specialties || [];

  return (
    <div className="min-h-screen px-5">
      {/* Main Form */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6 space-y-6">
        {/* Consultation Type */}
        <div className="space-y-4">
          <h3 className="text-xl md:text-3xl text-center font-bold text-slate-800 mb-2">
            Book Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">Appointment</span>
          </h3>
          <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            Consultation Type
          </p>
          <div className="flex gap-4">
            {["Physical", "Virtual"].map(type => (
              <button
                key={type}
                onClick={() => updateState({ consultationType: type })}
                className={`px-3 py-2 rounded-lg font-medium text-sm transition-all duration-300 transform hover:scale-105 ${state.consultationType === type
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/25"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Location Fields (Physical Consultation) */}
        {state.consultationType === "Physical" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <FaMapMarkerAlt className="text-emerald-500 text-xs" />
                Enter Pincode for Quick Location Detection
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={state.pincode}
                  onChange={handlePincodeChange}
                  placeholder="Enter 6-digit pincode"
                  maxLength={6}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 text-sm bg-white"
                  disabled={state.isCurrentLocation}
                />
                {state.pincodeLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-500"></div>
                  </div>
                )}
              </div>
              {state.pincodeError && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {state.pincodeError}
                </p>
              )}
              {state.pincode && state.selectedState && state.location && !state.pincodeError && (
                <p className="text-xs text-emerald-600 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Location detected: {state.location}, {state.selectedState}
                </p>
              )}
            </div>
            <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <div className="h-px bg-slate-200 flex-1"></div>
              <span>OR</span>
              <div className="h-px bg-slate-200 flex-1"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-emerald-500 text-xs" />
                  State
                </label>
                <select
                  value={state.selectedState}
                  onChange={handleStateChange}
                  disabled={!!state.pincode || state.isCurrentLocation}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 text-sm bg-white disabled:bg-slate-100 disabled:cursor-not-allowed"
                >
                  <option value="">{state.selectedState || "Select State"}</option>
                  {Array.isArray(state.states) &&
                    state.states.map((stateName) => (
                      <option key={stateName} value={stateName}>
                        {stateName}
                      </option>
                    ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-emerald-500 text-xs" />
                  City
                </label>
                <select
                  value={state.location}
                  onChange={handleLocationChange}
                  disabled={(!state.selectedState && !state.isCurrentLocation) || state.pincodeLoading}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 text-sm bg-white disabled:bg-slate-100 disabled:cursor-not-allowed"
                >
                  <option value="">Select City</option>
                  <option value="current-location">📍 Use My Location</option>
                  {Array.isArray(state.cities) &&
                    state.cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                </select>
                {state.location && state.location !== "current-location" && (
                  <p className="text-xs text-emerald-600 flex items-center gap-1">
                    <FaMapMarkerAlt className="text-xs" />
                    {state.location}, {state.selectedState}
                    {state.isCurrentLocation ? " (Current Location)" : state.pincode ? ` (Pincode: ${state.pincode})` : ""}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Virtual Consultation Notice */}
        {state.consultationType === "Virtual" && (
          <div className="bg-gradient-to-r from-green-50 to-indigo-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 002 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-green-800">Virtual Consultation Selected</h4>
                <p className="text-sm text-green-600">You'll receive a video call link after booking confirmation</p>
              </div>
            </div>
          </div>
        )}

        {/* Hospital and Symptoms */}
        <div className="flex flex-col md:flex-row gap-4 w-full">
          {state.consultationType === "Physical" && (
            <div className="space-y-2 w-full md:w-1/2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <FaHospital className="text-emerald-500 text-xs" />
                Hospital (Optional)
                {state.hospitalsLoading && (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-emerald-500"></div>
                )}
              </label>
              <div className="relative">
                {(() => {
                  const normalizeText = (s) =>
                    String(s ?? "")
                      .normalize("NFKD")
                      .replace(/\p{Diacritic}/gu, "")
                      .replace(/[‐-–—]/g, "-")
                      .replace(/\s+/g, " ")
                      .trim()
                      .toLowerCase();
                  const openKey = "hospitalDropdownOpen";
                  const searchKey = "hospitalDropdownSearch";
                  const open = !!state[openKey];
                  const searchVal = state[searchKey] || "";
                  const normSearch = normalizeText(searchVal);
                  const opts = Array.isArray(state.hospitalsOptions) ? state.hospitalsOptions : [];
                  const filtered = opts.filter(o =>
                    normalizeText(o.label).includes(normSearch)
                  );
                  const buttonLabel = state.hospitalName ? state.hospitalName : "Select Hospital (Optional)";
                  return (
                    <>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Select Hospital"
                          value={open ? searchVal : buttonLabel}
                          disabled={state.hospitalsLoading}
                          onClick={() => {
                            updateState({
                              [openKey]: true,
                              [searchKey]: ""
                            });
                          }}
                          onChange={(e) => {
                            updateState({
                              [searchKey]: e.target.value,
                              [openKey]: true
                            });
                          }}
                          className="w-full p-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 text-sm bg-white disabled:bg-slate-100 disabled:cursor-not-allowed"
                        />

                        <ChevronDown
                          className="w-4 h-4 text-slate-500 absolute right-3 top-3 cursor-pointer"
                          onClick={() =>
                            updateState({
                              [openKey]: !open,
                              [searchKey]: ""
                            })
                          }
                        />
                      </div>

                      {open && (
                        <div className="absolute z-[1000] mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white shadow border border-slate-200">

                          {filtered.length === 0 && (
                            <div className="px-4 py-2 text-sm text-slate-500">No results</div>
                          )}

                          {filtered.map((opt) => (
                            <div
                              key={String(opt.value)}
                              onClick={() => {
                                updateState({
                                  hospitalId: opt.value,
                                  hospitalName: opt.label,
                                  [openKey]: false
                                });
                              }}
                              className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-sm"
                            >
                              {opt.label}
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          )}
          <div className={`space-y-2 w-full ${state.consultationType === "Physical" ? "md:w-1/2" : ""}`}>
            <label className="text-sm font-medium text-slate-700">Symptoms</label>
            <div className="relative">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Select Symptoms"
                  value={symptomsDropdownOpen ? symptomsSearch : state.symptoms}
                  onChange={(e) => {
                    setSymptomsSearch(e.target.value);
                    if (!symptomsDropdownOpen) setSymptomsDropdownOpen(true);
                  }}
                  onClick={() => {
                    setSymptomsDropdownOpen(true);
                    setSymptomsSearch("");
                  }}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 text-sm bg-white"
                />

                <ChevronDown
                  className="w-4 h-4 text-slate-500 absolute right-3 top-3 cursor-pointer"
                  onClick={() => setSymptomsDropdownOpen(!symptomsDropdownOpen)}
                />
              </div>

              {symptomsDropdownOpen && (
                <div className="absolute z-[1000] mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white shadow border border-slate-200">
                  {allSymptoms.filter(symptom =>
                    (symptom.name || "").toLowerCase().includes(symptomsSearch.toLowerCase())
                  ).length === 0 && (
                      <div className="px-4 py-2 text-sm text-slate-500">No results</div>
                    )}

                  {allSymptoms
                    .filter(symptom =>
                      (symptom.name || "").toLowerCase().includes(symptomsSearch.toLowerCase())
                    )
                    .map(symptom => (
                      <div
                        key={symptom.id ?? symptom.name}
                        onClick={() => {
                          updateState({ symptoms: symptom.name });
                          setSymptomsDropdownOpen(false);
                        }}
                        className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-sm"
                      >
                        {symptom.name}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Suggested Specialties */}
        {safeSpecialties.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-slate-700">Suggested Specialties</h3>
            <div className="grid grid-cols-1 sm:flex sm:flex-wrap gap-2">
              {safeSpecialties.map((spec) => (
                <button
                  key={spec.id || spec.name}
                  onClick={() => updateState({
                    specialty: spec.name,
                    specialtyId: spec.id
                  })}
                  className={`w-full sm:w-auto px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-300 transform hover:scale-105 ${state.specialtyId === spec.id
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                >
                  {spec.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Doctor Panel and Filters */}
        <div className="space-y-4">
          <h3 className="text-base font-medium text-slate-700">Doctor Panel</h3>
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
            {["All", "Our Medical Expert", "Hospital Affiliated", "Consultant Doctor"].map((type) => (
              <button
                key={type}
                onClick={() => updateState({ doctorType: type })}
                className={`w-full sm:w-auto px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-300 transform hover:scale-105 ${state.doctorType === type
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
              >
                {type}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 w-full">
              <label className="text-sm font-medium text-slate-700">Min Fees (₹)</label>
              <input
                type="number"
                value={state.minPrice}
                onChange={(e) => updateState({ minPrice: e.target.value })}
                placeholder="Minimum price"
                className="w-full p-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 text-sm bg-white"
              />
            </div>
            <div className="space-y-2 w-full">
              <label className="text-sm font-medium text-slate-700">Max Fees (₹)</label>
              <input
                type="number"
                value={state.maxPrice}
                onChange={(e) => updateState({ maxPrice: e.target.value })}
                placeholder="Maximum price"
                className="w-full p-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 text-sm bg-white"
              />
            </div>
          </div>
        </div>

        {/* Available Doctors */}
        <div className="space-y-4">
          {state.loadingDoctors ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading doctors...</p>
            </div>
          ) : safeFilteredDoctors.length > 0 ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-slate-800">Available Doctors ({safeFilteredDoctors.length})</h3>
                <button
                  onClick={handleViewAllDoctors}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-200"
                >
                  View All →
                </button>
              </div>
              <div className="relative">
                <div ref={scrollRef} className="flex gap-4 overflow-x-hidden pb-4 scroll-smooth">
                  {safeFilteredDoctors.map(doc => (
                    <div
                      key={doc.id || doc.doctorId}
                      onClick={() => updateState({ selectedDoctor: doc, showBookingModal: true })}
                      className="min-w-[280px] p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105"
                    >
                      <div className="flex gap-3 items-start">
                        <div className="relative">
                          <img
                            src={doc.image || "https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg"}
                            alt={doc.doctorName || doc.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-emerald-200"
                          />
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-slate-800 text-sm truncate">{doc.doctorName || doc.name}</h4>
                          <p className="text-emerald-600 text-xs font-medium">{doc.specializationName || doc.specialty}</p>
                          <p className="text-slate-600 text-xs">{doc.education}</p>
                          <p className="text-slate-800 font-bold text-lg">₹{doc.fees}</p>
                          <p className="text-slate-500 text-xs flex items-center gap-1">
                            <FaMapMarkerAlt className="text-xs" />
                            {state.consultationType === "Virtual" ? "Online" : doc.city || doc.location || "N/A"}
                          </p>
                          <p className="text-slate-500 text-xs">{doc.doctorPanelName || doc.doctorType}</p>
                          <p className="text-slate-400 text-xs">{doc.experience} years exp</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {totalGroups > 1 && (
                  <>
                    <button
                      onClick={() => scroll(-1)}
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-slate-200 rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center hover:bg-emerald-50"
                    >
                      <FaChevronLeft className="text-slate-600 text-sm" />
                    </button>
                    <button
                      onClick={() => scroll(1)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-slate-200 rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center hover:bg-emerald-50"
                    >
                      <FaChevronRight className="text-slate-600 text-sm" />
                    </button>
                    <div className="flex justify-center gap-2 mt-4">
                      {Array.from({ length: totalGroups }).map((_, index) => (
                        <button
                          key={index}
                          onClick={() => scrollToGroup(index)}
                          className={`w-2 h-2 rounded-full transition-all duration-200 ${currentGroup === index ? "bg-emerald-500 scale-125" : "bg-slate-300"
                            }`}
                        ></button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 bg-slate-100 rounded-2xl flex items-center justify-center">
                <FaUser className="text-slate-400 text-2xl" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">No doctors found</h3>
              <p className="text-slate-600 text-sm">
                {!state.specialtyId
                  ? "Please select symptoms and specialty to see available doctors"
                  : state.consultationType === "Physical" && !state.location
                    ? "Please select a city to see available doctors"
                    : "Try adjusting your search criteria"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {state.showBookingModal && state.selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl relative animate-slide-up">
            <button
              onClick={() => updateState({ showBookingModal: false })}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="text-center mb-6">
              <img
                src={state.selectedDoctor.image || "https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg"}
                alt={state.selectedDoctor.doctorName || state.selectedDoctor.name}
                className="w-16 h-16 rounded-2xl object-cover mx-auto mb-3 border-2 border-emerald-200"
              />
              <h2 className="text-xl font-bold text-slate-800">{state.selectedDoctor.doctorName || state.selectedDoctor.name}</h2>
              <p className="text-emerald-600 font-medium">{state.selectedDoctor.specializationName || state.selectedDoctor.specialty}</p>
              <p className="text-slate-600 text-sm">{state.selectedDoctor.education || state.selectedDoctor.qualification}</p>
              <div className="flex items-center justify-center gap-4 mt-2 text-sm">
                <span className="text-slate-600">{state.selectedDoctor.experience} years exp</span>
                <span className="text-slate-400">•</span>
                <span className="text-2xl font-bold text-emerald-600">₹{state.selectedDoctor.fees}</span>
              </div>
              <div className="mt-3">
                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${state.consultationType === "Virtual"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-emerald-100 text-emerald-700"
                  }`}>
                  {state.consultationType === "Virtual" ? (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 002 2v8a2 2 0 002 2z" />
                    </svg>
                  ) : (
                    <FaMapMarkerAlt className="w-3 h-3" />
                  )}
                  {state.consultationType} Consultation
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <FaCalendarAlt className="text-emerald-500 text-xs" />
                  Select Date
                </label>
                <input
                  type="date"
                  className="w-full p-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 text-sm"
                  value={state.selectedDate}
                  min={getTodayDate()}
                  onChange={(e) => updateState({ selectedDate: e.target.value, selectedTime: '', selectedSlotId: 0 })}
                />
              </div>
              {state.selectedDate && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <FaClock className="text-emerald-500 text-xs" />
                    Available Time Slots
                    {getTimesForDate(state.selectedDate).length > 0 && (
                      <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                        {getTimesForDate(state.selectedDate).length} slots available
                      </span>
                    )}
                  </label>
                  {getTimesForDate(state.selectedDate).length > 0 ? (
                    <div className="space-y-3">
                      {/* Navigation Arrows and Slot Counter */}
                      {getTimesForDate(state.selectedDate).length > 9 && (
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => handleSlotNavigation('left')}
                            disabled={currentSlotGroup === 0}
                            className={`p-2 rounded-lg transition-all duration-200 ${currentSlotGroup === 0
                              ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                              : 'bg-white border border-slate-200 text-slate-600 hover:bg-emerald-50 hover:border-emerald-300'
                              }`}
                          >
                            <FaChevronLeft className="text-sm" />
                          </button>
                          <span className="text-xs text-slate-500">
                            Showing {currentSlotGroup * 9 + 1}-{Math.min((currentSlotGroup + 1) * 9, getTimesForDate(state.selectedDate).length)} of {getTimesForDate(state.selectedDate).length}
                          </span>
                          <button
                            onClick={() => handleSlotNavigation('right')}
                            disabled={currentSlotGroup >= Math.ceil(getTimesForDate(state.selectedDate).length / 9) - 1}
                            className={`p-2 rounded-lg transition-all duration-200 ${currentSlotGroup >= Math.ceil(getTimesForDate(state.selectedDate).length / 9) - 1
                              ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                              : 'bg-white border border-slate-200 text-slate-600 hover:bg-emerald-50 hover:border-emerald-300'
                              }`}
                          >
                            <FaChevronRight className="text-sm" />
                          </button>
                        </div>
                      )}
                      {/* Time Slots Grid (3x3 for 9 slots) */}
                      <div className="grid grid-cols-3 gap-2">
                        {getVisibleSlots(getTimesForDate(state.selectedDate)).map(timeSlot => {
                          const isBooked = state.selectedDoctor.bookedSlots?.some(slot =>
                            slot.date === state.selectedDate && slot.time === timeSlot.time
                          );
                          const isSelected = state.selectedTime === timeSlot.time;
                          return (
                            <button
                              key={timeSlot.slotId}
                              disabled={isBooked}
                              onClick={() => updateState({
                                selectedTime: timeSlot.time,
                                selectedSlotId: timeSlot.slotId // Store slotId
                              })}
                              className={`py-2 px-3 rounded-lg text-xs font-medium transition-all duration-200 relative ${isBooked
                                ? "bg-red-100 text-red-400 cursor-not-allowed border border-red-200"
                                : isSelected
                                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md transform scale-105"
                                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                                }`}
                            >
                              {timeSlot.time}
                              {isBooked && (
                                <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                      {/* Slot Indicators */}
                      {getTimesForDate(state.selectedDate).length > 9 && (
                        <div className="flex justify-center gap-1">
                          {Array.from({ length: Math.ceil(getTimesForDate(state.selectedDate).length / 9) }).map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentSlotGroup(index)}
                              className={`w-2 h-2 rounded-full transition-all duration-200 ${currentSlotGroup === index ? "bg-emerald-500 scale-125" : "bg-slate-300"
                                }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-slate-50 rounded-xl border border-slate-200">
                      <FaClock className="text-slate-400 text-2xl mx-auto mb-2" />
                      <p className="text-slate-600 text-sm">No slots available for this date</p>
                      <p className="text-slate-500 text-xs mt-1">Please select a different date</p>
                    </div>
                  )}
                </div>
              )}
              <button
                onClick={handlePayment}
                disabled={!state.selectedDate || !state.selectedTime || state.isLoading || getTimesForDate(state.selectedDate).length === 0}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${!state.selectedDate || !state.selectedTime || state.isLoading || getTimesForDate(state.selectedDate).length === 0
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg transform hover:scale-105"
                  }`}
              >
                {state.isLoading
                  ? "Processing..."
                  : !state.selectedDate
                    ? 'Select Date First'
                    : getTimesForDate(state.selectedDate).length === 0
                      ? 'No Slots Available'
                      : !state.selectedTime
                        ? 'Select Time Slot'
                        : 'Confirm Booking'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {state.showConfirmationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl animate-slide-up">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Booking Confirmed!</h3>
            <p className="text-slate-600 text-sm mb-4">Your appointment has been successfully scheduled.</p>
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-emerald-500"></div>
              <span>Redirecting to patientdashboard...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiStepForm;
