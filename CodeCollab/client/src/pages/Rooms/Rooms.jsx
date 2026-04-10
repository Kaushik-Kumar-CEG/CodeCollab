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
                        Please set your username in the navbar before creating or joining rooms.
                    </motion.div>
                )}
                <div className={styles.grid}>
                    {/* Left Column */}
                    <div className={styles.leftCol}>
                        {/* Terminal: Create Room */}
                        <motion.div className={styles.terminal} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                            <div className={styles.terminalHeader}>
                                <div className={styles.dots}>
                                    <span className={styles.dotRed}></span>
                                    <span className={styles.dotYellow}></span>
                                    <span className={styles.dotGreen}></span>
                                </div>
                                <span className={styles.terminalTitle}>create_room.sh</span>
                            </div>
                            <div className={styles.terminalBody}>
                                <h2 className={styles.sectionTitle}>Create New Room</h2>
                                <p className={styles.terminalText}>Start a new pair programming session. You'll be the designated driver.</p>
                                <input 
                                    type="text"
                                    className={styles.inputLine}
                                    placeholder="Room Name (optional)"
                                    value={roomName}
                                    onChange={(e) => setRoomName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleCreateRoom()}
                                />
                                <button className={styles.btnAction} onClick={handleCreateRoom} disabled={isCreating}>
                                    {isCreating ? 'Creating Room...' : 'Create Room'}
                                </button>
                            </div>
                        </motion.div>

                        {/* Terminal: Join Room */}
                        <motion.div className={styles.terminal} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
                            <div className={styles.terminalHeader}>
                                <div className={styles.dots}>
                                    <span className={styles.dotRed}></span>
                                    <span className={styles.dotYellow}></span>
                                    <span className={styles.dotGreen}></span>
                                </div>
                                <span className={styles.terminalTitle}>join_room.sh</span>
                            </div>
                            <div className={styles.terminalBody}>
                                <h2 className={styles.sectionTitle}>Join Existing Room</h2>
                                <p className={styles.terminalText}>Have an invite code or room ID? Request access below.</p>
                                <div className={styles.joinRow}>
                                    <div className={styles.joinInputContainer}>
                                        <input
                                            className={styles.inputLine}
                                            type="text"
                                            placeholder="Paste Room ID"
                                            value={joinId}
                                            onChange={(e) => setJoinId(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                                        />
                                    </div>
                                    <button className={styles.btnJoinInline} onClick={() => handleJoinRoom()}>
                                        Join Room
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: Your Rooms */}
                    <motion.div className={styles.terminal} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
                        <div className={styles.terminalHeader}>
                            <div className={styles.dots}>
                                <span className={styles.dotRed}></span>
                                <span className={styles.dotYellow}></span>
                                <span className={styles.dotGreen}></span>
                            </div>
                            <span className={styles.terminalTitle}>list_rooms.sh</span>
                        </div>
                        <div className={styles.terminalBody}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h2 className={styles.sectionTitle}>Open Sessions</h2>
                                <span className={styles.terminalText} style={{ fontSize: '13px' }}>
                                    {rooms.length} Session{rooms.length !== 1 && 's'}
                                </span>
                            </div>

                            {loading ? (
                                <div className={styles.emptyState}>Loading accessible rooms...</div>
                            ) : rooms.length === 0 ? (
                                <div className={styles.emptyState}>No open sessions found nearby.</div>
                            ) : (
                                <div className={styles.terminalList}>
                                    {rooms.map((room, index) => (
                                        <motion.div
                                            key={room.roomId}
                                            className={styles.roomRow}
                                            initial={{ opacity: 0, Math: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.25, delay: index * 0.05 }}
                                        >
                                            <div className={styles.roomInfo}>
                                                <span className={styles.roomName}>{room.title}</span>
                                                <span className={styles.roomMeta}>
                                                    ID: {room.roomId} | Lang: {room.language} | Participants: {room.participantCount}
                                                    {room.createdBy === username && ' | Owner'}
                                                </span>
                                            </div>
                                            <div className={styles.roomActions}>
                                                <button className={styles.btnJoinList} onClick={() => handleJoinRoom(room.roomId)}>
                                                    Join
                                                </button>
                                                {room.createdBy === username && username && (
                                                    <button 
                                                        className={styles.btnDeleteList} 
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
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default Rooms;
