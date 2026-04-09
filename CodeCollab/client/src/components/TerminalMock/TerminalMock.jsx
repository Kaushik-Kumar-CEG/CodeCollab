import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import styles from './TerminalMock.module.css';

export const TerminalMock = () => {
  const { logs } = useSelector(state => state.activityLog);

  const defaultLines = [
    { id: 'default-1', text: '$ codecollab --init', type: 'command', timestamp: '' },
    { id: 'default-2', text: '✓ connected to codecollab server', type: 'success', timestamp: '' },
    { id: 'default-3', text: 'Waiting for activity...', type: 'info', timestamp: '' },
  ];

  const displayLines = logs.length > 0
    ? [
      ...defaultLines,
      ...logs.map(log => ({
        id: log.id,
        text: `[${log.timestamp}] ${log.text}`,
        type: log.type
      }))
    ]
    : defaultLines;

  return (
    <div className={styles.terminal}>
      <div className={styles.header}>
        <div className={styles.dots}>
          <span className={styles.dotRed}></span>
          <span className={styles.dotYellow}></span>
          <span className={styles.dotGreen}></span>
        </div>
        <div className={styles.title}>codecollab — activity log</div>
        <div className={styles.liveBadge}><span className={styles.liveDot}></span>LIVE</div>
      </div>
      <div className={styles.body}>
        {displayLines.map((line) => (
          <motion.div
            key={line.id}
            className={`${styles.line} ${styles[line.type] || ''}`}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {line.text}
          </motion.div>
        ))}
      </div>
    </div>
  );
};
