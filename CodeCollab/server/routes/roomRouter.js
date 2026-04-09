import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import Room from '../models/Room.js';

const router = express.Router();

// POST /api/rooms — Create a new room
router.post('/rooms', async (req, res) => {
  try {
    const { roomType = 'pair', title, language = 'javascript', username = '' } = req.body;
    const roomId = uuidv4().slice(0, 8);

    const room = new Room({
      roomId,
      roomType,
      title: title || `Room ${roomId}`,
      language,
      createdBy: username,
      members: username ? [username] : []
    });

    await room.save();
    res.status(201).json({ roomId, title: room.title, language: room.language });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to create room' });
  }
});

// GET /api/rooms — List rooms (optionally filtered by username)
router.get('/rooms', async (req, res) => {
  try {
    const { username } = req.query;

    let filter = {};
    if (username) {
      // Show rooms where this user is a member (persistent) or creator
      filter = {
        $or: [
          { createdBy: username },
          { members: username }
        ]
      };
    }

    const rooms = await Room.find(
      filter,
      { roomId: 1, title: 1, language: 1, roomType: 1, participants: 1, createdBy: 1, _id: 0 }
    ).sort({ createdAt: -1 }).limit(50);

    const result = rooms.map(r => ({
      roomId: r.roomId,
      title: r.title,
      language: r.language,
      roomType: r.roomType,
      createdBy: r.createdBy,
      participantCount: r.participants.length,
      participantNames: r.participants.map(p => p.username)
    }));

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/rooms/:roomId — Get room metadata
router.get('/rooms/:roomId', async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.status(200).json({
      roomId: room.roomId,
      title: room.title,
      language: room.language,
      roomType: room.roomType,
      createdBy: room.createdBy,
      participantCount: room.participants.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/rooms/:roomId — Delete/close a room
router.delete('/rooms/:roomId', async (req, res) => {
  try {
    const result = await Room.deleteOne({ roomId: req.params.roomId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.status(200).json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
