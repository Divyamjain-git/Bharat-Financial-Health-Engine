// profileSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchProfile = createAsyncThunk('profile/fetch', async (_, { rejectWithValue }) => {
  try {
    const [profileRes, loansRes] = await Promise.all([
      api.get('/financial-profile'),
      api.get('/loans')
    ]);
    return {
      profile: profileRes.data.data.profile,
      loans: loansRes.data.data.loans
    };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch profile');
  }
});

export const createProfile = createAsyncThunk('profile/create', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/financial-profile', data);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create profile');
  }
});

export const updateProfile = createAsyncThunk('profile/update', async (data, { rejectWithValue }) => {
  try {
    const res = await api.put('/financial-profile', data);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update profile');
  }
});

export const addLoan = createAsyncThunk('profile/addLoan', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/loans', data);
    return res.data.data.loan;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to add loan');
  }
});

export const deleteLoan = createAsyncThunk('profile/deleteLoan', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/loans/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete loan');
  }
});

const profileSlice = createSlice({
  name: 'profile',
  initialState: { profile: null, loans: [], loading: false, error: null },
  reducers: { clearProfileError: (state) => { state.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (s) => { s.loading = true; s.error = null; })
      // ✅ On success: set profile normally
      .addCase(fetchProfile.fulfilled, (s, a) => { s.loading = false; s.profile = a.payload.profile; s.loans = a.payload.loans; })
      // ✅ KEY FIX: On failure (404 = no profile yet): reset profile to null so isUpdate = false
      .addCase(fetchProfile.rejected, (s, a) => { s.loading = false; s.profile = null; s.loans = []; s.error = null; })

      .addCase(createProfile.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(createProfile.fulfilled, (s, a) => { s.loading = false; s.profile = a.payload.profile; })
      .addCase(createProfile.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(updateProfile.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(updateProfile.fulfilled, (s, a) => { s.loading = false; s.profile = a.payload.profile; })
      .addCase(updateProfile.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(addLoan.fulfilled, (s, a) => { s.loans.push(a.payload); })
      // ✅ Fix loan delete to use id (Prisma uses numeric id, not _id)
      .addCase(deleteLoan.fulfilled, (s, a) => { s.loans = s.loans.filter(l => l.id !== a.payload && l._id !== a.payload); });
  }
});

export const { clearProfileError } = profileSlice.actions;
export default profileSlice.reducer;