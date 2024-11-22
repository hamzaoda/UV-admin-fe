// src/redux/apiSlice.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { showSuccess, showError } from '../helpers/toastHandler';
import { setCredentials, logout } from './authSlice';

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: 'https://your.api.base.url',
        prepareHeaders: (headers, { getState, endpoint }) => {
            const requireToken = endpoint !== 'makeRequest' ? true : false;
            if (requireToken) {
                const token = getState().auth.token;
                if (token) {
                    headers.set('Authorization', `Bearer ${token}`);
                }
            }
            headers.set('Content-Type', 'application/json');
            return headers;
        },
    }),
    endpoints: (builder) => ({
        makeRequest: builder.mutation({
            query: ({ url, method, dataReq = null, token = true }) => ({
                url,
                method,
                body: method !== 'GET' ? dataReq : undefined,
                headers: token ? { Authorization: `Bearer ${localStorage.getItem('authToken')}` } : {},
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                const { url, successMessage, errorMessage } = arg;
                try {
                    const { data } = await queryFulfilled;

                    if (url === '/auth/login') {
                        dispatch(setCredentials({ token: data.token, user: data.user }));
                    }

                    if (successMessage) {
                        showSuccess(successMessage);
                    }
                } catch (err) {
                    if (errorMessage) {
                        console.log("Error");
                        showError(errorMessage);
                    }

                    if (err?.data?.status === 401) {
                        dispatch(logout());
                        showError('Session expired! Please log in again.');
                    }
                }
            },
        }),
        // إضافة نقاط نهاية أخرى إذا لزم الأمر
    }),
});

export const { useMakeRequestMutation } = apiSlice;