import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../app/api';

const stored = localStorage.getItem('user');

export const login = createAsyncThunk('auth/login', async (creds, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', creds);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data.user;
  } catch (e) {
    return rejectWithValue(e.response?.data?.error || 'Login failed');
  }
});

export const register = createAsyncThunk('auth/register', async (creds, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/register', creds);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data.user;
  } catch (e) {
    return rejectWithValue(e.response?.data?.error || 'Registration failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: stored ? JSON.parse(stored) : null, error: null, loading: false },
  reducers: {
    logout(state) {
      state.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
  extraReducers: builder => {
    builder
      .addCase(login.pending,    s => { s.loading = true;  s.error = null; })
      .addCase(login.fulfilled,  (s, a) => { s.loading = false; s.user = a.payload; })
      .addCase(login.rejected,   (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(register.pending,   s => { s.loading = true;  s.error = null; })
      .addCase(register.fulfilled, (s, a) => { s.loading = false; s.user = a.payload; })
      .addCase(register.rejected,  (s, a) => { s.loading = false; s.error = a.payload; });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
