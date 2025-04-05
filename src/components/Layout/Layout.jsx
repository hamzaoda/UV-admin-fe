// src/components/Layout/Layout.js
import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import './Layout.css'; // Optional: Add styles as needed

const Layout = () => {
    return (
        <div className='layout'>
            <Sidebar />
            <div className='main-content'>
                <Outlet />
            </div>
        </div>
    );
};

export default Layout;