import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { CheckCircle, Package, Truck, Clock, MapPin, ShoppingCart, ClipboardList } from 'lucide-react';

const OrderConfirmationPage = () => {
  const { state } = useLocation();
  const [localOrder, setLocalOrder] = useState(state?.order);

  useEffect(() => {
    if (localOrder && localOrder.status === 'pending') {
      setTimeout(() => setLocalOrder(prev => ({ ...prev, status: 'confirmed', timeline: [...prev.timeline, { status: 'confirmed', timestamp: new Date().toISOString(), description: 'Order confirmed by system' }] })), 2000);
      setTimeout(() => setLocalOrder(prev => ({ ...prev, status: 'processing', timeline: [...prev.timeline, { status: 'processing', timestamp: new Date().toISOString(), description: 'Order is being packed' }] })), 5000);
    }
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />;
      case 'processing': return <Package className="h-5 w-5 sm:h-6 sm:w-6 text-[var(--primary-color)]" />;
      case 'dispatched':
      case 'in_transit': return <Truck className="h-5 w-5 sm:h-6 sm:w-6 text-purple-500" />;
      case 'delivered': return <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />;
      default: return <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-100';
      case 'processing': return 'text-[var(--primary-color)] bg-blue-100';
      case 'dispatched':
      case 'in_transit': return 'text-purple-600 bg-purple-100';
      case 'delivered': return 'text-green-700 bg-green-200';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  if (!localOrder) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Order not found</h2>
        <Link to="/patientdashboard/shopping" className="text-[var(--primary-color)] hover:text-[var(--accent-color)] text-sm sm:text-base">Return to Shop</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-6 sm:py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-10">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 animate-pulse">{getStatusIcon(localOrder.status)}</div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-sm sm:text-base text-gray-600">Thank you for your purchase. We'll notify you with shipping updates.</p>
        </div>
        <div className="bg-white shadow-sm rounded-xl p-4 sm:p-6 mb-6 sm:mb-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 pb-3 sm:pb-4 mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 sm:mb-0">Order #{localOrder.orderId}</h2>
            <span className={`px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold uppercase ${getStatusColor(localOrder.status)}`}>{localOrder.status.replace('_', ' ')}</span>
          </div>
          <div className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">Placed on {new Date(localOrder.createdAt).toLocaleDateString()}</div>
          <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
            <div className="flex-1 divide-y">
              {localOrder.items.map((item) => (
                <div key={item.product.id} className="flex items-center py-3 sm:py-4 gap-3 sm:gap-4">
                  <img src={item.product.image} alt={item.product.name} className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm sm:text-base font-medium text-gray-800 truncate">{item.product.name}</h4>
                    <p className="text-xs text-gray-500 truncate">{item.product.brand}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right text-sm sm:text-base font-medium text-gray-800">₹{(item.product.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>
            <div className="w-full md:w-64 border-t md:border-t-0 md:border-l pl-0 md:pl-4 sm:pl-6 pt-4 md:pt-0 space-y-2 text-sm text-gray-700">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">Summary</h3>
              <div className="flex justify-between"><span>Subtotal</span><span>₹{localOrder.subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>{localOrder.shipping === 0 ? 'Free' : `₹${localOrder.shipping.toFixed(2)}`}</span></div>
              <div className="flex justify-between"><span>Tax</span><span>₹{localOrder.tax.toFixed(2)}</span></div>
              <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between text-base font-bold text-gray-900"><span>Total</span><span className="text-[var(--primary-color)]">₹{localOrder.total.toFixed(2)}</span></div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-10">
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center"><MapPin className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />Shipping Address</h3>
            <div className="text-xs sm:text-sm text-gray-700 space-y-1">
              <p>{localOrder.shippingAddress.street}</p>
              <p>{localOrder.shippingAddress.city}, {localOrder.shippingAddress.state} {localOrder.shippingAddress.zipCode}</p>
              <p>{localOrder.shippingAddress.country}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center"><Truck className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />Tracking Info</h3>
            <div className="text-xs sm:text-sm text-gray-700 space-y-1">
              <p><span className="font-medium">Tracking:</span> {localOrder.trackingNumber}</p>
              <p><span className="font-medium">ETA:</span> {localOrder.estimatedDelivery}</p>
              <Link to={`/patientdashboard/track-order/${localOrder.orderId}`} state={{ order: localOrder }} className="text-[var(--accent-color)] hover:underline text-xs sm:text-sm">Track Order</Link>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6 sm:mb-10">
          <h3 className="text-lg font-semibold mb-4">Order Timeline</h3>
          <div className="space-y-4">
            {localOrder.timeline.map((event, index) => (
              <div key={index} className="flex items-start">
                <div className="flex-shrink-0 mr-3 sm:mr-4">{getStatusIcon(event.status)}</div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 capitalize">{event.status.replace('_', ' ')}</h4>
                  <p className="text-xs sm:text-sm text-gray-600">{new Date(event.timestamp).toLocaleString()}</p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <Link to="/patientdashboard/shopping" className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-[var(--primary-color)] text-white rounded-lg font-medium hover:bg-[var(--accent-color)] transition-colors text-sm sm:text-base"><ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />Continue Shopping</Link>
          <Link to="/patientdashboard/orders" className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm sm:text-base"><ClipboardList className="h-4 w-4 sm:h-5 sm:w-5" />View All Orders</Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
