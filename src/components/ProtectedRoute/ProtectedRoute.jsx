// src/components/ProtectedRoute/ProtectedRoute.jsx

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../../redux/selectors';

const ProtectedRoute = () => {
    const isAuthenticated = useSelector(selectIsAuthenticated);
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;