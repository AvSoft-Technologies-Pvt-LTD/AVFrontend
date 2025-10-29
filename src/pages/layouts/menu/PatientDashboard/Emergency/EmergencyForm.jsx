// File: EmergencyForm.jsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { format } from "date-fns";
import * as Lucide from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import PaymentGateway from "../../../../../components/microcomponents/PaymentGatway";

// <- adjust the path below if your crudService lives elsewhere
import {
  getAllAmbulanceTypes,
  getAllAmbulanceEquipments,
  getAllAmbulanceCategories,
  getAllHospitals,
} from "../../../../../utils/CrudService";

import { useNavigate } from "react-router-dom";
import EmergencyPreview from "./EmergencyPreview";

const EmergencyForm = () => {
  const navigate = useNavigate();

  // ----- state -----
  const [step, setStep] = useState(0);
  const [type, setType] = useState("");
  const [typeSearch, setTypeSearch] = useState("");
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const typeRef = useRef(null);

  const [cat, setCat] = useState("");
  const [catSearch, setCatSearch] = useState("");
  const [showCatDropdown, setShowCatDropdown] = useState(false);
  const catRef = useRef(null);

  const [pickupSearch, setPickupSearch] = useState("");
  const [showPickupDropdown, setShowPickupDropdown] = useState(false);
  const pickupRef = useRef(null);
  const [pickup, setPickup] = useState("");

  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState("");
  const [selectedHospitalId, setSelectedHospitalId] = useState("");
  const [hospitalSearch, setHospitalSearch] = useState("");
  const [showHospitalDropdown, setShowHospitalDropdown] = useState(false);
  const hospitalRef = useRef(null);

  const [equip, setEquip] = useState([]);
  const equipRef = useRef(null);
  const [showEquip, setShowEquip] = useState(false);

  const [date, setDate] = useState(new Date());
  const [data, setData] = useState(null); // booking configuration from backend
  const [loading, setLoading] = useState(true);

  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [addressForm, setAddressForm] = useState({
    type: "Other",
    flatNo: "",
    floor: "",
    locality: "",
    landmark: "",
    name: "",
    phone: "",
  });

  const CONFIG_URL = "/api/booking-config"; // optional config
  const BOOKING_API_URL = "/api/bookings";

  // ----- small debounce hook -----
  const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
      const handler = setTimeout(() => setDebouncedValue(value), delay);
      return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
  };
  const debouncedHospitalSearch = useDebounce(hospitalSearch, 300);

  // ----- hospital filtering -----
  const filteredHospitals = useMemo(() => {
    if (!debouncedHospitalSearch.trim()) return hospitals;
    return hospitals.filter((hospital) =>
      (hospital.name || hospital.hospitalName || "")
        .toLowerCase()
        .includes(debouncedHospitalSearch.toLowerCase())
    );
  }, [hospitals, debouncedHospitalSearch]);

  // ----- fetch hospitals dropdown -----
  const fetchHospitals = async () => {
    try {
      const res = await getAllHospitals();
      // support both res.data as array or res.data.items
      const list = Array.isArray(res.data) ? res.data : res.data?.items || [];
      // normalize possible property names
      const normalized = list.map((h) => ({
        ...h,
        hospitalName: h.hospitalName || h.name || "",
      }));
      const sortedHospitals = (normalized || []).sort((a, b) =>
        (a.hospitalName || "").localeCompare(b.hospitalName || "")
      );
      setHospitals(sortedHospitals);
    } catch (error) {
      console.error("Failed to load hospitals:", error);
      toast.error("Failed to load hospitals");
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  // ----- fetch booking config (ambulance types, categories, equipment, locations) -----
  useEffect(() => {
    (async () => {
      setLoading(true);

      try {
        const [
          typesRes,
          categoriesRes,
          equipmentsRes,
          configRes,
        ] = await Promise.allSettled([
          getAllAmbulanceTypes(),
          getAllAmbulanceCategories(),
          getAllAmbulanceEquipments(),
          axios.get(CONFIG_URL).catch(() => null),
        ]);

        const ambulanceTypes =
          typesRes.status === "fulfilled" ? typesRes.value.data || [] : [];
        const categories =
          categoriesRes.status === "fulfilled" ? categoriesRes.value.data || [] : [];
        const equipment =
          equipmentsRes.status === "fulfilled" ? equipmentsRes.value.data || [] : [];

        const configData =
          configRes && configRes.status === "fulfilled" && configRes.value
            ? configRes.value.data || {}
            : {};

        // normalize equipment objects (in case they use name/price/id)
        const normalizedEquipment = Array.isArray(equipment)
          ? equipment.map((it) => ({ ...it }))
          : [];

        setData({
          ...configData,
          ambulanceTypes: Array.isArray(ambulanceTypes) ? ambulanceTypes : [],
          categories: Array.isArray(categories) ? categories : [],
          equipment: normalizedEquipment,
        });
      } catch (e) {
        console.error("Failed to load booking config:", e);
        toast.error("Failed to load booking data");
        setData(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [CONFIG_URL]);

  // ----- clicks outside to close dropdowns -----
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showEquip && equipRef.current && !equipRef.current.contains(e.target))
        setShowEquip(false);
      if (showTypeDropdown && typeRef.current && !typeRef.current.contains(e.target))
        setShowTypeDropdown(false);
      if (showCatDropdown && catRef.current && !catRef.current.contains(e.target))
        setShowCatDropdown(false);
      if (showPickupDropdown && pickupRef.current && !pickupRef.current.contains(e.target))
        setShowPickupDropdown(false);
      if (showHospitalDropdown && hospitalRef.current && !hospitalRef.current.contains(e.target))
        setShowHospitalDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEquip, showTypeDropdown, showCatDropdown, showPickupDropdown, showHospitalDropdown]);

  // ----- get current location for pickup (reverse geocode using Nominatim) -----
  const getCurrentLocationForPickup = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}`
          );
          const d = await res.json();
          if (d?.display_name) {
            setPickupSearch(d.display_name);
            toast.success("Current location set as pickup location");
          }
        } catch (e) {
          console.error("Reverse geocode failed:", e);
          toast.error("Failed to get location details");
        }
      },
      () => {
        toast.error("Unable to get current location");
      }
    );
  };

  // ----- icon helper (keeps mapping centralized) -----
  const getIcon = (name, size = 20) => {
    const icons = {
      Activity: Lucide.Activity,
      Ambulance: Lucide.Ambulance,
      Heart: Lucide.Heart,
      HeartPulse: Lucide.HeartPulse,
      Cylinder: Lucide.Cylinder,
      Bed: Lucide.Bed,
      Lungs: Lucide.Settings,
      Wheelchair: Lucide.Armchair,
      ActivitySquare: Lucide.ActivitySquare,
      Zap: Lucide.Zap,
    };
    return React.createElement(icons[name] || Lucide.Activity, { size });
  };

  // ----- totals & booking builder -----
  const calculateEquipmentTotal = () =>
    !data
      ? 0
      : equip.reduce(
          (t, id) => t + (data.equipment?.find((e) => e.id === id)?.price || 0),
          0
        );

  const buildBooking = () => ({
    ambulanceType:
      data?.ambulanceTypes?.find((t) => t.id === type)?.name || null,
    category: data?.categories?.find((c) => c.id === cat)?.name || null,
    equipment: equip,
    pickupLocation:
      data?.locations?.find((l) => l.id === pickup)?.name || pickupSearch,
    dropLocation: "N/A",
    hospitalLocation: selectedHospital || null,
    hospitalId: selectedHospitalId || null,
    date: format(date, "yyyy-MM-dd"),
    totalAmount: calculateEquipmentTotal(),
  });

  // ----- reset -----
  const resetForm = () => {
    setStep(0);
    setType("");
    setTypeSearch("");
    setCat("");
    setCatSearch("");
    setEquip([]);
    setPickup("");
    setPickupSearch("");
    setSelectedHospital("");
    setSelectedHospitalId("");
    setHospitalSearch("");
    setDate(new Date());
  };

  // ----- submit / payment flows -----
  const handleSubmit = async () => {
    if (!data) {
      toast.error("Booking data not ready");
      return;
    }
    const booking = buildBooking();
    try {
      await axios.post(BOOKING_API_URL, booking);
      toast.success("Booking submitted successfully!");
      resetForm();
    } catch (err) {
      console.error("Booking submit failed:", err);
      toast.error("Failed to submit booking.");
    }
  };

  const handlePayNow = () => {
    const booking = buildBooking();
    setSelectedBooking(booking);
    setShowPaymentGateway(true);
  };

  const handlePaymentSuccess = async (method, paymentData) => {
    try {
      await axios.post(BOOKING_API_URL, {
        ...selectedBooking,
        paymentId: paymentData?.paymentId || `PAY-${Math.floor(Math.random() * 10000)}`,
        paymentMethod: method,
      });
      toast.success("Booking and payment completed successfully!");
      resetForm();
      setSelectedBooking(null);
      setShowPaymentGateway(false);
    } catch (err) {
      console.error("Payment completion failed:", err);
      toast.error("Failed to complete booking and payment.");
    }
  };

  const handlePaymentFailure = (error) => {
    toast.error(`Payment failed: ${error?.reason || "Unknown error"}.`);
    setShowPaymentGateway(false);
  };

  // ----- navigation -----
  const canGoNext = () => {
    if (step === 0) {
      return type && cat && (pickup || pickupSearch);
    }
    return true;
  };

  const handleNext = () => {
    if (canGoNext()) setStep((p) => Math.min(p + 1, 1));
    else toast.warning("Please complete all required fields before proceeding.");
  };
  const handleBack = () => setStep((p) => Math.max(p - 1, 0));

  // ----- render helpers -----
  const renderNavigationButtons = () => (
    <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
      <button
        onClick={handleBack}
        disabled={step === 0}
        className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
          step === 0
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-gray-100 hover:bg-gray-200 text-gray-800 hover:text-gray-900 hover:shadow-md"
        }`}
      >
        <Lucide.ArrowLeft size={16} />
        <span className="hidden sm:inline">Back</span>
      </button>

      {step < 1 ? (
        <button
          onClick={handleNext}
          className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
            canGoNext()
              ? "bg-[var(--accent-color)] hover:bg-opacity-90 text-white shadow-md hover:shadow-lg"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
          disabled={!canGoNext()}
        >
          <span className="hidden sm:inline">Next</span>
          <Lucide.ArrowRight size={16} />
        </button>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 font-medium shadow-lg text-sm"
          >
            <Lucide.Check size={16} /> Submit Booking
          </button>
          {calculateEquipmentTotal() > 0 && (
            <button
              onClick={handlePayNow}
              className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 font-medium shadow-lg text-sm"
            >
              <Lucide.CreditCard size={16} />
              Pay Now ₹{calculateEquipmentTotal()}
            </button>
          )}
        </div>
      )}
    </div>
  );

  const renderStep = () => {
    if (loading || !data) {
      return (
        <div className="text-center py-6 sm:py-8 lg:py-10">
          <Lucide.Loader2
            className="animate-spin mx-auto mb-3 sm:mb-4 text-blue-500 w-6 h-6 sm:w-8 sm:h-8"
          />
          <p className="text-gray-600 text-sm sm:text-base">Loading booking data...</p>
        </div>
      );
    }

    if (step === 0) {
      return (
        <div className="w-full space-y-3 sm:space-y-4 lg:space-y-6">
          {/* pickup + hospital */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
            <div className="w-full relative" ref={pickupRef}>
              <div className="relative">
                <input
                  id="pickup-input"
                  type="text"
                  value={pickup ? data.locations?.find((l) => l.id === pickup)?.name || "" : pickupSearch}
                  onChange={(e) => {
                    setPickupSearch(e.target.value);
                    setShowPickupDropdown(true);
                  }}
                  onFocus={() => setShowPickupDropdown(true)}
                  className="peer block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[var(--primary-color)] focus:ring-1 focus:ring-[var(--primary-color)] pr-20"
                />
                <label
                  htmlFor="pickup-input"
                  className={`absolute left-3 transition-all duration-200 pointer-events-none ${
                    pickup || pickupSearch
                      ? "-top-2.5 text-xs bg-white px-1 text-[var(--primary-color)] font-medium"
                      : "top-3 text-sm text-gray-500"
                  }`}
                >
                  Search pickup location
                </label>
                <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex gap-1">
                  <button
                    type="button"
                    onClick={getCurrentLocationForPickup}
                    className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors z-20"
                    title="Use current location"
                  >
                    <Lucide.MapPin size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPickupDropdown((s) => !s)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 z-20"
                  >
                    <Lucide.ChevronDown className={`transition-transform duration-200 ${showPickupDropdown ? "rotate-180" : ""}`} size={14} />
                  </button>
                </div>
              </div>

              {showPickupDropdown && data.locations?.length > 0 && (
                <div className="absolute z-[10000] w-full bg-white border border-gray-200 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-2xl">
                  {data.locations
                    .filter((item) =>
                      item.name.toLowerCase().includes(pickupSearch.toLowerCase())
                    )
                    .map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setPickup(item.id);
                          setPickupSearch(item.name);
                          setShowPickupDropdown(false);
                        }}
                        className="px-3 py-1.5 sm:px-4 sm:py-2 cursor-pointer hover:bg-blue-50 text-xs sm:text-sm border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        {item.name}
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="w-full relative" ref={hospitalRef}>
              <div className="relative">
                <input
                  id="hospital-input"
                  type="text"
                  value={selectedHospital || hospitalSearch}
                  onChange={(e) => {
                    setHospitalSearch(e.target.value);
                    setShowHospitalDropdown(true);
                  }}
                  onFocus={() => setShowHospitalDropdown(true)}
                  className="peer block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[var(--primary-color)] focus:ring-1 focus:ring-[var(--primary-color)] pr-10"
                />
                <label
                  htmlFor="hospital-input"
                  className={`absolute left-3 transition-all duration-200 pointer-events-none ${
                    selectedHospital || hospitalSearch
                      ? "-top-2.5 text-xs bg-white px-1 text-[var(--primary-color)] font-medium"
                      : "top-3 text-sm text-gray-500"
                  }`}
                >
                  Search hospital...
                </label>
                <button
                  type="button"
                  onClick={() => setShowHospitalDropdown((s) => !s)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-20"
                >
                  <Lucide.ChevronDown className={`transition-transform duration-200 ${showHospitalDropdown ? "rotate-180" : ""}`} size={16} />
                </button>
              </div>

              {showHospitalDropdown && (
                <div className="absolute z-[10000] w-full mt-1 bg-white border border-gray-200 rounded-lg max-h-60 overflow-hidden shadow-2xl">
                  <div className="max-h-48 overflow-y-auto">
                    {filteredHospitals.map((hospital) => (
                      <div
                        key={hospital.id}
                        onClick={() => {
                          setSelectedHospital(hospital.hospitalName || hospital.name);
                          setSelectedHospitalId(hospital.id);
                          setHospitalSearch(hospital.hospitalName || hospital.name);
                          setShowHospitalDropdown(false);
                        }}
                        className="px-2.5 py-1.5 sm:px-3 sm:py-2 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 text-xs sm:text-sm text-gray-900 transition-colors"
                      >
                        {hospital.hospitalName || hospital.name}
                      </div>
                    ))}
                    {filteredHospitals.length === 0 && (
                      <div className="px-3 py-4 text-center text-gray-500 text-xs sm:text-sm">
                        No hospitals found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ambulance type + category */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
            <div className="w-full relative" ref={typeRef}>
              <div className="relative">
                <input
                  id="ambulance-type-input"
                  type="text"
                  value={type ? data.ambulanceTypes?.find((t) => t.id === type)?.name || "" : typeSearch}
                  onChange={(e) => setTypeSearch(e.target.value)}
                  onFocus={() => setShowTypeDropdown(true)}
                  className="peer block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[var(--primary-color)] focus:ring-1 focus:ring-[var(--primary-color)] pr-10"
                />
                <label
                  htmlFor="ambulance-type-input"
                  className={`absolute left-3 transition-all duration-200 pointer-events-none ${
                    type || typeSearch
                      ? "-top-2.5 text-xs bg-white px-1 text-[var(--primary-color)] font-medium"
                      : "top-3 text-sm text-gray-500"
                  }`}
                >
                  Search ambulance type
                </label>
                <button
                  type="button"
                  onClick={() => setShowTypeDropdown((s) => !s)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-20"
                >
                  <Lucide.ChevronDown className={`transition-transform duration-200 ${showTypeDropdown ? "rotate-180" : ""}`} size={16} />
                </button>
              </div>

              {showTypeDropdown && (
                <div className="absolute z-[10000] w-full bg-white border border-gray-200 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-2xl">
                  {data.ambulanceTypes?.filter((item) =>
                    item.name.toLowerCase().includes(typeSearch.toLowerCase())
                  ).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setType(item.id);
                        setTypeSearch(item.name);
                        setShowTypeDropdown(false);
                      }}
                      className="px-3 py-1.5 sm:px-4 sm:py-2 cursor-pointer hover:bg-blue-50 text-xs sm:text-sm border-b border-gray-100 last:border-b-0 transition-colors"
                    >
                      {item.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="w-full relative" ref={catRef}>
              <div className="relative">
                <input
                  id="category-input"
                  type="text"
                  value={cat ? data.categories?.find((c) => c.id === cat)?.name || "" : catSearch}
                  onChange={(e) => setCatSearch(e.target.value)}
                  onFocus={() => setShowCatDropdown(true)}
                  className="peer block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[var(--primary-color)] focus:ring-1 focus:ring-[var(--primary-color)] pr-10"
                />
                <label
                  htmlFor="category-input"
                  className={`absolute left-3 transition-all duration-200 pointer-events-none ${
                    cat || catSearch
                      ? "-top-2.5 text-xs bg-white px-1 text-[var(--primary-color)] font-medium"
                      : "top-3 text-sm text-gray-500"
                  }`}
                >
                  Search category
                </label>
                <button
                  type="button"
                  onClick={() => setShowCatDropdown((s) => !s)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-20"
                >
                  <Lucide.ChevronDown className={`transition-transform duration-200 ${showCatDropdown ? "rotate-180" : ""}`} size={16} />
                </button>
              </div>

              {showCatDropdown && (
                <div className="absolute z-[10000] w-full bg-white border border-gray-200 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-2xl">
                  {data.categories?.filter((item) =>
                    item.name.toLowerCase().includes(catSearch.toLowerCase())
                  ).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setCat(item.id);
                        setCatSearch(item.name);
                        setShowCatDropdown(false);
                      }}
                      className="px-3 py-1.5 sm:px-4 sm:py-2 cursor-pointer hover:bg-blue-50 text-xs sm:text-sm border-b border-gray-100 last:border-b-0 transition-colors"
                    >
                      {item.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* equipment + date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="w-full relative" ref={equipRef}>
              <button
                type="button"
                className="w-full px-2.5 py-2.5 sm:px-3 sm:py-3 border border-gray-300 rounded-lg flex justify-between items-center cursor-pointer hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-xs sm:text-sm"
                onClick={() => setShowEquip((prev) => !prev)}
              >
                <span>{equip.length === 0 ? "Select equipment" : `${equip.length} items selected`}</span>
                <Lucide.ChevronDown className={`transition-transform duration-200 ${showEquip ? "rotate-180" : ""}`} size={14} />
              </button>

              {showEquip && (
                <div className="absolute z-[10000] mt-1 w-full bg-white border border-gray-200 rounded-lg max-h-48 overflow-auto shadow-2xl">
                  {data.equipment?.map((item) => (
                    <label key={item.id} className="flex items-center justify-between px-2.5 py-1.5 sm:px-3 sm:py-2 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={equip.includes(item.id)}
                          onChange={() =>
                            setEquip((prev) =>
                              prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id]
                            )
                          }
                          className="mr-1.5 sm:mr-2"
                        />
                        <span className="flex items-center gap-1.5 sm:gap-2">
                          {getIcon(item.icon, 14)}
                          <span className="text-xs sm:text-sm">{item.name}</span>
                        </span>
                      </div>
                      <span className="text-xs sm:text-sm font-semibold text-green-600">₹{item.price}</span>
                    </label>
                  ))}
                </div>
              )}

              {equip.length > 0 && (
                <div className="mt-1.5 sm:mt-2 p-2.5 sm:p-3 border rounded-lg bg-green-50 border-green-200">
                  <span className="font-semibold text-green-600 text-xs sm:text-sm">Total: ₹{calculateEquipmentTotal()}</span>
                </div>
              )}
            </div>

            <div className="w-full relative">
              <ReactDatePicker
                selected={date}
                onChange={(selectedDate) => setDate(selectedDate)}
                minDate={new Date()}
                className="w-full px-2.5 py-2.5 sm:px-3 sm:py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-xs sm:text-sm"
                dateFormat="yyyy-MM-dd"
                popperProps={{ positionFixed: true }}
                popperClassName="react-datepicker-popper-fixed"
              />
              {/* Inline <style> — DO NOT use `jsx global` attribute */}
              <style>{`
                .react-datepicker-popper-fixed { z-index: 99999 !important; }
                .react-datepicker { z-index: 99999 !important; }
                .react-datepicker__triangle { z-index: 99999 !important; }
              `}</style>
            </div>
          </div>
        </div>
      );
    }

    // STEP 1: confirmation / preview
    return (
      <EmergencyPreview
        data={data}
        type={type}
        cat={cat}
        pickup={pickup}
        pickupSearch={pickupSearch}
        selectedHospital={selectedHospital}
        equip={equip}
        date={date}
        calculateEquipmentTotal={calculateEquipmentTotal}
        getIcon={getIcon}
      />
    );
  };

  // ----- return UI -----
  return (
    <div className="w-full min-h-screen bg-gray-50 py-2 px-2 sm:py-4 sm:px-4 lg:py-8 lg:px-8">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      {showPaymentGateway && (
        <PaymentGateway
          isOpen={showPaymentGateway}
          onClose={() => setShowPaymentGateway(false)}
          amount={calculateEquipmentTotal()}
          bookingId={selectedBooking?.id || `EMG-${Math.floor(Math.random() * 10000)}`}
          onPay={handlePaymentSuccess}
          onFail={handlePaymentFailure}
          bookingDetails={{
            serviceType: "Emergency Ambulance",
            doctorName: "N/A",
            hospitalName: selectedHospital || "N/A",
            appointmentDate: format(date, "yyyy-MM-dd"),
            appointmentTime: "ASAP",
            patient: [
              {
                name: addressForm.name || "Patient Name",
                age: 30,
                gender: "Unknown",
                patientId: `PT-${Math.floor(Math.random() * 10000)}`,
              },
            ],
            contactEmail: "patient@example.com",
            contactPhone: addressForm.phone || "9999999999",
            fareBreakup: {
              consultationFee: calculateEquipmentTotal() * 0.8,
              taxes: calculateEquipmentTotal() * 0.15,
              serviceFee: calculateEquipmentTotal() * 0.05,
            },
          }}
        />
      )}

      {!showPaymentGateway && (
        <div className="max-w-full sm:max-w-4xl lg:max-w-6xl mx-auto bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-3 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 bg-gray-800">
            <div className="flex items-center gap-2 sm:gap-2.5 lg:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#01B07A", color: "white" }}>
                <Lucide.Ambulance className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base lg:text-lg font-bold text-white mb-0">Ambulance Booking</h1>
                <p className="text-xs sm:text-sm text-gray-200 mb-0">Book an ambulance from AV Swasthya's trusted network</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/patientdashboard/ambulancesearch")}
              className="bg-green-500 hover:bg-green-600 text-white text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-2 rounded-lg flex items-center gap-1"
            >
              <Lucide.MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
              Near By Ambulance
            </button>
          </div>

          <div className="px-3 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 border-b border-gray-200">
            <div className="flex justify-center items-center w-full max-w-xs sm:max-w-md mx-auto">
              {["Details", "Confirm"].map((stepName, index) => (
                <React.Fragment key={index}>
                  <div className="flex flex-col items-center">
                    <div className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full mb-1 sm:mb-1.5 lg:mb-2 transition-all ${step === index || step > index ? "text-white" : "bg-gray-200 text-gray-600 border border-gray-300"}`} style={step === index || step > index ? { backgroundColor: "var(--accent-color)" } : {}}>
                      {step > index ? <Lucide.CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" /> : <span className="font-semibold text-xs sm:text-sm">{index + 1}</span>}
                    </div>
                    <p className={`text-xs font-medium transition-colors ${step === index || step > index ? "font-semibold" : "text-gray-500"}`} style={step === index || step > index ? { color: "var(--accent-color)" } : {}}>
                      {stepName}
                    </p>
                  </div>
                  {index < ["Details", "Confirm"].length - 1 && (
                    <div className="flex-1 h-0.5 sm:h-1 mx-2 sm:mx-3 lg:mx-4 mb-3 sm:mb-4 lg:mb-6 rounded transition-colors" style={step > index ? { backgroundColor: "var(--accent-color)" } : { backgroundColor: "#D1D5DB" }} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-6 relative">
            {renderStep()}
            {renderNavigationButtons()}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyForm;
