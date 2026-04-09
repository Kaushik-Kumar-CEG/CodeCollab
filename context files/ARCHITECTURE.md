# Technical Architecture Document

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     BROWSER (Client)                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐  │
│  │  React    │ │  Monaco  │ │  Socket  │ │  Web Worker   │  │
│  │  + Redux  │ │  Editor  │ │  .io     │ │  (JS Runner)  │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └───────────────┘  │
│       │             │            │                           │
└───────┼─────────────┼────────────┼───────────────────────────┘
        │ REST        │            │ WebSocket
        ▼             │            ▼
┌───────────────────────────────────────────────────────────┐
│                  EXPRESS SERVER (Node.js)                  │
│  ┌──────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │  REST     │  │  Socket.io   │  │  Piston Proxy       │ │
│  │  Routes   │  │  Server      │  │  (Code Exec)        │ │
│  └────┬──────┘  └──────────────┘  └────────┬────────────┘ │
│       │                                     │              │
└───────┼─────────────────────────────────────┼──────────────┘
        │                                     │
        ▼                                     ▼
┌──────────────┐                    ┌──────────────────┐
│   MongoDB    │                    │   Piston API     │
│   (Atlas)    │                    │   (External)     │
└──────────────┘                    └──────────────────┘
```

---

## MongoDB Data Models (Mongoose Schemas)

### Room Schema
```javascript
// models/Room.js
const roomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true, index: true }, // UUID
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
```

### Lecture Schema
```javascript
// models/Lecture.js
const lectureSchema = new mongoose.Schema({
  lectureId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: String,
  videoUrl: { type: String, required: true },
  language: { type: String, default: 'javascript' },
  
  // Time-synced code timeline
  timeline: [{
    timestamp: Number,        // seconds from video start
    codeSnapshot: String,     // full code state at this timestamp
    cursorPosition: {         // where cursor was
      line: Number,
      column: Number
    },
    audioOverlay: {           // optional voiceover
      url: String,
      duration: Number
    }
  }],
  
  // Metadata
  instructorName: String,
  createdAt: { type: Date, default: Date.now }
});
```

### Comment Schema
```javascript
// models/Comment.js
const commentSchema = new mongoose.Schema({
  roomId: { type: String, required: true, index: true },
  lineStart: { type: Number, required: true },
  lineEnd: { type: Number, required: true },
  thread: [{
    username: String,
    message: String,
    createdAt: { type: Date, default: Date.now }
  }],
  resolved: { type: Boolean, default: false }
});
```

### GhostMerge Schema
```javascript
// models/GhostMerge.js — stored in-memory via Socket.io, optionally persisted
const ghostMergeSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  proposerId: String,
  proposerName: String,
  originalCode: String,      // code in main editor at time of proposal
  proposedCode: String,      // navigator's suggested code
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});
```

---

## Socket.io Event Architecture

### Room Events (Pair Programming)

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `room:join` | Client → Server | `{ roomId, username }` | Join a room |
| `room:joined` | Server → Client | `{ participants, mainCode, role }` | Confirm join with state |
| `room:user-joined` | Server → Room | `{ username, role }` | Broadcast new user |
| `room:user-left` | Server → Room | `{ username }` | Broadcast user departure |
| `code:delta` | Driver → Server | `{ roomId, delta }` | Send code change (Monaco delta) |
| `code:sync` | Server → Navigators | `{ delta }` | Broadcast code change |
| `scratchpad:delta` | Navigator → Server | `{ roomId, delta }` | Scratchpad change |
| `scratchpad:sync` | Server → Room | `{ userId, username, delta }` | Broadcast scratchpad update |
| `ghost:propose` | Navigator → Server | `{ roomId, code }` | Propose Ghost Merge |
| `ghost:incoming` | Server → Driver | `{ proposerName, diff }` | Show diff to driver |
| `ghost:accept` | Driver → Server | `{ roomId, mergeId }` | Accept merge |
| `ghost:reject` | Driver → Server | `{ roomId, mergeId }` | Reject merge |
| `role:request` | Navigator → Server | `{ roomId }` | Request driver role |
| `role:request-incoming` | Server → Driver | `{ requesterName }` | Show swap request |
| `role:approve` | Driver → Server | `{ roomId, newDriverId }` | Approve role swap |
| `role:swapped` | Server → Room | `{ newDriverId }` | Broadcast role change |

### Lecture Events

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `lecture:join` | Client → Server | `{ lectureId }` | Join lecture session |
| `lecture:state` | Server → Client | `{ timeline, currentIndex }` | Send lecture data |
| `lecture:fork` | Client → Server | `{ lectureId, timestamp }` | Fork sandbox at timestamp |
| `lecture:resume` | Client → Server | `{ lectureId }` | Resume from fork |

### Execution Events

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `exec:run` | Client → Server | `{ language, code, stdin }` | Run code |
| `exec:result` | Server → Client | `{ stdout, stderr, exitCode }` | Execution result |

---

## REST API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/rooms` | Create a new room, returns `{ roomId }` |
| `GET` | `/api/rooms/:roomId` | Get room metadata |
| `DELETE` | `/api/rooms/:roomId` | Delete/close a room |
| `POST` | `/api/lectures` | Create a new lecture |
| `GET` | `/api/lectures/:lectureId` | Get lecture with timeline |
| `GET` | `/api/lectures` | List all lectures |
| `POST` | `/api/execute` | Execute code (proxy to Piston) |
| `GET` | `/api/health` | Health check |

---

## Piston API Integration

```javascript
// services/pistonService.js
const PISTON_URL = process.env.PISTON_URL || 'https://emkc.org/api/v2/piston';

const LANGUAGE_MAP = {
  'javascript': { language: 'javascript', version: '18.15.0' },
  'python':     { language: 'python',     version: '3.10.0' },
  'cpp':        { language: 'c++',        version: '10.2.0' },
  'c':          { language: 'c',          version: '10.2.0' },
  'java':       { language: 'java',       version: '15.0.2' }
};

async function executeCode(language, code, stdin = '') {
  const config = LANGUAGE_MAP[language];
  if (!config) throw new Error(`Unsupported language: ${language}`);
  
  const response = await fetch(`${PISTON_URL}/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      language: config.language,
      version: config.version,
      files: [{ content: code }],
      stdin,
      run_timeout: 10000 // 10 second max
    })
  });
  
  return response.json(); // { run: { stdout, stderr, code } }
}
```

---

## Security Considerations

1. **Code Execution**: NEVER run user code on the Express server. Always proxy to Piston API.
2. **Room Access**: Rooms expire after 24 hours. No sensitive data persisted beyond session.
3. **Input Sanitization**: Sanitize all Socket.io payloads. Validate `roomId`, `language`, `username`.
4. **Rate Limiting**: Apply rate limits to `/api/execute` (max 10 requests/min/room).
5. **CORS**: Configure strict CORS origins in production.
6. **WebSocket Auth**: Optionally attach JWT to Socket.io handshake for authenticated sessions.

---

## Environment Variables

```env
# .env.example
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/codecollab
PISTON_URL=https://emkc.org/api/v2/piston
JWT_SECRET=your-secret-key
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```
