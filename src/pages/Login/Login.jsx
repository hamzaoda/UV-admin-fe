// src/components/Login.jsx
import { useState } from "react";
import "./Login.css"; // Import the CSS file
import {
  validateEmail,
  validatePassword,
} from "../../helpers/validateFunctions"; // Import the validation functions
import useApi from '../../hooks/useApi';
import { useNavigate } from 'react-router-dom';
import { showError } from '../../helpers/toastHandler';
import Logo from '../../assets/Images/Logo.png';
import LoadingOverlay from '../../components/LoadingOverlay/LoadingOverlay'; // ADDED: Import LoadingOverlay
import '../ProductForm/ProductForm.css'

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

      navigate('/user-managements');
    } catch (err) {
      console.error('Login Error:', err);
    }

  };

  return (
    <div className="sign-page">
      <LoadingOverlay isLoading={isLoading} /> {/* ADDED: LoadingOverlay component */}
      <img src={Logo} className='logo' alt="Logo" />
      <form id="loginForm" onSubmit={handleSubmit} className="sign-container">
        <h1>Login</h1>
        <div className="form-section">
          <div>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-group"
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
              className="form-group"
            />
          </div>
          <button className="w-100 btn btn-primary" type="submit" disabled={isLoading}>
            {isLoading ? 'logging ...' : 'Login'}
          </button>
        </div>
      </form >
    </div >
  );
}

export default Login;