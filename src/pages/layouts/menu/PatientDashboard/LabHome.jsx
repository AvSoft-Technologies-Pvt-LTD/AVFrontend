import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../../../context-api/cartSlice';
import { getAllTests, getAllScans, getAllhealthpackages } from '../../../../utils/masterService';
import { ShoppingCart, Search, Upload, FileText, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const useSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const performSearch = (data) =>
    !searchQuery.trim()
      ? data
      : data.filter((item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
  return { searchQuery, setSearchQuery, performSearch };
};

const LabHome = () => {
  const [activeTab, setActiveTab] = useState('tests');
  const [tests, setTests] = useState([]);
  const [scans, setScans] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedIds, setAddedIds] = useState(new Set());

  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);
  const navigate = useNavigate();
  const { searchQuery, setSearchQuery, performSearch } = useSearch();

  const cartRef = useRef(null);
  const btnRefs = useRef({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'tests') {
          const response = await getAllTests();
          setTests(performSearch(response.data));
        } else if (activeTab === 'scans') {
          const response = await getAllScans();
          setScans(performSearch(response.data));
        } else if (activeTab === 'packages') {
          const response = await getAllhealthpackages();
          setPackages(performSearch(response.data));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, searchQuery]);

  const animateFly = (sourceEl) => {
    if (!sourceEl || !cartRef.current) return;
    const src = sourceEl.getBoundingClientRect();
    const dst = cartRef.current.getBoundingClientRect();
    const clone = sourceEl.cloneNode(true);
    Object.assign(clone.style, {
      position: 'fixed',
      top: `${src.top}px`,
      left: `${src.left}px`,
      width: `${src.width}px`,
      height: `${src.height}px`,
      pointerEvents: 'none',
      zIndex: '9999',
      opacity: '1',
      boxShadow: '0 0 15px rgba(255, 165, 0, 0.7)',
      borderRadius: '8px',
      transition:
        'transform 1s cubic-bezier(0.4, 0, 0.2, 1), opacity 1s ease',
      background: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    });
    document.body.appendChild(clone);

    const startX = src.left + src.width / 2;
    const startY = src.top + src.height / 2;
    const endX = dst.left + dst.width / 2;
    const endY = dst.top + dst.height / 2;

    clone
      .animate(
        [
          {
            offset: 0,
            transform: 'translate(0,0) scale(1) rotate(0deg)',
            opacity: 1,
          },
          {
            offset: 0.5,
            transform: `translate(${(endX - startX) / 2}px, -150px) scale(0.6) rotate(180deg)`,
            opacity: 0.8,
          },
          {
            offset: 1,
            transform: `translate(${endX - startX}px, ${endY - startY}px) scale(0.2) rotate(360deg)`,
            opacity: 0,
          },
        ],
        {
          duration: 1000,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          fill: 'forwards',
        }
      )
      .onfinish = () => {
      clone.remove();
      cartRef.current?.classList.add('cart-bounce');
      setTimeout(
        () => cartRef.current?.classList.remove('cart-bounce'),
        400
      );
    };
  };

  const handleAdd = (item, key, pushToCart = false) => {
    if (!addedIds.has(key)) {
      dispatch(addToCart(item));
      animateFly(btnRefs.current[key]);
      setAddedIds((prev) => new Set(prev).add(key));
      if (pushToCart) navigate('/patientdashboard/cart');
    }
  };

  const renderButton = (item, prefix, pushToCart = false) => {
    const key = `${prefix}${item.id}`;
    const label = addedIds.has(key)
      ? 'Added'
      : pushToCart
      ? 'Book Now'
      : 'Add';
    const cls = pushToCart
      ? 'bg-[var(--primary-color)] text-white'
      : 'bg-gray-200 text-gray-800 hover:bg-gray-300';

    return (
      <button
        ref={(el) => (btnRefs.current[key] = el)}
        className={`${cls} px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors`}
        onClick={(e) => {
          e.stopPropagation(); // prevent card click navigation
          handleAdd(item, key, pushToCart);
        }}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <button
          onClick={() => navigate("/patientdashboard/app")}
          className="mb-4 flex items-center gap-1.5 md:gap-2 hover:text-[var(--accent-color)] transition-colors text-gray-600 text-xs md:text-sm"
        >
          <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
          <span className="font-medium">Back to Appointments</span>
        </button>

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-4">
          {/* Mobile: Search + Cart */}
          <div className="flex sm:hidden flex-row items-center w-full gap-2">
            <form className="flex-1 relative">
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                placeholder="Search for tests, scans..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button disabled className="absolute top-2.5 left-3">
                <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              </button>
            </form>
            <div
              ref={cartRef}
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

          {/* Desktop: Search + Cart */}
          <div className="hidden sm:flex sm:flex-row sm:items-center sm:justify-between w-full">
            <form className="w-full sm:w-auto sm:max-w-md relative">
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                placeholder="Search for tests, scans..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button disabled className="absolute top-2.5 left-3">
                <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              </button>
            </form>
            <div
              ref={cartRef}
              onClick={() => navigate('/patientdashboard/cart')}
              className="relative cursor-pointer p-2 sm:p-2.5 rounded-full border-2 border-[var(--primary-color)] bg-white shadow-sm hover:shadow-md transition group"
            >
              <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-[var(--primary-color)] group-hover:scale-110 transition-transform duration-200" />
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded-full border-2 border-white shadow-sm">
                  {cart.length}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Prescription Upload CTA */}
        <div className="bg-gradient-to-r from-[var(--primary-color)] to-[var(--accent-color)] rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-[var(--primary-color)]" />
              </div>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-1">
                Have a prescription? Upload it!
              </h3>
              <p className="text-sm sm:text-base text-blue-100">
                Get personalized test recommendations based on your doctor's
                prescription
              </p>
            </div>
            <button
              onClick={() => navigate('/patientdashboard/prescription-upload')}
              className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-white text-[var(--primary-color)] rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base shadow-md"
            >
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
              Upload Prescription
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto pb-1 mb-4 sm:mb-6">
          {['tests', 'scans', 'packages'].map((tab) => (
            <button
              key={tab}
              className={`py-2 px-3 sm:px-4 whitespace-nowrap border-b-2 text-sm sm:text-base font-medium ${
                activeTab === tab
                  ? 'border-[var(--primary-color)] text-[var(--primary-color)]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab[0].toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tests/Scans/Packages Section */}
        <div className="mb-8 sm:mb-12">
          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--primary-color)] mx-auto mb-4"></div>
              <p className="text-gray-600 text-sm sm:text-base">Loading...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(activeTab === 'tests' ? tests : activeTab === 'scans' ? scans : packages).map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/patientdashboard/${activeTab}/${item.id}`)}
                  className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                    {item.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 mb-1">
                    Code: {item.code}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">
                    {item.description}
                  </p>
                  <p className="text-[var(--primary-color)] font-bold text-sm sm:text-base">
                    ₹{item.price}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {renderButton(item, activeTab[0])}
                    {renderButton(item, `${activeTab[0]}b`, true)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .cart-bounce {
          animation: cart-bounce-glow 0.4s ease;
        }
        @keyframes cart-bounce-glow {
          0%,
          100% {
            transform: scale(1);
            box-shadow: none;
          }
          50% {
            transform: scale(1.2);
            box-shadow: 0 0 10px 3px rgba(255, 165, 0, 0.7);
          }
        }
      `}</style>
    </div>
  );
};

export default LabHome;