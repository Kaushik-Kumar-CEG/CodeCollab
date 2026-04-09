import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true, index: true },
  roomType: { type: String, enum: ['pair', 'lecture'], required: true },
  title: { type: String, default: 'Untitled Room' },
  language: { type: String, default: 'javascript' },
  
  // Current state
  mainCode: { type: String, default: '' },
  
  // Participants
  participants: [{
    socketId: String,
    username: String,
    role: { type: String, enum: ['driver', 'navigator', 'viewer'] },
    joinedAt: Date,
    scratchpadCode: { type: String, default: '' }
  }],
  
  // Driver tracking
  currentDriverId: { type: String, default: null },
  
  // Metadata
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => Date.now() + 24*60*60*1000 } // 24h TTL
});

export default mongoose.model('Room', roomSchema);
