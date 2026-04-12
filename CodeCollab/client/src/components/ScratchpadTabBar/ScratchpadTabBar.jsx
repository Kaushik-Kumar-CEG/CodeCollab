import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveScratchpadUser } from '../../store/roomSlice';
import styles from './ScratchpadTabBar.module.css';

const ScratchpadTabBar = ({ participants, username, socket, roomId, selectionRange, showToast }) => {
  const dispatch = useDispatch();
  const activeUser = useSelector(state => state.room.activeScratchpadUser);
  const mainCode = useSelector(state => state.room.mainCode);

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
                let codeDiff = myParticipant.scratchpadCode;

                if (selectionRange && typeof selectionRange.lineStart === 'number') {
                  const mLines = mainCode.split('\n');
                  const startIdx = selectionRange.lineStart - 1;
                  const endIdx = selectionRange.lineEnd;

                  // splices the entire scratchpad text as a single string replacement for those lines.
                  // wait, splice requires an array of lines to insert, or we can just array splice with the joined string?
                  // If we insert codeDiff as a single item, mLines will have a string with \n in it. That's fine because join('\n') will just join it.
                  mLines.splice(startIdx, endIdx - startIdx, myParticipant.scratchpadCode);
                  codeDiff = mLines.join('\n');
                }

                socket.emit('ghost:propose', { roomId, codeDiff });
                showToast(selectionRange ? `Proposal merging scratchpad into lines ${selectionRange.lineStart}-${selectionRange.lineEnd} sent!` : 'Full Merge Proposal sent to Driver!', 'success');
              }
            } else {
              showToast('You can only propose code from your own scratchpad!', 'error');
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
