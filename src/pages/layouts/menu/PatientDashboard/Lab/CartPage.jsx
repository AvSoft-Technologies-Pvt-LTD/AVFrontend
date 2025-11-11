// CartPage.jsx
import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { hydrateCart, removeFromCart, clearCart } from '../../../../../context-api/cartSlice';
import { getLabCart, updateLabCart } from '../../../../../utils/CrudService';
import { initializeAuth } from '../../../../../context-api/authSlice';
import { ShoppingCart, Trash2 } from 'lucide-react';

const CartPage = () => {
const dispatch = useDispatch();
useEffect(() => { dispatch(initializeAuth()); }, [dispatch]);
  const navigate = useNavigate();

const patientIdFromStore = useSelector(
  (state) => state.auth?.user?.patientId ?? state.auth?.patientId ?? null
);
const patientId = patientIdFromStore == null ? null : Number(patientIdFromStore);

  const cart = useSelector((state) => state.cart);

  // Robustly infer item kind when it's missing
  const inferKind = (item) => {
    if (item?.kind) return item.kind;
    if (item?.packageId || String(item?.title || '').toLowerCase().includes('package')) return 'package';
    if (item?.scanId) return 'scan';
    if (item?.testId) return 'test';
    // Heuristic fallbacks
    if (item?.code && String(item.code).toUpperCase().startsWith('SCN')) return 'scan';
    return 'test';
  };

  // Normalize API cart response into flat array for Redux
  const normalizeApiCart = (data) => {
    const { tests = [], scans = [], packages = [] } = data || {};
    const normTests = tests.map((t) => ({
      ...t,
      id: t.id ?? t.testId,
      kind: 'test',
      title: t.title ?? t.name ?? t.testName ?? t.code ?? 'Test',
      price: Number(t.price) || 0,
      quantity: t.quantity || 1,
    }));
    const normScans = scans.map((s) => ({
      ...s,
      id: s.id ?? s.scanId,
      kind: 'scan',
      title: s.title ?? s.name ?? s.scanName ?? s.code ?? 'Scan',
      price: Number(s.price) || 0,
      quantity: s.quantity || 1,
    }));
    const normPackages = packages.map((p) => ({
      ...p,
      id: p.id ?? p.packageId,
      kind: 'package',
      title: p.title ?? p.name ?? p.packageName ?? 'Package',
      price: Number(p.price) || 0,
      quantity: p.quantity || 1,
    }));
    return [...normTests, ...normScans, ...normPackages];
  };

  // Build backend payload from a cart array
  const buildPayloadFromCart = (arr) => {
    const tests = [];
    const scans = [];
    const packages = [];
    (arr || []).forEach((item) => {
      const qty = item.quantity || 1;
      const k = inferKind(item) || item.type;
      if (k === 'test') {
        tests.push({ testId: item.testId ?? item.id, quantity: qty });
      } else if (k === 'scan') {
        scans.push({ scanId: item.scanId ?? item.id, quantity: qty });
      } else if (k === 'package') {
        packages.push({ packageId: item.packageId ?? item.id, quantity: qty });
      }
    });
    return { tests, scans, packages };
  };

  useEffect(() => {
    const fetchCart = async () => {
      try {
        if (!(Number.isInteger(patientId) && patientId > 0)) return;
        const { data } = await getLabCart(patientId);
        console.log('Fetched cart data:', data);
        dispatch(hydrateCart(normalizeApiCart(data)));
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
                  onClick={async () => {
                    try {
                      if (Number.isInteger(patientId) && patientId > 0) {
                        await updateLabCart(patientId, { tests: [], scans: [], packages: [] });
                      }
                    } catch (e) {
                      // non-blocking: still clear locally
                      console.error('Clear-all sync failed:', e?.response?.data || e.message);
                    } finally {
                      dispatch(clearCart());
                    }
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
                          onClick={async () => {
                            const targetKind = inferKind(item);
                            try {
                              const newCart = cart.filter((c) => !(c.id === item.id && inferKind(c) === targetKind));
                              if (Number.isInteger(patientId) && patientId > 0) {
                                const payload = buildPayloadFromCart(newCart);
                                await updateLabCart(patientId, payload);
                                // Rehydrate from backend to ensure UI reflects server state
                                const { data } = await getLabCart(patientId);
                                dispatch(hydrateCart(normalizeApiCart(data)));
                              }
                            } catch (e) {
                              console.error('Item delete sync failed:', e?.response?.data || e.message);
                              // still proceed to update UI
                              dispatch(removeFromCart({ id: item.id, kind: targetKind }));
                            }
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
