import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { Navbar } from '../../components/Navbar/Navbar';
import { addLog } from '../../store/activityLogSlice';
import { openAuthModal } from '../../store/authSlice';
import styles from './Rooms.module.css';

const API_URL = 'http://localhost:5001/api';

export const Rooms = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [rooms, setRooms] = useState([]);
    const [joinId, setJoinId] = useState('');
    const [roomName, setRoomName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [loading, setLoading] = useState(true);

    const getUsername = () => sessionStorage.getItem('cc_username') || '';

    // Fetch rooms filtered by this user's username
    const fetchRooms = () => {
        const username = getUsername();
        const url = username ? `${API_URL}/rooms?username=${encodeURIComponent(username)}` : `${API_URL}/rooms`;
        fetch(url)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setRooms(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        fetchRooms();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCreateRoom = async () => {
        const name = getUsername();
        if (!name) {
            dispatch(openAuthModal());
            return;
        }
        setIsCreating(true);
        const finalTitle = roomName.trim() || `${name}'s Room`;
        try {
            const res = await fetch(`${API_URL}/rooms`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ roomType: 'pair', title: finalTitle, username: name }),
            });
            const data = await res.json();
            if (data.roomId) {
                dispatch(addLog({ text: `${name} created room ${data.roomId}`, type: 'success' }));
                navigate(`/room/${data.roomId}`, { state: { username: name } });
            }
        } catch (err) {
            console.error('Failed to create room:', err.message || err);
        } finally {
            setIsCreating(false);
        }
    };

    const handleJoinRoom = (roomId) => {
        const name = getUsername();
        if (!name) {
            dispatch(openAuthModal());
            return;
        }
        const id = roomId || joinId.trim();
        if (!id) return;
        dispatch(addLog({ text: `${name} joining room ${id}`, type: 'log' }));
        navigate(`/room/${id}`, { state: { username: name } });
    };

    const handleDeleteRoom = async (roomId, e) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this room?")) return;
        try {
            const res = await fetch(`${API_URL}/rooms/${roomId}`, { method: 'DELETE' });
            if (res.ok) {
                dispatch(addLog({ text: 'Room deleted successfully', type: 'success' }));
                fetchRooms();
            }
        } catch (err) {
            console.error('Failed to delete room:', err.message || err);
        }
    };

    const username = getUsername();

    return (
        <div className={styles.container}>
            <Navbar />
            <main className={styles.main}>
                {!username && (
                    <motion.div className={styles.usernameWarning} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        ⚠️ Set your username in the navbar before creating or joining rooms.
                    </motion.div>
                )}
                <div className={styles.grid}>
                    {/* Left Column */}
                    <div className={styles.leftCol}>
                        <motion.div className={styles.card} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                            <div className={styles.cardHeader}>
                                <span className={styles.cardIcon}>🚀</span>
                                <h2>Create Room</h2>
                            </div>
                            <p className={styles.cardDesc}>Start a new pair programming session. You'll be the driver.</p>
                            <input 
                                type="text"
                                className={styles.roomNameInput}
                                placeholder="Room Name (Optional)"
                                value={roomName}
                                onChange={(e) => setRoomName(e.target.value)}
                            />
                            <button className={styles.btnCreate} onClick={handleCreateRoom} disabled={isCreating}>
                                {isCreating ? '⏳ Creating...' : '+ New Room'}
                            </button>
                        </motion.div>

                        <motion.div className={styles.card} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
                            <div className={styles.cardHeader}>
                                <span className={styles.cardIcon}>🔗</span>
                                <h2>Join Room</h2>
                            </div>
                            <p className={styles.cardDesc}>Have a room ID? Paste it below to join.</p>
                            <div className={styles.joinRow}>
                                <input
                                    className={styles.input}
                                    type="text"
                                    placeholder="Paste Room ID..."
                                    value={joinId}
                                    onChange={(e) => setJoinId(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                                />
                                <button className={styles.btnJoin} onClick={() => handleJoinRoom()}>Join →</button>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: Your Rooms */}
                    <motion.div className={styles.existingRooms} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
                        <div className={styles.existingHeader}>
                            <h2>{username ? 'Your Rooms' : 'All Rooms'}</h2>
                            <span className={styles.roomCount}>{rooms.length} room{rooms.length !== 1 ? 's' : ''}</span>
                        </div>

                        {loading ? (
                            <div className={styles.emptyState}>Loading rooms...</div>
                        ) : rooms.length === 0 ? (
                            <div className={styles.emptyState}>
                                <p>{username ? 'You haven\'t created or joined any rooms yet.' : 'No active rooms.'}</p>
                                <p className={styles.emptyHint}>Create one to get started!</p>
                            </div>
                        ) : (
                            <div className={styles.roomList}>
                                {rooms.map((room, index) => (
                                    <motion.div
                                        key={room.roomId}
                                        className={styles.roomItem}
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.25, delay: index * 0.05 }}
                                        onClick={() => handleJoinRoom(room.roomId)}
                                    >
                                        <div className={styles.roomInfo}>
                                            <span className={styles.roomTitle}>{room.title}</span>
                                            <span className={styles.roomMeta}>
                                                {room.roomId} • {room.language} • {room.participantCount} user{room.participantCount !== 1 ? 's' : ''}
                                                {room.createdBy === username && ' • Created by you'}
                                            </span>
                                        </div>
                                        <div className={styles.roomActions}>
                                            <button className={styles.roomJoinBtn}>Join →</button>
                                            {room.createdBy === username && username && (
                                                <button 
                                                    className={styles.btnDeleteRoom} 
                                                    onClick={(e) => handleDeleteRoom(room.roomId, e)}
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default Rooms;
