// src/pages/NotFound/NotFound.js
import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css'; // Import the external CSS file

const NotFound = () => {
    return (
        <div className="not-found">
            <h1>404 - Page Not Found</h1>
            <p>The page you are looking for does not exist.</p>
            <Link to="/">Return to Home Page</Link>
        </div>
    );
};

export default NotFound;