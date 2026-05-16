import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from '../../components/Navbar/Navbar';
import { TerminalMock } from '../../components/TerminalMock/TerminalMock';
import styles from './Home.module.css';

const ASCII_ART = ` ██████╗ ██████╗ ██████╗ ███████╗     ██████╗ ██████╗ ██╗     ██╗      █████╗ ██████╗ 
██╔════╝██╔═══██╗██╔══██╗██╔════╝    ██╔════╝██╔═══██╗██║     ██║     ██╔══██╗██╔══██╗
██║     ██║   ██║██║  ██║█████╗      ██║     ██║   ██║██║     ██║     ███████║██████╔╝
██║     ██║   ██║██║  ██║██╔══╝      ██║     ██║   ██║██║     ██║     ██╔══██║██╔══██╗
╚██████╗╚██████╔╝██████╔╝███████╗    ╚██████╗╚██████╔╝███████╗███████╗██║  ██║██████╔╝
 ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝     ╚═════╝ ╚═════╝ ╚══════╝╚══════╝╚═╝  ╚═╝╚═════╝`;

export const Home = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <Navbar />

      <main className={styles.hero}>
        <motion.pre
          className={styles.asciiArt}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          {ASCII_ART}
        </motion.pre>

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

        {/* Terminal with Real Activity Logs */}
        <motion.div
          className={styles.terminalContainer}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.45 }}
        >
          <TerminalMock />
        </motion.div>
      </main>
    </div>
  );
};
