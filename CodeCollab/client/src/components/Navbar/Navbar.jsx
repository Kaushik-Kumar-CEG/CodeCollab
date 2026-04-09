import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addLog } from '../../store/activityLogSlice';
import styles from './Navbar.module.css';

export const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const [username, setUsernameState] = useState(() => sessionStorage.getItem('cc_username') || '');
    const [usernameInput, setUsernameInput] = useState('');
    const [editingUsername, setEditingUsername] = useState(false);

    const saveUsername = (name) => {
        const trimmed = name.trim();
        if (trimmed) {
            sessionStorage.setItem('cc_username', trimmed);
            setUsernameState(trimmed);
            setEditingUsername(false);
            dispatch(addLog({ text: `Username set to "${trimmed}"`, type: 'success' }));
        }
    };

    const isActive = (path) => location.pathname === path;

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

            {/* Username */}
            <div className={styles.navRight}>
                {editingUsername ? (
                    <div className={styles.usernameRow}>
                        <input
                            className={styles.usernameInput}
                            type="text"
                            placeholder="Enter username"
                            value={usernameInput}
                            onChange={(e) => setUsernameInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') saveUsername(usernameInput);
                                if (e.key === 'Escape') setEditingUsername(false);
                            }}
                            autoFocus
                        />
                        <button className={styles.setBtn} onClick={() => saveUsername(usernameInput)}>Set</button>
                    </div>
                ) : (
                    <div className={styles.usernameDisplay}>
                        {username ? (
                            <>
                                <span className={styles.userIcon}>{username[0].toUpperCase()}</span>
                                <span>{username}</span>
                            </>
                        ) : null}
                        <button
                            className={styles.setUsernameBtn}
                            onClick={() => { setUsernameInput(username); setEditingUsername(true); }}
                        >
                            {username ? 'Change' : 'Set Username'}
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
