import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchGoals = createAsyncThunk('goals/fetch', async (_, { rejectWithValue }) => {
  try { const r = await api.get('/goals'); return r.data.data.goals; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});

export const createGoal = createAsyncThunk('goals/create', async (data, { rejectWithValue }) => {
  try { const r = await api.post('/goals', data); return r.data.data.goal; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});

export const updateGoal = createAsyncThunk('goals/update', async ({ id, data }, { rejectWithValue }) => {
  try { const r = await api.put(`/goals/${id}`, data); return r.data.data.goal; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});

export const deleteGoal = createAsyncThunk('goals/delete', async (id, { rejectWithValue }) => {
  try { await api.delete(`/goals/${id}`); return id; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});

export const fetchGoalSuggestions = createAsyncThunk('goals/suggestions', async (_, { rejectWithValue }) => {
  try { const r = await api.get('/goals/meta/suggestions'); return r.data.data.suggestions; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});

const goalsSlice = createSlice({
  name: 'goals',
  initialState: { goals: [], suggestions: [], loading: false, error: null },
  reducers: { clearError: (s) => { s.error = null; } },
  extraReducers: (b) => {
    b.addCase(fetchGoals.pending, (s) => { s.loading = true; })
     .addCase(fetchGoals.fulfilled, (s, a) => { s.loading = false; s.goals = a.payload; })
     .addCase(fetchGoals.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
     .addCase(createGoal.fulfilled, (s, a) => { s.goals.unshift(a.payload); })
     .addCase(updateGoal.fulfilled, (s, a) => { const i = s.goals.findIndex(g => g._id === a.payload._id); if (i !== -1) s.goals[i] = a.payload; })
     .addCase(deleteGoal.fulfilled, (s, a) => { s.goals = s.goals.filter(g => g._id !== a.payload); })
     .addCase(fetchGoalSuggestions.fulfilled, (s, a) => { s.suggestions = a.payload; });
  }
});
export const { clearError } = goalsSlice.actions;
export default goalsSlice.reducer;
