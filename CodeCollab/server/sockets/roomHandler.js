import Room from '../models/Room.js';

const MAX_ROOM_USERS = 10;

// In-memory map: socketId -> { roomId, username }
const socketUserMap = new Map();

export const registerRoomHandlers = (io, socket) => {

  // Helper: get all socketIds in a room for a given username
  const getSocketsForUser = (roomId, username) => {
    const sockets = [];
    for (const [sid, data] of socketUserMap.entries()) {
      if (data.roomId === roomId && data.username === username) {
        sockets.push(sid);
      }
    }
    return sockets;
  };

  // Broadcast updated room state
  const broadcastRoomState = async (roomId) => {
    try {
      const room = await Room.findOne({ roomId });
      if (room) {
        io.to(roomId).emit('room:state', {
          participants: room.participants,
          mainCode: room.mainCode,
          currentDriverUsername: room.currentDriverUsername
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  socket.on('room:join', async ({ roomId, username, roomType = 'pair' }) => {
    try {
      let room = await Room.findOne({ roomId });

      if (!room) {
        room = new Room({
          roomId,
          roomType,
          title: `Room ${roomId.substring(0, 5)}`,
          createdBy: username
        });
      }

      // Check if this username already exists in the room
      const existingParticipant = room.participants.find(p => p.username === username);

      if (!existingParticipant) {
        // New user — enforce max limit
        if (room.participants.length >= MAX_ROOM_USERS) {
          socket.emit('error', { message: 'Room is full. Maximum 10 users allowed.' });
          return;
        }

        const isFirstParticipant = room.participants.length === 0;
        const role = isFirstParticipant ? 'driver' : 'navigator';

        room.participants.push({
          username,
          role,
          joinedAt: new Date(),
          scratchpadCode: ''
        });

        if (isFirstParticipant) {
          room.currentDriverUsername = username;
        }

        // Add to persistent members list (won't duplicate thanks to $addToSet)
        if (!room.members.includes(username)) {
          room.members.push(username);
        }
        await room.save();

        console.log(`[JOIN] ${username} joined room ${roomId} as ${role}`);
      } else {
        // Same user opening another tab — just join the socket channel
        console.log(`[REJOIN] ${username} reconnected to room ${roomId}`);
      }

      // Track this socket
      socketUserMap.set(socket.id, { roomId, username });

      socket.join(roomId);
      socket.data.roomId = roomId;
      socket.data.username = username;

      await broadcastRoomState(roomId);

    } catch (error) {
      socket.emit('error', { message: 'Failed to join room' });
      console.error(error);
    }
  });

  socket.on('code:delta', async ({ roomId, delta }) => {
    socket.to(roomId).emit('code:sync', { delta });
    try {
      await Room.updateOne({ roomId }, { mainCode: delta });
    } catch (err) { }
  });

  socket.on('scratchpad:delta', async ({ roomId, delta }) => {
    const username = socket.data.username;
    socket.to(roomId).emit('scratchpad:sync', { username, delta });
    try {
      await Room.updateOne(
        { roomId, "participants.username": username },
        { "$set": { "participants.$.scratchpadCode": delta } }
      );
    } catch (err) { }
  });

  socket.on('ghost:propose', async ({ roomId, codeDiff }) => {
    try {
      const room = await Room.findOne({ roomId });
      if (room && room.currentDriverUsername) {
        io.to(roomId).emit('ghost:receive', {
          senderUsername: socket.data.username,
          codeDiff
        });
      }
    } catch (err) { }
  });

  socket.on('ghost:accepted', ({ roomId }) => {
    socket.to(roomId).emit('ghost:accepted', {});
  });

  socket.on('ghost:rejected', ({ roomId }) => {
    socket.to(roomId).emit('ghost:rejected', {});
  });

  // ── Role Swap ──
  socket.on('role:request', async ({ roomId }) => {
    try {
      const room = await Room.findOne({ roomId });
      if (room && room.currentDriverUsername) {
        io.to(roomId).emit('role:request-incoming', {
          requesterUsername: socket.data.username
        });
      }
    } catch (err) { }
  });

  socket.on('role:approve', async ({ roomId, newDriverUsername }) => {
    try {
      const room = await Room.findOne({ roomId });
      if (!room) return;

      // Demote old driver
      const oldDriver = room.participants.find(p => p.username === room.currentDriverUsername);
      if (oldDriver) oldDriver.role = 'navigator';

      // Promote new driver
      const newDriver = room.participants.find(p => p.username === newDriverUsername);
      if (newDriver) newDriver.role = 'driver';

      room.currentDriverUsername = newDriverUsername;
      await room.save();

      await broadcastRoomState(roomId);
    } catch (err) { console.error(err); }
  });

  socket.on('disconnect', async () => {
    const roomId = socket.data.roomId;
    const username = socket.data.username;

    // Remove this socket from the map
    socketUserMap.delete(socket.id);

    if (roomId && username) {
      // Check if this user has any OTHER sockets still connected to this room
      const remainingSockets = getSocketsForUser(roomId, username);

      if (remainingSockets.length === 0) {
        // Last socket for this user — remove from room
        try {
          const room = await Room.findOne({ roomId });
          if (room) {
            room.participants = room.participants.filter(p => p.username !== username);

            // Reassign driver if driver left
            if (room.currentDriverUsername === username && room.participants.length > 0) {
              room.currentDriverUsername = room.participants[0].username;
              room.participants[0].role = 'driver';
            } else if (room.participants.length === 0) {
              room.currentDriverUsername = null;
            }

            await room.save();
            await broadcastRoomState(roomId);
            console.log(`[LEAVE] ${username} fully disconnected from room ${roomId}`);
          }
        } catch (error) {
          console.error(error);
        }
      } else {
        console.log(`[TAB CLOSED] ${username} still has ${remainingSockets.length} tab(s) in room ${roomId}`);
      }
    }
  });
};
