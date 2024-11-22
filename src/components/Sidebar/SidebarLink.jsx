// SidebarLink.jsx
import React from 'react';
import { NavLink, useLocation } from "react-router-dom";
import { IoIosArrowDown } from "react-icons/io";
import PropTypes from 'prop-types';

// Use React.memo to prevent unnecessary re-renders
const SidebarLink = React.memo(function SidebarLink({
    item,
    isActive,
    isCollapsed,
    onMainLinkClick,
    onCollapseToggle,
    onSubMenuClick,
    activeSubMenu,
}) {
    const location = useLocation();

    // Determine if any of the submenus match the current route
    const isSubMenuActive = item.submenus?.some(sub => location.pathname === sub.path);

    // Handler for key presses on collapse toggles
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onCollapseToggle(item.id);
        }
    };

    if (item.type === 'link') {
        return (
            <NavLink
                to={item.path}
                className={({ isActive: navLinkIsActive }) =>
                    `sidebar-nav-links ${navLinkIsActive ? 'sidebar-nav-links-activated' : ''}`
                }
                end // Ensures exact matching for root paths like '/'
                onClick={() => onMainLinkClick(item.id)}
            >
                <span className='sidebar-nav-links-icon'>{item.icon}</span>
                <span className='sidebar-nav-links-name'>{item.name}</span>
            </NavLink>
        );
    } else if (item.type === 'collapse') {
        return (
            <div
                className={`sidebar-nav-links-collapse-container ${isSubMenuActive ? 'sidebar-nav-links-activated' : ''}`}
            >
                <div
                    className={`sidebar-nav-links-collapse ${isCollapsed ? 'sidebar-nav-links-collapse-activated' : ''}`}
                    onClick={() => onCollapseToggle(item.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={handleKeyDown}
                    aria-expanded={isCollapsed}
                    aria-controls={`${item.id}-submenu`}
                >
                    <span className='sidebar-nav-links-icon'>{item.icon}</span>
                    <span className='sidebar-nav-links-name'>{item.name}</span>
                    <IoIosArrowDown className={`sidebar-nav-links-arrow ${isCollapsed ? 'rotated' : ''}`} />
                </div>
                <div
                    id={`${item.id}-submenu`}
                    className={`submenu ${isCollapsed ? 'show' : ''}`}
                    role="menu"
                    aria-label={`${item.name} Submenu`}
                >
                    {item.submenus.map((submenu) => (
                        <NavLink
                            key={submenu.id}
                            to={submenu.path}
                            className={({ isActive: subNavLinkIsActive }) =>
                                `submenu-item ${subNavLinkIsActive ? 'submenu-activated' : ''}`
                            }
                            role="menuitem"
                            tabIndex={isCollapsed ? 0 : -1}
                            onClick={() => onSubMenuClick(item.id, submenu.id)}
                        >
                            <span className='submenu-icon'>{submenu.icon}</span>
                            <span className='submenu-name'>{submenu.name}</span>
                        </NavLink>
                    ))}
                </div>
            </div>
        );
    } else {
        return null;
    }
});

SidebarLink.propTypes = {
    item: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        icon: PropTypes.element.isRequired,
        type: PropTypes.oneOf(['link', 'collapse']).isRequired,
        path: (props, propName, componentName) => {
            if (props.type === 'link' && !props[propName]) {
                return new Error(`The prop \`${propName}\` is required for type \`link\` in \`${componentName}\`.`);
            }
            return null;
        },
        submenus: (props, propName, componentName) => {
            if (props.type === 'collapse') {
                if (!Array.isArray(props[propName])) {
                    return new Error(`The prop \`${propName}\` must be an array for type \`collapse\` in \`${componentName}\`.`);
                }
                // Further validate each submenu item
                for (let i = 0; i < props[propName].length; i++) {
                    const submenu = props[propName][i];
                    if (!submenu.id || !submenu.name || !submenu.path || !submenu.icon) {
                        return new Error(`Each submenu in \`${propName}\` must have \`id\`, \`name\`, \`path\`, and \`icon\` properties in \`${componentName}\`.`);
                    }
                }
            }
            return null;
        },
    }).isRequired,
    isActive: PropTypes.bool.isRequired,
    isCollapsed: PropTypes.bool.isRequired,
    onMainLinkClick: PropTypes.func.isRequired,
    onCollapseToggle: PropTypes.func.isRequired,
    onSubMenuClick: PropTypes.func.isRequired,
    activeSubMenu: PropTypes.string,
};

export default SidebarLink;