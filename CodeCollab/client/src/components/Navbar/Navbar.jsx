import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, registerUser, logout, clearAuthError, toggleAuthModal, closeAuthModal, openAuthModal } from '../../store/authSlice';
import { addLog } from '../../store/activityLogSlice';
import styles from './Navbar.module.css';

export const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    const { username, isLoggedIn, isAuthModalOpen } = useSelector((state) => state.auth);

    const [userDropdownOpen, setUserDropdownOpen] = useState(false);

    const isActive = (path) => location.pathname === path;

    const handleNavigate = (path) => {
        if (!isLoggedIn) {
            dispatch(openAuthModal());
        } else {
            navigate(path);
        }
    };

    const handleLogout = () => {
        dispatch(logout());
        setUserDropdownOpen(false);
    };

    return (
        <nav className={styles.navbarContainer}>
            <div className={styles.navLeft}>
                <div className={styles.boxes}>
                    <span className={styles.boxRed}></span>
                    <span className={styles.boxYellow}></span>
                    <span className={styles.boxGreen}></span>
                </div>
                <span className={styles.brand} onClick={() => navigate('/')}>CodeCollab</span>
            </div>

            <div className={styles.navCenter}>
                <button
                    className={`${styles.navBtn} ${isActive('/rooms') ? styles.navBtnActive : ''}`}
                    onClick={() => handleNavigate('/rooms')}
                >
                    Rooms
                </button>
                <button
                    className={`${styles.navBtn} ${isActive('/learning') ? styles.navBtnActive : ''}`}
                    onClick={() => handleNavigate('/learning')}
                >
                    Learning
                </button>
            </div>

            {/* Auth Dropdown Area */}
            <div className={styles.navRight}>
                {isLoggedIn ? (
                    <div className={styles.userProfile}>
                        <div
                            className={styles.usernameDisplay}
                            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                        >
                            <span className={styles.userIcon}>{username?.[0]?.toUpperCase()}</span>
                            <span>{username}</span>
                        </div>

                        {userDropdownOpen && (
                            <div className={styles.dropdownMenu}>
                                <button className={styles.dropdownBtn} onClick={handleLogout}>Logout</button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className={styles.authContainer}>
                        <button
                            className={styles.loginBtn}
                            onClick={() => dispatch(openAuthModal())}
                        >
                            Login / Register
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
