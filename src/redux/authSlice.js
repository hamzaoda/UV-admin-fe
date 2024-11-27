// src/redux/authSlice.js

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    token: localStorage.getItem('authToken') || null,
    user: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            const { token, user } = action.payload;
            state.token = token;
            state.user = user;
        },
        logout: (state) => {
            state.token = null;
            state.user = null;
            localStorage.removeItem('authToken');
        }
    }
});

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;