// src/redux/slices/editProductSlice.js
import { createSlice } from '@reduxjs/toolkit';

const editProductSlice = createSlice({
    name: 'editProduct',
    initialState: {
        product: null,
        loading: false,
        error: null,
    },
    reducers: {
        setProductForEdit: (state, action) => {
            state.product = action.payload;
            state.loading = false;
            state.error = null;
        },
        clearProduct: (state) => {
            state.product = null;
        },
        updateProductStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        updateProductSuccess: (state, action) => {
            state.loading = false;
            state.product = action.payload; // Optionally update with the response
        },
        updateProductFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
    },
});

export const {
    setProductForEdit,
    clearProduct,
    updateProductStart,
    updateProductSuccess,
    updateProductFailure,
} = editProductSlice.actions;

export default editProductSlice.reducer;