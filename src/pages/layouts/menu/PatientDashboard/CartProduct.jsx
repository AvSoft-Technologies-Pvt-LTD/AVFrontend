import React from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingCart, ArrowLeft } from 'lucide-react';
import { useCart } from '../../../../context-api/productcartSlice';

const CartProduct = () => {
  const { items = [], total = 0, updateQuantity, removeItem, itemCount = 0 } = useCart();

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity === 0) {
      removeItem(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const shipping = total > 100 ? 0 : 9.99;
  const tax = total * 0.08;
  const finalTotal = total + shipping + tax;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <ShoppingCart className="h-16 w-16 sm:h-24 sm:w-24 text-gray-300 mx-auto mb-4 sm:mb-6" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6">Start shopping to add items to your cart</p>
          <Link
            to="/patientdashboard/shopping"
            className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-[var(--primary-color)] text-white font-medium sm:font-semibold rounded-lg hover:bg-[var(--primary-dark)] transition-colors text-sm sm:text-base"
          >
            <ArrowLeft className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Link
            to="/patientdashboard/shopping"
            className="inline-flex items-center text-[var(--primary-color)] hover:text-[var(--primary-dark)] mb-3 sm:mb-4 text-sm sm:text-base"
          >
            <ArrowLeft className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            Continue Shopping
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">{itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart</p>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-x-8">
          {/* Cart Items */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Cart Items</h2>
              </div>

              <div className="divide-y divide-gray-200">
                {items.map((item) => (
                  <div key={item.product.id} className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row">
                      {/* Product Image */}
                      <div className="flex-shrink-0 w-full sm:w-24 h-24 bg-gray-100 rounded-lg overflow-hidden mb-4 sm:mb-0 sm:mr-4">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Details and Quantity */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                          <div className="mb-3 sm:mb-0">
                            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1">
                              <Link
                                to={`/product/${item.product.id}`}
                                className="hover:text-[var(--primary-color)]"
                              >
                                {item.product.name}
                              </Link>
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-500">{item.product.brand}</p>
                            <p className="text-sm sm:text-base font-medium text-gray-900 mt-1">
                              ₹{item.product.price.toFixed(2)}
                            </p>
                          </div>

                          <button
                            onClick={() => removeItem(item.product.id)}
                            className="text-red-500 hover:text-red-700 p-1.5 sm:p-2 mb-3 sm:mb-0"
                          >
                            <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                          </button>
                        </div>

                        {/* Quantity Controls and Item Total */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-3">
                          <div className="flex items-center mb-3 sm:mb-0">
                            <button
                              onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                              className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                            </button>
                            <span className="mx-3 sm:mx-4 text-sm sm:text-base font-medium">{item.quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                              className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                            >
                              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                            </button>
                          </div>

                          <div className="text-right">
                            <p className="text-sm sm:text-base font-medium text-gray-900">
                              ₹{(item.product.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-5 mt-6 sm:mt-8 lg:mt-0">
            <div className="bg-white rounded-lg shadow-sm sticky top-20">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Order Summary</h2>
              </div>

              <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm sm:text-base text-gray-600">Subtotal</span>
                  <span className="text-sm sm:text-base font-medium">₹{total.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm sm:text-base text-gray-600">Shipping</span>
                  <span className="text-sm sm:text-base font-medium">
                    {shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm sm:text-base text-gray-600">Tax</span>
                  <span className="text-sm sm:text-base font-medium">₹{tax.toFixed(2)}</span>
                </div>

                {shipping === 0 ? (
                  <div className="bg-green-50 p-2 sm:p-3 rounded-lg mt-2">
                    <p className="text-xs sm:text-sm text-green-800">
                      You qualify for free shipping!
                    </p>
                  </div>
                ) : (
                  <div className="bg-blue-50 p-2 sm:p-3 rounded-lg mt-2">
                    <p className="text-xs sm:text-sm text-blue-800">
                      Add ₹{(100 - total).toFixed(2)} more for free shipping
                    </p>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-3 sm:pt-4 mt-2 sm:mt-3">
                  <div className="flex justify-between">
                    <span className="text-base sm:text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-base sm:text-lg font-bold text-[var(--primary-color)]">
                      ₹{finalTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                <Link
                  to="/patientdashboard/checkout"
                  className="w-full bg-[var(--primary-color)] text-white py-2 sm:py-3 px-4 rounded-lg font-medium sm:font-semibold hover:bg-[var(--primary-dark)] transition-colors flex items-center justify-center mt-4 text-sm sm:text-base"
                >
                  Proceed to Checkout
                </Link>

                <div className="text-center mt-3">
                  <div className="flex items-center justify-center space-x-1.5 text-xs sm:text-sm text-gray-500">
                    <span>🔒</span>
                    <span>Secure checkout</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartProduct;
