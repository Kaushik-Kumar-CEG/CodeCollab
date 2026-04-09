import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { runJavaScriptInWorker } from '../services/webWorkerRunner';

const PISTON_PROXY_URL = 'http://localhost:5001/api/execute';

export const executeCodeThunk = createAsyncThunk(
  'execution/executeCode',
  async ({ language, code, stdin = '' }) => {
    if (language === 'javascript') {
      // Execute instantly via local Web Worker
      return await runJavaScriptInWorker(code);
    } else {
      // Proxy through backend Piston execution router
      const response = await fetch(PISTON_PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, code, stdin })
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || errData.message || 'Failed to reach backend execution server');
      }
      return await response.json(); // { stdout, stderr, exitCode }
    }
  }
);

const initialState = {
  isExecuting: false,
  language: 'javascript',
  stdout: '',
  stderr: '',
  exitCode: null,
};

const executionSlice = createSlice({
  name: 'execution',
  initialState,
  reducers: {
    setLanguage: (state, action) => {
      state.language = action.payload;
    },
    clearOutput: (state) => {
      state.stdout = '';
      state.stderr = '';
      state.exitCode = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(executeCodeThunk.pending, (state) => {
        state.isExecuting = true;
        state.stdout = '';
        state.stderr = '';
      })
      .addCase(executeCodeThunk.fulfilled, (state, action) => {
        state.isExecuting = false;
        state.stdout = action.payload.stdout || '';
        state.stderr = action.payload.stderr || '';
        state.exitCode = action.payload.exitCode;
      })
      .addCase(executeCodeThunk.rejected, (state, action) => {
        state.isExecuting = false;
        state.stderr = action.error.message;
        state.exitCode = 1;
      });
  }
});

export const { setLanguage, clearOutput } = executionSlice.actions;
export default executionSlice.reducer;
