import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const DoctorList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { filteredDoctors = [], preservedFormState = null } = location.state || {};
  
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };
  
  // Get user from localStorage with error handling
  const getUserFromStorage = () => {
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      return null;
    }
  };
  
  const user = getUserFromStorage();
  
  const searchFilteredDoctors = filteredDoctors.filter(doctor =>
    doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialty?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBooking = async () => { 
    if (!selectedDoctor || !selectedDate || !selectedTime) { 
      alert("Please select a doctor, date, and time."); 
      return; 
    } 
    
    setIsLoading(true);
    
    const payload = { 
      userId: user?.id || "N/A", 
      name: `${user?.firstName || "Guest"} ${user?.lastName || ""}`, 
      phone: user?.phone || "N/A", 
      email: user?.email || "N/A", 
      date: selectedDate, 
      time: selectedTime, 
      specialty: selectedDoctor.specialty, 
      doctorId: selectedDoctor.id, 
      doctorName: selectedDoctor.name, 
      status: "Upcoming", 
      notification: { 
        doctorId: selectedDoctor.id, 
        message: `New appointment with ${user?.firstName || "a patient"} on ${selectedDate} at ${selectedTime}.` 
      } 
    }; 
    
    try { 
      await axios.post("https://67e3e1e42ae442db76d2035d.mockapi.io/register/book", payload); 
      setShowBookingModal(false); 
      setShowConfirmationModal(true); 
      setTimeout(() => { 
        setShowConfirmationModal(false); 
        navigate('/patientdashboard/app'); 
      }, 500); 
    } catch (error) { 
      console.error("Booking failed:", error); 
      alert("Booking failed. Please try again."); 
    } finally {
      setIsLoading(false);
    }
  };

  // Handle back navigation with preserved state
  const handleBackNavigation = () => {
    if (preservedFormState) {
      navigate('/patientdashboard/book-appointment', {
        state: { preservedFormState }
      });
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8 px-4" style={{background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #f8fafc 100%)'}}>
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={handleBackNavigation}
                className="flex items-center justify-center w-10 h-10 rounded-full hover:opacity-80 transition-colors duration-200 group" 
                style={{backgroundColor:"#f1f5f9"}}
              >
                <svg className="w-5 h-5 group-hover:opacity-80 transition-colors" fill="none" stroke="#0E1630" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold" style={{color:"#0E1630"}}>Available Doctors</h1>
                <p className="text-sm mt-1" style={{color:"#64748b"}}>{searchFilteredDoctors.length} doctors found</p>
              </div>
            </div>
            <div className="relative w-full sm:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5" fill="none" stroke="#64748b" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input 
                type="text" 
                placeholder="Search doctors, specialties, locations..." 
                value={searchTerm} 
                onChange={(e)=>setSearchTerm(e.target.value)} 
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white" 
                style={{focusRingColor:"#01D48C"}} 
                onFocus={(e)=>e.target.style.boxShadow='0 0 0 2px #01D48C33'} 
                onBlur={(e)=>e.target.style.boxShadow='none'} 
              />
            </div>
          </div>
        </div>
        
        {searchFilteredDoctors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {searchFilteredDoctors.map((doc) => (
              <div 
                key={doc.id} 
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group" 
                style={{'&:hover':{borderColor:'#01D48C55'}}} 
                onMouseEnter={(e)=>e.currentTarget.style.borderColor='#01D48C55'} 
                onMouseLeave={(e)=>e.currentTarget.style.borderColor='#e5e7eb'}
              >
                <div className="p-6 pb-4">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <img 
                        src={doc.image || "https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg"} 
                        alt={doc.name} 
                        className="w-16 h-16 rounded-full object-cover border-3 border-green-300 group-hover:transition-colors duration-300" 
                        onMouseEnter={(e)=>e.target.style.borderColor='#01D48C55'} 
                        onMouseLeave={(e)=>e.target.style.borderColor='#e5e7eb'} 
                      />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white" style={{backgroundColor:'#01D48C'}}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold truncate" style={{color:'#0E1630'}}>{doc.name}</h3>
                      <p className="text-sm font-medium mt-1" style={{color:'#01D48C'}}>{doc.specialty}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20" style={{color:'#01D48C'}}>
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-sm ml-1" style={{color:'#64748b'}}>4.8</span>
                        </div>
                        <span style={{color:'#cbd5e1'}}>•</span>
                        <span className="text-sm" style={{color:'#64748b'}}>{doc.experience||'5+'} years</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-6 pb-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="#64748b" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-sm" style={{color:'#64748b'}}>{doc.location||"Location not available"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="#64748b" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm" style={{color:'#64748b'}}>Available Today</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="#64748b" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm capitalize" style={{color:'#64748b'}}>{doc.doctorType||'General'}</span>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-gray-100" style={{backgroundColor:'#f8fafc'}}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xl font-bold" style={{color:'#0E1630'}}>₹{doc.fees}</span>
                      <span className="text-sm ml-1" style={{color:'#64748b'}}>per consultation</span>
                    </div>
                    <button 
                      onClick={()=>{setSelectedDoctor(doc);setShowBookingModal(true);}} 
                      className="px-4 py-2 text-white font-semibold text-sm rounded-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2" 
                      style={{backgroundColor:'#01D48C',focusRingColor:'#01D48C'}} 
                      onMouseEnter={(e)=>e.target.style.backgroundColor='#00b377'} 
                      onMouseLeave={(e)=>e.target.style.backgroundColor='#01D48C'}
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center" style={{backgroundColor:'#f1f5f9'}}>
              <svg className="w-12 h-12" fill="none" stroke="#64748b" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.291-1.1-5.5-2.709" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{color:'#0E1630'}}>No doctors found</h3>
            <p className="mb-6" style={{color:'#64748b'}}>Try adjusting your search criteria or browse all available doctors.</p>
            <button 
              onClick={()=>setSearchTerm('')} 
              className="px-6 py-2 text-white rounded-xl transition-colors duration-200" 
              style={{backgroundColor:'#01D48C'}} 
              onMouseEnter={(e)=>e.target.style.backgroundColor='#00b377'} 
              onMouseLeave={(e)=>e.target.style.backgroundColor='#01D48C'}
            >
              Clear Search
            </button>
          </div>
        )}
      </div>

      {showBookingModal && selectedDoctor && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl relative transition-all duration-300 scale-100">
            <button 
              onClick={() => setShowBookingModal(false)} 
              className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full hover:opacity-80 transition-all duration-200" 
              style={{backgroundColor: '#f1f5f9'}}
            >
              <svg className="w-5 h-5" fill="none" stroke="#64748b" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="text-center mb-5">
              <img 
                src={selectedDoctor.image || "https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg"} 
                alt={selectedDoctor.name} 
                className="w-20 h-20 rounded-2xl object-cover mx-auto mb-4 border-2" 
                style={{borderColor: '#01D48C33'}}
              />
              <h2 className="text-2xl font-bold" style={{color: '#0E1630'}}>{selectedDoctor.name}</h2>
              <p className="font-medium mt-1" style={{color: '#01D48C'}}>{selectedDoctor.specialty}</p>
              <p className="text-sm mt-1" style={{color: '#64748b'}}>{selectedDoctor.qualification}</p>
              <div className="flex items-center justify-center gap-4 mt-3">
                <span className="text-sm" style={{color: '#64748b'}}>{selectedDoctor.experience || '5+'} years experience</span>
                <span style={{color: '#cbd5e1'}}>•</span>
                <span className="text-xl font-bold" style={{color: '#01D48C'}}>₹{selectedDoctor.fees}</span>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-3" style={{color: '#0E1630'}}>Select Date</label>
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)} 
                  min={getTodayDate()}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200" 
                  onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #01D48C33'} 
                  onBlur={(e) => e.target.style.boxShadow = 'none'}
                />
              </div>

              {selectedDate && (
                <div>
                  <label className="block text-sm font-semibold mb-3" style={{color: '#0E1630'}}>Available Time Slots</label>
                  <div className="grid grid-cols-3 gap-3">
                    {selectedDoctor.availability?.find(slot => slot.date === selectedDate)?.times?.map(time => (
                      <button 
                        key={time} 
                        onClick={() => setSelectedTime(time)} 
                        className={`py-2 px-3 rounded-xl text-sm font-medium transition-all duration-200 ${selectedTime === time ? "text-white shadow-lg transform scale-105" : "border"}`} 
                        style={{
                          backgroundColor: selectedTime === time ? '#01D48C' : '#f8fafc', 
                          color: selectedTime === time ? 'white' : '#0E1630', 
                          borderColor: selectedTime === time ? '#01D48C' : '#01D48C55'
                        }} 
                        onMouseEnter={(e) => {if (selectedTime !== time) e.target.style.backgroundColor = '#f0fdfa'}} 
                        onMouseLeave={(e) => {if (selectedTime !== time) e.target.style.backgroundColor = '#f8fafc'}}
                      >
                        {time}
                      </button>
                    )) || (
                      <div className="col-span-3 text-center py-4" style={{color: '#64748b'}}>No available slots for this date</div>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-4">
                <button 
                  onClick={handleBooking} 
                  disabled={!selectedDate || !selectedTime || isLoading} 
                  className={`w-full py-3 rounded-xl font-semibold text-md transition-all duration-200 ${!selectedDate || !selectedTime || isLoading ? "cursor-not-allowed" : "text-white shadow-lg hover:shadow-xl transform hover:scale-105"}`} 
                  style={{
                    backgroundColor: !selectedDate || !selectedTime || isLoading ? '#e2e8f0' : '#01D48C', 
                    color: !selectedDate || !selectedTime || isLoading ? '#64748b' : 'white'
                  }} 
                  onMouseEnter={(e) => {if (selectedDate && selectedTime && !isLoading) e.target.style.backgroundColor = '#00b377'}} 
                  onMouseLeave={(e) => {if (selectedDate && selectedTime && !isLoading) e.target.style.backgroundColor = '#01D48C'}}
                >
                  {isLoading ? 'Processing...' : !selectedDate || !selectedTime ? 'Select Date & Time' : 'Confirm Booking'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showConfirmationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl animate-slide-up">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Booking Confirmed!</h3>
            <p className="text-slate-600 text-sm">Your appointment has been successfully scheduled.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorList;