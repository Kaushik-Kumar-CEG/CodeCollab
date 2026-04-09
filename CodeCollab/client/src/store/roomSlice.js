import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  roomId: null,
  roomType: null,
  participants: [],
  mainCode: '',
  currentDriverId: null,
  activeScratchpadId: null, // ID of the tab (socketId) we are currently viewing
  myRole: null, // 'driver' or 'navigator'
  pendingProposals: [] // Array of {senderId, username, codeDiff}
};

const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {
    receiveProposal: (state, action) => {
      state.pendingProposals.push(action.payload);
    },
    resolveProposal: (state, action) => {
      state.pendingProposals = state.pendingProposals.filter(p => p.senderId !== action.payload);
    },
    setRoomContext: (state, action) => {
      state.roomId = action.payload.roomId;
      state.myRole = action.payload.role;
    },
    setRoomState: (state, action) => {
      state.participants = action.payload.participants;
      state.mainCode = action.payload.mainCode;
      state.currentDriverId = action.payload.currentDriverId;
    },
    updateMainCode: (state, action) => {
      state.mainCode = action.payload;
    },
    updateScratchpadCode: (state, action) => {
      const { userId, delta } = action.payload;
      const participant = state.participants.find(p => p.socketId === userId);
      if (participant) {
        participant.scratchpadCode = delta;
      }
    },
    setActiveScratchpadId: (state, action) => {
      state.activeScratchpadId = action.payload;
    }
  }
});

export const { 
  setRoomContext, 
  setRoomState, 
  updateMainCode, 
  updateScratchpadCode,
  setActiveScratchpadId,
  receiveProposal,
  resolveProposal
} = roomSlice.actions;

export default roomSlice.reducer;
