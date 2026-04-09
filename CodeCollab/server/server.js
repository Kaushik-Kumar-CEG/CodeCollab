import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

import { connectDB } from './config/db.js';
import { registerRoomHandlers } from './sockets/roomHandler.js';
import executeRouter from './routes/executeRouter.js';
import roomRouter from './routes/roomRouter.js';
import Room from './models/Room.js';

dotenv.config();

// Connect to MongoDB & Clear Ghost Sessions
await connectDB();
try {
  await Room.updateMany({}, { $set: { participants: [], currentDriverId: null } });
  console.log("Database cleanup: Removed ghost participants.");
} catch (e) {
  console.error(e);
}

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', executeRouter);
app.use('/api', roomRouter);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  // Register modular handlers
  registerRoomHandlers(io, socket);

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
