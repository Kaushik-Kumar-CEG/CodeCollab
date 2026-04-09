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
import { addLog } from '../../store/activityLogSlice';
import { Navbar } from '../../components/Navbar/Navbar';
import EditorComponent from '../../components/Editor/Editor';
import ScratchpadTabBar from '../../components/ScratchpadTabBar/ScratchpadTabBar';
import Terminal from '../../components/Terminal/Terminal';
import GhostMergeModal from '../../components/GhostMergeModal/GhostMergeModal';
import CommentPanel from '../../components/Comments/CommentPanel';
import styles from './Room.module.css';

const SOCKET_SERVER_URL = "http://localhost:5001";

export const Room = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const socketRef = useRef(null);

  // Username: prefer location state, then sessionStorage, then random
  const [username] = React.useState(() => {
    return location.state?.username
      || sessionStorage.getItem('cc_username')
      || `User_${Math.floor(Math.random() * 1000)}`;
  });

  const [roleRequest, setRoleRequest] = React.useState(null);
  const [copied, setCopied] = React.useState(false);
  const [toast, setToast] = React.useState(null);
  const [commentOpen, setCommentOpen] = React.useState(false);
  const [selectionRange, setSelectionRange] = React.useState(null);

  const { myRole, participants, activeScratchpadUser, mainCode, currentDriverUsername } = useSelector(state => state.room);
  const { language, isExecuting } = useSelector(state => state.execution);
  const commentCount = useSelector(state => state.comment.comments.length);

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
      socketRef.current.emit('room:join', { roomId, username });
      dispatch(addLog({ text: `${username} connected to room ${roomId}`, type: 'log' }));
    });

    socketRef.current.on('room:state', (state) => {
      dispatch(setRoomState(state));
      // Find my role by username
      const me = state.participants.find(p => p.username === username);
      if (me) {
        dispatch(setRoomContext({ roomId, role: me.role }));
      }
    });

    socketRef.current.on('code:sync', ({ delta }) => {
      dispatch(updateMainCode(delta));
    });

    socketRef.current.on('scratchpad:sync', ({ username: scratchUser, delta }) => {
      dispatch(updateScratchpadCode({ username: scratchUser, delta }));
    });

    socketRef.current.on('ghost:receive', (proposal) => {
      dispatch(receiveProposal(proposal));
    });

    socketRef.current.on('role:request-incoming', ({ requesterUsername }) => {
      setRoleRequest({ requesterUsername });
    });

    socketRef.current.on('ghost:rejected', () => {
      showToast('Your merge proposal was rejected.', 'error');
    });

    socketRef.current.on('ghost:accepted', () => {
      showToast('Your merge proposal was accepted!', 'success');
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
      socketRef.current.emit('role:approve', { roomId, newDriverUsername: roleRequest.requesterUsername });
      setRoleRequest(null);
    }
  };

  const handleDenySwap = () => {
    setRoleRequest(null);
  };

  const handleAddComment = () => {
    if (!selectionRange) {
      setSelectionRange({ lineStart: 1, lineEnd: 1 });
    }
    setCommentOpen(true);
  };

  const activeScratchpadParticipant = participants.find(p => p.username === activeScratchpadUser);
  const fileExtMap = { javascript: 'js', python: 'py', java: 'java', c: 'c', cpp: 'cpp' };
  const isDriver = myRole === 'driver';

  return (
    <div className={styles.roomLayoutContainer}>
      {/* Toast */}
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
        {roleRequest && isDriver && (
          <motion.div className={styles.swapOverlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className={styles.swapModal} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: 'spring', damping: 20 }}>
              <p><strong>{roleRequest.requesterUsername}</strong> is requesting driver control.</p>
              <div className={styles.swapActions}>
                <button className={styles.btnApprove} onClick={handleApproveSwap}>Approve</button>
                <button className={styles.btnDeny} onClick={handleDenySwap}>Deny</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navbar */}
      <Navbar />

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <span className={styles.roomLabel}>Room: <strong>{roomId}</strong></span>
          <span className={styles.roleBadge} data-role={myRole}>{isDriver ? '✏️ Driver' : '👁️ Navigator'}</span>
          <span className={styles.userLabel}>{username}</span>
        </div>
        <div className={styles.toolbarCenter}>
          <div className={styles.participantDots}>
            {participants.map(p => (
              <span
                key={p.username}
                className={`${styles.userDot} ${p.username === currentDriverUsername ? styles.driverDot : ''}`}
                title={`${p.username} (${p.role})`}
              ></span>
            ))}
            <span className={styles.participantCount}>{participants.length} online</span>
          </div>
        </div>
        <div className={styles.toolbarRight}>
          <select className={styles.langSelect} value={language} onChange={(e) => dispatch(setLanguage(e.target.value))}>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
            <option value="c">C</option>
            <option value="java">Java</option>
          </select>
          {!isDriver && (
            <button className={styles.toolBtn} onClick={handleRequestControl}>🔄 Request Control</button>
          )}
          <button className={styles.runBtn} onClick={handleRunCode} disabled={isExecuting}>
            {isExecuting ? '⏳ Running...' : '▶ Run'}
          </button>
          <button className={styles.toolBtn} onClick={handleAddComment}>💬</button>
          <button className={styles.toolBtn} onClick={handleShare}>{copied ? '✓ Copied!' : '📋 Share'}</button>
        </div>
      </div>

      {/* Main Editor Area */}
      <main className={styles.mainGrid}>
        <section className={styles.mainEditorPanel}>
          <div className={styles.panelTab}>
            <span className={styles.tabIcon}>📄</span> main.{fileExtMap[language] || 'js'}
            {isDriver && <span className={styles.editableBadge}>editable</span>}
            {!isDriver && <span className={styles.readonlyBadge}>read-only</span>}
          </div>
          <div className={styles.editorWrapper}>
            <EditorComponent
              socket={socketRef.current}
              roomId={roomId}
              isDriver={isDriver}
              isScratchpad={false}
              onRunCode={handleRunCode}
              onSelectionChange={(range) => setSelectionRange(range)}
            />
            <CommentPanel
              socket={socketRef.current}
              roomId={roomId}
              username={username}
              isOpen={commentOpen}
              onClose={() => setCommentOpen(false)}
              selectionRange={selectionRange}
            />
          </div>
        </section>

        <section className={styles.sidePanel}>
          <div className={styles.scratchpadPanel}>
            <ScratchpadTabBar
              participants={participants}
              username={username}
              socket={socketRef.current}
              roomId={roomId}
            />
            <div className={styles.editorWrapper}>
              <EditorComponent
                socket={socketRef.current}
                roomId={roomId}
                isDriver={activeScratchpadUser === username}
                isScratchpad={true}
                overrideCode={activeScratchpadParticipant ? activeScratchpadParticipant.scratchpadCode : ''}
                targetSocketId={activeScratchpadUser}
              />
            </div>
          </div>
          <div className={styles.terminalPanel}>
            <div className={styles.panelTab}>
              <span className={styles.tabIcon}>⬛</span> Terminal
            </div>
            <Terminal />
          </div>
        </section>
      </main>

      {/* Status Bar */}
      <footer className={styles.statusBar}>
        <span>{isDriver ? '✏️ Driver' : '👁️ Navigator'} • {username}</span>
        <span>{participants.length} online • {language}</span>
      </footer>

      {isDriver && <GhostMergeModal socket={socketRef.current} roomId={roomId} />}
    </div>
  );
};
