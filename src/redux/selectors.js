// src/redux/selectors.js

export const selectAuthToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => !!state.auth.token;
export const selectUser = (state) => state.auth.user;

export const selectApiLoading = (state) => state.api.isLoading;
export const selectApiError = (state) => state.api.error;