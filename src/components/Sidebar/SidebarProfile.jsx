import React from 'react'
import { FaRegUser } from "react-icons/fa";
import { PiSignOutBold } from "react-icons/pi";


function SidebarProfile() {
    return (
        <div className='sidebar-profile-container'>
            <FaRegUser className='sidebar-profile-icon' />
            <div className='sidebar-profile-information-container'>
            <span className='sidebar-profile-username'>SidebarProfile</span>
            <span className='sidebar-profile-type'>Admin</span>
            </div>
            <PiSignOutBold />
        </div>
    )
}

export default SidebarProfile