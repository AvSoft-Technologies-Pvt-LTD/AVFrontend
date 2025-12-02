// import { configureStore } from '@reduxjs/toolkit';
// import authReducer from './authSlice';
// import cartReducer from './cartSlice'
// import productCartReducer from './productcartSlice';
// const store = configureStore({
//   reducer: {
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';
import authReducer from './authSlice';
import cartReducer from './cartSlice';
import productCartReducer from './productcartSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['cart'],
  stateReconciler: (inboundState, originalState) => {
    if (inboundState.cart && !Array.isArray(inboundState.cart)) {
      return {
        ...originalState,
        cart: []
      };
    }
    return { ...originalState, ...inboundState };
  }
};

const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  productCart: productCartReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

export default store;