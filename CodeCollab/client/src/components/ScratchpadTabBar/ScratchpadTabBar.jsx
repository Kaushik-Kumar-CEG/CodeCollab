import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveScratchpadUser } from '../../store/roomSlice';
import styles from './ScratchpadTabBar.module.css';

const ScratchpadTabBar = ({ participants, username, socket, roomId }) => {
  const dispatch = useDispatch();
  const activeUser = useSelector(state => state.room.activeScratchpadUser);

  // Default to our own scratchpad
  React.useEffect(() => {
    if (!activeUser && username) {
      dispatch(setActiveScratchpadUser(username));
    }
  }, [activeUser, username, dispatch]);

  return (
    <div className={styles.tabBarContainer}>
      <div className={styles.tabsScrollArea}>
        {participants.map(p => {
          const isActive = p.username === activeUser;
          const isMe = p.username === username;
          const badgeRoles = isMe ? '(You)' : `(${p.role})`;

          return (
            <div
              key={p.username}
              className={`${styles.tab} ${isActive ? styles.activeTab : ''}`}
              onClick={() => dispatch(setActiveScratchpadUser(p.username))}
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
            if (activeUser === username && socket) {
              const myParticipant = participants.find(p => p.username === username);
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
