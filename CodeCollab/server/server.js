import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

import { connectDB } from './config/db.js';
import { registerRoomHandlers } from './sockets/roomHandler.js';
import { registerCommentHandlers } from './sockets/commentHandler.js';
import executeRouter from './routes/executeRouter.js';
import roomRouter from './routes/roomRouter.js';
import lectureRouter from './routes/lectureRouter.js';
import commentRouter from './routes/commentRouter.js';
import authRouter from './routes/authRouter.js';

dotenv.config();

// Connect to MongoDB (no startup cleanup — data persists across restarts)
await connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', executeRouter);
app.use('/api', roomRouter);
app.use('/api', lectureRouter);
app.use('/api', commentRouter);
app.use('/api', authRouter);

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
  registerCommentHandlers(io, socket);

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
