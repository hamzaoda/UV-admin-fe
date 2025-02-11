// Sidebar.jsx
import  { useState, useEffect, useCallback } from 'react';
import './Sidebar.css';
import Logo from '../../assets/Images/Logo1.png';
import {
    FaHome,
    FaVoicemail,
} from "react-icons/fa";
import SidebarLink from './SidebarLink'; // Import the SidebarLink component
import SidebarProfile from './SidebarProfile';
import { useLocation } from 'react-router-dom';

// Define menuItems outside the component to prevent re-creation on each render
const menuItems = [
    {
        id: 'userManagements',
        name: 'User Managements',
        icon: <FaHome />,
        type: 'link',
        path: '/user-managements', // Added path
    },
    {
        id: 'EmailManagements',
        name: 'Email Managements',
        icon: <FaVoicemail />,
        type: 'link',
        path: '/email-managements', // Added path
    },
    {
        id: 'ProductManagements',
        name: 'Product Managements',
        icon: <FaVoicemail />,
        type: 'link',
        path: '/product-managements', // Added path
    },
    {
        id: 'AddProduct',
        name: 'Add Product',
        icon: <FaVoicemail />,
        type: 'link',
        path: '/add-product', // Added path
    },
    {
        id: 'AddProperties',
        name: 'Add Properties',
        icon: <FaVoicemail />,
        type: 'link',
        path: '/add-properties', // Added path
    },
    {
        id: 'TransactionManagements',
        name: 'Transaction Managements',
        icon: <FaVoicemail />,
        type: 'link',
        path: '/transaction-managements', // Added path
    },
    {
        id: 'OrderManagements',
        name: 'Order Managements',
        icon: <FaVoicemail />,
        type: 'link',
        path: '/order-managements', // Added path
    },
    {
        id: 'Configuration',
        name: 'Configuration',
        icon: <FaVoicemail />,
        type: 'link',
        path: '/configuration', // Added path
    },

];

function Sidebar() {
    // Combined state for active link and submenu
    const [activeState, setActiveState] = useState({ activeLink: null, activeSubMenu: null });
    const [collapsedItems, setCollapsedItems] = useState({});
    const location = useLocation();

    // Handler for main link clicks
    const handleMainLinkClick = useCallback((linkId) => {
        if (activeState.activeLink !== linkId) {
            setActiveState({ activeLink: linkId, activeSubMenu: null });
            setCollapsedItems((prev) => ({
                ...prev,
                [linkId]: !prev[linkId],
            }));
        }
    }, [activeState.activeLink]);

    // Handler for collapse toggles
    const handleCollapseToggle = useCallback((linkId) => {
        if (activeState.activeLink !== linkId) {
            setCollapsedItems((prev) => ({
                ...prev,
                [linkId]: !prev[linkId],
            }));
        }
    }, [activeState.activeLink]);

    // Handler for submenu clicks
    const handleSubMenuClick = useCallback((parentId, submenuId) => {
        setActiveState({ activeLink: parentId, activeSubMenu: submenuId });
    }, []);

    // Effect to set active states based on current route
    useEffect(() => {
        menuItems.forEach(item => {
            if (item.type === 'collapse') {
                const isActive = item.submenus.some(sub => sub.path === location.pathname);
                if (isActive) {
                    setActiveState({ activeLink: item.id, activeSubMenu: location.pathname });
                    setCollapsedItems(prev => ({ ...prev, [item.id]: true }));
                }
            } else {
                if (item.path === location.pathname) {
                    setActiveState({ activeLink: item.id, activeSubMenu: null });
                }
            }
        });
    }, [location.pathname]);

    return (
        <nav className='sidebar' aria-label="Sidebar Navigation">
            <div className='sidebar-logo-container'>
                <img src={Logo} className='sidebar-logo' alt="Logo" />
                <span className='sidebar-logo-text'>UNBOUND VISION</span>
            </div>

            <div className='sidebar-nav'>
                {menuItems.map((item) => (
                    <SidebarLink
                        key={item.id}
                        item={item}
                        isActive={activeState.activeLink === item.id}
                        isCollapsed={collapsedItems[item.id] || false}
                        onMainLinkClick={handleMainLinkClick}
                        onCollapseToggle={handleCollapseToggle}
                        onSubMenuClick={handleSubMenuClick}
                        activeSubMenu={activeState.activeSubMenu}
                    />
                ))}
            </div>

            <SidebarProfile />
        </nav>
    );
}

export default Sidebar;