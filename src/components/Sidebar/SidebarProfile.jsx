// src/components/SidebarProfile.js

import React from 'react';
import { FaRegUser } from "react-icons/fa";
import { PiSignOutBold } from "react-icons/pi";
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/authSlice'; // Adjust the path if necessary
import { useNavigate } from 'react-router-dom'; // Ensure react-router-dom is installed

function SidebarProfile() {
    const dispatch = useDispatch();
    const navigate = useNavigate(); // Initialize the navigation hook

    // Handler to perform logout
    const handleLogout = () => {
        dispatch(logout()); // Dispatch the logout action to update Redux store
        navigate('/login'); // Redirect the user to the login page
        // Optionally, you can also show a toast notification here
    };

    return (
        <div className='sidebar-profile-container'>
            <FaRegUser className='sidebar-profile-icon' />
            <div className='sidebar-profile-information-container'>
                <span className='sidebar-profile-username'>Admin</span>
            </div>
            {/* Make the icon clickable and provide visual feedback */}
            <PiSignOutBold
                onClick={handleLogout}
                style={{ cursor: 'pointer' }}
                title="Sign Out" // Optional: Tooltip on hover
            />
        </div>
    );
}

export default SidebarProfile;