// EmergencySearch.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import * as Lucide from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import LocationModal from "./LocationModal"; // must be in same folder

// Fix for Leaflet's default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Mobile Filter Modal (kept here)
const MobileFilterModal = ({
  isOpen,
  onClose,
  filters,
  activeFilters,
  onChange,
  onReset,
  onApply,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[99999] xl:hidden">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="fixed inset-0 flex flex-col bg-white">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-800 text-white">
          <h2 className="text-lg font-semibold">Filter Ambulances</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={onReset}
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              Reset
            </button>
            <button
              onClick={onClose}
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        <div className="p-4 bg-gray-100">
          <div className="relative">
            <Lucide.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search filters"
              className="w-full pl-10 pr-4 py-3 bg-white rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {filters.map((filter) => {
            const selected = activeFilters[filter.key] || [];
            return (
              <div key={filter.key} className="space-y-3">
                <h3 className="font-medium text-gray-900 uppercase text-sm tracking-wide flex items-center gap-2">
                  {filter.icon && <span className="text-blue-600">{filter.icon}</span>}
                  {filter.label}
                </h3>
                <div className="space-y-2">
                  {filter.options.map((opt) => (
                    <label
                      key={opt.value}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer rounded-lg transition-colors border-b border-gray-100"
                    >
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={selected.includes(opt.value)}
                          onChange={() => {
                            const newSelected = selected.includes(opt.value)
                              ? selected.filter((v) => v !== opt.value)
                              : [...selected, opt.value];
                            onChange(filter.key, newSelected);
                          }}
                          className="sr-only"
                        />
                        <div
                          className={`w-5 h-5 border-2 rounded transition-all ${
                            selected.includes(opt.value)
                              ? "bg-blue-600 border-blue-600"
                              : "border-gray-300"
                          }`}
                        >
                          {selected.includes(opt.value) && (
                            <svg
                              className="w-3 h-3 text-white absolute top-0.5 left-0.5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                      </div>
                      <span className="text-gray-700 flex-1">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onApply}
            className="w-full py-4 bg-[var(--accent-color)] text-white rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg"
          >
            APPLY FILTERS
          </button>
        </div>
      </div>
    </div>
  );
};

const EmergencySearch = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredAmbulances, setFilteredAmbulances] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [mapPosition, setMapPosition] = useState([15.3647, 75.124]);
  const [markerPosition, setMarkerPosition] = useState([15.3647, 75.124]);
  const [isSearching, setIsSearching] = useState(false);
  const [mapSearchQuery, setMapSearchQuery] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const mapSearchRef = useRef(null);

  // Filter states
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [isDesktopFiltersExpanded, setIsDesktopFiltersExpanded] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    type: [],
    category: [],
    availability: [],
    rating: [],
    distance: [],
  });
  const [originalAmbulances, setOriginalAmbulances] = useState([]);
  const filterRef = useRef(null);

  const [addressForm, setAddressForm] = useState({
    type: "Other",
    flatNo: "",
    floor: "",
    locality: "",
    landmark: "",
    name: "",
    phone: "",
  });

  const searchRef = useRef(null);
  const BOOKING_API_URL = "https://mocki.io/v1/33249b2f-bbf5-42c9-bb74-583ebb809974";

  // Filter configuration
  const filterConfig = [
    {
      key: "type",
      label: "Ambulance Type",
      icon: <Lucide.Ambulance className="w-4 h-4" />,
      options: [
        { value: "ICU", label: "ICU Ambulance" },
        { value: "ALS", label: "ALS Ambulance" },
        { value: "BLS", label: "BLS Ambulance" },
        { value: "NICU", label: "NICU Ambulance" },
      ],
    },
    {
      key: "category",
      label: "Category",
      icon: <Lucide.Building className="w-4 h-4" />,
      options: [
        { value: "government", label: "Government" },
        { value: "private", label: "Private" },
        { value: "hospital", label: "Hospital" },
        { value: "ngo", label: "NGO" },
      ],
    },
    {
      key: "availability",
      label: "Availability",
      icon: <Lucide.Clock className="w-4 h-4" />,
      options: [
        { value: "available", label: "Available" },
        { value: "busy", label: "Busy" },
      ],
    },
    {
      key: "rating",
      label: "Minimum Rating",
      icon: <Lucide.Star className="w-4 h-4" />,
      options: [
        { value: "4.0", label: "4.0+ Stars" },
        { value: "3.5", label: "3.5+ Stars" },
        { value: "3.0", label: "3.0+ Stars" },
        { value: "2.5", label: "2.5+ Stars" },
      ],
    },
    {
      key: "distance",
      label: "Maximum Distance",
      icon: <Lucide.Navigation className="w-4 h-4" />,
      options: [
        { value: "5", label: "Within 5 km" },
        { value: "10", label: "Within 10 km" },
        { value: "20", label: "Within 20 km" },
        { value: "50", label: "Within 50 km" },
      ],
    },
  ];

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await axios.get(BOOKING_API_URL);
        setData(res.data);
      } catch (e) {
        toast.error("Failed to load ambulance data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showSuggestions && searchRef.current && !searchRef.current.contains(e.target)) {
        setTimeout(() => {
          setShowSuggestions(false);
        }, 150);
      }
      if (showLocationSuggestions && mapSearchRef.current && !mapSearchRef.current.contains(e.target)) {
        setTimeout(() => {
          setShowLocationSuggestions(false);
        }, 150);
      }
      if (isDesktopFiltersExpanded && filterRef.current && !filterRef.current.contains(e.target)) {
        setIsDesktopFiltersExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSuggestions, showLocationSuggestions, isDesktopFiltersExpanded]);

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const d = await res.json();
      if (d.display_name) setAddressForm((p) => ({ ...p, locality: d.display_name }));
    } catch (e) {
      console.error("Reverse geocoding failed:", e);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const pos = [coords.latitude, coords.longitude];
          setMapPosition(pos);
          setMarkerPosition(pos);
          reverseGeocode(...pos);
        },
        (err) => {
          toast.error("Unable to get current location");
        }
      );
    } else toast.error("Geolocation not supported");
  };

  const generateLocationSuggestions = async (query) => {
    if (!query.trim()) {
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
      return;
    }

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=8&addressdetails=1`
      );
      const data = await res.json();
      const suggestions = data.map((item, index) => ({
        id: index,
        display_name: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        type: item.type || "location",
        address: item.address || {},
      }));
      setLocationSuggestions(suggestions);
      setShowLocationSuggestions(suggestions.length > 0);
    } catch (e) {
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
    }
  };

  const handleLocationSearchInputChange = (value) => {
    setMapSearchQuery(value);
    if (value.trim().length > 2) {
      generateLocationSuggestions(value);
    } else {
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
    }
  };

  const handleLocationSuggestionSelect = (suggestion) => {
    setMapSearchQuery(suggestion.display_name);
    setShowLocationSuggestions(false);
    const pos = [suggestion.lat, suggestion.lon];
    setMapPosition(pos);
    setMarkerPosition(pos);
    setAddressForm((p) => ({ ...p, locality: suggestion.display_name }));
  };

  const searchLocation = async () => {
    if (!mapSearchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          mapSearchQuery
        )}`
      );
      const data = await res.json();
      if (data?.length) {
        const pos = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        setMapPosition(pos);
        setMarkerPosition(pos);
        setAddressForm((p) => ({ ...p, locality: data[0].display_name }));
      } else toast.error("Location not found");
    } catch (e) {
      toast.error("Search failed");
    } finally {
      setIsSearching(false);
    }
  };

  const saveAddress = () => {
    if (!addressForm.name || !addressForm.phone)
      return toast.error("Please fill in your name and phone number");
    toast.success("Address saved successfully!");
    setShowLocationPopup(false);
  };

  const locationAliases = {
    dharwad: ["dharwad", "dharwar"],
    dharwar: ["dharwad", "dharwar"],
    hubli: ["hubli", "hubballi", "huballi"],
    hubballi: ["hubli", "hubballi", "huballi"],
    huballi: ["hubli", "hubballi", "huballi"],
  };

  const getLocationVariations = (query) => {
    const variations = [query];
    Object.entries(locationAliases).forEach(([key, aliases]) => {
      if (aliases.includes(query.toLowerCase())) {
        variations.push(...aliases.filter((alias) => alias !== query.toLowerCase()));
      }
    });
    return variations;
  };

  const generateSuggestions = (query) => {
    if (!data || !query.trim()) return [];

    const queryLower = query.toLowerCase().trim();
    const queryVariations = getLocationVariations(queryLower);
    const suggestions = [];

    data.ambulanceServices.forEach((ambulance) => {
      const nameMatches = ambulance.serviceName.toLowerCase().includes(queryLower);
      const locationMatches = queryVariations.some((variation) =>
        ambulance.location.toLowerCase().includes(variation)
      );

      if (nameMatches || locationMatches) {
        suggestions.push({
          type: "ambulance",
          value: ambulance.serviceName,
          location: ambulance.location,
          ambulanceType: ambulance.type,
          category: ambulance.category,
          available: ambulance.available,
          id: ambulance.id,
        });
      }
    });

    const uniqueSuggestions = suggestions
      .filter((v, i, self) => i === self.findIndex((t) => t.value === v.value && t.type === v.type))
      .slice(0, 8);

    return uniqueSuggestions;
  };

  const handleSearchInputChange = (val) => {
    setSearchQuery(val);
    const suggest = generateSuggestions(val);
    setShowSuggestions(val.length > 0 && suggest.length > 0);
    setSuggestions(suggest);
  };

  const handleSuggestionSelect = (suggestion) => {
    setSearchQuery(suggestion.value);
    setShowSuggestions(false);
    setTimeout(() => {
      searchAmbulances(suggestion.value);
    }, 100);
  };

  const searchByCurrentLocation = () => setShowLocationPopup(true);

  const applyFilters = (ambulances) => {
    let filtered = [...ambulances];

    // Filter by type
    if (activeFilters.type.length > 0) {
      filtered = filtered.filter((ambulance) =>
        activeFilters.type.some((type) => ambulance.type.toLowerCase().includes(type.toLowerCase()))
      );
    }

    // Filter by category
    if (activeFilters.category.length > 0) {
      filtered = filtered.filter((ambulance) =>
        activeFilters.category.includes(ambulance.category.toLowerCase())
      );
    }

    // Filter by availability
    if (activeFilters.availability.length > 0) {
      filtered = filtered.filter((ambulance) => {
        if (activeFilters.availability.includes("available")) return ambulance.available === true;
        if (activeFilters.availability.includes("busy")) return ambulance.available === false;
        return true;
      });
    }

    // Filter by rating
    if (activeFilters.rating.length > 0) {
      filtered = filtered.filter((ambulance) => {
        const rating = parseFloat(ambulance.rating);
        return activeFilters.rating.some((minRating) => rating >= parseFloat(minRating));
      });
    }

    // Filter by distance
    if (activeFilters.distance.length > 0) {
      filtered = filtered.filter((ambulance) => {
        const distance = parseFloat(ambulance.distance);
        return activeFilters.distance.some((maxDistance) => distance <= parseFloat(maxDistance));
      });
    }

    return filtered;
  };

  const searchAmbulances = (query = searchQuery) => {
    if (!data || !query.trim()) {
      toast.error("Please enter a search term");
      return;
    }

    setSearchLoading(true);
    setHasSearched(true);

    setTimeout(() => {
      const queryLower = query.toLowerCase();
      const queryVariations = getLocationVariations(queryLower);

      let results = data.ambulanceServices.filter((ambulance) => {
        const nameMatch = ambulance.serviceName.toLowerCase().includes(queryLower);
        const locationMatch = queryVariations.some((variation) =>
          ambulance.location.toLowerCase().includes(variation)
        );
        return nameMatch || locationMatch;
      });

      // Store original results before filtering
      setOriginalAmbulances(results);

      // Apply filters
      results = applyFilters(results);

      setFilteredAmbulances(results);
      setSearchLoading(false);

      if (results.length === 0) {
        toast.info(`No ambulances found for "${query}". Try different search terms or clear filters.`);
      } else {
        toast.success(`Found ${results.length} ambulances for "${query}"`);
      }
    }, 500);
  };

  const handleFilterChange = (filterType, value) => {
    setActiveFilters((prev) => {
      const updated = { ...prev };
      updated[filterType] = value;
      return updated;
    });
  };

  const handleDesktopFilterToggle = () => {
    setIsDesktopFiltersExpanded(!isDesktopFiltersExpanded);
  };

  const applyFilterChanges = () => {
    const filtered = applyFilters(originalAmbulances);
    setFilteredAmbulances(filtered);
    setIsDesktopFiltersExpanded(false);

    if (filtered.length === 0 && originalAmbulances.length > 0) {
      toast.info("No ambulances match the selected filters. Try adjusting your filters.");
    } else if (filtered.length > 0) {
      toast.success(`Showing ${filtered.length} ambulances with applied filters`);
    }
  };

  const clearAllFilters = () => {
    setActiveFilters({
      type: [],
      category: [],
      availability: [],
      rating: [],
      distance: [],
    });
    if (originalAmbulances.length > 0) {
      setFilteredAmbulances(originalAmbulances);
      toast.success("All filters cleared");
    }
    setShowFilterPopup(false);
    setIsDesktopFiltersExpanded(false);
  };

  const getActiveFilterCount = () =>
    Object.values(activeFilters).reduce((count, filterArray) => count + filterArray.length, 0);

  const handleMobileFilterReset = () => {
    setActiveFilters({
      type: [],
      category: [],
      availability: [],
      rating: [],
      distance: [],
    });
    if (originalAmbulances.length > 0) {
      setFilteredAmbulances(originalAmbulances);
    }
  };

  const handleMobileFilterApply = () => {
    const filtered = applyFilters(originalAmbulances);
    setFilteredAmbulances(filtered);
    setShowFilterPopup(false);

    if (filtered.length === 0 && originalAmbulances.length > 0) {
      toast.info("No ambulances match the selected filters. Try adjusting your filters.");
    } else if (filtered.length > 0) {
      toast.success(`Showing ${filtered.length} ambulances with applied filters`);
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setShowSuggestions(false);
      searchAmbulances();
    }
  };

  const handleLocationSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setShowLocationSuggestions(false);
      searchLocation();
    }
  };

  const getAmbulanceTypeIcon = (type) =>
    ({
      ICU: <Lucide.Heart className="text-red-600" size={20} />,
      ALS: <Lucide.HeartPulse className="text-blue-600" size={20} />,
      BLS: <Lucide.Activity className="text-green-600" size={20} />,
    }[type.split(" ")[0]] || <Lucide.Ambulance className="text-red-600" size={20} />);

  const getCategoryColor = (c) =>
    ({
      government: "bg-blue-100 text-blue-700 border-blue-200",
      private: "bg-green-100 text-green-700 border-green-200",
      hospital: "bg-purple-100 text-purple-700 border-purple-200",
      ngo: "bg-orange-100 text-orange-700 border-orange-200",
    }[c.toLowerCase()] || "bg-gray-100 text-gray-700 border-gray-200");

  const renderLocationPopup = () => null; // Moved to LocationModal component

  if (loading) {
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
        <div className="text-center py-6 sm:py-8 lg:py-10">
          <Lucide.Loader2
            className="animate-spin mx-auto mb-3 sm:mb-4 text-blue-500 w-6 h-6 sm:w-8 sm:h-8"
          />
          <p className="text-gray-600 text-sm sm:text-base">Loading ambulance data...</p>
        </div>
      </div>
    );
  }

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
      {/* Location modal (separate component) */}
      <LocationModal
        show={showLocationPopup}
        onClose={() => setShowLocationPopup(false)}
        mapPosition={mapPosition}
        markerPosition={markerPosition}
        setMapPosition={setMapPosition}
        setMarkerPosition={setMarkerPosition}
        addressForm={addressForm}
        setAddressForm={setAddressForm}
        getCurrentLocation={getCurrentLocation}
        mapSearchQuery={mapSearchQuery}
        setMapSearchQuery={setMapSearchQuery}
        handleLocationSearchInputChange={handleLocationSearchInputChange}
        showLocationSuggestions={showLocationSuggestions}
        locationSuggestions={locationSuggestions}
        handleLocationSuggestionSelect={handleLocationSuggestionSelect}
        searchLocation={searchLocation}
        isSearching={isSearching}
        mapSearchRef={mapSearchRef}
        reverseGeocode={reverseGeocode}
        saveAddress={saveAddress}
      />

      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 lg:p-6 mb-3 sm:mb-4 lg:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 lg:mb-6 gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div
                className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "#01B07A", color: "white" }}
              >
                <Lucide.MapPin className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">
                  Search Ambulances
                </h1>
                <p className="text-gray-600 text-xs sm:text-sm lg:text-base">
                  Find ambulances by location, name, or service type
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3 lg:space-y-4">
            {/* Desktop Search and Filter Layout */}
            <div className="hidden xl:block">
              <div className="flex items-center justify-between gap-4 mb-4">
                {/* Search Section - Right Side */}
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex-1 relative min-w-0" ref={searchRef}>
                    <div className="relative">
                      <Lucide.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                      <input
                        type="text"
                        placeholder="Search by name, location..."
                        value={searchQuery}
                        onChange={(e) => handleSearchInputChange(e.target.value)}
                        onKeyPress={handleSearchKeyPress}
                        className="w-full max-w-[640px] pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm"
                      />

                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery("");
                            setShowSuggestions(false);
                            setFilteredAmbulances([]);
                            setOriginalAmbulances([]);
                            setHasSearched(false);
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 bg-white rounded-full w-5 h-5 flex items-center justify-center transition-all duration-200 text-xs z-10"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {showSuggestions && suggestions.length > 0 && (
                      <div className="absolute z-[99999] left-0 right-0 w-full max-w-[640px] mt-1 bg-white border border-gray-200 rounded-lg max-h-60 overflow-y-auto shadow-2xl">
                        {suggestions.map((suggestion, index) => (
                          <button
                            key={`${suggestion.type}-${suggestion.value}-${index}`}
                            onClick={() => handleSuggestionSelect(suggestion)}
                            className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100 last:border-b-0 transition-colors text-sm"
                          >
                            {suggestion.type === "ambulance" && (
                              <Lucide.Ambulance className="text-red-500 flex-shrink-0 w-4 h-4" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{suggestion.value}</div>
                              {suggestion.location && (
                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                  <span className="truncate">{suggestion.location}</span>
                                  {suggestion.available !== undefined && (
                                    <span
                                      className={`ml-1 px-1 py-0.5 rounded-full text-xs ${
                                        suggestion.available
                                          ? "bg-green-100 text-green-700"
                                          : "bg-red-100 text-red-700"
                                      }`}
                                    >
                                      {suggestion.available ? "Available" : "Busy"}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => searchAmbulances()}
                    disabled={searchLoading}
                    style={{ backgroundColor: "var(--accent-color)" }}
                    className={`px-4 py-2.5 text-white rounded-lg hover:brightness-90 flex items-center gap-2 whitespace-nowrap text-sm ${
                      searchLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {searchLoading ? (
                      <Lucide.Loader2 className="animate-spin w-4 h-4" />
                    ) : (
                      <Lucide.Search className="w-4 h-4" />
                    )}
                    Search
                  </button>

                  <button
                    onClick={searchByCurrentLocation}
                    style={{ backgroundColor: "var(--accent-color)" }}
                    className="px-4 py-2.5 text-white rounded-lg hover:brightness-90 flex items-center gap-2 whitespace-nowrap text-sm"
                  >
                    <Lucide.MapPin className="w-4 h-4" />
                    Current Location
                  </button>
                </div>

                {/* Filter Section - Left Side */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleDesktopFilterToggle}
                    className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-all duration-200 ${
                      isDesktopFiltersExpanded
                        ? "bg-[var(--accent-color)] text-white border-[var(--accent-color)]"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <Lucide.Filter className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {getActiveFilterCount() > 0
                        ? `${getActiveFilterCount()} Filter${getActiveFilterCount() !== 1 ? "s" : ""}`
                        : "Filter"}
                    </span>
                    {isDesktopFiltersExpanded ? (
                      <Lucide.ChevronUp className="w-4 h-4" />
                    ) : (
                      <Lucide.ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Desktop Filter Panel */}
              {isDesktopFiltersExpanded && (
                <div className="relative z-50 mb-4" ref={filterRef}>
                  <div className="absolute top-0 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-6">
                    <div className="grid grid-cols-4 gap-8">
                      {filterConfig.map((filter) => {
                        const selected = activeFilters[filter.key] || [];
                        return (
                          <div key={filter.key}>
                            <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                              {filter.icon}
                              {filter.label}
                            </h3>
                            <div className="space-y-2">
                              {filter.options.map((option) => {
                                const isSelected = selected.includes(option.value);
                                return (
                                  <label
                                    key={option.value}
                                    className="flex items-center gap-3 cursor-pointer group"
                                  >
                                    <div className="relative">
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => {
                                          const newSelected = isSelected
                                            ? selected.filter((v) => v !== option.value)
                                            : [...selected, option.value];
                                          handleFilterChange(filter.key, newSelected);
                                        }}
                                        className="sr-only"
                                      />
                                      <div
                                        className={`w-4 h-4 border-2 rounded transition-all ${
                                          isSelected ? "bg-blue-600 border-blue-600" : "border-gray-300 group-hover:border-gray-400"
                                        }`}
                                      >
                                        {isSelected && (
                                          <svg
                                            className="w-3 h-3 text-white absolute top-0.5 left-0.5"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                          >
                                            <path
                                              fillRule="evenodd"
                                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                              clipRule="evenodd"
                                            />
                                          </svg>
                                        )}
                                      </div>
                                    </div>
                                    <span
                                      className={`text-sm transition-colors ${
                                        isSelected ? "text-gray-900 font-medium" : "text-gray-700 group-hover:text-gray-900"
                                      }`}
                                    >
                                      {option.label}
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-end mt-4">
                      <button
                        onClick={applyFilterChanges}
                        className="px-4 py-2 bg-[var(--accent-color)] text-white rounded-lg font-medium hover:bg-opacity-90 transition-colors"
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile & Tablet Layout */}
            <div className="flex xl:hidden gap-2 sm:gap-3">
              <div className="flex-1 relative" ref={searchRef}>
                <div className="relative">
                  <Lucide.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 z-10" />
                  <input
                    type="text"
                    placeholder="Search by name, location..."
                    value={searchQuery}
                    onChange={(e) => handleSearchInputChange(e.target.value)}
                    onKeyPress={handleSearchKeyPress}
                    className="w-full pl-8 pr-8 sm:pl-10 sm:pr-10 lg:pl-12 lg:pr-12 py-2 sm:py-2.5 lg:py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-xs sm:text-sm lg:text-base"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setShowSuggestions(false);
                        setFilteredAmbulances([]);
                        setOriginalAmbulances([]);
                        setHasSearched(false);
                      }}
                      className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 bg-white rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center transition-all duration-200 text-xs z-10"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-[99999] w-full mt-1 bg-white border border-gray-200 rounded-lg max-h-48 sm:max-h-60 overflow-y-auto shadow-2xl">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={`${suggestion.type}-${suggestion.value}-${index}`}
                        onClick={() => handleSuggestionSelect(suggestion)}
                        className="w-full px-2 py-1.5 sm:px-3 sm:py-2 lg:px-4 lg:py-3 text-left hover:bg-gray-50 flex items-center gap-1.5 sm:gap-2 lg:gap-3 border-b border-gray-100 last:border-b-0 transition-colors text-xs sm:text-sm"
                      >
                        {suggestion.type === "ambulance" && (
                          <Lucide.Ambulance className="text-red-500 flex-shrink-0 w-3 h-3 sm:w-4 sm:h-4" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{suggestion.value}</div>
                          {suggestion.location && (
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <span className="truncate">{suggestion.location}</span>
                              {suggestion.available !== undefined && (
                                <span
                                  className={`ml-1 px-1 py-0.5 rounded-full text-xs ${
                                    suggestion.available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {suggestion.available ? "Available" : "Busy"}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={searchByCurrentLocation}
                  style={{ backgroundColor: "var(--accent-color)" }}
                  className="px-2 py-2 sm:px-3 sm:py-2.5 lg:px-4 lg:py-3 text-white rounded-lg hover:brightness-90 flex items-center gap-1 sm:gap-2 whitespace-nowrap text-xs sm:text-sm lg:text-base"
                >
                  <Lucide.MapPin className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                  <span className="hidden sm:inline">Current Location</span>
                  <span className="sm:hidden">Location</span>
                </button>

                <button
                  onClick={() => setShowFilterPopup(true)}
                  className="px-2 py-2 sm:px-3 sm:py-2.5 lg:px-4 lg:py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-1 sm:gap-2 whitespace-nowrap text-xs sm:text-sm lg:text-base relative"
                >
                  <Lucide.Filter className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                  <span className="hidden sm:inline">Filter</span>
                  {getActiveFilterCount() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      {getActiveFilterCount()}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => searchAmbulances()}
                  disabled={searchLoading}
                  style={{ backgroundColor: "var(--accent-color)" }}
                  className={`px-2 py-2 sm:px-3 sm:py-2.5 lg:px-4 lg:py-3 text-white rounded-lg hover:brightness-90 flex items-center gap-1 sm:gap-2 whitespace-nowrap text-xs sm:text-sm lg:text-base ${
                    searchLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {searchLoading ? (
                    <Lucide.Loader2 className="animate-spin w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                  ) : (
                    <Lucide.Search className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                  )}
                  <span className="hidden sm:inline">Search</span>
                </button>
              </div>
            </div>

            {/* Active Filters Display */}
            {getActiveFilterCount() > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-purple-50 rounded-lg">
                <span className="text-sm font-medium text-purple-700">Active Filters:</span>
                {Object.entries(activeFilters).map(([filterType, values]) =>
                  values.map((value) => (
                    <span
                      key={`${filterType}-${value}`}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs"
                    >
                      {value}
                      <button
                        onClick={() => {
                          const newValues = activeFilters[filterType].filter((v) => v !== value);
                          handleFilterChange(filterType, newValues);
                          const filtered = applyFilters(originalAmbulances);
                          setFilteredAmbulances(filtered);
                        }}
                        className="hover:text-purple-900"
                      >
                        <Lucide.X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                )}
                <button onClick={clearAllFilters} className="text-xs text-purple-600 hover:text-purple-800 underline">
                  Clear all
                </button>
              </div>
            )}
          </div>
        </div>

        {filteredAmbulances.length > 0 && (
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800">
                Found {filteredAmbulances.length} Ambulances
                {getActiveFilterCount() > 0 && (
                  <span className="text-sm font-normal text-gray-600 ml-2">
                    (with {getActiveFilterCount()} filters applied)
                  </span>
                )}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              {filteredAmbulances.map((ambulance) => (
                <div
                  key={ambulance.id}
                  className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="p-3 sm:p-4 lg:p-6">
                    <div className="flex items-start gap-2 sm:gap-3 lg:gap-4 mb-2 sm:mb-3 lg:mb-4">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        {getAmbulanceTypeIcon(ambulance.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-base lg:text-lg font-semibold mb-1 truncate text-gray-800">
                          {ambulance.serviceName}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
                          <Lucide.MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="truncate">{ambulance.location}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 lg:gap-2 mb-2 sm:mb-3 lg:mb-4">
                      <span
                        className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium border ${getCategoryColor(
                          ambulance.category
                        )}`}
                      >
                        {ambulance.category}
                      </span>
                      <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium border border-blue-200">
                        {ambulance.type}
                      </span>
                      {ambulance.available && (
                        <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium border bg-green-100 text-green-700 border-green-200">
                          Available
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4 text-xs sm:text-sm mb-2 sm:mb-3 lg:mb-4">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Lucide.Navigation className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{ambulance.distance} km</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <Lucide.Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                        <span>{ambulance.rating}</span>
                      </div>
                    </div>

                    <div className="border rounded-lg p-2 sm:p-3 mb-2 sm:mb-3 lg:mb-4 bg-green-50 border-green-200">
                      <div className="flex items-center gap-1 sm:gap-2 text-green-600">
                        <Lucide.Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                        <button
                          onClick={() => navigator.clipboard.writeText(ambulance.phone)}
                          className="font-semibold text-sm sm:text-base lg:text-lg underline hover:text-green-700 focus:outline-none"
                          title="Click to copy"
                        >
                          {ambulance.phone}
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-1 sm:gap-2">
                      <button
                        onClick={() => window.open(`tel:${ambulance.phone}`, "_self")}
                        className="flex-1 px-2 py-1 sm:px-3 sm:py-1.5 lg:px-3 lg:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-1 sm:gap-1.5 lg:gap-2 text-xs sm:text-sm"
                      >
                        <Lucide.Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                        Call Now
                      </button>
                      <button
                        onClick={() => toast.success(`Booking request sent to ${ambulance.serviceName}`)}
                        className="flex-1 px-2 py-1 sm:px-3 sm:py-1.5 lg:px-3 lg:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-1 sm:gap-1.5 lg:gap-2 text-xs sm:text-sm"
                      >
                        <Lucide.Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                        Book
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {searchLoading && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 lg:p-12 text-center">
            <Lucide.Loader2 className="animate-spin mx-auto mb-3 sm:mb-4 text-green-500 w-6 h-6 sm:w-8 sm:h-8" />
            <p className="text-gray-600 text-sm sm:text-base">Searching ambulances...</p>
          </div>
        )}

        {!searchLoading && filteredAmbulances.length === 0 && hasSearched && searchQuery && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 lg:p-12 text-center">
            <Lucide.AlertCircle className="mx-auto mb-3 sm:mb-4 text-gray-400 w-6 h-6 sm:w-8 sm:h-8" />
            <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">
              No ambulances found for "<strong>{searchQuery}</strong>"
              {getActiveFilterCount() > 0 && " with selected filters"}
            </p>
            <div className="text-xs sm:text-sm text-gray-500">
              <p>Try:</p>
              <ul className="list-disc list-inside mt-1.5 sm:mt-2 space-y-1">
                <li>Different search terms (e.g., "Hubli", "BLS", "Government")</li>
                <li>Checking spelling</li>
                {getActiveFilterCount() > 0 && <li>Clearing some filters</li>}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Filter Modal */}
      <MobileFilterModal
        isOpen={showFilterPopup}
        onClose={() => setShowFilterPopup(false)}
        filters={filterConfig}
        activeFilters={activeFilters}
        onChange={handleFilterChange}
        onReset={handleMobileFilterReset}
        onApply={handleMobileFilterApply}
      />
    </div>
  );
};

export default EmergencySearch;
