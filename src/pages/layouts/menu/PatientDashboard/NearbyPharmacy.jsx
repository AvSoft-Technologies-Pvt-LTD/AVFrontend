import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin, Phone, Clock, Building, Search, Loader2, Navigation, ExternalLink, Star, Globe, Target, Crosshair } from 'lucide-react';

const PharmacyFinder = () => {
  const [pharmacies, setPharmacies] = useState([]), [loading, setLoading] = useState(false), [error, setError] = useState(null), [userLocation, setUserLocation] = useState(null), [locationError, setLocationError] = useState(null), [searchQuery, setSearchQuery] = useState(''), [searchLoading, setSearchLoading] = useState(false), [currentLocationName, setCurrentLocationName] = useState('');

  useEffect(() => { axios.defaults.timeout = 15000; }, []);
  useEffect(() => { if (userLocation) fetchNearbyPharmacies(userLocation.lat, userLocation.lon); }, [userLocation]);

  const handleSearch = async (e) => {
    e.preventDefault(); if (!searchQuery.trim()) return; setSearchLoading(true); setError(null);
    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/search', { params: { q: `${searchQuery}, India`, format: 'json', limit: 1, addressdetails: 1 } });
      const data = response.data; if (!data || data.length === 0) { setError('Location not found. Please try a different search term.'); return; }
      const location = data[0]; setUserLocation({ lat: parseFloat(location.lat), lon: parseFloat(location.lon) }); setCurrentLocationName(location.display_name);
    } catch (err) {
      console.error('Search error:', err); setError(err.code === 'ECONNABORTED' ? 'Search request timed out. Please try again.' : err.response ? `Search failed: ${err.response.status} ${err.response.statusText}` : err.request ? 'Network error. Please check your internet connection.' : 'Failed to search location. Please try again.');
    } finally { setSearchLoading(false); }
  };

  const getUserLocation = () => {
    setLoading(true); setLocationError(null); setError(null);
    if (!navigator.geolocation) { setLocationError('Geolocation is not supported by this browser.'); setLoading(false); return; }
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const res = await axios.get('https://nominatim.openstreetmap.org/reverse', { params: { lat: latitude, lon: longitude, format: 'json', addressdetails: 1 } });
          setUserLocation({ lat: latitude, lon: longitude }); setCurrentLocationName(res.data.display_name || 'Current Location');
        } catch (err) { console.error('Reverse geocoding error:', err); setUserLocation({ lat: latitude, lon: longitude }); setCurrentLocationName('Current Location'); }
      },
      (err) => { setLoading(false); const msg = { 1: 'Please allow location access to find nearby pharmacies.', 2: 'Location information is unavailable.', 3: 'Location request timed out. Please try again.' }; setLocationError(msg[err.code] || 'Unknown location error occurred.'); },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  };

  const fetchNearbyPharmacies = async (lat, lon) => {
    setLoading(true); setError(null);
    try {
      const overpassQuery = `[out:json][timeout:45];(node["amenity"="pharmacy"](around:15000,${lat},${lon});way["amenity"="pharmacy"](around:15000,${lat},${lon});relation["amenity"="pharmacy"](around:15000,${lat},${lon});node["shop"="medical"](around:15000,${lat},${lon});way["shop"="medical"](around:15000,${lat},${lon});node["shop"="chemist"](around:15000,${lat},${lon});way["shop"="chemist"](around:15000,${lat},${lon});node["amenity"="hospital"]["pharmacy"="yes"](around:15000,${lat},${lon});node["amenity"="clinic"]["pharmacy"="yes"](around:15000,${lat},${lon});node["healthcare"="pharmacy"](around:15000,${lat},${lon});way["healthcare"="pharmacy"](around:15000,${lat},${lon}););out body;>;out skel qt;`;
      const res = await axios.post('https://overpass-api.de/api/interpreter', overpassQuery, { headers: { 'Content-Type': 'text/plain' }, timeout: 45000 });
      let elements = res.data.elements || [], nodes = elements.filter(e => e.type === 'node' && e.tags && (e.tags.amenity === 'pharmacy' || e.tags.shop === 'medical' || e.tags.shop === 'chemist' || e.tags.healthcare === 'pharmacy' || (e.tags.amenity === 'hospital' && e.tags.pharmacy === 'yes') || (e.tags.amenity === 'clinic' && e.tags.pharmacy === 'yes')));
      if (!nodes.length) {
        const bq = `[out:json][timeout:30];(node["amenity"="pharmacy"](around:25000,${lat},${lon});node["shop"="medical"](around:25000,${lat},${lon});node["shop"="chemist"](around:25000,${lat},${lon}););out body;`;
        const bres = await axios.post('https://overpass-api.de/api/interpreter', bq, { headers: { 'Content-Type': 'text/plain' }, timeout: 30000 });
        const bel = bres.data.elements || [], backups = bel.filter(e => e.type === 'node' && e.tags && (e.tags.amenity === 'pharmacy' || e.tags.shop === 'medical' || e.tags.shop === 'chemist'));
        if (!backups.length) { setError('No pharmacies found in your area (searched up to 25km radius). Try searching in a different location or major city nearby.'); setPharmacies([]); return; }
        nodes.push(...backups);
      }
      const unique = nodes.filter((n, i, s) => i === s.findIndex(o => Math.abs(o.lat - n.lat) < 0.0001 && Math.abs(o.lon - n.lon) < 0.0001));
      const data = await Promise.all(unique.map(async (n) => {
        let dist = calculateDistance(lat, lon, n.lat, n.lon), address = 'Address not available';
        try { const addrRes = await axios.get('https://nominatim.openstreetmap.org/reverse', { params: { lat: n.lat, lon: n.lon, format: 'json', addressdetails: 1 }, timeout: 8000 }); address = addrRes.data.display_name || address; }
        catch (err) { console.error('Address lookup error:', err); if (n.tags['addr:full']) address = n.tags['addr:full']; else if (n.tags['addr:street']) { const s = n.tags['addr:street'], h = n.tags['addr:housenumber'] || '', c = n.tags['addr:city'] || '', st = n.tags['addr:state'] || ''; address = `${h} ${s}, ${c}, ${st}`.trim().replace(/^,\s*/, '').replace(/,\s*$/, ''); } }
        const type = n.tags.amenity === 'pharmacy' ? 'Pharmacy' : n.tags.shop === 'medical' ? 'Medical Store' : n.tags.shop === 'chemist' ? 'Chemist' : n.tags.healthcare === 'pharmacy' ? 'Healthcare Pharmacy' : 'Pharmacy';
        const name = n.tags.name || n.tags.brand || `Local ${type}`;
        return { id: n.id, name, type, address, phone: n.tags.phone || n.tags['contact:phone'] || 'Not available', website: n.tags.website || n.tags['contact:website'] || null, opening_hours: n.tags.opening_hours || 'Hours not available', lat: n.lat, lon: n.lon, distance: dist, brand: n.tags.brand || null, operator: n.tags.operator || null };
      }));
      data.sort((a, b) => a.distance - b.distance); setPharmacies(data.slice(0, 50));
    } catch (err) {
      console.error('Error fetching pharmacies:', err);
      setError(err.code === 'ECONNABORTED' ? 'Request timed out. The pharmacy service may be busy. Please try again.' : err.response ? `Failed to fetch pharmacies: ${err.response.status} ${err.response.statusText}` : err.request ? 'Network error. Please check your internet connection and try again.' : 'Failed to fetch nearby pharmacies. Please try again.');
    } finally { setLoading(false); }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371, dLat = deg2rad(lat2 - lat1), dLon = deg2rad(lon2 - lon1), a = Math.sin(dLat / 2) ** 2 + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) ** 2, c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); return R * c;
  };
  const deg2rad = (deg) => deg * (Math.PI / 180);
  const formatDistance = (distance) => distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`;
  const formatPhoneNumber = (phone) => !phone || phone === 'Not available' ? phone : phone.replace(/\D/g, '').length === 10 ? `+91 ${phone.replace(/\D/g, '').slice(0, 5)} ${phone.replace(/\D/g, '').slice(5)}` : phone;
  const getDirectionsUrl = (lat, lon, name) => `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&destination_place_id=${encodeURIComponent(name)}`;

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-5 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-xl p-4 sm:p-6 mb-6">
          <div className="flex justify-center mb-4 sm:mb-6"><div className="relative"><Building className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: '#0E1630' }} /><div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: '#01D48C' }}><div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div></div></div></div>
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-center mb-2 sm:mb-3" style={{ color: '#0E1630' }}>Pharmacy Finder</h1>
          <p className="text-sm sm:text-base md:text-lg text-center mb-6 sm:mb-8 font-medium" style={{ color: '#0E1630' }}>Find nearby pharmacies, medical stores & chemists with comprehensive search</p>
          <div className="flex flex-col items-center gap-3 sm:gap-4">
            <form onSubmit={handleSearch} className="flex gap-2 w-full max-w-xs sm:max-w-md md:max-w-2xl items-center">
              <div className="relative flex-1"><Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#0E1630', opacity: 0.5 }} /><input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by city, area, or landmark..." className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 border-2 rounded-lg sm:rounded-xl text-sm sm:text-base bg-white transition-all duration-300 outline-none focus:ring-2" style={{ borderColor: '#0E1630', color: '#0E1630', '--tw-ring-color': '#01D48C' }} /></div>
              <button type="submit" disabled={searchLoading || !searchQuery.trim()} className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 text-white rounded-lg sm:rounded-xl font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none shadow-lg" style={{ backgroundColor: '#0E1630' }}>{searchLoading ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <Search className="w-4 h-4 sm:w-5 sm:h-5" />}</button>
            </form>
            <div className="flex items-center gap-2 sm:gap-4 w-full max-w-xs sm:max-w-md md:max-w-2xl"><div className="flex-1 h-px" style={{ backgroundColor: '#0E1630', opacity: 0.2 }}></div><span className="text-xs sm:text-sm font-medium" style={{ color: '#0E1630', opacity: 0.6 }}>OR</span><div className="flex-1 h-px" style={{ backgroundColor: '#0E1630', opacity: 0.2 }}></div></div>
            <button onClick={getUserLocation} disabled={loading} className="group relative overflow-hidden text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-medium sm:font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none w-full max-w-xs sm:max-w-md md:max-w-2xl" style={{ background: 'linear-gradient(135deg, #01D48C 0%, #0E1630 100%)' }}><div className="flex items-center justify-center gap-1.5 sm:gap-2">{loading ? <><Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /><span className="text-xs sm:text-sm">Locating...</span></> : <><div className="relative"><Target className="w-4 h-4 sm:w-5 sm:h-5" /><Crosshair className="absolute inset-0 w-4 h-4 sm:w-5 sm:h-5 animate-pulse" /></div><span className="text-xs sm:text-sm">Use Current Location</span></>}</div><div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div></button>
          </div>
          {locationError && <div className="mt-4 sm:mt-5 p-3 sm:p-4 bg-red-50 border-l-4 border-red-400 text-red-700 rounded-lg text-xs sm:text-sm"><div className="flex items-center gap-1.5 sm:gap-2"><div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-400 rounded-full"></div><span className="font-medium">{locationError}</span></div></div>}
          {currentLocationName && <div className="mt-4 sm:mt-5 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6 bg-white/90 backdrop-blur-sm"><div className="flex items-center gap-1.5 sm:gap-2 justify-center"><MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: '#01D48C' }} /><span className="text-xs sm:text-sm font-medium text-center" style={{ color: '#0E1630' }}>Searching near: {currentLocationName}</span></div></div>}
        </div>
        {loading && <div className="flex flex-col justify-center items-center py-12 sm:py-16 bg-white/90 backdrop-blur-xl rounded-xl sm:rounded-2xl mb-4 sm:mb-5"><div className="relative"><Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin mb-3 sm:mb-4" style={{ color: '#0E1630' }} /><div className="absolute inset-0 w-8 h-8 sm:w-10 sm:h-10 border-2 sm:border-4 rounded-full animate-ping" style={{ borderColor: '#01D48C' }}></div></div><p className="font-medium text-xs sm:text-sm" style={{ color: '#0E1630' }}>Searching for pharmacies in a 15km radius...</p><p className="text-xs sm:text-sm mt-1.5 sm:mt-2" style={{ color: '#0E1630', opacity: 0.6 }}>This may take a moment for comprehensive results</p></div>}
        {error && <div className="p-3 sm:p-5 bg-red-50 border-l-4 border-red-400 text-red-700 rounded-lg mb-4 sm:mb-5 text-xs sm:text-sm"><div className="flex items-center gap-1.5 sm:gap-2"><div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-400 rounded-full"></div><span className="font-medium">{error}</span></div></div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {pharmacies.map((pharmacy) => (
            <div key={pharmacy.id} className="bg-white/95 backdrop-blur-xl rounded-lg sm:rounded-xl p-4 sm:p-5 shadow-md sm:shadow-lg border border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-0.5 sm:h-1" style={{ background: 'linear-gradient(90deg, #0E1630 0%, #01D48C 100%)' }}></div>
              <div className="flex justify-between items-start mb-3 sm:mb-4 gap-2 sm:gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base font-bold leading-tight mb-1 truncate" style={{ color: '#0E1630' }}>{pharmacy.name}</h3>
                  <span className="inline-block px-2 py-0.5 sm:px-2.5 sm:py-1 text-xs font-semibold rounded-full" style={{ backgroundColor: '#01D48C', color: 'white', opacity: 0.9 }}>{pharmacy.type}</span>
                </div>
                <div className="text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap shadow-sm" style={{ background: 'linear-gradient(135deg, #0E1630 0%, #01D48C 100%)' }}>{formatDistance(pharmacy.distance)}</div>
              </div>
              <div className="space-y-2 sm:space-y-2.5 mb-3 sm:mb-4">
                <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-2.5 bg-gray-50 rounded-lg transition-colors hover:bg-gray-100"><MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0" style={{ color: '#0E1630' }} /><span className="text-xs sm:text-sm leading-relaxed" style={{ color: '#0E1630' }}>{pharmacy.address}</span></div>
                <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 bg-gray-50 rounded-lg transition-colors hover:bg-gray-100"><Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" style={{ color: '#0E1630' }} /><span className="text-xs sm:text-sm" style={{ color: '#0E1630' }}>{formatPhoneNumber(pharmacy.phone)}</span></div>
                <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 bg-gray-50 rounded-lg transition-colors hover:bg-gray-100"><Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" style={{ color: '#0E1630' }} /><span className="text-xs sm:text-sm" style={{ color: '#0E1630' }}>{pharmacy.opening_hours}</span></div>
                {pharmacy.brand && <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 bg-gray-50 rounded-lg transition-colors hover:bg-gray-100"><Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" style={{ color: '#0E1630' }} /><span className="text-xs sm:text-sm" style={{ color: '#0E1630' }}>Brand: {pharmacy.brand}</span></div>}
                {pharmacy.website && <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 bg-gray-50 rounded-lg transition-colors hover:bg-gray-100"><Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" style={{ color: '#0E1630' }} /><a href={pharmacy.website} target="_blank" rel="noopener noreferrer" className="text-xs sm:text-sm underline hover:opacity-80 transition-colors" style={{ color: '#01D48C' }}>Visit Website</a></div>}
              </div>
              <div className="flex gap-1.5 sm:gap-2 justify-end">
                <a href={getDirectionsUrl(pharmacy.lat, pharmacy.lon, pharmacy.name)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-white border rounded-lg font-medium text-xs sm:text-sm transition-all duration-300 hover:scale-105" style={{ borderColor: '#0E1630', color: '#0E1630' }} onMouseEnter={(e) => { e.target.style.backgroundColor = '#0E1630'; e.target.style.color = 'white'; }} onMouseLeave={(e) => { e.target.style.backgroundColor = 'white'; e.target.style.color = '#0E1630'; }}><Navigation className="w-3.5 h-3.5 sm:w-4 sm:h-4" />Directions</a>
                {pharmacy.phone !== 'Not available' && <a href={`tel:${pharmacy.phone}`} className="flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 text-white rounded-lg font-medium text-xs sm:text-sm transition-all duration-300 hover:scale-105 shadow-sm hover:opacity-90" style={{ backgroundColor: '#01D48C' }}><Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />Call</a>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PharmacyFinder;
