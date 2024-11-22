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
  const { callApi, isLoading } = useApi();
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

    navigate('/main');

    const dataReq = { email, password };
    const response = await callApi({
      url: '/auth/login',
      method: 'POST',
      dataReq: dataReq,
      token: false,
      successMessage: 'Login Successfully',
      errorMessage: 'Error Login',
    });

    // Reset fields after trying login
    setEmail('');
    setPassword('');

    if (response) {
      navigate('/main');
    }
  };

  return (
    <div className="sign-container">
      <h1>Login</h1>
      <form id="loginForm" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="form-control"
          />
        </div>
        <button className="w-100 btn btn-primary" type="submit" disabled={isLoading}>
          {isLoading ? 'logging ...' : 'Login'}
        </button>
      </form>
    </div>
  );
}

export default Login;