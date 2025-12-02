import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: [],
  reducers: {
    hydrateCart: (_, action) => {
      const payload = action.payload;
      if (Array.isArray(payload)) return payload;
      if (payload?.items && Array.isArray(payload.items)) return payload.items;
      if (payload?.tests || payload?.scans || payload?.packages) {
        return [...(payload.tests || []), ...(payload.scans || []), ...(payload.packages || [])];
      }
      return [];
    },
    addToCart: (state, action) => {
      const incoming = action.payload;
      if (!Array.isArray(state)) {
        console.warn("cartSlice: state was not an array, resetting.");
        state = [];
      }
      const existingItem = state.find(
        (item) => item.id === incoming.id && item.type === incoming.type
      );
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.push({ ...incoming, quantity: 1 });
      }
    },
    removeFromCart: (state, action) => {
      const { id, type } = action.payload;
      const index = state.findIndex(
        (item) => item.id === id && item.type === type
      );
      if (index !== -1) {
        if (state[index].quantity > 1) {
          state[index].quantity -= 1;
        } else {
          state.splice(index, 1);
        }
      }
    },
    deleteItem: (state, action) => {
      const { id, type } = action.payload;
      return state.filter((item) => !(item.id === id && item.type === type));
    },
    clearCart: () => [],
  },
});

export const { 
  hydrateCart,
  addToCart,
  removeFromCart,
  deleteItem,
  clearCart
} = cartSlice.actions;

export default cartSlice.reducer;