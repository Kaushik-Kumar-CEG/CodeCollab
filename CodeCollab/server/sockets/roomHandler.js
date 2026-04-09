import Room from '../models/Room.js';

export const registerRoomHandlers = (io, socket) => {
  
  // Custom helper to broadcast updated room state
  const broadcastRoomState = async (roomId) => {
    try {
      const room = await Room.findOne({ roomId });
      if (room) {
        io.to(roomId).emit('room:state', {
          participants: room.participants,
          mainCode: room.mainCode,
          currentDriverId: room.currentDriverId
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
          title: `Room ${roomId.substring(0, 5)}`
        });
      }

      // Check if already in room (StrictMode duplicate firing)
      const existingParticipant = room.participants.find(p => p.socketId === socket.id);
      
      if (!existingParticipant) {
        const isFirstParticipant = room.participants.length === 0;
        const role = isFirstParticipant ? 'driver' : 'navigator';
        
        room.participants.push({
          socketId: socket.id,
          username,
          role,
          joinedAt: new Date(),
          scratchpadCode: ''
        });
        
        if (isFirstParticipant) {
          room.currentDriverId = socket.id;
        }
        await room.save();
      }

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
    // In a production app with Monaco, we would broadcast the delta operational transform.
    // We also eventually persist the full code. 
    // For simplicity, we assume 'delta' is the raw code string right now, or we broadcast it directly.
    socket.to(roomId).emit('code:sync', { delta });
    
    // Optional: Save to DB (debounced normally)
    try {
      await Room.updateOne({ roomId }, { mainCode: delta });
    } catch(err) {}
  });

  socket.on('scratchpad:delta', async ({ roomId, delta }) => {
    // Sync scratchpad changes to everyone else (they just watch)
    socket.to(roomId).emit('scratchpad:sync', { userId: socket.id, username: socket.data.username, delta });
    
    // Save to DB
    try {
      await Room.updateOne(
        { roomId, "participants.socketId": socket.id },
        { "$set": { "participants.$.scratchpadCode": delta } }
      );
    } catch(err) {}
  });

  socket.on('ghost:propose', async ({ roomId, codeDiff }) => {
    try {
      const room = await Room.findOne({ roomId });
      if (room && room.currentDriverId) {
        // Broadcast to the entire room; only the driver will display the modal
        io.to(roomId).emit('ghost:receive', {
          senderId: socket.id,
          username: socket.data.username,
          codeDiff
        });
      }
    } catch(err) {}
  });

  // ── Role Swap ──
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
      if (room && room.currentDriverId) {
        // Notify the driver that someone wants control
        io.to(roomId).emit('role:request-incoming', {
          requesterId: socket.id,
          requesterName: socket.data.username
        });
      }
    } catch(err) {}
  });

  socket.on('role:approve', async ({ roomId, newDriverId }) => {
    try {
      const room = await Room.findOne({ roomId });
      if (!room) return;

      // Demote old driver
      const oldDriver = room.participants.find(p => p.socketId === room.currentDriverId);
      if (oldDriver) oldDriver.role = 'navigator';

      // Promote new driver
      const newDriver = room.participants.find(p => p.socketId === newDriverId);
      if (newDriver) newDriver.role = 'driver';

      room.currentDriverId = newDriverId;
      await room.save();

      // Broadcast updated state to everyone
      await broadcastRoomState(roomId);
    } catch(err) { console.error(err); }
  });

  socket.on('disconnect', async () => {
    const roomId = socket.data.roomId;
    if (roomId) {
      try {
        const room = await Room.findOne({ roomId });
        if (room) {
          room.participants = room.participants.filter(p => p.socketId !== socket.id);
          
          // Reassign driver if driver left
          if (room.currentDriverId === socket.id && room.participants.length > 0) {
            room.currentDriverId = room.participants[0].socketId;
            room.participants[0].role = 'driver';
          } else if (room.participants.length === 0) {
            room.currentDriverId = null;
          }

          await room.save();
          await broadcastRoomState(roomId);
        }
      } catch (error) {
        console.error(error);
      }
    }
  });
};

