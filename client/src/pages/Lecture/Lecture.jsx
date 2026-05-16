import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from '../../components/Navbar/Navbar';
import EditorComponent from '../../components/Editor/Editor';
import Terminal from '../../components/Terminal/Terminal';
import {
  fetchLecture,
  setVideoProgress,
  setPlaying,
  enterSandbox,
  updateSandboxCode,
  resumeLecture,
  cleanupLecture
} from '../../store/lectureSlice';
import { executeCodeThunk, setLanguage } from '../../store/executionSlice';
import styles from './Lecture.module.css';

export const Lecture = () => {
  const { lectureId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const timerRef = useRef(null);

  const { currentLecture, loading, isPlaying, currentTime, isSandboxMode, sandboxCode, playbackCode } = useSelector(state => state.lecture);
  const { isExecuting } = useSelector(state => state.execution);

  useEffect(() => {
    dispatch(fetchLecture(lectureId));
    return () => dispatch(cleanupLecture());
  }, [dispatch, lectureId]);

  useEffect(() => {
    if (currentLecture) {
      dispatch(setLanguage(currentLecture.language || currentLecture.baseLanguage));
    }
  }, [dispatch, currentLecture]);

  const hasVideo = !!currentLecture?.videoUrl;

  const maxTime = useMemo(() => {
    if (!currentLecture?.timeline || currentLecture.timeline.length === 0) return 0;
    const lastEvent = currentLecture.timeline[currentLecture.timeline.length - 1];
    const isMs = lastEvent.timestamp > 10000 || (currentLecture.timeline.length > 1 && currentLecture.timeline[1].timestamp > 1000);
    return isMs ? lastEvent.timestamp / 1000 : (lastEvent.time || lastEvent.timestamp);
  }, [currentLecture]);

  useEffect(() => {
    if (!hasVideo && isPlaying && currentTime >= maxTime && maxTime > 0) {
      dispatch(setPlaying(false));
      dispatch(setVideoProgress(maxTime));
    }
  }, [currentTime, maxTime, isPlaying, hasVideo, dispatch]);

  useEffect(() => {
    if (hasVideo) {
      const video = videoRef.current;
      if (!video) return;
      if (isPlaying) {
        video.play().catch(() => { });
      } else {
        video.pause();
      }
    } else {
      if (isPlaying && !hasVideo && currentTime < maxTime) {
        timerRef.current = setInterval(() => {
          dispatch(setVideoProgress(currentTime + 0.1));
        }, 100);
      } else {
        clearInterval(timerRef.current);
      }
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying, hasVideo, currentTime, maxTime, dispatch]);

  const handleTimeUpdate = () => {
    if (videoRef.current && hasVideo) {
      dispatch(setVideoProgress(videoRef.current.currentTime));
    }
  };

  const handlePlay = () => dispatch(setPlaying(true));
  const handlePause = () => dispatch(setPlaying(false));
  const handleTogglePlayback = () => {
    if (!isPlaying && currentTime >= maxTime && maxTime > 0) {
      dispatch(setVideoProgress(0)); // Restart if finished
    }
    dispatch(setPlaying(!isPlaying));
  };

  const handleScrubberChange = (e) => {
    const val = parseFloat(e.target.value);
    dispatch(setVideoProgress(val));
    if (videoRef.current && hasVideo) {
      videoRef.current.currentTime = val;
    }
  };

  const handleEditorChange = (value) => {
    dispatch(updateSandboxCode(value));
  };

  const codeToDisplay = isSandboxMode ? sandboxCode : playbackCode;

  const handleRunCode = useCallback(() => {
    if (!isSandboxMode) dispatch(enterSandbox());
    if (!isExecuting) {
      dispatch(executeCodeThunk({ language: currentLecture?.language || currentLecture?.baseLanguage, code: codeToDisplay }));
    }
  }, [dispatch, isSandboxMode, isExecuting, codeToDisplay, currentLecture]);

  const handleResumeSync = () => {
    dispatch(resumeLecture());
  };

  const handleSeek = () => {
    if (videoRef.current && hasVideo) {
      dispatch(setVideoProgress(videoRef.current.currentTime));
    }
  };

  if (loading || !currentLecture) {
    return <div className={styles.container}><Navbar /><div className={styles.loading}>Loading lecture...</div></div>;
  }

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className={styles.container}>
      <Navbar />

      {isSandboxMode && (
        <motion.div
          className={styles.sandboxBanner}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <span>⚠️ <strong>SANDBOX MODE</strong> — Playback paused. You are exploring freely.</span>
          <button className={styles.resumeBtn} onClick={handleResumeSync}>
            ↩ Resume Lecture
          </button>
        </motion.div>
      )}

      {/* Floating PIP player for Video-less interactive lectures */}
      {!hasVideo && (
        <div className={styles.floatingPlayer}>
          <div className={styles.floatingHeader}>
            <span className={styles.floatingTitle}>{currentLecture.title}</span>
            <span className={styles.floatingAuthor}>by {currentLecture.instructorName}</span>
          </div>
          <div className={styles.floatingControls}>
            <button className={styles.playBtn} onClick={handleTogglePlayback}>
              {isPlaying ? '⏸ Pause' : (currentTime >= maxTime && maxTime > 0) ? '🔄 Replay' : '▶ Play'}
            </button>
            <input
              type="range"
              min="0"
              max={maxTime || 100}
              step="0.1"
              value={currentTime}
              onChange={handleScrubberChange}
              className={styles.scrubber}
            />
            <span className={styles.playbackTime}>{formatTime(currentTime)} / {formatTime(maxTime)}</span>
          </div>
        </div>
      )}

      <div className={styles.splitView}>
        {hasVideo && (
          <section className={styles.videoSection}>
            <div className={styles.playerWrapper}>
              <video
                ref={videoRef}
                src={currentLecture.videoUrl}
                controls
                onTimeUpdate={handleTimeUpdate}
                onPlay={handlePlay}
                onPause={handlePause}
                onSeeked={handleSeek}
                className={styles.videoElement}
              />
            </div>

            <div className={styles.lectureDetails}>
              <h2>{currentLecture.title}</h2>
              <span className={styles.lectureTag}>Interactive Learning Mode</span>
              <p>{currentLecture.description || 'Code auto-syncs with the playback timeline. Edit the code to fork into a sandbox.'}</p>
              <div className={styles.lectureInfo}>
                <span>Language: {currentLecture.language || currentLecture.baseLanguage}</span>
                <span>•</span>
                <span>{currentLecture.timeline?.length || 0} code snapshots</span>
                <span>•</span>
                <span>by {currentLecture.instructorName}</span>
              </div>
            </div>
          </section>
        )}

        <section className={hasVideo ? styles.codeSection : styles.codeSectionMaximized}>
          <div className={styles.splitArea}>
            {/* LEFT SIDEPANEL: EDITOR */}
            <div className={styles.editorArea}>
              <div className={styles.ideHeader}>
                <span>{currentLecture.language || currentLecture.baseLanguage} Sandbox</span>
                <span className={styles.shortcutHint}>Ctrl+Enter to run</span>
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
            </div>

            {/* RIGHT SIDEPANEL: TERMINAL */}
            <div className={styles.consoleSidebar}>
              <div className={styles.consoleHeader}>
                <span>Terminal</span>
                <div className={styles.terminalActions}>
                  <button
                    className={styles.btnRunInline}
                    onClick={handleRunCode}
                    disabled={isExecuting}
                  >
                    {isExecuting ? '⏳ Running...' : '▶ Run'}
                  </button>
                </div>
              </div>
              <div className={styles.terminalWrapper}>
                <Terminal />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Lecture;
