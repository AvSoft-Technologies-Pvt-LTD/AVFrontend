import { createSlice } from '@reduxjs/toolkit';
import { useSelector, useDispatch } from 'react-redux';

const initialState = {
  items: [],
  total: 0,
  itemCount: 0,
};

const calculateTotal = (items) =>
  items.reduce((total, item) => total + item.product.price * item.quantity, 0);

const calculateItemCount = (items) =>
  items.reduce((count, item) => count + item.quantity, 0);

const productCartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action) => {
      const existing = state.items.find(
        (item) => item.product.id === action.payload.id
      );

      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ product: action.payload, quantity: 1 });
      }

      state.total = calculateTotal(state.items);
      state.itemCount = calculateItemCount(state.items);
    },

    removeItem: (state, action) => {
      state.items = state.items.filter(
        (item) => item.product.id !== action.payload
      );
      state.total = calculateTotal(state.items);
      state.itemCount = calculateItemCount(state.items);
    },

    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      state.items = state.items
        .map((item) =>
          item.product.id === id ? { ...item, quantity } : item
        )
        .filter((item) => item.quantity > 0);

      state.total = calculateTotal(state.items);
      state.itemCount = calculateItemCount(state.items);
    },

    clearCart: (state) => {
      state.items = [];
      state.total = 0;
      state.itemCount = 0;
    },
  },
});

export const { addItem, removeItem, updateQuantity, clearCart } =
  productCartSlice.actions;

export default productCartSlice.reducer;

// ✅ Custom hook for easy usage in components
export const useCart = () => {
const cart = useSelector((state) => state.productCart);
  const dispatch = useDispatch();

  return {
    ...cart,
    addItem: (item) => dispatch(addItem(item)),
    removeItem: (id) => dispatch(removeItem(id)),
    updateQuantity: (id, quantity) => dispatch(updateQuantity({ id, quantity })),
    clearCart: () => dispatch(clearCart()),
  };
};
