import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../app/api';

export const fetchWaitlist = createAsyncThunk('waitlist/fetch', async (params = {}, { rejectWithValue }) => {
  try { const { data } = await api.get('/waitlist', { params }); return data; }
  catch (e) { return rejectWithValue(e.response?.data?.error); }
});

export const joinWaitlist = createAsyncThunk('waitlist/join', async (body, { rejectWithValue }) => {
  try { const { data } = await api.post('/waitlist', body); return data; }
  catch (e) { return rejectWithValue(e.response?.data?.error); }
});

export const leaveWaitlist = createAsyncThunk('waitlist/leave', async (id, { rejectWithValue }) => {
  try { await api.delete(`/waitlist/${id}`); return id; }
  catch (e) { return rejectWithValue(e.response?.data?.error); }
});

export const notifyWaitlist = createAsyncThunk('waitlist/notify', async (id, { rejectWithValue }) => {
  try { const { data } = await api.put(`/waitlist/${id}/notify`); return data; }
  catch (e) { return rejectWithValue(e.response?.data?.error); }
});

const slice = createSlice({
  name: 'waitlist',
  initialState: { entries: [], loading: false, error: null },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchWaitlist.fulfilled,  (s, a) => { s.entries = a.payload; })
      .addCase(joinWaitlist.fulfilled,   (s, a) => { s.entries.push(a.payload); })
      .addCase(leaveWaitlist.fulfilled,  (s, a) => { s.entries = s.entries.filter(e => e.id !== a.payload); })
      .addCase(notifyWaitlist.fulfilled, (s, a) => {
        const idx = s.entries.findIndex(e => e.id === a.payload.id);
        if (idx !== -1) s.entries[idx] = a.payload;
      });
  },
});

export default slice.reducer;
