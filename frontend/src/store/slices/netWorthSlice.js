// netWorthSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchNetWorth = createAsyncThunk('netWorth/fetch', async (_, { rejectWithValue }) => {
  try { const r = await api.get('/net-worth'); return r.data.data; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});
export const addAsset = createAsyncThunk('netWorth/addAsset', async (data, { dispatch, rejectWithValue }) => {
  try { await api.post('/net-worth/assets', data); const r = await api.get('/net-worth'); return r.data.data; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});
export const deleteAsset = createAsyncThunk('netWorth/deleteAsset', async (id, { rejectWithValue }) => {
  try { await api.delete(`/net-worth/assets/${id}`); const r = await api.get('/net-worth'); return r.data.data; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});
export const addLiability = createAsyncThunk('netWorth/addLiability', async (data, { rejectWithValue }) => {
  try { await api.post('/net-worth/liabilities', data); const r = await api.get('/net-worth'); return r.data.data; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});
export const deleteLiability = createAsyncThunk('netWorth/deleteLiability', async (id, { rejectWithValue }) => {
  try { await api.delete(`/net-worth/liabilities/${id}`); const r = await api.get('/net-worth'); return r.data.data; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});

const netWorthSlice = createSlice({
  name: 'netWorth',
  initialState: { data: null, analysis: null, loading: false, error: null },
  reducers: {},
  extraReducers: (b) => {
    const syncState = (s, a) => { s.loading = false; s.data = a.payload.netWorth; s.analysis = a.payload.analysis; };
    b.addCase(fetchNetWorth.pending, (s) => { s.loading = true; })
     .addCase(fetchNetWorth.fulfilled, syncState)
     .addCase(fetchNetWorth.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
     .addCase(addAsset.pending, (s) => { s.loading = true; })
     .addCase(addAsset.fulfilled, syncState)
     .addCase(addAsset.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
     .addCase(deleteAsset.pending, (s) => { s.loading = true; })
     .addCase(deleteAsset.fulfilled, syncState)
     .addCase(deleteAsset.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
     .addCase(addLiability.pending, (s) => { s.loading = true; })
     .addCase(addLiability.fulfilled, syncState)
     .addCase(addLiability.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
     .addCase(deleteLiability.pending, (s) => { s.loading = true; })
     .addCase(deleteLiability.fulfilled, syncState)
     .addCase(deleteLiability.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
  }
});
export default netWorthSlice.reducer;
