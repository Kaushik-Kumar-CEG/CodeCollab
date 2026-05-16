import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = 'http://localhost:5001/api';

export const registerUser = createAsyncThunk('auth/register', async ({ username, password }, { rejectWithValue }) => {
    try {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registration failed');
        return data;
    } catch (err) {
        return rejectWithValue(err.message);
    }
});

export const loginUser = createAsyncThunk('auth/login', async ({ username, password }, { rejectWithValue }) => {
    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed');
        return data;
    } catch (err) {
        return rejectWithValue(err.message);
    }
});

const initialState = {
    username: sessionStorage.getItem('cc_username') || null,
    isLoggedIn: !!sessionStorage.getItem('cc_username'),
    loading: false,
    error: null,
    isAuthModalOpen: false
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.username = null;
            state.isLoggedIn = false;
            state.error = null;
            sessionStorage.removeItem('cc_username');
        },
        clearAuthError: (state) => {
            state.error = null;
        },
        openAuthModal: (state) => {
            state.isAuthModalOpen = true;
        },
        closeAuthModal: (state) => {
            state.isAuthModalOpen = false;
        },
        toggleAuthModal: (state) => {
            state.isAuthModalOpen = !state.isAuthModalOpen;
        }
    },
    extraReducers: (builder) => {
        // Register
        builder.addCase(registerUser.pending, (state) => { state.loading = true; state.error = null; });
        builder.addCase(registerUser.fulfilled, (state, action) => {
            state.loading = false;
            state.username = action.payload.username;
            state.isLoggedIn = true;
            sessionStorage.setItem('cc_username', action.payload.username);
        });
        builder.addCase(registerUser.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });

        // Login
        builder.addCase(loginUser.pending, (state) => { state.loading = true; state.error = null; });
        builder.addCase(loginUser.fulfilled, (state, action) => {
            state.loading = false;
            state.username = action.payload.username;
            state.isLoggedIn = true;
            sessionStorage.setItem('cc_username', action.payload.username);
        });
        builder.addCase(loginUser.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
    }
});

export const { logout, clearAuthError, openAuthModal, closeAuthModal, toggleAuthModal } = authSlice.actions;
export default authSlice.reducer;
