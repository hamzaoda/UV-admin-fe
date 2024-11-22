// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './apiSlice';
import authReducer from './authSlice';

const store = configureStore({
    reducer: {
        // إضافة RTK Query reducer
        [apiSlice.reducerPath]: apiSlice.reducer,
        // إضافة authSlice reducer
        auth: authReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(apiSlice.middleware),
});

export default store;