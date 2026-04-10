import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { DUMMY_LECTURE } from '../utils/dummyLectureData';

const API_URL = 'http://localhost:5001/api';

export const fetchLecture = createAsyncThunk('lecture/fetchLecture', async (lectureId, { rejectWithValue }) => {
  if (lectureId === 'demo') {
    return DUMMY_LECTURE;
  }
  try {
    const res = await fetch(`${API_URL}/lectures/${lectureId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data; // returns backend format schema
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

// Helper to find the right code given a generic timeline
const getCodeAtTimeForTimeline = (timeline, seconds) => {
  if (!timeline || timeline.length === 0) return '';
  let code = timeline[0].codeSnapshot || timeline[0].code || ''; // support both formats
  const isMilliseconds = timeline[0].timestamp > 10000 || (timeline.length > 1 && timeline[1].timestamp > 1000);
  const ms = seconds * 1000;

  for (const event of timeline) {
    const eventTime = isMilliseconds ? event.timestamp : (event.time || event.timestamp) * 1000;
    if (ms >= eventTime) {
      code = event.codeSnapshot || event.code || '';
    } else {
      break;
    }
  }
  return code;
};

const initialState = {
  currentLecture: null,
  loading: true,
  error: null,
  isPlaying: false,
  currentTime: 0,
  isSandboxMode: false,
  playbackCode: "",
  sandboxCode: "",
};

const lectureSlice = createSlice({
  name: 'lecture',
  initialState,
  reducers: {
    setVideoProgress: (state, action) => {
      const seconds = action.payload;
      state.currentTime = seconds;

      if (!state.isSandboxMode && state.currentLecture?.timeline) {
        state.playbackCode = getCodeAtTimeForTimeline(state.currentLecture.timeline, seconds);
        state.sandboxCode = state.playbackCode;
      }
    },
    setPlaying: (state, action) => {
      state.isPlaying = action.payload;
    },
    enterSandbox: (state) => {
      state.isSandboxMode = true;
      state.isPlaying = false;
    },
    updateSandboxCode: (state, action) => {
      state.sandboxCode = action.payload;
      if (!state.isSandboxMode) {
        state.isSandboxMode = true;
        state.isPlaying = false;
      }
    },
    resumeLecture: (state) => {
      state.isSandboxMode = false;
      state.sandboxCode = state.playbackCode;
      state.isPlaying = true;
    },
    cleanupLecture: (state) => {
      state.currentLecture = null;
      state.isPlaying = false;
      state.currentTime = 0;
      state.isSandboxMode = false;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchLecture.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchLecture.fulfilled, (state, action) => {
      state.loading = false;
      state.currentLecture = action.payload;
      state.playbackCode = getCodeAtTimeForTimeline(action.payload.timeline, 0);
      state.sandboxCode = state.playbackCode;
    });
    builder.addCase(fetchLecture.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  }
});

export const {
  setVideoProgress,
  setPlaying,
  enterSandbox,
  updateSandboxCode,
  resumeLecture,
  cleanupLecture
} = lectureSlice.actions;

export default lectureSlice.reducer;
