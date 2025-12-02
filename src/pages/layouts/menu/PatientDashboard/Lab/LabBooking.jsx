import { useLocation, useNavigate } from "react-router-dom";
import { MapPin, Star, Clock, CheckCircle2, ArrowLeft } from "lucide-react";
import ProfileCard from "../../../../../components/microcomponents/ProfileCard";
import { getLabAvailableTests } from "../../../../../utils/CrudService";
import { useState } from "react";
import { toast } from "react-toastify";

const LabBooking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { lab, cart } = location.state || {};

  if (!lab || !Array.isArray(cart) || cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center max-w-md w-full">
          <p className="text-gray-600 mb-4">No lab or tests selected.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-lg bg-[var(--primary-color)] text-white hover:opacity-90"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const totalPrice = cart.reduce(
    (sum, t) => sum + (Number(t.price) || 0) * (t.quantity || 1),
    0
  );

  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    try {
      setIsLoading(true);
      
      // Prepare request data
      const requestData = {
        labcenterId: lab.id || 0,
        rating: lab.rating || 0.1,
        reportTime: lab.reportTime || "24 Hours",
        homeCollection: lab.homeCollection || false,
        testIds: cart.filter(item => item.type === 'test').map(test => test.id || 0),
        scanIds: cart.filter(item => item.type === 'scan').map(scan => scan.id || 0),
        packageIds: cart.filter(item => item.type === 'package').map(pkg => pkg.id || 0)
      };

      // Call the API
      const response = await getLabAvailableTests(requestData);
      
      // If API call is successful, navigate to the booking page
      if (response.data) {
        navigate(`/patientdashboard/book-app`, { 
          state: { 
            lab: { ...lab, ...response.data.labDetails },
            cart,
            availableSlots: response.data.availableSlots || []
          } 
        });
      }
    } catch (error) {
      console.error("Error fetching available test slots:", error);
      toast.error("Failed to fetch available time slots. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const initials = (lab?.labName || lab?.name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "LB";

  const profileFields = [
    { label: "Location", value: lab.location || "-" },
    { label: "Timing", value: lab.timings || lab.reportTime || "-" },
    { label: "Home Collection", value: lab.homeCollection ? "Available" : "Not Available" },
  ];

  return (
    <div className="min-h-screen bg-[#f9fafb] px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      {/* Back */}
    

      {/* Lab Summary via ProfileCard */}
      <ProfileCard initials={initials} name={lab.labName || lab.name || 'Lab Center'} fields={profileFields}>
        <div className="flex items-center gap-1 bg-white/10 rounded-full px-2 py-1 text-xs">
          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          <span>{lab.rating ?? "4.5"}</span>
        </div>
      </ProfileCard>


      {/* Selected Tests */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Selected Tests</h3>
          <div className="text-right">
            <p className="text-xl font-bold text-[var(--primary-color)]">₹{totalPrice}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cart.map((test, index) => (
            <div key={index} className="border border-gray-200 rounded-xl p-3 bg-gray-50">
              <div className="flex items-center gap-2 font-semibold text-gray-800">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>{test.title}</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-2 text-xs">
                {test.category && (
                  <span className="px-2 py-1 bg-white border border-gray-200 rounded">{test.category}</span>
                )}
                {test.code && (
                  <span className="px-2 py-1 bg-white border border-gray-200 rounded">Code: {test.code}</span>
                )}
                {test.fasting && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">Fasting required</span>
                )}
              </div>
              <p className="mt-2 text-sm text-gray-600">Report: {lab.reportTime || "24 Hours"}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Book */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Book Your Appointment</h3>
        <p className="text-sm text-gray-600 mb-4">Choose home collection or visit the lab for your selected tests.</p>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-sm text-gray-700">
            <div><span className="font-semibold">Lab:</span> {lab.labName || lab.name || 'Lab Center'}</div>
            <div><span className="font-semibold">Location:</span> {lab.location}</div>
          </div>
          <button
            onClick={handleClick}
            disabled={isLoading}
            className={`px-5 py-2 rounded-lg bg-[var(--primary-color)] text-white font-medium hover:opacity-90 ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Checking Availability...' : 'Book Appointment'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LabBooking;