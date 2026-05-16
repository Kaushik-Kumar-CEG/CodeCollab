import React, { useState } from 'react';
import styles from './Comments.module.css';

const CommentThread = ({ comment, username, onReply, onResolve }) => {
    const [replyText, setReplyText] = useState('');

    const handleReply = () => {
        if (replyText.trim()) {
            onReply(comment._id, replyText.trim());
            setReplyText('');
        }
    };

    return (
        <div className={styles.threadCard}>
            <div className={styles.threadLineRange}>
                <span className={styles.lineLabel}>
                    Lines {comment.lineStart}–{comment.lineEnd}
                </span>
                <button className={styles.resolveBtn} onClick={() => onResolve(comment._id)}>
                    ✓ Resolve
                </button>
            </div>

            <div className={styles.threadMessages}>
                {comment.thread.map((msg, idx) => (
                    <div key={idx} className={styles.threadMessage}>
                        <div className={styles.messageUser}>{msg.username}</div>
                        <div className={styles.messageText}>{msg.message}</div>
                        <div className={styles.messageTime}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.replyForm}>
                <input
                    className={styles.replyInput}
                    type="text"
                    placeholder="Reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleReply()}
                />
                <button className={styles.replyBtn} onClick={handleReply}>Reply</button>
            </div>
        </div>
    );
};

export default CommentThread;
