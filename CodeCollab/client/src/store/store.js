import { configureStore } from '@reduxjs/toolkit';
import roomReducer from './roomSlice';
import executionReducer from './executionSlice';
import lectureReducer from './lectureSlice';
import commentReducer from './commentSlice';
import activityLogReducer from './activityLogSlice';

export const store = configureStore({
  reducer: {
    room: roomReducer,
    execution: executionReducer,
    lecture: lectureReducer,
    comment: commentReducer,
    activityLog: activityLogReducer
  }
});
