import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TerminalMock } from '../../components/TerminalMock/TerminalMock';
import styles from './Home.module.css';

const API_URL = 'http://localhost:5001/api';

export const Home = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [joinId, setJoinId] = useState('');
  const [isCreating, setIsCreating] = useState(false);

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

  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <div className={styles.navLeft}>
          <div className={styles.boxes}>
            <span className={styles.boxRed}></span>
            <span className={styles.boxYellow}></span>
            <span className={styles.boxGreen}></span>
          </div>
          <span className={styles.brand}>CodeCollab</span>
        </div>
        <div className={styles.navCenter}>
          <a href="#features">Features</a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/lecture/demo'); }}>Learning Mode</a>
        </div>
        <div className={styles.navRight}>
          <span className={styles.version}>
            <span className={styles.dot}></span> v1.0.0
          </span>
        </div>
      </nav>

      <main className={styles.hero}>
        <motion.h1 
          className={styles.heroTitle}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          CODE COLLAB
        </motion.h1>
        <motion.p 
          className={styles.heroSubtitle}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          Built to help you <span>collaborate</span>,<br />
          right from your <span>browser</span>.
        </motion.p>
        <motion.p 
          className={styles.heroDescription}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          A browser-native IDE merging interactive video education 
          with structured, real-time pair programming. No installs. No extensions. Just code.
        </motion.p>

        {/* ── Room Actions ── */}
        <motion.div 
          className={styles.roomActions}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <input
            className={styles.inputField}
            type="text"
            placeholder="Your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <div className={styles.actionRow}>
            <button 
              className={styles.btnCreate} 
              onClick={handleCreateRoom}
              disabled={isCreating}
            >
              {isCreating ? 'Creating...' : '+ Create Room'}
            </button>
            <span className={styles.orDivider}>or</span>
            <div className={styles.joinGroup}>
              <input
                className={styles.inputField}
                type="text"
                placeholder="Paste Room ID"
                value={joinId}
                onChange={(e) => setJoinId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
              />
              <button className={styles.btnJoin} onClick={handleJoinRoom}>
                Join →
              </button>
            </div>
          </div>
        </motion.div>

        {/* Terminal Animation */}
        <motion.div 
          className={styles.terminalContainer}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.55 }}
        >
          <TerminalMock />
        </motion.div>

        {/* Features Section */}
        <div id="features" className={styles.featuresSection}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🎯</div>
            <h3>Role-Enforced Pairing</h3>
            <p>Driver/Navigator roles eliminate cursor chaos. Structured collaboration, not simultaneous typing.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>👻</div>
            <h3>Ghost Merges</h3>
            <p>Navigators propose code diffs from scratchpads. Drivers review side-by-side and accept or reject.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🎬</div>
            <h3>Time-Travel Lectures</h3>
            <p>Video timestamps sync with the editor. Pause to fork a sandbox, resume to snap back.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>⚡</div>
            <h3>Multi-Language Execution</h3>
            <p>Run Python, C++, Java, and JavaScript directly. JS executes zero-latency via Web Workers.</p>
          </div>
        </div>
      </main>
    </div>
  );
};
