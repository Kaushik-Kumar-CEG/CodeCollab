import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    roomId: { type: String, required: true, index: true },
    lineStart: { type: Number, required: true },
    lineEnd: { type: Number, required: true },
    thread: [{
        username: { type: String, required: true },
        message: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    }],
    resolved: { type: Boolean, default: false }
});

export default mongoose.model('Comment', commentSchema);
