import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import Room from '../models/Room.js';

const router = express.Router();

// POST /api/rooms — Create a new room
router.post('/rooms', async (req, res) => {
  try {
    const { roomType = 'pair', title, language = 'javascript' } = req.body;
    const roomId = uuidv4().slice(0, 8);

    const room = new Room({
      roomId,
      roomType,
      title: title || `Room ${roomId}`,
      language,
    });

    await room.save();
    res.status(201).json({ roomId, title: room.title, language: room.language });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to create room' });
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
      participantCount: room.participants.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
