// import { configureStore } from '@reduxjs/toolkit';
// import authReducer from './authSlice';
// import cartReducer from './cartSlice'
// import productCartReducer from './productcartSlice';
// const store = configureStore({
//   reducer: {
//     auth: authReducer,
//     cart: cartReducer,
//     productCart: productCartReducer,
//   },
// });
// export default store;
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import cartReducer from './cartSlice'
import productCartReducer from './productcartSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    productCart: productCartReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export default store;