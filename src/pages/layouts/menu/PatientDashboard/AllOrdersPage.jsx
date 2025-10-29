import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import {
  Clock,
  CheckCircle,
  Package,
  Truck,
  MapPin,
  ExternalLink,
  Search, ChevronLeft,
  ShoppingCart
} from 'lucide-react';


const statusStyles = {
  pending: { text: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: <Clock className="w-4 h-4 sm:w-5 sm:h-5" /> },
  confirmed: { text: 'Confirmed', color: 'bg-green-100 text-green-700', icon: <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" /> },
  processing: { text: 'Processing', color: 'bg-blue-100 text-blue-700', icon: <Package className="w-4 h-4 sm:w-5 sm:h-5" /> },
  dispatched: { text: 'Dispatched', color: 'bg-purple-100 text-purple-700', icon: <Truck className="w-4 h-4 sm:w-5 sm:h-5" /> },
  delivered: { text: 'Delivered', color: 'bg-green-200 text-green-800', icon: <MapPin className="w-4 h-4 sm:w-5 sm:h-5" /> },
};

const AllOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const userId = useSelector(state => state.auth?.user?.id);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get('https://684ac997165d05c5d35a5118.mockapi.io/orders');
        const userOrders = res.data.filter(order => order.userId === userId);
        setOrders(userOrders);
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchOrders();
  }, [userId]);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Search query:', searchQuery);
    // Implement search functionality here
  };

  const filteredOrders = orders.filter(order =>
    order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    statusStyles[order.status]?.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--primary-color)] mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header with Search */}
        <div className="mb-4 sm:mb-6 md:mb-8 relative">
          {/* Flex container for all elements */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
            {/* Back to Shopping Button (Left on all screens) */}
            <Link
              to="/patientdashboard/shopping"
              className="inline-flex items-center text-sm sm:text-base text-gray-700 hover:text-[var(--primary-color)] font-medium"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
              <span className="hidden sm:inline">Back to Shopping</span>
            </Link>

            {/* Page Title (Centered on all screens) */}
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 text-center sm:absolute sm:left-1/2 sm:transform sm:-translate-x-1/2 order-first sm:order-none">
              My Orders
            </h1>

            {/* Search Bar (Full width on mobile, right-aligned on larger screens) */}
            <form onSubmit={handleSearch} className="w-full sm:w-64">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </form>
          </div>
        </div>
        {/* Empty State - Responsive */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <ShoppingCart className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              {searchQuery ? 'No orders match your search' : 'No orders found'}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              {searchQuery ? 'Try a different search term' : 'Start shopping to see your orders here'}
            </p>
            <Link
              to="/patientdashboard/shopping"
              className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-[var(--primary-color)] text-white rounded-lg font-medium hover:bg-[var(--primary-dark)] transition-colors text-sm sm:text-base"
            >
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Go to Shop
            </Link>
          </div>
        ) : (
          // Orders List - Responsive Grid
          <div className="space-y-4 sm:space-y-6">
            {filteredOrders.map(order => {
              const status = statusStyles[order.status] || statusStyles['pending'];
              return (
                <div
                  key={order.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
                >
                  {/* Order Header - Responsive */}
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4">
                      <div className="mb-3 sm:mb-0">
                        <h2 className="text-base sm:text-lg font-semibold text-gray-800">
                          Order #{order.orderId}
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                          Placed on {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${status.color}`}>
                        {status.icon}
                        <span className="ml-1.5 sm:ml-2">{status.text}</span>
                      </span>
                    </div>

                    {/* Order Items Preview - Responsive Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 mb-3 sm:mb-4">
                      {order.items.slice(0, 4).map(item => (
                        <div key={item.product.id} className="flex flex-col items-center">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover mb-1"
                          />
                          <p className="text-xs text-gray-600 truncate w-full text-center">Qty: {item.quantity}</p>
                        </div>
                      ))}
                      {order.items.length > 4 && (
                        <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg p-2">
                          <span className="text-xs text-gray-500">+{order.items.length - 4} more</span>
                        </div>
                      )}
                    </div>

                    {/* Order Footer - Responsive */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-3 sm:pt-4 border-t border-gray-100">
                      <div className="mb-3 sm:mb-0">
                        <p className="text-sm sm:text-base font-semibold text-gray-700">
                          Total: ₹{order.total.toFixed(2)}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </p>
                      </div>

                      <Link
                        to={`/patientdashboard/order-confirmation/${order.orderId}`}
                        state={{ order }}
                        className="inline-flex items-center text-xs sm:text-sm text-[var(--primary-color)] font-medium hover:text-[var(--primary-dark)]"
                      >
                        View Details
                        <ExternalLink className="ml-1 w-3 h-3 sm:w-4 sm:h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllOrdersPage;
