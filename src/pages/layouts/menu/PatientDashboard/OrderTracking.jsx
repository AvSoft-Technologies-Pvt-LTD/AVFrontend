import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { Package, Truck, MapPin, CheckCircle, Clock, ArrowLeft } from 'lucide-react';

const API_BASE = 'https://684ac997165d05c5d35a5118.mockapi.io/orders';

const OrderTrackingPage = () => {
  const { orderId } = useParams();
  const { state } = useLocation();
  const [localOrder, setLocalOrder] = useState(state?.order);
  const [autoUpdate, setAutoUpdate] = useState(true);

  const fetchOrder = async () => {
    try { const res = await axios.get(`${API_BASE}/${orderId}`); setLocalOrder(res.data); } catch (err) { console.error('Error fetching order:', err); }
  };

  const updateOrderStatus = async (newStatus) => {
    const updatedTimeline = [...localOrder.timeline, { status: newStatus, timestamp: new Date().toISOString(), description: `Order ${newStatus.replace('_', ' ')} by system` }];
    const updatedOrder = { ...localOrder, status: newStatus, timeline: updatedTimeline, updatedAt: new Date().toISOString() };
    try { await axios.put(`${API_BASE}/${orderId}`, updatedOrder); setLocalOrder(updatedOrder); } catch (err) { console.error('Error updating status:', err); }
  };

  useEffect(() => { if (!localOrder) fetchOrder(); }, [orderId]);
  useEffect(() => {
    if (!localOrder || !autoUpdate) return;
    const statusProgression = ['pending', 'confirmed', 'processing', 'dispatched', 'in_transit', 'delivered'];
    const currentIndex = statusProgression.indexOf(localOrder.status);
    if (currentIndex < statusProgression.length - 1) {
      const timer = setTimeout(() => updateOrderStatus(statusProgression[currentIndex + 1]), 10000);
      return () => clearTimeout(timer);
    } else setAutoUpdate(false);
  }, [localOrder, autoUpdate]);

  if (!localOrder) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Order not found</h2>
        <Link to="/patientdashboard/orders" className="text-[var(--primary-color)] hover:text-[var(--accent-color)] text-sm sm:text-base">View All Orders</Link>
      </div>
    </div>
  );

  const trackingSteps = [
    { status: 'confirmed', title: 'Order Confirmed', description: 'Your order has been confirmed and payment processed', icon: CheckCircle },
    { status: 'processing', title: 'Preparing Order', description: 'Your items are being prepared for shipment', icon: Package },
    { status: 'dispatched', title: 'Order Dispatched', description: 'Your order has left our facility', icon: Truck },
    { status: 'in_transit', title: 'In Transit', description: 'Your order is on the way to you', icon: Truck },
    { status: 'delivered', title: 'Delivered', description: 'Your order has been delivered successfully', icon: MapPin },
  ];

  const getStepStatus = (stepStatus) => ({ isCompleted: localOrder.timeline.some(t => t.status === stepStatus), isCurrent: localOrder.status === stepStatus });
  const getStatusColor = (stepStatus) => { const { isCompleted, isCurrent } = getStepStatus(stepStatus); return isCompleted ? 'text-green-600 bg-green-100 border-green-200' : isCurrent ? 'text-[var(--primary-color)] bg-blue-100 border-blue-200' : 'text-gray-400 bg-gray-100 border-gray-200'; };
  const getIconColor = (stepStatus) => { const { isCompleted, isCurrent } = getStepStatus(stepStatus); return isCompleted ? 'text-green-600' : isCurrent ? 'text-[var(--primary-color)]' : 'text-gray-400'; };
  const currentStepIndex = trackingSteps.findIndex(step => step.status === localOrder.status);
  const progressPercentage = currentStepIndex >= 0 ? ((currentStepIndex + 1) / trackingSteps.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="mb-6 sm:mb-8">
          <Link to="/patientdashboard/orders" className="inline-flex items-center text-[var(--primary-color)] hover:text-[var(--accent-color)] mb-4 text-sm sm:text-base"><ArrowLeft className="mr-1.5 h-4 w-4 sm:h-5 sm:w-5" />Back to Orders</Link>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Track Your Order</h1>
          <p className="text-sm sm:text-base text-gray-600">Order #{localOrder.orderId}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4">
            <div className="mb-4 sm:mb-0">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">Order Details</h2>
              <p className="text-xs sm:text-sm text-gray-600">Placed on {new Date(localOrder.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <p className="text-lg sm:text-xl font-bold text-[var(--primary-color)]">₹{localOrder.total.toFixed(2)}</p>
              <p className="text-xs sm:text-sm text-gray-600">{localOrder.items.length} item{localOrder.items.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Shipping Address</h3>
              <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                <p>{localOrder.shippingAddress.street}</p>
                <p>{localOrder.shippingAddress.city}, {localOrder.shippingAddress.state} {localOrder.shippingAddress.zipCode}</p>
                <p>{localOrder.shippingAddress.country}</p>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Tracking Info</h3>
              <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                <p><span className="font-medium">Tracking #:</span> {localOrder.trackingNumber}</p>
                <p><span className="font-medium">Est. Delivery:</span> {localOrder.estimatedDelivery}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Tracking Progress</h2>
          <div className="sm:hidden mb-6">
            <div className="relative pt-1">
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                <div style={{ width: `${progressPercentage}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500 transition-all duration-500"></div>
              </div>
            </div>
          </div>
          <div className="hidden sm:block relative mb-8">
            <div className="absolute top-8 left-4 right-4 h-0.5 bg-gray-200">
              <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${progressPercentage}%` }} />
            </div>
            <div className="grid grid-cols-5 gap-4">
              {trackingSteps.map((step, index) => { const { isCompleted, isCurrent } = getStepStatus(step.status); const Icon = step.icon; return (
                <div key={step.status} className="relative z-10">
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 flex items-center justify-center mx-auto mb-2 ${getStatusColor(step.status)}`}><Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${getIconColor(step.status)}`} /></div>
                  <div className="text-center"><h3 className={`text-xs sm:text-sm font-medium mb-1 ${isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-400'}`}>{step.title}</h3></div>
                </div>
              ); })}
            </div>
          </div>
          <div className="sm:hidden space-y-6">
            {trackingSteps.map((step) => { const { isCompleted, isCurrent } = getStepStatus(step.status); const Icon = step.icon; return (
              <div key={step.status} className="flex items-start">
                <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center mr-3 ${getStatusColor(step.status)}`}><Icon className={`h-5 w-5 ${getIconColor(step.status)}`} /></div>
                <div>
                  <h3 className={`text-sm font-medium mb-1 ${isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-400'}`}>{step.title}</h3>
                  <p className={`text-xs ${isCompleted || isCurrent ? 'text-gray-600' : 'text-gray-400'}`}>{step.description}</p>
                  {isCompleted && localOrder.timeline.find(t => t.status === step.status) && <p className="text-xs text-green-600 mt-1">{new Date(localOrder.timeline.find(t => t.status === step.status).timestamp).toLocaleString()}</p>}
                </div>
              </div>
            ); })}
          </div>
          <div className="hidden sm:grid sm:grid-cols-5 sm:gap-4">
            {trackingSteps.map((step) => { const { isCompleted, isCurrent } = getStepStatus(step.status); return (
              <div key={step.status} className="text-center">
                <p className={`text-xs ${isCompleted || isCurrent ? 'text-gray-600' : 'text-gray-400'} mt-2`}>{step.description}</p>
                {isCompleted && localOrder.timeline.find(t => t.status === step.status) && <p className="text-xs text-green-600 mt-1">{new Date(localOrder.timeline.find(t => t.status === step.status).timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>}
              </div>
            ); })}
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex items-start space-x-3">
            <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-[var(--primary-color)] mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1 text-sm sm:text-base">Current Status</h3>
              <p className="text-blue-800 capitalize text-sm sm:text-base">{localOrder.status.replace('_', ' ')}</p>
              <p className="text-xs sm:text-sm text-[var(--accent-color)] mt-1">{localOrder.timeline[localOrder.timeline.length - 1]?.description}</p>
              <p className="text-xs sm:text-sm text-[var(--primary-color)] mt-1">Last updated: {new Date(localOrder.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Items in this order</h3>
          <div className="space-y-4">
            {localOrder.items.map((item) => (
              <div key={item.product.id} className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 pb-4 border-b last:border-b-0">
                <img src={item.product.image} alt={item.product.name} className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg mx-auto sm:mx-0" />
                <div className="flex-1 min-w-0 text-center sm:text-left">
                  <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">{item.product.name}</h4>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">{item.product.brand}</p>
                  <p className="text-xs sm:text-sm text-gray-600">Quantity: {item.quantity}</p>
                </div>
                <p className="font-semibold text-gray-900 text-sm sm:text-base text-center sm:text-right">₹{(item.product.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
        {autoUpdate && localOrder.status !== 'delivered' && <div className="mt-6 p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center"><p className="text-xs sm:text-sm text-yellow-800">🔄 This page will automatically update as your order progresses.</p></div>}
      </div>
    </div>
  );
};

export default OrderTrackingPage;
