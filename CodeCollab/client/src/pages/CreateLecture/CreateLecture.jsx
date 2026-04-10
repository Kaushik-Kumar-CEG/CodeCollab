import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Editor from '@monaco-editor/react';
import { Navbar } from '../../components/Navbar/Navbar';
import Terminal from '../../components/Terminal/Terminal';
import { executeCodeThunk, terminateExecutionThunk } from '../../store/executionSlice';
import styles from './CreateLecture.module.css';

const API_URL = 'http://localhost:5001/api';

export const CreateLecture = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { username, isLoggedIn } = useSelector(state => state.auth);
    const { isExecuting, result, error: execError } = useSelector(state => state.execution);

    const [showSetupModal, setShowSetupModal] = useState(true);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [language, setLanguage] = useState('javascript');

    // Default language comment based on language
    const getCommentPrefix = (lang) => ['python'].includes(lang) ? '#' : '//';
    const [code, setCode] = useState('');

    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [timeElapsed, setTimeElapsed] = useState(0); // in milliseconds
    const [timeline, setTimeline] = useState([]);
    const [isPublishing, setIsPublishing] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);

    const timerRef = useRef(null);
    const lastCodeRef = useRef(code);

    useEffect(() => {
        if (!isLoggedIn) {
            alert('Please log in to create a lecture.');
            navigate('/learning');
        }
    }, [isLoggedIn, navigate]);

    useEffect(() => {
        if (showSetupModal) {
            setCode(`${getCommentPrefix(language)} Start typing your lecture here...\n`);
        }
    }, [language, showSetupModal]);

    // Timer logic
    useEffect(() => {
        if (isRecording && !isPaused) {
            timerRef.current = setInterval(() => {
                setTimeElapsed(prev => prev + 100);
            }, 100);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [isRecording, isPaused]);

    // Record snapshots on code change
    const handleEditorChange = (value) => {
        setCode(value);
        if (isRecording && !isPaused) {
            // Record only if it meaningfully changed
            if (value !== lastCodeRef.current) {
                setTimeline(prev => [...prev, { timestamp: timeElapsed, codeSnapshot: value }]);
                lastCodeRef.current = value;
            }
        }
    };

    const handleStartRecording = () => {
        setIsRecording(true);
        setIsPaused(false);
        // Push initial state
        setTimeline([{ timestamp: 0, codeSnapshot: code }]);
        lastCodeRef.current = code;
    };

    const handlePauseToggle = () => {
        setIsPaused(prev => !prev);
    };

    const handleRunCode = () => {
        dispatch(executeCodeThunk({ language, code }));
    };

    const handleTerminate = () => {
        dispatch(terminateExecutionThunk());
    };

    const handleStopAndPublish = async () => {
        setIsRecording(false);
        setIsPaused(false);
        clearInterval(timerRef.current);
        setIsPublishing(true);

        try {
            const payload = {
                title,
                description,
                author: username,
                language,
                codeTimeline: timeline
            };

            const res = await fetch(`${API_URL}/lectures`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (res.ok) {
                setShowSuccessPopup(true);
                setTimeout(() => {
                    navigate('/learning');
                }, 2000);
            } else {
                throw new Error(data.error || 'Failed to publish');
            }
        } catch (err) {
            alert('Error publishing lecture: ' + err.message);
            setIsPublishing(false);
        }
    };

    const formatTime = (ms) => {
        const totalSeconds = Math.floor(ms / 1000);
        const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const s = (totalSeconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const handleSetupComplete = () => {
        if (!title.trim()) {
            alert('Title is required');
            return;
        }
        setShowSetupModal(false);
    };

    return (
        <div className={styles.container}>
            <Navbar />

            {showSetupModal && (
                <div className={styles.setupModalOverlay}>
                    <div className={styles.setupModalContent}>
                        <h2>Create New Lecture</h2>
                        <div className={styles.inputGroup}>
                            <label>Lecture Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="E.g. Intro to Async Mongoose"
                                autoFocus
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Description</label>
                            <input
                                type="text"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="What will students learn?"
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Language</label>
                            <select value={language} onChange={e => setLanguage(e.target.value)}>
                                <option value="javascript">JavaScript</option>
                                <option value="python">Python</option>
                                <option value="cpp">C++</option>
                                <option value="java">Java</option>
                            </select>
                        </div>
                        <button className={styles.btnStartSetup} onClick={handleSetupComplete}>Enter Workspace</button>
                    </div>
                </div>
            )}

            {showSuccessPopup && (
                <div className={styles.popupOverlay}>
                    <div className={styles.popupContent}>
                        <div className={styles.popupIcon}>✅</div>
                        <h2>Lecture Published!</h2>
                        <p>Your interactive code lecture is now live.</p>
                        <p className={styles.popupSubcode}>Redirecting you to the learning area...</p>
                    </div>
                </div>
            )}

            {!showSetupModal && (
                <main className={styles.mainWorkspace}>
                    <header className={styles.workspaceHeader}>
                        <div className={styles.workspaceInfo}>
                            <h2>{title}</h2>
                            <span className={styles.langBadge}>{language}</span>
                        </div>
                        <div className={styles.controls}>
                            {!isRecording ? (
                                <button className={styles.btnRecord} onClick={handleStartRecording}>
                                    <span className={styles.recordDot}></span> Start Recording
                                </button>
                            ) : (
                                <>
                                    <div className={styles.timer}>{formatTime(timeElapsed)}</div>
                                    <button className={styles.btnPause} onClick={handlePauseToggle}>
                                        {isPaused ? '▶ Resume' : '⏸ Pause'}
                                    </button>
                                    <button className={styles.btnPublish} onClick={handleStopAndPublish} disabled={isPublishing}>
                                        {isPublishing ? 'Publishing...' : '⏹ Finish & Publish'}
                                    </button>
                                </>
                            )}
                        </div>
                    </header>

                    <div className={styles.splitArea}>
                        {/* LEFT SIDEPANEL: EDITOR */}
                        <div className={styles.editorArea}>
                            {isRecording && isPaused && (
                                <div className={styles.pausedOverlay}>
                                    <span>Recording Paused</span>
                                </div>
                            )}
                            <Editor
                                height="100%"
                                language={language}
                                theme="vs-dark"
                                value={code}
                                onChange={handleEditorChange}
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    fontFamily: "'JetBrains Mono', monospace",
                                    padding: { top: 16 },
                                    readOnly: isPublishing || (isRecording && isPaused)
                                }}
                            />
                        </div>

                        {/* RIGHT SIDEPANEL: TERMINAL */}
                        <div className={styles.consoleSidebar}>
                            <div className={styles.consoleHeader}>
                                <span>Terminal</span>
                                <div className={styles.terminalActions}>
                                    {isExecuting ? (
                                        <button className={styles.btnTerminateInline} onClick={handleTerminate}>⏹ Terminate</button>
                                    ) : (
                                        <button className={styles.btnRunInline} onClick={handleRunCode} disabled={isPublishing}>▶ Run</button>
                                    )}
                                </div>
                            </div>
                            <div className={styles.terminalWrapper}>
                                <Terminal />
                            </div>
                        </div>
                    </div>
                </main>
            )}
        </div>
    );
};

export default CreateLecture;
