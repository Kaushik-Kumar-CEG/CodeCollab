import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import styles from './TerminalMock.module.css';

export const TerminalMock = () => {
  const [lines, setLines] = useState([
    { id: 1, text: 'user@dev:~/project$ codecollab start --mode pair', type: 'command' },
  ]);

  useEffect(() => {
    // Sequence of mocked output
    const sequence = [
      { delay: 1000, text: '🧠 Initializing CodeCollab workspace...', type: 'info' },
      { delay: 2000, text: '⚡ Connecting to real-time sync server...', type: 'info' },
      { delay: 2500, text: '✓ Room created: https://codecollab.dev/room/d8fj3', type: 'success' },
      { delay: 3500, text: 'user@dev:~/project$ ', type: 'prompt' }
    ];

    let currentDelay = 0;
    const timeouts = sequence.map((item, index) => {
      currentDelay += item.delay;
      return setTimeout(() => {
        setLines(prev => [...prev, { id: index + 2, text: item.text, type: item.type }]);
      }, currentDelay);
    });

    return () => timeouts.forEach(clearTimeout);
  }, []);

  return (
    <div className={styles.terminal}>
      <div className={styles.header}>
        <div className={styles.dots}>
          <span className={styles.dotRed}></span>
          <span className={styles.dotYellow}></span>
          <span className={styles.dotGreen}></span>
        </div>
        <div className={styles.title}>codecollab-terminal</div>
        <div className={styles.liveBadge}><span className={styles.liveDot}></span>LIVE</div>
      </div>
      <div className={styles.body}>
        {lines.map((line) => (
          <motion.div 
            key={line.id} 
            className={styles.line}
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
