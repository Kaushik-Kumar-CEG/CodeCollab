import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, registerUser, logout, clearAuthError } from '../../store/authSlice';
import { addLog } from '../../store/activityLogSlice';
import styles from './Navbar.module.css';

export const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    const { username, isLoggedIn, loading, error } = useSelector((state) => state.auth);

    const [authOpen, setAuthOpen] = useState(false);
    const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
    const [inputUsername, setInputUsername] = useState('');
    const [inputPassword, setInputPassword] = useState('');

    const isActive = (path) => location.pathname === path;

    const handleAuthSubmit = async (e) => {
        e.preventDefault();
        dispatch(clearAuthError());

        if (authMode === 'login') {
            const resultAction = await dispatch(loginUser({ username: inputUsername, password: inputPassword }));
            if (loginUser.fulfilled.match(resultAction)) {
                setAuthOpen(false);
                dispatch(addLog({ text: `${resultAction.payload.username} logged in`, type: 'success' }));
                setInputUsername('');
                setInputPassword('');
            }
        } else {
            const resultAction = await dispatch(registerUser({ username: inputUsername, password: inputPassword }));
            if (registerUser.fulfilled.match(resultAction)) {
                setAuthOpen(false);
                dispatch(addLog({ text: `${resultAction.payload.username} registered and logged in`, type: 'success' }));
                setInputUsername('');
                setInputPassword('');
            }
        }
    };

    const handleLogout = () => {
        dispatch(logout());
        setAuthOpen(false);
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
                    onClick={() => navigate('/rooms')}
                >
                    Rooms
                </button>
                <button
                    className={`${styles.navBtn} ${isActive('/learning') ? styles.navBtnActive : ''}`}
                    onClick={() => navigate('/learning')}
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
                            onClick={() => setAuthOpen(!authOpen)}
                        >
                            <span className={styles.userIcon}>{username?.[0]?.toUpperCase()}</span>
                            <span>{username}</span>
                        </div>

                        {authOpen && (
                            <div className={styles.dropdownMenu}>
                                <button className={styles.dropdownBtn} onClick={handleLogout}>Logout</button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className={styles.authContainer}>
                        <button
                            className={styles.loginBtn}
                            onClick={() => setAuthOpen(!authOpen)}
                        >
                            Login / Register
                        </button>

                        {authOpen && (
                            <div className={styles.authDropdown}>
                                <div className={styles.authTabs}>
                                    <button
                                        className={authMode === 'login' ? styles.activeTab : ''}
                                        onClick={() => { setAuthMode('login'); dispatch(clearAuthError()); }}
                                    >Login</button>
                                    <button
                                        className={authMode === 'register' ? styles.activeTab : ''}
                                        onClick={() => { setAuthMode('register'); dispatch(clearAuthError()); }}
                                    >Register</button>
                                </div>
                                <form onSubmit={handleAuthSubmit} className={styles.authForm}>
                                    <input
                                        type="text"
                                        placeholder="Username"
                                        value={inputUsername}
                                        onChange={(e) => setInputUsername(e.target.value)}
                                        required
                                        className={styles.authInput}
                                    />
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        value={inputPassword}
                                        onChange={(e) => setInputPassword(e.target.value)}
                                        required
                                        className={styles.authInput}
                                    />
                                    {error && <div className={styles.authError}>{error}</div>}
                                    <button type="submit" className={styles.authSubmit} disabled={loading}>
                                        {loading ? '...' : (authMode === 'login' ? 'Login' : 'Create Account')}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
