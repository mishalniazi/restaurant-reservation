import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../app/api';

export const fetchReservations = createAsyncThunk('reservations/fetch', async (params = {}, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/reservations', { params });
    return data;
  } catch (e) { return rejectWithValue(e.response?.data?.error); }
});

export const createReservation = createAsyncThunk('reservations/create', async (body, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/reservations', body);
    return data;
  } catch (e) { return rejectWithValue(e.response?.data?.error); }
});

export const updateStatus = createAsyncThunk('reservations/updateStatus', async ({ id, status }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/reservations/${id}/status`, { status });
    return data;
  } catch (e) { return rejectWithValue(e.response?.data?.error); }
});

export const cancelReservation = createAsyncThunk('reservations/cancel', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.delete(`/reservations/${id}`);
    return data.reservation;
  } catch (e) { return rejectWithValue(e.response?.data?.error); }
});

const slice = createSlice({
  name: 'reservations',
  initialState: { data: [], total: 0, pages: 1, page: 1, loading: false, error: null },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchReservations.pending,   s => { s.loading = true; s.error = null; })
      .addCase(fetchReservations.fulfilled, (s, a) => { s.loading = false; Object.assign(s, a.payload); })
      .addCase(fetchReservations.rejected,  (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(createReservation.fulfilled, (s, a) => { s.data.unshift(a.payload); })
      .addCase(updateStatus.fulfilled, (s, a) => {
        const idx = s.data.findIndex(r => r.id === a.payload.id);
        if (idx !== -1) s.data[idx] = a.payload;
      })
      .addCase(cancelReservation.fulfilled, (s, a) => {
        const idx = s.data.findIndex(r => r.id === a.payload.id);
        if (idx !== -1) s.data[idx] = a.payload;
      });
  },
});

export default slice.reducer;
