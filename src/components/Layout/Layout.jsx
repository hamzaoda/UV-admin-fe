// src/components/Layout/Layout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import './Layout.css'; // Optional: Add styles as needed

const Layout = () => {
    return (
        <div className="layout">
            <Sidebar />
            <div className='main-content-1'>
                <div className='main-content-2'> <Outlet /></div>
            </div>
        </div>
    );
};

export default Layout;