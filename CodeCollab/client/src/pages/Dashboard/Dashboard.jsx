import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from '../../components/Navbar/Navbar';
import styles from './Dashboard.module.css';

const API_URL = 'http://localhost:5001/api';

export const Dashboard = () => {
    const navigate = useNavigate();
    const [lectures, setLectures] = useState([]);
    const [username, setUsername] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [joinId, setJoinId] = useState('');

    useEffect(() => {
        fetch(`${API_URL}/lectures`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setLectures(data);
                }
            })
            .catch(() => { });
    }, []);

    const handleCreateRoom = async () => {
        const name = username.trim() || `User_${Math.floor(Math.random() * 9000 + 1000)}`;
        setIsCreating(true);
        try {
            const res = await fetch(`${API_URL}/rooms`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ roomType: 'pair', title: `${name}'s Room` }),
            });
            const data = await res.json();
            if (data.roomId) {
                navigate(`/room/${data.roomId}`, { state: { username: name } });
            }
        } catch (err) {
            console.error('Failed to create room:', err);
        } finally {
            setIsCreating(false);
        }
    };

    const handleJoinRoom = () => {
        const name = username.trim() || `User_${Math.floor(Math.random() * 9000 + 1000)}`;
        const id = joinId.trim();
        if (!id) return;
        navigate(`/room/${id}`, { state: { username: name } });
    };

    const fadeUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
    };

    return (
        <div className={styles.container}>
            <Navbar />

            <main className={styles.mainContent}>
                {/* Quick Actions */}
                <motion.section className={styles.quickActions} {...fadeUp} transition={{ duration: 0.5 }}>
                    <h2 className={styles.sectionTitle}>Quick Actions</h2>
                    <div className={styles.actionCards}>
                        <div className={styles.actionCard}>
                            <div className={styles.cardIcon}>🚀</div>
                            <h3>Create Room</h3>
                            <p>Start a pair programming session</p>
                            <input
                                className={styles.input}
                                type="text"
                                placeholder="Your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                            <button className={styles.btnPrimary} onClick={handleCreateRoom} disabled={isCreating}>
                                {isCreating ? 'Creating...' : '+ Create Room'}
                            </button>
                        </div>

                        <div className={styles.actionCard}>
                            <div className={styles.cardIcon}>🔗</div>
                            <h3>Join Room</h3>
                            <p>Enter a room code to join</p>
                            <input
                                className={styles.input}
                                type="text"
                                placeholder="Paste Room ID"
                                value={joinId}
                                onChange={(e) => setJoinId(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                            />
                            <button className={styles.btnGhost} onClick={handleJoinRoom}>Join →</button>
                        </div>

                        <div className={styles.actionCard}>
                            <div className={styles.cardIcon}>🎬</div>
                            <h3>Learning Mode</h3>
                            <p>Interactive video lectures</p>
                            <button
                                className={styles.btnGhost}
                                onClick={() => navigate('/lecture/demo')}
                                style={{ marginTop: 'auto' }}
                            >
                                Open Demo Lecture →
                            </button>
                        </div>
                    </div>
                </motion.section>

                {/* Available Lectures */}
                <motion.section className={styles.lectureSection} {...fadeUp} transition={{ duration: 0.5, delay: 0.15 }}>
                    <h2 className={styles.sectionTitle}>Available Lectures</h2>
                    {lectures.length === 0 ? (
                        <div className={styles.emptyState}>
                            <p>No lectures available yet. The demo lecture is always accessible.</p>
                            <button className={styles.btnPrimary} onClick={() => navigate('/lecture/demo')}>
                                🎬 Open Demo Lecture
                            </button>
                        </div>
                    ) : (
                        <div className={styles.lectureGrid}>
                            {lectures.map((lecture, index) => (
                                <motion.div
                                    key={lecture.lectureId}
                                    className={styles.lectureCard}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    onClick={() => navigate(`/lecture/${lecture.lectureId}`)}
                                >
                                    <div className={styles.lectureMeta}>
                                        <span className={styles.langTag}>{lecture.language}</span>
                                        <span className={styles.lectureDate}>
                                            {new Date(lecture.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3>{lecture.title}</h3>
                                    {lecture.description && (
                                        <p className={styles.lectureDesc}>{lecture.description}</p>
                                    )}
                                    <div className={styles.instructorRow}>
                                        <span>by {lecture.instructorName}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.section>
            </main>
        </div>
    );
};

export default Dashboard;
