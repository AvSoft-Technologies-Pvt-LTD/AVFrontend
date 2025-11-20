import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { hydrateCart, removeFromCart, clearCart } from '../../../../../context-api/cartSlice';
import { initializeAuth } from '../../../../../context-api/authSlice';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { createLabCart } from '../../../../../utils/CrudService';

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const patientIdFromStore = useSelector(
    (state) => state.auth?.user?.patientId ?? state.auth?.patientId ?? null
  );
  const patientId = patientIdFromStore == null ? null : Number(patientIdFromStore);
  const cart = useSelector((state) => state.cart);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    dispatch(initializeAuth());
    try {
      const stored = localStorage.getItem('labCart');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          dispatch(hydrateCart(parsed));
        }
      }
    } catch (e) {
      console.error('Failed to read labCart from localStorage:', e);
    }
  }, [dispatch]);

  useEffect(() => {
    try {
      localStorage.setItem('labCart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to write labCart to localStorage:', e);
    }
  }, [cart]);

  const inferKind = (item) => {
    if (item?.kind) return item.kind;
    if (item?.type) return item.type;
    if (item?.packageId || String(item?.title || '').toLowerCase().includes('package')) return 'package';
    if (item?.scanId) return 'scan';
    if (item?.testId) return 'test';
    if (item?.code && String(item.code).toUpperCase().startsWith('SCN')) return 'scan';
    return 'test';
  };

  const computedSubtotal = useMemo(
    () => cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 1), 0),
    [cart]
  );
  const subtotal = computedSubtotal;

  // ✅ NEW: Handle "Proceed to Book" - POST cart to backend
  const handleProceedToBook = async () => {
    if (!patientId) {
      setError('Please login to proceed');
      return;
    }

    if (cart.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Prepare cart data for backend
      const testIds = cart
        .filter((item) => inferKind(item) === 'test')
        .map((item) => item.testId || item.id);

      const scanIds = cart
        .filter((item) => inferKind(item) === 'scan')
        .map((item) => item.scanId || item.id);

      const packageIds = cart
        .filter((item) => inferKind(item) === 'package')
        .map((item) => item.packageId || item.id);

      const cartPayload = {
        patientId: patientId,
        testIds: testIds,
        scanIds: scanIds,
        packageIds: packageIds,
      };

      console.log('Sending cart to backend:', cartPayload);

      // POST cart to backend
      const { data } = await createLabCart(cartPayload);
      console.log('Cart created successfully:', data);

      // Backend should return cart ID
      const backendCartId = data?.id || data?.cartId;

      if (!backendCartId) {
        throw new Error('Backend did not return cart ID');
      }

      // Navigate to available labs with cart ID
      navigate(`/patientdashboard/available-labs`, {
        state: {
          cart: cart,
          backendCartId: backendCartId,
        },
      });
    } catch (err) {
      console.error('Error creating cart:', err?.response?.data || err.message);
      setError(err?.response?.data?.message || 'Failed to create cart. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-white mt-4 sm:mt-6 rounded-xl sm:rounded-2xl shadow-lg">
      <div className="flex items-center mb-4 sm:mb-6">
        <ShoppingCart size={20} className="text-[var(--primary-color)] mr-2" />
        <h2 className="h4-heading text-lg sm:text-xl">Your Cart</h2>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
        <div className="lg:col-span-2 space-y-4 sm:space-y-8">
          <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-md">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h3 className="h4-heading text-base sm:text-lg">
                Cart Items ({cart.length})
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

            {cart.length === 0 ? (
              <p className="paragraph text-center py-6 sm:py-10">
                Your cart is empty. Start adding tests!
              </p>
            ) : (
              cart.map((item) => (
                <div key={`${item.id}-${inferKind(item)}`} className="border-t pt-4 sm:pt-6 mt-4 sm:mt-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                    <div className="mb-3 sm:mb-0">
                      <h4 className="paragraph font-bold text-sm sm:text-base">
                        {item.title}
                      </h4>
                      {item.code && (
                        <p className="paragraph text-xs sm:text-sm mt-1">
                          Code: <span className="bg-gray-100 px-2 py-0.5 rounded">{item.code}</span>
                        </p>
                      )}
                      {item.fasting && (
                        <span className="inline-block mt-1 sm:mt-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                          Fasting Required
                        </span>
                      )}
                      <p className="paragraph text-xs sm:text-sm mt-1 sm:mt-2">
                        {item.description}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="h4-heading text-[var(--primary-color)] text-sm sm:text-base">
                        ₹{(Number(item.price) || 0) * (item.quantity || 1)}
                      </p>
                      {item.originalPrice && (
                        <p className="paragraph line-through text-gray-400 text-xs sm:text-sm">
                          ₹{item.originalPrice}
                        </p>
                      )}

                      <div className="flex items-center justify-end mt-2 sm:mt-3">
                        <button
                          onClick={() => {
                            const targetKind = inferKind(item);
                            dispatch(removeFromCart({ id: item.id, type: targetKind }));
                          }}
                          className="delete-btn text-xs sm:text-sm"
                        >
                          <Trash2 size={16} className="inline mr-1" />
                          Remove
                        </button>
                        {item.quantity > 1 && (
                          <span className="ml-2 text-xs sm:text-sm">Qty: {item.quantity}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-md space-y-4 sm:space-y-6">
          <h3 className="h4-heading text-base sm:text-lg">Order Summary</h3>

          {cart.map((item) => (
            <div key={`${item.id}-${inferKind(item)}`} className="flex justify-between">
              <span className="paragraph text-xs sm:text-sm">
                {item.title} {item.quantity > 1 && `x${item.quantity}`}
              </span>
              <span className="paragraph text-xs sm:text-sm">
                ₹{(Number(item.price) || 0) * (item.quantity || 1)}
              </span>
            </div>
          ))}

          <div className="border-t pt-2 sm:pt-3 flex justify-between">
            <span className="paragraph font-bold text-sm sm:text-base">Total</span>
            <span className="paragraph font-bold text-sm sm:text-base">₹{subtotal}</span>
          </div>

          {cart.length > 0 && (
            <button
              className="btn btn-primary w-full text-xs sm:text-sm py-2 sm:py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleProceedToBook}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Cart...' : 'Proceed to Book'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartPage;