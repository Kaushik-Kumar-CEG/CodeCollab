import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// POST /api/auth/register — Create a new account
router.post('/auth/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required.' });
        }

        if (username.length < 2 || username.length > 30) {
            return res.status(400).json({ error: 'Username must be 2-30 characters.' });
        }

        if (password.length < 4) {
            return res.status(400).json({ error: 'Password must be at least 4 characters.' });
        }

        // Check if username already exists
        const existing = await User.findOne({ username });
        if (existing) {
            return res.status(409).json({ error: 'Username already taken.' });
        }

        const user = new User({ username, password });
        await user.save();

        res.status(201).json({ username: user.username });
    } catch (error) {
        res.status(500).json({ error: error.message || 'Registration failed.' });
    }
});

// POST /api/auth/login — Log in
router.post('/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required.' });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password.' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid username or password.' });
        }

        res.status(200).json({ username: user.username });
    } catch (error) {
        res.status(500).json({ error: error.message || 'Login failed.' });
    }
});

export default router;
