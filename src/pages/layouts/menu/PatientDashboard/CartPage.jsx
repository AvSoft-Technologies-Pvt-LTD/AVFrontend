import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addToCart, removeFromCart, clearCart } from '../../../../context-api/cartSlice';
import { ShoppingCart, Trash2, ArrowLeft, PlusCircle } from 'lucide-react';

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cart = useSelector((state) => state.cart);
  const subtotal = cart.reduce((sum, test) => sum + test.price, 0);

  return (
    <div className="p-4 sm:p-6 bg-white mt-4 sm:mt-6 rounded-xl sm:rounded-2xl shadow-lg">
      {/* Continue Shopping Button */}
      <button
        onClick={() => navigate('/patientdashboard/lab-tests')}
        className="flex items-center text-sm text-[var(--primary-color)] mb-4 sm:mb-6 hover:underline"
      >
        <ArrowLeft size={16} className="mr-2" />
        Continue Shopping
      </button>

      {/* Cart Header */}
      <div className="flex items-center mb-4 sm:mb-6">
        <ShoppingCart size={20} className="text-[var(--primary-color)] mr-2" />
        <h2 className="h4-heading text-lg sm:text-xl">Your Cart</h2>
      </div>

      {/* Cart Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
        {/* Cart Items Section */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-8">
          <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-md">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h3 className="h4-heading text-base sm:text-lg">
                Cart Tests ({cart.length})
              </h3>
              {cart.length > 0 && (
                <button
                  onClick={() => dispatch(clearCart())}
                  className="delete-btn text-xs sm:text-sm"
                >
                  <Trash2 size={16} className="inline mr-1" />
                  Clear All
                </button>
              )}
            </div>

            {/* Empty Cart Message */}
            {cart.length === 0 ? (
              <p className="paragraph text-center py-6 sm:py-10">
                Your cart is empty. Start adding tests!
              </p>
            ) : (
              // Cart Items List
              cart.map((test) => (
                <div key={test.id} className="border-t pt-4 sm:pt-6 mt-4 sm:mt-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                    <div className="mb-3 sm:mb-0">
                      <h4 className="paragraph font-bold text-sm sm:text-base">
                        {test.title}
                      </h4>
                      <p className="paragraph text-xs sm:text-sm mt-1">
                        Code: <span className="bg-gray-100 px-2 py-0.5 rounded">{test.code}</span>
                      </p>
                      {test.fastRequired && (
                        <span className="inline-block mt-1 sm:mt-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                          Fasting Required
                        </span>
                      )}
                      <p className="paragraph text-xs sm:text-sm mt-1 sm:mt-2">
                        {test.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="h4-heading text-[var(--primary-color)] text-sm sm:text-base">
                        ₹{test.price}
                      </p>
                      {test.originalPrice && (
                        <p className="paragraph line-through text-gray-400 text-xs sm:text-sm">
                          ₹{test.originalPrice}
                        </p>
                      )}
                      <button
                        onClick={() => dispatch(removeFromCart(test.id))}
                        className="delete-btn mt-2 sm:mt-3 text-xs sm:text-sm"
                      >
                        <Trash2 size={16} className="inline mr-1" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Order Summary Section */}
        <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-md space-y-4 sm:space-y-6">
          <h3 className="h4-heading text-base sm:text-lg">Order Summary</h3>

          {/* Order Items List */}
          {cart.map((test) => (
            <div key={test.id} className="flex justify-between">
              <span className="paragraph text-xs sm:text-sm">{test.title}</span>
              <span className="paragraph text-xs sm:text-sm">₹{test.price}</span>
            </div>
          ))}

          {/* Total and Proceed Button */}
          <div className="border-t pt-2 sm:pt-3 flex justify-between">
            <span className="paragraph font-bold text-sm sm:text-base">Total</span>
            <span className="paragraph font-bold text-sm sm:text-base">₹{subtotal}</span>
          </div>
          {cart.length > 0 && (
            <button
              className="btn btn-primary w-full text-xs sm:text-sm py-2 sm:py-3"
              onClick={() => navigate(`/patientdashboard/available-labs`, {
                state: { cart }, // Pass the entire cart
              })}
            >
              Proceed to Book
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartPage;
