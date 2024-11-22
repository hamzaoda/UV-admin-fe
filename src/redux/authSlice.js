// src/redux/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    token: localStorage.getItem('authToken') || null,
    user: null, // يمكنك تخزين معلومات المستخدم هنا إذا كنت تستقبلها من الـ API
    isAuthenticated: !!localStorage.getItem('authToken'),
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            const { token, user } = action.payload;
            localStorage.setItem('authToken', token);
            state.token = token;
            state.user = user;
            state.isAuthenticated = true;
        },
        logout: (state) => {
            state.token = null;
            state.user = null;
            state.isAuthenticated = false;
            localStorage.removeItem('authToken');
        },
    },
});

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;