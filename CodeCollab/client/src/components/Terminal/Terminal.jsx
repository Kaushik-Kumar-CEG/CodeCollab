import React from 'react';
import { useSelector } from 'react-redux';
import styles from './Terminal.module.css';

const Terminal = () => {
  const { stdout, stderr, isExecuting } = useSelector((state) => state.execution);

  return (
    <div className={styles.terminalContainer}>
      <div className={styles.outputArea}>
        {isExecuting ? (
          <div className={styles.loading}>
            <span className={styles.spinner}></span>
            <span style={{marginLeft: '8px', color: 'var(--text-secondary)'}}>Executing...</span>
          </div>
        ) : (
          <>
            {stdout && <pre className={styles.stdout}>{stdout}</pre>}
            {stderr && <pre className={styles.stderr}>{stderr}</pre>}
            {!stdout && !stderr && (
              <div className={styles.placeholder}>
                <span style={{ color: 'var(--accent-success)' }}>$</span> Output will appear here...
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Terminal;
