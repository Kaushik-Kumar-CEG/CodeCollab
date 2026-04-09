import React, { useEffect, useRef, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  setRoomContext, 
  setRoomState, 
  updateMainCode, 
  updateScratchpadCode,
  receiveProposal 
} from '../../store/roomSlice';
import { executeCodeThunk, setLanguage } from '../../store/executionSlice';
import EditorComponent from '../../components/Editor/Editor';
import ScratchpadTabBar from '../../components/ScratchpadTabBar/ScratchpadTabBar';
import Terminal from '../../components/Terminal/Terminal';
import GhostMergeModal from '../../components/GhostMergeModal/GhostMergeModal';
import styles from './Room.module.css';

const SOCKET_SERVER_URL = "http://localhost:5001";

export const Room = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const socketRef = useRef(null);
  const [username] = React.useState(location.state?.username || `User_${Math.floor(Math.random() * 1000)}`);
  const [mySocketId, setMySocketId] = React.useState(null);
  const [roleRequest, setRoleRequest] = React.useState(null);
  const [copied, setCopied] = React.useState(false);
  const [toast, setToast] = React.useState(null);

  const { myRole, participants, activeScratchpadId, mainCode, currentDriverId } = useSelector(state => state.room);
  const { language, isExecuting } = useSelector(state => state.execution);
  
  const handleRunCode = useCallback(() => {
    if (!isExecuting) {
      dispatch(executeCodeThunk({ language, code: mainCode }));
    }
  }, [dispatch, isExecuting, language, mainCode]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    socketRef.current = io(SOCKET_SERVER_URL);

    socketRef.current.on('connect', () => {
      setMySocketId(socketRef.current.id);
      socketRef.current.emit('room:join', { roomId, username });
    });

    socketRef.current.on('room:state', (state) => {
      dispatch(setRoomState(state));
      const me = state.participants.find(p => p.socketId === socketRef.current.id);
      if (me) {
        dispatch(setRoomContext({ roomId, role: me.role }));
      }
    });

    socketRef.current.on('code:sync', ({ delta }) => {
      dispatch(updateMainCode(delta));
    });

    socketRef.current.on('scratchpad:sync', ({ userId, delta }) => {
      dispatch(updateScratchpadCode({ userId, delta }));
    });

    socketRef.current.on('ghost:receive', (proposal) => {
      dispatch(receiveProposal(proposal));
    });

    socketRef.current.on('role:request-incoming', ({ requesterId, requesterName }) => {
      setRoleRequest({ requesterId, requesterName });
    });

    socketRef.current.on('ghost:rejected', ({ proposerName }) => {
      showToast(`Your merge proposal was rejected.`, 'error');
    });

    socketRef.current.on('ghost:accepted', ({ proposerName }) => {
      showToast(`Your merge proposal was accepted!`, 'success');
    });

    socketRef.current.on('error', ({ message }) => {
      showToast(message, 'error');
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [roomId, username, dispatch]);

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleRequestControl = () => {
    if (socketRef.current) {
      socketRef.current.emit('role:request', { roomId });
      showToast('Control request sent to driver.', 'info');
    }
  };

  const handleApproveSwap = () => {
    if (socketRef.current && roleRequest) {
      socketRef.current.emit('role:approve', { roomId, newDriverId: roleRequest.requesterId });
      setRoleRequest(null);
    }
  };

  const handleDenySwap = () => {
    setRoleRequest(null);
  };

  const activeScratchpadParticipant = participants.find(p => p.socketId === activeScratchpadId);
  const fileExtMap = { javascript: 'js', python: 'py', java: 'java', c: 'c', cpp: 'cpp' };

  return (
    <div className={styles.roomLayoutContainer}>
      {/* Toast Notifications */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            className={`${styles.toast} ${styles[`toast_${toast.type}`]}`}
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            transition={{ duration: 0.2 }}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Role Swap Request Modal */}
      <AnimatePresence>
        {roleRequest && myRole === 'driver' && (
          <motion.div 
            className={styles.swapOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className={styles.swapModal}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 20 }}
            >
              <p><strong>{roleRequest.requesterName}</strong> is requesting driver control.</p>
              <div className={styles.swapActions}>
                <button className={styles.btnApprove} onClick={handleApproveSwap}>Approve</button>
                <button className={styles.btnDeny} onClick={handleDenySwap}>Deny</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.brand} onClick={() => navigate('/')} style={{cursor:'pointer'}}>CodeCollab</span>
          <span className={styles.roomName}>Room: {roomId}</span>
          <span className={styles.badge}>{myRole || '...'}</span>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.participantsList} title={participants.map(p => `${p.username} (${p.role})`).join(', ')}>
            {participants.map((p, i) => (
               <span 
                 key={p.socketId} 
                 className={`${styles.userDot} ${p.role === 'driver' ? styles.driverDot : ''}`} 
                 title={`${p.username} (${p.role})`}
               ></span>
            ))}
            <span className={styles.participantCount}>{participants.length}</span>
          </div>
          <select 
            className={styles.langSelect} 
            value={language} 
            onChange={(e) => dispatch(setLanguage(e.target.value))}
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
            <option value="c">C</option>
            <option value="java">Java</option>
          </select>
          {myRole === 'navigator' && (
            <button className="btn-ghost" onClick={handleRequestControl}>
              🔄 Request Control
            </button>
          )}
          <button 
            className="btn-primary" 
            onClick={handleRunCode} 
            disabled={isExecuting}
            title="Run Code (Ctrl+Enter)"
          >
            {isExecuting ? '⏳ Running...' : '▶ Run'}
          </button>
          <button className="btn-ghost" onClick={handleShare}>
            {copied ? '✓ Copied!' : '📋 Share'}
          </button>
        </div>
      </header>

      <main className={styles.mainGrid}>
        <section className={styles.mainEditorPanel}>
          <div className={styles.panelHeader}>
            <span>main.{fileExtMap[language] || 'js'}</span>
            <span className={styles.shortcutHint}>Ctrl+Enter to run</span>
          </div>
          <div className={styles.editorWrapper}>
            <EditorComponent 
              socket={socketRef.current} 
              roomId={roomId} 
              isDriver={myRole === 'driver'} 
              isScratchpad={false}
              onRunCode={handleRunCode}
            />
          </div>
        </section>

        <section className={styles.sidePanel}>
          <div className={styles.scratchpadPanel}>
            <ScratchpadTabBar 
              participants={participants} 
              socketId={mySocketId} 
              socket={socketRef.current}
              roomId={roomId}
            />
             <div className={styles.editorWrapper}>
               <EditorComponent 
                  socket={socketRef.current}
                  roomId={roomId}
                  isDriver={activeScratchpadId === mySocketId}
                  isScratchpad={true}
                  overrideCode={activeScratchpadParticipant ? activeScratchpadParticipant.scratchpadCode : ''}
                  targetSocketId={activeScratchpadId}
                />
            </div>
          </div>
          <div className={styles.terminalPanel}>
            <div className={styles.panelHeader}>
              <span>Terminal</span>
            </div>
            <Terminal />
          </div>
        </section>
      </main>
      
      <footer className={styles.statusBar}>
        <span>CodeCollab • {myRole === 'driver' ? '✏️ Driver' : '👁️ Navigator'} • {username}</span>
        <span>{participants.length} online • {language}</span>
      </footer>

      {myRole === 'driver' && <GhostMergeModal socket={socketRef.current} roomId={roomId} />}
    </div>
  );
};
