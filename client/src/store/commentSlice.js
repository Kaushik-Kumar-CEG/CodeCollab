import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    comments: [],       // Array of comment objects from server
    activeThreadId: null // ID of the expanded comment thread
};

const commentSlice = createSlice({
    name: 'comment',
    initialState,
    reducers: {
        setComments: (state, action) => {
            state.comments = action.payload;
        },
        addComment: (state, action) => {
            state.comments.push(action.payload);
        },
        updateComment: (state, action) => {
            const idx = state.comments.findIndex(c => c._id === action.payload._id);
            if (idx !== -1) {
                state.comments[idx] = action.payload;
            }
        },
        resolveComment: (state, action) => {
            state.comments = state.comments.filter(c => c._id !== action.payload);
        },
        setActiveThread: (state, action) => {
            state.activeThreadId = action.payload;
        }
    }
});

export const { setComments, addComment, updateComment, resolveComment, setActiveThread } = commentSlice.actions;
export default commentSlice.reducer;
