// src/store.js

import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './apiSlice';
import authReducer from './authSlice';
import editProductReducer from './editProductSlice'; // Import the new reducer


const store = configureStore({
    reducer: {
        editProduct: editProductReducer,
        [apiSlice.reducerPath]: apiSlice.reducer,
        auth: authReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(apiSlice.middleware),
});

export default store;