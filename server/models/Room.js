import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true, index: true },
  roomType: { type: String, enum: ['pair', 'lecture'], required: true },
  title: { type: String, default: 'Untitled Room' },
  language: { type: String, default: 'javascript' },

  // Who created this room
  createdBy: { type: String, default: '' },

  // All users who have ever joined this room (persistent, never cleared)
  members: [{ type: String }],

  // Current state
  mainCode: { type: String, default: '' },

  // Active participants (online now)
  participants: [{
    username: { type: String, required: true },
    role: { type: String, enum: ['driver', 'navigator', 'viewer'] },
    joinedAt: Date,
    scratchpadCode: { type: String, default: '' }
  }],

  // Driver tracking — by username
  currentDriverUsername: { type: String, default: null },

  // Metadata
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Room', roomSchema);
