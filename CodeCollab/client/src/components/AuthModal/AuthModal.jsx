import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { loginUser, registerUser, closeAuthModal, clearAuthError } from '../../store/authSlice';
import { addLog } from '../../store/activityLogSlice';
import styles from './AuthModal.module.css';

export const AuthModal = () => {
    const dispatch = useDispatch();
    const { isAuthModalOpen, loading, error } = useSelector((state) => state.auth);

    const [authMode, setAuthMode] = useState('login');
    const [inputUsername, setInputUsername] = useState('');
    const [inputPassword, setInputPassword] = useState('');

    useEffect(() => {
        if (!isAuthModalOpen) {
            setInputUsername('');
            setInputPassword('');
            dispatch(clearAuthError());
        }
    }, [isAuthModalOpen, dispatch]);

    const handleClose = () => {
        dispatch(closeAuthModal());
    };

    const handleAuthSubmit = async (e) => {
        e.preventDefault();
        dispatch(clearAuthError());

        const action = authMode === 'login' ? loginUser : registerUser;
        const resultAction = await dispatch(action({ username: inputUsername, password: inputPassword }));
        
        if (action.fulfilled.match(resultAction)) {
            dispatch(closeAuthModal());
            dispatch(addLog({ text: `${resultAction.payload.username} ${authMode === 'login' ? 'logged in' : 'registered'}`, type: 'success' }));
        }
    };

    return (
        <AnimatePresence>
            {isAuthModalOpen && (
                <motion.div
                    className={styles.modalOverlay}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    onClick={handleClose}
                >
                    <motion.div
                        className={styles.modalContent}
                        initial={{ scale: 0.95, opacity: 0, y: 15 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 15 }}
                        transition={{ type: "spring", stiffness: 350, damping: 25 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={styles.modalHeader}>
                            <h3>{authMode === 'login' ? 'Login' : 'Create Account'}</h3>
                            <button className={styles.closeBtn} onClick={handleClose}>&times;</button>
                        </div>

                        <div className={styles.modalBody}>
                            <div className={styles.authTabs}>
                                <button
                                    type="button"
                                    className={authMode === 'login' ? styles.activeTab : ''}
                                    onClick={() => { setAuthMode('login'); dispatch(clearAuthError()); }}
                                >
                                    Login
                                </button>
                                <button
                                    type="button"
                                    className={authMode === 'register' ? styles.activeTab : ''}
                                    onClick={() => { setAuthMode('register'); dispatch(clearAuthError()); }}
                                >
                                    Register
                                </button>
                            </div>
                            
                            <form onSubmit={handleAuthSubmit} className={styles.authForm}>
                                <input
                                    type="text"
                                    placeholder="Username"
                                    value={inputUsername}
                                    onChange={(e) => setInputUsername(e.target.value)}
                                    required
                                    className={styles.authInput}
                                    autoFocus
                                />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={inputPassword}
                                    onChange={(e) => setInputPassword(e.target.value)}
                                    required
                                    className={styles.authInput}
                                />
                                {error && (
                                    <motion.div 
                                        className={styles.authError}
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                    >
                                        {error}
                                    </motion.div>
                                )}
                                <div className={styles.modalActions}>
                                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                                        {loading ? '⏳ Please wait...' : (authMode === 'login' ? 'Login →' : 'Register →')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
