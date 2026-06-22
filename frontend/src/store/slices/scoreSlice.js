import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { fetchGeminiRecommendations, fetchGeminiChat } from '../../services/gemini';

export const fetchLatestScore = createAsyncThunk('score/latest', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/scores/latest');
    return res.data.data.score;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'No score available');
  }
});

export const fetchScoreHistory = createAsyncThunk('score/history', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/scores/history?limit=30');
    return res.data.data.scores;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const fetchRecommendations = createAsyncThunk('score/recommendations', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/recommendations');
    return res.data.data.recommendations;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const fetchAIRecommendations = createAsyncThunk('score/aiRecommendations', async (financialContext, { rejectWithValue }) => {
  try {
    return await fetchGeminiRecommendations(financialContext);
  } catch (err) {
    console.error('[Gemini] Failed to fetch AI recommendations:', err);
    return rejectWithValue(err.message);
  }
});

export const sendChatMessage = createAsyncThunk('score/sendChat', async ({ message, financialContext, history }, { rejectWithValue }) => {
  try {
    const reply = await fetchGeminiChat(message, financialContext, history);
    return { userMessage: message, aiReply: reply };
  } catch (err) {
    console.error('[GeminiChat] Failed:', err);
    return rejectWithValue(err.message);
  }
});

// Load persisted rec progress from localStorage
const loadRecProgress = () => {
  try { return JSON.parse(localStorage.getItem('bfhe_rec_progress') || '{}'); } catch { return {}; }
};

const scoreSlice = createSlice({
  name: 'score',
  initialState: {
    latest: null, history: [], recommendations: [],
    aiRecommendations: [], aiLoading: false, aiError: null,
    aiChat: [], chatLoading: false,
    recProgress: loadRecProgress(),
    loading: false, error: null
  },
  reducers: {
    markRecDone(state, action) {
      state.recProgress[action.payload] = 'done';
      localStorage.setItem('bfhe_rec_progress', JSON.stringify(state.recProgress));
    },
    unmarkRecDone(state, action) {
      delete state.recProgress[action.payload];
      localStorage.setItem('bfhe_rec_progress', JSON.stringify(state.recProgress));
    },
    clearChat(state) { state.aiChat = []; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLatestScore.pending, (s) => { s.loading = true; })
      .addCase(fetchLatestScore.fulfilled, (s, a) => { s.loading = false; s.latest = a.payload; })
      .addCase(fetchLatestScore.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(fetchScoreHistory.fulfilled, (s, a) => { s.history = a.payload; })
      .addCase(fetchRecommendations.fulfilled, (s, a) => { s.recommendations = a.payload; })
      .addCase(fetchAIRecommendations.pending, (s) => { s.aiLoading = true; s.aiError = null; })
      .addCase(fetchAIRecommendations.fulfilled, (s, a) => { s.aiLoading = false; s.aiRecommendations = a.payload; })
      .addCase(fetchAIRecommendations.rejected, (s, a) => { s.aiLoading = false; s.aiError = a.payload; })
      .addCase(sendChatMessage.pending, (s) => { s.chatLoading = true; })
      .addCase(sendChatMessage.fulfilled, (s, a) => {
        s.chatLoading = false;
        s.aiChat.push({ role: 'user', content: a.payload.userMessage });
        s.aiChat.push({ role: 'ai', content: a.payload.aiReply });
      })
      .addCase(sendChatMessage.rejected, (s) => {
        s.chatLoading = false;
        s.aiChat.push({ role: 'ai', content: 'Sorry, something went wrong. Please try again.' });
      });
  }
});

export const { markRecDone, unmarkRecDone, clearChat } = scoreSlice.actions;
export default scoreSlice.reducer;