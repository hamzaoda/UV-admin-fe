// src/App.js

import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from './redux/selectors';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Layout from './components/Layout/Layout';
import './App.css';

// Lazy-loaded components for better performance
const Login = lazy(() => import('./pages/Login/Login'));
const UserManagements = lazy(() => import('./pages/UserManagements/UserManagements'));
const EmailManagements = lazy(() => import('./pages/EmailManagements/EmailManagements'));
const NotFound = lazy(() => import('./pages/NotFound/NotFound')); // You can create a NotFound page

const App = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        {/* Redirect root based on authentication */}
        <Route
          path="/"
          element={
            isAuthenticated ? <Navigate to="/user-managements" /> : <Navigate to="/login" />
          }
        />

        {/* Public Route: Login */}
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/user-managements" /> : <Login />
          }
        />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/user-managements" element={<UserManagements />} />
            <Route path="/email-managements" element={<EmailManagements />} />
            {/* Add more protected routes here */}
          </Route>
        </Route>

        {/* Catch-all Route for 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default App;