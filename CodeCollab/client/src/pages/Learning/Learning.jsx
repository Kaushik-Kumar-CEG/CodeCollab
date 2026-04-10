import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Navbar } from '../../components/Navbar/Navbar';
import styles from './Learning.module.css';

const API_URL = 'http://localhost:5001/api';

export const Learning = () => {
    const navigate = useNavigate();
    const { username, isLoggedIn } = useSelector(state => state.auth);
    const [lectures, setLectures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all' or 'mine'

    const fetchLectures = () => {
        setLoading(true);
        fetch(`${API_URL}/lectures`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setLectures(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        fetchLectures();
    }, []);

    const handleDelete = async (e, lectureId) => {
        e.stopPropagation(); // prevent navigating to lecture
        if (!window.confirm('Are you sure you want to delete this lecture?')) return;

        try {
            const res = await fetch(`${API_URL}/lectures/${lectureId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setLectures(prev => prev.filter(l => l.lectureId !== lectureId));
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to delete lecture');
            }
        } catch (err) {
            alert('Error deleting lecture.');
        }
    };

    const displayedLectures = lectures.filter(lecture => {
        if (filter === 'mine') return lecture.instructorName === username;
        return true;
    });

    return (
        <div className={styles.container}>
            <Navbar />
            <main className={styles.main}>
                <motion.div
                    className={styles.headerRow}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <h1 className={styles.pageTitle}>Learning Directory</h1>
                    <p className={styles.pageDesc}>
                        Interactive video lectures paired with time-synced code.
                    </p>
                </motion.div>

                <motion.div className={styles.terminal} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
                    <div className={styles.terminalHeader}>
                        <div className={styles.dots}>
                            <span className={styles.dotRed}></span>
                            <span className={styles.dotYellow}></span>
                            <span className={styles.dotGreen}></span>
                        </div>
                        <span className={styles.terminalTitle}>learning_modules.sh</span>
                    </div>

                    <div className={styles.terminalBody}>
                        
                        <div className={styles.filterBar}>
                            <div className={styles.tabs}>
                                <button
                                    className={filter === 'all' ? styles.tabActive : styles.tab}
                                    onClick={() => setFilter('all')}
                                >
                                    All Lectures
                                </button>
                                {isLoggedIn && (
                                    <button
                                        className={filter === 'mine' ? styles.tabActive : styles.tab}
                                        onClick={() => setFilter('mine')}
                                    >
                                        My Lectures
                                    </button>
                                )}
                            </div>

                            <button
                                className={styles.btnAddLecture}
                                onClick={() => navigate('/learning/create')}
                            >
                                Add New Lecture
                            </button>
                        </div>

                        {loading ? (
                            <div className={styles.emptyState}>Loading lectures mapping...</div>
                        ) : displayedLectures.length === 0 ? (
                            <div className={styles.emptyState}>
                                <p>No lectures available matching the current filter.</p>
                                {filter === 'mine' && <p className={styles.emptyHint}>Upload a new interactive lecture to get started.</p>}
                            </div>
                        ) : (
                            <div className={styles.lectureList}>
                                {displayedLectures.map((lecture, index) => (
                                    <motion.div
                                        key={lecture.lectureId}
                                        className={styles.lectureRow}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.2, delay: index * 0.05 }}
                                        onClick={() => navigate(`/lecture/${lecture.lectureId}`)}
                                    >
                                        <div className={styles.lectureInfo}>
                                            <span className={styles.lectureTitle}>
                                                {lecture.title}
                                                <span className={styles.langBadge}>{lecture.language}</span>
                                            </span>
                                            {lecture.description && (
                                                <span className={styles.lectureDesc}>{lecture.description}</span>
                                            )}
                                            <span className={styles.lectureMeta}>
                                                Owner: {lecture.instructorName} | Lecture ID: {lecture.lectureId.substring(0,8)}
                                            </span>
                                        </div>
                                        <div className={styles.lectureActions}>
                                            <button className={styles.btnPlay}>Watch</button>
                                            {isLoggedIn && lecture.instructorName === username && (
                                                <button
                                                    className={styles.btnDelete}
                                                    onClick={(e) => handleDelete(e, lecture.lectureId)}
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            </main>
        </div>
    );
};

export default Learning;
