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
                    <div className={styles.headerText}>
                        <h1 className={styles.pageTitle}>Learning Mode</h1>
                        <p className={styles.pageDesc}>
                            Interactive video lectures with time-synced code. Select a lecture to begin.
                        </p>
                    </div>
                </motion.div>

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
                        + Add Lecture
                    </button>
                </div>

                <div className={styles.lectureGrid}>
                    {/* Demo Lecture — always available if filter is 'all' */}
                    {filter === 'all' && (
                        <motion.div
                            className={styles.lectureCard}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            onClick={() => navigate('/lecture/demo')}
                        >
                            <div className={styles.cardBadge}>DEMO</div>
                            <div className={styles.cardIcon}>🎬</div>
                            <h3>Python 101: Understanding Recursion</h3>
                            <p className={styles.cardDesc}>
                                Learn how recursion works with step-by-step code progression synced to video.
                            </p>
                            <div className={styles.cardFooter}>
                                <span className={styles.langTag}>python</span>
                                <span className={styles.instructor}>by Instructor</span>
                            </div>
                        </motion.div>
                    )}

                    {/* Dynamic Lectures from API */}
                    {displayedLectures.map((lecture, index) => (
                        <motion.div
                            key={lecture.lectureId}
                            className={styles.lectureCard}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: (index + 1) * 0.05 }}
                            onClick={() => navigate(`/lecture/${lecture.lectureId}`)}
                        >
                            <div className={styles.cardIcon}>📚</div>
                            <h3>{lecture.title}</h3>
                            {lecture.description && (
                                <p className={styles.cardDesc}>{lecture.description}</p>
                            )}
                            <div className={styles.cardFooter}>
                                <div className={styles.cardMeta}>
                                    <span className={styles.langTag}>{lecture.language}</span>
                                    <span className={styles.instructor}>by {lecture.instructorName}</span>
                                </div>
                                {isLoggedIn && lecture.instructorName === username && (
                                    <button
                                        className={styles.btnDelete}
                                        onClick={(e) => handleDelete(e, lecture.lectureId)}
                                    >
                                        🗑️ Delete
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {loading && (
                    <div className={styles.emptyState}>Loading lectures...</div>
                )}

                {!loading && displayedLectures.length === 0 && (
                    <div className={styles.emptyState}>
                        <p>No lectures found.</p>
                        {filter === 'all' && <p className={styles.emptyHint}>The demo lecture above is always accessible.</p>}
                        {filter === 'mine' && <p className={styles.emptyHint}>You haven't created any interactive lectures yet.</p>}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Learning;
