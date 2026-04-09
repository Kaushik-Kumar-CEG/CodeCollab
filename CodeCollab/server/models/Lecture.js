import mongoose from 'mongoose';

const lectureSchema = new mongoose.Schema({
  lectureId: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  videoUrl: { type: String, required: true },
  language: { type: String, default: 'javascript' },

  // Time-synced code timeline
  timeline: [{
    timestamp: { type: Number, required: true },
    codeSnapshot: { type: String, default: '' },
    cursorPosition: {
      line: { type: Number, default: 1 },
      column: { type: Number, default: 1 }
    }
  }],

  // Metadata
  instructorName: { type: String, default: 'Instructor' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Lecture', lectureSchema);
