import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../app/api';

export const fetchTables = createAsyncThunk('tables/fetch', async (_, { rejectWithValue }) => {
  try { const { data } = await api.get('/tables'); return data; }
  catch (e) { return rejectWithValue(e.response?.data?.error); }
});

export const fetchAvailability = createAsyncThunk('tables/availability', async (params, { rejectWithValue }) => {
  try { const { data } = await api.get('/tables/availability', { params }); return data; }
  catch (e) { return rejectWithValue(e.response?.data?.error); }
});

export const addTable = createAsyncThunk('tables/add', async (body, { rejectWithValue }) => {
  try { const { data } = await api.post('/tables', body); return data; }
  catch (e) { return rejectWithValue(e.response?.data?.error); }
});

export const deleteTable = createAsyncThunk('tables/delete', async (id, { rejectWithValue }) => {
  try { await api.delete(`/tables/${id}`); return id; }
  catch (e) { return rejectWithValue(e.response?.data?.error); }
});

const slice = createSlice({
  name: 'tables',
  initialState: { all: [], available: [], loading: false, error: null },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchTables.fulfilled,       (s, a) => { s.all = a.payload; })
      .addCase(fetchAvailability.fulfilled,  (s, a) => { s.available = a.payload; })
      .addCase(addTable.fulfilled,           (s, a) => { s.all.push(a.payload); })
      .addCase(deleteTable.fulfilled,        (s, a) => { s.all = s.all.filter(t => t.id !== a.payload); });
  },
});

export default slice.reducer;
