// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import api from '../../services/api';

// export const fetchAlerts = createAsyncThunk('alerts/fetch', async (_, { rejectWithValue }) => {
//   try { const r = await api.get('/alerts'); return r.data.data; }
//   catch (e) { return rejectWithValue(e.response?.data?.message); }
// });
// export const generateAlerts = createAsyncThunk('alerts/generate', async (_, { rejectWithValue }) => {
//   try { await api.post('/alerts/generate'); const r = await api.get('/alerts'); return r.data.data; }
//   catch (e) { return rejectWithValue(e.response?.data?.message); }
// });
// export const dismissAlert = createAsyncThunk('alerts/dismiss', async (id, { rejectWithValue }) => {
//   try { await api.patch(`/alerts/${id}/dismiss`); return id; }
//   catch (e) { return rejectWithValue(e.response?.data?.message); }
// });
// // Fix: correct route — backend handles id="all" as mark-all in the controller
// export const markAllRead = createAsyncThunk('alerts/markAllRead', async (_, { rejectWithValue }) => {
//   try { await api.patch('/alerts/all/read'); }
//   catch (e) { return rejectWithValue(e.response?.data?.message); }
// });

// const alertsSlice = createSlice({
//   name: 'alerts',
//   initialState: { alerts: [], unreadCount: 0, loading: false },
//   reducers: {},
//   extraReducers: (b) => {
//     b.addCase(fetchAlerts.pending, (s) => { s.loading = true; })
//      .addCase(fetchAlerts.fulfilled, (s, a) => { s.loading = false; s.alerts = a.payload.alerts; s.unreadCount = a.payload.unreadCount; })
//      .addCase(fetchAlerts.rejected, (s) => { s.loading = false; })
//      .addCase(generateAlerts.fulfilled, (s, a) => { s.alerts = a.payload.alerts; s.unreadCount = a.payload.unreadCount; })
//      .addCase(dismissAlert.fulfilled, (s, a) => { s.alerts = s.alerts.filter(al => al._id !== a.payload); })
//      .addCase(markAllRead.fulfilled, (s) => { s.unreadCount = 0; s.alerts = s.alerts.map(a => ({ ...a, isRead: true })); });
//   }
// });
// export default alertsSlice.reducer;
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchAlerts = createAsyncThunk('alerts/fetch', async (_, { rejectWithValue }) => {
  try { const r = await api.get('/alerts'); return r.data.data; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});
export const generateAlerts = createAsyncThunk('alerts/generate', async (_, { rejectWithValue }) => {
  try { await api.post('/alerts/generate'); const r = await api.get('/alerts'); return r.data.data; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});
export const dismissAlert = createAsyncThunk('alerts/dismiss', async (id, { rejectWithValue }) => {
  try { await api.patch(`/alerts/${id}/dismiss`); return id; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});
// Fix: correct route — backend handles id="all" as mark-all in the controller
export const markAllRead = createAsyncThunk('alerts/markAllRead', async (_, { rejectWithValue }) => {
  try { await api.patch('/alerts/all/read'); return true; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});

const alertsSlice = createSlice({
  name: 'alerts',
  initialState: { alerts: [], unreadCount: 0, loading: false },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchAlerts.pending, (s) => { s.loading = true; })
     .addCase(fetchAlerts.fulfilled, (s, a) => { s.loading = false; s.alerts = a.payload.alerts; s.unreadCount = a.payload.unreadCount; })
     .addCase(fetchAlerts.rejected, (s) => { s.loading = false; })
     .addCase(generateAlerts.fulfilled, (s, a) => { s.alerts = a.payload.alerts; s.unreadCount = a.payload.unreadCount; })
     .addCase(dismissAlert.fulfilled, (s, a) => { s.alerts = s.alerts.filter(al => al._id !== a.payload); })
     .addCase(markAllRead.fulfilled, (s) => { s.unreadCount = 0; s.alerts = s.alerts.map(a => ({ ...a, isRead: true })); });
  }
});
export default alertsSlice.reducer;
