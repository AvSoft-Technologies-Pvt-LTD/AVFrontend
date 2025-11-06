import { useLocation, useNavigate } from "react-router-dom";
import { FaCheck, FaStar, FaClock, FaMapMarkerAlt } from "react-icons/fa";

const LabBooking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { lab, cart } = location.state || {};

  console.log("Location state:", location.state); // Debugging

  if (!lab || !cart || cart.length === 0) {
    return (
      <div className="p-4 text-center text-gray-600">
        Error: No lab or tests selected. Please go back and try again.
      </div>
    );
  }

  const totalPrice = cart.reduce((sum, test) => sum + test.price, 0);

  const handleClick = () => {
    navigate(`/patientdashboard/book-app`, { state: { lab, cart } });
  };

  return (
    <div className="p-4 sm:p-6 bg-white rounded-2xl shadow-lg space-y-6 max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm sm:text-base text-[#0e1630] hover:text-[#0a1028]"
      >
        <span>←</span> Back to Labs List
      </button>

      <div className="p-4 sm:p-6 border border-gray-200 rounded-xl shadow-sm">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{lab.name}</h2>
        <p className="text-sm sm:text-base text-gray-600 mt-2 flex items-center gap-1">
          <FaMapMarkerAlt className="text-[#0e1630]" /> {lab.location}
        </p>
        <p className="text-sm sm:text-base text-gray-600 mt-1 flex items-center gap-1">
          <FaClock className="text-[#0e1630]" /> {lab.timings}
        </p>
        <p className="text-sm sm:text-base text-green-600 mt-1 flex items-center gap-1">
          <FaStar className="text-[#F4C430]" /> {lab.rating}/5
        </p>
        <hr className="my-4 border-gray-200" />
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">Facilities & Services</h3>
        <ul className="space-y-2 text-sm sm:text-base text-gray-600">
          {lab.nabl && <li className="flex items-center gap-2"><FaCheck className="text-[#0e1630]" /> NABL Accredited</li>}
          {lab.digitalReports && <li className="flex items-center gap-2"><FaCheck className="text-[#0e1630]" /> Digital Reports</li>}
          {lab.homeCollection && <li className="flex items-center gap-2"><FaCheck className="text-[#0e1630]" /> Home Collection Available</li>}
          {lab.expertPathologists && <li className="flex items-center gap-2"><FaCheck className="text-[#0e1630]" /> Expert Pathologists</li>}
        </ul>
      </div>

      <div className="p-4 sm:p-6 border border-gray-200 rounded-xl shadow-sm">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">Selected Tests</h3>
        {cart.map((test, index) => (
          <div key={index} className="mb-4 p-3 border rounded-lg">
            <p className="text-sm sm:text-base font-semibold text-gray-800 mb-2">{test.title}</p>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs sm:text-sm rounded">{test.category}</span>
              {test.code && <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs sm:text-sm rounded">Code: {test.code}</span>}
            </div>
            <p className="text-sm sm:text-base text-gray-600 mb-2">Report Time: {lab.reportTime}</p>
            <p className="text-sm sm:text-base text-gray-600 mb-3">{test.fasting ? `${test.fasting} hours fasting required` : "No fasting required"}</p>
          </div>
        ))}
        <div className="text-right">
          <p className="text-xl sm:text-2xl font-bold text-[var(--primary-color)]">₹{totalPrice}</p>
          {lab.originalPrice && (
            <>
              <p className="text-sm sm:text-base line-through text-gray-500">₹{lab.originalPrice}</p>
              <p className="text-sm sm:text-base text-green-600">Save ₹{lab.originalPrice - totalPrice}</p>
            </>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-6 border border-gray-200 rounded-xl shadow-sm space-y-4">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Book Your Appointment</h3>
        <p className="text-sm sm:text-base text-gray-600 mb-4">
          Choose between home sample collection or visiting the lab for your selected tests.
        </p>
        <button
          onClick={handleClick}
          className="w-full sm:w-auto px-4 py-2 bg-[var(--primary-color)] text-white rounded-md hover:bg-[#4338CA] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
        >
          Book Appointment
        </button>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-lg font-semibold text-gray-800 mb-2">Lab Information:</h4>
          <p className="text-sm sm:text-base text-gray-600"><strong>Lab Name:</strong> {lab.name}</p>
          <p className="text-sm sm:text-base text-gray-600"><strong>Location:</strong> {lab.location}</p>
        </div>
      </div>
    </div>
  );
};

export default LabBooking;
