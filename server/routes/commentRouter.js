import express from 'express';
import Comment from '../models/Comment.js';

const router = express.Router();

// POST /api/comments — Create a comment thread on specific lines
router.post('/comments', async (req, res) => {
    try {
        const { roomId, lineStart, lineEnd, username, message } = req.body;

        if (!roomId || lineStart == null || lineEnd == null || !username || !message) {
            return res.status(400).json({ error: 'roomId, lineStart, lineEnd, username, and message are required' });
        }

        const comment = new Comment({
            roomId,
            lineStart,
            lineEnd,
            thread: [{ username, message }]
        });

        await comment.save();
        res.status(201).json(comment);
    } catch (error) {
        res.status(500).json({ error: error.message || 'Failed to create comment' });
    }
});

// GET /api/comments/:roomId — Get all comments for a room
router.get('/comments/:roomId', async (req, res) => {
    try {
        const comments = await Comment.find({
            roomId: req.params.roomId,
            resolved: false
        }).sort({ lineStart: 1 });

        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/comments/:commentId/reply — Add a reply to a comment thread
router.put('/comments/:commentId/reply', async (req, res) => {
    try {
        const { username, message } = req.body;
        if (!username || !message) {
            return res.status(400).json({ error: 'username and message are required' });
        }

        const comment = await Comment.findByIdAndUpdate(
            req.params.commentId,
            { $push: { thread: { username, message } } },
            { new: true }
        );

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        res.status(200).json(comment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/comments/:commentId/resolve — Resolve a comment thread
router.put('/comments/:commentId/resolve', async (req, res) => {
    try {
        const comment = await Comment.findByIdAndUpdate(
            req.params.commentId,
            { resolved: true },
            { new: true }
        );

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        res.status(200).json(comment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
