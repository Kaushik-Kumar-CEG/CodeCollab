import React, { useState } from 'react';
import styles from './Comments.module.css';

const CommentForm = ({ lineStart, lineEnd, onSubmit, onCancel }) => {
    const [message, setMessage] = useState('');

    const handleSubmit = () => {
        if (message.trim()) {
            onSubmit(message.trim());
            setMessage('');
        }
    };

    return (
        <div className={styles.newCommentForm}>
            <div className={styles.formLabel}>
                New comment on lines {lineStart}–{lineEnd}
            </div>
            <textarea
                className={styles.newCommentTextarea}
                placeholder="Write a comment..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                autoFocus
            />
            <div className={styles.newCommentActions}>
                <button className={styles.cancelBtn} onClick={onCancel}>Cancel</button>
                <button className={styles.submitBtn} onClick={handleSubmit}>Comment</button>
            </div>
        </div>
    );
};

export default CommentForm;
