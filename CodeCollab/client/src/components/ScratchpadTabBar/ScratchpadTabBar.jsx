import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveScratchpadId } from '../../store/roomSlice';
import styles from './ScratchpadTabBar.module.css';

const ScratchpadTabBar = ({ participants, socketId, socket, roomId }) => {
  const dispatch = useDispatch();
  const activeId = useSelector(state => state.room.activeScratchpadId);

  // Default to selecting our own scratchpad if none selected
  React.useEffect(() => {
    if (!activeId && socketId) {
      dispatch(setActiveScratchpadId(socketId));
    }
  }, [activeId, socketId, dispatch]);

  return (
    <div className={styles.tabBarContainer}>
      <div className={styles.tabsScrollArea}>
        {participants.map(p => {
          const isActive = p.socketId === activeId;
          const isMe = p.socketId === socketId;
          const badgeRoles = isMe ? '(You)' : `(${p.role})`;
          
          return (
            <div 
              key={p.socketId} 
              className={`${styles.tab} ${isActive ? styles.activeTab : ''}`}
              onClick={() => dispatch(setActiveScratchpadId(p.socketId))}
            >
              <span className={styles.userDot}></span>
              <span className={styles.tabName}>{p.username} <small>{badgeRoles}</small></span>
              <span className={styles.closeBtn}>&times;</span>
            </div>
          );
        })}
        {participants.length === 0 && <div className={styles.emptyTab}>Waiting for users...</div>}
      </div>
      <div className={styles.tabActions}>
        <button 
          className={styles.actionBtn} 
          title="Propose Ghost Merge (Diff)"
          onClick={() => {
            if (activeId === socketId && socket) {
              const myParticipant = participants.find(p => p.socketId === socketId);
              if (myParticipant) {
                socket.emit('ghost:propose', { roomId, codeDiff: myParticipant.scratchpadCode });
                alert('Proposal sent to Driver!');
              }
            } else {
              alert('You can only propose code from your own scratchpad!');
            }
          }}
        >
          Propose M
        </button>
      </div>
    </div>
  );
};

export default ScratchpadTabBar;
