import React, { useState } from 'react';
import './Sidebar.css';

function Sidebar() {
    const [isSidebarClosed, setSidebarClosed] = useState(true);
    const [menuStates, setMenuStates] = useState({});

    const toggleSidebar = () => {
        setSidebarClosed(!isSidebarClosed);
    };

    const toggleMenu = (menuName) => {
        setMenuStates((prevState) => ({
            ...prevState,
            [menuName]: !prevState[menuName],
        }));
    };

    return (
        <div>
            <link
                href="https://unpkg.com/boxicons@2.0.7/css/boxicons.min.css"
                rel="stylesheet"
            />

            <div className={`sidebar ${isSidebarClosed ? 'close' : ''}`}>
                <div className="logo-details">
                    <i className="bx bxl-c-plus-plus"></i>
                    <span className="logo_name">CodingLab</span>
                </div>
                <ul className="nav-links">
                    <li>
                        <a href="#">
                            <i className="bx bx-grid-alt"></i>
                            <span className="link_name">Dashboard</span>
                        </a>
                        <ul className="sub-menu blank">
                            <li><a className="link_name" href="#">Dashboard</a></li>
                        </ul>
                    </li>
                    <li className={menuStates['category'] ? 'showMenu' : ''}>
                        <div className="iocn-link">
                            <a href="#">
                                <i className="bx bx-collection"></i>
                                <span className="link_name">Category</span>
                            </a>
                            <i
                                className="bx bxs-chevron-down arrow"
                                onClick={() => toggleMenu('category')}
                            ></i>
                        </div>
                        <ul className="sub-menu">
                            <li><a className="link_name" href="#">Category</a></li>
                            <li><a href="#">HTML & CSS</a></li>
                            <li><a href="#">JavaScript</a></li>
                            <li><a href="#">PHP & MySQL</a></li>
                        </ul>
                    </li>
                    <li>
                        <div className="profile-details">
                            <div className="profile-content">
                                <img src="" alt="profileImg" />
                            </div>
                            <div className="name-job">
                                <div className="profile_name">Prem Shahi</div>
                                <div className="job">Web Designer</div>
                            </div>
                            <i className="bx bx-log-out"></i>
                        </div>
                    </li>
                </ul>
            </div>
            <section className="home-section">
                <div className="home-content">
                    <i className="bx bx-menu" onClick={toggleSidebar}></i>
                    <span className="text">Drop Down Sidebar</span>
                </div>
            </section>
        </div>
    );
}

export default Sidebar;