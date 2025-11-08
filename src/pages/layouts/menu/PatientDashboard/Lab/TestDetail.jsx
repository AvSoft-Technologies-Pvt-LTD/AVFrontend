// ../PatientDashboard/Lab/TestDetail.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState, useMemo } from 'react';
import { ShoppingCart } from 'lucide-react';
import { hydrateCart } from '../../../../../context-api/cartSlice';
import { initializeAuth } from '../../../../../context-api/authSlice';
import {
  getLabTestById,
  getScanById,
  getPackageById,
  createLabCart,
  getLabCart,
} from '../../../../../utils/CrudService';
import {
  FaClock,
  FaFlask,
  FaStar,
  FaCheck,
  FaFileMedicalAlt,
  FaMicroscope,
  FaArrowLeft,
  FaList,
} from 'react-icons/fa';

const TestDetail = () => {
  // ✅ IMPORTANT: we now read both `type` and `id` from the URL
  // type = 'tests' | 'scans' | 'packages'
  const { type, id } = useParams();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);
  const navigate = useNavigate();
  const iconColor = 'text-[var(--primary-color)]';

  const patientIdFromStore = useSelector(
    (state) => state.auth?.user?.patientId ?? state.auth?.patientId ?? null
  );
  const patientId = patientIdFromStore == null ? null : Number(patientIdFromStore);

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  const isPackage = type === 'packages';
  const isScan = type === 'scans';
  const isTest = type === 'tests';

  // Choose header icon based on type
  const HeaderIcon = useMemo(() => {
    if (isPackage) return FaStar;
    if (isScan) return FaMicroscope;
    return FaFileMedicalAlt; // tests
  }, [isPackage, isScan]);

  // Fetch detail from the correct API based on `type`
  useEffect(() => {
    let active = true;

    const fetchDetail = async () => {
      setLoading(true);
      try {
        let res;
        if (isTest) {
          res = await getLabTestById(id);        // GET /api/lab-tests/:id
        } else if (isScan) {
          res = await getScanById(id);           // GET /api/scans/:id
        } else if (isPackage) {
          res = await getPackageById(id);        // GET /api/packages/:id
        } else {
          throw new Error(`Unknown type: ${type}`);
        }
        if (active) setItem(res.data);
      } catch (err) {
        console.error('Detail API error:', err?.response?.data || err.message);
        if (active) setItem(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchDetail();
    return () => {
      active = false;
    };
  }, [type, id, isTest, isScan, isPackage]);

  const handleAdd = async () => {
    try {
      if (!(Number.isInteger(patientId) && patientId > 0)) {
        console.error('Cannot add to cart: missing patientId');
        return;
      }

      const currentResp = await getLabCart(patientId);
      const current = currentResp?.data || { tests: [], scans: [], packages: [] };
      const testIds = (current.tests || [])
        .map((t) => t.id ?? t.testId)
        .filter((v) => Number.isInteger(Number(v)))
        .map(Number);
      const scanIds = (current.scans || [])
        .map((s) => s.id ?? s.scanId)
        .filter((v) => Number.isInteger(Number(v)))
        .map(Number);
      const packageIds = (current.packages || [])
        .map((p) => p.id ?? p.packageId)
        .filter((v) => Number.isInteger(Number(v)))
        .map(Number);

      const itemId = Number(item?.id);
      if (!Number.isInteger(itemId)) return;

      if (isTest) {
        if (!testIds.includes(itemId)) testIds.push(itemId);
      } else if (isScan) {
        if (!scanIds.includes(itemId)) scanIds.push(itemId);
      } else if (isPackage) {
        if (!packageIds.includes(itemId)) packageIds.push(itemId);
      } else {
        return;
      }

      const payload = { testIds, scanIds, packageIds };
      await createLabCart(patientId, payload);

      const refreshed = await getLabCart(patientId);
      dispatch(hydrateCart(refreshed.data));
    } catch (error) {
      console.error('Error adding to cart:', error?.response?.data || error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--primary-color)] mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">Loading details...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600 text-sm sm:text-base">No item found.</p>
          <button
            onClick={() => window.history.back()}
            className="mt-3 text-[var(--primary-color)] underline"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  // Included tests (packages only)
  const renderIncludedTests = () => {
    const tests = Array.isArray(item.tests) ? item.tests : [];
    if (!isPackage || tests.length === 0) return null;

    return (
      <div className="bg-gray-50 rounded-xl p-4 sm:p-6 mb-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
          <FaList className={`${iconColor} h-5 w-5 sm:h-6 sm:w-6`} />
          Included Tests
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {tests.map((t, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2 text-sm sm:text-base text-gray-600 bg-white rounded-md shadow-sm p-2"
            >
              <FaCheck className={`${iconColor} h-4 w-4 mt-0.5`} />
              <span>{t}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Safe getters (packages may not have some fields)
  const {
    title,
    code,
    category,
    description,
    about,
    why,
    price,
    originalPrice,
    reportTime,
    fasting,
  } = item || {};

  return (
    <div className="min-h-screen py-6 sm:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header: Back + Cart */}
   <div className="flex justify-end items-center mb-4 sm:mb-6">
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
            {HeaderIcon ? (
              <HeaderIcon className={`${iconColor} h-5 w-5 sm:h-6 sm:w-6`} />
            ) : null}
            {title}
          </h1>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            {code && <p className="text-xs sm:text-sm text-gray-500">Code: {code}</p>}
            {category && (
              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-[10px] sm:text-xs rounded">
                {category}
              </span>
            )}
          </div>

          {description && (
            <p className="text-sm sm:text-base text-gray-600 mb-4">{description}</p>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div className="mb-3 sm:mb-0">
              {typeof price !== 'undefined' && (
                <p className="text-lg sm:text-xl font-semibold text-[var(--primary-color)]">
                  ₹{price}
                </p>
              )}
              {originalPrice && (
                <p className="text-sm sm:text-base line-through text-gray-400">
                  ₹{originalPrice}
                </p>
              )}
            </div>
            <button
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-[var(--primary-color)] text-white rounded-lg text-sm sm:text-base font-medium transition-colors"
              onClick={handleAdd}
            >
              Add to Cart
            </button>
          </div>

          {/* Only for tests/scans */}
          {(isTest || isScan) && (
            <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-3 sm:space-y-0 text-sm text-gray-600">
              <div className="flex items-center gap-1.5">
                <FaClock className={`${iconColor} h-4 w-4`} />
                <span>Report: {reportTime || '24 hours'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FaFlask className={`${iconColor} h-4 w-4`} />
                <span>{fasting ? 'Fasting required' : 'No fasting required'}</span>
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
            About {title}
          </h2>
          <div className="space-y-3">
            {about && (
              <p className="flex items-start gap-2 text-sm sm:text-base">
                <FaCheck className={`${iconColor} h-4 w-4 mt-0.5`} />
                <span>
                  <strong>What is it?</strong> {about}
                </span>
              </p>
            )}
            {why && (
              <p className="flex items-start gap-2 text-sm sm:text-base">
                <FaCheck className={`${iconColor} h-4 w-4 mt-0.5`} />
                <span>
                  <strong>Why is it done?</strong> {why}
                </span>
              </p>
            )}
            {(isTest || isScan) && typeof fasting !== 'undefined' && (
              <p className="flex items-start gap-2 text-sm sm:text-base">
                <FaCheck className={`${iconColor} h-4 w-4 mt-0.5`} />
                <span>
                  <strong>Preparation Required:</strong>{' '}
                  {fasting ? 'Fasting required' : 'No fasting required'}
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
