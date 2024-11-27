// src/components/Login.jsx
import React, { useState } from "react";
import "./Login.css"; // Import the CSS file
import {
  validateEmail,
  validatePassword,
} from "../../Helpers/validateFunctions"; // Import the validation functions
import useApi from '../../hooks/useApi';
import { useNavigate } from 'react-router-dom';
import { showError } from '../../helpers/toastHandler';

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { callApi, isLoading, isError, error } = useApi();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate email and password
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    // If validation fails, show error via toast
    if (emailError || passwordError) {
      showError("Email or Password not correct");
      return;
    }

    const dataReq = { email, password };

    try {
      const response = await callApi({
        url: '/login',
        method: 'POST',
        dataReq: { email, password },
        successMessage: 'Login Successfully',
        errorMessage: 'Error Login',
      });
      console.log('Login Response:', response);
      // Redirect or perform other actions after successful login

      // Reset fields after trying login
      setEmail('');
      setPassword('');

      navigate('/main');
    } catch (err) {
      console.error('Login Error:', err);
    }

  };

  return (
    <div className="sign-page">
      <form id="loginForm" onSubmit={handleSubmit} className="sign-container">
        <h1>Login</h1>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="form-control"
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="form-control"
          />
        </div>
        <button className="w-100 btn btn-primary" type="submit" disabled={isLoading}>
          {isLoading ? 'logging ...' : 'Login'}
        </button>
      </form >
    </div >
  );
}

export default Login;