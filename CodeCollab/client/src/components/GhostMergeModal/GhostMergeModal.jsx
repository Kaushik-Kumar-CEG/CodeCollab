import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DiffEditor } from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import { resolveProposal, updateMainCode } from '../../store/roomSlice';
import styles from './GhostMergeModal.module.css';

const GhostMergeModal = ({ socket, roomId }) => {
  const dispatch = useDispatch();
  const { pendingProposals, mainCode } = useSelector(state => state.room);
  const selectedLanguage = useSelector(state => state.execution.language);

  if (!pendingProposals || pendingProposals.length === 0) return null;

  const currentProposal = pendingProposals[0];

  const handleAccept = () => {
    dispatch(updateMainCode(currentProposal.codeDiff));
    if (socket) {
      socket.emit('code:delta', { roomId, delta: currentProposal.codeDiff });
      socket.emit('ghost:accepted', { roomId });
    }
    dispatch(resolveProposal(currentProposal.senderUsername));
  };

  const handleReject = () => {
    if (socket) {
      socket.emit('ghost:rejected', { roomId });
    }
    dispatch(resolveProposal(currentProposal.senderUsername));
  };

  return (
    <AnimatePresence>
      <motion.div
        className={styles.modalOverlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className={styles.modalContent}
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          <div className={styles.modalHeader}>
            <h3>Merge Proposal from <span>{currentProposal.senderUsername}</span></h3>
            <div className={styles.headerRight}>
              {pendingProposals.length > 1 && (
                <span className={styles.queueBadge}>{pendingProposals.length} pending</span>
              )}
              <button className={styles.closeBtn} onClick={handleReject}>&times;</button>
            </div>
          </div>
          <div className={styles.diffEditorWrapper}>
            <DiffEditor
              height="100%"
              theme="vs-dark"
              language={selectedLanguage === 'c' || selectedLanguage === 'cpp' ? 'cpp' : selectedLanguage}
              original={mainCode}
              modified={currentProposal.codeDiff}
              options={{
                readOnly: true,
                minimap: { enabled: false },
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 14,
              }}
            />
          </div>
          <div className={styles.modalActions}>
            <button className={styles.rejectBtn} onClick={handleReject}>✕ Reject</button>
            <button className={styles.acceptBtn} onClick={handleAccept}>✓ Accept Merge</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GhostMergeModal;
