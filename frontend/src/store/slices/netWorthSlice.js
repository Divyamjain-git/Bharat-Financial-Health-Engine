// netWorthSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchNetWorth = createAsyncThunk('netWorth/fetch', async (_, { rejectWithValue }) => {
  try { const r = await api.get('/net-worth'); return r.data.data; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});
export const addAsset = createAsyncThunk('netWorth/addAsset', async (data, { rejectWithValue }) => {
  try { const r = await api.post('/net-worth/assets', data); return r.data.data.netWorth; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});
export const deleteAsset = createAsyncThunk('netWorth/deleteAsset', async (id, { rejectWithValue }) => {
  try { const r = await api.delete(`/net-worth/assets/${id}`); return r.data.data.netWorth; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});
export const addLiability = createAsyncThunk('netWorth/addLiability', async (data, { rejectWithValue }) => {
  try { const r = await api.post('/net-worth/liabilities', data); return r.data.data.netWorth; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});
export const deleteLiability = createAsyncThunk('netWorth/deleteLiability', async (id, { rejectWithValue }) => {
  try { const r = await api.delete(`/net-worth/liabilities/${id}`); return r.data.data.netWorth; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});

const netWorthSlice = createSlice({
  name: 'netWorth',
  initialState: { data: null, analysis: null, loading: false, error: null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchNetWorth.pending, (s) => { s.loading = true; })
     .addCase(fetchNetWorth.fulfilled, (s, a) => { s.loading = false; s.data = a.payload.netWorth; s.analysis = a.payload.analysis; })
     .addCase(fetchNetWorth.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
     .addCase(addAsset.fulfilled, (s, a) => { s.data = a.payload; })
     .addCase(deleteAsset.fulfilled, (s, a) => { s.data = a.payload; })
     .addCase(addLiability.fulfilled, (s, a) => { s.data = a.payload; })
     .addCase(deleteLiability.fulfilled, (s, a) => { s.data = a.payload; });
  }
});
export default netWorthSlice.reducer;
