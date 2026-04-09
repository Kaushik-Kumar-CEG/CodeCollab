import { createSlice } from '@reduxjs/toolkit';
import { getCodeAtTime } from '../utils/dummyLectureData';

const initialState = {
  isPlaying: false,
  currentTime: 0,
  isSandboxMode: false,
  playbackCode: "", // The strict code mandated by the video
  sandboxCode: "",  // The code the user has optionally modified natively
};

const lectureSlice = createSlice({
  name: 'lecture',
  initialState,
  reducers: {
    setVideoProgress: (state, action) => {
      const seconds = action.payload;
      state.currentTime = seconds;
      
      // If we are strictly learning (not sandboxed), auto-type the instructor's code
      if (!state.isSandboxMode) {
        state.playbackCode = getCodeAtTime(seconds);
        state.sandboxCode = state.playbackCode; // Keep synced quietly under the hood
      }
    },
    setPlaying: (state, action) => {
      state.isPlaying = action.payload;
    },
    enterSandbox: (state) => {
      state.isSandboxMode = true;
      state.isPlaying = false; // Intentionally pause video when the user starts typing!
    },
    updateSandboxCode: (state, action) => {
      state.sandboxCode = action.payload;
      // Triggers strictly when user types, so force sandbox mode
      if (!state.isSandboxMode) {
        state.isSandboxMode = true;
        state.isPlaying = false;
      }
    },
    resumeLecture: (state) => {
      // Revert completely back to the Instructor's flow
      state.isSandboxMode = false;
      state.sandboxCode = state.playbackCode;
      state.isPlaying = true;
    }
  }
});

export const { 
  setVideoProgress, 
  setPlaying, 
  enterSandbox, 
  updateSandboxCode, 
  resumeLecture 
} = lectureSlice.actions;

export default lectureSlice.reducer;
