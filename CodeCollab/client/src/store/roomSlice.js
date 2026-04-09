import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  roomId: null,
  roomType: null,
  participants: [],
  mainCode: '',
  currentDriverUsername: null,
  activeScratchpadUser: null, // username of the scratchpad tab we're viewing
  myRole: null,
  pendingProposals: []
};

const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {
    receiveProposal: (state, action) => {
      state.pendingProposals.push(action.payload);
    },
    resolveProposal: (state, action) => {
      state.pendingProposals = state.pendingProposals.filter(p => p.senderUsername !== action.payload);
    },
    setRoomContext: (state, action) => {
      state.roomId = action.payload.roomId;
      state.myRole = action.payload.role;
    },
    setRoomState: (state, action) => {
      state.participants = action.payload.participants;
      state.mainCode = action.payload.mainCode;
      state.currentDriverUsername = action.payload.currentDriverUsername;
    },
    updateMainCode: (state, action) => {
      state.mainCode = action.payload;
    },
    updateScratchpadCode: (state, action) => {
      const { username, delta } = action.payload;
      const participant = state.participants.find(p => p.username === username);
      if (participant) {
        participant.scratchpadCode = delta;
      }
    },
    setActiveScratchpadUser: (state, action) => {
      state.activeScratchpadUser = action.payload;
    }
  }
});

export const {
  setRoomContext,
  setRoomState,
  updateMainCode,
  updateScratchpadCode,
  setActiveScratchpadUser,
  receiveProposal,
  resolveProposal
} = roomSlice.actions;

export default roomSlice.reducer;
