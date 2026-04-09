import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { setComments, addComment, updateComment, resolveComment } from '../../store/commentSlice';
import CommentThread from './CommentThread';
import CommentForm from './CommentForm';
import styles from './Comments.module.css';

const API_URL = 'http://localhost:5001/api';

const CommentPanel = ({ socket, roomId, username, isOpen, onClose, selectionRange }) => {
    const dispatch = useDispatch();
    const { comments } = useSelector(state => state.comment);
    const [showNewForm, setShowNewForm] = useState(false);

    // Fetch existing comments on mount
    useEffect(() => {
        if (roomId) {
            fetch(`${API_URL}/comments/${roomId}`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        dispatch(setComments(data));
                    }
                })
                .catch(() => { });
        }
    }, [roomId, dispatch]);

    // Listen to socket events for real-time comments
    useEffect(() => {
        if (!socket) return;

        const handleAdded = (comment) => {
            dispatch(addComment(comment));
        };

        const handleUpdated = (comment) => {
            dispatch(updateComment(comment));
        };

        const handleResolved = ({ commentId }) => {
            dispatch(resolveComment(commentId));
        };

        socket.on('comment:added', handleAdded);
        socket.on('comment:updated', handleUpdated);
        socket.on('comment:resolved', handleResolved);

        return () => {
            socket.off('comment:added', handleAdded);
            socket.off('comment:updated', handleUpdated);
            socket.off('comment:resolved', handleResolved);
        };
    }, [socket, dispatch]);

    // Show new comment form when selection range changes
    useEffect(() => {
        if (selectionRange && selectionRange.lineStart) {
            setShowNewForm(true);
        }
    }, [selectionRange]);

    const handleNewComment = (message) => {
        if (socket && selectionRange) {
            socket.emit('comment:add', {
                roomId,
                lineStart: selectionRange.lineStart,
                lineEnd: selectionRange.lineEnd,
                username,
                message
            });
            setShowNewForm(false);
        }
    };

    const handleReply = (commentId, message) => {
        if (socket) {
            socket.emit('comment:reply', {
                roomId,
                commentId,
                username,
                message
            });
        }
    };

    const handleResolve = (commentId) => {
        if (socket) {
            socket.emit('comment:resolve', { roomId, commentId });
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className={styles.commentPanel}
                initial={{ x: 320, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 320, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
                <div className={styles.commentHeader}>
                    <h4>💬 Comments ({comments.length})</h4>
                    <button className={styles.commentCloseBtn} onClick={onClose}>&times;</button>
                </div>

                <div className={styles.commentList}>
                    {comments.length === 0 && !showNewForm ? (
                        <div className={styles.emptyComments}>
                            No comments yet. Select code lines to comment.
                        </div>
                    ) : (
                        comments.map(comment => (
                            <CommentThread
                                key={comment._id}
                                comment={comment}
                                username={username}
                                onReply={handleReply}
                                onResolve={handleResolve}
                            />
                        ))
                    )}
                </div>

                {showNewForm && selectionRange && (
                    <CommentForm
                        lineStart={selectionRange.lineStart}
                        lineEnd={selectionRange.lineEnd}
                        onSubmit={handleNewComment}
                        onCancel={() => setShowNewForm(false)}
                    />
                )}
            </motion.div>
        </AnimatePresence>
    );
};

export default CommentPanel;
