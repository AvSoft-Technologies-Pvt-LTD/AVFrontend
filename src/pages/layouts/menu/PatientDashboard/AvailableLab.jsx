import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaStar, FaMapMarkerAlt, FaHome, FaClock } from "react-icons/fa";
import axios from "axios";

const AvailableLabs = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const cart = location.state?.cart;
  const [labs, setLabs] = useState([]);
  const [filteredLabs, setFilteredLabs] = useState([]);
  const [locationFilter, setLocationFilter] = useState("");
  const [homeCollectionOnly, setHomeCollectionOnly] = useState(false);

  const totalPrice = cart.reduce((sum, test) => sum + test.price, 0);

  useEffect(() => {
    axios.get("https://mocki.io/v1/2f914b6d-3a1d-4fe4-b075-219bef09ca4a")
      .then((res) => {
        setLabs(res.data);
        setFilteredLabs(res.data);
      })
      .catch((err) => console.error("Lab API Error:", err));
  }, []);

  const handleFilter = () => {
    let filtered = [...labs];
    if (locationFilter.trim()) {
      filtered = filtered.filter((lab) =>
        lab.location?.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }
    if (homeCollectionOnly) {
      filtered = filtered.filter((lab) => lab.homeCollection === true);
    }
    setFilteredLabs(filtered);
  };

  if (!cart || cart.length === 0) {
    return <div className="p-4 text-center">No tests selected.</div>;
  }

  return (
    <div className="p-4 sm:p-6 rounded-2xl mt-4 sm:mt-6 space-y-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="text-sm sm:text-base text-gray-600 hover:text-gray-800 flex items-center gap-1"
        >
          <span>&larr;</span> Back to Cart
        </button>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800">Selected Tests</h2>
        <div className="mt-4 space-y-3">
          {cart.map((test, index) => (
            <div key={index} className="p-3 border rounded-lg">
              <h3 className="font-medium text-gray-800">{test.title}</h3>
              <p className="text-sm text-gray-600">Code: {test.code}</p>
              <p className="text-sm text-gray-600">Price: ₹{test.price}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Location
            </label>
            <input
              id="location"
              type="text"
              placeholder="Enter location..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4">
            <button onClick={handleFilter} className="view-btn">
              Search
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            id="homeCollection"
            type="checkbox"
            checked={homeCollectionOnly}
            onChange={() => {
              setHomeCollectionOnly(!homeCollectionOnly);
              setTimeout(() => handleFilter(), 0);
            }}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="homeCollection" className="text-sm text-gray-700">
            Home Collection Only
          </label>
        </div>
      </div>

      {filteredLabs.length === 0 ? (
        <p className="text-center text-gray-600">No labs found for selected filters.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLabs.map((lab, index) => (
            <div key={index} className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-800">{lab.name}</h3>
                  <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                    <FaMapMarkerAlt className="text-gray-500" /> {lab.location}
                  </p>
                </div>
                <span className="text-sm flex items-center gap-1">
                  <FaStar className="text-[#F4C430]" /> {lab.rating || "N/A"}
                </span>
              </div>
              <ul className="text-sm text-gray-600 space-y-1 mt-3">
                <li className="flex items-center gap-2">
                  <FaClock className="text-gray-500" /> Reports in {lab.reportTime || "24 hours"}
                </li>
                <li className="flex items-center gap-2">
                  <FaHome className="text-gray-500" /> Home Collection {lab.homeCollection ? "Available" : "Not available"}
                </li>
              </ul>
              <div className="flex justify-between items-center mt-4">
                <p className="font-medium text-gray-800">₹{totalPrice}</p>
                <button
                  onClick={() => navigate(`/patientdashboard/lab-booking`, {
                    state: { lab, cart }
                  })}
                  className="view-btn"
                >
                  Select Lab
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailableLabs;
