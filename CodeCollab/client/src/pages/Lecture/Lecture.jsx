import React, { useRef, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from '../../components/Navbar/Navbar';
import EditorComponent from '../../components/Editor/Editor';
import Terminal from '../../components/Terminal/Terminal';
import {
  setVideoProgress,
  setPlaying,
  enterSandbox,
  updateSandboxCode,
  resumeLecture
} from '../../store/lectureSlice';
import { executeCodeThunk, setLanguage } from '../../store/executionSlice';
import { DUMMY_LECTURE } from '../../utils/dummyLectureData';
import styles from './Lecture.module.css';

export const Lecture = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const { isPlaying, isSandboxMode, sandboxCode, playbackCode } = useSelector(state => state.lecture);
  const { isExecuting } = useSelector(state => state.execution);

  useEffect(() => {
    dispatch(setLanguage(DUMMY_LECTURE.baseLanguage));
  }, [dispatch]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.play().catch(() => { });
    } else {
      video.pause();
    }
  }, [isPlaying]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      dispatch(setVideoProgress(videoRef.current.currentTime));
    }
  };

  const handlePlay = () => dispatch(setPlaying(true));
  const handlePause = () => dispatch(setPlaying(false));

  const handleEditorChange = (value) => {
    dispatch(updateSandboxCode(value));
  };

  const codeToDisplay = isSandboxMode ? sandboxCode : playbackCode;

  const handleRunCode = useCallback(() => {
    if (!isSandboxMode) dispatch(enterSandbox());
    if (!isExecuting) {
      dispatch(executeCodeThunk({ language: DUMMY_LECTURE.baseLanguage, code: codeToDisplay }));
    }
  }, [dispatch, isSandboxMode, isExecuting, codeToDisplay]);

  const handleResumeSync = () => {
    dispatch(resumeLecture());
  };

  const handleSeek = () => {
    if (videoRef.current) {
      dispatch(setVideoProgress(videoRef.current.currentTime));
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <Navbar />

      {/* Sandbox Banner */}
      {isSandboxMode && (
        <motion.div
          className={styles.sandboxBanner}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <span>⚠️ <strong>SANDBOX MODE</strong> — Video paused. You are exploring freely.</span>
          <button className={styles.resumeBtn} onClick={handleResumeSync}>
            ↩ Resume Lecture
          </button>
        </motion.div>
      )}

      <div className={styles.splitView}>
        {/* LEFT: Video Player */}
        <section className={styles.videoSection}>
          <div className={styles.playerWrapper}>
            <video
              ref={videoRef}
              src={DUMMY_LECTURE.videoUrl}
              controls
              onTimeUpdate={handleTimeUpdate}
              onPlay={handlePlay}
              onPause={handlePause}
              onSeeked={handleSeek}
              className={styles.videoElement}
            />
          </div>

          <div className={styles.lectureDetails}>
            <h2>{DUMMY_LECTURE.title}</h2>
            <span className={styles.lectureTag}>Interactive Learning Mode</span>
            <p>Code auto-syncs with the video timeline. Edit the code to fork into a sandbox.
              Click "Resume Lecture" to snap back to the instructor's timeline.</p>
            <div className={styles.lectureInfo}>
              <span>Language: {DUMMY_LECTURE.baseLanguage}</span>
              <span>•</span>
              <span>{DUMMY_LECTURE.timeline.length} code snapshots</span>
            </div>
          </div>
        </section>

        {/* RIGHT: Editor + Terminal */}
        <section className={styles.codeSection}>
          <div className={styles.ideHeader}>
            <span>{DUMMY_LECTURE.baseLanguage} Sandbox</span>
            <div className={styles.ideActions}>
              <span className={styles.shortcutHint}>Ctrl+Enter to run</span>
              <button
                className={styles.runBtn}
                onClick={handleRunCode}
                disabled={isExecuting}
              >
                {isExecuting ? '⏳ Running...' : '▶ Run Code'}
              </button>
            </div>
          </div>
          <div className={styles.editorWrapper}>
            <EditorComponent
              overrideCode={codeToDisplay}
              isScratchpad={true}
              isDriver={true}
              onCodeChange={handleEditorChange}
              onRunCode={handleRunCode}
            />
          </div>
          <div className={styles.terminalWrapper}>
            <div className={styles.terminalHeader}>Terminal</div>
            <Terminal />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Lecture;
