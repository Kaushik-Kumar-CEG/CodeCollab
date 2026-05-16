import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import Lecture from '../models/Lecture.js';

const router = express.Router();

// POST /api/lectures — Create a new lecture
router.post('/lectures', async (req, res) => {
    try {
        const { title, description, author, language, codeTimeline, videoUrl } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        const lectureId = uuidv4().slice(0, 8);

        const lecture = new Lecture({
            lectureId,
            title,
            description: description || '',
            videoUrl: videoUrl || '',
            language: language || 'javascript',
            timeline: codeTimeline || [],
            instructorName: author || 'Instructor'
        });

        await lecture.save();
        res.status(201).json({ lectureId, title: lecture.title });
    } catch (error) {
        res.status(500).json({ error: error.message || 'Failed to create lecture' });
    }
});

// GET /api/lectures — List all lectures
router.get('/lectures', async (req, res) => {
    try {
        const lectures = await Lecture.find({}, {
            lectureId: 1,
            title: 1,
            description: 1,
            language: 1,
            instructorName: 1,
            createdAt: 1,
            _id: 0
        }).sort({ createdAt: -1 });

        res.status(200).json(lectures);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/lectures/:lectureId — Get lecture with timeline
router.get('/lectures/:lectureId', async (req, res) => {
    try {
        const lecture = await Lecture.findOne({ lectureId: req.params.lectureId });
        if (!lecture) {
            return res.status(404).json({ error: 'Lecture not found' });
        }
        res.status(200).json(lecture);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/lectures/:lectureId — Delete lecture
router.delete('/lectures/:lectureId', async (req, res) => {
    try {
        const deletedLecture = await Lecture.findOneAndDelete({ lectureId: req.params.lectureId });
        if (!deletedLecture) {
            return res.status(404).json({ error: 'Lecture not found' });
        }
        res.status(200).json({ message: 'Lecture deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
