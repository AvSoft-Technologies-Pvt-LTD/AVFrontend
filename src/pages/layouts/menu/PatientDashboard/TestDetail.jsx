import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import axios from 'axios';
import { addToCart } from '../../../../context-api/cartSlice';
import { FaClock, FaFlask, FaStar, FaCheck, FaFileMedicalAlt, FaMicroscope, FaArrowLeft, FaList } from 'react-icons/fa';

const TestDetail = () => {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);
  const navigate = useNavigate();
  const iconColor = "text-[var(--primary-color)]";

  useEffect(() => {
    axios.get('https://mocki.io/v1/2300a9dc-7329-4c17-9e3e-c29efbc7fdcc')
      .then((res) => {
        const allItems = [...res.data.tests, ...res.data.scans, ...res.data.packages];
        const found = allItems.find((i) => i.id.toString() === id);
        setItem(found);
      })
      .catch((err) => console.error('API Error:', err));
  }, [id]);

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--primary-color)] mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">Loading details...</p>
        </div>
      </div>
    );
  }

  // Render included tests for packages
 // Render included tests for packages
const renderIncludedTests = () => {
  if (item.type === 'package' && item.tests && item.tests.length > 0) {
    return (
      <div className="bg-gray-50 rounded-xl p-4 sm:p-6 mb-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
          <FaList className={`${iconColor} h-5 w-5 sm:h-6 sm:w-6`} />
          Included Tests
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {item.tests.map((test, index) => (
            <div
              key={index}
              className="flex items-start gap-2 text-sm sm:text-base text-gray-600 bg-white rounded-md shadow-sm p-2"
            >
              <FaCheck className={`${iconColor} h-4 w-4 mt-0.5`} />
              <span>{test}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};


  return (
    <div className="min-h-screen py-6 sm:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header: Back + Cart */}
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <button
            onClick={() => window.history.back()}
            className="text-[var(--primary-color)] flex items-center gap-1 text-sm sm:text-base"
          >
            <FaArrowLeft className={`${iconColor} h-4 w-4 sm:h-5 sm:w-5`} />
            Back
          </button>
         <div
             
              onClick={() => navigate('/patientdashboard/cart')}
              className="relative cursor-pointer p-2 sm:p-2.5 rounded-full border-2 border-[var(--primary-color)] bg-white shadow-sm hover:shadow-md transition group flex-shrink-0"
            >
              <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-[var(--primary-color)] group-hover:scale-110 transition-transform duration-200" />
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded-full border-2 border-white shadow-sm">
                  {cart.length}
                </span>
              )}
            </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 flex items-center gap-2">
            {item.type === 'package' ? (
              <FaStar className={`${iconColor} h-5 w-5 sm:h-6 sm:w-6`} />
            ) : item.type === 'scan' ? (
              <FaMicroscope className={`${iconColor} h-5 w-5 sm:h-6 sm:w-6`} />
            ) : (
              <FaFileMedicalAlt className={`${iconColor} h-5 w-5 sm:h-6 sm:w-6`} />
            )}
            {item.title}
          </h1>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <p className="text-xs sm:text-sm text-gray-500">Code: {item.code}</p>
            {item.category && (
              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-[10px] sm:text-xs rounded">
                {item.category}
              </span>
            )}
          </div>

          <p className="text-sm sm:text-base text-gray-600 mb-4">{item.description}</p>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div className="mb-3 sm:mb-0">
              <p className="text-lg sm:text-xl font-semibold text-[var(--primary-color)]">
                ₹{item.price}
              </p>
              {item.originalPrice && (
                <p className="text-sm sm:text-base line-through text-gray-400">
                  ₹{item.originalPrice}
                </p>
              )}
            </div>
            <button
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-[var(--primary-color)] text-white rounded-lg text-sm sm:text-base font-medium  transition-colors"
              onClick={() => dispatch(addToCart(item))}
            >
              Add to Cart
            </button>
          </div>

          {/* Details for tests/scans */}
          {item.type !== 'package' && (
            <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-3 sm:space-y-0 text-sm text-gray-600">
              <div className="flex items-center gap-1.5">
                <FaClock className={`${iconColor} h-4 w-4`} />
                <span>Report: {item.reportTime || '24 hours'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FaFlask className={`${iconColor} h-4 w-4`} />
                <span>{item.fasting ? 'Fasting required' : 'No fasting required'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Included Tests for Packages */}
        {renderIncludedTests()}

        {/* About Section */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaMicroscope className={`${iconColor} h-5 w-5 sm:h-6 sm:w-6`} />
            About {item.title}
          </h2>
          <div className="space-y-3">
            {item.about && (
              <p className="flex items-start gap-2 text-sm sm:text-base">
                <FaCheck className={`${iconColor} h-4 w-4 mt-0.5`} />
                <span>
                  <strong>What is it?</strong> {item.about}
                </span>
              </p>
            )}
            {item.why && (
              <p className="flex items-start gap-2 text-sm sm:text-base">
                <FaCheck className={`${iconColor} h-4 w-4 mt-0.5`} />
                <span>
                  <strong>Why is it done?</strong> {item.why}
                </span>
              </p>
            )}
            {item.type !== 'package' && (
              <p className="flex items-start gap-2 text-sm sm:text-base">
                <FaCheck className={`${iconColor} h-4 w-4 mt-0.5`} />
                <span>
                  <strong>Preparation Required:</strong>{' '}
                  {item.fasting ? 'Fasting required' : 'No fasting required'}
                </span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestDetail;
