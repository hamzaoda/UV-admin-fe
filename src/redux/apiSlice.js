// src/redux/apiSlice.js

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { showSuccess, showError } from '../helpers/toastHandler';
import { setCredentials, logout } from './authSlice';

const baseUrl = import.meta.env.VITE_BASE_URL;

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: baseUrl,
        prepareHeaders: (headers, { getState }) => {
            const token = getState().auth.token || localStorage.getItem('authToken');
            if (token) {
                headers.set('Authorization', `${token}`);
            }
            // headers.set('Content-Type', 'application/json'); // Removed to let FormData set it
            return headers;
        },
    }),
    endpoints: (builder) => ({
        makeRequest: builder.mutation({
            query: ({ url, method, dataReq = null }) => ({
                url,
                method,
                body: method !== 'GET' ? dataReq : undefined,
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                const { url, method, successMessage, errorMessage } = arg;
                try {
                    const { data } = await queryFulfilled;

                    if (url === '/login') {
                        const token = data.data.token;
                        const user = data.data;
                        if (token) {
                            dispatch(setCredentials({ token, user }));
                            localStorage.setItem('authToken', token);
                            console.log('Login successful. Token stored:', token);
                        } else {
                            console.error('Token not found in login response:', data);
                        }
                    }

                    // **Conditional Success Toast**
                    if (successMessage && method.toUpperCase() !== 'GET') { // Only show for non-GET methods
                        showSuccess(successMessage);
                        console.log('Success:', successMessage);
                    }
                } catch (err) {
                    console.error('API Error:', err);
                    if (errorMessage) { // Only show error toast if message exists
                        const errorMsg = err?.error?.data?.message || errorMessage;
                        showError(errorMsg);
                    }

                    if (err?.data?.status === 401) {
                        dispatch(logout());
                        showError('Session expired! Please log in again.');
                    }
                }
            },
        }),
        makeFormDataRequest: builder.mutation({ // New mutation for form data
            query: ({ url, method, dataReq }) => ({
                url,
                method,
                body: dataReq,
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                const { url, method, successMessage, errorMessage } = arg;
                try {
                    const { data } = await queryFulfilled;

                    if (url === '/login') {
                        const token = data.data.token;
                        const user = data.data;
                        if (token) {
                            dispatch(setCredentials({ token, user }));
                            localStorage.setItem('authToken', token);
                            console.log('Login successful. Token stored:', token);
                        } else {
                            console.error('Token not found in login response:', data);
                        }
                    }

                    // **Conditional Success Toast**
                    if (successMessage && method.toUpperCase() !== 'GET') {
                        showSuccess(successMessage);
                        console.log('Success:', successMessage);
                    }
                } catch (err) {
                    console.error('API Error:', err);
                    if (errorMessage) {
                        const errorMsg = err?.error?.data?.message || errorMessage;
                        showError(errorMsg);
                    }

                    if (err?.data?.status === 401) {
                        dispatch(logout());
                        showError('Session expired! Please log in again.');
                    }
                }
            },
        }),
    }),
});

export const { useMakeRequestMutation, useMakeFormDataRequestMutation } = apiSlice;