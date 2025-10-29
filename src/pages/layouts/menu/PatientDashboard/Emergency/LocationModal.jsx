// LocationModal.jsx
import React from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import * as Lucide from "lucide-react";

/**
 * LocationModal props:
 * - show (bool)
 * - onClose (fn)
 * - mapPosition ([lat, lng])
 * - markerPosition ([lat, lng])
 * - setMapPosition (fn)
 * - setMarkerPosition (fn)
 * - addressForm (object)
 * - setAddressForm (fn)
 * - getCurrentLocation (fn)
 * - mapSearchQuery (string)
 * - setMapSearchQuery (fn)
 * - handleLocationSearchInputChange (fn)
 * - showLocationSuggestions (bool)
 * - locationSuggestions (array)
 * - handleLocationSuggestionSelect (fn)
 * - searchLocation (fn)
 * - isSearching (bool)
 * - mapSearchRef (ref)
 * - reverseGeocode (fn)
 * - saveAddress (fn)
 */

const MapClickHandler = ({ setMarkerPosition, reverseGeocode }) => {
  useMapEvents({
    click: (e) => {
      setMarkerPosition([e.latlng.lat, e.latlng.lng]);
      reverseGeocode(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const LocationModal = ({
  show,
  onClose,
  mapPosition,
  markerPosition,
  setMapPosition,
  setMarkerPosition,
  addressForm,
  setAddressForm,
  getCurrentLocation,
  mapSearchQuery,
  setMapSearchQuery,
  handleLocationSearchInputChange,
  showLocationSuggestions,
  locationSuggestions,
  handleLocationSuggestionSelect,
  searchLocation,
  isSearching,
  mapSearchRef,
  reverseGeocode,
  saveAddress,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/10 z-[99998] overflow-y-auto p-2 sm:p-4">
      <div className="mx-auto max-w-full sm:max-w-4xl bg-white rounded-lg border border-gray-300 min-h-[90vh] sm:h-[90vh] flex flex-col mt-2 sm:mt-4">
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200">
          <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800">
            Enter complete address
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Lucide.X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          <div className="flex-1 relative">
            <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 z-[99999] pointer-events-auto">
              <div className="bg-white rounded-lg border border-gray-300 p-2 sm:p-3 w-full max-w-full sm:max-w-3xl mx-auto">
                <div className="flex gap-1.5 sm:gap-2" ref={mapSearchRef}>
                  <div className="flex-1 relative">
                    <Lucide.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5 sm:w-4 sm:h-4 z-10" />
                    <input
                      type="text"
                      placeholder="Search location..."
                      value={mapSearchQuery}
                      onChange={(e) => handleLocationSearchInputChange(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          searchLocation();
                        }
                      }}
                      className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-xs sm:text-sm"
                    />
                    {showLocationSuggestions && locationSuggestions.length > 0 && (
                      <div className="absolute z-[99999] w-full mt-1 bg-white border border-gray-200 rounded-lg max-h-48 sm:max-h-60 overflow-y-auto shadow-2xl">
                        {locationSuggestions.map((suggestion) => (
                          <button
                            key={suggestion.id}
                            onClick={() => handleLocationSuggestionSelect(suggestion)}
                            className="w-full px-2 py-1.5 sm:px-3 sm:py-2 lg:px-4 lg:py-3 text-left hover:bg-gray-50 flex items-center gap-1.5 sm:gap-2 lg:gap-3 border-b border-gray-100 last:border-b-0 transition-colors text-xs sm:text-sm"
                          >
                            <Lucide.MapPin className="text-blue-500 flex-shrink-0 w-3 h-3 sm:w-4 sm:h-4" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{suggestion.display_name}</div>
                              {suggestion.address && suggestion.address.country && (
                                <div className="text-xs text-gray-500 truncate">
                                  {suggestion.type} • {suggestion.address.country}
                                </div>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={searchLocation}
                    disabled={isSearching}
                    className="px-2 py-1.5 sm:px-3 sm:py-2 lg:px-4 lg:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-xs sm:text-sm"
                  >
                    {isSearching ? "Searching..." : "Search"}
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={getCurrentLocation}
              className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 z-10 px-2 py-1.5 sm:px-3 sm:py-2 lg:px-4 lg:py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center gap-1 sm:gap-1.5 lg:gap-2 text-xs sm:text-sm"
            >
              <Lucide.MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Current location
            </button>

            <div className="h-64 sm:h-full">
              <MapContainer
                center={mapPosition}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
                key={`${mapPosition[0]}-${mapPosition[1]}`}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <MapClickHandler setMarkerPosition={setMarkerPosition} reverseGeocode={reverseGeocode} />
                {markerPosition && (
                  <Marker position={markerPosition}>
                    <Popup>
                      Selected Location
                      <br />
                      Lat: {markerPosition[0].toFixed(6)}
                      <br />
                      Lng: {markerPosition[1].toFixed(6)}
                    </Popup>
                  </Marker>
                )}
              </MapContainer>
            </div>
          </div>

          <div className="w-full lg:w-80 bg-gray-50 p-3 sm:p-4 overflow-y-auto">
            <div className="space-y-3 sm:space-y-4">
              <p className="text-xs sm:text-sm text-gray-600 mb-1.5 sm:mb-2">Add New Address</p>
              <input
                type="text"
                placeholder="Flat / House no / Building name *"
                value={addressForm.flatNo}
                onChange={(e) => setAddressForm((prev) => ({ ...prev, flatNo: e.target.value }))}
                className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-xs sm:text-sm"
              />
              <input
                type="text"
                placeholder="Floor (optional)"
                value={addressForm.floor}
                onChange={(e) => setAddressForm((prev) => ({ ...prev, floor: e.target.value }))}
                className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-xs sm:text-sm"
              />
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1.5 sm:mb-2">Area / Sector / Locality *</p>
                <input
                  type="text"
                  value={addressForm.locality}
                  onChange={(e) => setAddressForm((prev) => ({ ...prev, locality: e.target.value }))}
                  className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-gray-100 text-xs sm:text-sm"
                  readOnly
                />
              </div>
              <input
                type="text"
                placeholder="Nearby landmark (optional)"
                value={addressForm.landmark}
                onChange={(e) => setAddressForm((prev) => ({ ...prev, landmark: e.target.value }))}
                className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-xs sm:text-sm"
              />

              <div className="border-t border-gray-200 my-3 sm:my-4" />

              <p className="text-xs sm:text-sm text-gray-600 mb-2.5 sm:mb-3">
                Enter your details for seamless delivery experience
              </p>
              <input
                type="text"
                placeholder="Your name *"
                value={addressForm.name}
                onChange={(e) => setAddressForm((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-xs sm:text-sm"
              />
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1.5 sm:mb-2">Your phone number *</p>
                <input
                  type="tel"
                  placeholder="9901341763"
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm((prev) => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-xs sm:text-sm"
                />
              </div>

              <button
                onClick={saveAddress}
                className="w-full px-3 py-1.5 sm:px-4 sm:py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium text-xs sm:text-sm"
              >
                Save Address
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationModal;
