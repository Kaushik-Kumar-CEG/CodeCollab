import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from '../../components/Navbar/Navbar';
import styles from './Learning.module.css';

const API_URL = 'http://localhost:5001/api';

export const Learning = () => {
    const navigate = useNavigate();
    const [lectures, setLectures] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_URL}/lectures`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setLectures(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    return (
        <div className={styles.container}>
            <Navbar />
            <main className={styles.main}>
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <h1 className={styles.pageTitle}>Learning Mode</h1>
                    <p className={styles.pageDesc}>
                        Interactive video lectures with time-synced code. Select a lecture to begin.
                    </p>
                </motion.div>

                <div className={styles.lectureGrid}>
                    {/* Demo Lecture — always available */}
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

                    {/* Dynamic Lectures from API */}
                    {lectures.map((lecture, index) => (
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
                                <span className={styles.langTag}>{lecture.language}</span>
                                <span className={styles.instructor}>by {lecture.instructorName}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {loading && (
                    <div className={styles.emptyState}>Loading lectures...</div>
                )}

                {!loading && lectures.length === 0 && (
                    <div className={styles.emptyState}>
                        <p>No additional lectures available yet.</p>
                        <p className={styles.emptyHint}>The demo lecture above is always accessible.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Learning;
