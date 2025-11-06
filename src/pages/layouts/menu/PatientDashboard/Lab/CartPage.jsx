// CartPage.jsx
import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { hydrateCart, removeFromCart, clearCart } from '../../../../../context-api/cartSlice';
import { getLabCart /*, updateLabCart */ } from '../../../../../utils/CrudService';
import { ShoppingCart, Trash2 } from 'lucide-react';

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // assuming your auth slice stores the logged-in patient's id
  const patientIdFromStore = useSelector((state) => state.auth?.patientId);

  // ⚠️ For local testing, fall back to 1 so it hits /lab/cart/1 like your example
  const patientId = patientIdFromStore || 1;

  const cart = useSelector((state) => state.cart);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const { data } = await getLabCart(patientId);
        console.log('Fetched cart data:', data);

        // shape from API:
        // { patientId, tests:[], scans:[], packages:[], totalAmount }
        const {
          tests = [],
          scans = [],
          packages = [],
        } = data || {};

        // Normalize items and tag a stable "kind" discriminator for UI keys/removal
        const normTests = tests.map((t) => ({
          ...t,
          kind: 'test',                   // NEW: stable type for UI logic
          quantity: t.quantity || 1,      // fallback
        }));

        const normScans = scans.map((s) => ({
          ...s,
          kind: 'scan',
          quantity: s.quantity || 1,
        }));

        const normPackages = packages.map((p) => ({
          ...p,
          kind: 'package',
          // packages may not have "code" - UI should handle optional
          quantity: p.quantity || 1,
        }));

        // Flatten for your Redux cart
        const allItems = [...normTests, ...normScans, ...normPackages];

        dispatch(hydrateCart(allItems));
      } catch (error) {
        console.error('Error fetching cart:', error?.response?.data || error.message);
      }
    };

    fetchCart();
  }, [dispatch, patientId]);

  // Use API's totalAmount when available; otherwise compute
  const totalFromApi = useSelector((state) => state.cartMeta?.totalAmount); // if you store it
  const computedSubtotal = useMemo(
    () => cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 1), 0),
    [cart]
  );
  const subtotal = totalFromApi ?? computedSubtotal;

  return (
    <div className="p-4 sm:p-6 bg-white mt-4 sm:mt-6 rounded-xl sm:rounded-2xl shadow-lg">
      {/* Header */}
      <div className="flex items-center mb-4 sm:mb-6">
        <ShoppingCart size={20} className="text-[var(--primary-color)] mr-2" />
        <h2 className="h4-heading text-lg sm:text-xl">Your Cart</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-8">
          <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-md">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h3 className="h4-heading text-base sm:text-lg">
                Cart Items ({cart.length})
              </h3>
              {cart.length > 0 && (
                <button
                  onClick={() => {
                    // If you want to sync "clear" to backend uncomment this:
                    // updateLabCart(patientId, { tests: [], scans: [], packages: [] })
                    //   .catch(() => {})
                    //   .finally(() => dispatch(clearCart()));
                    dispatch(clearCart());
                  }}
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
                <div key={`${item.id}-${item.kind || item.type}`} className="border-t pt-4 sm:pt-6 mt-4 sm:mt-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                    <div className="mb-3 sm:mb-0">
                      <h4 className="paragraph font-bold text-sm sm:text-base">
                        {item.title}
                      </h4>

                      {/* "code" may be missing for packages, so render conditionally */}
                      {item.code && (
                        <p className="paragraph text-xs sm:text-sm mt-1">
                          Code: <span className="bg-gray-100 px-2 py-0.5 rounded">{item.code}</span>
                        </p>
                      )}

                      {/* API has fasting boolean for tests/scans */}
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
                            // To sync removal with backend, you’d:
                            // 1) compute new arrays for tests/scans/packages
                            // 2) call updateLabCart(patientId, payload)
                            // 3) then dispatch(removeFromCart)
                            dispatch(removeFromCart({ id: item.id, kind: item.kind || 'test' }));
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

        {/* Summary */}
        <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-md space-y-4 sm:space-y-6">
          <h3 className="h4-heading text-base sm:text-lg">Order Summary</h3>

          {cart.map((item) => (
            <div key={`${item.id}-${item.kind || item.type}`} className="flex justify-between">
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
              className="btn btn-primary w-full text-xs sm:text-sm py-2 sm:py-3"
              onClick={() =>
                navigate(`/patientdashboard/available-labs`, { state: { cart } })
              }
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
