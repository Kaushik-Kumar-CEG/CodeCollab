import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    logs: []
};

const activityLogSlice = createSlice({
    name: 'activityLog',
    initialState,
    reducers: {
        addLog: (state, action) => {
            state.logs.push({
                id: Date.now(),
                text: action.payload.text,
                type: action.payload.type || 'info', // 'info' | 'success' | 'log' | 'error'
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            });
        },
        clearLogs: (state) => {
            state.logs = [];
        }
    }
});

export const { addLog, clearLogs } = activityLogSlice.actions;
export default activityLogSlice.reducer;
