import { configureStore } from '@reduxjs/toolkit';
import roomReducer from './roomSlice';
import executionReducer from './executionSlice';
import lectureReducer from './lectureSlice';

export const store = configureStore({
  reducer: {
    room: roomReducer,
    execution: executionReducer,
    lecture: lectureReducer
  }
});
